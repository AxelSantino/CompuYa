import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import date, datetime, timedelta
from app.models.entidades import Envio, EstadoEnvio
from app.services.servicio_reportes import ServicioReportes
from app.services.servicios_envios import EnvioService

@pytest.mark.asyncio
async def test_reporte_volumen_vacio():
    db_mock = AsyncMock()
    
    mock_resultado = MagicMock()
    mock_resultado.scalar.return_value = 0
    mock_resultado.all.return_value = []
    db_mock.execute.return_value = mock_resultado
    
    resultado = await ServicioReportes.obtener_reporte_volumen(db_mock)
    assert resultado["total_envios"] == 0
    assert resultado["por_estado"] == {}

@pytest.mark.asyncio
async def test_reporte_volumen_con_filtros_fecha():
    db_mock = AsyncMock()
    
    mock_total = MagicMock()
    mock_total.scalar.return_value = 2
    
    mock_estados = MagicMock()
    mock_estados.all.return_value = [("en_transito", 1), ("entregado", 1)]
    
    mock_tipos = MagicMock()
    mock_tipos.all.return_value = [("express", 1), ("normal", 1)]
    
    mock_hist = MagicMock()
    mock_hist.all.return_value = [(date(2026, 5, 20), 1), (date(2026, 5, 21), 1)]
    
    db_mock.execute.side_effect = [mock_total, mock_estados, mock_tipos, mock_hist]
    
    resultado = await ServicioReportes.obtener_reporte_volumen(db_mock, date(2026, 5, 1), date(2026, 5, 31))
    assert resultado["total_envios"] == 2
    assert resultado["por_estado"]["en_transito"] == 1
    
    
    
@pytest.mark.asyncio
async def test_obtener_reporte_incidencias_exitoso():
    
    db_mock = AsyncMock()
    
    
    filas_mock = [
        ("Domicilio cerrado", 5),
        ("Dirección incorrecta", 2)
    ]
    
    resultado_mock = MagicMock()
    resultado_mock.all.return_value = filas_mock
    db_mock.execute.return_value = resultado_mock
    
    fecha_ini = date(2026, 6, 1)
    fecha_fin = date(2026, 6, 5)
    
    
    reporte = await ServicioReportes.obtener_reporte_incidencias(db_mock, fecha_ini, fecha_fin)
    
    assert reporte.total_incidencias == 7
    assert len(reporte.cancelaciones) == 2
    assert reporte.cancelaciones[0].causa == "Domicilio cerrado"
    assert reporte.cancelaciones[0].cantidad == 5
    assert reporte.cancelaciones[1].causa == "Dirección incorrecta"
    assert reporte.cancelaciones[1].cantidad == 2
    


@pytest.mark.asyncio
async def test_obtener_reporte_incidencias_vacio():
    db_mock = AsyncMock()
    
    resultado_mock = MagicMock()
    resultado_mock.all.return_value = []
    db_mock.execute.return_value = resultado_mock
    
    fecha_ini = date(2026, 6, 1)
    fecha_fin = date(2026, 6, 5)
    
    
    reporte = await ServicioReportes.obtener_reporte_incidencias(db_mock, fecha_ini, fecha_fin)
    
    assert reporte.total_incidencias == 0
    assert len(reporte.cancelaciones) == 0




@pytest.mark.asyncio
async def test_obtener_tasa_entregas_a_tiempo_division_por_cero():
    
    db_mock = AsyncMock()
    
    mock_res_total = MagicMock()
    mock_res_total.scalar.return_value = 0  
    
    mock_res_a_tiempo = MagicMock()
    mock_res_a_tiempo.scalar.return_value = 0
    
    db_mock.execute.side_effect = [mock_res_total, mock_res_a_tiempo]
    
    fecha_mock = date(2026, 6, 1)
    resultado = await ServicioReportes.obtener_tasa_entregas_a_tiempo(None, db_mock, fecha_mock, fecha_mock)
    
    
    assert resultado["entregados_a_tiempo"] == 0
    assert resultado["tasa_entrega"] == 0.0
    
    if "total_envios" in resultado:
        assert resultado["total_envios"] == 0
    else:
        assert resultado["total_entregados"] == 0

@pytest.mark.asyncio
async def test_obtener_tasa_entregas_a_tiempo_cero_por_ciento():
   
    db_mock = AsyncMock()
    
    mock_res_total = MagicMock()
    mock_res_total.scalar.return_value = 5  
    
    mock_res_a_tiempo = MagicMock()
    mock_res_a_tiempo.scalar.return_value = 0  # 
    
    db_mock.execute.side_effect = [mock_res_total, mock_res_a_tiempo]
    
    fecha_mock = date(2026, 6, 1)
    resultado = await ServicioReportes.obtener_tasa_entregas_a_tiempo(None, db_mock, fecha_mock, fecha_mock)
    
    assert resultado["entregados_a_tiempo"] == 0
    assert resultado["tasa_entrega"] == 0.0

@pytest.mark.asyncio
async def test_obtener_tasa_entregas_a_tiempo_cien_por_ciento():
    
    db_mock = AsyncMock()
    
    mock_res_total = MagicMock()
    mock_res_total.scalar.return_value = 8  
    
    mock_res_a_tiempo = MagicMock()
    mock_res_a_tiempo.scalar.return_value = 8  
    
    db_mock.execute.side_effect = [mock_res_total, mock_res_a_tiempo]
    
    fecha_mock = date(2026, 6, 1)
    resultado = await ServicioReportes.obtener_tasa_entregas_a_tiempo(None, db_mock, fecha_mock, fecha_mock)
    
    assert resultado["entregados_a_tiempo"] == 8
    assert resultado["tasa_entrega"] == 100.0
    
    
    
    
    