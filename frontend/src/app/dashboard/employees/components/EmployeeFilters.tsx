import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface EmployeeFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  statusFilter: string; 
  setStatusFilter: (value: string) => void;
}

export const EmployeeFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  roleFilter, 
  setRoleFilter,
  statusFilter,
  setStatusFilter
}: EmployeeFiltersProps) => {
  const {t} = useTranslation();
    return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 text-gray-800">
      <div className="w-full md:w-1/3">
        <Input
          placeholder={t('employeesPage.placeholder_buscar_por')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
        <Select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full md:w-48 capitalize"
        >
          <option value="">{t('employeesPage.todos_los_roles')}</option>
          <option value="admin">{t('employeesPage.roles.admin')}</option>
          <option value="supervisor">{t('employeesPage.roles.supervisor')}</option>
          <option value="operador">{t('employeesPage.roles.operador')}</option>
          <option value="repartidor">{t('employeesPage.roles.repartidor')}</option>
        </Select>

        <Select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-48"
        >
          <option value="">{t('employeesPage.todos_los_estados')}</option>
          <option value="active">{t('employeesPage.solo_activos')}</option>
          <option value="inactive">{t('employeesPage.solo_inactivos')}</option>
        </Select>
      </div>
    </div>
  );
};