from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy import select
from app.db.session import obtener_db
from app.utils.auth import obtener_usuario_actual
from app.models.entidades import NotificacionApp
from app.models.esquemas import NotificacionAppResponse

router = APIRouter(prefix="/alertas", tags=["Alertas"])

@router.get("/mis-notificaciones", response_model=List[NotificacionAppResponse])
async def obtener_mis_notificaciones(
    db: AsyncSession = Depends(obtener_db),
    usuario_actual = Depends(obtener_usuario_actual)
):
    query = select(NotificacionApp).where(
        NotificacionApp.usuario_id == usuario_actual.id
    ).order_by(NotificacionApp.fecha_creacion.desc())
    
    result = await db.execute(query)
    return result.scalars().all()