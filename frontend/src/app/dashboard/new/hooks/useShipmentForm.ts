import { useState, ChangeEvent, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import shipmentService from '@/services/shipmentService';
import { EnvioCrear } from '@/types/envio';

import '@/i18n/i18n';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';

export const useShipmentForm = () => {
    const router = useRouter();

    const { translateError } = useErrorTranslator();

    // Tipos del formulario declarados en types/envio.ts
    const [formData, setFormData] = useState<EnvioCrear>({
        razon_social_destinatario: '',
        cuit_destinatario: '',
        descripcion: '',
        tipo_envio: 'normal',
        restriccion: 'ninguna',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isSearchingRecipient, setIsSearchingRecipient] = useState(false);
    const [recipientNotFound, setRecipientNotFound] = useState(false);

    const [createdTrackingId, setCreatedTrackingId] = useState<string | null>(null);

    // Controlador de cambios (Memorizado con useCallback para mejor performance)
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    // Logica de envio a la API
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Se manda el DTO directamente, ya que ahora formData tiene el tipo EnvioCrear
            const newShipment = await shipmentService.createShipment(formData);
            setCreatedTrackingId(newShipment.tracking_id);
        } catch (err: unknown) {
            setError(translateError(err, 'newShipmentPage.error_crear_envio'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRazonSocialBlur = async () => {
        const razonSocial = formData.razon_social_destinatario.trim();
        
        // Si el usuario se fue del input pero lo dejó vacío, no hacemos nada
        if (!razonSocial) return;

        setIsSearchingRecipient(true);
        setRecipientNotFound(false);

        try {
            // Obtener el destinatario por razón social desde el servicio
            const destinatario = await shipmentService.getRecipientByRazonSocial(razonSocial);

            const cuitEncontrado = destinatario?.perfil_empresa?.cuit;

        // Verificamos que el objeto exista y tenga la propiedad
            if (cuitEncontrado) { 
                setFormData(prev => ({
                    ...prev,
                    cuit_destinatario: cuitEncontrado
                }));
            }
        } catch (error) {
            setRecipientNotFound(true);
        } finally {
            setIsSearchingRecipient(false);
        }
    };

    return {
        formData,
        isLoading,
        error,
        handleChange,
        handleSubmit,
        handleRazonSocialBlur,
        isSearchingRecipient,
        recipientNotFound,
        createdTrackingId
    };

};