import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import metricsService from '@/services/metricsService';
import { DateFilterParams } from '@/types/metrics';
import toast from 'react-hot-toast';
// 1. Importamos las herramientas de i18n y manejo de errores
import { useTranslation } from 'react-i18next';
import { useErrorTranslator } from '@/hooks/useErrorTranslator';

export const useExportMetrics = (filters: DateFilterParams) => {
  const [isExporting, setIsExporting] = useState(false);
  const { t } = useTranslation();
  const { translateError } = useErrorTranslator();

  const exportToZip = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);

    // Muestra un toast de carga que luego se actualiza a éxito o error
    // i18n: Aplicado al estado de carga
    const toastId = toast.loading(t('metricsPage.export_generando_reportes'));

    try {
      // Peticiones concurrentes: Ejecutamos las 3 llamadas al mismo tiempo
      const [statesBlob, prioritiesBlob, cancelationsBlob] = await Promise.all([
        metricsService.exportStatesCsv(filters),
        metricsService.exportPrioritiesCsv(filters),
        metricsService.exportCancelationReasonsCsv(filters)
      ]);

      const zip = new JSZip();

      // Se inyectan los reportes en un archivo zip
      zip.file('reporte_estados.csv', statesBlob);
      zip.file('reporte_prioridades.csv', prioritiesBlob);
      zip.file('motivos_cancelacion.csv', cancelationsBlob);

      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Forzar la descarga desde el navegador
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Armado del nombre del archivo
      const dateSuffix = (filters.fecha_inicio && filters.fecha_fin)
        ? `_${filters.fecha_inicio}_a_${filters.fecha_fin}`
        : '';
      link.download = `reportes_operativos${dateSuffix}.zip`;

      // Click automatico (descarga automatica) y se limpia la memoria
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      // i18n: Aplicado al estado de éxito
      toast.success(t('metricsPage.export_exito'), { id: toastId });
      
    } catch (error) {
      console.error('Error al generar el ZIP:', error);
      
      // Arquitectura: Usamos el traductor de errores para capturar caídas
      const errorMessage = translateError(error, 'metricsPage.export_error');
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  // Agregamos t y translateError a las dependencias por buenas prácticas
  }, [filters, isExporting, t, translateError]);

  return {
    isExporting,
    exportToZip
  };
};