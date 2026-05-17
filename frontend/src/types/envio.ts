export type EnvioStatus = 'en sucursal' | 'en transito' | 'cancelado' | 'entregado';
export type EnvioType = 'normal' | 'express';
export type EnvioRestriction = 'fragil' | 'valioso' | 'ninguna';

// Represents the simple user object returned by the API
export interface UsuarioSimple {
  id: number;
  nombre: string | null;
  apellido: string | null;
  email: string;
}

// Represents the recipient company object
export interface EmpresaRespuesta {
  razon_social: string;
  cuit: string;
  direccion_normalizada: string | null;
  provincia: string | null;
  municipio: string | null;
  cod_postal: string | null;
}

// Main Shipment object, updated with nested creator and recipient
export interface Envio {
  id: number;
  tracking_id: string;
  estado: EnvioStatus;
  fecha_creacion: string;
  descripcion: string;
  tipo_envio: EnvioType;
  restriccion: EnvioRestriction;
  creador: UsuarioSimple;
  destinatario: EmpresaRespuesta;
}

export interface EnvioCrear {
  razon_social_destinatario: string;
  cuit_destinatario: string;
  descripcion: string;
  tipo_envio: string;
  restriccion: string;
}

// Shipment history object, updated with nested user
export interface HistorialEnvio {
  id: number;
  fecha: string;
  estado: EnvioStatus;
  empleado: UsuarioSimple;
}
