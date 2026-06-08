import { useState, useEffect, useCallback } from 'react';
import notificationService from '@/services/notificationService';
import { HistorialNotificacion, PlantillaCorreo } from '@/types/notificacion';
import toast from 'react-hot-toast';

export type TabType = 'templates' | 'history';

export const useNotifications = () => {
    const [activeTab, setActiveTab] = useState<TabType>('templates');

    const [templates, setTemplates] = useState<PlantillaCorreo[]>([]);
    const [history, setHistory] = useState<HistorialNotificacion[]>([]);

    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const [historyLoaded, setHistoryLoaded] = useState(false);

    // 1. Carga inicial de templates
    const loadTemplates = useCallback(async () => {
        setIsLoadingTemplates(true);
        try {
            const data = await notificationService.getPlantillas();
            setTemplates(data);
        } catch (error) {
            toast.error('Error al cargar las templates de correo.');
            console.error(error);
        } finally {
            setIsLoadingTemplates(false);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
    }, [loadTemplates]);

    // 2. Carga Manual del Historial
    const loadHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const data = await notificationService.getHistorial();
            setHistory(data);
            setHistoryLoaded(true);
            toast.success('Historial cargado exitosamente.');
        } catch (error) {
            toast.error('Error al descargar el historial de notificaciones.');
            console.error(error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // 3. Actualización de Plantilla
    const handleUpdateTemplate = async (plantillaActualizada: PlantillaCorreo) => {
        setIsUpdating(true);
        try {
            const data = await notificationService.updatePlantilla(plantillaActualizada.id, plantillaActualizada);
            
            setTemplates(prev => prev.map(p => p.id === data.id ? data : p));
            
            toast.success('Plantilla actualizada correctamente.');
            return true;
        } catch (error) {
            toast.error('Error al intentar guardar los cambios de la plantilla.');
            console.error(error);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        activeTab,
        setActiveTab,
        templates,
        history,
        isLoadingTemplates,
        isLoadingHistory,
        isUpdating,
        historyLoaded,
        loadHistory,
        handleUpdateTemplate
    };
};