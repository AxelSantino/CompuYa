from unittest import result

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, or_
from fastapi import HTTPException, status
import httpx
from app.models.entidades import Usuario, TipoCliente
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
                    print(f"DEBUG: Error de Supabase Auth ({response.status_code}): {response_data}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"Error en el servicio de autenticación: {response_data.get('msg', 'Error desconocido')}"
                    )
                
                if "id" not in response_data:
                    if "user" in response_data and "id" in response_data["user"]:
                        return response_data["user"]["id"]
                    
                    print(f"DEBUG: Respuesta inesperada de Supabase (sin ID): {response_data}")
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="La respuesta de autenticación no contiene un ID de usuario válido"
                    )
                
                return response_data["id"]
        except httpx.HTTPStatusError as e:
            print(f"DEBUG: HTTPStatusError: {e.response.text}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Error en el servicio de autenticación"
            )
        except Exception as e:
            print(f"DEBUG: Error inesperado en Auth: {str(e)}")
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
            rol=empleado_data.rol or "visor",
            nombre=empleado_data.nombre,
            apellido=empleado_data.apellido
        )
        
        self.db.add(nuevo_usuario)
        await self.db.commit()
        await self.db.refresh(nuevo_usuario)
        
        return nuevo_usuario

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
                "razon_social": empresa_data.razon_social,
                "direccion": empresa_data.direccion
            }
        )
        nuevo_usuario = Usuario(
            email=empresa_data.email,
            supabase_id=supabase_id,
            tipo=TipoCliente.EMPRESA,
            rol=empresa_data.rol or "operario",
            
            razon_social=empresa_data.razon_social,
            provincia=empresa_data.provincia,
            municipio=empresa_data.municipio,
            cod_postal=empresa_data.cod_postal,
            direccion_normalizada=empresa_data.direccion
        )
        
        self.db.add(nuevo_usuario)
        await self.db.commit()
        await self.db.refresh(nuevo_usuario)
        
        return nuevo_usuario

    async def obtener_usuario_por_id(self, usuario_id: int) -> Usuario:
        query = select(Usuario).where(Usuario.id == usuario_id)
        result = await self.db.execute(query)
        usuario = result.scalar_one_or_none()
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        return usuario

    async def listar_usuarios(self) -> list[Usuario]:
        query = select(Usuario)
        result = await self.db.execute(query)
        return result.scalars().all()

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
        

    async def buscar_empresa_por_razon_social_o_cuit(self, razon_social: str | None = None, cuit: str | None = None) -> Usuario:
        if not razon_social and not cuit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe proporcionar al menos una razón social o un CUIT."
            )

        query = select(Usuario).where(
            or_(
                Usuario.razon_social == razon_social if razon_social else False,
                Usuario.cuit == cuit if cuit else False
            ),
            Usuario.tipo == TipoCliente.EMPRESA
        )
        result = await self.db.execute(query)
        empresa = result.scalar_one_or_none()
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La empresa no existe en el sistema"
            )
        return empresa
