import { useState } from 'react';
import userService from '@/services/userService';
import { RegistroEmpresa, Usuario } from '@/types/usuario';
import { DireccionNormalizada } from '@/services/usigService';

export const useClientForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdClient, setCreatedClient] = useState<Usuario | null>(null);

  // Funcion para evitar el bug de las zonas horarias (cuando javascript te pone un dia para atras)
  const getLocalDateString = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split('T')[0];
  };

  // Inicializamos el estado con los valores por defecto requeridos por FastAPI
  const [formData, setFormData] = useState<RegistroEmpresa>({
    email: '',
    password: '',
    razon_social: '',
    cuit: '',
    tipo: 'empresa', 
    rol: 'cliente', 
    fecha: getLocalDateString(),
    
    // Campos geográficos que se llenarán luego
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

  // Manejador específico que será llamado por el LocationManager
  const handleLocationComplete = (location: DireccionNormalizada) => {
    if (!location.coordenadas) return;

    // Adaptador para deducir la provincia
    const isCABA = location.direccion.toUpperCase().includes('CABA') || 
                   location.nombre_partido?.toUpperCase() === 'CABA';

    setFormData((prev) => ({
      ...prev,
      direccion_normalizada: location.direccion,
      latitud: parseFloat(location.coordenadas!.y),
      longitud: parseFloat(location.coordenadas!.x),
      // Se mapean los datos de USIG a lo que espera FastAPI
      municipio: location.nombre_partido || location.nombre_localidad || 'Ciudad Autónoma de Buenos Aires',
      provincia: isCABA ? 'CABA' : 'Buenos Aires',
      cod_postal: '0000', // Valor por defecto si no tenemos una API de Códigos Postales
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