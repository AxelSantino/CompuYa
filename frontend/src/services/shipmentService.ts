import api from './api';
import { Envio, EnvioCrear, HistorialEnvio, EnvioRespuestaDestinatario } from '@/types/envio';
import { ValidationResponse, ConfirmImportResponse } from '@/types/importacion';

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

  assignShipmentManually: async (id: string, id_repartidor: number): Promise<{ message: string }> => {
    const response = await api.post(`/envios/${id}/asignar-manual?id_repartidor=${id_repartidor}`);
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
  
  updateShipment: async (tracking_id: string, shipmentData: any): Promise<Envio> => {
    const response = await api.put(`/envios/${tracking_id}`, shipmentData);
    return response.data;
  },

  cancelShipment: async (tracking_id: string, motivo: string): Promise<Envio> => {
    const response = await api.post(`/envios/${tracking_id}/cancelar`, {motivo});
    return response.data;
  },

  markAsDelivered: async (id: string, codigo_ingresado: string): Promise<Envio> => {
    const response = await api.post(`/envios/${id}/entregar`, { codigo_ingresado });
    return response.data;
  },

  getRecipientByRazonSocial: async (razon_social: string): Promise<EnvioRespuestaDestinatario> => {
    const response = await api.get(`/usuarios/buscar_destinatario?razon_social=${razon_social}`);
    return response.data;
  },

  validateCsvImport: async (file: File): Promise<ValidationResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/envios/importar/validar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  confirmCsvImport: async (file: File): Promise<ConfirmImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/envios/importar/confirmar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default shipmentService;

