import React, { ChangeEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { EnvioCrear } from '@/types/envio';

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


    const renderSearchStatus = () => {
        if (isSearchingRecipient) {
            return <span className="text-blue-500 ml-2 text-xs animate-pulse">Buscando...</span>;
        }
        if (recipientNotFound) {
            return <span className="text-red-500 ml-2 text-xs">Destinatario no encontrado</span>;
        }
        if (formData.razon_social_destinatario && formData.cuit_destinatario) {
            return <span className="text-green-500 ml-2 text-xs">Destinatario encontrado</span>;
        }
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
                Datos del Destinatario
            </h3>
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label htmlFor="razon_social_destinatario" className="block text-sm font-medium text-gray-700 mb-2">
                        Razón Social / Nombre Completo <span className="text-red-500">*</span>
                        {renderSearchStatus()}
                    </label>
                    <Input
                        id="razon_social_destinatario"
                        name="razon_social_destinatario"
                        value={formData.razon_social_destinatario}
                        onChange={handleChange}
                        onBlur={handleRazonSocialBlur} // Se llama al salir del input
                        placeholder="Ej. TechStore Argentina S.A. o Juan Pérez"
                        required
                        disabled={isLoading}
                        className="w-full"
                    />
                </div>
                <div>
                    <label htmlFor="cuit_destinatario" className="block text-sm font-medium text-gray-700 mb-2">
                        CUIT/CUIL del Destinatario <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="cuit_destinatario"
                        name="cuit_destinatario"
                        value={formData.cuit_destinatario}
                        onChange={handleChange}
                        placeholder="Ej. 30123456789 (CUIT) o 20123456789 (CUIL)"
                        required
                        disabled={isLoading || isSearchingRecipient} // Se deshabilita mientras se busca el destinatario
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};