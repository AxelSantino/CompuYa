from ast import If
import random
import string
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.entidades import Envio, Usuario, TipoCliente, EstadoEnvio ,Historial
from app.models.esquemas import EnvioCrear

class EnvioService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def generar_tracking_id(self) -> str:
        anio = datetime.now().year
        caracteres = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"CY-{anio}-{caracteres}"
    
    async def validar_destinatario(self, razon_social: str, cuit: str) -> bool:
        query = select(Usuario).where(
            Usuario.razon_social == razon_social,
            Usuario.cuit == cuit,
            Usuario.tipo == TipoCliente.EMPRESA
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None
    
    async def crear_envio(self, envio_data: EnvioCrear, usuario_id: int) -> Envio:
        existe = await self.validar_destinatario(envio_data.razon_social_destinatario, envio_data.cuit_destinatario)
        if not existe:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El destinatario {envio_data.razon_social_destinatario} con CUIT {envio_data.cuit_destinatario} no existe en el sistema."
            )
        
        tracking_id = self.generar_tracking_id()

        nuevo_envio = Envio(
            **envio_data.model_dump(),
            tracking_id=tracking_id,
            creado_por_id=usuario_id
        )
        
        self.db.add(nuevo_envio)
        
        await self.db.flush()

        historial = Historial(
            envio_id=nuevo_envio.id,
            id_empleado=usuario_id,
            estado=nuevo_envio.estado
        )
        self.db.add(historial)
        
        await self.db.commit()
        await self.db.refresh(nuevo_envio)
        
        return nuevo_envio

    async def obtener_envio_por_id(self, tracking_id: str) -> Envio:
        query = select(Envio).where(Envio.tracking_id == tracking_id)
        result = await self.db.execute(query)
        envio = result.scalar_one_or_none()
        if not envio:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Envio no encontrado"
            )
        return envio

    async def cancelar_envio(self, tracking_id: str) -> Envio:
        envio = await self.obtener_envio_por_id(tracking_id)
        if envio.estado == EstadoEnvio.CANCELADO or envio.estado == EstadoEnvio.ENTREGADO:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El envío no se puede cancelar ya que su estado esta {envio.estado}"
            )
        envio.estado = EstadoEnvio.CANCELADO
        historial = Historial(
            envio_id=envio.id,
            id_empleado=envio.creado_por_id,
            estado=EstadoEnvio.CANCELADO
        )
        self.db.add(historial)
        await self.db.commit()
        await self.db.refresh(envio)
        
        return envio
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
        
        historial = Historial(
            envio_id=envio.id,
            id_empleado=usuario.id,
            estado=nuevo_estado
        )

        self.db.add(historial)
        await self.db.commit()
        await self.db.refresh(envio)
        
        return envio

    async def listar_envios(self) -> list[Envio]:
        query = select(Envio)
        result = await self.db.execute(query)
        return result.scalars().all()
