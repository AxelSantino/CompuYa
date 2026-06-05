from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from datetime import date, datetime, timedelta
from app.models.entidades import Envio, EstadoEnvio, Historial
from app.models.esquemas import DesgloseCausa, ReporteIncidenciasResponse 

class ServicioReportes:
    
    @staticmethod
    async def obtener_reporte_volumen(db: AsyncSession, fecha_desde: date = None, fecha_hasta: date = None):
        if not fecha_hasta:
            fecha_hasta = date.today()
        if not fecha_desde:
            fecha_desde = fecha_hasta - timedelta(days=30)
            
        
        stmt_total = select(func.count(Envio.id)).where(
            func.date(Envio.fecha_creacion) >= fecha_desde, 
            func.date(Envio.fecha_creacion) <= fecha_hasta
        )
        resultado_total = await db.execute(stmt_total)
        total_envios = resultado_total.scalar() or 0
        
        
        stmt_estados = (
            select(Envio.estado, func.count(Envio.id))
            .where(func.date(Envio.fecha_creacion) >= fecha_desde, func.date(Envio.fecha_creacion) <= fecha_hasta)
            .group_by(Envio.estado)
        )
        resultado_estados = await db.execute(stmt_estados)
        por_estado = {estado.value if hasattr(estado, 'value') else str(estado): cantidad for estado, cantidad in resultado_estados.all()}
        
        
        stmt_tipos = (
            select(Envio.tipo_envio, func.count(Envio.id))
            .where(func.date(Envio.fecha_creacion) >= fecha_desde, func.date(Envio.fecha_creacion) <= fecha_hasta)
            .group_by(Envio.tipo_envio)
        )
        resultado_tipos = await db.execute(stmt_tipos)
        por_tipo = {tipo.value if hasattr(tipo, 'value') else str(tipo): cantidad for tipo, cantidad in resultado_tipos.all()}
        
        
        stmt_historico = (
            select(func.date(Envio.fecha_creacion).label("fecha_dia"), func.count(Envio.id))
            .where(func.date(Envio.fecha_creacion) >= fecha_desde, func.date(Envio.fecha_creacion) <= fecha_hasta)
            .group_by(func.date(Envio.fecha_creacion))
            .order_by(func.date(Envio.fecha_creacion).asc())
        )
        resultado_historico = await db.execute(stmt_historico)
        historico_lineal = [{"fecha": fila[0], "cantidad": fila[1]} for fila in resultado_historico.all()]
        
        return {
            "total_envios": total_envios,
            "por_estado": por_estado,
            "por_tipo": por_tipo,
            "historico_lineal": historico_lineal
        }
        
        
    @staticmethod
    async def obtener_reporte_incidencias(
        db: AsyncSession, fecha_inicio: date, fecha_fin: date
    ) -> ReporteIncidenciasResponse:
        
        desde = datetime.combine(fecha_inicio, datetime.min.time())
        hasta = datetime.combine(fecha_fin, datetime.max.time())

        
        query = (
            select(Historial.motivo, func.count(Historial.id).label("total"))
            .where(
                Historial.fecha.between(desde, hasta),
                Historial.estado == EstadoEnvio.CANCELADO, 
                Historial.motivo.isnot(None),
                Historial.motivo != ""
            )
            .group_by(Historial.motivo)
        )

        result = await db.execute(query)
        filas = result.all()

        cancelaciones_dict = {}
        total_general = 0

        for motivo, total in filas:
            total_general += total
            causa_str = motivo or "No especificado"
            cancelaciones_dict[causa_str] = cancelaciones_dict.get(causa_str, 0) + total

        return ReporteIncidenciasResponse(
            total_incidencias=total_general,
            cancelaciones=[DesgloseCausa(causa=k, cantidad=v) for k, v in cancelaciones_dict.items()]
        )        