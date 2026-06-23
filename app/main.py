import time
from fastapi import FastAPI, Request
import logging
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import usuarios_rutas, envios_rutas, reportes_rutas, notificaciones_rutas, plantillas_rutas, alertas_rutas

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
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

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = (time.time() - start_time) * 1000
    
    logger.info(
        f"API Request: {request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duración: {duration:.2f} ms"
    )
    return response

app.include_router(usuarios_rutas.router)
app.include_router(envios_rutas.router)
app.include_router(notificaciones_rutas.router)
app.include_router(reportes_rutas.router)
app.include_router(plantillas_rutas.router)
app.include_router(alertas_rutas.router)

@app.api_route("/ping", methods=["GET", "HEAD"], include_in_schema=False)
@app.api_route("/ping/", methods=["GET", "HEAD"], include_in_schema=False)
async def ping():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "API de Gestion Logistica CompuYa",
        "version": "1.0.0"
    }
