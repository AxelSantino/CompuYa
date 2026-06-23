import { Envio, EnvioStatus, EnvioPrioridad } from '@/types/envio';
import { STATUS_CLASSES, PRIORITY_CLASSES } from '@/app/dashboard/components/ShipmentTable';
import { useTranslation } from 'react-i18next';


export const ShipmentHeader = ({ shipment }: { shipment: Envio }) => {
    const {t} = useTranslation();
    const safeEstado = shipment.estado.toLowerCase() as EnvioStatus;
    const safePrioridad = shipment.prioridad.toLowerCase() as EnvioPrioridad;

    return (
        <header className="flex flex-col md:flex-row gap-2 justify-between md:items-center mb-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{shipment.tracking_id}</h1>
                <p className="text-sm text-gray-600">{t('shipmentInfo.id_interno')} #{shipment.id}</p>
            </div>
            <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full font-semibold text-xs capitalize ${STATUS_CLASSES[safeEstado] || 'bg-gray-100 text-gray-800'}`}>
                    {t(`shipmentTable.status.${safeEstado}`).toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase ${PRIORITY_CLASSES[safePrioridad] || 'bg-gray-100 text-gray-800'}`}>
                    {t(`shipmentTable.priority.${safePrioridad}`).toUpperCase()}
                </span>
            </div>
        </header>
    );
};