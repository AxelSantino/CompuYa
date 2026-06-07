import os
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

def get_env_path():
    if getattr(sys, 'frozen', False):
        # Directorio del .exe
        base_path = os.path.dirname(sys.executable)
    else:
        # Directorio de desarrollo
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    return os.path.join(base_path, ".env")

class Settings(BaseSettings):
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,tauri://localhost,http://tauri.localhost"

    # SMTP
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    # Base de Datos
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = None
    DB_PORT: Optional[int] = None
    DB_NAME: Optional[str] = None

    # Supabase Auth
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None

    @property
    def DATABASE_URL(self) -> str:
        if not all([self.DB_USER, self.DB_PASSWORD, self.DB_HOST, self.DB_PORT, self.DB_NAME]):
            raise ValueError("Credenciales Faltantes para la Base de Datos. Verifique el archivo .env")
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    TRIGGER_VARIATION: float = 0.10

    model_config = SettingsConfigDict(
        env_file=get_env_path(), 
        extra="ignore"
    )

settings = Settings()