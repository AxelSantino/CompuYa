'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable } from '../users/components/DataTable';
import { EmployeeFilters } from './components/EmployeeFilters';
import { EmployeeHeader } from './components/EmployeeHeader';
import { useEmployeeManager } from './hooks/useEmployeeManager';
import LoadingOverlay from '@/components/LoadingOverlay';
import { AccessDenied } from '@/components/ui/AccessDenied';
import { getEmployeeColumns } from './components/employeeColumns';
import { PaginationControls } from '@/components/ui/PaginationControls';

// Funcion principal 

export default function EmployeesPage() {
  const {
    user,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    isLoading,
    error,
    paginatedEmployees,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    statusFilter,
    setStatusFilter
  } = useEmployeeManager();

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
        <LoadingOverlay isLoading={isLoading} text="Cargando nómina de empleados..." />
        
        <EmployeeHeader />

        <EmployeeFilters 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          roleFilter={roleFilter} 
          setRoleFilter={setRoleFilter} 
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {error && (
          <div className="py-8 text-center text-red-500 font-medium bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <>
            <DataTable 
              data={paginatedEmployees} 
              columns={getEmployeeColumns()} 
              keyExtractor={(row) => row.id}
              emptyMessage="No se encontraron empleados que coincidan con los filtros."
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