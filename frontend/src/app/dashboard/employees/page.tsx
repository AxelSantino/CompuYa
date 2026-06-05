'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '../users/components/DataTable';
import { EmployeeFilters } from './components/EmployeeFilters';
import { useEmployeeManager } from './hooks/useEmployeeManager';
import { Usuario } from '@/types/usuario';

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

export default function EmployeesPage() {
  const {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    isLoading,
    error,
    filteredEmployees
  } = useEmployeeManager();

return (
    <DashboardLayout>
      <div className="relative bg-white p-4 md:p-6 rounded-lg shadow-md m-4 md:m-6">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1 text-orange-700">Gestión de Empleados</h2>
            <p className="text-gray-600 text-sm">
              Administración de personal, asignación de roles y control de accesos.
            </p>
          </div>
          <Button variant="primary" className="w-full md:w-auto">
            + Nuevo Empleado
          </Button>
        </div>

        {/* Filtros */}
        <EmployeeFilters 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          roleFilter={roleFilter} 
          setRoleFilter={setRoleFilter} 
        />

        {/* Manejo de Estados y Tabla */}
        {error && (
          <div className="py-8 text-center text-red-500 font-medium bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-12 text-center text-gray-500 animate-pulse font-medium">
            Cargando nómina de empleados...
          </div>
        ) : !error && (
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