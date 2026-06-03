export type EnvioStatus = 'en sucursal' | 'en transito' | 'cancelado' | 'entregado';
export type EnvioType = 'normal' | 'express';
export type EnvioRestriction = 'fragil' | 'valioso' | 'ninguna';
export type EnvioPrioridad = 'baja' | 'media' | 'alta';

export interface PerfilEmpleado {
  nombre: string | null;
  apellido: string | null;
}

export interface UsuarioSimple {
  id: number;
  email: string;
  perfil_empleado?: PerfilEmpleado | null;
}

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

export interface Envio {
  id: number;
  tracking_id: string;
  estado: EnvioStatus;
  prioridad: EnvioPrioridad;
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
  tipo_envio: EnvioType;
  restriccion: EnvioRestriction;
  fecha_limite: string;
}

export interface HistorialEnvio {
  id: number;
  fecha: string;
  estado: EnvioStatus;
  empleado: UsuarioSimple;
}
