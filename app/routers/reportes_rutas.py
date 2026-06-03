from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from datetime import date
from app.db.session import obtener_db
from app.services.servicio_reportes import ServicioReportes
from app.models.esquemas import ReporteVolumenResponse

router = APIRouter(
    prefix="/reportes",
    tags=["Reportes y Analítica"]
)

@router.get("/volumen", response_model=ReporteVolumenResponse, status_code=status.HTTP_200_OK)
async def get_reporte_volumen(
    fecha_desde: date = Query(None, description="Fecha de inicio del reporte (YYYY-MM-DD)"),
    fecha_hasta: date = Query(None, description="Fecha de fin del reporte (YYYY-MM-DD)"),
    db: Session = Depends(obtener_db)
):
    return await ServicioReportes.obtener_reporte_volumen(db, fecha_desde, fecha_hasta)