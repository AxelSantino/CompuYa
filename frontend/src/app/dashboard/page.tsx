'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import withAuth from '@/components/auth/withAuth';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PaginationControls } from '@/components/ui/PaginationControls';

import { useShipmentList } from './hooks/useShipmentList';
import { DashboardHeader } from './components/DashboardHeader';
import { ShipmentFilters } from './components/ShipmentFilters';
import { ShipmentTable } from './components/ShipmentTable';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';


const ShipmentsPage = () => {
  
  // 1. Logica de negocio para obtener datos y funciones
  const {
    user,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,
    paginatedShipments,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
  } = useShipmentList();
  const {t} = useTranslation();

  // 2. Control de seguridad visual (mientras el Hook redirige si hace falta)
  if (!user || user.rol === 'repartidor' || user.rol === 'admin') {
    return (
      <DashboardLayout>
        <LoadingOverlay isLoading={true} text={t('shipments.verificando_permisos')} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative bg-white p-4 md:p-6 rounded-lg shadow-md">
        <LoadingOverlay isLoading={isLoading} text={t('shipments.cargando_envios')} />
        
        <DashboardHeader user={user} />

        <ShipmentFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {error && (
          <div className="py-8 text-center text-red-500 font-medium">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            <ShipmentTable shipments={paginatedShipments} />
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default withAuth(ShipmentsPage);
