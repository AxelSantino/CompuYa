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
from sqlalchemy.orm import Query, joinedload
from sqlalchemy import select
import logging
import time

logger = logging.getLogger("app")


router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

async def get_usuario_service(db: AsyncSession = Depends(obtener_db)) -> UsuarioService:
    return UsuarioService(db)

@router.get("/yo", response_model=UsuarioRespuesta)
async def obtener_perfil(usuario: Usuario = Depends(obtener_usuario_actual)):
    logger.info(f"Obteniendo perfil para usuario ID: {usuario.id}")
    t0 = time.time()
    try:
        logger.info(f"obtener_perfil (retorno en memoria) tardó {(time.time() - t0) * 1000:.2f} ms")
        return usuario
    except Exception as e:
        logger.error(f"Error al obtener perfil: {str(e)}")
        raise

@router.get("/repartidores", response_model=List[UsuarioRespuesta], dependencies=[Depends(tiene_rol(["admin", "supervisor"]))])
async def listar_repartidores(
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    logger.info("Iniciando obtención de lista de repartidores")
    t0 = time.time()
    try:
        from sqlalchemy import select
        from app.models.entidades import TipoCliente
        from sqlalchemy.orm import joinedload
        
        query = select(Usuario).where(
            Usuario.tipo == TipoCliente.EMPLEADO,
            Usuario.rol == "repartidor"
        ).options(
            joinedload(Usuario.perfil_empleado),
            joinedload(Usuario.perfil_empresa)
        )
        
        result = await usuario_service.db.execute(query)
        repartidores = result.unique().scalars().all()
        logger.info(f"listar_repartidores tardó {(time.time() - t0) * 1000:.2f} ms")
        return repartidores
    except Exception as e:
        logger.error(f"Error al listar repartidores: {str(e)}")
        raise

@router.get("/", response_model=List[UsuarioRespuesta], dependencies=[Depends(tiene_rol(["admin"]))])
async def listar_usuarios(
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    logger.info("Iniciando obtención de lista de usuarios")
    t0 = time.time()
    usuarios = await usuario_service.listar_usuarios()
    logger.info(f"listar_usuarios tardó {(time.time() - t0) * 1000:.2f} ms")
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
    try:
        res = await usuario_service.login_usuario(form_data.username, form_data.password)
        return {
            "access_token": res["access_token"],
            "token_type": "bearer",
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/buscar_destinatario", response_model=UsuarioRespuesta,dependencies=[Depends(tiene_rol(["operador", "supervisor"]))])
async def buscar_destinatario(
    razon_social: str | None = None,
    cuit: str | None = None,
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    destinatario = await usuario_service.buscar_empresa_por_razon_social_o_cuit(razon_social, cuit)
    return destinatario


@router.put("/{usuario_id}", response_model=UsuarioRespuesta, dependencies=[Depends(tiene_rol(["admin"]))])
async def modificar_usuario(
    usuario_id: int,
    usuario_in: dict,
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    return await usuario_service.modificar_usuario(usuario_id, usuario_in)

@router.get("/roles/empleados",response_model=List[UsuarioRespuesta], dependencies = [Depends(tiene_rol(["admin"]))])
async def listar_solo_empleados(
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    from sqlalchemy.orm import joinedload
    query = select(Usuario).where(
            Usuario.tipo == TipoCliente.EMPLEADO
        ).options(
            joinedload(Usuario.perfil_empleado),
            joinedload(Usuario.perfil_empresa)
        )
    result = await usuario_service.db.execute(query)
    return result.unique().scalars().all()
    


@router.get("/roles/clientes",response_model=List[UsuarioRespuesta], dependencies = [Depends(tiene_rol(["admin"]))])
async def listar_solo_clientes(
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    from sqlalchemy.orm import joinedload
    query = select(Usuario).where(
            Usuario.tipo == TipoCliente.EMPRESA
        ).options(
            joinedload(Usuario.perfil_empleado),
            joinedload(Usuario.perfil_empresa)
        )
    result = await usuario_service.db.execute(query)
    return result.unique().scalars().all()



@router.get("/{usuario_id}", response_model=UsuarioRespuesta, dependencies=[Depends(obtener_usuario_actual)])
async def obtener_usuario_por_id(
    usuario_id: int = Path(..., description="ID del usuario a buscar"),
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    from sqlalchemy.orm import joinedload
    query = select(Usuario).where(Usuario.id == usuario_id).options(
        joinedload(Usuario.perfil_empleado),
        joinedload(Usuario.perfil_empresa)
    )
    result = await usuario_service.db.execute(query)
    usuario = result.unique().scalar_one_or_none()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )
    return usuario

@router.post("/cambiar-activo-inactivo/{usuario_id}", response_model=UsuarioRespuesta, dependencies=[Depends(tiene_rol(["admin"]))])
async def cambiar_estado_activo_inactivo(
    peticion: bool, 
    usuario_id: int = Path(..., description="ID del usuario a modificar"), 
    usuario_service: UsuarioService = Depends(get_usuario_service)
):
    usuario = await usuario_service.usuario_modificar_activo_inactivo(usuario_id, peticion)
    return usuario