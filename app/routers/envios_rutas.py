from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import obtener_db
from app.services.servicios_envios import EnvioService
from app.models.esquemas import EnvioCrear, EnvioRespuesta, HistorialRespuesta
from app.models.entidades import Usuario, EstadoEnvio
from app.utils.auth import obtener_usuario_actual, tiene_rol
from typing import List

router = APIRouter(prefix="/envios", tags=["Envios"])

async def get_envio_service(db: AsyncSession = Depends(obtener_db)) -> EnvioService:
    return EnvioService(db)

@router.get("/", response_model=List[EnvioRespuesta], dependencies=[Depends(obtener_usuario_actual)])
async def listar_envios(
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.listar_envios()

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

@router.post("/{tracking_id}/cancelar", response_model=EnvioRespuesta,dependencies=[Depends(tiene_rol(["admin", "supervisor"]))] ) 
async def cancelar_envio(
    tracking_id: str,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.cancelar_envio(tracking_id, usuario_actual.id)

@router.post("/{tracking_id}/actualizar-estado", response_model=EnvioRespuesta, dependencies=[Depends(tiene_rol(["admin", "supervisor", "operador"]))])
async def actualizar_estado_envio(
    tracking_id: str,
    nuevo_estado: EstadoEnvio,
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.actualizar_estado_envio(tracking_id, nuevo_estado, usuario_actual)

@router.get("/{tracking_id}/historial", response_model=List[HistorialRespuesta])
async def obtener_historial(
    tracking_id: str,
    envio_service: EnvioService = Depends(get_envio_service)
):
    return await envio_service.obtener_historial_envio(tracking_id)

