from fastapi import APIRouter, Depends, status, HTTPException, Path
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import obtener_db
from app.services.servicio_usuarios import UsuarioService
from app.utils.auth import obtener_usuario_actual, tiene_rol
from app.models.esquemas import (
    UsuarioRespuesta, 
    UsuarioCrearEmpleado, 
    UsuarioCrearEmpresa,
    UsuarioRegistroEmpleado,
    UsuarioRegistroEmpresa
)
from app.models.entidades import Usuario, TipoCliente
from typing import List, Union

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

async def get_usuario_service(db: AsyncSession = Depends(obtener_db)) -> UsuarioService:
    return UsuarioService(db)

@router.get("/yo", response_model=UsuarioRespuesta)
async def obtener_perfil(usuario: Usuario = Depends(obtener_usuario_actual)):
    return usuario

@router.get("/", response_model=List[UsuarioRespuesta], dependencies=[Depends(tiene_rol(["admin"]))])
async def listar_usuarios(
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    usuarios = await usuario_service.listar_usuarios()
    return usuarios

@router.post("/registro-empleado", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
async def registro_empleado(
    empleado_in: UsuarioRegistroEmpleado,
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    return await usuario_service.crear_usuario_empleado(empleado_in)

@router.post("/registro-empresa", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
async def registro_empresa(
    empresa_in: UsuarioRegistroEmpresa,
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    return await usuario_service.crear_usuario_empresa(empresa_in)

@router.post("/logintoken")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    usuario_service: UsuarioService = Depends(get_usuario_service) 
):
    res = await usuario_service.login_usuario(form_data.username, form_data.password)
    return {
        "access_token": res["access_token"],
        "token_type": "bearer",
    }

@router.get("/buscar_destinatario", response_model=UsuarioRespuesta,dependencies=[Depends(tiene_rol(["operador", "supervisor"]))])
async def buscar_destinatario(
    razon_social: str | None = None,
    cuit: str | None = None,
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    destinatario = await usuario_service.buscar_empresa_por_razon_social_o_cuit(razon_social, cuit)
    return destinatario
