import { HistorialEnvio, EnvioStatus } from '@/types/envio';
import { FaWarehouse, FaShippingFast, FaCheckCircle, FaTimesCircle, FaBox } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const statusConfig: Record<EnvioStatus, { icon: React.ReactNode; colors: string }> = {
    'en sucursal': { icon: <FaWarehouse />, colors: 'bg-blue-100 text-blue-800 border-blue-200' },
    'en transito': { icon: <FaShippingFast />, colors: 'bg-orange-100 text-orange-800 border-orange-200' },
    'entregado': { icon: <FaCheckCircle />, colors: 'bg-green-100 text-green-800 border-green-200' },
    'cancelado': { icon: <FaTimesCircle />, colors: 'bg-red-100 text-red-800 border-red-200' },
};

export const formatOperatorName = (empleado: HistorialEnvio['empleado']) => {
        const perfil = empleado?.perfil_empleado;
        if (perfil?.nombre) {
            return `${perfil.nombre} ${perfil.apellido || ''}`.trim();
        }
        return empleado?.email;
    };

export const AuditTimeline = ({ history }: { history: HistorialEnvio[] }) => {
    const {t} = useTranslation();
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h2 className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">{t('auditoria.titulo')}</h2>
            <div className="p-6">
                <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                    {history.map((item, index) => {
                        const config = statusConfig[item.estado] || { icon: <FaBox />, colors: 'bg-gray-100 text-gray-800 border-gray-200' };
                        return (
                            <div key={item.id} className="relative pl-8">
                                <span className={`absolute -left-5 top-0 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${config.colors}`}>
                                    {config.icon}
                                </span>
                                <div>
                                    <h3 className="font-bold capitalize text-gray-800">{t(`shipmentTable.status.${item.estado}`)}</h3>
                                    <p className="text-xs text-gray-500 mb-1">{new Date(item.fecha).toLocaleString()}</p>
                                    <p className="text-xs text-gray-600">{t('auditoria.operador')} {formatOperatorName(item.empleado)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};