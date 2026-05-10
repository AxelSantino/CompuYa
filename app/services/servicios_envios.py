import random
import string
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.entidades import Envio, Usuario, TipoCliente
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
        await self.db.commit()
        await self.db.refresh(nuevo_envio)
        
        return nuevo_envio
    