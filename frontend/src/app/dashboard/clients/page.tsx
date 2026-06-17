'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable } from '../users/components/DataTable';
import { ClientFilters } from './components/ClientFilters';
import { ClientHeader } from './components/ClientHeader';
import { getClientColumns } from './components/ClientColumns';
import { useClientManager } from './hooks/useClientManager';
import LoadingOverlay from '@/components/LoadingOverlay';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { PaginationControls } from '@/components/ui/PaginationControls';

// Funcion principal 

export default function ClientsPage() {
  const {
    user,
    searchTerm,
    setSearchTerm,
    isLoading: isDataLoading,
    error,
    paginatedClients,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize, 
    statusFilter, 
    setStatusFilter
  } = useClientManager();

if (!user || user.rol !== 'admin') {
  return (
    <DashboardLayout>
      <AccessDenied />
    </DashboardLayout>
  );
}

return (
    <DashboardLayout>
      <div className="relative bg-white p-4 md:p-6 rounded-lg shadow-md">
        <LoadingOverlay isLoading={isDataLoading} text="Cargando lista de clientes..." />
        
        <ClientHeader />

        <ClientFilters 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {error && (
          <div className="py-8 text-center text-red-500 font-medium bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {!isDataLoading && !error && (
          <>
            <DataTable 
              data={paginatedClients} 
              columns={getClientColumns()} 
              keyExtractor={(row) => row.id}
              emptyMessage="No se encontraron clientes que coincidan con los filtros."
            />
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