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
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class EnvioBase(BaseModel):
    razon_social_destinatario: str
    cuit_destinatario: str
    descripcion: str
    tipo_envio: TipoEnvio
    restriccion: RestriccionEnvio

class EnvioCrear(EnvioBase):
    pass

class HistorialBase(BaseModel):
    envio_id: int
    id_empleado: int
    estado: EstadoEnvio
    fecha_creacion: date

class UsuarioSimple(BaseModel):
    id: int
    nombre: Optional[str]
    apellido: Optional[str]
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)
    
class HistorialRespuesta(BaseModel):
    id: int
    estado: EstadoEnvio
    fecha: datetime
    usuario: UsuarioSimple = Field(alias="empleado")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class EmpresaRespuesta(BaseModel):
    razon_social: str
    cuit: str
    direccion_normalizada: Optional[str]
    provincia: Optional[str]
    municipio: Optional[str]
    cod_postal: Optional[str]
    model_config = ConfigDict(from_attributes=True)
    
class EnvioRespuesta(EnvioBase):
    id: int
    tracking_id: str
    estado: EstadoEnvio
    fecha_creacion: datetime
    creador: UsuarioSimple
    destinatario: EmpresaRespuesta
    model_config = ConfigDict(from_attributes=True)




    

    
    