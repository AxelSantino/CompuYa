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
  perfil_empleado?: PerfilEmpleado | null;
  perfil_empresa?: PerfilEmpresa | null;
}

export interface UsuarioSimple {
  id: number;
  email: string;
  perfil_empleado?: PerfilEmpleado | null;
}