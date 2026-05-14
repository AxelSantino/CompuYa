import api from './api';
import { Envio, EnvioCrear } from '@/types/envio';

const shipmentService = {
  getShipments: async (): Promise<Envio[]> => {
    const response = await api.get('/envios/');
    return response.data;
  },
  
  createShipment: async (shipmentData: EnvioCrear): Promise<Envio> => {
    const response = await api.post('/envios/', shipmentData);
    return response.data;
  },
};

export default shipmentService;
