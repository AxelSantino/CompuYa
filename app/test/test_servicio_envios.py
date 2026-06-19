import datetime
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from app.models.entidades import Envio, EstadoEnvio, PerfilEmpresa, RestriccionEnvio, Sucursal, TipoEnvio, Usuario
from app.models.esquemas import CancelarEnvio, EditarEnvio, EnvioCrear
from app.services.servicios_envios import EnvioService
from datetime import datetime

@pytest.fixture(autouse=True)
def mock_settings_resend():
    with patch("app.services.servicio_notificacion.settings") as mock_settings:
        mock_settings.RESEND_API_KEY = "test-key-mock"
        yield mock_settings

def test_generar_tracking_id_devuelve_formato_correcto():
    servicio = EnvioService(db=AsyncMock())
    tracking = servicio.generar_tracking_id()
    assert tracking.startswith("CY-")
    assert len(tracking) == 12

@pytest.mark.asyncio
async def test_obtener_envio_por_id_falla_si_tracking_id_no_existe():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.unique().scalar_one_or_none.return_value = None
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.obtener_envio_por_id("CY-INVALID-ID")

    assert info_error.value.status_code == 404
    assert "Envio no encontrado" in info_error.value.detail

@pytest.mark.asyncio
async def test_entregar_envio_funciona_si_esta_en_transito():
    envio_mock = Envio()
    envio_mock.id = 123
    envio_mock.tracking_id = "CY-2026-TEST"
    envio_mock.estado = EstadoEnvio.EN_TRANSITO
    envio_mock.codigo_verificacion = "1234"

    db_mock = AsyncMock()
    db_mock.commit = AsyncMock()
    
    resultado_mock = MagicMock()
    resultado_mock.unique().scalar_one_or_none.return_value = envio_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    mock_bg = MagicMock() 
    
    with patch.object(servicio, 'registrar_historial', new_callable=AsyncMock) as mock_historial:
        with patch.object(servicio, 'obtener_envio_por_id', return_value=envio_mock):
            resultado = await servicio.entregar_envio(
                tracking_id="CY-2026-TEST",
                usuario_id=5,
                codigo_ingresado="1234",
                background_tasks=mock_bg
            )
            
            assert resultado.estado == EstadoEnvio.ENTREGADO
            assert db_mock.commit.await_count == 2

@pytest.mark.asyncio
async def test_entregar_envio_falla_si_no_esta_en_transito():
    envio_mock = Envio()
    envio_mock.tracking_id = "CY-2026-TEST"
    envio_mock.estado = EstadoEnvio.EN_SUCURSAL # Estado incorrecto

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.unique().scalar_one_or_none.return_value = envio_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    mock_bg = MagicMock()

    with pytest.raises(HTTPException) as info_error:
        with patch.object(servicio, 'obtener_envio_por_id', return_value=envio_mock):
            await servicio.entregar_envio(
                tracking_id="CY-2026-TEST",
                usuario_id=5,
                codigo_ingresado="1234",
                background_tasks=mock_bg
            )
            
    assert info_error.value.status_code == 400
@pytest.mark.asyncio
async def test_cancelar_envio_falla_si_ya_fue_entregado():
    envio_mock = Envio()
    envio_mock.tracking_id = "CY-2026-TEST"
    envio_mock.estado = EstadoEnvio.ENTREGADO

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.unique().scalar_one_or_none.return_value = envio_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    datos_cancelacion = CancelarEnvio(motivo="Prueba de error")
    mock_bg = MagicMock()

    with pytest.raises(HTTPException) as info_error:
        await servicio.cancelar_envio("CY-2026-TEST", usuario_id=5, datos_cancelacion=datos_cancelacion, background_tasks=mock_bg)

    assert info_error.value.status_code == 400

@pytest.mark.asyncio
async def test_actualizar_estado_a_cancelado_da_error_si_usuario_es_repartidor():
    envio_mock = Envio()
    envio_mock.tracking_id = "CY-2026-TEST"
    envio_mock.estado = EstadoEnvio.EN_SUCURSAL

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.unique().scalar_one_or_none.return_value = envio_mock
    db_mock.execute.return_value = resultado_mock

    usuario_comun = Usuario(id=8, rol="repartidor")
    servicio = EnvioService(db=db_mock)
    mock_bg = MagicMock()

    with pytest.raises(HTTPException) as info_error:
        await servicio.actualizar_estado_envio("CY-2026-TEST", EstadoEnvio.CANCELADO, usuario_comun, background_tasks=mock_bg)

    assert info_error.value.status_code == 403

@pytest.mark.asyncio
async def test_asignar_envio_manual_falla_si_no_esta_en_sucursal():
    envio_mock = Envio()
    envio_mock.tracking_id = "CY-2026-TEST"
    envio_mock.estado = EstadoEnvio.ENTREGADO

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.unique().scalar_one_or_none.return_value = envio_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    mock_bg = MagicMock()

    with pytest.raises(HTTPException) as info_error:
        await servicio.asignar_envio_manual("CY-2026-TEST", id_repartidor=1, background_tasks=mock_bg)

    assert info_error.value.status_code == 400

@pytest.mark.asyncio
async def test_asignar_envio_manual_falla_si_no_hay_repartidores():
    envio_mock = Envio()
    envio_mock.estado = EstadoEnvio.EN_SUCURSAL

    db_mock = AsyncMock()
    
    resultado_envio = MagicMock()
    resultado_envio.unique().scalar_one_or_none.return_value = envio_mock
    
    resultado_repartidor = MagicMock()
    resultado_repartidor.scalar_one_or_none.return_value = None
    
    db_mock.execute.side_effect = [resultado_envio, resultado_repartidor]

    servicio = EnvioService(db=db_mock)
    mock_bg = MagicMock()

    with pytest.raises(HTTPException) as info_error:
        await servicio.asignar_envio_manual("CY-TEST", id_repartidor=999, background_tasks=mock_bg)

    assert info_error.value.status_code == 404
    assert "No se encontró un repartidor" in info_error.value.detail

@pytest.mark.asyncio
async def test_asignar_todos_pendientes_avisa_si_la_sucursal_esta_vacia():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.unique().scalars().all.return_value = []
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    mock_bg = MagicMock()
    respuesta = await servicio.asignar_todos_pendientes(background_tasks=mock_bg)

    assert respuesta["asignados"] == 0
    assert "No hay envíos pendientes" in respuesta["message"]
    
@pytest.mark.asyncio
async def test_asignar_todos_pendientes_exitoso():
    envio_mock = Envio()
    envio_mock.id = 10
    envio_mock.tracking_id = "CY-2026-PEND"
    envio_mock.estado = EstadoEnvio.EN_SUCURSAL
    envio_mock.destinatario_id = 4
    envio_mock.destinatario = MagicMock()
    envio_mock.destinatario.email = "cliente@test.com"
    envio_mock.razon_social_destinatario = "Test S.A."

    fila_repartidor_mock = MagicMock()
    fila_repartidor_mock.id = 9
    fila_repartidor_mock.carga = 2  

    db_mock = AsyncMock()
    db_mock.add_all = MagicMock()
    
    res_envios = MagicMock()
    res_envios.unique().scalars().all.return_value = [envio_mock]
    
    res_carga = MagicMock()
    res_carga.all.return_value = [fila_repartidor_mock]
    
    db_mock.execute.side_effect = [res_envios, res_carga]

    servicio = EnvioService(db=db_mock)
    mock_bg = MagicMock()

    with patch('app.services.servicios_envios.crear_alerta_y_enviar_push', new_callable=AsyncMock):
        respuesta = await servicio.asignar_todos_pendientes(background_tasks=mock_bg)

        assert respuesta["asignados"] == 1
        assert envio_mock.estado == EstadoEnvio.EN_TRANSITO
        assert "exitosamente de forma masiva" in respuesta["message"]
        
        assert db_mock.commit.call_count >= 1
@pytest.mark.asyncio
async def test_actualizar_prioridades_pendientes_exitoso():
    envio_mock = Envio()
    envio_mock.estado = EstadoEnvio.EN_SUCURSAL
    envio_mock.prioridad = MagicMock()
    envio_mock.prioridad.value = "baja"
    envio_mock.fecha_creacion = datetime.now()
    envio_mock.latitud_destino = -34.66
    envio_mock.longitud_destino = -58.55
    envio_mock.tipo_envio = MagicMock()
    envio_mock.tipo_envio.value = "express"
    envio_mock.restriccion = MagicMock()
    envio_mock.restriccion.value = "ninguna"
    
    envio_mock.sucursal = MagicMock()
    envio_mock.sucursal.latitud = -34.60
    envio_mock.sucursal.longitud = -58.38

    db_mock = AsyncMock()
    res_envios = MagicMock()
    res_envios.unique().scalars().all.return_value = [envio_mock]
    db_mock.execute.return_value = res_envios

    servicio = EnvioService(db=db_mock)
    
    servicio.ruteo_service.calcular_distancia_haversine = MagicMock(return_value=15.5)
    
    with patch('app.services.servicios_envios.predecir_prioridad', return_value="alta") as mock_modelo:
        respuesta = await servicio.actualizar_prioridades_pendientes()
        
        assert respuesta["actualizados"] == 1
        assert envio_mock.prioridad == "alta"
        db_mock.commit.assert_called_once()
        
@pytest.mark.asyncio
async def test_obtener_hoja_ruta_ordena_por_proximidad():
    envio_lejos = Envio(id=1, latitud_destino=-34.90, longitud_destino=-58.90)
    envio_cerca = Envio(id=2, latitud_destino=-34.61, longitud_destino=-58.39)
    
    sucursal_mock = MagicMock(latitud=-34.60, longitud=-58.38)
    envio_lejos.sucursal = sucursal_mock
    envio_cerca.sucursal = sucursal_mock

    db_mock = AsyncMock()
    res_query = MagicMock()
    res_query.unique().scalars().all.return_value = [envio_lejos, envio_cerca]
    db_mock.execute.return_value = res_query

    servicio = EnvioService(db=db_mock)

    def mock_distancias(lat1, lon1, lat2, lon2):
        if lat2 == -34.61: return 1.0
        return 50.0
        
    servicio.ruteo_service.calcular_distancia_haversine = MagicMock(side_effect=mock_distancias)

    ruta_ordenada = await servicio.obtener_hoja_ruta(id_empleado=9)

    assert len(ruta_ordenada) == 2
    assert ruta_ordenada[0].id == 2
    assert ruta_ordenada[1].id == 1       
        
@pytest.mark.asyncio
async def test_crear_envio_exitoso_con_prediccion_ml():
    envio_in = EnvioCrear(
        razon_social_destinatario="CompuYa SRL",
        cuit_destinatario="30-12345678-9",
        descripcion="Caja de microprocesadores",
        tipo_envio=TipoEnvio.EXPRESS,
        restriccion=RestriccionEnvio.NINGUNA
    )

    db_mock = AsyncMock()
    db_mock.flush = AsyncMock()
    db_mock.commit = AsyncMock()
    db_mock.add = MagicMock() 

    perfil_empresa_mock = PerfilEmpresa(
        usuario_id=4,
        razon_social="CompuYa SRL",
        cuit="30-12345678-9",
        latitud=-34.61,
        longitud=-58.39
    )
    res_perfil = MagicMock()
    res_perfil.scalar_one_or_none.return_value = perfil_empresa_mock

    usuario_mock = Usuario(id=4, email="cliente@compuya.com")
    res_usuario = MagicMock()
    res_usuario.scalar_one_or_none.return_value = usuario_mock

    db_mock.execute.side_effect = [res_perfil, res_usuario]

    servicio = EnvioService(db=db_mock)

    sucursal_mock = Sucursal(id=1, latitud=-34.60, longitud=-58.38)
    servicio.ruteo_service.obtener_sucursal_mas_cercana = AsyncMock(return_value=sucursal_mock)
    servicio.ruteo_service.calcular_distancia_haversine = MagicMock(return_value=12.5)

    envio_final_mock = Envio(tracking_id="CY-2026-OK", estado=EstadoEnvio.EN_SUCURSAL)
    mock_bg = MagicMock()
    
    with patch('app.services.servicios_envios.predecir_prioridad', return_value=MagicMock(value="alta")):
        with patch.object(servicio, 'registrar_historial', new_callable=AsyncMock) as mock_hist:
            with patch.object(servicio, 'obtener_envio_por_id', new_callable=AsyncMock, return_value=envio_final_mock):
                with patch('app.services.servicios_envios.crear_alerta_y_enviar_push', new_callable=AsyncMock) as mock_alerta:
                    
                    resultado = await servicio.crear_envio(envio_in, usuario_id=9, background_tasks=mock_bg)

                    assert resultado.tracking_id == "CY-2026-OK"
                    db_mock.add.assert_called_once() 
                    db_mock.flush.assert_called_once()
                    db_mock.commit.assert_called_once()
                    mock_hist.assert_called_once()
                    mock_alerta.assert_called_once()

@pytest.mark.asyncio
async def test_crear_envio_falla_si_perfil_empresa_no_existe():
    envio_in = EnvioCrear(
        razon_social_destinatario="Fantasma S.A.",
        cuit_destinatario="30-00000000-0",
        descripcion="Test",
        tipo_envio=TipoEnvio.EXPRESS,
        restriccion=RestriccionEnvio.NINGUNA
    )

    db_mock = AsyncMock()
    res_perfil = MagicMock()
    res_perfil.scalar_one_or_none.return_value = None 
    db_mock.execute.return_value = res_perfil

    servicio = EnvioService(db=db_mock)

    mock_bg = MagicMock()
    
    with pytest.raises(HTTPException) as info_error:
        await servicio.crear_envio(envio_in, usuario_id=9, background_tasks=mock_bg)

    assert info_error.value.status_code == 404
    assert "La empresa destinataria no existe" in info_error.value.detail

@pytest.mark.asyncio
async def test_editar_envio_exitoso_mutando_campos():
    envio_existente = Envio(
        id=7,
        tracking_id="CY-EDIT-TEST",
        estado=EstadoEnvio.EN_SUCURSAL,
        descripcion="Original",
        tipo_envio=TipoEnvio.EXPRESS,
        restriccion=RestriccionEnvio.NINGUNA
    )

    datos_nuevos = EditarEnvio(
        descripcion="Modificada con éxito",
        tipo_envio=TipoEnvio.EXPRESS,
        restriccion=RestriccionEnvio.NINGUNA,
        cuit_destinatario=None, 
        razon_social_destinatario=None
    )

    db_mock = AsyncMock()
    db_mock.commit = AsyncMock()
    servicio = EnvioService(db=db_mock)

    with patch.object(servicio, 'obtener_envio_por_id', new_callable=AsyncMock, return_value=envio_existente):
        resultado = await servicio.editar_envio("CY-EDIT-TEST", datos_nuevos, usuario_id=1)

        assert resultado.descripcion == "Modificada con éxito"
        db_mock.commit.assert_called_once()        
        
@pytest.mark.asyncio
async def test_editar_envio_cambiando_empresa_destino_exitoso():
    envio_existente = Envio(
        id=8, tracking_id="CY-EDIT-COMP", estado=EstadoEnvio.EN_SUCURSAL,
        cuit_destinatario="30-11111111-1", razon_social_destinatario="Vieja S.A."
    )

    datos_nuevos = EditarEnvio(
        cuit_destinatario="30-22222222-2",
        razon_social_destinatario="Nueva S.A."
    )

    empresa_nueva_mock = PerfilEmpresa(
        cuit="30-22222222-2", razon_social="Nueva S.A.",
        usuario_id=99, latitud=-34.50, longitud=-58.50
    )

    db_mock = AsyncMock()
    db_mock.commit = AsyncMock()
    
    resultado_query = MagicMock()
    resultado_query.scalars().first.return_value = empresa_nueva_mock
    db_mock.execute.return_value = resultado_query

    servicio = EnvioService(db=db_mock)

    with patch.object(servicio, 'obtener_envio_por_id', new_callable=AsyncMock, return_value=envio_existente):
        resultado = await servicio.editar_envio("CY-EDIT-COMP", datos_nuevos, usuario_id=1)

        assert resultado.cuit_destinatario == "30-22222222-2"
        assert resultado.razon_social_destinatario == "Nueva S.A."
        assert resultado.latitud_destino == -34.50
        db_mock.commit.assert_called_once()

@pytest.mark.asyncio
async def test_editar_envio_falla_si_nueva_empresa_no_existe():
    envio_existente = Envio(id=8, tracking_id="CY-EDIT-FAIL", estado=EstadoEnvio.EN_SUCURSAL)
    datos_nuevos = EditarEnvio(cuit_destinatario="30-99999999-9", razon_social_destinatario="Inexistente")

    db_mock = AsyncMock()
    resultado_query = MagicMock()
    resultado_query.scalars().first.return_value = None 
    db_mock.execute.return_value = resultado_query

    servicio = EnvioService(db=db_mock)

    with patch.object(servicio, 'obtener_envio_por_id', new_callable=AsyncMock, return_value=envio_existente):
        with pytest.raises(HTTPException) as info_error:
            await servicio.editar_envio("CY-EDIT-FAIL", datos_nuevos, usuario_id=1)

        assert info_error.value.status_code == 404
        assert "La empresa destino ingresada no existe" in info_error.value.detail        

@pytest.mark.asyncio
async def test_obtener_mail_destinatario_desde_objeto_o_db():
    db_mock = AsyncMock()
    servicio = EnvioService(db=db_mock)

    envio_con_relacion = Envio(destinatario=MagicMock(email="directo@test.com"))
    mail_a = await servicio.obtenerMailDestinatario(envio_con_relacion)
    assert mail_a == "directo@test.com"

    envio_sin_relacion = Envio(destinatario=None, destinatario_id=42)
    usuario_mock = Usuario(email="db@test.com")
    res_db = MagicMock()
    res_db.scalar_one_or_none.return_value = usuario_mock
    db_mock.execute.return_value = res_db

    mail_b = await servicio.obtenerMailDestinatario(envio_sin_relacion)
    assert mail_b == "db@test.com"

@pytest.mark.asyncio
async def test_crear_envio_falla_si_no_hay_sucursales_disponibles():
    envio_in = EnvioCrear(
        razon_social_destinatario="CompuYa SRL", cuit_destinatario="30-12345678-9",
        descripcion="Test", tipo_envio=TipoEnvio.EXPRESS, restriccion=RestriccionEnvio.NINGUNA
    )

    db_mock = AsyncMock()
    res_perfil = MagicMock()
    res_perfil.scalar_one_or_none.return_value = PerfilEmpresa(latitud=-34.6, longitud=-58.6)
    db_mock.execute.return_value = res_perfil

    servicio = EnvioService(db=db_mock)
    
    servicio.ruteo_service.obtener_sucursal_mas_cercana = AsyncMock(return_value=None)
    mock_bg = MagicMock()
    with pytest.raises(HTTPException) as info_error:
        await servicio.crear_envio(envio_in, usuario_id=1, background_tasks=mock_bg)

    assert info_error.value.status_code == 400
    assert "No hay sucursales disponibles" in info_error.value.detail

@pytest.mark.asyncio
async def test_editar_envio_falla_si_el_estado_no_es_permitido():
    envio_in_transito = Envio(tracking_id="CY-TR-123", estado=EstadoEnvio.EN_TRANSITO)
    datos_nuevos = EditarEnvio(descripcion="Intento de cambio")

    db_mock = AsyncMock()
    servicio = EnvioService(db=db_mock)

    with patch.object(servicio, 'obtener_envio_por_id', new_callable=AsyncMock, return_value=envio_in_transito):
        with pytest.raises(HTTPException) as info_error:
            await servicio.editar_envio("CY-TR-123", datos_nuevos, usuario_id=1)

        assert info_error.value.status_code == 400
        assert "El envío no se puede editar" in info_error.value.detail

@pytest.mark.asyncio
async def test_listar_envios_aplica_filtro_si_es_cliente():
    db_mock = AsyncMock()
    res_db = MagicMock()
    res_db.unique().scalars().all.return_value = [Envio(id=1)]
    db_mock.execute.return_value = res_db

    servicio = EnvioService(db=db_mock)

    usuario_cliente = Usuario(id=10, rol="cliente")
    resultados = await servicio.listar_envios(usuario_cliente)
    assert len(resultados) == 1
    db_mock.execute.assert_called_once()

@pytest.mark.asyncio
async def test_obtener_historial_envio_exitoso_y_error():
    db_mock = AsyncMock()
    servicio = EnvioService(db=db_mock)

    res_vacio = MagicMock()
    res_vacio.scalar_one_or_none.return_value = None
    db_mock.execute.return_value = res_vacio

    with pytest.raises(HTTPException) as info_error:
        await servicio.obtener_historial_envio("CY-NOT-FOUND")
    assert info_error.value.status_code == 404

    res_envio_id = MagicMock()
    res_envio_id.scalar_one_or_none.return_value = 500 
    
    res_historial = MagicMock()
    res_historial.unique().scalars().all.return_value = [MagicMock(), MagicMock()]
    
    db_mock.execute.side_effect = [res_envio_id, res_historial]
    
    historial = await servicio.obtener_historial_envio("CY-OK")
    assert len(historial) == 2        

@pytest.mark.asyncio
async def test_editar_envio_solo_cuit_destinatario_exitoso():
    envio_existente = Envio(id=11, tracking_id="CY-EDIT-CUIT", estado=EstadoEnvio.EN_SUCURSAL)
    
    datos_nuevos = EditarEnvio(
        cuit_destinatario="30-77777777-7",
        razon_social_destinatario=None
    )

    empresa_mock = PerfilEmpresa(cuit="30-77777777-7", razon_social="Solo Cuit SA", usuario_id=88)

    db_mock = AsyncMock()
    resultado_query = MagicMock()
    resultado_query.scalars().first.return_value = empresa_mock
    db_mock.execute.return_value = resultado_query

    servicio = EnvioService(db=db_mock)

    with patch.object(servicio, 'obtener_envio_por_id', new_callable=AsyncMock, return_value=envio_existente):
        resultado = await servicio.editar_envio("CY-EDIT-CUIT", datos_nuevos, usuario_id=1)
        assert resultado.cuit_destinatario == "30-77777777-7"

@pytest.mark.asyncio
async def test_editar_envio_solo_razon_social_exitoso():
    envio_existente = Envio(id=12, tracking_id="CY-EDIT-RAZON", estado=EstadoEnvio.EN_SUCURSAL)
    
    datos_nuevos = EditarEnvio(
        cuit_destinatario=None,
        razon_social_destinatario="Solo Razon SA"
    )

    empresa_mock = PerfilEmpresa(cuit="30-88888888-8", razon_social="Solo Razon SA", usuario_id=89)

    db_mock = AsyncMock()
    resultado_query = MagicMock()
    resultado_query.scalars().first.return_value = empresa_mock
    db_mock.execute.return_value = resultado_query

    servicio = EnvioService(db=db_mock)

    with patch.object(servicio, 'obtener_envio_por_id', new_callable=AsyncMock, return_value=envio_existente):
        resultado = await servicio.editar_envio("CY-EDIT-RAZON", datos_nuevos, usuario_id=1)
        assert resultado.razon_social_destinatario == "Solo Razon SA"