import { useState } from 'react';
import { useRouter } from 'next/navigation';
import userService from '@/services/userService';
import { RegistroEmpleado, Usuario } from '@/types/usuario';

export const useEmployeeForm = () => {
  const router = useRouter();
  
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
      setError('Por favor, selecciona un rol para el empleado.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await userService.createEmployee(formData);
      setCreatedEmployee(response);
    } catch (err: any) {
      console.error('Error al registrar empleado:', err);
      // Extraemos el mensaje de error de Axios si existe, sino usamos uno genérico
      const errorMessage = err.response?.data?.detail || 'Ocurrió un error al intentar registrar el empleado. Verifica los datos e intenta nuevamente.';
      setError(errorMessage);
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