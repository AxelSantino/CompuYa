import { useState } from 'react';
import userService from '@/services/userService';
import { RegistroEmpresa, Usuario } from '@/types/usuario';
import { DireccionNormalizada } from '@/services/usigService';

export const useClientForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdClient, setCreatedClient] = useState<Usuario | null>(null);

  const getLocalDateString = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<RegistroEmpresa>({
    email: '',
    password: '',
    razon_social: '',
    cuit: '',
    tipo: 'empresa', 
    rol: 'cliente', 
    fecha: getLocalDateString(),

    latitud: 0,
    longitud: 0,
    direccion_normalizada: '',
    provincia: '',
    municipio: '',
    cod_postal: '',
  });

  // Controlador para los inputs de texto clásicos (Email, Password, Razón Social, CUIT)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleLocationComplete = (location: DireccionNormalizada) => {
    if (!location.coordenadas) return;

    setFormData((prev) => ({
      ...prev,
      direccion_normalizada: location.direccion,
      latitud: parseFloat(location.coordenadas!.y),
      longitud: parseFloat(location.coordenadas!.x),
      municipio: location.municipio || location.nombre_partido || location.nombre_localidad || 'No Especificado',
      provincia: location.provincia || 'No Especificado',
    }));
    
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.latitud === 0 || formData.longitud === 0 || !formData.direccion_normalizada) {
      setError('Por favor, busque y seleccione una ubicación geográfica válida en el mapa antes de continuar.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await userService.createClient(formData);
      setCreatedClient(response);
    } catch (err: any) {
      console.error('Error al registrar cliente:', err);
      const errorMessage = err.response?.data?.detail || 'Ocurrió un error al intentar registrar la empresa. Verifica los datos e intenta nuevamente.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleLocationComplete,
    handleSubmit,
    isLoading,
    error,
    createdClient
  };
};