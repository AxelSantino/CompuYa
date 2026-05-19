// CompuYa/frontend/src/app/dashboard/shipments/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import shipmentService from '@/services/shipmentService';
import { Envio, HistorialEnvio, EnvioStatus } from '@/types/envio';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { FaArrowLeft, FaBox, FaCalendar, FaUser, FaBuilding, FaFileAlt, FaShippingFast, FaExclamationCircle, FaMapMarkerAlt, FaWarehouse, FaHome, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import './ShipmentDetailPage.css';

const statusConfig: Record<EnvioStatus, { icon: JSX.Element; colorClass: string }> = {
  'en sucursal': { icon: <FaWarehouse />, colorClass: 'status-icon-blue' },
  'en transito': { icon: <FaShippingFast />, colorClass: 'status-icon-orange' },
  'entregado': { icon: <FaCheckCircle />, colorClass: 'status-icon-green' },
  'cancelado': { icon: <FaTimesCircle />, colorClass: 'status-icon-red' },
};

const DetailItem = React.memo(({ icon, label, value }: { icon?: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div>
    <h3 className="text-xs text-gray-500 flex items-center gap-2">
      {icon && <span className="text-gray-400">{icon}</span>}
      {label}
    </h3>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
));

DetailItem.displayName = 'DetailItem';

export default function ShipmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();

  const [shipment, setShipment] = useState<Envio | null>(null);
  const [history, setHistory] = useState<HistorialEnvio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const promises: [Promise<Envio>, Promise<HistorialEnvio[]> | null] = [
          shipmentService.getShipmentById(id as string),
          user?.rol === 'supervisor' ? shipmentService.getShipmentHistory(id as string) : null
        ];

        const [shipmentData, historyData] = await Promise.all(promises);
        
        setShipment(shipmentData);
        if (historyData) {
          setHistory(historyData);
        }
      } catch (err) {
        setError('No se pudo cargar la información del envío.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  return (
    <DashboardLayout>
      <div className="relative p-4 md:p-6">
        <LoadingOverlay isLoading={isLoading} text="Cargando envío..." />
        
        <button onClick={() => router.back()} className="back-button mb-4">
          <FaArrowLeft /> Volver al listado
        </button>

        {shipment && (
          <>
            <header className="shipment-header mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{shipment.tracking_id}</h1>
                <p className="text-sm text-gray-500">ID Interno: #{shipment.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="status-badge-lg">{shipment.estado}</span>
                {shipment.restriccion !== 'ninguna' && <span className="priority-badge-lg">Prioridad Alta</span>}
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Shipment Info Card */}
                <div className="card">
                  <h2 className="card-header"><FaBox /> Información del Envío</h2>
                  <div className="card-body grid grid-cols-2 gap-6">
                    <DetailItem icon={<FaCalendar />} label="Fecha de Creación" value={new Date(shipment.fecha_creacion).toLocaleString()} />
                    <DetailItem icon={<FaUser />} label="Creado por" value={`${shipment.creador.nombre} ${shipment.creador.apellido || ''}`} />
                    <DetailItem icon={<FaShippingFast />} label="Tipo de Envío" value={shipment.tipo_envio} />
                    <DetailItem icon={<FaExclamationCircle />} label="Manejo Especial" value={shipment.restriccion} />
                    <div className="col-span-2">
                      <DetailItem icon={<FaFileAlt />} label="Descripción" value={shipment.descripcion} />
                    </div>
                  </div>
                </div>

                {/* Recipient Info Card */}
                <div className="card">
                  <h2 className="card-header"><FaBuilding /> Información del Destinatario</h2>
                  <div className="card-body grid grid-cols-2 gap-6">
                    <DetailItem label="Razón Social / Nombre" value={shipment.destinatario.razon_social} />
                    <DetailItem label="CUIT/CUIL" value={shipment.destinatario.cuit} />
                    <div className="col-span-2">
                       <DetailItem icon={<FaMapMarkerAlt/>} label="Dirección" value={`${shipment.destinatario.direccion_normalizada}, ${shipment.destinatario.municipio}, ${shipment.destinatario.provincia} (${shipment.destinatario.cod_postal})`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit Card (Supervisor only) */}
              {user?.rol === 'supervisor' && history.length > 0 && (
                <div className="card">
                  <h2 className="card-header">Auditoría de Estados</h2>
                  <div className="card-body audit-timeline">
                    {history.map(item => {
                      const config = statusConfig[item.estado] || { icon: <FaBox />, colorClass: 'status-icon-gray' };
                      return (
                        <div key={item.id} className="audit-item">
                          <div className={`audit-icon ${config.colorClass}`}>{config.icon}</div>
                          <div className="audit-content">
                            <p className="font-bold capitalize">{item.estado}</p>
                            <p className="text-xs text-gray-500">{new Date(item.fecha).toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Operador: {`${item.empleado.nombre} ${item.empleado.apellido || ''}`}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {error && !isLoading && <div className="text-center py-10 text-red-500">{error}</div>}
      </div>
    </DashboardLayout>
  );
}
