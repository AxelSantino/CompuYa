import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import date
from app.services.servicio_reportes import ServicioReportes
from app.models.entidades import Envio

def test_reporte_volumen_vacio():
    db_mock = MagicMock()
    
    db_mock.query.return_value.filter.return_value.count.return_value = 0
    db_mock.query.return_value.filter.return_value.group_by.return_value.all.return_value = []
    db_mock.query.return_value.filter.return_value.group_by.return_value.order_by.return_value.all.return_value = []
    
    resultado = ServicioReportes.obtener_reporte_volumen(db_mock)
    
    assert resultado["total_envios"] == 0
    assert resultado["por_estado"] == {}
    assert resultado["por_tipo"] == {}
    assert resultado["historico_lineal"] == []


def test_reporte_volumen_con_filtros_fecha():
    
    db_mock = MagicMock()
    
    db_mock.query.return_value.filter.return_value.count.return_value = 2
    
    db_mock.query.return_value.filter.return_value.group_by.return_value.all.side_effect = [
        [("en_transito", 1), ("entregado", 1)],
        [("express", 1), ("normal", 1)]          
    ]
    
    db_mock.query.return_value.filter.return_value.group_by.return_value.order_by.return_value.all.return_value = [
        (date(2026, 5, 20), 1),
        (date(2026, 5, 21), 1)
    ]
    
    desde = date(2026, 5, 1)
    hasta = date(2026, 5, 31)
    resultado = ServicioReportes.obtener_reporte_volumen(db_mock, fecha_desde=desde, fecha_hasta=hasta)
    
    assert resultado["total_envios"] == 2
    assert resultado["por_estado"]["en_transito"] == 1
    assert resultado["por_estado"]["entregado"] == 1
    assert resultado["por_tipo"]["express"] == 1
    assert resultado["por_tipo"]["normal"] == 1
    assert len(resultado["historico_lineal"]) == 2
    assert resultado["historico_lineal"][0]["fecha"] == date(2026, 5, 20)