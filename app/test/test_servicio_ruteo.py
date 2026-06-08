import pytest
from unittest.mock import AsyncMock, MagicMock
from app.models.entidades import Sucursal
from app.services.servicio_ruteo import ServicioRuteo

def test_calcular_distancia_haversine_da_cero_para_mismas_coordenadas():
    servicio = ServicioRuteo(db=AsyncMock())
    distancia = servicio.calcular_distancia_haversine(-34.6432, -58.5985, -34.6432, -58.5985)
    assert distancia == 0.0


def test_calcular_distancia_haversine_calcula_distancia_correcta_entre_puntos():
    servicio = ServicioRuteo(db=AsyncMock())
    distancia = servicio.calcular_distancia_haversine(-34.6037, -58.3816, -34.6432, -58.5985)
    assert distancia > 0
    assert round(distancia, 1) == 20.3


from app.services.servicio_ruteo import ServicioRuteo, sucursales_cache

@pytest.mark.asyncio
async def test_obtener_sucursal_mas_cercana_devuelve_none_si_no_hay_sucursales():
    sucursales_cache.clear() # Limpiamos caché para el test
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalars().all.return_value = []
    db_mock.execute.return_value = resultado_mock

    servicio = ServicioRuteo(db=db_mock)
    sucursal = await servicio.obtener_sucursal_mas_cercana(-34.6, -58.6)

    assert sucursal is None


@pytest.mark.asyncio
async def test_obtener_sucursal_mas_cercana_elige_la_de_menor_distancia():
    sucursales_cache.clear() 
    sucursal_lejos = Sucursal()
    sucursal_lejos.id = 1
    sucursal_lejos.latitud = -34.6037
    sucursal_lejos.longitud = -58.3816

    sucursal_cerca = Sucursal()
    sucursal_cerca.id = 2
    sucursal_cerca.latitud = -34.6400
    sucursal_cerca.longitud = -58.5900

    db_mock = AsyncMock()
    db_mock.expunge = MagicMock()
    resultado_mock = MagicMock()
    resultado_mock.scalars().all.return_value = [sucursal_lejos, sucursal_cerca]
    db_mock.execute.return_value = resultado_mock

    servicio = ServicioRuteo(db=db_mock)
    sucursal_elegida = await servicio.obtener_sucursal_mas_cercana(-34.6432, -58.5985)

    assert sucursal_elegida.id == 2