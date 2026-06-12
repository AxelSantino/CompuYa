import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from fastapi import HTTPException
from app.models.entidades import Envio, EstadoEnvio, PlantillaNotificacion
from app.services.servicio_notificacion import NotificacionService

# --- SOLUCIÓN: Reemplazamos todo el objeto settings usando patch ---
@pytest.fixture(autouse=True)
def mock_settings_resend():
    with patch("app.services.servicio_notificacion.settings") as mock_settings:
        mock_settings.RESEND_API_KEY = "test-key-mock"
        yield mock_settings
# -------------------------------------------------------------------

@pytest.mark.asyncio
async def test_notificacion_falla_si_falta_configuracion_resend():
    db_mock = AsyncMock()
    
    # Para este test específico, mockeamos que la llave es None
    with patch("app.services.servicio_notificacion.settings") as mock_settings:
        mock_settings.RESEND_API_KEY = None
        servicio = NotificacionService(db=db_mock)
        
        envio_mock = MagicMock(spec=Envio)
        
        await servicio.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")
        
        db_mock.execute.assert_not_called()

@pytest.mark.asyncio
async def test_notificacion_ignorada_si_no_hay_plantilla_activa():
    db_mock = AsyncMock()
    
    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = None
    db_mock.execute.return_value = resultado_mock
    
    servicio = NotificacionService(db=db_mock)
    
    envio_mock = MagicMock(spec=Envio)
    envio_mock.estado.value = "en_transito"
    
    await servicio.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")
    
    db_mock.execute.assert_called_once()
    db_mock.add.assert_not_called()

@pytest.mark.asyncio
async def test_notificacion_captura_error_de_formato_key_error():
    db_mock = AsyncMock()
    
    plantilla_mock = MagicMock(spec=PlantillaNotificacion)
    plantilla_mock.asunto = "Tu envío"
    plantilla_mock.cuerpo = "Hola {nombre_cliente}, tu código es {tag_que_no_existe}" 
    
    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = plantilla_mock
    db_mock.execute.return_value = resultado_mock
    
    servicio = NotificacionService(db=db_mock)
    
    envio_mock = MagicMock(spec=Envio)
    envio_mock.estado.value = "en_transito"
    envio_mock.tracking_id = "CY-1234"
    
    await servicio.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")
    
    db_mock.add.assert_not_called()

@pytest.mark.asyncio
async def test_notificacion_flujo_exitoso_guarda_historial_ok():
    db_mock = AsyncMock()
    db_mock.add = MagicMock()
    
    plantilla_mock = MagicMock(spec=PlantillaNotificacion)
    plantilla_mock.asunto = "Actualización"
    plantilla_mock.cuerpo = "Hola {nombre_cliente}, tu producto es {descripcion_producto}"
    
    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = plantilla_mock
    db_mock.execute.return_value = resultado_mock
    
    servicio = NotificacionService(db=db_mock)
    
    envio_mock = MagicMock(spec=Envio)
    envio_mock.id = 1
    envio_mock.estado.value = "entregado"
    envio_mock.tracking_id = "CY-5555"
    envio_mock.descripcion = "Zapatillas"
    
    # Cambiado aiosmtplib por resend.Emails.send
    with patch("resend.Emails.send", new_callable=MagicMock) as mock_send:
        await servicio.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")
        mock_send.assert_called_once()
        
    db_mock.add.assert_called_once()
    historial_guardado = db_mock.add.call_args[0][0]
    
    assert historial_guardado.resultado == "Exitoso"
    assert historial_guardado.canal == "correo"
    
    db_mock.commit.assert_called_once()

@pytest.mark.asyncio
async def test_notificacion_captura_excepcion_resend_y_guarda_error_en_historial():
    db_mock = AsyncMock()
    db_mock.add = MagicMock()
    
    plantilla_mock = MagicMock(spec=PlantillaNotificacion)
    plantilla_mock.asunto = "Actualización"
    plantilla_mock.cuerpo = "Hola {nombre_cliente}"
    
    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = plantilla_mock
    db_mock.execute.return_value = resultado_mock
    
    servicio = NotificacionService(db=db_mock)
    
    envio_mock = MagicMock(spec=Envio)
    envio_mock.id = 1
    envio_mock.estado.value = "entregado"
    envio_mock.tracking_id = "CY-5555"
    envio_mock.descripcion = "Zapatillas"
    
    # Simulamos que Resend tira un error al intentar enviar
    with patch("resend.Emails.send", new_callable=MagicMock, side_effect=Exception("Resend API Failure")):
        await servicio.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")
        
    db_mock.add.assert_called_once()
    historial_guardado = db_mock.add.call_args[0][0]

    assert historial_guardado.resultado == "Fallido"
    assert "Resend API Failure" in historial_guardado.motivo_error
    
    db_mock.commit.assert_called_once()