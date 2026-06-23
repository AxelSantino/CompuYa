import { Input } from '@/components/ui/Input';
import { FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import { DetailItem } from './ShipmentInfoCard';
import { useTranslation } from 'react-i18next';
import { Envio } from '@/types/envio';

interface RecipientInfoCardProps {
    shipment: Envio;
    isEditing: boolean;
    formData: any; 
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isSaving: boolean;
}

export const RecipientInfoCard = ({ shipment, isEditing, formData, handleChange, isSaving }: RecipientInfoCardProps) => {
    const {t} = useTranslation();
    const formatAddress = () => {
        const perfil = shipment.destinatario?.perfil_empresa;
        if (!perfil) return t('shipmentInfo.dir_no_especi');

        const dir = `${perfil.direccion_normalizada || ''}, ${perfil.municipio || ''}, ${perfil.provincia || ''} (${perfil.cod_postal || ''})`;
        return dir.replace(/^, , \(\)$/, t('shipmentInfo.dir_no_especi'));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                    <FaBuilding aria-hidden="true" className="text-blue-600"/> {t('shipmentInfo.info_dest')}
                </span>
            </div>
            
            <div className="p-6">
                {isEditing ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label 
                                    htmlFor="razon_social_destinatario"
                                    className="block text-xs font-bold text-gray-700 mb-1"
                                >{t('shipmentInfo.razon_social')}</label>
                                <Input 
                                    id="razon_social_destinatario"
                                    name="razon_social_destinatario" 
                                    value={formData.razon_social_destinatario} 
                                    onChange={handleChange} 
                                    disabled={isSaving} 
                                    className="w-full text-gray-900 bg-white border-gray-300" 
                                />
                            </div>
                            <div>
                                <label 
                                    htmlFor="cuit_destinatario" 
                                    className="block text-xs font-bold text-gray-700 mb-1"
                                >
                                    CUIT / CUIL
                                </label>
                                <Input 
                                    id="cuit_destinatario"
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
                            label={t('shipmentInfo.rzn_social_name')}
                            value={shipment.razon_social_destinatario || shipment.destinatario?.perfil_empresa?.razon_social || shipment.destinatario?.email} 
                        />
                        <DetailItem 
                            label="CUIT/CUIL" 
                            value={shipment.cuit_destinatario || shipment.destinatario?.perfil_empresa?.cuit || t('shipmentInfo.na')} 
                        />
                        <div className="md:col-span-2">
                            <DetailItem 
                                icon={<FaMapMarkerAlt />} 
                                label={t('shipmentInfo.direccion')} 
                                value={formatAddress()} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};