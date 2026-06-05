import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EnvioStatus } from '@/types/envio';

interface ShipmentFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: EnvioStatus | '';
    setStatusFilter: (value: EnvioStatus | '') => void;
}

export const ShipmentFilters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }: ShipmentFiltersProps) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 text-gray-800">
            <div className="w-full md:w-1/3 text-gray-800">
                <Input
                    placeholder="Buscar por Tracking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
            </div>
            <div className="w-full md:w-auto">
                <Select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value as EnvioStatus | '')}
                    className="w-full md:w-40"
                >
                    <option value="">Todos los estados</option>
                    <option value="en sucursal">En Sucursal</option>
                    <option value="en transito">En Tránsito</option>
                    <option value="entregado">Entregado</option>
                    <option value="cancelado">Cancelado</option>
                </Select>
            </div>
        </div>
    );
};