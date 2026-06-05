from pydantic import BaseModel, EmailStr, ConfigDict, Field
from datetime import date, datetime
from typing import List, Optional, Union, Dict
from uuid import UUID
from app.models.entidades import TipoEnvio, RestriccionEnvio, EstadoEnvio, TipoCliente, PrioridadEnvio

# --- ESQUEMAS DE PERFIL ---

class PerfilEmpleadoSchema(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class PerfilEmpresaSchema(BaseModel):
    razon_social: Optional[str] = None
    cuit: Optional[str] = None
    direccion_normalizada: Optional[str] = None
    latitud: float
    longitud: float
    provincia: Optional[str] = None
    municipio: Optional[str] = None
    cod_postal: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMAS DE USUARIO ---

class UsuarioBase(BaseModel):
    email: EmailStr
    tipo: TipoCliente
    rol: str = "visor"
    fecha: Optional[date] = Field(default_factory=date.today)

class UsuarioRegistroEmpleado(UsuarioBase):
    password: str = Field(min_length=6)
    nombre: str
    apellido: str

class UsuarioRegistroEmpresa(UsuarioBase):
    password: str = Field(min_length=6)
    razon_social: str
    latitud: float
    longitud: float
    cuit: str
    direccion_normalizada: str
    provincia: Optional[str] = None
    municipio: Optional[str] = None
    cod_postal: Optional[str] = None

class UsuarioCrearEmpleado(UsuarioBase):
    supabase_id: Union[str, UUID]
    nombre: str
    apellido: str

class UsuarioCrearEmpresa(UsuarioBase):
    supabase_id: Union[str, UUID]
    razon_social: str
    latitud: float
    longitud: float
    cuit: str
    direccion_normalizada: str
    provincia: Optional[str] = None
    municipio: Optional[str] = None
    cod_postal: Optional[str] = None

class UsuarioRespuesta(UsuarioBase):
    id: int
    supabase_id: Union[str, UUID]
    perfil_empleado: Optional[PerfilEmpleadoSchema] = None
    perfil_empresa: Optional[PerfilEmpresaSchema] = None
    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMAS DE ENVÍO Y RUTEO ---

class SucursalRespuesta(BaseModel):
    id: int
    nombre: str
    direccion: str
    latitud: float
    longitud: float
    model_config = ConfigDict(from_attributes=True)

class EnvioBase(BaseModel):
    razon_social_destinatario: str
    cuit_destinatario: str
    descripcion: str
    tipo_envio: TipoEnvio
    restriccion: RestriccionEnvio
    
class EnvioCrear(EnvioBase):
    pass

class EditarEnvio(BaseModel):
    razon_social_destinatario: Optional[str] = None
    cuit_destinatario: Optional[str] = None
    descripcion: Optional[str] = None
    tipo_envio: Optional[TipoEnvio] = None
    restriccion: Optional[RestriccionEnvio] = None
    
class HistorialBase(BaseModel):
    envio_id: int
    id_empleado: int
    estado: EstadoEnvio
    fecha: datetime

class UsuarioSimple(BaseModel):
    id: int
    email: EmailStr
    perfil_empleado: Optional[PerfilEmpleadoSchema] = None
    model_config = ConfigDict(from_attributes=True)
    
class HistorialRespuesta(BaseModel):
    id: int
    estado: EstadoEnvio
    fecha: datetime
    empleado: UsuarioSimple
    model_config = ConfigDict(from_attributes=True)

class CancelarEnvio(BaseModel):
    motivo: str

class EmpresaRespuesta(BaseModel):
    razon_social: str
    cuit: Optional[str] = None
    direccion_normalizada: Optional[str] = None
    latitud: float
    longitud: float
    provincia: Optional[str] = None
    municipio: Optional[str] = None
    cod_postal: Optional[str] = None
    fecha: Optional[date] = None
    model_config = ConfigDict(from_attributes=True)
    
class EnvioRespuesta(EnvioBase):
    id: int
    tracking_id: str
    estado: EstadoEnvio
    prioridad: PrioridadEnvio
    fecha_creacion: datetime
    creador: UsuarioSimple
    destinatario: UsuarioRespuesta 
    sucursal: Optional[SucursalRespuesta] = None
    latitud_destino: Optional[float] = None
    longitud_destino: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMAS PARA NOTIFICACIONES ---

class PlantillaNotificacionBase(BaseModel):
    estado_disparador: str
    asunto: str
    cuerpo: str
    activa: Optional[bool] = True

class PlantillaNotificacionResponse(PlantillaNotificacionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class HistorialNotificacionBase(BaseModel):
    envio_id: int
    destinatario_email: EmailStr
    asunto_enviado: str
    cuerpo_enviado: str
    resultado: str
    canal: str = "correo"
    motivo_error: Optional[str] = None

class HistorialNotificacionResponse(HistorialNotificacionBase):
    id: int
    fecha_envio: datetime
    model_config = ConfigDict(from_attributes=True)

# --- ESQUEMAS DE REPORTES ---

class HistoricoLinealDia(BaseModel):
    fecha: date
    cantidad: int

class ReporteVolumenResponse(BaseModel):
    total_envios: int
    por_estado: Dict[str, int]
    por_tipo: Dict[str, int]
    historico_lineal: List[HistoricoLinealDia]