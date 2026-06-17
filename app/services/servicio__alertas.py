import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.entidades import NotificacionApp
from app.utils.ws_manager import manager  

async def crear_alerta_y_enviar_push(db: AsyncSession, usuario_id: int, titulo: str, mensaje: str, envio_id: int = None):
    print("DEBUG 1: Entrando a crear_alerta_y_enviar_push")
    
    nueva_alerta = NotificacionApp(usuario_id=usuario_id, titulo=titulo, mensaje=mensaje, envio_id=envio_id)
    db.add(nueva_alerta)
    await db.commit()
    await db.refresh(nueva_alerta)
    print("DEBUG 2: Alerta guardada en DB")
    
    topic = f"logitrack_user_{usuario_id}"
    url = f"https://ntfy.sh/{topic}"
    headers = {"Title": titulo.encode('utf-8'), "Tags": "bell,package", "Priority": "high"}
    
    async with httpx.AsyncClient() as client:
        try:
            print("DEBUG 3: Intentando enviar a ntfy.sh...")
            await client.post(url, data=mensaje.encode('utf-8'), headers=headers)
            print("DEBUG 4: Ntfy enviado con éxito")
        except Exception as e:
            print(f"DEBUG ERROR push: {e}")
            
    datos_ws = {
        "tipo": "NUEVA_ALERTA",
        "titulo": titulo,
        "mensaje": mensaje,
        "envio_id": envio_id
    }
    
    print("DEBUG 5: Por enviar WebSocket...")
    await manager.enviar_mensaje_personal(datos_ws, str(usuario_id))
    print("DEBUG 6: WebSocket enviado")
            
    return nueva_alerta