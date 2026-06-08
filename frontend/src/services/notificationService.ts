import api from './api';
import { HistorialNotificacion, PlantillaCorreo } from '@/types/notificacion';

const notificationService = {
  // Obtener todo el historial de notificaciones (Endpoint pesado)
  getHistorial: async (): Promise<HistorialNotificacion[]> => {
    const response = await api.get('/notificaciones/historial');
    return response.data;
  },

  getPlantillas: async (): Promise<PlantillaCorreo[]> => {
    const response = await api.get('/plantillas/');
    return response.data;
  },

  updatePlantilla: async (plantilla_id: number, data: PlantillaCorreo): Promise<PlantillaCorreo> => {
    const response = await api.put(`/plantillas/${plantilla_id}`, data);
    return response.data;
  }
};

export default notificationService;