import { useState, useEffect } from 'react';
import metricsService from '@/services/metricsService';
import { DateFilterParams } from '@/types/metrics';
import { PieSlice } from '@/components/ui/pieChart/PieChart';

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

  useEffect(() => {
    // Patrón para evitar fugas de memoria si el componente se desmonta antes de que la API responda
    let isMounted = true;

    const fetchIncidents = async () => {
      if (!filters?.fecha_inicio || !filters?.fecha_fin) {
        if (isMounted) {
          setError('Seleccione un rango de fechas completo para ver las incidencias.');
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
          setError('Error al cargar las métricas de incidencias.');
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
  }, [filters?.fecha_inicio, filters?.fecha_fin]);

  return { slices, total, isLoading, error };
};