'use client';

import { Envio } from '@/types/envio';
import { DateFilterParams } from '@/types/metrics';

// Capas lógicas (Sincrónica y Asincrónica)
import { useShipmentMetrics } from '@/app/dashboard/metrics/hooks/useShipmentMetrics';
import { useIncidentsMetrics } from '@/app/dashboard/metrics/hooks/useIncidentsMetrics';
import { useDeliveryMetrics } from '@/app/dashboard/metrics/hooks/useDeliveryMetrics';

// Componentes genéricos reutilizables de UI
import { PieChart } from '@/components/ui/pieChart/PieChart';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { BarChart } from '@/components/ui/barChart/BarChart';
import { MetricCard } from '@/components/ui/MetricCard';
import { FaBox, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface ShipmentMetricsProps {
  shipments: Envio[];
  isLoading?: boolean;
  filters: DateFilterParams;
}

export default function ShipmentMetrics({ shipments, isLoading = false, filters }: ShipmentMetricsProps) {
  const metrics = useShipmentMetrics(shipments, filters);
  const { t } = useTranslation();

  // Cerebro Asincrónico: Consigue y mapea las incidencias desde la API usando las fechas
  const { 
    slices: incidentsSlices, 
    total: totalIncidents, 
    isLoading: incidentsLoading, 
    error: incidentsError 
  } = useIncidentsMetrics(filters);

  const {
    data: deliveryData,
    totalDeliveries,
    isLoading: deliveryLoading,
    error: deliveryError
  } = useDeliveryMetrics(filters);

  if (isLoading) {
    return (
      <div 
        // a11y: Ocultamos el esqueleto decorativo del lector de pantalla
        aria-hidden="true" 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

 return (
    <div className="mb-8">
      {/* =========================================
          HEADER Y BOTONERA DE ACCIONES
          ========================================= */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        
        {/* Gráfico de Barras */}
        <div className="w-full lg:w-2/3">
          {deliveryLoading ? (
            <div 
              // a11y: Rol de estado para carga
              role="status" 
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center h-full min-h-[360px]"
            >
              {/* a11y: Spinner oculto */}
              <span aria-hidden="true" className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></span>
              {/* Contraste mejorado a gray-600 */}
              <span className="text-sm text-gray-600 font-medium animate-pulse">{t('metricsPage.cargando_rendimiento')}</span>
            </div>
          ) : deliveryError ? (
            <div 
              // a11y: Rol de alerta y contraste mejorado a red-600
              role="alert" 
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-center text-sm font-medium text-red-600 h-full min-h-[360px] text-center px-4"
            >
              {deliveryError}
            </div>
          ) : (
            <BarChart
              title={t('metricsPage.puntualidad_entregas')}
              subtitle={t('metricsPage.total_evaluado', { count: totalDeliveries })}
              data={deliveryData}
            />
          )}
        </div>

        {/* Tarjetas de Métricas */}
        <div className="w-full lg:w-1/3 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6">
          <MetricCard
            title={t('metricsPage.card_total_envios')}
            value={metrics.total}
            // a11y: Ícono silenciado
            icon={<FaBox aria-hidden="true" size={26} />}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <MetricCard
            title={t('metricsPage.card_envios_entregados')}
            value={metrics.entregado}
            // a11y: Ícono silenciado
            icon={<FaCheckCircle aria-hidden="true" size={26} />}
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <MetricCard
            title={t('metricsPage.card_envios_cancelados')}
            value={metrics.cancelado}
            // a11y: Ícono silenciado
            icon={<FaTimesCircle aria-hidden="true" size={26} />}
            bgColor="bg-red-50"
            textColor="text-red-600"
          />
        </div>
      </div>

      {/* =========================================
          FILA 3: Los 3 Gráficos Circulares
          ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Gráfico 1: Estados */}
        <PieChart
          title={t('metricsPage.dist_estados')}
          slices={[
            { label: t('metricsPage.en_sucursal'), value: metrics.enSucursal, color: '#6b7280' },
            { label: t('metricsPage.en_transito'), value: metrics.enTransito, color: '#f59e0b' },
            { label: t('metricsPage.entregados'), value: metrics.entregado, color: '#16a34a' },
            { label: t('metricsPage.cancelados'), value: metrics.cancelado, color: '#dc2626' },
          ]}
          // i18n: Interpolación de variables en lugar de concatenación
          subtitle={t('metricsPage.envios_en_sistema', { count: metrics.total })}
        />

        {/* Gráfico 2: Prioridades */}
        <PieChart
          title={t('metricsPage.dist_prioridades')}
          slices={[
            { label: t('metricsPage.alta'), value: metrics.alta, color: '#ef4444' },
            { label: t('metricsPage.media'), value: metrics.media, color: '#3b82f6' },
            { label: t('metricsPage.baja'), value: metrics.baja, color: '#22c55e' },
          ]}
          // i18n: Interpolación de variables en lugar de concatenación
          subtitle={t('metricsPage.envios_en_sistema', { count: metrics.total })}
        />

        {/* Gráfico 3: Incidencias */}
        {incidentsLoading ? (
          <div 
            // a11y: Rol de estado para carga
            role="status" 
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[360px]"
          >
            {/* a11y: Spinner oculto */}
            <span aria-hidden="true" className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></span>
            {/* Contraste mejorado a gray-600 */}
            <span className="text-sm text-gray-600 font-medium animate-pulse">{t('metricsPage.cargando_incidencias')}</span>
          </div>
        ) : incidentsError ? (
          <div 
            // a11y: Rol de alerta y contraste mejorado a red-600
            role="alert" 
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-center text-sm font-medium text-red-600 min-h-[360px] text-center px-4"
          >
            {incidentsError}
          </div>
        ) : (
          <PieChart
            title={t('metricsPage.motivos_cancelacion')}
            slices={incidentsSlices}
            // i18n: Interpolación de variables en lugar de concatenación
            subtitle={t('metricsPage.envios_cancelados', { count: totalIncidents })}
          />
        )}
        
      </div>
    </div>
  );
}