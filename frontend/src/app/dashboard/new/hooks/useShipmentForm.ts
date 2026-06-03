import { useState, ChangeEvent, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import shipmentService from '@/services/shipmentService';
import { EnvioCrear } from '@/types/envio';

export const useShipmentForm = () => {
    const router = useRouter();

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
            await shipmentService.createShipment(formData);
            router.push('/dashboard');
        } catch (err: unknown) {
            const errorResponse = err as { response?: { data?: { detail?: string | any[] } } };
            let errorMessage = 'Error al crear el envío. Por favor, revisa los datos e intenta de nuevo.';
            
            const detail = errorResponse.response?.data?.detail;
            if (detail) {
                if (typeof detail === 'string') {
                    errorMessage = detail;
                } else if (Array.isArray(detail)) {
                    errorMessage = detail[0]?.msg || errorMessage;
                }
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        isLoading,
        error,
        handleChange,
        handleSubmit,
    };

};