from pydantic import BaseModel, EmailStr, ConfigDict, Field
from datetime import date, datetime
from typing import List, Optional, Union
from uuid import UUID
from app.models.entidades import TipoEnvio, RestriccionEnvio, EstadoEnvio

class UsuarioBase(BaseModel):
    email: EmailStr
    rol: str = "visor"
    fecha_creacion: datetime = Field(default_factory=datetime.now)

class UsuarioRegistroEmpleado(UsuarioBase):
    password: str = Field(min_length=6)
    nombre: Optional[str] = None
    apellido: Optional[str] = None

class UsuarioRegistroEmpresa(UsuarioBase):
    password: str = Field(min_length=6)
    razon_social: Optional[str] = None
    direccion: Optional[str] = None
    provincia: Optional[str] = None
    municipio: Optional[str] = None
    cod_postal: Optional[str] = None

class UsuarioCrearEmpleado(UsuarioBase):
    supabase_id: Union[str, UUID]
    nombre: Optional[str] = None
    apellido: Optional[str] = None

class UsuarioCrearEmpresa(UsuarioBase):
    supabase_id: Union[str, UUID]
    direccion: Optional[str] = None
    razon_social: Optional[str] = None
    provincia: Optional[str] = None
    municipio: Optional[str] = None
    cod_postal: Optional[str] = None

class UsuarioRespuesta(UsuarioBase):
    id: int
    supabase_id: Union[str, UUID]
    model_config = ConfigDict(from_attributes=True)

class EnvioBase(BaseModel):
    razon_social_destinatario: str
    cuit_destinatario: str
    descripcion: str
    tipo_envio: TipoEnvio
    restriccion: RestriccionEnvio

class EnvioCrear(EnvioBase):
    pass

class EnvioRespuesta(EnvioBase):
    id: int
    tracking_id: str
    estado: EstadoEnvio
    fecha_creacion: date
    creado_por_id: int
    
    model_config = ConfigDict(from_attributes=True)
    
    