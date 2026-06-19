import { useState, useEffect, useCallback, useMemo } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import shipmentService from '@/services/shipmentService';
import api from '@/services/api';
import { Envio } from '@/types/envio';

export interface Repartidor {
  id: number;
  email: string;
  perfil_empleado: {
    nombre: string;
    apellido: string;
  } | null;
}

export function useRouteManagement() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Envio[]>([]);
  const [route, setRoute] = useState<Envio[]>([]);
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const isSupervisor = user?.rol === 'supervisor';

  // Carga inicial de datos según el rol
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
      } else if (user?.rol === 'repartidor') {
        const myRoute = await shipmentService.getDriverRoute();
        setRoute(myRoute);
      }
    } catch (error) {
      console.error("Error al obtener los datos de la ruta:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isSupervisor, user?.rol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Carga de ruta específica (Solo para Supervisor)
  const loadDriverRoute = useCallback(async (driverId: number) => {
    setIsLoading(true);
    try {
      const driverRoute = await shipmentService.getRouteByDriverId(driverId);
      setRoute(driverRoute);
    } catch (error) {
      console.error("Error al cargar ruta del repartidor:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSupervisor) {
      if (selectedDriverId) {
        loadDriverRoute(selectedDriverId);
      } else {
        setRoute([]); // Limpia la ruta si deselecciona al repartidor
      }
    }
  }, [selectedDriverId, isSupervisor, loadDriverRoute]);

  // Funciones de acción (Handlers)
  const handleManualAssign = async (trackingId: string) => {
    if (!selectedDriverId) {
      alert("Por favor, selecciona un repartidor primero en el menú superior.");
      return;
    }
    setIsProcessing(true);
    try {
      await shipmentService.assignShipmentManually(trackingId, selectedDriverId);
      await fetchData();
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      alert("Error al marcar como entregado.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Transformación de datos para la vista (Movido aquí para limpiar el componente UI)
  const mapPoints = useMemo(() => {
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

  return {
    user,
    isSupervisor,
    shipments,
    route,
    repartidores,
    selectedDriverId,
    setSelectedDriverId,
    isLoading,
    isProcessing,
    mapPoints,
    handleManualAssign,
    handleAssignAll,
    handleDeliver
  };
}