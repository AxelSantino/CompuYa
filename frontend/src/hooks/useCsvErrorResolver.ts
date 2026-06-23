import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';

// Tipado de lo que devolverá nuestro resolver
interface CsvErrorResult {
    generalError: string | null;
    validationErrors: any[]; // Aquí puedes usar ValidationError[] si lo importas
    hasRowErrors: boolean;
}

export const useCsvErrorResolver = () => {
    const { t } = useTranslation();
    const { translateError } = useErrorTranslator();

    const processCsvError = (error: unknown, fallbackKey: string): CsvErrorResult => {
        let generalError: string | null = null;
        let validationErrors: any[] = [];
        let hasRowErrors = false;

        if (axios.isAxiosError(error) && error.response?.data?.detail) {
            const detail = error.response.data.detail;

            // CASO 1: Error general (String plano enviado por el backend)
            // Ej: "err_extension_invalida"
            if (typeof detail === 'string') {
                generalError = t(`importCsvPage.backend.${detail}`, detail) as string;
            } 
            // CASO 2: Error estructurado por filas (Objeto con array de errores)
            else if (detail.errores && Array.isArray(detail.errores)) {
                hasRowErrors = true;
                
                // Mapeamos y traducimos las filas dependiendo del endpoint
                validationErrors = detail.errores.map((err: any) => {
                    // Estructura del endpoint de Validación (array de strings)
                    if (err.errores && Array.isArray(err.errores)) {
                        return {
                            ...err,
                            errores: err.errores.map((msg: string) => t(`importCsvPage.backend.${msg}`, msg))
                        };
                    } 
                    // Estructura del endpoint de Confirmación/Inserción (un solo string)
                    else if (err.error) {
                        return {
                            ...err,
                            error: t(`importCsvPage.backend.${err.error}`, err.error)
                        };
                    }
                    return err;
                });

                // Si el backend envía un mensaje general de cabecera (ej: "err_validacion_filas_fallida")
                if (detail.mensaje) {
                    generalError = t(`importCsvPage.backend.${detail.mensaje}`, detail.mensaje) as string;
                } else {
                    generalError = t('importCsvPage.errores_en_filas') as string;
                }
            }
        } else {
            // CASO 3: Error de red, caída del servidor o 500 (Delegamos al traductor global)
            generalError = translateError(error, fallbackKey);
        }

        return { generalError, validationErrors, hasRowErrors };
    };

    return { processCsvError };
};