from enum import Enum as PyEnum
from sqlalchemy import Column, Enum, BigInteger, String, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class TipoCliente(PyEnum):
    EMPLEADO = "empleado"
    EMPRESA = "empresa"

class Usuario(Base):
    __tablename__= "usuarios"
    id = Column(BigInteger, primary_key=True)
    tipo = Column(Enum(TipoCliente, native_enum=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    supabase_id = Column(UUID(as_uuid=True), unique=True, nullable=False)
    email = Column(Text, unique=True, nullable=False)
    rol = Column(String(20), default="visor")
    
    nombre = Column(Text, nullable=True)
    apellido = Column(Text, nullable=True)
    
    direccion_normalizada = Column(Text, nullable=True)
    razon_social = Column(Text, nullable=True)
    provincia = Column(Text, nullable=True)
    municipio = Column(Text, nullable=True)
    cod_postal = Column(String(20), nullable=True)
    
    fecha: Date = Column(Date, default=None)