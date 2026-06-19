'use client';

import React, { useState } from 'react';
import { useDashboardLayout } from './hooks/useDashboardLayout';
import { Sidebar } from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import { Toaster } from 'react-hot-toast';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/i18n/LanguageSwitcher';
import { BiMenu } from 'react-icons/bi';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const {
    user,
    isLoading,
    pathname,
    userName,
    filteredNavItems,
    handleLogout,
    isSidebarCollapsed,
    toggleSidebar
  } = useDashboardLayout();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-500 animate-pulse">{t('dashboard_layout.cargando_aplicacion')}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      <Toaster 
        position="top-right" 
        containerStyle={{
          top: 80,
          right: 20,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b', 
            color: '#f8fafc',      
            borderRadius: '6px',   
            padding: '12px 24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', 
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '0.3px'
          },
          success: {
            iconTheme: {
              primary: '#22c55e', 
              secondary: '#1e293b', 
            },
          },
        }} 
      />

      {/* Backdrop de fondo oscuro en móvil cuando el menú está abierto */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        user={user}
        userName={userName}
        pathname={pathname}
        filteredNavItems={filteredNavItems}
        handleLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50 relative flex flex-col w-full">
        {/* Cabecera superior adaptativa */}
        <div className="sticky top-0 z-30 flex justify-between items-center px-4 md:px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
          
          {/* Lado Izquierdo: Botón Hamburguesa */}
          <div className="flex items-center flex-1">
            {/* Botón Desktop (se oculta en móvil) */}
            <button 
              onClick={toggleSidebar}
              className="hidden md:block p-2 -ml-2 rounded-md text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors focus:outline-none cursor-pointer"
              title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              <BiMenu size={24} />
            </button>
            {/* Botón Móvil (se oculta en desktop) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-md text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors focus:outline-none cursor-pointer"
              aria-label="Abrir menú"
            >
              <BiMenu size={26} />
            </button>
          </div> 
          
          {/* Lado Derecho: Idioma y Notificaciones */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <NotificationBell />
          </div>
        </div>

        <div className="min-h-full px-4 md:px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;