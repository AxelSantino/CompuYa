import api from './api';

const metricsService = {
  getShipmentVolumeReport: async (): Promise<[]> => {
    const response = await api.get('/reportes/volumen');
    return response.data;
  },

  getIncidentsReport: async (): Promise<[]> => {
    const response = await api.get('/reportes/volumen');
    return response.data;
  },
};

export default metricsService;