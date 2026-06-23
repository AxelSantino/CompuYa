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
    const buttonRef = useRef<HTMLButtonElement>(null);

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

    // a11y: Mueve el foco al primer elemento apenas se abre la campanita
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                const focusableElements = Array.from(
                    dropdownRef.current?.querySelectorAll<HTMLElement>('li[tabindex="-1"], button.marcar-leidas') || []
                );
                focusableElements[0]?.focus();
            }, 10);
        }
    }, [isOpen]);

    // Controlador maestro de navegación por teclado y scroll
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'Escape') {
            closeDropdown();
            buttonRef.current?.focus();
            return;
        }

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault(); // CLAVE: Evita el scroll de la página de fondo

            const focusableElements = Array.from(
                dropdownRef.current?.querySelectorAll<HTMLElement>('li[tabindex="-1"], button.marcar-leidas') || []
            );
            
            if (!focusableElements.length) return;

            const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
            let nextIndex = 0;

            if (e.key === 'ArrowDown') {
                nextIndex = currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1;
            } else if (e.key === 'ArrowUp') {
                nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
            }

            // Al enfocar el elemento, el navegador hace scroll automáticamente hacia él
            focusableElements[nextIndex]?.focus();
        }
    };

    if (!user || user.rol !== 'cliente') return null;

    return (
        <div 
            className="relative" 
            ref={dropdownRef}
            onKeyDown={handleKeyDown} // Atrapamos el teclado en todo el contenedor
        >
            <button 
                ref={buttonRef}
                onClick={toggleDropdown} 
                className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 cursor-pointer"
                aria-label={t('campanita.aria_abrir_notificaciones', 'Abrir notificaciones')}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <BiBell aria-hidden="true" size={24} />
                
                {unreadCount > 0 && (
                    <span 
                        aria-label={t('campanita.aria_no_leidas', '{{count}} notificaciones no leídas', { count: unreadCount })}
                        className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white transform bg-red-600 rounded-full px-1"
                    >
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
                                className="marcar-leidas text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                            >
                                {t('campanita.marcar_todas_leidas')}
                            </button>
                        )}
                    </div>

                    {/* overscroll-contain evita que la página baje al llegar al final de la lista con el mouse */}
                    <div className="max-h-72 overflow-y-auto overscroll-contain">
                        {notificaciones.length === 0 ? (
                            <div aria-live="polite" className="px-4 py-8 text-center text-sm text-gray-500">
                                {t('campanita.no_hay_alertas')}
                            </div>
                        ) : (
                            <ul className="m-0 p-0 list-none flex flex-col">
                                {notificaciones.map((notif, index) => (
                                    <li 
                                        key={notif.id || `fallback-id-${index}`} 
                                        // CLAVE: Permite recibir el foco programáticamente para que el navegador haga scroll solo
                                        tabIndex={-1} 
                                        className={`px-4 py-3 border-b border-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 ${!notif.leida ? 'bg-blue-50/50' : 'bg-white'}`}
                                    >
                                        <p className="text-sm font-semibold text-gray-800">{notif.titulo}</p>
                                        <p className="text-xs text-gray-600 mt-1">{notif.mensaje}</p>
                                        <span className="text-[10px] text-gray-500 mt-2 block">
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