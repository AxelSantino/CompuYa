import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EnvioStatus } from '@/types/envio';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface ShipmentFiltersProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    statusFilter: EnvioStatus | '';
    setStatusFilter: (value: EnvioStatus | '') => void;
}

export const ShipmentFilters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }: ShipmentFiltersProps) => {
    const {t} = useTranslation();
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 text-gray-800">
            <div className="w-full md:w-1/3 text-gray-800">
                <Input
                    aria-label={t('shipmentFilters.buscar_por_trackingID')}
                    placeholder={t('shipmentFilters.buscar_por_trackingID')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
            </div>
            <div className="w-full md:w-auto">
                <Select 
                    aria-label={t('shipmentFilters.filtrar_por_estado')}
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value as EnvioStatus | '')}
                    className="w-full md:w-40"
                >
                    <option value="">{t('shipmentFilters.todos_los_estados')}</option>
                    <option value="en sucursal">{t('shipmentFilters.en_sucursal')}</option>
                    <option value="en transito">{t('shipmentFilters.en_transito')}</option>
                    <option value="entregado">{t('shipmentFilters.entregado')}</option>
                    <option value="cancelado">{t('shipmentFilters.cancelado')}</option>
                </Select>
            </div>
        </div>
    );
};