'use client';

import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import shipmentService from '@/services/shipmentService';
import { Envio, HistorialEnvio, EnvioStatus } from '@/types/envio';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FaArrowLeft, FaBox, FaCalendar, FaUser, FaBuilding, FaFileAlt, FaShippingFast, FaExclamationCircle, FaMapMarkerAlt, FaWarehouse, FaTimesCircle, FaCheckCircle, FaEdit } from 'react-icons/fa';
import './ShipmentDetailPage.css';

const statusConfig: Record<EnvioStatus, { icon: React.ReactNode; colorClass: string }> = {
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ descripcion: '', tipo_envio: '', restriccion: '', razon_social_destinatario: '', cuit_destinatario: '' });

  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const canEdit = (user?.rol === 'operador' || user?.rol === 'supervisor') && shipment?.estado === 'en sucursal';

  const fetchData = React.useCallback(async () => {
    if (!id) return;
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
    } catch {
      setError('No se pudo cargar la información del envío.');
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const handleCancel = async () => {
    if (!id || !window.confirm('¿Estás seguro de que deseas cancelar este envío?')) return;
    
    setIsProcessing(true);
    try {
      await shipmentService.cancelShipment(id as string);
      await fetchData(); // Refresh data
      alert('Envío cancelado con éxito.');
    } catch (err) {
      const errorData = err as { response?: { data?: { detail?: string } } };
      alert(errorData.response?.data?.detail || 'Error al cancelar el envío.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditClick = () => {
    if (shipment) {
      setFormData({
        descripcion: shipment.descripcion || '',
        tipo_envio: shipment.tipo_envio || '',
        restriccion: shipment.restriccion || '',
        razon_social_destinatario: shipment.razon_social_destinatario || shipment.destinatario?.perfil_empresa?.razon_social || shipment.destinatario?.email || '',
        cuit_destinatario: shipment.cuit_destinatario || shipment.destinatario?.perfil_empresa?.cuit || ''
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => { setIsEditing(false); setError(null); };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!shipment) return;
    setIsSaving(true); setError(null);
    try {
      await shipmentService.updateShipment(shipment.tracking_id, formData);
      await fetchData();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al actualizar el envío.');
    } finally { setIsSaving(false); }
  };

  const isBusy = isLoading || isProcessing || isSaving;
  const loadingText = isProcessing ? "Cancelando envío..." : isSaving ? "Guardando cambios..." : "Cargando envío...";

  return (
    <DashboardLayout>
      <div className="relative p-4 md:p-6">
        <LoadingOverlay isLoading={isBusy} text={loadingText} />
        
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => router.back()} className="back-button">
            <FaArrowLeft /> Volver al listado
          </button>
          
          {user?.rol === 'supervisor' && shipment && shipment.estado !== 'cancelado' && shipment.estado !== 'entregado' && (
            <button 
              onClick={handleCancel} 
              className="cancel-button"
              disabled={isProcessing}
            >
              <FaTimesCircle /> Cancelar Envío
            </button>
          )}
        </div>

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
              <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                
                {/* Shipment Info Card ORIGINAL */}
                <div className="card">
                  <div className="card-header flex justify-between items-center w-full">
                    <span className="flex items-center gap-2"><FaBox /> Información del Envío</span>
                    {canEdit && !isEditing && (
                      <button type="button" onClick={handleEditClick} className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded font-medium flex items-center gap-1 transition-colors text-gray-700">
                        <FaEdit /> Editar
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="card-body space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Envío</label>
                          <Select name="tipo_envio" value={formData.tipo_envio} onChange={handleChange} disabled={isSaving} className="w-full text-gray-900 bg-white border-gray-300">
                            <option value="normal">Normal</option>
                            <option value="express">Express</option>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Manejo Especial</label>
                          <Select name="restriccion" value={formData.restriccion} onChange={handleChange} disabled={isSaving} className="w-full text-gray-900 bg-white border-gray-300">
                            <option value="ninguna">Ninguna</option>
                            <option value="fragil">Frágil</option>
                            <option value="valioso">Valioso</option>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={3} disabled={isSaving} className="w-full rounded-md border border-gray-300 p-2 text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500" required />
                      </div>
                    </div>
                  ) : (
                    <div className="card-body grid grid-cols-2 gap-6">
                      <DetailItem icon={<FaCalendar />} label="Fecha de Creación" value={new Date(shipment.fecha_creacion).toLocaleString()} />
                      <DetailItem icon={<FaUser />} label="Creado por" value={shipment.creador.perfil_empleado?.nombre ? `${shipment.creador.perfil_empleado.nombre} ${shipment.creador.perfil_empleado.apellido || ''}` : shipment.creador.email} />
                      <DetailItem icon={<FaShippingFast />} label="Tipo de Envío" value={shipment.tipo_envio} />
                      <DetailItem icon={<FaExclamationCircle />} label="Manejo Especial" value={shipment.restriccion} />
                      <div className="col-span-2">
                        <DetailItem icon={<FaFileAlt />} label="Descripción" value={shipment.descripcion} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Recipient Info Card ORIGINAL */}
                <div className="card">
                  <h2 className="card-header flex items-center gap-2"><FaBuilding /> Información del Destinatario</h2>
                  
                  {isEditing ? (
                    <div className="card-body space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Razón Social</label>
                          <Input name="razon_social_destinatario" value={formData.razon_social_destinatario} onChange={handleChange} disabled={isSaving} className="w-full text-gray-900 bg-white border-gray-300" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">CUIT / CUIL</label>
                          <Input name="cuit_destinatario" value={formData.cuit_destinatario} onChange={handleChange} disabled={isSaving} className="w-full text-gray-900 bg-white border-gray-300" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card-body grid grid-cols-2 gap-6">
                      <DetailItem label="Razón Social / Nombre" value={shipment.razon_social_destinatario || shipment.destinatario.perfil_empresa?.razon_social || shipment.destinatario.email} />
                      <DetailItem label="CUIT/CUIL" value={shipment.cuit_destinatario || shipment.destinatario.perfil_empresa?.cuit || 'N/A'} />
                      <div className="col-span-2">
                        <DetailItem icon={<FaMapMarkerAlt/>} label="Dirección" value={`${shipment.destinatario.perfil_empresa?.direccion_normalizada || ''}, ${shipment.destinatario.perfil_empresa?.municipio || ''}, ${shipment.destinatario.perfil_empresa?.provincia || ''} (${shipment.destinatario.perfil_empresa?.cod_postal || ''})`.replace(/^, , \(\)$/, 'Dirección no especificada en el perfil')} />
                      </div>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3">
                    <Button variant="secondary" type="button" onClick={handleCancelEdit} disabled={isSaving}>Cancelar Edición</Button>
                    <Button variant="primary" type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Todos Los Cambios'}</Button>
                  </div>
                )}
              </form>

              {/* Audit Card ORIGINAL (Supervisor only) */}
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
                            <p className="text-xs text-gray-500">Operador: {item.empleado.perfil_empleado?.nombre ? `${item.empleado.perfil_empleado.nombre} ${item.empleado.perfil_empleado.apellido || ''}` : item.empleado.email}</p>
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