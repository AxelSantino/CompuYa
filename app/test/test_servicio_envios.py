import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from app.models.entidades import Envio, EstadoEnvio, Usuario
from app.services.servicios_envios import EnvioService
from datetime import date, timedelta
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
async def test_asignar_envio_automatico_falla_si_no_esta_en_sucursal():
    envio_mock = Envio()
    envio_mock.tracking_id = "CY-2026-TEST"
    envio_mock.estado = EstadoEnvio.ENTREGADO

    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = envio_mock
    db_mock.execute.return_value = resultado_mock

    servicio = EnvioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.asignar_envio_automatico("CY-2026-TEST")

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

    # Configuración de mocks
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

    # CONFIGURACIÓN DEL MOCK PARA EL ESQUEMA
    envio_data = MagicMock(spec=EnvioCrear)
    envio_data.razon_social_destinatario = "Empresa Valida S.A."
    envio_data.cuit_destinatario = "30-12345678-9"
    envio_data.fecha_limite = fecha_manana

    # Configuramos los atributos que faltaban para que el servicio no falle
    envio_data.tipo_envio = MagicMock()
    envio_data.tipo_envio.value = "normal"
    envio_data.restriccion = MagicMock()
    envio_data.restriccion.value = "ninguna"

    # Ajustamos el model_dump para que coincida con lo que espera tu servicio
    envio_data.model_dump.return_value = {
        "razon_social_destinatario": "Empresa Valida S.A.",
        "cuit_destinatario": "30-12345678-9",
        "descripcion": "Test",
        "fecha_limite": fecha_manana,
        "tipo_envio": "normal",
        "restriccion": "ninguna"
    }

    with patch.object(servicio, 'registrar_historial', new_callable=AsyncMock):
        resultado = await servicio.crear_envio(envio_data, usuario_id=5)

    assert resultado is not None
    db_mock.add.assert_called_once()


@pytest.mark.asyncio
async def test_crear_envio_falla_si_fecha_limite_es_hoy_o_anterior():

    fecha_hoy = date.today()

    db_mock = AsyncMock()
    servicio = EnvioService(db=db_mock)

    from app.models.esquemas import EnvioCrear
    envio_data = MagicMock(spec=EnvioCrear)
    envio_data.fecha_limite = fecha_hoy

    with pytest.raises(HTTPException) as info_error:
        await servicio.crear_envio(envio_data, usuario_id=5)

    assert info_error.value.status_code == 400

    assert "a partir de mañana o una fecha futura" in info_error.value.detail
