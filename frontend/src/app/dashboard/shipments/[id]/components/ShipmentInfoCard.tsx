import { Select } from '@/components/ui/Select';
import { FaBox, FaEdit, FaCalendar, FaUser, FaShippingFast, FaExclamationCircle, FaCheckCircle, FaFileAlt, FaClock } from 'react-icons/fa';

const capitalizeFirst = (text: string | null | undefined) => {
    if (!text) return 'No especificado';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const DetailItem = ({ icon, label, value }: { icon?: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div>
        <h3 className="text-xs text-gray-500 flex items-center gap-2 mb-1">
            {icon && <span className="text-gray-400">{icon}</span>}
            {label}
        </h3>
        <p className="font-medium text-gray-800">{value}</p>
    </div>
);

export const ShipmentInfoCard = ({ shipment, isEditing, formData, handleChange, isSaving, canEdit, onEditClick }: any) => {

    const formatCreatorName = () => {
        const perfil = shipment.creador?.perfil_empleado;
        if (perfil?.nombre) {
            return capitalizeFirst(perfil.nombre) + ' ' + capitalizeFirst(perfil.apellido);
        }
        return shipment.creador.email;
    };

    const deadlineDateFormated = shipment.fecha_limite
        ? new Date(shipment.fecha_limite).toLocaleString('es-AR', {
            dateStyle: 'short',
            timeStyle: 'short'
          })
        : <span className="text-gray-500">No disponible</span>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <span className="font-semibold text-gray-700 flex items-center gap-2"><FaBox className="text-blue-500"/> Información del Envío</span>
                {canEdit && !isEditing && (
                    <button type="button" onClick={onEditClick} className="text-sm bg-white border border-gray-200 hover:bg-gray-100 px-3 py-1 rounded-md font-medium flex items-center gap-2 transition-colors text-gray-700 shadow-sm">
                        <FaEdit /> Editar
                    </button>
                )}
            </div>
            
            <div className="p-6">
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Envío</label>
                                <Select name="tipo_envio" value={formData.tipo_envio} onChange={handleChange} disabled={isSaving}>
                                    <option value="normal">Normal</option>
                                    <option value="express">Express</option>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Manejo Especial</label>
                                <Select name="restriccion" value={formData.restriccion} onChange={handleChange} disabled={isSaving}>
                                    <option value="ninguna">Ninguna</option>
                                    <option value="fragil">Frágil</option>
                                    <option value="valioso">Valioso</option>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} disabled={isSaving} className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500" required />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem icon={<FaCalendar />} label="Fecha de Creación" value={new Date(shipment.fecha_creacion).toLocaleString()} />
                        <DetailItem icon={<FaUser />} label="Creado por" value={formatCreatorName()} />
                        <DetailItem icon={<FaShippingFast />} label="Tipo de Envío" value={capitalizeFirst(shipment.tipo_envio)} />
                        <DetailItem icon={<FaExclamationCircle />} label="Manejo Especial" value={capitalizeFirst(shipment.restriccion)} />
                        <DetailItem icon={<FaCheckCircle />} label="Prioridad Asignada" value={capitalizeFirst(shipment.prioridad)} />
                        <DetailItem icon={<FaClock />} label="Límite de Entrega" value={deadlineDateFormated}/>
                        <div className="md:col-span-2">
                            <DetailItem icon={<FaFileAlt />} label="Descripción" value={shipment.descripcion} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};