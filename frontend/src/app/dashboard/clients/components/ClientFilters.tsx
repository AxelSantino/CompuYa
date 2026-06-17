import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface ClientFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string; 
  setStatusFilter: (value: string) => void;
}

export const ClientFilters = ({ 
  searchTerm, 
  setSearchTerm,
  statusFilter,
  setStatusFilter
}: ClientFiltersProps) => {
  const {t} = useTranslation();
    return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 text-gray-800">
      <div className="w-full md:w-1/3">
        <Input
          placeholder={t('clientsPage.placeholder_buscar_por')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="w-full md:w-auto">
        <Select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-48"
        >
          <option value="">Todos los estados</option>
          <option value="active">Solo Activos</option>
          <option value="inactive">Solo Inactivos</option>
        </Select>
      </div>
    </div>
  );
};