'use client';

import { Envio } from '@/types/envio';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import { useShipmentMetrics } from '@/app/dashboard/metrics/hooks/useShipmentMetrics';

import { PieChart } from '@/components/ui/PieChart';
import { MetricCard, MetricCardProps } from '@/components/ui/MetricCard';

interface ShipmentMetricsProps {
  shipments: Envio[];
  isLoading?: boolean;
}

export default function ShipmentMetrics({ shipments, isLoading = false }: ShipmentMetricsProps) {
  // Obtenemos los totales calculados sin ensuciar la vista
  const metrics = useShipmentMetrics(shipments);

  // Mapeamos los datos a las propiedades de nuestras tarjetas
  const metricCards: MetricCardProps[] = [
    {
      label: 'Prioridad Alta',
      value: metrics.alta,
      icon: <FaBox className="text-red-500" size={24} />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      percentage: metrics.total > 0 ? Math.round((metrics.alta / metrics.total) * 100) : 0,
    },
    {
      label: 'Prioridad Media',
      value: metrics.media,
      icon: <FaBox className="text-blue-500" size={24} />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      percentage: metrics.total > 0 ? Math.round((metrics.media / metrics.total) * 100) : 0,
    },
    {
      label: 'Prioridad Baja',
      value: metrics.baja,
      icon: <FaBox className="text-green-500" size={24} />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      percentage: metrics.total > 0 ? Math.round((metrics.baja / metrics.total) * 100) : 0,
    },
    {
      label: 'En Sucursal',
      value: metrics.enSucursal,
      icon: <FaBox className="text-gray-500" size={24} />,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
    },
    {
      label: 'En Tránsito',
      value: metrics.enTransito,
      icon: <FaTruck className="text-yellow-500" size={24} />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
    },
    {
      label: 'Entregados',
      value: metrics.entregado,
      icon: <FaCheckCircle className="text-green-500" size={24} />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      percentage: metrics.porcentajeEntregado,
    },
    {
      label: 'Cancelados',
      value: metrics.cancelado,
      icon: <FaTimesCircle className="text-red-500" size={24} />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
    },
  ];

  // Renderizado de estado de carga
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

  // Renderizado Final Ensamblado
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Resumen de Envíos</h3>
        <p className="text-sm text-gray-600">Total: {metrics.total} envíos registrados</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PieChart
          title="Distribución de Prioridades"
          slices={[
            { label: 'Alta', value: metrics.alta, color: '#ef4444' },
            { label: 'Media', value: metrics.media, color: '#3b82f6' },
            { label: 'Baja', value: metrics.baja, color: '#22c55e' },
          ]}
        />
        <PieChart
          title="Distribución de Estados"
          slices={[
            { label: 'En Sucursal', value: metrics.enSucursal, color: '#6b7280' },
            { label: 'En Tránsito', value: metrics.enTransito, color: '#f59e0b' },
            { label: 'Entregados', value: metrics.entregado, color: '#16a34a' },
            { label: 'Cancelados', value: metrics.cancelado, color: '#dc2626' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, index) => (
          <MetricCard
            key={index}
            label={card.label}
            value={card.value}
            icon={card.icon}
            bgColor={card.bgColor}
            textColor={card.textColor}
            percentage={card.percentage}
          />
        ))}
      </div>
    </div>
  );
}