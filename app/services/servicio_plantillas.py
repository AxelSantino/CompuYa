from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.entidades import PlantillaNotificacion
from app.models.esquemas import PlantillaNotificacionBase

class PlantillaService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def obtener_todas(self):
        query = select(PlantillaNotificacion).order_by(PlantillaNotificacion.estado_disparador)
        resultado = await self.db.execute(query)
        return resultado.scalars().all()

    async def crear_plantilla(self, plantilla_in: PlantillaNotificacionBase):
        query = select(PlantillaNotificacion).where(
            PlantillaNotificacion.estado_disparador == plantilla_in.estado_disparador.value
        )
        res = await self.db.execute(query)
        if res.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Ya existe una plantilla para el estado {plantilla_in.estado_disparador.value}"
            )
        nueva = PlantillaNotificacion(
            estado_disparador=plantilla_in.estado_disparador.value,
            asunto=plantilla_in.asunto,
            cuerpo=plantilla_in.cuerpo,
            activa=plantilla_in.activa
        )
        self.db.add(nueva)
        await self.db.commit()
        await self.db.refresh(nueva)
        return nueva

    async def editar_plantilla(self, id: int, plantilla_in: PlantillaNotificacionBase):
        query = select(PlantillaNotificacion).where(PlantillaNotificacion.id == id)
        res = await self.db.execute(query)
        plantilla = res.scalars().first()
        
        if not plantilla:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plantilla no encontrada")
        
        plantilla.estado_disparador = plantilla_in.estado_disparador.value
        plantilla.asunto = plantilla_in.asunto
        plantilla.cuerpo = plantilla_in.cuerpo
        plantilla.activa = plantilla_in.activa
        
        await self.db.commit()
        await self.db.refresh(plantilla)
        return plantilla