from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import obtener_db 
from app.models.esquemas import HistorialNotificacionResponse
from app.utils.auth import tiene_rol
from app.services.servicio_notificacion import NotificacionService

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])

@router.get(
    "/historial", 
    response_model=List[HistorialNotificacionResponse],
    dependencies=[Depends(tiene_rol(["supervisor", "admin"]))]
)
async def obtener_auditoria_notificaciones(
    db: AsyncSession = Depends(obtener_db)
):
    servicio = NotificacionService(db)
    return await servicio.obtener_historial_auditoria()