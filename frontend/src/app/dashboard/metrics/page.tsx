'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import shipmentService from '@/services/shipmentService';
import { Envio } from '@/types/envio';
import ShipmentMetrics from '@/app/dashboard/metrics/ShipmentMetrics';
import LoadingOverlay from '@/components/LoadingOverlay';
import { DateFilterParams } from '@/types/metrics';

const MetricsPage = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Envio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fechaInicio, setFechaInicio] = useState('2026-05-01');
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

  const dateFilters: DateFilterParams = {
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  };

  useEffect(() => {
    let isMounted = true;

    const loadShipments = async () => {
      if (!user) {
        return;
      }

      if (user.rol !== 'admin') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await shipmentService.getShipments();
        if (isMounted) {
          setShipments(data);
          setError(null);
        }
      } catch {
        if (isMounted) {
          setError('Error al cargar las métricas. Por favor, intenta de nuevo más tarde.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadShipments();

    return () => {
      isMounted = false;
    };
  }, [user, fechaInicio, fechaFin]);

  return (
    <DashboardLayout>
      <div className="relative bg-white p-4 md:p-6 rounded-lg shadow-md">
        <LoadingOverlay isLoading={isLoading} text="Cargando métricas..." />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-orange-700">
          <div>
            <h2 className="text-2xl font-bold mb-1">Métricas de Envíos</h2>
            <p className="text-gray-600">
              Indicadores de prioridad, estado de envíos y cancelaciones.
            </p>
          </div>
        </div>

        {/* Panel de Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col w-full sm:w-auto">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Desde</label>
              <input 
                type="date" 
                value={fechaInicio} 
                onChange={(e) => setFechaInicio(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-700 w-full"
              />
            </div>
            <span className="text-gray-300 hidden sm:inline mt-4 font-bold">-</span>
            <div className="flex flex-col w-full sm:w-auto">
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Hasta</label>
              <input 
                type="date" 
                value={fechaFin} 
                onChange={(e) => setFechaFin(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-700 w-full"
              />
            </div>
        </div>

        {user?.rol !== 'admin' ? (
          <div className="py-16 text-center text-gray-700">
            <p className="text-lg font-semibold">Acceso denegado</p>
            <p className="mt-2 text-sm text-gray-500">Solo los administradores pueden ver las métricas.</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : (
          <ShipmentMetrics shipments={shipments} isLoading={isLoading} filters={dateFilters} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default withAuth(MetricsPage);
