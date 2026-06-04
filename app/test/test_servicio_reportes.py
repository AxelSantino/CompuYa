import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import date
from app.services.servicio_reportes import ServicioReportes

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