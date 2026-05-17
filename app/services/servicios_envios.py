from ast import If
import random
import string
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.entidades import Envio, Usuario, TipoCliente, EstadoEnvio, Historial
from app.models.esquemas import EnvioCrear

class EnvioService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def generar_tracking_id(self) -> str:
        anio = datetime.now().year
        caracteres = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"CY-{anio}-{caracteres}"
      
    async def crear_envio(self, envio_data: EnvioCrear, usuario_id: int) -> Envio:
        query = select(Usuario).where(
            Usuario.razon_social == envio_data.razon_social_destinatario,
            Usuario.cuit == envio_data.cuit_destinatario,
            Usuario.tipo == TipoCliente.EMPRESA
        )
        result = await self.db.execute(query)
        empresa = result.scalar_one_or_none()
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La empresa no existe en el sistema"
            )
        tracking_id = self.generar_tracking_id()
        nuevo_envio = Envio(
            **envio_data.model_dump(),
            tracking_id=tracking_id,
            creado_por_id=usuario_id,
            destinatario_id=empresa.id
        )
        self.db.add(nuevo_envio)
        await self.db.flush()
        await self.registrar_historial(nuevo_envio.id, usuario_id, nuevo_envio.estado)
        await self.db.commit()
        await self.db.refresh(nuevo_envio)
        
        return await self.obtener_envio_por_id(nuevo_envio.tracking_id)

    async def obtener_envio_por_id(self, tracking_id: str) -> Envio:
        query = select(Envio).where(Envio.tracking_id == tracking_id).options(
            selectinload(Envio.creador),
            selectinload(Envio.destinatario)
        )
        result = await self.db.execute(query)
        envio = result.scalar_one_or_none()
        if not envio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Envio no encontrado"
            )
        return envio

    async def cancelar_envio(self, tracking_id: str, usuario_id:int) -> Envio:
        envio = await self.obtener_envio_por_id(tracking_id)
        if envio.estado == EstadoEnvio.CANCELADO or envio.estado == EstadoEnvio.ENTREGADO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El envío no se puede cancelar ya que su estado esta {envio.estado}"
            )
        envio.estado = EstadoEnvio.CANCELADO
        await self.registrar_historial(envio.id, usuario_id, EstadoEnvio.CANCELADO)
        await self.db.commit()
        await self.db.refresh(envio)
        
        return await self.obtener_envio_por_id(envio.tracking_id)
    
    async def actualizar_estado_envio(self, tracking_id: str, nuevo_estado: EstadoEnvio, usuario: Usuario) -> Envio:
        envio = await self.obtener_envio_por_id(tracking_id)
        if envio.estado == EstadoEnvio.CANCELADO or envio.estado == EstadoEnvio.ENTREGADO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El estado del envío no se puede actualizar ya que su estado actual es {envio.estado}"
            )
        if nuevo_estado == EstadoEnvio.CANCELADO and usuario.rol not in ["admin", "supervisor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para cancelar un envío. Solo los supervisores pueden realizar esta acción."
            )
        envio.estado = nuevo_estado
        await self.registrar_historial(envio.id, usuario.id, nuevo_estado)
        await self.db.commit()
        await self.db.refresh(envio)
        
        return await self.obtener_envio_por_id(envio.tracking_id)

    async def listar_envios(self) -> list[Envio]:
        query = select(Envio).options(
            selectinload(Envio.creador),
            selectinload(Envio.destinatario)
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def registrar_historial(self, envio_id: int, usuario_id: int, nuevo_estado: EstadoEnvio):
        nuevo_historial = Historial(
            envio_id=envio_id,
            id_empleado=usuario_id,
            estado=nuevo_estado
        )
        self.db.add(nuevo_historial)
    
    async def obtener_historial_envio(self, tracking_id: str):
        envio_query = select(Envio.id).where(Envio.tracking_id == tracking_id)
        result = await self.db.execute(envio_query)
        envio_id = result.scalar_one_or_none()

        if not envio_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Envio no encontrado"
            )
        historial_query = select(Historial).where(Historial.envio_id == envio_id).options(
            selectinload(Historial.empleado)
        ).order_by(Historial.fecha.desc())
        
        result = await self.db.execute(historial_query)
        historial = result.scalars().all()
        return historial
