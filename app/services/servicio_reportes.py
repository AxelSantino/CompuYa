from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from app.models.entidades import Envio  

class ServicioReportes:
    
    @staticmethod
    def obtener_reporte_volumen(db: Session, fecha_desde: date = None, fecha_hasta: date = None):
        # por defecto se calculan los últimos 30 días
        if not fecha_hasta:
            fecha_hasta = date.today()
        if not fecha_desde:
            fecha_desde = fecha_hasta - timedelta(days=30)
            
       
        consulta_base = db.query(Envio).filter(Envio.fecha_creacion >= fecha_desde, Envio.fecha_creacion <= fecha_hasta)
        
        
        total_envios = consulta_base.count()
        
        resumen_estados = (
            db.query(Envio.estado, func.count(Envio.id))
            .filter(Envio.fecha_creacion >= fecha_desde, Envio.fecha_creacion <= fecha_hasta)
            .group_by(Envio.estado)
            .all()
        )
        por_estado = {estado: cantidad for estado, cantidad in resumen_estados}
        
        resumen_tipos = (
            db.query(Envio.tipo_envio, func.count(Envio.id))
            .filter(Envio.fecha_creacion >= fecha_desde, Envio.fecha_creacion <= fecha_hasta)
            .group_by(Envio.tipo_envio)
            .all()
        )
        por_tipo = {str(tipo): cantidad for tipo, cantidad in resumen_tipos}
        
        resumen_historico = (
            db.query(Envio.fecha_creacion, func.count(Envio.id))
            .filter(Envio.fecha_creacion >= fecha_desde, Envio.fecha_creacion <= fecha_hasta)
            .group_by(Envio.fecha_creacion)
            .order_by(Envio.fecha_creacion.asc())
            .all()
        )
        historico_lineal = [{"fecha": fecha, "cantidad": cantidad} for fecha, cantidad in resumen_historico]
        
        
        return {
            "total_envios": total_envios,
            "por_estado": por_estado,
            "por_tipo": por_tipo,
            "historico_lineal": historico_lineal
        }