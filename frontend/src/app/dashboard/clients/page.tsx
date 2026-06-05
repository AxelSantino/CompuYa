'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable } from '../users/components/DataTable';
import { ClientFilters } from './components/ClientFilters';
import { ClientHeader } from './components/ClientHeader';
import { getClientColumns } from './components/ClientColumns';
import { useClientManager } from './hooks/useClientManager';
import LoadingOverlay from '@/components/LoadingOverlay';
import { AccessDenied } from '@/components/ui/AccessDenied';

// Funcion principal 

export default function ClientsPage() {
  const {
    user,
    searchTerm,
    setSearchTerm,
    isLoading: isDataLoading,
    error,
    filteredClients
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
        />

        {error && (
          <div className="py-8 text-center text-red-500 font-medium bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {!isDataLoading && !error && (
          <DataTable 
            data={filteredClients} 
            columns={getClientColumns()} 
            keyExtractor={(row) => row.id}
            emptyMessage="No se encontraron clientes que coincidan con los filtros."
          />
        )}
      </div>
    </DashboardLayout>
  );
};