from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import date, timedelta
import io
from app.db.session import obtener_db
from app.services.servicio_reportes import ServicioReportes
from app.models.esquemas import ReporteIncidenciasResponse, ReporteVolumenResponse
from app.utils.auth import obtener_usuario_actual, tiene_rol
from app.utils.csv_helper import generar_csv

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

@router.get("/exportar/estados", dependencies=[Depends(tiene_rol("admin"))])
async def exportar_estados_csv(
    fecha_desde: date = Query(None),
    fecha_hasta: date = Query(None),
    db: Session = Depends(obtener_db)
):
    fecha_hasta = fecha_hasta or date.today()
    fecha_desde = fecha_desde or (fecha_hasta - timedelta(days=30))
    
    datos = await ServicioReportes.exportar_estado_csv(db, fecha_desde, fecha_hasta)
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
    fecha_desde: date = Query(None),
    fecha_hasta: date = Query(None),
    db: Session = Depends(obtener_db)
):
    fecha_hasta = fecha_hasta or date.today()
    fecha_desde = fecha_desde or (fecha_hasta - timedelta(days=30))
    
    datos = await ServicioReportes.exportar_prioridad_csv(db, fecha_desde, fecha_hasta)
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
    db: Session = Depends(obtener_db)
):
    if fecha_inicio > fecha_fin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin."
        )
    return await ServicioReportes.obtener_reporte_incidencias(db, fecha_inicio, fecha_fin)

@router.get("/exportar/motivos-cancelacion", dependencies=[Depends(tiene_rol(["admin"]))])
async def exportar_motivos_cancelacion_csv(
    fecha_inicio: date = Query(..., description="YYYY-MM-DD"),
    fecha_fin: date = Query(..., description="YYYY-MM-DD"),
    db: Session = Depends(obtener_db)
):
    if fecha_inicio > fecha_fin:
        raise HTTPException(status_code=400, detail="Rango de fechas inválido")
    
    datos = await ServicioReportes.exportar_motivo_cancelacion_csv(db, fecha_inicio, fecha_fin)
    columnas = ["Motivo", "Cantidad", "Porcentaje"]
    contenido_csv = generar_csv(datos, columnas)
    
    filename = f"reporte_motivos_cancelacion_{fecha_inicio}_a_{fecha_fin}.csv"
    return StreamingResponse(
        io.StringIO(contenido_csv),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/tasa-entregas", dependencies=[Depends(tiene_rol(["admin"]))])
async def get_tasa_entregas(
    fecha_inicio: date = Query(..., description="YYYY-MM-DD"),
    fecha_fin: date = Query(..., description="YYYY-MM-DD"),
    db: Session = Depends(obtener_db)
):
    servicio = ServicioReportes()
    return await servicio.obtener_tasa_entregas_a_tiempo(db, fecha_inicio, fecha_fin)
