import time
from jose import jwt, jwk
from jose.exceptions import JWTError, ExpiredSignatureError
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.db.session import obtener_db
from app.models.entidades import Usuario
from cachetools import TTLCache
from typing import Dict
import logging

logger = logging.getLogger("app")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="usuarios/logintoken")
jwks_cache = TTLCache(maxsize=1, ttl=3600)
user_cache = TTLCache(maxsize=1000, ttl=300)

async def obtener_claves_publicas_supabase() -> Dict:
    if "keys" in jwks_cache:
        return jwks_cache["keys"]
    url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            response.raise_for_status()
            jwks = response.json()
            jwks_cache["keys"] = jwks
            return jwks
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"No se pudo obtener la clave de validación del proveedor de identidad: {e}"
            )

async def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(obtener_db)
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la sesión",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        jwks = await obtener_claves_publicas_supabase()
        
        payload = jwt.decode(
            token,
            jwks,
            algorithms=['ES256', 'RS256'],
            audience='authenticated',
            issuer=f"{settings.SUPABASE_URL}/auth/v1"
        )
        
        supabase_id: str = payload.get("sub")
        if supabase_id is None:
            raise credentials_exception
        
        if supabase_id in user_cache:
            return user_cache[supabase_id]
        
        from sqlalchemy.orm import selectinload, joinedload
        query = select(Usuario).where(Usuario.supabase_id == supabase_id).options(
            joinedload(Usuario.perfil_empleado),
            joinedload(Usuario.perfil_empresa)
        )
        result = await db.execute(query)
        usuario = result.unique().scalar_one_or_none()
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario no autorizado en este sistema. Contacte al administrador."
            )
            
        # Store in cache and detach from session to avoid DetachedInstanceError on next request
        db.expunge(usuario)
        user_cache[supabase_id] = usuario
        return usuario
        
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión ha expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        raise credentials_exception

def tiene_rol(roles_permitidos: list):
    async def dep_rol(usuario: Usuario = Depends(obtener_usuario_actual)):
        if usuario.rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción"
            )
        return usuario
    return dep_rol
