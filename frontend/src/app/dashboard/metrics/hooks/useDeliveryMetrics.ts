import { useState, useEffect, useMemo } from 'react';
import metricsService from '@/services/metricsService';
import { DateFilterParams } from '@/types/metrics';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

export interface BarChartData {
  name: string;
  value: number;
  color: string;
}

export const useDeliveryMetrics = (filters?: DateFilterParams) => {
  // 1. Ahora guardamos los datos "crudos" en el estado, sin textos
  const [rawCounts, setRawCounts] = useState({ onTime: 0, late: 0 });
  const [totalDeliveries, setTotalDeliveries] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {t} = useTranslation();

  const { t } = useTranslation();

  useEffect(() => {
    let isMounted = true;

    const fetchDeliveryData = async () => {
      if (!filters?.fecha_inicio || !filters?.fecha_fin) {
        if (isMounted) setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [onTimeRes, lateRes] = await Promise.all([
          metricsService.getDeliveredOnTime(filters),
          metricsService.getDeliveredLate(filters),
        ]);

        if (isMounted) {
          setTotalDeliveries(onTimeRes.total_envios);
          setRawCounts({
            onTime: onTimeRes.entregados_a_tiempo,
            late: lateRes.entregados_con_demora
          });
        }
      } catch {
        if (isMounted) setError(t('metricsPage.error_al_cargar_metricas') || 'Error al cargar las métricas');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDeliveryData();

    return () => {
      isMounted = false;
    };
  // El useEffect sigue escuchando SOLO a las fechas. ¡No hace peticiones innecesarias!
  }, [filters?.fecha_inicio, filters?.fecha_fin]); 

  // Esto se recalcula automáticamente si cambian los números O si cambia el idioma (t)
  const data: BarChartData[] = useMemo(() => [
    { name: t('metricsPage.total_entregas'), value: totalDeliveries, color: '#3b82f6' },
    { name: t('metricsPage.a_tiempo'), value: rawCounts.onTime, color: '#16a34a' },
    { name: t('metricsPage.con_demora'), value: rawCounts.late, color: '#ef4444' }
  ], [totalDeliveries, rawCounts, t]);

  return { data, totalDeliveries, isLoading, error };
};