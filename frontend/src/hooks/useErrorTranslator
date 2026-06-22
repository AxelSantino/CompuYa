import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { GLOBAL_BACKEND_ERROR_MAP } from '@/utils/errorDictionaries';

export function useErrorTranslator() {
  const { t } = useTranslation();

  // Inyecta useTranslation internamente, es ideal cuando se necesita el texto ya procesado por ejemplo para toasts.
  
  const translateError = useCallback((error: unknown, defaultFallbackKey = 'login.errores.inesperado'): string => {
    if (axios.isAxiosError(error)) {
      const backendMessage = error.response?.data?.detail;
      
      if (backendMessage && GLOBAL_BACKEND_ERROR_MAP[backendMessage as keyof typeof GLOBAL_BACKEND_ERROR_MAP]) {
        // Ejecutamos la traducción directamente aquí
        return t(GLOBAL_BACKEND_ERROR_MAP[backendMessage as keyof typeof GLOBAL_BACKEND_ERROR_MAP]);
      }
      
      // Traducimos el fallback
      return backendMessage || t('login.errores.conexion', 'Error de conexión con el servidor.');
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    // Traducimos el error por defecto
    return t(defaultFallbackKey, 'Ocurrió un error inesperado.');
  }, [t]); // Dependencia del hook de i18n

  return { translateError };
}