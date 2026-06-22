import { useState, useEffect, useCallback, useMemo } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import shipmentService from '@/services/shipmentService';
import api from '@/services/api';
import { Envio } from '@/types/envio';
import toast from 'react-hot-toast';

import '@/i18n/i18n';
import { useTranslation } from 'react-i18next';

import { useErrorTranslator } from '@/hooks/useErrorTranslator';

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
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [deliveryModalConfig, setDeliveryModalConfig] = useState({
    isOpen: false,
    trackingId: '',
  });

  const isSupervisor = user?.rol === 'supervisor';

  const {t} = useTranslation();
  const { translateError } = useErrorTranslator();

  // Función auxiliar para cerrar el modal
  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

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
      toast.error(t('routesPage.seleccionar_repartidor_primero'));
      //alert("Por favor, selecciona un repartidor primero en el menú superior.");
      return;
    }
    setIsProcessing(true);
    try {
      await shipmentService.assignShipmentManually(trackingId, selectedDriverId);
      await fetchData();
      toast.success(t('routesPage.envio_asignado_correctamente'))
    } catch (error) {
      toast.error(t('routesPage.error_al_asignar_manualmente'));
      //alert("Error al asignar manualmente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignAll = () => {
    // En lugar de frenar el código con confirm(), abrimos el modal e inyectamos la lógica asíncrona
    setModalConfig({
      isOpen: true,
      title: t('routesPage.confirmar_asignacion_masiva', 'Confirmar asignación masiva'),
      message: t('routesPage.pregunta_asignacion_masiva', '¿Deseas asignar todos los envíos pendientes de forma automática?'),
      onConfirm: async () => {
        closeModal(); // Cerramos el modal inmediatamente al aceptar
        setIsProcessing(true);
        try {
          const res = await shipmentService.assignAllShipments();

          toast.success(t('routesPage.asignacion_masiva_exitosa', { count: res.asignados }));
          await fetchData();
        } catch (error) {
          toast.error(t('routesPage.error_en_la_asignacion_masiva'));
        } finally {
          setIsProcessing(false);
        }
      }
    });
  };

  const closeDeliveryModal = () => setDeliveryModalConfig({ isOpen: false, trackingId: '' });

  const handleDeliver = (trackingId: string) => {
    setDeliveryModalConfig({
      isOpen: true,
      trackingId,
    });
  };

  const handleConfirmDelivery = async (code: string) => {
    const trackingId = deliveryModalConfig.trackingId;
    closeDeliveryModal();
    setIsProcessing(true);
    try {
      await shipmentService.markAsDelivered(trackingId, code);
      await fetchData();
      toast.success(t('routesPage.envio_marcado_como_entregado_exitosamente'));
    } catch (error: unknown) {
      toast.error(translateError(error, 'routesPage.error_al_marcar_envio_entregado'));
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
    handleDeliver,
    handleConfirmDelivery,
    modalConfig,
    closeModal,
    deliveryModalConfig,
    closeDeliveryModal
  };
}