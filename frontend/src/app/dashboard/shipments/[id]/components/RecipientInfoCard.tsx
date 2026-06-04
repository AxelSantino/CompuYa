import { Input } from '@/components/ui/Input';
import { FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import { DetailItem } from './ShipmentInfoCard';

export const RecipientInfoCard = ({ shipment, isEditing, formData, handleChange, isSaving }: any) => {
    
    const formatAddress = () => {
        const perfil = shipment.destinatario?.perfil_empresa;
        if (!perfil) return 'Dirección no especificada en el perfil';

        const dir = `${perfil.direccion_normalizada || ''}, ${perfil.municipio || ''}, ${perfil.provincia || ''} (${perfil.cod_postal || ''})`;
        return dir.replace(/^, , \(\)$/, 'Dirección no especificada en el perfil');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <FaBuilding className="text-blue-600"/> Información del Destinatario
                </span>
            </div>
            
            <div className="p-6">
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Razón Social</label>
                                <Input 
                                    name="razon_social_destinatario" 
                                    value={formData.razon_social_destinatario} 
                                    onChange={handleChange} 
                                    disabled={isSaving} 
                                    className="w-full text-gray-900 bg-white border-gray-300" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">CUIT / CUIL</label>
                                <Input 
                                    name="cuit_destinatario" 
                                    value={formData.cuit_destinatario} 
                                    onChange={handleChange} 
                                    disabled={isSaving} 
                                    className="w-full text-gray-900 bg-white border-gray-300" 
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem 
                            label="Razón Social / Nombre" 
                            value={shipment.razon_social_destinatario || shipment.destinatario?.perfil_empresa?.razon_social || shipment.destinatario?.email} 
                        />
                        <DetailItem 
                            label="CUIT/CUIL" 
                            value={shipment.cuit_destinatario || shipment.destinatario?.perfil_empresa?.cuit || 'N/A'} 
                        />
                        <div className="md:col-span-2">
                            <DetailItem 
                                icon={<FaMapMarkerAlt />} 
                                label="Dirección" 
                                value={formatAddress()} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};