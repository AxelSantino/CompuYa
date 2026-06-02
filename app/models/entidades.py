from enum import Enum as PyEnum
from sqlalchemy import Column, Enum, BigInteger, ForeignKey, String, Date, Text, DateTime, Float, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class PrioridadEnvio(PyEnum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"


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
    __tablename__ = "usuarios"
    id = Column(BigInteger, primary_key=True)
    tipo = Column(Enum(TipoCliente, native_enum=False, values_callable=lambda x: [
                  e.value for e in x]), nullable=False)
    supabase_id = Column(UUID(as_uuid=True), unique=True, nullable=False)
    email = Column(Text, unique=True, nullable=False)
    rol = Column(String(20), default="visor")

    perfil_empleado = relationship(
        "PerfilEmpleado", back_populates="usuario", uselist=False)
    perfil_empresa = relationship(
        "PerfilEmpresa", back_populates="usuario", uselist=False)
    fecha = Column(Date, server_default=func.current_date())


class PerfilEmpleado(Base):
    __tablename__ = "perfiles_empleado"
    id = Column(BigInteger, primary_key=True)
    usuario_id = Column(BigInteger, ForeignKey("usuarios.id"), unique=True)
    nombre = Column(Text)
    apellido = Column(Text)
    usuario = relationship("Usuario", back_populates="perfil_empleado")


class PerfilEmpresa(Base):
    __tablename__ = "perfiles_empresa"
    id = Column(BigInteger, primary_key=True)
    usuario_id = Column(BigInteger, ForeignKey("usuarios.id"), unique=True)
    razon_social = Column(Text, unique=True)
    cuit = Column(String(20), unique=True)
    direccion_normalizada = Column(Text)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)

    provincia = Column(Text)
    municipio = Column(Text)
    cod_postal = Column(String(20))
    usuario = relationship("Usuario", back_populates="perfil_empresa")


class Envio(Base):
    __tablename__ = "envios"
    id = Column(BigInteger, primary_key=True)
    tracking_id = Column(String(20), unique=True, nullable=False)

    razon_social_destinatario = Column(Text, nullable=False)
    cuit_destinatario = Column(String(20), nullable=False)
    descripcion = Column(Text, nullable=False)

    tipo_envio = Column(Enum(TipoEnvio, native_enum=False, values_callable=lambda x: [
                        e.value for e in x]), nullable=False)
    restriccion = Column(Enum(RestriccionEnvio, native_enum=False,
                         values_callable=lambda x: [e.value for e in x]), nullable=False)
    prioridad = Column(Enum(PrioridadEnvio, native_enum=False, values_callable=lambda x: [
                       e.value for e in x]), default=PrioridadEnvio.BAJA, nullable=False)
    estado = Column(Enum(EstadoEnvio, native_enum=False, values_callable=lambda x: [
                    e.value for e in x]), default=EstadoEnvio.EN_SUCURSAL)
    creado_por_id = Column(BigInteger, ForeignKey(
        "usuarios.id"), nullable=False)
    destinatario_id = Column(
        BigInteger, ForeignKey("usuarios.id"), nullable=True)

    sucursal_id = Column(BigInteger, ForeignKey(
        "sucursales.id"), nullable=True)
    latitud_destino = Column(Float, nullable=True)
    longitud_destino = Column(Float, nullable=True)

    fecha_creacion = Column(DateTime, server_default=func.now())
    fecha_entrega = Column(DateTime, nullable=True)

    sucursal = relationship("Sucursal")
    historial = relationship(
        "Historial", back_populates="envio", order_by="Historial.fecha.desc()")
    creador = relationship("Usuario", foreign_keys=[creado_por_id])
    destinatario = relationship("Usuario", foreign_keys=[destinatario_id])


class Historial(Base):
    __tablename__ = "historial"
    id = Column(BigInteger, primary_key=True)
    envio_id = Column(BigInteger, ForeignKey("envios.id"), nullable=False)
    id_empleado = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    estado = Column(Enum(EstadoEnvio, native_enum=False, values_callable=lambda x: [
                    e.value for e in x]), nullable=False)

    motivo = Column(Text, nullable=True)

    fecha = Column(DateTime(timezone=True), server_default=func.now())
    envio = relationship("Envio", back_populates="historial")
    empleado = relationship("Usuario")


class Sucursal(Base):
    __tablename__ = "sucursales"
    id = Column(BigInteger, primary_key=True)
    nombre = Column(Text, nullable=False)
    direccion = Column(Text, nullable=False)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)


class AsignacionEnvio(Base):
    __tablename__ = "asignaciones_envio"
    id = Column(BigInteger, primary_key=True)
    envio_id = Column(BigInteger, ForeignKey(
        "envios.id"), unique=True, nullable=False)
    id_empleado = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)

    envio = relationship("Envio")
    empleado = relationship("Usuario")
