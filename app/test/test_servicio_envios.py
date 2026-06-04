import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from app.models.entidades import Envio, EstadoEnvio, Usuario
from app.services.servicios_envios import EnvioService
from datetime import date, datetime, timedelta
from app.models.esquemas import EnvioCrear, TipoEnvio, RestriccionEnvio


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

    datos_cancelacion = {"motivo": "Prueba de error"}

    with pytest.raises(HTTPException) as info_error:
        await servicio.cancelar_envio("CY-2026-TEST", usuario_id=5, datos_cancelacion=datos_cancelacion)

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
    respuesta = await servicio.asignar_todos_pendientes(MagicMock())

    assert respuesta["asignados"] == 0
    assert "No hay envíos pendientes" in respuesta["message"]


@pytest.mark.asyncio
async def test_crear_envio_falla_si_empresa_no_existe():

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = None
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)

    from app.models.esquemas import EnvioCrear
    envio_data = MagicMock(spec=EnvioCrear)
    envio_data.razon_social_destinatario = "Empresa Fantasma S.A."
    envio_data.cuit_destinatario = "30-99999999-9"
    
    
    envio_data.tipo_envio = MagicMock()
    envio_data.tipo_envio.value = "normal"  # O "express"

    envio_data.fecha_limite = date.today() + timedelta(days=2)

    with pytest.raises(HTTPException) as info_error:
        await servicio.crear_envio(envio_data, usuario_id=1)

    assert info_error.value.status_code == 404
    assert "La empresa destinataria no existe" in info_error.value.detail


@pytest.mark.asyncio
async def test_crear_envio_falla_si_no_hay_sucursales_disponibles():

    empresa_mock = MagicMock()
    empresa_mock.perfil_empresa.latitud = -34.6
    empresa_mock.perfil_empresa.longitud = -58.6

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = empresa_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    servicio.ruteo_service.obtener_sucursal_mas_cercana = AsyncMock(
        return_value=None)

    from app.models.esquemas import EnvioCrear
    envio_data = MagicMock(spec=EnvioCrear)
    envio_data.razon_social_destinatario = "Empresa Test S.A."
    envio_data.cuit_destinatario = "30-12345678-9"
    
    envio_data.tipo_envio = MagicMock()
    envio_data.tipo_envio.value = "normal"

    envio_data.fecha_limite = date.today() + timedelta(days=2)

    with pytest.raises(HTTPException) as info_error:
        await servicio.crear_envio(envio_data, usuario_id=1)

    assert info_error.value.status_code == 400
    assert "No hay sucursales disponibles" in info_error.value.detail


@pytest.mark.asyncio
async def test_obtener_envio_por_id_falla_si_tracking_id_no_existe():

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = None
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.obtener_envio_por_id("CY-INVALID-ID")

    assert info_error.value.status_code == 404
    assert "Envio no encontrado" in info_error.value.detail


@pytest.mark.asyncio
async def test_editar_envio_falla_si_el_estado_no_lo_permite():

    envio_mock = Envio()
    envio_mock.tracking_id = "CY-2026-EDIT"
    envio_mock.estado = EstadoEnvio.EN_TRANSITO

    servicio = EnvioService(db=AsyncMock())

    servicio.obtener_envio_por_id = AsyncMock(return_value=envio_mock)

    from app.models.esquemas import EditarEnvio
    datos_nuevos = MagicMock(spec=EditarEnvio)

    with pytest.raises(HTTPException) as info_error:
        await servicio.editar_envio("CY-2026-EDIT", datos_nuevos, usuario_id=1)

    assert info_error.value.status_code == 400
    assert "no se puede editar" in info_error.value.detail


@pytest.mark.asyncio
async def test_actualizar_estado_falla_si_ya_esta_finalizado():

    envio_mock = Envio()
    envio_mock.estado = EstadoEnvio.ENTREGADO

    servicio = EnvioService(db=AsyncMock())
    servicio.obtener_envio_por_id = AsyncMock(return_value=envio_mock)

    usuario_mock = Usuario(id=1, rol="admin")

    with pytest.raises(HTTPException) as info_error:
        await servicio.actualizar_estado_envio("CY-TEST", EstadoEnvio.EN_SUCURSAL, usuario_mock)

    assert info_error.value.status_code == 400


@pytest.mark.asyncio
async def test_listar_envios_aplica_filtro_estricto_si_es_cliente():
    db_mock = AsyncMock()

    resultado_mock = MagicMock()
    scalars_mock = MagicMock()
    scalars_mock.all.return_value = []
    resultado_mock.scalars.return_value = scalars_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    usuario_cliente = Usuario(id=42, rol="cliente")

    with patch('app.services.servicios_envios.select') as mock_select:
        mock_query = MagicMock()
        mock_select.return_value = mock_query
        mock_query.options.return_value = mock_query
        mock_query.where.return_value = mock_query

        resultado = await servicio.listar_envios(usuario_cliente)

        assert resultado == []
        mock_query.where.assert_called_once()


@pytest.mark.asyncio
async def test_asignar_envio_automatico_falla_si_no_hay_repartidores():
    envio_mock = Envio()
    envio_mock.estado = EstadoEnvio.EN_SUCURSAL

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = None
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    servicio.obtener_envio_por_id = AsyncMock(return_value=envio_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.asignar_envio_automatico("CY-TEST")

    assert info_error.value.status_code == 404
    assert "No hay repartidores disponibles" in info_error.value.detail


@pytest.mark.asyncio
async def test_obtener_hoja_ruta_devuelve_lista_vacia_si_no_hay_viajes():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalars().all.return_value = []
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    resultado = await servicio.obtener_hoja_ruta(id_empleado=99)

    assert resultado == []


@pytest.mark.asyncio
async def test_crear_envio_exitoso_con_fecha_entrega_futura():

    fecha_manana = date.today() + timedelta(days=1)

    
    empresa_mock = MagicMock()
    empresa_mock.id = 10
    empresa_mock.perfil_empresa.latitud = -34.6037
    empresa_mock.perfil_empresa.longitud = -58.3816

    sucursal_mock = MagicMock()
    sucursal_mock.id = 1

    db_mock = AsyncMock()
    db_mock.add = MagicMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = empresa_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)
    servicio.ruteo_service.obtener_sucursal_mas_cercana = AsyncMock(
        return_value=sucursal_mock)
    servicio.obtener_envio_por_id = AsyncMock(
        return_value=Envio(tracking_id="CY-2026-OK"))

    
    envio_data = MagicMock(spec=EnvioCrear)
    envio_data.razon_social_destinatario = "Empresa Valida S.A."
    envio_data.cuit_destinatario = "30-12345678-9"
    envio_data.fecha_limite = fecha_manana

    
    envio_data.tipo_envio = MagicMock()
    envio_data.tipo_envio.value = "normal"
    envio_data.restriccion = MagicMock()
    envio_data.restriccion.value = "ninguna"

    
    envio_data.model_dump.return_value = {
        "razon_social_destinatario": "Empresa Valida S.A.",
        "cuit_destinatario": "30-12345678-9",
        "descripcion": "Test",
        "tipo_envio": "normal",
        "restriccion": "ninguna"
    }

    with patch("random.randint", return_value=5):
        with patch.object(servicio, 'registrar_historial', new_callable=AsyncMock):
            resultado = await servicio.crear_envio(envio_data, usuario_id=5)

    assert resultado is not None
    assert resultado.tracking_id == "CY-2026-OK"
    db_mock.add.assert_called_once()


@pytest.mark.asyncio
async def test_asignar_todos_pendientes_exitoso_con_repartidores():
    
    envio_mock1 = Envio(id=1, tracking_id="CY-01", estado=EstadoEnvio.EN_SUCURSAL, razon_social_destinatario="Dest1")
    envio_mock2 = Envio(id=2, tracking_id="CY-02", estado=EstadoEnvio.EN_SUCURSAL, razon_social_destinatario="Dest2")
    
    db_mock = AsyncMock()
    db_mock.add = MagicMock()
    db_mock.add_all = MagicMock()
    
    
    resultado_pendientes = MagicMock()
    resultado_pendientes.scalars.return_value.all.return_value = [envio_mock1, envio_mock2]
    
    
    repartidor_10 = MagicMock(id=10, carga=2)
    repartidor_11 = MagicMock(id=11, carga=5)
    resultado_carga = MagicMock()
    resultado_carga.all.return_value = [repartidor_10, repartidor_11]
    
    
    resultado_existentes = MagicMock()
    resultado_existentes.scalars.return_value.all.return_value = []
    
    
    db_mock.execute.side_effect = [resultado_pendientes, resultado_carga, resultado_existentes]
    
    servicio = EnvioService(db=db_mock)
    servicio.obtenerMailDestinatario = AsyncMock(return_value="test@empresa.com")
    
    background_tasks_mock = MagicMock()
    
    
    respuesta = await servicio.asignar_todos_pendientes(background_tasks_mock)
    
    
    assert respuesta["asignados"] == 2
    assert envio_mock1.estado == EstadoEnvio.EN_TRANSITO
    assert background_tasks_mock.add_task.call_count == 2  
    db_mock.commit.assert_called_once()
    
    
@pytest.mark.asyncio
async def test_obtener_hoja_ruta_calcula_orden_optimo_de_viaje():
    sucursal_mock = MagicMock(latitud=-34.60, longitud=-58.38)
    
    
    envio_lejos = Envio(id=1, latitud_destino=-35.00, longitud_destino=-59.00, sucursal=sucursal_mock, estado=EstadoEnvio.EN_TRANSITO)
    
    envio_cerca = Envio(id=2, latitud_destino=-34.61, longitud_destino=-58.39, sucursal=sucursal_mock, estado=EstadoEnvio.EN_TRANSITO)
    
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalars.return_value.all.return_value = [envio_lejos, envio_cerca]
    db_mock.execute.return_value = resultado_mock
    
    servicio = EnvioService(db=db_mock)
    
    
    def haversine_simulado(lat1, lon1, lat2, lon2):
        if lat2 == -34.61: return 5.0   
        if lat2 == -35.00: return 80.0  
        return 10.0
        
    servicio.ruteo_service.calcular_distancia_haversine = haversine_simulado
    
    
    ruta_resultado = await servicio.obtener_hoja_ruta(id_empleado=10)
    
    # Verificaciones
    assert len(ruta_resultado) == 2
    assert ruta_resultado[0].id == 2  
    assert ruta_resultado[1].id == 1  
    
    
    
@pytest.mark.asyncio
async def test_actualizar_prioridades_pendientes_llama_modelo_ia():
    sucursal_mock = MagicMock(latitud=-34.60, longitud=-58.38)
    envio_mock = Envio(
        id=5, 
        estado=EstadoEnvio.EN_SUCURSAL, 
        sucursal=sucursal_mock,
        fecha_creacion=datetime.now() - timedelta(days=2), 
        tipo_envio=MagicMock(value="normal"),
        restriccion=MagicMock(value="ninguna"),
        prioridad=MagicMock(value="baja"),
        latitud_destino=-34.65,
        longitud_destino=-58.40
    )
    
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalars.return_value.all.return_value = [envio_mock]
    db_mock.execute.return_value = resultado_mock
    
    servicio = EnvioService(db=db_mock)
    servicio.ruteo_service.calcular_distancia_haversine = MagicMock(return_value=12.5)
    
    
    with patch("app.services.servicios_envios.predecir_prioridad", return_value="alta"):
        respuesta = await servicio.actualizar_prioridades_pendientes()
        
    assert respuesta["actualizados"] == 1
    assert envio_mock.prioridad == "alta"
    db_mock.commit.assert_called_once()