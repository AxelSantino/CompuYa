from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from app.db.session import obtener_db
from app.services.servicio_reportes import ServicioReportes
from app.models.esquemas import ReporteIncidenciasResponse, ReporteVolumenResponse
from app.utils.auth import obtener_usuario_actual, tiene_rol

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



@router.get("/incidencias", response_model=ReporteIncidenciasResponse,dependencies=[Depends(tiene_rol([ "admin" ]))])
async def get_reporte_incidencias(
    fecha_inicio: date = Query(..., description="Fecha de inicio del reporte (YYYY-MM-DD)"),
    fecha_fin: date = Query(..., description="Fecha de fin del reporte (YYYY-MM-DD)"),
    db: Session = Depends(obtener_db)
):
    if fecha_inicio > fecha_fin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin."
        )
    
    
    reporte_service = ServicioReportes()
    reporte_service.db = db
    
    return await ServicioReportes.obtener_reporte_incidencias(db, fecha_inicio, fecha_fin)