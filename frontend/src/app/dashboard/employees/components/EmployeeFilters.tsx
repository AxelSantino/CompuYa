import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface EmployeeFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
}

export const EmployeeFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  roleFilter, 
  setRoleFilter 
}: EmployeeFiltersProps) => {
    return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 text-gray-800">
      <div className="w-full md:w-1/3">
        <Input
          placeholder="Buscar por nombre, apellido o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="w-full md:w-auto">
        <Select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full md:w-48 capitalize"
        >
          <option value="">Todos los roles</option>
          <option value="administrador">Administrador</option>
          <option value="supervisor">Supervisor</option>
          <option value="operador">Operador</option>
          <option value="repartidor">Repartidor</option>
        </Select>
      </div>
    </div>
  );
};