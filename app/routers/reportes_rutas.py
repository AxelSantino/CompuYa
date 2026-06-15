from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession 
from datetime import date, timedelta
import io

from app.db.session import obtener_db
from app.services.servicio_reportes import ServicioReportes
from app.models.esquemas import (
    ReporteIncidenciasResponse, 
    ReporteVolumenResponse,
    ReporteTasaEntregas,
    TasaEntregaDemoradaResponse
)
from app.utils.auth import obtener_usuario_actual, tiene_rol
from app.utils.csv_helper import generar_csv

router = APIRouter(
    prefix="/reportes",
    tags=["Reportes y Analítica"]
)

async def get_reporte_service(db: AsyncSession = Depends(obtener_db)) -> ServicioReportes:
    return ServicioReportes(db)

@router.get("/volumen", response_model=ReporteVolumenResponse, status_code=status.HTTP_200_OK)
async def get_reporte_volumen(
    fecha_desde: date = Query(None, description="Fecha de inicio del reporte (YYYY-MM-DD)"),
    fecha_hasta: date = Query(None, description="Fecha de fin del reporte (YYYY-MM-DD)"),
    reporte_service: ServicioReportes = Depends(get_reporte_service)
):
    return await reporte_service.obtener_reporte_volumen(fecha_desde, fecha_hasta)

@router.get("/exportar/estados", dependencies=[Depends(tiene_rol("admin"))])
async def exportar_estados_csv(
    fecha_desde: date = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    fecha_hasta: date = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    reporte_service: ServicioReportes = Depends(get_reporte_service)
):
    fecha_hasta = fecha_hasta or date.today()
    fecha_desde = fecha_desde or (fecha_hasta - timedelta(days=30))
    
    if fecha_desde > fecha_hasta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin."
        )

    datos = await reporte_service.exportar_estado_csv(fecha_desde, fecha_hasta)
    columnas = ["Estado", "Cantidad", "Porcentaje"]
    contenido_csv = generar_csv(datos, columnas)
    
    filename = f"reporte_estados_{fecha_desde}_a_{fecha_hasta}.csv"
    return StreamingResponse(
        io.StringIO(contenido_csv),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/exportar/prioridades", dependencies=[Depends(tiene_rol("admin"))])
async def exportar_prioridades_csv(
    fecha_desde: date = Query(None, description="Fecha de inicio (YYYY-MM-DD)"),
    fecha_hasta: date = Query(None, description="Fecha de fin (YYYY-MM-DD)"),
    reporte_service: ServicioReportes = Depends(get_reporte_service)
):
    fecha_hasta = fecha_hasta or date.today()
    fecha_desde = fecha_desde or (fecha_hasta - timedelta(days=30))
    
    if fecha_desde > fecha_hasta:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin."
        )

    datos = await reporte_service.exportar_prioridad_csv(fecha_desde, fecha_hasta)
    columnas = ["Prioridad", "Cantidad", "Porcentaje"]
    contenido_csv = generar_csv(datos, columnas)
    
    filename = f"reporte_prioridades_{fecha_desde}_a_{fecha_hasta}.csv"
    return StreamingResponse(
        io.StringIO(contenido_csv),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/incidencias", response_model=ReporteIncidenciasResponse, dependencies=[Depends(tiene_rol(["admin"]))])
async def get_reporte_incidencias(
    fecha_inicio: date = Query(..., description="Fecha de inicio del reporte (YYYY-MM-DD)"),
    fecha_fin: date = Query(..., description="Fecha de fin del reporte (YYYY-MM-DD)"),
    reporte_service: ServicioReportes = Depends(get_reporte_service)
):
    if fecha_inicio > fecha_fin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin."
        )
    return await reporte_service.obtener_reporte_incidencias(fecha_inicio, fecha_fin)

@router.get("/exportar/motivos-cancelacion", dependencies=[Depends(tiene_rol(["admin"]))])
async def exportar_motivos_cancelacion_csv(
    fecha_inicio: date = Query(..., description="Fecha de inicio (YYYY-MM-DD)"),
    fecha_fin: date = Query(..., description="Fecha de fin (YYYY-MM-DD)"),
    reporte_service: ServicioReportes = Depends(get_reporte_service)
):
    if fecha_inicio > fecha_fin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin."
        )
    
    datos = await reporte_service.exportar_motivo_cancelacion_csv(fecha_inicio, fecha_fin)
    columnas = ["Motivo", "Cantidad", "Porcentaje"]
    contenido_csv = generar_csv(datos, columnas)
    
    filename = f"reporte_motivos_cancelacion_{fecha_inicio}_a_{fecha_fin}.csv"
    return StreamingResponse(
        io.StringIO(contenido_csv),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/tasa-entregas-con-demora", response_model=TasaEntregaDemoradaResponse, dependencies=[Depends(tiene_rol(["admin"]))])
async def get_tasa_entregas_con_demora(
    fecha_inicio: date = Query(..., description="Fecha de inicio del reporte (YYYY-MM-DD)"),
    fecha_fin: date = Query(..., description="Fecha de fin del reporte (YYYY-MM-DD)"),
    reporte_service: ServicioReportes = Depends(get_reporte_service)
):
    if fecha_inicio > fecha_fin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin."
        )
    
    return await reporte_service.obtener_tasa_entregas_con_demora(fecha_inicio, fecha_fin)

@router.get("/tasa-entregas-a-tiempo", response_model=ReporteTasaEntregas, dependencies=[Depends(tiene_rol(["admin"]))])
async def get_tasa_entregas_a_tiempo(
    fecha_inicio: date = Query(..., description="Fecha de inicio del reporte (YYYY-MM-DD)"),
    fecha_fin: date = Query(..., description="Fecha de fin del reporte (YYYY-MM-DD)"),
    reporte_service: ServicioReportes = Depends(get_reporte_service)
):
    if fecha_inicio > fecha_fin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin."
        )
    
    return await reporte_service.obtener_tasa_entregas_a_tiempo(fecha_inicio, fecha_fin)
