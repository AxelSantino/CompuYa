import { useState, useEffect } from 'react';
import metricsService from '@/services/metricsService';
import { DateFilterParams } from '@/types/metrics';

export interface BarChartData {
  name: string;
  value: number;
  color: string;
}

export const useDeliveryMetrics = (filters?: DateFilterParams) => {
  const [data, setData] = useState<BarChartData[]>([]);
  const [totalDeliveries, setTotalDeliveries] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDeliveryData = async () => {
      // Cláusula de guarda para evitar peticiones basura si las fechas no están listas
      if (!filters?.fecha_inicio || !filters?.fecha_fin) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Disparamos ambas promesas en paralelo
        const [onTimeRes, lateRes] = await Promise.all([
          metricsService.getDeliveredOnTime(filters),
          metricsService.getDeliveredLate(filters),
        ]);

        if (isMounted) {
          // El total de entregas bajo análisis es la suma de ambos estados analizados
          const onTimeCount = onTimeRes.entregados_a_tiempo;
          const lateCount = lateRes.entregados_con_demora;
          const total = onTimeRes.total_envios;

          setTotalDeliveries(total);

          // Estructuramos el array plano con la nomenclatura que espera Recharts
          setData([
            { name: 'Total Entregas', value: total, color: '#3b82f6' },
            { name: 'A Tiempo', value: onTimeCount, color: '#16a34a' },
            { name: 'Con Demora', value: lateCount, color: '#ef4444' }
          ]);
        }
      } catch {
        if (isMounted) {
          setError('Error al cargar las métricas de rendimiento de entrega.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDeliveryData();

    return () => {
      isMounted = false;
    };
  }, [filters?.fecha_inicio, filters?.fecha_fin]);

  return { data, totalDeliveries, isLoading, error };
};