from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from app.services.servicio_notificacion import NotificacionService
from app.models.entidades import PlantillaNotificacion, Envio, HistorialNotificacion

@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.add = MagicMock()
    return db

@pytest.fixture
def servicio_configurado(mock_db):
    servicio = NotificacionService(db=mock_db)
    servicio.smtp_host = "fake_host.com"
    servicio.smtp_user = "fake_user@test.com"
    servicio.smtp_password = "fake_password123"
    return servicio

@pytest.fixture
def envio_mock():
    envio = MagicMock(spec=Envio)
    envio.id = 1
    envio.tracking_id = "CY-5555"
    envio.descripcion = "Zapatillas"
    return envio


@pytest.mark.asyncio
async def test_notificacion_falla_si_falta_configuracion_smtp(servicio_configurado, mock_db, envio_mock):
    servicio_configurado.smtp_host = None 
    envio_mock.estado.value = "entregado"
    
    await servicio_configurado.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")
    
    mock_db.execute.assert_not_called()

@pytest.mark.asyncio
async def test_notificacion_ignorada_sin_plantilla(servicio_configurado, mock_db, envio_mock):
    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = None
    mock_db.execute.return_value = resultado_mock
    envio_mock.estado.value = "en_transito"
    
    await servicio_configurado.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")
    
    mock_db.execute.assert_called_once()
    mock_db.add.assert_not_called()


@pytest.mark.asyncio
async def test_notificacion_flujo_exitoso_guarda_historial_ok(servicio_configurado, mock_db, envio_mock):
    plantilla_mock = MagicMock(spec=PlantillaNotificacion)
    plantilla_mock.asunto = "Actualización"
    plantilla_mock.cuerpo = "Hola {nombre_cliente}"

    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = plantilla_mock
    mock_db.execute.return_value = resultado_mock
    envio_mock.estado.value = "entregado"

    with patch("aiosmtplib.send", new_callable=AsyncMock) as mock_send:
        await servicio_configurado.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")
        mock_send.assert_called_once()

    mock_db.add.assert_called_once()
    historial_guardado = mock_db.add.call_args[0][0]
    assert historial_guardado.resultado == "Exitoso"

@pytest.mark.asyncio
async def test_notificacion_captura_excepcion_smtp_y_guarda_error_en_historial(servicio_configurado, mock_db, envio_mock):
    plantilla_mock = MagicMock(spec=PlantillaNotificacion)
    plantilla_mock.asunto = "Actualización"
    plantilla_mock.cuerpo = "Hola {nombre_cliente}"

    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = plantilla_mock
    mock_db.execute.return_value = resultado_mock
    envio_mock.estado.value = "entregado"

    with patch("aiosmtplib.send", new_callable=AsyncMock, side_effect=Exception("SMTP API Failure")):
        await servicio_configurado.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")

    mock_db.add.assert_called_once()
    historial_guardado = mock_db.add.call_args[0][0]

    assert historial_guardado.resultado == "Fallido"
    assert "SMTP API Failure" in historial_guardado.motivo_error


@pytest.mark.asyncio
async def test_obtener_historial_auditoria(servicio_configurado, mock_db):
    resultado_mock = MagicMock()
    resultado_mock.scalars().all.return_value = ["historial_1", "historial_2"]
    mock_db.execute.return_value = resultado_mock

    historial = await servicio_configurado.obtener_historial_auditoria()

    mock_db.execute.assert_called_once()
    assert len(historial) == 2
    assert historial == ["historial_1", "historial_2"]


@pytest.mark.asyncio
async def test_notificacion_falla_por_etiqueta_faltante_en_plantilla(servicio_configurado, mock_db, envio_mock):
    plantilla_mock = MagicMock(spec=PlantillaNotificacion)
    plantilla_mock.asunto = "Actualización"
    plantilla_mock.cuerpo = "Hola {variable_inventada_que_no_existe}"

    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = plantilla_mock
    mock_db.execute.return_value = resultado_mock
    envio_mock.estado.value = "entregado"
    await servicio_configurado.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")
    mock_db.execute.assert_called_once()

    mock_db.add.assert_not_called()