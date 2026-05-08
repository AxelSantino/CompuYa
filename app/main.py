import time
from fastapi import FastAPI
import logging
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

logger = logging.getLogger("app")

app = FastAPI(
    title="Sistema de Gestion Logistica CompuYa",
    description="Que lo piense el Scrum Master",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[origen.strip() for origen in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "API de Gestion Logistica CompuYa",
        "version": "1.0.0"
    }