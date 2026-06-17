import os
import sys
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

def get_env_path():
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")

class Settings(BaseSettings):
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    RESEND_API_KEY: Optional[str] = None
    
        # Configuración de la aplicación
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
