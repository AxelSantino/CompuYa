import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException, status
from app.models.entidades import PlantillaNotificacion, EstadoEnvio
from app.models.esquemas import PlantillaNotificacionBase
from app.services.servicio_plantillas import PlantillaService



@pytest.mark.asyncio
async def test_obtener_todas_devuelve_lista_vacia_si_no_hay_registros():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalars().all.return_value = []
    db_mock.execute.return_value = resultado_mock

    servicio = PlantillaService(db=db_mock)
    plantillas = await servicio.obtener_todas()

    assert plantillas == []
    db_mock.execute.assert_called_once()


@pytest.mark.asyncio
async def test_obtener_todas_devuelve_coleccion_de_plantillas():
    plantilla_mock = PlantillaNotificacion(id=1, asunto="Prueba")
    
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalars().all.return_value = [plantilla_mock]
    db_mock.execute.return_value = resultado_mock

    servicio = PlantillaService(db=db_mock)
    plantillas = await servicio.obtener_todas()

    assert len(plantillas) == 1
    assert plantillas[0].asunto == "Prueba"




@pytest.mark.asyncio
async def test_crear_plantilla_exitoso():
    
    plantilla_in = PlantillaNotificacionBase(
        estado_disparador=EstadoEnvio.EN_SUCURSAL,
        asunto="Paquete en camino",
        cuerpo="Tu paquete llegó a la sucursal.",
        activa=True
    )

    db_mock = AsyncMock()
    db_mock.add = MagicMock()
    
    
    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = None
    db_mock.execute.return_value = resultado_mock

    servicio = PlantillaService(db=db_mock)
    nueva_plantilla = await servicio.crear_plantilla(plantilla_in)

    # Verificaciones
    assert nueva_plantilla.asunto == "Paquete en camino"
    assert nueva_plantilla.estado_disparador == "en sucursal"
    db_mock.add.assert_called_once()
    db_mock.commit.assert_called_once()
    db_mock.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_crear_plantilla_falla_si_el_estado_ya_tiene_plantilla():
    plantilla_in = PlantillaNotificacionBase(
        estado_disparador=EstadoEnvio.EN_SUCURSAL,
        asunto="Otro asunto",
        cuerpo="Otro cuerpo",
        activa=True
    )

    
    plantilla_existente = PlantillaNotificacion(id=1, estado_disparador="en sucursal")
    
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = plantilla_existente
    db_mock.execute.return_value = resultado_mock

    servicio = PlantillaService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.crear_plantilla(plantilla_in)

    assert info_error.value.status_code == status.HTTP_400_BAD_REQUEST
    assert "Ya existe una plantilla para el estado" in info_error.value.detail




@pytest.mark.asyncio
async def test_editar_plantilla_exitoso():
    plantilla_existente = PlantillaNotificacion(
        id=5, 
        estado_disparador="en sucursal", 
        asunto="Viejo Asunto", 
        cuerpo="Viejo Cuerpo", 
        activa=False
    )

    plantilla_in = PlantillaNotificacionBase(
        estado_disparador=EstadoEnvio.ENTREGADO,
        asunto="Nuevo Asunto",
        cuerpo="Nuevo Cuerpo",
        activa=True
    )

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = plantilla_existente
    db_mock.execute.return_value = resultado_mock

    servicio = PlantillaService(db=db_mock)
    plantilla_editada = await servicio.editar_plantilla(id=5, plantilla_in=plantilla_in)

   
    assert plantilla_editada.asunto == "Nuevo Asunto"
    assert plantilla_editada.cuerpo == "Nuevo Cuerpo"
    assert plantilla_editada.estado_disparador == "entregado"
    assert plantilla_editada.activa is True
    db_mock.commit.assert_called_once()
    db_mock.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_editar_plantilla_falla_si_id_no_existe():
    plantilla_in = PlantillaNotificacionBase(
        estado_disparador=EstadoEnvio.ENTREGADO,
        asunto="Asunto",
        cuerpo="Cuerpo",
        activa=True
    )

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = None  
    db_mock.execute.return_value = resultado_mock

    servicio = PlantillaService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.editar_plantilla(id=99, plantilla_in=plantilla_in)

    assert info_error.value.status_code == status.HTTP_404_NOT_FOUND
    assert "Plantilla no encontrada" in info_error.value.detail