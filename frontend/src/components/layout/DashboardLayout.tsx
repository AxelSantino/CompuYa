'use client';

import React from 'react';
import { useDashboardLayout } from './hooks/useDashboardLayout';
import { Sidebar } from './components/Sidebar';
import NotificationBell from './components/NotificationBell';

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-500 animate-pulse">Cargando aplicación...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
          user={user}
          userName={userName}
          pathname={pathname}
          filteredNavItems={filteredNavItems}
          handleLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto bg-gray-50 relative flex flex-col">
        <div className="sticky top-0 z-40 flex justify-end px-6 py-3 bg-gray-50 border-b border-gray-200">
          <NotificationBell />
        </div>

        <div className="min-h-full px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;