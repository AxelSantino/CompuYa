from fastapi import APIRouter, Depends, status, WebSocket, WebSocketDisconnect  # <-- 1. Sumamos los imports de WebSocket
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from app.db.session import obtener_db
from app.utils.auth import obtener_usuario_actual, tiene_rol
from app.models.entidades import NotificacionApp
from app.models.esquemas import NotificacionAppResponse
from app.utils.ws_manager import manager  

router = APIRouter(prefix="/alertas", tags=["Alertas"])

@router.get("/mis-notificaciones", response_model=List[NotificacionAppResponse],dependencies=[Depends(tiene_rol(["cliente"]))])
async def obtener_mis_notificaciones(db: AsyncSession = Depends(obtener_db),usuario_actual = Depends(obtener_usuario_actual)):
    query = select(NotificacionApp).where(
        NotificacionApp.usuario_id == usuario_actual.id
    ).order_by(NotificacionApp.fecha_creacion.desc())
    
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/marcar-leidas", dependencies=[Depends(tiene_rol(["cliente"]))])
async def marcar_notificaciones_leidas(db: AsyncSession = Depends(obtener_db),usuario_actual = Depends(obtener_usuario_actual)):
    stmt = update(NotificacionApp).where(
        (NotificacionApp.usuario_id == usuario_actual.id) & 
        (NotificacionApp.leida == False)
    ).values(leida=True)
    
    await db.execute(stmt)
    await db.commit()
    return {"message": "Notificaciones marcadas"}


@router.websocket("/ws/{usuario_id}")
async def websocket_notificaciones(websocket: WebSocket, usuario_id: str):
    await manager.conectar(websocket, usuario_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.desconectar(usuario_id)