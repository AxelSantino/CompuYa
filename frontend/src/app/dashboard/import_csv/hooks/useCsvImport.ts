import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import shipmentService from '@/services/shipmentService';
import { ValidationError, ConfirmImportResponse } from '@/types/importacion';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

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
      toast.success(response.mensaje || t('importCsvPage.archivo_valido_para_importar'));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        // FastAPI a veces devuelve un string plano (ej: "Faltan columnas") 
        if (typeof detail === 'string') {
          setGeneralError(detail);
          toast.error(detail);
        } 
        // Y otras veces devuelve un objeto estructurado con las filas (ej: errores de Enum)
        else if (detail.errores) {
          setValidationErrors(detail.errores);
          toast.error(t('importCsvPage.errores_en_filas'));
        }
      } else {
        const fallbackError = t('importCsvPage.error_inesperado_al_validar_archivo');
        setGeneralError(fallbackError);
        toast.error(fallbackError);
      }
    } finally {
      setIsValidating(false);
    }
  }, [file]);

  // Accion: Confirmar e Importar
  const confirmImport = useCallback(async () => {
    if (!file) return;

    setIsImporting(true);
    setGeneralError(null);

    try {
      const response = await shipmentService.confirmCsvImport(file);
      setImportResults(response);
      toast.success(t('importCsvPage.importacion_finalizada'));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        if (typeof detail === 'string') {
          setGeneralError(detail);
          toast.error(detail);
        } else if (detail.errores) {
          // Si fallaron TODAS las filas, FastAPI devuelve 400. Mapeamos eso a nuestro estado.
          setImportResults({
            mensaje: detail.mensaje || t('importCsvPage.no_se_pudo_crear_envios'),
            creados: [],
            errores: detail.errores
          });
          toast.error(t('importCsvPage.importacion_fallida'));
        }
      } else {
        const fallbackError = t('importCsvPage.error_de_red_al_importar');
        setGeneralError(fallbackError);
        toast.error(fallbackError);
      }
    } finally {
      setIsImporting(false);
    }
  }, [file]);

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