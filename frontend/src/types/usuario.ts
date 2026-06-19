export interface PerfilEmpleado {
  nombre: string | null;
  apellido: string | null;
}

export interface PerfilEmpresa {
  razon_social: string;
  cuit: string;
  direccion_normalizada: string | null;
  provincia: string | null;
  municipio: string | null;
  cod_postal: string | null;
  latitud?: number;
  longitud?: number;
}

export interface Usuario {
  id: number;
  supabase_id: string;
  email: string;
  tipo: 'empleado' | 'empresa'; 
  rol: string;
  fecha: string;
  activo: boolean;
  perfil_empleado?: PerfilEmpleado | null;
  perfil_empresa?: PerfilEmpresa | null;
}

export interface UsuarioSimple {
  id: number;
  email: string;
  perfil_empleado?: PerfilEmpleado | null;
}

export interface RegistroEmpleado {
  email: string;
  tipo: 'empleado';
  rol: string;
  fecha: string;
  password?: string;
  nombre: string;
  apellido: string;
}

export interface RegistroEmpresa {
  email: string;
  tipo: 'empresa';
  rol: 'cliente';
  fecha: string;
  password?: string;
  razon_social: string;
  latitud?: number;
  longitud?: number;
  cuit: string;
  direccion_normalizada: string;
  provincia: string;
  municipio: string;
  cod_postal: string;
}