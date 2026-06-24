import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import alertasService from '@/services/alertasService';
import toast from 'react-hot-toast';
import { useNotificationTranslator } from './useNotificationTranslator';

// Tipado recomendado para no usar "any"
export interface Alerta {
    id: number;
    titulo: string;
    mensaje: string;
    fecha_creacion: string;
    leida: boolean;
}

export const useNotificationBell = () => {
    const { user } = useAuth();
    const [notificaciones, setNotificaciones] = useState<Alerta[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const { translateNotification } = useNotificationTranslator();

    const cargarNotificaciones = useCallback(async () => {
        try {
            const data = await alertasService.obtenerMisNotificaciones();
            setNotificaciones(data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    // 1. Cargar inicial
    useEffect(() => {
        if (user && user.rol === 'cliente') {
            cargarNotificaciones();
        }
    }, [user, cargarNotificaciones]);

    // 2. Conexión WebSocket
    useEffect(() => {
        if (!user || user.rol !== 'cliente' || !user.id) return;

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const apiHost = process.env.NEXT_PUBLIC_API_URL 
            ? process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, '') 
            : 'localhost:8000';
            
        const wsUrl = `${wsProtocol}//${apiHost}/alertas/ws/${user.id}`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => console.log('WebSocket de Alertas Conectado');

        socket.onmessage = (event) => {
            const nuevaAlerta = JSON.parse(event.data);

            //Traduccion
            const alertaTraducida = translateNotification(nuevaAlerta);
            toast.success(alertaTraducida.titulo, { icon: '🔔', duration: 4000 });
            setNotificaciones((prev) => [{ ...nuevaAlerta, leida: false }, ...prev]);
        };

        socket.onclose = () => console.log('WebSocket Desconectado');

        return () => {
            if (socket.readyState === WebSocket.OPEN) socket.close();
        };
    }, [user, translateNotification]);

    const notificacionesTraducidas = useMemo(() => {
        return notificaciones.map(translateNotification);
    }, [notificaciones, translateNotification]);

    const unreadCount = notificaciones.filter(n => !n.leida).length;
    const toggleDropdown = () => setIsOpen(!isOpen);
    const closeDropdown = () => setIsOpen(false);

    const handleMarcarTodasLeidas = async () => {
        try {
            await alertasService.marcarComoLeidas();
            await cargarNotificaciones(); 
        } catch (error) {
            console.error(error);
        }
    };

    return {
        user,
        notificaciones: notificacionesTraducidas,
        isOpen,
        unreadCount,
        toggleDropdown,
        closeDropdown,
        handleMarcarTodasLeidas
    };
};