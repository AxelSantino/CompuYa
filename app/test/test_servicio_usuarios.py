import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from app.models.esquemas import UsuarioRegistroEmpleado
from app.models.entidades import TipoCliente, Usuario
from app.services.servicio_usuarios import UsuarioService

@pytest.mark.asyncio
async def test_verificar_email_existe_devuelve_true_si_encuentra_registro():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = Usuario()
    db_mock.execute.return_value = resultado_mock

    servicio = UsuarioService(db=db_mock)
    existe = await servicio.verificar_email_existe("test@compuya.com")

    assert existe is True


@pytest.mark.asyncio
async def test_verificar_email_existe_devuelve_false_si_esta_vacio():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = None
    db_mock.execute.return_value = resultado_mock

    servicio = UsuarioService(db=db_mock)
    existe = await servicio.verificar_email_existe("no_existe@compuya.com")

    assert existe is False


@pytest.mark.asyncio
async def test_crear_usuario_empleado_falla_si_el_email_ya_existe():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = Usuario()
    db_mock.execute.return_value = resultado_mock

    empleado_data = UsuarioRegistroEmpleado(
        email="repetido@compuya.com",
        password="password123",
        nombre="Santino",
        apellido="Software",
        tipo=TipoCliente.EMPLEADO,
        rol="admin"
    )

    servicio = UsuarioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.crear_usuario_empleado(empleado_data)

    assert info_error.value.status_code == 400
    assert info_error.value.detail == "El email ya está registrado"


@pytest.mark.asyncio
async def test_obtener_usuario_por_id_falla_si_id_no_existe():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = None
    db_mock.execute.return_value = resultado_mock

    servicio = UsuarioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.obtener_usuario_por_id(9999)

    assert info_error.value.status_code == 404
    assert info_error.value.detail == "Usuario no encontrado"


@pytest.mark.asyncio
async def test_buscar_empresa_sin_datos_de_entrada_da_error():
    db_mock = AsyncMock()
    servicio = UsuarioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.buscar_empresa_por_razon_social_o_cuit(razon_social=None, cuit=None)

    assert info_error.value.status_code == 400
    assert info_error.value.detail == "Debe proporcionar al menos una razón social o un CUIT."


@pytest.mark.asyncio
async def test_buscar_empresa_por_cuit_devuelve_usuario_si_existe():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    usuario_fijo = Usuario(id=10, email="empresa@test.com", tipo=TipoCliente.EMPRESA)
    resultado_mock.scalar_one_or_none.return_value = usuario_fijo
    db_mock.execute.return_value = resultado_mock

    servicio = UsuarioService(db=db_mock)
    resultado = await servicio.buscar_empresa_por_razon_social_o_cuit(cuit="30-54474295-9")

    assert resultado.id == 10
    assert resultado.email == "empresa@test.com"


@pytest.mark.asyncio
async def test_buscar_empresa_por_cuit_falla_si_la_empresa_no_existe():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    resultado_mock.scalar_one_or_none.return_value = None
    db_mock.execute.return_value = resultado_mock

    servicio = UsuarioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.buscar_empresa_por_razon_social_o_cuit(cuit="30-99999999-9")

    assert info_error.value.status_code == 404
    assert info_error.value.detail == "La empresa no existe en el sistema"