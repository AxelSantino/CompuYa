import { useState, useEffect, useCallback } from 'react';
import { Usuario } from '@/types/usuario';
import userService from '@/services/userService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
// 1. Importamos las herramientas de i18n y manejo de errores
import { useTranslation } from 'react-i18next';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';

export const useEmployeeProfile = (id: string) => {
    const router = useRouter();
    
    // 2. Instanciamos los hooks
    const { t } = useTranslation();
    const { translateError } = useErrorTranslator();

    const [employee, setEmployee] = useState<Usuario | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);
    
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        rol: ''
    });

    const fetchEmployee = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await userService.getUserById(Number(id));
            setEmployee(data);
            setFormData({
                nombre: data.perfil_empleado?.nombre || '',
                apellido: data.perfil_empleado?.apellido || '',
                rol: data.rol || '',
            });
            setError(null);
        } catch (err) {
            // Arquitectura: Delegamos al traductor de errores
            setError(translateError(err, 'employeeDetail.error_cargar_info'));
        } finally {
            setIsLoading(false);
        }
    // Añadimos t y translateError a las dependencias
    }, [id, t, translateError]);

    useEffect(() => {
        if (id) fetchEmployee();
    }, [id, fetchEmployee]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancelEdit = () => {
        if (employee) {
            setFormData({
                nombre: employee.perfil_empleado?.nombre || '',
                apellido: employee.perfil_empleado?.apellido || '',
                rol: employee.rol || '',
            });
        }
        setIsEditing(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employee) return;
        setIsSaving(true);
        
        try {
            const payload = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                rol: formData.rol,
            };

            await userService.updateUser(employee.id, payload);
            
            // i18n: Pasado por el traductor
            toast.success(t('employeeDetail.success_actualizado', 'Perfil actualizado correctamente.'));
            setIsEditing(false);
            await fetchEmployee();
        } catch (error) {
            // Arquitectura: Manejo centralizado de errores para el toast
            toast.error(translateError(error, 'employeeDetail.error_guardar_cambios'));
            console.error('Error de payload:', error);
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
        if (!employee || pendingStatus === null) {
            return;
        }

        if (isChangingStatus) {
            return;
        }

        setIsChangingStatus(true);

        try {
            await userService.changeUserStatus(employee.id, pendingStatus);
            
            // i18n: Mensajes separados para una correcta traducción
            const successMsg = pendingStatus 
              ? t('employeeDetail.success_activado', 'Empleado activado correctamente.') 
              : t('employeeDetail.success_desactivado', 'Empleado desactivado correctamente.');
            
            toast.success(successMsg);

            await fetchEmployee();
            handleCloseStatusModal();
        } catch (err) {
            // Arquitectura: Quitamos la extracción manual y usamos el traductor
            toast.error(translateError(err, 'employeeDetail.error_cambiar_estado'));
            console.error('Error al cambiar estado:', err);
        } finally {
            setIsChangingStatus(false);
        }
    };

    return {
        router,
        employee,
        isLoading,
        error,
        isEditing,
        setIsEditing,
        isSaving,
        formData,
        handleChange,
        handleCancelEdit,
        handleSave,
        isChangingStatus,
        isStatusModalOpen,
        pendingStatus,
        handleRequestStatusChange,
        handleCloseStatusModal,
        handleConfirmStatusChange
    };
};