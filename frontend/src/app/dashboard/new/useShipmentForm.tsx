import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import shipmentService from '@/services/shipmentService';
import { EnvioFormData } from '@/types/envio';

export const useShipmentForm = () => {
    const router = useRouter();

    // Crear el estado del formulario con los campos necesarios
    const [formData, setFormData] = useState<EnvioFormData>({
        razon_social_destinatario: '',
        cuit_destinatario: '',
        consent: false,
        descripcion: '',
        tipo_envio: 'normal',
        restriccion: 'ninguna',
    });

    // Estado para manejar la carga y los errores
    const [isLoading, setIsLoading] = useState(false);

    // Estado para manejar errores específicos del formulario
    const [error, setError] = useState<string | null>(null);

    // Función para manejar cambios en los campos del formulario
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        // Extraer el nombre, valor y tipo del campo que se está editando
        const { name, value, type } = e.target;
        // Casteo necesario para que TypeScript sepa que e.target podría ser un checkbox
        const checked = (e.target as HTMLInputElement).checked;
        
        // Actualizar el estado del formulario, manejando correctamente los checkboxes
        setFormData((prev) => ({
            // Mantener el estado anterior
            ...prev,
            // Actualizar solo el campo que ha cambiado, manejando el caso de los checkboxes
            [name]: type === 'checkbox' ? checked : value,
        }));
    };


    // Función para manejar el envío del formulario 
    // (¿que significa async (e: formevent)? Es para manejar el evento de submit del formulario, 
    // y es async porque vamos a hacer una llamada a la API)
    const handleSubmit = async (e: FormEvent) => {

        // Prevenir el comportamiento por defecto del formulario (recargar la página)
        e.preventDefault();
        setError(null);
        setIsLoading(true);


        // Intentar enviar los datos del formulario a la API
        try {

            // Extraer el consentimiento del resto de los datos del formulario
            const { consent, ...shipmentData } = formData;

            // Validar el consentimiento
            if (!consent) {
                setError("Debes aceptar el consentimiento para el tratamiento de datos.");
                setIsLoading(false);
                return;
            }

            // Hacer la llamada a la API para crear el envío
            await shipmentService.createShipment(shipmentData);
            // Redirigir al usuario a la página del dashboard después de crear el envío
            router.push('/dashboard');
        } catch (err: unknown) {

            // Manejar errores específicos de la API, extrayendo el mensaje de error si está disponible
            const errorResponse = err as { response?: { data? : { detail?: string }}};

            // Si el error tiene un mensaje específico, usarlo; de lo contrario, usar un mensaje genérico
            const errorMessage = errorResponse.response?.data?.detail || 'Error al crear el envío. Por favor, revisa los datos e intenta de nuevo.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
 
    };

    // Al final del hook, retornamos lo que la vista necesita para funcionar.
    return {
        formData,
        isLoading,
        error,
        handleChange,
        handleSubmit,
    };
};