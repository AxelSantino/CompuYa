import React from 'react';
import Link from 'next/link';
import { Envio, EnvioStatus, EnvioPrioridad } from '@/types/envio';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';


export const STATUS_CLASSES: Record<EnvioStatus, string> = {
    'en sucursal': 'bg-gray-100 text-gray-800 capitalize',
    'en transito': 'bg-yellow-100 text-yellow-800',
    'entregado': 'bg-green-100 text-green-800',
    'cancelado': 'bg-red-100 text-red-800',
};

export const PRIORITY_CLASSES: Record<EnvioPrioridad, string> = {
    'alta': 'bg-orange-600 text-white',
    'media': 'bg-blue-100 text-blue-800',
    'baja': 'bg-green-100 text-green-800',
};

export const StatusBadge = React.memo(({ status }: { status: EnvioStatus }) => {
    const {t} = useTranslation();
    return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${STATUS_CLASSES[status] || 'bg-gray-100 text-gray-800'}`}>
        {t(`shipmentTable.status.${status}`)}
    </span>
    );
});
StatusBadge.displayName = 'StatusBadge';

export const PriorityBadge = React.memo(({ priority }: { priority: EnvioPrioridad }) => {
    const {t} = useTranslation();
    return (
    <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full uppercase ${PRIORITY_CLASSES[priority] || 'bg-gray-100 text-gray-800'}`}>
        {t(`shipmentTable.priority.${priority}`)}
    </span>
    );
});
PriorityBadge.displayName = 'PriorityBadge';

export const ShipmentTable = ({ shipments }: { shipments: Envio[] }) => {
    const {t} = useTranslation();
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">{t('shipmentTable.trackingID')}</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">{t('shipmentTable.prioridad')}</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">{t('shipmentTable.fecha_de_creacion')}</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">{t('shipmentTable.destinatario')}</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">{t('shipmentTable.descripcion')}</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">{t('shipmentTable.tipo')}</th>
                        <th className="px-6 py-3 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">{t('shipmentTable.estado')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {shipments.map((shipment) => (
                        <tr key={shipment.tracking_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-orange-700">
                                <Link href={`/dashboard/shipments/${shipment.tracking_id}`} className="hover:underline">
                                    {shipment.tracking_id}
                                </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <PriorityBadge priority={shipment.prioridad} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                {new Date(shipment.fecha_creacion).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="font-bold">{shipment.razon_social_destinatario}</div>
                                <div className="text-xs text-gray-600 font-semibold">CUIT: {shipment.cuit_destinatario}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{shipment.descripcion}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize font-medium">{shipment.tipo_envio}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <StatusBadge status={shipment.estado} />
                            </td>
                        </tr>
                    ))}
                    {shipments.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                {t('shipmentTable.no_se_encontraron_envios')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};