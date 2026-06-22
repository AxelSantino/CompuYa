import React, { ChangeEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { EnvioCrear } from '@/types/envio';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

// El contrato de lo que recibe este componente
export interface ShipmentSectionProps {
    formData: EnvioCrear;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleRazonSocialBlur?: (e: ChangeEvent<HTMLInputElement>) => void; // Opcional, solo si se implementa la búsqueda automática
    isLoading: boolean;
    isSearchingRecipient?: boolean; // Para mostrar un indicador de búsqueda si se implementa la lógica
    recipientNotFound?: boolean; // Para indicar si no se encontró el destinatario
}

export const RecipientSection = ({ 
    formData, 
    handleChange,
    handleRazonSocialBlur, 
    isLoading,
    isSearchingRecipient,
    recipientNotFound
 }: ShipmentSectionProps) => {

    const {t} = useTranslation();

    const renderSearchStatus = () => {
        if (isSearchingRecipient) {
            return <span className="text-blue-600 ml-2 text-xs animate-pulse">{t('newShipmentPage.buscando')}</span>;
        }
        if (recipientNotFound) {
            return <span className="text-red-500 ml-2 text-xs">{t('newShipmentPage.dest_no_encontrado')}</span>;
        }
        if (formData.razon_social_destinatario && formData.cuit_destinatario) {
            return <span className="text-green-500 ml-2 text-xs">{t('newShipmentPage.dest_encontrado')}</span>;
        }
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span aria-hidden="true" className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
                {t('newShipmentPage.datos_destinatario')}
            </h3>

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label htmlFor="razon_social_destinatario" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <span>
                            {t('newShipmentPage.razon_nombre_comp')} 
                            <span aria-hidden="true" className="text-red-500 ml-1">*</span>
                        </span>
                        
                        <div aria-live="polite" aria-atomic="true">
                            {renderSearchStatus()}
                        </div>
                    </label>
                    <Input
                        id="razon_social_destinatario"
                        name="razon_social_destinatario"
                        value={formData.razon_social_destinatario}
                        onChange={handleChange}
                        onBlur={handleRazonSocialBlur} // Se llama al salir del input
                        placeholder={t('newShipmentPage.placeholder_razon_social')}
                        required
                        disabled={isLoading}
                        className="w-full"
                    />
                </div>
                <div>
                    <label htmlFor="cuit_destinatario" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('newShipmentPage.cuit_destinatario')} 
                        <span aria-hidden="true" className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                        id="cuit_destinatario"
                        name="cuit_destinatario"
                        value={formData.cuit_destinatario}
                        onChange={handleChange}
                        placeholder={t('newShipmentPage.placeholder_cuit')}
                        required
                        disabled={isLoading || isSearchingRecipient} // Se deshabilita mientras se busca el destinatario
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};