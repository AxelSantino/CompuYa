import { Envio } from '@/types/envio';
import { STATUS_CLASSES, PRIORITY_CLASSES } from '@/app/dashboard/components/ShipmentTable';

export const ShipmentHeader = ({ shipment }: { shipment: Envio }) => {

    const getPriorityColors = (prioridad: string) => {
        switch (prioridad) {
            case 'alta': return 'bg-orange-200 text-orange-900';
            case 'media': return 'bg-blue-200 text-blue-900';
            case 'baja': return 'bg-green-200 text-green-900';
            default: return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <header className="flex flex-col md:flex-row gap-2 justify-between md:items-center mb-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{shipment.tracking_id}</h1>
                <p className="text-sm text-gray-500">ID Interno: #{shipment.id}</p>
            </div>
            <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full font-semibold text-xs uppercase ${STATUS_CLASSES[shipment.estado]}`}>
                    {shipment.estado}
                </span>
                <span className={`px-3 py-1 rounded-full font-semibold text-xs uppercase ${getPriorityColors(shipment.prioridad)}`}>
                    Prioridad {shipment.prioridad}
                </span>
            </div>
        </header>
    );
};