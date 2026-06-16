import { useState, useEffect, useCallback } from 'react';
import { Usuario } from '@/types/usuario';
import userService from '@/services/userService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const useClientProfile = (id: string) => {
    const router = useRouter();
    const [client, setClient] = useState<Usuario | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);
    
    const [formData, setFormData] = useState({
        razon_social: '',
        cod_postal: '',
        direccion_normalizada: '',
        latitud: 0,
        longitud: 0
    });

    const fetchClient = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await userService.getUserById(Number(id));
            
            if (data.tipo !== 'empresa') {
                setError('El usuario solicitado no corresponde a un cliente.');
                return;
            }

            setClient(data);
            setFormData({
                razon_social: data.perfil_empresa?.razon_social || '',
                cod_postal: data.perfil_empresa?.cod_postal || '',
                direccion_normalizada: data.perfil_empresa?.direccion_normalizada || '',
                latitud: data.perfil_empresa?.latitud || 0,
                longitud: data.perfil_empresa?.longitud || 0
            });
            setError(null);
        } catch (err) {
            setError('No se pudo cargar la información del cliente.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchClient();
    }, [id, fetchClient]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancelEdit = () => {
        if (client) {
            setFormData({
                razon_social: client.perfil_empresa?.razon_social || '',
                cod_postal: client.perfil_empresa?.cod_postal || '',
                direccion_normalizada: client.perfil_empresa?.direccion_normalizada || '',
                latitud: client.perfil_empresa?.latitud || 0,
                longitud: client.perfil_empresa?.longitud || 0
            });
        }
        setIsEditing(false);
    };

    // Funcion adaptada para el patron de diseño Adapter (ya que puede cambiar el servicio normalizador)
    const handleAddressUpdated = (direccion: string, lat: number, lng: number, cp: string) => {
        setFormData(prev => ({
            ...prev,
            direccion_normalizada: direccion,
            latitud: lat,
            longitud: lng,
            cod_postal: cp || prev.cod_postal
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!client) return;
        setIsSaving(true);
        
        try {
            const payload = {
                razon_social: formData.razon_social,
                cod_postal: formData.cod_postal,
                direccion_normalizada: formData.direccion_normalizada,
                latitud: formData.latitud,
                longitud: formData.longitud
            };

            await userService.updateUser(client.id, payload);
            
            toast.success('Información de la empresa actualizada.');
            setIsEditing(false);
            await fetchClient();
        } catch (error) {
            toast.error('Error al guardar los cambios del cliente.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

        /*
    * FUNCION DE DESACTIVAR/ACTIVAR USUARIO
    */
    const handleRequestStatusChange = (isActive: boolean) => {
        setPendingStatus(isActive); 
        setIsStatusModalOpen(true);
    };

    const handleCloseStatusModal = () => {
        setIsStatusModalOpen(false);
        setPendingStatus(null);
    };

    const handleConfirmStatusChange = async () => {
        if (!client || pendingStatus === null) {
            return;
        }

        if (isChangingStatus) {
            return;
        }

        try {
            await userService.changeUserStatus(client.id, pendingStatus);
            toast.success(`Empleado ${pendingStatus ? 'activado' : 'desactivado'} correctamente.`)

            await fetchClient();
            handleCloseStatusModal();
        } catch {
            toast.error('Error al cambiar el estado del empleado.');
            console.error('Error al cambiar estado:', error);
        } finally {
            setIsChangingStatus(false);
        }
    };

    return {
        router,
        client,
        isLoading,
        error,
        isEditing,
        setIsEditing,
        isSaving,
        formData,
        handleChange,
        handleCancelEdit,
        handleSave,
        handleAddressUpdated,
        isChangingStatus,
        isStatusModalOpen,
        pendingStatus,
        handleRequestStatusChange,
        handleCloseStatusModal,
        handleConfirmStatusChange
    };
};