import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import shipmentService from '@/services/shipmentService';
import { Envio, HistorialEnvio } from '@/types/envio';

export const useShipmentDetail = () => {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();

    // Normalizar ID
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    // Estados de datos
    const [shipment, setShipment] = useState<Envio | null>(null);
    const [history, setHistory] = useState<HistorialEnvio[]>([]);

    // Estados de carga/procesamiento
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados de edicion
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({ 
        descripcion: '', 
        tipo_envio: '', 
        restriccion: '', 
        razon_social_destinatario: '', 
        cuit_destinatario: '' });

    // ¿Puede editar datos del envio?
    const canEdit = (user?.rol === 'operador' || user?.rol === 'supervisor') && shipment?.estado === 'en sucursal';

    // Función para cargar datos del envío
    const fetchData = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const promises: [Promise<Envio>, Promise<HistorialEnvio[]> | null] = [
                shipmentService.getShipmentById(id as string),
                user?.rol === 'supervisor' ? shipmentService.getShipmentHistory(id as string) : null
            ];

            const [shipmentData, historyData] = await Promise.all(promises);
            
            setShipment(shipmentData);
            if (historyData) {
                setHistory(historyData);
            }
        } catch {
            setError('No se pudo cargar la información del envío.');
        } finally {
            setIsLoading(false);
        }
    }, [id, user]);

    // Efecto inicial
    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (isMounted) await fetchData();
        };
        load();
        return () => { isMounted = false; };
    }, [fetchData]);

    // Acciones
    const handleCancel = async () => {
        if (!id || !window.confirm('¿Estás seguro de que deseas cancelar este envío?')) return;
        
        setIsProcessing(true);
        try {
            await shipmentService.cancelShipment(id as string);
            await fetchData(); // Refrescar los datos tras cancelar
            alert('Envío cancelado con éxito.');
        } catch (err: unknown) {
            // Reemplazamos el "any" por un casteo seguro
            const errorData = err as { response?: { data?: { detail?: string } } };
            alert(errorData.response?.data?.detail || 'Error al cancelar el envío.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEditClick = () => {
        if (shipment) {
            setFormData({
                descripcion: shipment.descripcion || '',
                tipo_envio: shipment.tipo_envio || '',
                restriccion: shipment.restriccion || '',
                razon_social_destinatario: shipment.razon_social_destinatario || shipment.destinatario?.perfil_empresa?.razon_social || shipment.destinatario?.email || '',
                cuit_destinatario: shipment.cuit_destinatario || shipment.destinatario?.perfil_empresa?.cuit || ''
            });
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => { 
        setIsEditing(false); 
        setError(null); 
    };

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!shipment) return;
        
        setIsSaving(true); 
        setError(null);
        
        try {
            await shipmentService.updateShipment(shipment.tracking_id, formData);
            await fetchData();
            setIsEditing(false);
        } catch (err: unknown) {
            // Reemplazamos el "any" aquí también
            const errorResponse = err as { response?: { data?: { detail?: string } } };
            setError(errorResponse.response?.data?.detail || 'Error al actualizar el envío.');
        } finally { 
            setIsSaving(false); 
        }
    };

    return {
        user,
        router,
        shipment,
        history,
        isLoading,
        isProcessing,
        error,
        isEditing,
        isSaving,
        formData,
        canEdit,
        handleCancel,
        handleEditClick,
        handleCancelEdit,
        handleChange,
        handleSubmit
    };
};