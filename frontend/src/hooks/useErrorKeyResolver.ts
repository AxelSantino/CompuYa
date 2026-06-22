import { useCallback } from 'react';
import axios from 'axios';
import { GLOBAL_BACKEND_ERROR_MAP } from '@/utils/errorDictionaries';

export function useErrorKeyResolver() {
  
// Sirve para traducir los errores provenientes del backend y devolver la KEY del error para que el HTML controle finalmente la traduccion
  const resolveErrorKey = useCallback((error: unknown, defaultFallbackKey = 'login.errores.inesperado'): string => {
    if (axios.isAxiosError(error)) {

      const backendMessage = error.response?.data?.detail;
    
      if (backendMessage && GLOBAL_BACKEND_ERROR_MAP[backendMessage as keyof typeof GLOBAL_BACKEND_ERROR_MAP]) {
        console.log(GLOBAL_BACKEND_ERROR_MAP[backendMessage as keyof typeof GLOBAL_BACKEND_ERROR_MAP])
        return GLOBAL_BACKEND_ERROR_MAP[backendMessage as keyof typeof GLOBAL_BACKEND_ERROR_MAP];
      }
      return backendMessage || 'login.errores.conexion';
    }
    
    if (error instanceof Error) {
        // Si se ejecuta esta rama es porque ocurrio un error nativo y no prveniente de la API
        const errorMessage = error.message;

        // Buscamos si el error esta en nuestras claves
        if (errorMessage && GLOBAL_BACKEND_ERROR_MAP[errorMessage as keyof typeof GLOBAL_BACKEND_ERROR_MAP]) {
            return GLOBAL_BACKEND_ERROR_MAP[errorMessage as keyof typeof GLOBAL_BACKEND_ERROR_MAP];
        }
        return errorMessage;
    }
    
    return defaultFallbackKey;
  }, []); 

  return { resolveErrorKey };
}