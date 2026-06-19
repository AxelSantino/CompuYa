import api from './api';
import { IncidentReport, DateFilterParams, DeliveredLate, DeliveredOnTime } from '@/types/metrics';

const metricsService = {
  getIncidents: async (filters?: DateFilterParams): Promise<IncidentReport> => {
    const params = new URLSearchParams();

    if (filters?.fecha_inicio) {
      params.append('fecha_inicio', filters.fecha_inicio);
    }
    if (filters?.fecha_fin) {
      params.append('fecha_fin', filters.fecha_fin);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await api.get(`/reportes/incidencias${queryString}`);
    return response.data;
  },

  getDeliveredOnTime: async(filters?: DateFilterParams) : Promise<DeliveredOnTime> => {
    const params = new URLSearchParams();

        if (filters?.fecha_inicio) {
      params.append('fecha_inicio', filters.fecha_inicio);
    }
    if (filters?.fecha_fin) {
      params.append('fecha_fin', filters.fecha_fin);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';

    const response = await api.get(`/reportes/tasa-entregas-a-tiempo${queryString}`);

    return response.data;
  },

    getDeliveredLate: async(filters?: DateFilterParams) : Promise<DeliveredLate> => {
    const params = new URLSearchParams();

        if (filters?.fecha_inicio) {
      params.append('fecha_inicio', filters.fecha_inicio);
    }
    if (filters?.fecha_fin) {
      params.append('fecha_fin', filters.fecha_fin);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';

    const response = await api.get(`/reportes/tasa-entregas-con-demora${queryString}`);

    return response.data;
  },

  exportStatesCsv: async (filters?: DateFilterParams): Promise<Blob> => {
    const response = await api.get('/reportes/exportar/estados', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  exportPrioritiesCsv: async (filters?: DateFilterParams): Promise<Blob> => {
    const response = await api.get('/reportes/exportar/prioridades', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  exportCancelationReasonsCsv: async (filters?: DateFilterParams): Promise<Blob> => {
    const response = await api.get('/reportes/exportar/motivos-cancelacion', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

};

export default metricsService;