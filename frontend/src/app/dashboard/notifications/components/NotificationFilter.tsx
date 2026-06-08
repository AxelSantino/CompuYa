import React from 'react';
import { Select } from '@/components/ui/Select'; // Ajustá la ruta según tu estructura

export type FilterOption = 'Todos' | 'Exitoso' | 'Fallido';

interface NotificationFilterProps {
  filterResult: FilterOption;
  onFilterChange: (value: FilterOption) => void;
  totalCount: number;
}

export const NotificationFilter = ({ filterResult, onFilterChange, totalCount }: NotificationFilterProps) => {
  return (
    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 gap-4">
      <div className="text-sm text-gray-500">
        Mostrando <span className="font-bold text-gray-700">{totalCount}</span> registros
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Filtrar por resultado:
        </label>
        
        <Select
          id="statusFilter"
          value={filterResult}
          onChange={(e) => onFilterChange(e.target.value as FilterOption)}
          className="w-full sm:w-48 bg-white"
        >
          <option value="Todos">Todos</option>
          <option value="Exitoso">Exitoso</option>
          <option value="Fallido">Fallido</option>
        </Select>
      </div>
    </div>
  );
};