'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import shipmentService from '@/services/shipmentService';
import api from '@/services/api';
import { Envio } from '@/types/envio';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingOverlay from '@/components/LoadingOverlay';
import dynamic from 'next/dynamic';
import { FaRoute, FaMagic, FaTruck, FaMapMarkerAlt, FaWarehouse, FaSync, FaUserTie } from 'react-icons/fa';
import './RoutesPage.css';
import { AccessDenied } from '@/components/ui/AccessDenied';
import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

const {t} = useTranslation();

const MapHojaRuta = dynamic(() => import('@/components/MapHojaRuta'), { 
  ssr: false,
  loading: () => <div className="w-full h-[500px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Cargando mapa de ruta...</div>
});

const PRIORITY_TAG_CLASSES: Record<string, string> = {
  'alta': 'bg-orange-100 text-orange-700 border-orange-200',
  'media': 'bg-blue-100 text-blue-700 border-blue-200',
  'baja': 'bg-green-100 text-green-700 border-green-200',
};

interface Repartidor {
  id: number;
  email: string;
  perfil_empleado: {
    nombre: string;
    apellido: string;
  } | null;
}

export default function RoutesPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Envio[]>([]);
  const [route, setRoute] = useState<Envio[]>([]);
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const isSupervisor = user?.rol === 'supervisor';
  const isDriver = user?.rol === 'repartidor'
  const isAuthorized = isSupervisor || isDriver

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupervisor) {
        const [allShipments, driversListResponse] = await Promise.all([
          shipmentService.getShipments(),
          api.get<Repartidor[]>('/usuarios/repartidores')
        ]);
        setShipments(allShipments.filter(s => s.estado === 'en sucursal'));
        setRepartidores(driversListResponse.data);
      }
      
      if (isDriver) {
        const myRoute = await shipmentService.getDriverRoute();
        setRoute(myRoute);
      }
    } catch {
      // Error manejado silenciosamente para no interrumpir el flujo
    } finally {
      setIsLoading(false);
    }
  }, [isSupervisor, isDriver]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const loadDriverRoute = useCallback(async (driverId: number) => {
    setIsLoading(true);
    try {
      const driverRoute = await shipmentService.getRouteByDriverId(driverId);
      setRoute(driverRoute);
    } catch {
      // Error manejado
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const updateRoute = async () => {
      if (isSupervisor && selectedDriverId) {
        if (isMounted) {
          await loadDriverRoute(selectedDriverId);
        }
      } else if (isSupervisor && !selectedDriverId) {
        setRoute([]);
      }
    };

    updateRoute();

    return () => {
      isMounted = false;
    };
  }, [selectedDriverId, isSupervisor, loadDriverRoute]);

  const handleManualAssign = async (trackingId: string) => {
    if (!selectedDriverId) {
      alert("Por favor, selecciona un repartidor primero en el menú superior.");
      return;
    }
    setIsProcessing(true);
    try {
      await shipmentService.assignShipmentManually(trackingId, selectedDriverId);
      await fetchData();
    } catch {
      alert("Error al asignar manualmente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignAll = async () => {
    if (!confirm("¿Deseas asignar todos los envíos pendientes de forma automática?")) return;
    setIsProcessing(true);
    try {
      const res = await shipmentService.assignAllShipments();
      alert(res.message);
      await fetchData();
    } catch {
      alert("Error en la asignación masiva.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeliver = async (trackingId: string) => {
    if (!confirm(`¿Confirmas que el envío ${trackingId} ha sido entregado?`)) return;
    setIsProcessing(true);
    try {
      await shipmentService.markAsDelivered(trackingId);
      await fetchData();
    } catch {
      alert("Error al marcar como entregado.");
    } finally {
      setIsProcessing(false);
    }
  };

  const mapPoints = React.useMemo(() => {
    if (route.length === 0) return [];
    
    return [
      { 
        lat: route[0].sucursal?.latitud || -34.6037, 
        lng: route[0].sucursal?.longitud || -58.3816, 
        nombre: route[0].sucursal?.nombre || 'Sucursal Origen',
        isSucursal: true
      },
      ...route.map(e => ({
        lat: e.latitud_destino || 0,
        lng: e.longitud_destino || 0,
        nombre: e.destinatario.perfil_empresa?.razon_social || e.tracking_id
      }))
    ];
  }, [route]);

  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <AccessDenied mensaje="Solo el personal logístico y repartidores tienen acceso al Centro de Control Logístico." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="routes-container p-4 md:p-6">
        <LoadingOverlay isLoading={isLoading || isProcessing} text="Actualizando logística..." />
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <FaRoute className="text-blue-600" /> {t('routesPage.centro_de_control')}
            </h1>
            <p className="text-gray-500 mt-1">{t('routesPage.gestion_de_asignaciones')}</p>
          </div>
          {(isSupervisor && shipments.length > 0) ? (
            <button 
              onClick={handleAssignAll}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <FaSync className={isProcessing ? "animate-spin" : ""} /> {t('routesPage.asignar_todo')} ({shipments.length})
            </button>
          ) : null}
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* SECCIÓN SUPERVISOR: ASIGNACIÓN */}
          {isSupervisor ? (
            <div className="xl:col-span-1 space-y-6">
              {/* Filtro de Repartidor */}
              <div className="card bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-xl">
                <div className="card-header border-gray-700 bg-transparent">
                  <h2 className="text-black flex items-center gap-2"><FaUserTie className="text-blue-400" /> {t('routesPage.monitoreo_por_repartidor')}</h2>
                </div>
                <div className="card-body">
                  <select 
                    className="w-full bg-gray-700 text-white border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={selectedDriverId || ''}
                    onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">{t('routesPage.seleccionar_repartidor_para_ver_ruta')}.</option>
                    {repartidores.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.perfil_empleado?.nombre} {r.perfil_empleado?.apellido} ({r.email})
                      </option>
                    ))}
                  </select>
                  {selectedDriverId ? (
                    <button 
                      onClick={() => setSelectedDriverId(null)}
                      className="mt-3 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      × Limpiar filtro / Ver pendientes
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="card h-full">
                <div className="card-header flex items-center justify-between">
                  <h2 className="flex items-center gap-2"><FaMagic /> {t('routesPage.envios_en_sucursal')}</h2>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                    {shipments.length} {t('routesPage.pendientes')}
                  </span>
                </div>
                <div className="card-body overflow-y-auto max-h-[400px] p-0">
                  {shipments.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">
                      <FaWarehouse className="text-4xl mx-auto mb-3 opacity-20" />
                      <p>{t('routesPage.no_hay_envios_pendientes')}</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {shipments.map(s => (
                        <li key={s.id} className="p-4 hover:bg-gray-50 transition-colors group">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-800">{s.tracking_id}</p>
                                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border font-bold ${PRIORITY_TAG_CLASSES[s.prioridad] || 'bg-gray-100 text-gray-600'}`}>
                                  {s.prioridad}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 truncate max-w-[150px]">{s.destinatario.perfil_empresa?.razon_social}</p>
                            </div>
                            <button 
                              onClick={() => handleManualAssign(s.tracking_id)}
                              className="btn-assign group-hover:scale-105 transition-transform"
                            >
                              <FaMagic /> {t('routesPage.faMagic_asignar')}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* SECCIÓN REPARTIDOR: MAPA Y HOJA DE RUTA */}
          <div className={isSupervisor ? "xl:col-span-2" : "xl:col-span-3"}>
            <div className="space-y-6">
              {route.length > 0 ? (
                <>
                  <div className="card">
                    <div className="card-header flex items-center justify-between bg-green-50 text-green-800 border-b border-green-100">
                      <h2 className="flex items-center gap-2">
                        <FaTruck /> {selectedDriverId ? t('routesPage.visualizando_recorrido_del_repartidor') : t('routesPage.mi_hoja_de_ruta_optimizada')}
                      </h2>
                      <span className="text-xs font-medium">{t('routesPage.orden_eficiente_sugerido')}</span>
                    </div>
                    <div className="card-body p-0">
                      <MapHojaRuta puntos={mapPoints} />
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header bg-gray-50">
                      <h2 className="text-gray-700">{t('routesPage.orden_de_entrega')}</h2>
                    </div>
                    <div className="card-body p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-gray-100">
                        {route.map((e, index) => (
                          <div key={e.id} className="p-4 flex items-start justify-between gap-4 group">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                                {index + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-800 text-sm">{e.tracking_id}</p>
                                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border font-bold ${PRIORITY_TAG_CLASSES[e.prioridad] || 'bg-gray-100 text-gray-600'}`}>
                                    {e.prioridad}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <FaMapMarkerAlt /> {e.destinatario.perfil_empresa?.razon_social}
                                </p>
                              </div>
                            </div>
                            
                            {/* Botón entregado solo si es el propio repartidor */}
                            {(!selectedDriverId && (user?.rol === 'repartidor' || user?.rol === 'operador')) ? (
                              <button 
                                onClick={() => handleDeliver(e.tracking_id)}
                                className="btn-deliver self-center"
                                disabled={isProcessing}
                                title="Marcar como entregado"
                              >
                                <FaTruck /> {t('routesPage.faTruck_entregado')}
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="card p-20 text-center text-gray-400 bg-gray-50 border-dashed border-2 border-gray-200">
                  <FaRoute className="text-6xl mx-auto mb-4 opacity-75" />
                  <h3 className="text-xl font-medium text-gray-500">
                    {selectedDriverId ? t('routesPage.este_repartidor_no_tiene_entregas') : t('routesPage.sin_recorrido_asignado')}
                  </h3>
                  <p className="mt-2 text-sm">
                    {isSupervisor && !selectedDriverId ? t('routesPage.selecciona_un_repartidor') : t('routesPage.entregas_apareceran_aqui')}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
