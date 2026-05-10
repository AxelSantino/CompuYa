from pydantic import BaseModel, EmailStr, ConfigDict, Field
from datetime import date, datetime
from typing import List, Optional, Union
from uuid import UUID

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