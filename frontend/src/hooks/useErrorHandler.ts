import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { GLOBAL_BACKEND_ERROR_MAP } from '@/utils/errorDictionaries';

export function useErrorHandler() {
  const { t } = useTranslation();

  // Esta función recibe el error crudo y devuelve el string traducido
  const parseApiError = (error: unknown, defaultFallback = 'globalErrors.inesperado'): string => {
    
    // 1. Si es un error del backend (Axios)
    if (axios.isAxiosError(error)) {
      const backendMessage = error.response?.data?.detail;
      
      // Si hay mensaje y existe en el diccionario, lo traducimos
      if (backendMessage && GLOBAL_BACKEND_ERROR_MAP[backendMessage as keyof typeof GLOBAL_BACKEND_ERROR_MAP]) {
        return t(GLOBAL_BACKEND_ERROR_MAP[backendMessage as keyof typeof GLOBAL_BACKEND_ERROR_MAP]);
      }
      
      // Si no existe en el diccionario (ej. error dinámico), devolvemos el texto original
      // o un error de conexión genérico si el server está caído
      return backendMessage || t('globalErrors.conexion', 'Error de conexión con el servidor.');
    }
    
    // 2. Si es un error nativo de JavaScript (ej. variable no definida)
    if (error instanceof Error) {
      return error.message;
    }
    
    // 3. Si es un fallback absoluto
    return t(defaultFallback, 'Ocurrió un error inesperado.');
  };

  return { parseApiError };
}