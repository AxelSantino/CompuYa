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
};

export default shipmentService;

