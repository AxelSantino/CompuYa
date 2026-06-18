import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import metricsService from '@/services/metricsService';
import { DateFilterParams } from '@/types/metrics';
import toast from 'react-hot-toast';

export const useExportMetrics = (filters: DateFilterParams) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToZip = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);

    // Muestra un toast de carga que luego se actualiza a éxito o error
    const toastId = toast.loading('Generando reportes, por favor espera...');

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

      toast.success('Reportes exportados correctamente.', { id: toastId });
      
    } catch (error) {
      console.error('Error al generar el ZIP:', error);
      toast.error('Ocurrió un error al descargar los reportes.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  }, [filters, isExporting]);

  return {
    isExporting,
    exportToZip
  };
};