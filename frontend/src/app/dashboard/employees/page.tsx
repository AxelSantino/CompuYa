'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { DataTable, Column } from '../users/components/DataTable';
import { EmployeeFilters } from './components/EmployeeFilters';
import { EmployeeHeader } from './components/EmployeeHeader';
import { useEmployeeManager } from './hooks/useEmployeeManager';
import { Usuario } from '@/types/usuario';
import LoadingOverlay from '@/components/LoadingOverlay';
import { AccessDenied } from '@/components/ui/AccessDenied';

// Configuración visual de la tabla
const employeeColumns: Column<Usuario>[] = [
  { header: 'ID', accessor: 'id' },
  { 
    header: 'Nombre Completo', 
    accessor: (row) => {
      const nombre = row.perfil_empleado?.nombre || '-';
      const apellido = row.perfil_empleado?.apellido || '';
      return <span className="font-bold text-gray-900">{`${nombre} ${apellido}`.trim()}</span>;
    }
  },
  { header: 'Email', accessor: 'email' },
  { 
    header: 'Rol', 
    accessor: (row) => (
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
        {row.rol}
      </span>
    )
  },
  { 
    header: 'Fecha Alta', 
    accessor: (row) => new Date(row.fecha).toLocaleDateString() 
  },
  { 
    header: 'Acciones', 
    accessor: (row) => (
      <button 
        onClick={() => console.log('Ver detalle de', row.id)}
        className="text-orange-600 hover:text-orange-800 font-bold transition-colors"
      >
        Ver detalle
      </button>
    )
  }
];

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
    filteredEmployees
  } = useEmployeeManager();

    // 2. Control de seguridad visual (mientras el Hook redirige si hace falta)
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
        />

        {error && (
          <div className="py-8 text-center text-red-500 font-medium bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <DataTable 
            data={filteredEmployees} 
            columns={employeeColumns} 
            keyExtractor={(row) => row.id}
            emptyMessage="No se encontraron empleados que coincidan con los filtros."
          />
        )}
      </div>
    </DashboardLayout>
  );
};