import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from app.models.entidades import Envio, EstadoEnvio, Usuario
from app.services.servicios_envios import EnvioService

def test_generar_tracking_id_devuelve_formato_correcto():
    servicio = EnvioService(db=AsyncMock())
    tracking = servicio.generar_tracking_id()
    assert tracking.startswith("CY-")
    assert len(tracking) == 12


@pytest.mark.asyncio
async def test_entregar_envio_funciona_si_esta_en_transito():
    envio_mock = Envio()
    envio_mock.id = 123
    envio_mock.tracking_id = "CY-2026-TEST"
    envio_mock.estado = EstadoEnvio.EN_TRANSITO

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = envio_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    
    with patch.object(servicio, 'registrar_historial', new_callable=AsyncMock) as mock_historial:
        resultado = await servicio.entregar_envio("CY-2026-TEST", usuario_id=5)
        assert resultado.estado == EstadoEnvio.ENTREGADO
        mock_historial.assert_called_once_with(123, 5, EstadoEnvio.ENTREGADO)


@pytest.mark.asyncio
async def test_entregar_envio_falla_si_no_esta_en_transito():
    envio_mock = Envio()
    envio_mock.tracking_id = "CY-2026-TEST"
    envio_mock.estado = EstadoEnvio.EN_SUCURSAL

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = envio_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.entregar_envio("CY-2026-TEST", usuario_id=5)

    assert info_error.value.status_code == 400


@pytest.mark.asyncio
async def test_cancelar_envio_falla_si_ya_fue_entregado():
    envio_mock = Envio()
    envio_mock.tracking_id = "CY-2026-TEST"
    envio_mock.estado = EstadoEnvio.ENTREGADO

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = envio_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.cancelar_envio("CY-2026-TEST", usuario_id=5)

    assert info_error.value.status_code == 400


@pytest.mark.asyncio
async def test_actualizar_estado_a_cancelado_da_error_si_usuario_es_repartidor():
    envio_mock = Envio()
    envio_mock.tracking_id = "CY-2026-TEST"
    envio_mock.estado = EstadoEnvio.EN_SUCURSAL

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = envio_mock
    db_mock.execute.return_value = resultado_mock

    usuario_comun = Usuario(id=8, rol="repartidor")

    servicio = EnvioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.actualizar_estado_envio("CY-2026-TEST", EstadoEnvio.CANCELADO, usuario_comun)

    assert info_error.value.status_code == 403


@pytest.mark.asyncio
async def test_asignar_envio_manual_falla_si_no_esta_en_sucursal():
    envio_mock = Envio()
    envio_mock.tracking_id = "CY-2026-TEST"
    envio_mock.estado = EstadoEnvio.ENTREGADO

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = envio_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.asignar_envio_manual("CY-2026-TEST", 123)

    assert info_error.value.status_code == 400


@pytest.mark.asyncio
async def test_asignar_todos_pendientes_avisa_si_la_sucursal_esta_vacia():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalars().all.return_value = []
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    respuesta = await servicio.asignar_todos_pendientes()

    assert respuesta["asignados"] == 0
    assert "No hay envíos pendientes" in respuesta["message"]