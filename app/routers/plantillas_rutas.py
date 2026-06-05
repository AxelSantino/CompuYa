from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.db.session import obtener_db
from app.models.esquemas import PlantillaNotificacionBase, PlantillaNotificacionResponse
from app.services.servicio_plantillas import PlantillaService
from app.utils.auth import tiene_rol

router = APIRouter(prefix="/plantillas", tags=["Gestión de Plantillas"])

@router.get("/", response_model=List[PlantillaNotificacionResponse], dependencies=[Depends(tiene_rol(["admin"]))])
async def listar_plantillas(db: AsyncSession = Depends(obtener_db)):
    servicio = PlantillaService(db)
    return await servicio.obtener_todas()

@router.post("/", response_model=PlantillaNotificacionResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(tiene_rol(["admin"]))])
async def crear_plantilla(plantilla_in: PlantillaNotificacionBase, db: AsyncSession = Depends(obtener_db)):
    servicio = PlantillaService(db)
    return await servicio.crear_plantilla(plantilla_in)

@router.put("/{plantilla_id}", response_model=PlantillaNotificacionResponse, dependencies=[Depends(tiene_rol(["admin"]))])
async def editar_plantilla(plantilla_id: int, plantilla_in: PlantillaNotificacionBase, db: AsyncSession = Depends(obtener_db)):
    servicio = PlantillaService(db)
    return await servicio.editar_plantilla(plantilla_id, plantilla_in)