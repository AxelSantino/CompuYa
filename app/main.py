import time
from fastapi import FastAPI
import logging
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import usuarios_rutas, envios_rutas,reportes_rutas


logger = logging.getLogger("app")

app = FastAPI(
    title="Sistema de Gestion Logistica CompuYa",
    description="API de backend para el sistema CompuYa, diseñada para la gestión integral de envíos, validación de clientes mediante CUIT y administración de personal logístico.",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[origen.strip() for origen in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios_rutas.router)
app.include_router(envios_rutas.router)
app.include_router(reportes_rutas.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "API de Gestion Logistica CompuYa",
        "version": "1.0.0"
    }