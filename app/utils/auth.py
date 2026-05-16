import jwt
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.db.session import obtener_db
from app.models.entidades import Usuario
from cachetools import TTLCache

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="usuarios/logintoken")
jwks_cache = TTLCache(maxsize=1, ttl=3600)

async def obtener_claves_publicas_supabase():
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
        except Exception as e:
            return None

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
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get("alg")
        kid = unverified_header.get("kid")

        if alg == "HS256":
            payload = jwt.decode(
                token, 
                settings.SUPABASE_JWT_SECRET, 
                algorithms=["HS256"], 
                audience="authenticated"
            )
        elif alg in ["ES256", "RS256"]:
            jwks = await obtener_claves_publicas_supabase()
            if not jwks:
                raise credentials_exception
            public_key = None
            for key in jwks.get("keys", []):
                if key.get("kid") == kid:
                    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key) if alg == "RS256" else jwt.algorithms.ECAlgorithm.from_jwk(key)
                    break
            
            if not public_key:
                print(f"DEBUG: No se encontró clave pública para kid: {kid}")
                raise credentials_exception

            payload = jwt.decode(
                token, 
                public_key, 
                algorithms=[alg], 
                audience="authenticated"
            )
        else:
            raise credentials_exception
        
        supabase_id: str = payload.get("sub")
        
        if supabase_id is None:
            raise credentials_exception
            
        query = select(Usuario).where(Usuario.supabase_id == supabase_id)
        result = await db.execute(query)
        usuario = result.scalar_one_or_none()
        
        if not usuario:
            print(f"DEBUG: Usuario no encontrado en DB local. SupabaseID: {supabase_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario no autorizado en este sistema. Contacte al administrador."
            )
            
        return usuario
        
    except jwt.ExpiredSignatureError:
        print("DEBUG: Token expirado")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La sesión ha expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        print(f"DEBUG: Error de validación JWT: {str(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"DEBUG: Error inesperado validando token: {str(e)}")
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
