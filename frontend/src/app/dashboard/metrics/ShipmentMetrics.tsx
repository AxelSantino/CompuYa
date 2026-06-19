'use client';

import { Envio } from '@/types/envio';
import { DateFilterParams } from '@/types/metrics';

// Capas lógicas (Sincrónica y Asincrónica)
import { useShipmentMetrics } from '@/app/dashboard/metrics/hooks/useShipmentMetrics';
import { useIncidentsMetrics } from '@/app/dashboard/metrics/hooks/useIncidentsMetrics';
import { useDeliveryMetrics } from '@/app/dashboard/metrics/hooks/useDeliveryMetrics';

// Componentes genéricos reutilizables de UI
import { PieChart } from '@/components/ui/pieChart/PieChart';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
      {/* Header invisible / divisor */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
        <div></div>
      </div>

      {/* =========================================
          FILA 1: Gráfico de Barras (Izquierda) + Tarjetas (Derecha)
          ========================================= */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        
        {/* Gráfico de Barras (2/3 de ancho en pantallas grandes) */}
        <div className="w-full lg:w-2/3">
          {deliveryLoading ? (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center h-full min-h-[360px]">
              <span className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></span>
              <span className="text-sm text-gray-400 font-medium animate-pulse">Cargando rendimiento de entregas...</span>
            </div>
          ) : deliveryError ? (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-center text-sm font-medium text-red-500 h-full min-h-[360px] text-center px-4">
              {deliveryError}
            </div>
          ) : (
            <BarChart
              title="Puntualidad de las entregas"
              subtitle={`Total evaluado: ${totalDeliveries} envíos`}
              data={deliveryData}
            />
          )}
        </div>

        {/* Tarjetas de Métricas (1/3 de ancho en pantallas grandes, fila en medianas, columna en móviles) */}
        <div className="w-full lg:w-1/3 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6">
          <MetricCard
            title="Total de Envíos"
            value={metrics.total}
            icon={<FaBox size={26} />}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <MetricCard
            title="Envíos Entregados"
            value={metrics.entregado}
            icon={<FaCheckCircle size={26} />}
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <MetricCard
            title="Envíos Cancelados"
            value={metrics.cancelado}
            icon={<FaTimesCircle size={26} />}
            bgColor="bg-red-50"
            textColor="text-red-600"
          />
        </div>
        
      </div>

      {/* =========================================
          FILA 2: Los 3 Gráficos Circulares
          ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Gráfico 1: Estados */}
        <PieChart
          title="Distribución de Estados"
          slices={[
            { label: 'En Sucursal', value: metrics.enSucursal, color: '#6b7a80' },
            { label: 'En Tránsito', value: metrics.enTransito, color: '#f59e0b' },
            { label: 'Entregados', value: metrics.entregado, color: '#16a34a' },
            { label: 'Cancelados', value: metrics.cancelado, color: '#dc2626' },
          ]}
          subtitle={"Envíos en el sistema: " + metrics.total}
        />

        {/* Gráfico 2: Prioridades */}
        <PieChart
          title="Distribución de Prioridades"
          slices={[
            { label: 'Alta', value: metrics.alta, color: '#ef4444' },
            { label: 'Media', value: metrics.media, color: '#ecaf3e' },
            { label: 'Baja', value: metrics.baja, color: '#22c55e' },
          ]}
          subtitle={"Envíos en el sistema: " + metrics.total}
        />

        {/* Gráfico 3: Incidencias */}
        {incidentsLoading ? (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[360px]">
            <span className="animate-spin inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></span>
            <span className="text-sm text-gray-400 font-medium animate-pulse">Cargando incidencias del período...</span>
          </div>
        ) : incidentsError ? (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center justify-center text-sm font-medium text-red-500 min-h-[360px] text-center px-4">
            {incidentsError}
          </div>
        ) : (
          <PieChart
            title="Motivos de cancelación"
            slices={incidentsSlices}
            subtitle={"Envíos cancelados: " + totalIncidents}
          />
        )}
        
      </div>
    </div>
  );
}