
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import obtener_db 

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])
