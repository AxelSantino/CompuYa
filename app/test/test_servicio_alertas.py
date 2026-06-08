import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.models.entidades import NotificacionApp
from app.services.servicio__alertas import crear_alerta_y_enviar_push

@pytest.mark.asyncio
async def test_crear_alerta_y_enviar_push_exitoso():
    
    db_mock = AsyncMock()
    db_mock.add = MagicMock()  

    
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        
        alerta = await crear_alerta_y_enviar_push(
            db=db_mock,
            usuario_id=42,
            titulo="Tu envío llegó",
            mensaje="El paquete ya está listo.",
            envio_id=101
        )

        
        assert alerta.usuario_id == 42
        assert alerta.titulo == "Tu envío llegó"
        assert alerta.mensaje == "El paquete ya está listo."
        assert alerta.envio_id == 101

        
        db_mock.add.assert_called_once()
        db_mock.commit.assert_called_once()
        db_mock.refresh.assert_called_once()

        
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        assert "https://ntfy.sh/logitrack_user_42" in args[0]
        assert kwargs["headers"]["Title"] == "Tu envío llegó".encode('utf-8')


@pytest.mark.asyncio
async def test_crear_alerta_y_enviar_push_captura_error_de_red_externo():
    db_mock = AsyncMock()
    db_mock.add = MagicMock()

   
    with patch("httpx.AsyncClient.post", side_effect=Exception("Timeout de red")):
        
        alerta = await crear_alerta_y_enviar_push(
            db=db_mock,
            usuario_id=42,
            titulo="Error Test",
            mensaje="Prueba de caída",
            envio_id=None
        )

        
        assert alerta.titulo == "Error Test"
        db_mock.commit.assert_called_once()