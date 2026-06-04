import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from fastapi import HTTPException
from app.models.entidades import Envio, EstadoEnvio, PlantillaNotificacion
from app.services.servicio_notificacion import NotificacionService

@pytest.mark.asyncio
async def test_notificacion_falla_si_falta_configuracion_smtp():
    db_mock = AsyncMock()
    servicio = NotificacionService(db=db_mock)
    
    
    servicio.smtp_host = None
    
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
    servicio.smtp_host = "smtp.test.com"
    servicio.smtp_user = "user@test.com"
    servicio.smtp_password = "password123"
    
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
    servicio.smtp_host = "smtp.test.com"
    servicio.smtp_user = "user@test.com"
    servicio.smtp_password = "password123"
    
    envio_mock = MagicMock(spec=Envio)
    envio_mock.id = 1
    envio_mock.estado.value = "entregado"
    envio_mock.tracking_id = "CY-5555"
    envio_mock.descripcion = "Zapatillas"
    
    
    with patch("aiosmtplib.send", new_callable=AsyncMock) as mock_send:
        await servicio.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")
        
        mock_send.assert_called_once()
        
    
    db_mock.add.assert_called_once()
    historial_guardado = db_mock.add.call_args[0][0]
    assert historial_guardado.resultado == "Enviado OK"
    db_mock.commit.assert_called_once()


@pytest.mark.asyncio
async def test_notificacion_captura_excepcion_smtp_y_guarda_error_en_historial():
    db_mock = AsyncMock()
    db_mock.add = MagicMock()
    
    plantilla_mock = MagicMock(spec=PlantillaNotificacion)
    plantilla_mock.asunto = "Actualización"
    plantilla_mock.cuerpo = "Hola {nombre_cliente}"
    
    resultado_mock = MagicMock()
    resultado_mock.scalars().first.return_value = plantilla_mock
    db_mock.execute.return_value = resultado_mock
    
    servicio = NotificacionService(db=db_mock)
    servicio.smtp_host = "smtp.test.com"
    servicio.smtp_user = "user@test.com"
    servicio.smtp_password = "password123"
    
    envio_mock = MagicMock(spec=Envio)
    envio_mock.id = 1
    envio_mock.estado.value = "entregado"
    envio_mock.tracking_id = "CY-5555"
    envio_mock.descripcion = "Zapatillas"
    
    
    with patch("aiosmtplib.send", new_callable=AsyncMock, side_effect=Exception("Auth Failure")):
        await servicio.procesar_notificacion_estado(envio_mock, "test@cliente.com", "Juan")
        
    
    db_mock.add.assert_called_once()
    historial_guardado = db_mock.add.call_args[0][0]
    assert "Error: Auth Failure" in historial_guardado.resultado
    db_mock.commit.assert_called_once()