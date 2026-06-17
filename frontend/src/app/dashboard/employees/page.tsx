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
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

// Funcion principal 

export default function EmployeesPage() {
  const {t} = useTranslation();
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
        <LoadingOverlay isLoading={isLoading} text={t('employeesPage.cargando_nomina')} />
        
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
              columns={getEmployeeColumns(t)} 
              keyExtractor={(row) => row.id}
              emptyMessage={t('employeesPage.no_se_encontraron_empleados')}
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