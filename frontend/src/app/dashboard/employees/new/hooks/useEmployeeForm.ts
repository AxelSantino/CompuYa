import { useState } from 'react';
import { useRouter } from 'next/navigation';
import userService from '@/services/userService';
import { RegistroEmpleado, Usuario } from '@/types/usuario';
// 1. Importamos i18n y nuestro manejador global de errores
import { useTranslation } from 'react-i18next';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';

export const useEmployeeForm = () => {
  const router = useRouter();
  
  // 2. Instanciamos los hooks
  const { t } = useTranslation();
  const { translateError } = useErrorTranslator();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdEmployee, setCreatedEmployee] = useState<Usuario | null>(null);

  // Inicializamos el estado cumpliendo con la interfaz RegistroEmpleado
  const [formData, setFormData] = useState<RegistroEmpleado>({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: '',
    tipo: 'empleado',
    fecha: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpia el error si el usuario empieza a escribir de nuevo
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.rol) {
      // i18n: Pasamos el error de validación local por el traductor
      setError(t('newEmployeesPage.error_seleccionar_rol', 'Por favor, selecciona un rol para el empleado.'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await userService.createEmployee(formData);
      setCreatedEmployee(response);
    } catch (err) {
      console.error('Error al registrar empleado:', err);
      // Arquitectura: Delegamos el error crudo al traductor global con su respectiva clave de fallback
      setError(translateError(err, 'newEmployeesPage.error_registrar_empleado'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    error,
    createdEmployee
  };
};