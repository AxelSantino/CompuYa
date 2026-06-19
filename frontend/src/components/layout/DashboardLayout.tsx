'use client';

import React, { useState } from 'react';
import { useDashboardLayout } from './hooks/useDashboardLayout';
import { Sidebar } from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import { BiMenu } from 'react-icons/bi';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const {
    user,
    isLoading,
    pathname,
    userName,
    filteredNavItems,
    handleLogout
  } = useDashboardLayout();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-500 animate-pulse">Cargando aplicación...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
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
      />

      <main className="flex-1 overflow-y-auto bg-gray-50 relative flex flex-col w-full">
        {/* Cabecera superior adaptativa */}
        <div className="sticky top-0 z-30 flex justify-between items-center px-4 md:px-6 py-3 bg-white border-b border-gray-200 shadow-xs">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
            aria-label="Abrir menú"
          >
            <BiMenu size={26} />
          </button>
          
          <div className="ml-auto">
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