export type EnvioStatus = 'en sucursal' | 'en transito' | 'cancelado' | 'entregado';
export type EnvioType = 'normal' | 'express';
export type EnvioRestriction = 'fragil' | 'valioso' | 'ninguna';

export interface Envio {
  id: number;
  tracking_id: string;
  estado: EnvioStatus;
  fecha_creacion: string;
  creado_por_id: number;
  razon_social_destinatario: string;
  cuit_destinatario: string;
  descripcion: string;
  tipo_envio: EnvioType;
  restriccion: EnvioRestriction;
}

export interface EnvioCrear {
  razon_social_destinatario: string;
  cuit_destinatario: string;
  descripcion: string;
  tipo_envio: string;
  restriccion: string;
}

export interface HistorialEnvio {
  id: number;
  fecha: string;
  estado: EnvioStatus;
  nombre_usuario: string;
  observaciones: string | null;
}

