import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import shipmentService from '@/services/shipmentService';
import { ValidationError, ConfirmImportResponse } from '@/types/importacion';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { useCsvErrorResolver } from '@/hooks/useCsvErrorResolver';

/*
    Este Custom Hook es el "cerebro" de la operación. 
    Su principal responsabilidad es manejar los estados (qué pantalla mostrar) y traducir las respuestas de error de FastAPI 
    a algo que React pueda entender y dibujar.
*/

export const useCsvImport = () => {
  // Estados de Datos
  const [file, setFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importResults, setImportResults] = useState<ConfirmImportResponse | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Estados de Interfaz (booleanos)
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [validationSuccess, setValidationSuccess] = useState<boolean>(false);

  const {t} = useTranslation();

  const { processCsvError } = useCsvErrorResolver();

  // Seleccionar Archivo
  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    // Cada vez que se elige un archivo nuevo, limpiamos todos los estados anteriores
    setValidationErrors([]);
    setValidationSuccess(false);
    setImportResults(null);
    setGeneralError(null);
  }, []);

  // Accion: Validar Archivo
  const validateFile = useCallback(async () => {
    if (!file) return;

    setIsValidating(true);
    setValidationErrors([]);
    setGeneralError(null);
    setValidationSuccess(false);

    try {
      const response = await shipmentService.validateCsvImport(file);
      setValidationSuccess(true);
      
      const successMsg = response.mensaje ? t(`importCsvPage.backend.${response.mensaje}`, response.mensaje) : t('importCsvPage.archivo_valido_para_importar');
      toast.success(successMsg);
      
    } catch (error) {
      // 3. MAGIA: Delegamos el error al resolver
      const { 
        generalError: errorMsg, 
        validationErrors: rowErrors, 
        hasRowErrors } = processCsvError(error, 'importCsvPage.error_inesperado_al_validar_archivo');
      
      setGeneralError(errorMsg);
      if (hasRowErrors) {
          setValidationErrors(rowErrors);
          toast.error(t('importCsvPage.errores_en_filas'));
      } else {
          toast.error(errorMsg || t('importCsvPage.error_inesperado_al_validar_archivo'));
      }
    } finally {
      setIsValidating(false);
    }
  }, [file, t, processCsvError]);

  // Accion: Confirmar e Importar
  const confirmImport = useCallback(async () => {
    if (!file) return;

    setIsImporting(true);
    setGeneralError(null);

    try {
      const response = await shipmentService.confirmCsvImport(file);
      
      const translatedPartialErrors = response.errores ? response.errores.map((err: any) => ({
          ...err,
          error: t(`importCsvPage.backend.${err.error}`, err.error)
      })) : [];

      setImportResults({
        ...response,
        errores: translatedPartialErrors, // Reemplazamos el array crudo por el traducido
        mensaje: response.mensaje 
            ? t(`importCsvPage.backend.${response.mensaje}`, response.mensaje) 
            : t('importCsvPage.importacion_finalizada')
      });
      
      toast.success(t('importCsvPage.importacion_finalizada'));
      
    } catch (error) {
      // 3. MAGIA: Reutilizamos el mismo resolver exacto para el otro endpoint
      const { generalError: errorMsg, 
        validationErrors: rowErrors, 
        hasRowErrors } = processCsvError(error, 'importCsvPage.error_de_red_al_importar');
      
      if (hasRowErrors) {
          setImportResults({
              mensaje: errorMsg || t('importCsvPage.no_se_pudo_crear_envios'),
              creados: [],
              errores: rowErrors // Ya vienen traducidos del resolver
          });
          toast.error(t('importCsvPage.importacion_fallida'));
      } else {
          setGeneralError(errorMsg);
          toast.error(errorMsg || t('importCsvPage.error_de_red_al_importar'));
      }
    } finally {
      setIsImporting(false);
    }
  }, [file, t, processCsvError]);

  // Accion: Reiniciar todo (Botón Cancelar)
  const resetProcess = useCallback(() => {
    setFile(null);
    setValidationErrors([]);
    setValidationSuccess(false);
    setImportResults(null);
    setGeneralError(null);
  }, []);

  return {
    // Estados expuestos
    file,
    isValidating,
    isImporting,
    validationErrors,
    validationSuccess,
    importResults,
    generalError,
    // Acciones expuestas
    handleFileSelect,
    validateFile,
    confirmImport,
    resetProcess
  };
};