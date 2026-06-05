'use client';

import React, { useMemo } from 'react';
import { Envio } from '@/types/envio';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface ShipmentMetricsProps {
  shipments: Envio[];
  isLoading?: boolean;
}

interface MetricCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  percentage?: number;
}

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

const PieChart = ({
  slices,
  title,
}: {
  slices: PieSlice[];
  title: string;
}) => {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let startAngle = -90;

  const getPath = (value: number) => {
    if (total === 0 || value === 0) {
      return '';
    }

    const angle = (value / total) * 360;
    const endAngle = startAngle + angle;
    const radius = 40;
    const center = 50;
    const startRadians = (Math.PI / 180) * startAngle;
    const endRadians = (Math.PI / 180) * endAngle;
    const x1 = center + radius * Math.cos(startRadians);
    const y1 = center + radius * Math.sin(startRadians);
    const x2 = center + radius * Math.cos(endRadians);
    const y2 = center + radius * Math.sin(endRadians);
    const largeArcFlag = angle > 180 ? 1 : 0;
    const path = `M ${center} ${center} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    startAngle = endAngle;
    return path;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="mb-4">
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        <div className="w-full lg:w-1/2 flex justify-center">
          {total === 0 ? (
            <div className="text-sm text-gray-500">No hay datos para mostrar.</div>
          ) : (
            <svg width="160" height="160" viewBox="0 0 100 100">
              {slices.map((slice, index) => {
                const path = getPath(slice.value);
                return (
                  <path key={`${slice.label}-${index}`} d={path} fill={slice.color} />
                );
              })}
              <circle cx="50" cy="50" r="18" fill="#fff" />
              <text x="50" y="54" textAnchor="middle" fill="#111" fontSize="10" fontWeight="700">
                {total}
              </text>
            </svg>
          )}
        </div>
        <div className="w-full lg:w-1/2 grid gap-3">
          {slices.map((slice) => (
            <div key={slice.label} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="text-sm text-gray-700">{slice.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {slice.value} ({total > 0 ? Math.round((slice.value / total) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ShipmentMetrics({ shipments, isLoading = false }: ShipmentMetricsProps) {
  const metrics = useMemo(() => {
    if (!shipments || shipments.length === 0) {
      return {
        alta: 0,
        media: 0,
        baja: 0,
        enSucursal: 0,
        enTransito: 0,
        entregado: 0,
        cancelado: 0,
        total: 0,
        porcentajeEntregado: 0,
      };
    }

    const total = shipments.length;

    const alta = shipments.filter((s) => s.prioridad === 'alta').length;
    const media = shipments.filter((s) => s.prioridad === 'media').length;
    const baja = shipments.filter((s) => s.prioridad === 'baja').length;

    const enSucursal = shipments.filter((s) => s.estado === 'en sucursal').length;
    const enTransito = shipments.filter((s) => s.estado === 'en transito').length;
    const entregado = shipments.filter((s) => s.estado === 'entregado').length;
    const cancelado = shipments.filter((s) => s.estado === 'cancelado').length;

    const porcentajeEntregado = total > 0 ? Math.round((entregado / total) * 100) : 0;

    return {
      alta,
      media,
      baja,
      enSucursal,
      enTransito,
      entregado,
      cancelado,
      total,
      porcentajeEntregado,
    };
  }, [shipments]);

  const metricCards: MetricCard[] = [
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
          <div
            key={index}
            className={`${card.bgColor} rounded-lg p-6 shadow-sm border-l-4 border-gray-200 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className={`text-sm font-medium ${card.textColor} mb-1`}>{card.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  {card.percentage !== undefined && (
                    <span className={`text-sm font-semibold ${card.textColor}`}>
                      ({card.percentage}%)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
