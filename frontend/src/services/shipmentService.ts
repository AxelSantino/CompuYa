import api from './api';
import { Envio, EnvioCrear, HistorialEnvio } from '@/types/envio';

const shipmentService = {
  getShipments: async (): Promise<Envio[]> => {
    const response = await api.get('/envios/');
    return response.data;
  },
  
  createShipment: async (shipmentData: EnvioCrear): Promise<Envio> => {
    const response = await api.post('/envios/', shipmentData);
    return response.data;
  },

  getShipmentById: async (id: string): Promise<Envio> => {
    const response = await api.get(`/envios/${id}`);
    return response.data;
  },

  getShipmentHistory: async (id: string): Promise<HistorialEnvio[]> => {
    const response = await api.get(`/envios/${id}/historial`);
    return response.data;
  },

  assignShipmentAutomatically: async (id: string): Promise<{ message: string }> => {
    const response = await api.post(`/envios/${id}/asignar-automatico`);
    return response.data;
  },

  assignAllShipments: async (): Promise<{ message: string; asignados: number }> => {
    const response = await api.post('/envios/asignar-todos');
    return response.data;
  },

  getDriverRoute: async (): Promise<Envio[]> => {
    const response = await api.get('/envios/hoja-ruta/mi-recorrido');
    return response.data;
  },

  getRouteByDriverId: async (driverId: number): Promise<Envio[]> => {
    const response = await api.get(`/envios/hoja-ruta/repartidor/${driverId}`);
    return response.data;
  },
};

export default shipmentService;

