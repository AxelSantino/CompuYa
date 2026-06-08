export interface HistorialNotificacion {
  id: number;
  envio_id: number;
  destinatario_email: string;
  asunto_enviado: string;
  cuerpo_enviado: string;
  resultado: string;
  canal: string;
  motivo_error: string | null;
  fecha_envio: string;
}

export interface PlantillaCorreo {
  id: number;
  estado_disparador: string;
  asunto: string;
  cuerpo: string;
  activa: boolean;
}