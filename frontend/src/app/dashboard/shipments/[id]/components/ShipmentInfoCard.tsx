import { Select } from '@/components/ui/Select';
import { 
    FaBox, FaEdit, FaCalendar, FaUser, FaShippingFast, 
    FaExclamationCircle, FaCheckCircle, FaFileAlt, FaClock, 
    FaKey // Fase 4: Nuevo ícono para el PIN
} from 'react-icons/fa';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { Envio } from '@/types/envio';

// Fase 4: Agregamos las nuevas props a la interfaz
interface ShipmentInfoCardProps {
    shipment: Envio;
    isEditing: boolean;
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isSaving: boolean;
    canEdit: boolean;
    onEditClick: () => void;
    validationPin?: string | null;
    userRol?: string;
}

export const DetailItem = ({ icon, label, value }: { icon?: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div>
        <h3 className="text-xs text-gray-700 flex items-center gap-2 mb-1">
            {icon && <span aria-hidden="true" className="text-gray-600">{icon}</span>}
            {label}
        </h3>
        <p className="font-medium text-gray-800">{value}</p>
    </div>
);

// Fase 4: Reemplazamos el ": any" por la interfaz correcta
export const ShipmentInfoCard = ({ 
    shipment, isEditing, formData, handleChange, isSaving, 
    canEdit, onEditClick, validationPin, userRol 
}: ShipmentInfoCardProps) => {
    
    const { t } = useTranslation();

    const capitalizeFirst = (text: string | null | undefined) => {
        if (!text) return t('shipmentInfo.no_especificado');
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const formatCreatorName = () => {
        const perfil = shipment.creador?.perfil_empleado;
        if (perfil?.nombre) {
            return capitalizeFirst(perfil.nombre) + ' ' + capitalizeFirst(perfil.apellido);
        }
        return shipment.creador?.email || t('shipmentInfo.no_especificado');
    };

    const deadlineDateFormated = shipment.fecha_limite
        ? new Date(shipment.fecha_limite).toLocaleString('es-AR', {
            dateStyle: 'short',
            timeStyle: 'short'
          })
        : <span className="text-gray-500">{t('shipmentInfo.no_disp')}</span>;

    const safeRestriccion = shipment.restriccion?.toLowerCase() || 'ninguna';
    const safePrioridad = shipment.prioridad?.toLowerCase() || 'baja';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <FaBox aria-hidden="true" className="text-blue-500"/> 
                    {t('shipmentInfo.info_envio')}
                </span>
                {canEdit && !isEditing && (
                    <button 
                        type="button" 
                        onClick={onEditClick} 
                        // a11y: Agregamos focus-visible para navegación por teclado
                        className="text-sm bg-white border border-gray-200 hover:bg-gray-100 px-3 py-1 rounded-md font-medium flex items-center gap-2 transition-colors text-gray-700 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <FaEdit aria-hidden="true" /> 
                        {t('shipmentInfo.faEdit')}
                    </button>
                )}
            </div>
            
            <div className="p-6">
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="tipo_envio" className="block text-xs font-bold text-gray-700 mb-1">{t('shipmentInfo.tipo_envio')}</label>
                                <Select id="tipo_envio" name="tipo_envio" value={formData.tipo_envio} onChange={handleChange} disabled={isSaving}>
                                    <option value="normal">{t('shipmentInfo.tipo.normal')}</option>
                                    <option value="express">{t('shipmentInfo.tipo.express')}</option>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="restriccion" className="block text-xs font-bold text-gray-700 mb-1">{t('shipmentInfo.manejo_esp')}</label>
                                <Select id="restriccion" name="restriccion" value={formData.restriccion} onChange={handleChange} disabled={isSaving}>
                                    <option value="ninguna">{t('shipmentInfo.restricciones.ninguna')}</option>
                                    <option value="fragil">{t('shipmentInfo.restricciones.fragil')}</option>
                                    <option value="valioso">{t('shipmentInfo.restricciones.valioso')}</option>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="descripcion" className="block text-xs font-bold text-gray-700 mb-1">{t('shipmentInfo.desc')}</label>
                            <textarea 
                                id="descripcion"
                                name="descripcion" 
                                value={formData.descripcion} 
                                onChange={handleChange} 
                                rows={3} 
                                disabled={isSaving} 
                                className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
                                required 
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem icon={<FaCalendar />} label={t('shipmentInfo.fecha_creacion')} value={new Date(shipment.fecha_creacion).toLocaleString()} />
                        
                        {/* Fase 4: Ocultamos "Creado por" si el usuario es cliente */}
                        {userRol !== 'cliente' && (
                            <DetailItem icon={<FaUser />} label={t('shipmentInfo.creado_por')} value={formatCreatorName()} />
                        )}
                        
                        <DetailItem icon={<FaShippingFast />} label={t('shipmentInfo.tipo_envio')} value={t(`shipmentInfo.tipo.${shipment.tipo_envio}`)} />
                        <DetailItem icon={<FaExclamationCircle />} label={t('shipmentInfo.manejo_esp')} value={t(`shipmentInfo.restricciones.${safeRestriccion}`)} />
                        <DetailItem icon={<FaCheckCircle />} label={t('shipmentInfo.prioridad_asignada')} value={t(`shipmentInfo.prioridades.${safePrioridad}`)} />
                        <DetailItem icon={<FaClock />} label={t('shipmentInfo.lim_entrega')} value={deadlineDateFormated}/>
                        
                        {/* Fase 4: Mostramos el PIN de validación SOLO si es cliente */}
                        {userRol === 'cliente' && (
                            <DetailItem 
                                icon={<FaKey />} 
                                label={t('shipmentInfo.codigo_validacion', 'Código de validación')} 
                                value={
                                    validationPin ? (
                                        <span className="font-mono text-lg font-bold text-blue-600 tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                            {validationPin}
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 italic">
                                            {t('shipmentInfo.no_disponible', 'No disponible')}
                                        </span>
                                    )
                                } 
                            />
                        )}

                        <div className="md:col-span-2">
                            <DetailItem icon={<FaFileAlt />} label={t('shipmentInfo.desc')} value={shipment.descripcion} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};