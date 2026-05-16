from enum import Enum as PyEnum
from sqlalchemy import Column, Enum, BigInteger, ForeignKey, String, Date, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class TipoCliente(PyEnum):
    EMPLEADO = "empleado"
    EMPRESA = "empresa"

class TipoEnvio(PyEnum):
    NORMAL = "normal"
    EXPRESS = "express"

class RestriccionEnvio(PyEnum):
    FRAGIL = "fragil"
    VALIOSO = "valioso"
    NINGUNA = "ninguna"
    
class EstadoEnvio(PyEnum):
    EN_SUCURSAL = "en sucursal"
    EN_TRANSITO = "en transito"
    CANCELADO = "cancelado"
    ENTREGADO = "entregado"
    
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
    cuit = Column(String(20), unique=True, nullable=True)
    provincia = Column(Text, nullable=True)
    municipio = Column(Text, nullable=True)
    cod_postal = Column(String(20), nullable=True)
    
    fecha = Column(Date, server_default=func.current_date())
    
class Envio(Base):
    __tablename__= "envios"
    id = Column(BigInteger, primary_key=True)
    tracking_id = Column(String(20), unique=True, nullable=False)

    razon_social_destinatario = Column(Text, nullable=False)
    cuit_destinatario = Column(String(20), nullable=False)
    descripcion = Column(Text, nullable=False)

    tipo_envio = Column(Enum(TipoEnvio, native_enum=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    restriccion = Column(Enum(RestriccionEnvio, native_enum=False, values_callable=lambda x: [e.value for e in x]), nullable=False)
    estado = Column(Enum(EstadoEnvio, native_enum=False, values_callable=lambda x: [e.value for e in x]), default=EstadoEnvio.EN_SUCURSAL)
    creado_por_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    fecha_creacion = Column(Date, server_default=func.current_date())
    
class Historial(Base):
    __tablename__ = "historial"
    id = Column(BigInteger, primary_key=True)
    envio_id = Column(BigInteger, ForeignKey("envios.id"), nullable=False)
    id_empleado = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    estado = Column(Enum(EstadoEnvio, native_enum=False, values_callable=lambda x: [e.value for e in x]), nullable=False)    
    
    fecha = Column(Date, server_default=func.current_date())
    
    

