import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.entidades import NotificacionApp


async def crear_alerta_y_enviar_push(db: AsyncSession, usuario_id: int, titulo: str, mensaje: str, envio_id: int = None):
    nueva_alerta = NotificacionApp(usuario_id=usuario_id, titulo=titulo, mensaje=mensaje, envio_id=envio_id)
    db.add(nueva_alerta)
    await db.commit()
    await db.refresh(nueva_alerta)
    
    topic = f"logitrack_user_{usuario_id}"
    url = f"https://ntfy.sh/{topic}"
    headers = {"Title": titulo.encode('utf-8'), "Tags": "bell,package", "Priority": "high"}
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post(url, data=mensaje.encode('utf-8'), headers=headers)
        except Exception as e:
            print(f"Error push: {e}")
            
    return nueva_alerta