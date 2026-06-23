import React from 'react';
import { Select } from '@/components/ui/Select'; // Ajustá la ruta según tu estructura
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

export type FilterOption = 'Todos' | 'Exitoso' | 'Fallido';

interface NotificationFilterProps {
  filterResult: FilterOption;
  onFilterChange: (value: FilterOption) => void;
  totalCount: number;
}

export const NotificationFilter = ({ filterResult, onFilterChange, totalCount }: NotificationFilterProps) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50/50 gap-4">
      <div 
        className="text-sm text-gray-500"
        // a11y: Anuncia al lector de pantalla cuando la cantidad de registros cambia tras filtrar
        aria-live="polite" 
        aria-atomic="true"
      >
        {t('notificationsPage.mostrando')} <span className="font-bold text-gray-700">{totalCount}</span> {t('notificationsPage.registros')}
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {t('notificationsPage.filtrar_por_resultado')}
        </label>
        
        <Select
          id="statusFilter"
          value={filterResult}
          onChange={(e) => onFilterChange(e.target.value as FilterOption)}
          className="w-full sm:w-48 bg-white"
        >
          {/* Mantenemos los 'values' intactos para no romper el tipado de TypeScript ni el filtro del componente padre */}
          <option value="Todos">{t('notificationsPage.filtro_todos', 'Todos')}</option>
          <option value="Exitoso">{t('notificationsPage.filtro_exitoso', 'Exitoso')}</option>
          <option value="Fallido">{t('notificationsPage.filtro_fallido', 'Fallido')}</option>
        </Select>
      </div>
    </div>
  );
};