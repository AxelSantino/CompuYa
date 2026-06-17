'use client';

import { Envio } from '@/types/envio';
import { DateFilterParams } from '@/types/metrics';

// Capas lógicas (Sincrónica y Asincrónica)
import { useShipmentMetrics } from '@/app/dashboard/metrics/hooks/useShipmentMetrics';
import { useIncidentsMetrics } from '@/app/dashboard/metrics/hooks/useIncidentsMetrics';

// Componentes genéricos reutilizables de UI
import { PieChart } from '@/components/ui/pieChart/PieChart';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

interface ShipmentMetricsProps {
  shipments: Envio[];
  isLoading?: boolean;
  filters: DateFilterParams; // 1. Recibimos el objeto estandarizado de fechas
}

export default function ShipmentMetrics({ shipments, isLoading = false, filters }: ShipmentMetricsProps) {
  // Cerebro Sincrónico: Procesa los envíos en memoria
  const metrics = useShipmentMetrics(shipments, filters);

  const{t} = useTranslation();

  // Cerebro Asincrónico: Consigue y mapea las incidencias desde la API usando las fechas
  const { 
    slices: incidentsSlices, 
    total: totalIncidents, 
    isLoading: incidentsLoading, 
    error: incidentsError 
  } = useIncidentsMetrics(filters);

  // Configuración de las tarjetas de resumen

  // Estado de carga inicial general (Mantenemos tus Skeletons)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Resumen General */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
        <div>
          {/*
          <br></br>
          <h3 className="text-lg font-semibold text-gray-900">Resumen de Operaciones</h3>
          <p className="text-sm text-gray-500">Total de envíos: {metrics.total}</p>
          */}
        </div>
      </div>

      {/* 3. Ajuste de Grilla: Pasamos de cols-2 a cols-3 en pantallas grandes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Gráfico 1: Estados */}
        <PieChart
          title={t('metricsPage.dist_estados')}
          slices={[
            { label: t('metricsPage.en_sucursal'), value: metrics.enSucursal, color: '#6b7280' },
            { label: t('metricsPage.en_transito'), value: metrics.enTransito, color: '#f59e0b' },
            { label: t('metricsPage.entregados'), value: metrics.entregado, color: '#16a34a' },
            { label: t('metricsPage.cancelados'), value: metrics.cancelado, color: '#dc2626' },
          ]}
          subtitle={t('metricsPage.envios_en_sistema') + metrics.total}
        />

        {/* Gráfico 2: Prioridades */}
        <PieChart
          title={t('metricsPage.dist_prioridades')}
          slices={[
            { label: t('metricsPage.alta'), value: metrics.alta, color: '#ef4444' },
            { label: t('metricsPage.media'), value: metrics.media, color: '#3b82f6' },
            { label: t('metricsPage.baja'), value: metrics.baja, color: '#22c55e' },
          ]}
          subtitle={t('metricsPage.envios_en_sistema') + metrics.total}
        />

        {/* Gráfico 3: Manejo de los estados de la petición asincrónica de Incidencias */}
        {incidentsLoading ? (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[280px]">
            <span className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></span>
            <span className="text-sm text-gray-400 font-medium animate-pulse">{t('metricsPage.cargando_incidencias')}</span>
          </div>
        ) : incidentsError ? (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-center text-sm font-medium text-red-500 min-h-[280px] text-center px-4">
            {incidentsError}
          </div>
        ) : (
          <PieChart
            title={t('metricsPage.motivos_cancelacion')}
            slices={incidentsSlices}
            subtitle={t('metricsPage.envios_cancelados') + totalIncidents}
          />
        )}
      </div>
    </div>
  );
}