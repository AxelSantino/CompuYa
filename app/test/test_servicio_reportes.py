import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import date, datetime, timedelta
from app.models.entidades import Envio, EstadoEnvio
from app.services.servicio_reportes import ServicioReportes

@pytest.mark.asyncio
async def test_reporte_volumen_vacio():
    db_mock = AsyncMock()
    
    mock_resultado = MagicMock()
    mock_resultado.scalar.return_value = 0
    mock_resultado.all.return_value = []
    db_mock.execute.return_value = mock_resultado
    
    servicio = ServicioReportes(db_mock)
    
    resultado = await servicio.obtener_reporte_volumen()
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
    
    servicio = ServicioReportes(db_mock)
    resultado = await servicio.obtener_reporte_volumen(date(2026, 5, 1), date(2026, 5, 31))
    
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
    
    servicio = ServicioReportes(db_mock)
    reporte = await servicio.obtener_reporte_incidencias(fecha_ini, fecha_fin)
    
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
    
    servicio = ServicioReportes(db_mock)
    reporte = await servicio.obtener_reporte_incidencias(fecha_ini, fecha_fin)
    
    assert reporte.total_incidencias == 0
    assert len(reporte.cancelaciones) == 0
    
     
    
@pytest.mark.asyncio
async def test_calculo_tasa_y_definicion_a_tiempo():
    db_mock = AsyncMock()
    
    mock_res_total = MagicMock()
    mock_res_total.scalar.return_value = 4
    
    mock_res_a_tiempo = MagicMock()
    mock_res_a_tiempo.scalar.return_value = 3
    
    db_mock.execute.side_effect = [mock_res_total, mock_res_a_tiempo]
    
    servicio = ServicioReportes(db_mock) 
    
    fecha_mock = date(2026, 6, 1)
    
    resultado = await servicio.obtener_tasa_entregas_a_tiempo(fecha_mock, fecha_mock)
    
    if "total_envios" in resultado:
        assert resultado["total_envios"] == 4
    else:
        assert resultado["total_entregados"] == 4
        
    assert resultado["entregados_a_tiempo"] == 3
    assert resultado["tasa_entrega"] == 75.0


@pytest.mark.asyncio
async def test_filtros_temporales():
    db_mock = AsyncMock()
    
    mock_res_total = MagicMock()
    mock_res_total.scalar.return_value = 5
    
    mock_res_a_tiempo = MagicMock()
    mock_res_a_tiempo.scalar.return_value = 2
    
    db_mock.execute.side_effect = [mock_res_total, mock_res_a_tiempo]
    
    servicio = ServicioReportes(db_mock)
    
    fecha_inicio = date(2026, 5, 1)
    fecha_fin = date(2026, 5, 31)
    
    resultado = await servicio.obtener_tasa_entregas_a_tiempo(fecha_inicio, fecha_fin)
    
    assert resultado["entregados_a_tiempo"] == 2
    assert resultado["tasa_entrega"] == 40.0   
    
    
@pytest.mark.asyncio
async def test_tasa_demora():
    
    db_mock = AsyncMock()
    
    
    mock_res_total = MagicMock()
    mock_res_total.scalar.return_value = 10
    
    
    mock_res_demora = MagicMock()
    mock_res_demora.scalar.return_value = 2
    
    db_mock.execute.side_effect = [mock_res_total, mock_res_demora]
    
    
    servicio = ServicioReportes(db_mock)
    fecha_mock = date(2026, 6, 1)
    
    
    resultado = await servicio.obtener_tasa_entregas_con_demora(fecha_mock, fecha_mock)
    
    assert resultado["total_envios"] == 10
    assert resultado["entregados_con_demora"] == 2
    assert resultado["tasa_demora"] == 20.0


@pytest.mark.asyncio
async def test_prueba_filtros_rangos_tiempo_demora():
  
    db_mock = AsyncMock()
    
    mock_res_total = MagicMock()
    mock_res_total.scalar.return_value = 5 
    
    mock_res_demora = MagicMock()
    mock_res_demora.scalar.return_value = 3
    
    db_mock.execute.side_effect = [mock_res_total, mock_res_demora]
    
    servicio = ServicioReportes(db_mock)
    
    fecha_inicio = date(2026, 6, 1)
    fecha_fin = date(2026, 6, 15)
    
    resultado = await servicio.obtener_tasa_entregas_con_demora(fecha_inicio, fecha_fin)
    
    assert resultado["total_envios"] == 5
    assert resultado["entregados_con_demora"] == 3
    assert resultado["tasa_demora"] == 60.0