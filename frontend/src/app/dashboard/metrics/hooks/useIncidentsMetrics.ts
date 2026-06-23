import { useState, useEffect } from 'react';
import metricsService from '@/services/metricsService';
import { DateFilterParams } from '@/types/metrics';
import { PieSlice } from '@/components/ui/pieChart/PieChart';
import { useTranslation } from 'react-i18next';
// 1. Importamos nuestra arquitectura centralizada de errores
import { useErrorTranslator } from '@/hooks/useErrorTranslator';

const INCIDENTS_COLORS = [
  '#D32F2F', // Rojo (Tailwind red-500)
  '#F57C00', // Naranja (orange-500)
  '#c5a518', // Ámbar (amber-500)
  '#911367', // Rosa fuerte (rose-500)
  '#5c0d8a', // Violeta (violet-500)
];

const OTHER_COLOR = '#6b7280'; // Gris (gray-500) para métricas no especificadas

export const useIncidentsMetrics = (filters?: DateFilterParams) => {
  const [slices, setSlices] = useState<PieSlice[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { t } = useTranslation();
  // 2. Instanciamos el traductor de errores
  const { translateError } = useErrorTranslator();

  useEffect(() => {
    // Patrón para evitar fugas de memoria si el componente se desmonta antes de que la API responda
    let isMounted = true;

    const fetchIncidents = async () => {
      if (!filters?.fecha_inicio || !filters?.fecha_fin) {
        if (isMounted) {
          // 3. i18n: Extraemos el texto duro a una clave de traducción (con fallback por si aún no la agregas al JSON)
          setError(t('metricsPage.seleccione_rango_fechas', 'Seleccione un rango de fechas completo para ver las incidencias.'));
          setIsLoading(false);
          setSlices([]);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await metricsService.getIncidents(filters);
        
        if (isMounted) {
          setTotal(data.total_incidencias);
          
          const mappedSlices: PieSlice[] = data.cancelaciones.map((item, index) => {
            const isOtros = item.causa.toLowerCase() === 'otros';
            
            const color = isOtros 
              ? OTHER_COLOR 
              : INCIDENTS_COLORS[index % INCIDENTS_COLORS.length];

            return {
              label: item.causa,
              value: item.cantidad,
              color: color
            };
          });

          setSlices(mappedSlices);
        }
      } catch (err) {
        if (isMounted) {
          // 4. Arquitectura: Delegamos el error crudo al traductor
          setError(translateError(err, 'metricsPage.error_carg_metri'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchIncidents();

    return () => {
      isMounted = false;
    };
  // 5. Agregamos las funciones de hooks a las dependencias por buenas prácticas
  }, [filters?.fecha_inicio, filters?.fecha_fin, t, translateError]);

  return { slices, total, isLoading, error };
};