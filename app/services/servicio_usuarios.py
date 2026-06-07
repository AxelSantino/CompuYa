from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import joinedload
from fastapi import HTTPException, status
import httpx
from app.models.entidades import Usuario, PerfilEmpleado, PerfilEmpresa, TipoCliente
from app.config import settings
from app.models.esquemas import UsuarioRegistroEmpleado, UsuarioRegistroEmpresa


class UsuarioService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def verificar_email_existe(self, email: str) -> bool:
        query = select(Usuario).where(Usuario.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def crear_usuario_en_supabase_auth(self, email: str, password: str, metadata: dict) -> str:
        try:
            async with httpx.AsyncClient() as client:
                url = f"{settings.SUPABASE_URL}/auth/v1/signup"
                headers = {
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Content-Type": "application/json"
                }
                payload = {"email": email, "password": password, "data": metadata}
                
                response = await client.post(url, json=payload, headers=headers)
                response_data = response.json()
                
                if response.status_code not in [200, 201]:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Error en el servicio de autenticación: {response_data.get('msg', 'Error desconocido')}"
                    )
                
                if "id" not in response_data:
                    if "user" in response_data and "id" in response_data["user"]:
                        return response_data["user"]["id"]
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="La respuesta de autenticación no contiene un ID de usuario válido"
                    )
                
                return response_data["id"]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error inesperado al crear usuario: {str(e)}"
            )

    async def crear_usuario_empleado(self, empleado_data: UsuarioRegistroEmpleado) -> Usuario:
        if await self.verificar_email_existe(empleado_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        supabase_id = await self.crear_usuario_en_supabase_auth(
            email=empleado_data.email,
            password=empleado_data.password,
            metadata={
                "nombre": empleado_data.nombre,
                "apellido": empleado_data.apellido
            }
        )
        
        nuevo_usuario = Usuario(
            email=empleado_data.email,
            supabase_id=supabase_id,
            tipo=TipoCliente.EMPLEADO,
            rol=empleado_data.rol or "visor"
        )
        
        self.db.add(nuevo_usuario)
        await self.db.flush()
        
        nuevo_perfil = PerfilEmpleado(
            usuario_id=nuevo_usuario.id,
            nombre=empleado_data.nombre,
            apellido=empleado_data.apellido
        )
        self.db.add(nuevo_perfil)
        
        await self.db.commit()
        
        query = select(Usuario).where(Usuario.id == nuevo_usuario.id).options(
            joinedload(Usuario.perfil_empleado),
            joinedload(Usuario.perfil_empresa)
        )
        result = await self.db.execute(query)
        return result.unique().scalar_one()

    async def crear_usuario_empresa(self, empresa_data: UsuarioRegistroEmpresa) -> Usuario:
        if await self.verificar_email_existe(empresa_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
            
        supabase_id = await self.crear_usuario_en_supabase_auth(
            email=empresa_data.email,
            password=empresa_data.password,
            metadata={
                "razon_social": empresa_data.razon_social
            }
        )
        
        nuevo_usuario = Usuario(
            email=empresa_data.email,
            supabase_id=supabase_id,
            tipo=TipoCliente.EMPRESA,
            rol=empresa_data.rol or "operario"
        )
        
        self.db.add(nuevo_usuario)
        await self.db.flush()
        
        nuevo_perfil = PerfilEmpresa(
            usuario_id=nuevo_usuario.id,
            razon_social=empresa_data.razon_social,
            cuit=empresa_data.cuit,
            direccion_normalizada=empresa_data.direccion_normalizada,
            latitud=empresa_data.latitud,
            longitud=empresa_data.longitud,
            provincia=empresa_data.provincia,
            municipio=empresa_data.municipio,
            cod_postal=empresa_data.cod_postal
        )
        self.db.add(nuevo_perfil)
        
        await self.db.commit()
        
        query = select(Usuario).where(Usuario.id == nuevo_usuario.id).options(
            joinedload(Usuario.perfil_empleado),
            joinedload(Usuario.perfil_empresa)
        )
        result = await self.db.execute(query)
        return result.unique().scalar_one()

    async def obtener_usuario_por_id(self, usuario_id: int) -> Usuario:
        query = select(Usuario).where(Usuario.id == usuario_id).options(
            joinedload(Usuario.perfil_empleado),
            joinedload(Usuario.perfil_empresa)
        )
        result = await self.db.execute(query)
        usuario = result.unique().scalar_one_or_none()
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        return usuario

    async def listar_usuarios(self) -> list[Usuario]:
        query = select(Usuario).options(
            joinedload(Usuario.perfil_empleado),
            joinedload(Usuario.perfil_empresa)
        )
        result = await self.db.execute(query)
        return result.unique().scalars().all()

    async def login_usuario(self, email: str, password: str) -> dict:
        async with httpx.AsyncClient() as client:
            url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
            headers = {
                "apikey": settings.SUPABASE_ANON_KEY,
                "Content-Type": "application/json"
            }
            payload = {"email": email, "password": password}
    
            response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Email o contraseña incorrectos"
                )

            return response.json()
        
    async def modificar_usuario(self, usuario_id: int, data: dict) -> Usuario:
        usuario = await self.obtener_usuario_por_id(usuario_id)
        
        # Actualizar campos básicos si están presentes
        if "rol" in data:
            usuario.rol = data["rol"]
        if "activo" in data:
            usuario.activo = data["activo"]
            
        # Actualizar perfil_empleado si es un empleado
        if usuario.tipo == TipoCliente.EMPLEADO and usuario.perfil_empleado:
            if "nombre" in data:
                usuario.perfil_empleado.nombre = data["nombre"]
            if "apellido" in data:
                usuario.perfil_empleado.apellido = data["apellido"]
                
        # Actualizar perfil_empresa si es una empresa
        if usuario.tipo == TipoCliente.EMPRESA and usuario.perfil_empresa:
            fields = ["razon_social", "cuit", "direccion_normalizada", "latitud", "longitud", "provincia", "municipio", "cod_postal"]
            for field in fields:
                if field in data:
                    setattr(usuario.perfil_empresa, field, data[field])
                
        await self.db.commit()
        return usuario
        
    async def buscar_empresa_por_razon_social_o_cuit(self, razon_social: str | None = None, cuit: str | None = None) -> Usuario:
        if not razon_social and not cuit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe proporcionar al menos una razón social o un CUIT."
            )
        query = select(Usuario).join(Usuario.perfil_empresa).where(
            or_(
                PerfilEmpresa.razon_social == razon_social if razon_social else False,
                PerfilEmpresa.cuit == cuit if cuit else False
            )
        ).options(
            joinedload(Usuario.perfil_empresa),
            joinedload(Usuario.perfil_empleado)
        )
        
        result = await self.db.execute(query)
        usuario = result.unique().scalar_one_or_none()
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La empresa no existe en el sistema"
            )
        return usuario
