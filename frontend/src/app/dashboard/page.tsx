'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import withAuth from '@/components/auth/withAuth';
import shipmentService from '@/services/shipmentService';
import { Envio, EnvioStatus } from '@/types/envio';
import { useRouter } from 'next/navigation';
import LoadingOverlay from '@/components/LoadingOverlay';
import Link from 'next/link';

const STATUS_CLASSES: Record<EnvioStatus, string> = {
  'en sucursal': 'bg-red-100 text-red-800',
  'en transito': 'bg-yellow-100 text-yellow-800',
  'entregado': 'bg-green-100 text-green-800',
  'cancelado': 'bg-gray-100 text-gray-800',
};

const StatusBadge = React.memo(({ status }: { status: EnvioStatus }) => {
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        STATUS_CLASSES[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

const ShipmentsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Envio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnvioStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Route guard for 'repartidor'
  useEffect(() => {
    if (user && user.rol === 'repartidor') {
      router.replace('/dashboard/routes');
    }
  }, [user, router]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      // Don't fetch data if the user is a repartidor, as they will be redirected
      if (user && user.rol !== 'repartidor') {
        try {
          const data = await shipmentService.getShipments();
          if (isMounted) {
            setShipments(data);
          }
        } catch {
          if (isMounted) {
            setError('Error al cargar los envíos. Por favor, intenta de nuevo más tarde.');
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else if (!user) {
          // Still loading user, do nothing yet
      } else {
          // Is a repartidor, will be redirected.
          if (isMounted) {
            setIsLoading(false);
          }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      const matchesSearch = shipment.tracking_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || shipment.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchTerm, statusFilter]);

  // Render a loading state or nothing while redirecting
  if (!user || user.rol === 'repartidor') {
    return (
      <DashboardLayout>
        <LoadingOverlay isLoading={true} text="Verificando permisos..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="relative bg-white p-4 md:p-6 rounded-lg shadow-md">
        <LoadingOverlay isLoading={isLoading} text="Cargando envíos..." />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Gestión de Envíos</h2>
            <p className="text-gray-600">
              Lista y administración de componentes de computadora en tránsito.
            </p>
          </div>
          {user && user.rol !== 'cliente' && (
            <Button
              variant="primary"
              className="w-full md:w-auto"
              onClick={() => router.push('/dashboard/new')}
            >
              + Nuevo Envío
            </Button>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Buscar por Tracking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-auto">
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as EnvioStatus | '')}
              className="w-full md:w-40"
            >
              <option value="">Todos los estados</option>
              <option value="en sucursal">En Sucursal</option>
              <option value="en transito">En Tránsito</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </div>
        </div>

        {error && <div className="py-8 text-center text-red-500">{error}</div>}
        
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.tracking_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                      <Link href={`/dashboard/shipments/${shipment.tracking_id}`} className="hover:underline">
                        {shipment.tracking_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-xs">{new Date(shipment.fecha_creacion).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{shipment.razon_social_destinatario}</div>
                      <div className="text-xs text-gray-500">CUIT: {shipment.cuit_destinatario}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{shipment.descripcion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{shipment.tipo_envio}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={shipment.estado} />
                    </td>
                  </tr>
                ))}
                {filteredShipments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      No se encontraron envíos con los criterios seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default withAuth(ShipmentsPage);
