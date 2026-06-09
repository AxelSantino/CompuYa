import { useState, useEffect, useCallback } from 'react';
import { Usuario } from '@/types/usuario';
import userService from '@/services/userService';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const useEmployeeProfile = (id: string) => {
    const router = useRouter();
    const [employee, setEmployee] = useState<Usuario | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
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
            setError('No se pudo cargar la información del empleado.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

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
            
            toast.success('Perfil actualizado correctamente.');
            setIsEditing(false);
            await fetchEmployee();
        } catch (error) {
            toast.error('Error al guardar los cambios.');
            console.error('Error de payload:', error);
        } finally {
            setIsSaving(false);
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
        handleSave
    };
};