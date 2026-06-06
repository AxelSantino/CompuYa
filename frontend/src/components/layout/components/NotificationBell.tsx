'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import alertasService from '@/services/alertasService';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
    const { user } = useAuth();
    const router = useRouter(); 
    const [notificaciones, setNotificaciones] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

useEffect(() => {
    if (user && user.rol === 'cliente') {
    cargarNotificaciones();
    }
}, [user]);

async function cargarNotificaciones() {
    try {
    const data = await alertasService.obtenerMisNotificaciones();
    setNotificaciones(data);
    } catch (error) {
    console.error(error);
    }
}

if (!user || user.rol !== 'cliente') {
    return null; 
}

const unreadCount = notificaciones.filter(n => !n.leida).length;

function toggleDropdown() {
    setIsOpen(!isOpen);
}

async function handleMarcarTodasLeidas() {
    try {
    await alertasService.marcarComoLeidas();
    await cargarNotificaciones(); 
    } catch (error) {
    console.error(error);
    }
}


return (
    <div className="relative">
        <button 
        onClick={toggleDropdown} 
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors focus:outline-none"
        >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        
        {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount}
            </span>
        )}
    </button>

    {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200">
        <div className="py-3 px-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-700">Historial de Alertas</span>
            {unreadCount > 0 && (
            <button 
                onClick={async () => {await alertasService.marcarComoLeidas();await cargarNotificaciones(); }}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold focus:outline-none"
            >
                Marcar todas como leídas
            </button>
            )}
        </div>

        <div className="max-h-72 overflow-y-auto">
            {notificaciones.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
                No hay alertas para mostrar.
            </div>
            ) : (
            notificaciones.map((notif) => (
                <div 
                            key={notif.id} 
                            className={`px-4 py-3 border-b border-gray-100 transition-colors ${!notif.leida ? 'bg-blue-50/50' : 'bg-white'}`}
>
                    <p className="text-sm font-semibold text-gray-800">{notif.titulo}</p>
                    <p className="text-xs text-gray-600 mt-1">{notif.mensaje}</p>
                    <span className="text-[10px] text-gray-400 mt-2 block">
                    {new Date(notif.fecha_creacion).toLocaleDateString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            ))
            )}
        </div>
        </div>
    )}
    </div>
);
}