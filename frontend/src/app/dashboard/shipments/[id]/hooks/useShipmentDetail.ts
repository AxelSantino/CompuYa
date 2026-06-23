import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import shipmentService from '@/services/shipmentService';
import { Envio, HistorialEnvio } from '@/types/envio';
import toast from 'react-hot-toast';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';

export const useShipmentDetail = () => {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const {t} = useTranslation();

    // Multilenguaje
    const { t } = useTranslation();
    const { translateError } = useErrorTranslator();

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
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
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
        } catch (err: unknown) {
            setError(translateError(err, 'shipmentDetail.error_cargar_info'));
        } finally {
            setIsLoading(false);
        }
    }, [id, user, translateError]);

    // Efecto inicial
    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            if (isMounted) await fetchData();
        };
        load();
        return () => { isMounted = false; };
    }, [fetchData]);

    // Abrir modal tras llamado de cancelacion
    const handleCancel = () => {
        setIsCancelModalOpen(true);
    };

    // Cerrar el modal
    const closeCancelModal = () => {
        setIsCancelModalOpen(false);
    };

    // Ejecuta la cancelacion con el motivo
    const confirmCancellation = async (motivo: string) => {
        if (!shipment) return;
        
        setIsProcessing(true);
        try {
            await shipmentService.cancelShipment(shipment.tracking_id, motivo);
            await fetchData();
            setIsCancelModalOpen(false);
            toast.success(t('shipmentInfo.cancelacion_exitosa', 'El envío ha sido cancelado exitosamente'));
        } catch (err: unknown) {
            toast.error(translateError(err, 'shipmentInfo.error_cancelar_envio'));
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
            toast.success(t('shipmentInfo.actualizacion_exitosa', 'Envío actualizado correctamente'));
        } catch (err: unknown) {
            setError(translateError(err, 'shipmentInfo.error_actualizar_envio'));
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
        handleSubmit,
        isCancelModalOpen,
        closeCancelModal,
        confirmCancellation
    };
};