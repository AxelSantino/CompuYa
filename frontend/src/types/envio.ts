export type EnvioStatus = 'en sucursal' | 'en transito' | 'cancelado' | 'entregado';
export type EnvioType = 'normal' | 'express';
export type EnvioRestriction = 'fragil' | 'valioso' | 'ninguna';

export interface PerfilEmpleado {
  nombre: string | null;
  apellido: string | null;
}

// Represents the simple user object returned by the API
export interface UsuarioSimple {
  id: number;
  email: string;
  perfil_empleado?: PerfilEmpleado | null;
}

// Represents the recipient company object
export interface EmpresaRespuesta {
  razon_social: string;
  cuit: string;
  direccion_normalizada: string | null;
  provincia: string | null;
  municipio: string | null;
  cod_postal: string | null;
  latitud?: number;
  longitud?: number;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
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
  destinatario: EnvioRespuestaDestinatario;
  sucursal?: Sucursal;
  latitud_destino?: number;
  longitud_destino?: number;
  razon_social_destinatario?: string;
  cuit_destinatario?: string;
}

// Interfaz para el destinatario dentro de EnvioRespuesta
export interface EnvioRespuestaDestinatario {
  id: number;
  email: string;
  tipo: string;
  perfil_empresa?: EmpresaRespuesta;
  perfil_empleado?: PerfilEmpleado | null;
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
