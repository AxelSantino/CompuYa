'use client';

import React from 'react';
import { useDashboardLayout } from './hooks/useDashboardLayout';
import { Sidebar } from './components/Sidebar';

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

      <main className="flex-1 overflow-y-auto bg-gray-50 relative">
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
