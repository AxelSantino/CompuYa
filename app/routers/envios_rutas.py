from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import obtener_db
from app.services.servicios_envios import EnvioService
from app.models.esquemas import EnvioCrear, EnvioRespuesta
from app.models.entidades import Usuario
from app.utils.auth import obtener_usuario_actual


router = APIRouter(prefix="/envios", tags=["Envios"])

async def get_envio_service(db: AsyncSession = Depends(obtener_db)) -> EnvioService:
    return EnvioService(db)

@router.post("/", response_model=EnvioRespuesta, status_code=status.HTTP_201_CREATED)
async def crear_envio(
    envio_in: EnvioCrear,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.crear_envio(envio_in, usuario_actual.id)

@router.get("/{tracking_id}", response_model=EnvioRespuesta)
async def obtener_envio(
    tracking_id: str,
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.obtener_envio_por_id(tracking_id)
