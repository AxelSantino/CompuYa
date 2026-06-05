'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/contexts/AuthContext';
import shipmentService from '@/services/shipmentService';
import { Envio } from '@/types/envio';
import ShipmentMetrics from '@/components/metrics/ShipmentMetrics';
import LoadingOverlay from '@/components/LoadingOverlay';

const MetricsPage = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Envio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const data = await shipmentService.getShipments();
        if (isMounted) {
          setShipments(data);
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
  }, [user]);

  return (
    <DashboardLayout>
      <div className="relative bg-white p-4 md:p-6 rounded-lg shadow-md">
        <LoadingOverlay isLoading={isLoading} text="Cargando métricas..." />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-orange-700">
          <div>
            <h2 className="text-2xl font-bold mb-1">Métricas de Envíos</h2>
            <p className="text-gray-600">
              Indicadores de prioridad y estado para los envíos registrados en el sistema.
            </p>
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
          <ShipmentMetrics shipments={shipments} isLoading={isLoading} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default withAuth(MetricsPage);
