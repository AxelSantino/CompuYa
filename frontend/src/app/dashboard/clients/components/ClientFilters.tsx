import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface ClientFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  provinceFilter: string;
  setProvinceFilter: (value: string) => void;
}

export const ClientFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  provinceFilter, 
  setProvinceFilter 
}: ClientFiltersProps) => {
    return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 text-gray-800">
      <div className="w-full md:w-1/3">
        <Input
          placeholder="Buscar por Razón social o CUIT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="w-full md:w-auto">
        <Select 
          value={provinceFilter} 
          onChange={(e) => setProvinceFilter(e.target.value)}
          className="w-full md:w-48 capitalize"
        >
          <option value="">Todos las provincias</option>
          <option value="buenos aires">Buenos Aires</option>
          <option value="caba">CABA</option>
          <option value="cordoba">Córdoba</option>
          <option value="santa fe">Santa Fe</option>
        </Select>
      </div>
    </div>
  );
};