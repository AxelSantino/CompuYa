'use client';
import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BiBell } from 'react-icons/bi';
// Ajusta la ruta de importación de tu hook:
import { useNotificationBell } from '@/components/layout/hooks/useNotificationBell'; 

export default function NotificationBell() {
    const { t, i18n } = useTranslation();
    const {
        user,
        notificaciones,
        isOpen,
        unreadCount,
        toggleDropdown,
        closeDropdown,
        handleMarcarTodasLeidas
    } = useNotificationBell();

    const dropdownRef = useRef<HTMLDivElement>(null);

    // UX: Cierra el menú si se hace clic afuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, closeDropdown]);

    if (!user || user.rol !== 'cliente') return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={toggleDropdown} 
                // a11y: Foco de teclado y estilos consistentes
                className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
                aria-label={t('campanita.aria_abrir_notificaciones', 'Abrir notificaciones')}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                {/* a11y: Icono silenciado */}
                <BiBell aria-hidden="true" size={24} />
                
                {unreadCount > 0 && (
                    <span 
                        // a11y: El aria-label indica el contexto completo del número
                        aria-label={t('campanita.aria_no_leidas', '{{count}} notificaciones no leídas', { count: unreadCount })}
                        className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white transform bg-red-600 rounded-full px-1"
                    >
                        {/* Mejora UX: Límite visual si hay más de 99 */}
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div 
                    role="dialog"
                    aria-label={t('campanita.hist_alertas')}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    <div className="py-3 px-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700">{t('campanita.hist_alertas')}</span>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarcarTodasLeidas} 
                                // a11y: Foco por teclado ajustado
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm cursor-pointer"
                            >
                                {t('campanita.marcar_todas_leidas')}
                            </button>
                        )}
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                        {notificaciones.length === 0 ? (
                            <div 
                                // a11y: Avisa sutilmente si la lista se vacía dinámicamente
                                aria-live="polite" 
                                className="px-4 py-8 text-center text-sm text-gray-500"
                            >
                                {t('campanita.no_hay_alertas')}
                            </div>
                        ) : (
                            // a11y: Transformado en una lista real semántica
                            <ul className="m-0 p-0 list-none flex flex-col">
                                {notificaciones.map((notif, index) => (
                                    <li 
                                        // Anti-patrón resuelto: No usar Math.random. Usar el ID, o el índice como último recurso
                                        key={notif.id || `fallback-id-${index}`} 
                                        className={`px-4 py-3 border-b border-gray-100 transition-colors ${!notif.leida ? 'bg-blue-50/50' : 'bg-white'}`}
                                    >
                                        <p className="text-sm font-semibold text-gray-800">{notif.titulo}</p>
                                        <p className="text-xs text-gray-600 mt-1">{notif.mensaje}</p>
                                        <span className="text-[10px] text-gray-500 mt-2 block">
                                            {/* i18n: Fecha dinámica según el idioma del contexto */}
                                            {new Date(notif.fecha_creacion || new Date()).toLocaleDateString(i18n.language, { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}