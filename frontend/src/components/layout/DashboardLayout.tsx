'use client';

import React from 'react';
import { useDashboardLayout } from './hooks/useDashboardLayout';
import { Sidebar } from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/i18n/LanguageSwitcher';
type DashboardLayoutProps = {
  children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const {t}=useTranslation();
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
        <div className="text-gray-500 animate-pulse">{t('dashboard_layout.cargando_aplicacion')}</div>
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
        <div className="sticky top-0 z-40 flex justify-between items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex-1"></div> 
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <NotificationBell />
          </div>
        </div>

        <div className="min-h-full px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;