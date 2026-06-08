import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from app.models.esquemas import UsuarioRegistroEmpleado
from app.models.entidades import PerfilEmpleado, TipoCliente, Usuario
from app.services.servicio_usuarios import UsuarioService

@pytest.mark.asyncio
async def test_verificar_email_existe_devuelve_true_si_encuentra_registro():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    
    resultado_mock.unique().scalar_one_or_none.return_value = Usuario()
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
    
    resultado_mock.unique().scalar_one_or_none.return_value = Usuario()
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
   
    resultado_mock.unique().scalar_one_or_none.return_value = None
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
    
    resultado_mock.unique().scalar_one_or_none.return_value = usuario_fijo
    db_mock.execute.return_value = resultado_mock

    servicio = UsuarioService(db=db_mock)
    resultado = await servicio.buscar_empresa_por_razon_social_o_cuit(cuit="30-54474295-9")

    assert resultado.id == 10
    assert resultado.email == "empresa@test.com"


@pytest.mark.asyncio
async def test_buscar_empresa_por_cuit_falla_si_la_empresa_no_existe():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    
    resultado_mock.unique().scalar_one_or_none.return_value = None
    db_mock.execute.return_value = resultado_mock

    servicio = UsuarioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.buscar_empresa_por_razon_social_o_cuit(cuit="30-99999999-9")

    assert info_error.value.status_code == 404
    assert info_error.value.detail == "La empresa no existe en el sistema"
    


@pytest.mark.asyncio
async def test_crear_supabase_auth_falla_si_servicio_devuelve_error():
    
    db_mock = AsyncMock()
    servicio = UsuarioService(db=db_mock)

    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.json.return_value = {"msg": "Password should be at least 6 characters"}

    
    with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response

        with pytest.raises(HTTPException) as info_error:
            await servicio.crear_usuario_en_supabase_auth("test@compuya.com", "123", {})

        assert info_error.value.status_code == 500
        assert "Password should be at least 6 characters" in info_error.value.detail


@pytest.mark.asyncio
async def test_crear_supabase_auth_falla_si_formato_json_es_invalido():
    db_mock = AsyncMock()
    servicio = UsuarioService(db=db_mock)

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"datos_raros": "sin_id_de_usuario"} 

    with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response

        with pytest.raises(HTTPException) as info_error:
            await servicio.crear_usuario_en_supabase_auth("test@compuya.com", "password123", {})

        assert info_error.value.status_code == 500
        assert "no contiene un ID de usuario válido" in info_error.value.detail


@pytest.mark.asyncio
async def test_crear_usuario_empresa_falla_si_el_email_ya_existe():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    # Cambiado a unique().scalar_one_or_none
    resultado_mock.unique().scalar_one_or_none.return_value = Usuario() 
    db_mock.execute.return_value = resultado_mock

    from app.models.esquemas import UsuarioRegistroEmpresa
    empresa_data = MagicMock(spec=UsuarioRegistroEmpresa)
    empresa_data.email = "empresa_duplicada@test.com"

    servicio = UsuarioService(db=db_mock)

    with pytest.raises(HTTPException) as info_error:
        await servicio.crear_usuario_empresa(empresa_data)

    assert info_error.value.status_code == 400
    assert "El email ya está registrado" in info_error.value.detail


@pytest.mark.asyncio
async def test_login_usuario_falla_con_credenciales_invalidas():
    db_mock = AsyncMock()
    servicio = UsuarioService(db=db_mock)

    mock_response = MagicMock()
    mock_response.status_code = 400 

    with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response

        with pytest.raises(HTTPException) as info_error:
            await servicio.login_usuario("error@compuya.com", "clave_incorrecta")

        assert info_error.value.status_code == 401
        assert "Email o contraseña incorrectos" in info_error.value.detail


@pytest.mark.asyncio
async def test_listar_usuarios_devuelve_coleccion_correctamente():
    db_mock = AsyncMock()
    resultado_mock = MagicMock()
    
    usuarios_lista = [Usuario(id=1), Usuario(id=2)]
    # Cambiado para seguir la cadena unique().scalars().all()
    resultado_mock.unique().scalars().all.return_value = usuarios_lista
    db_mock.execute.return_value = resultado_mock

    servicio = UsuarioService(db=db_mock)
    resultado = await servicio.listar_usuarios()

    assert len(resultado) == 2
    assert resultado[0].id == 1
    
    
    
    
    

@pytest.mark.asyncio
async def test_crear_usuario_empleado_exitoso():
    
    db_mock = AsyncMock()
    db_mock.flush = AsyncMock()
    db_mock.commit = AsyncMock()
    db_mock.add = MagicMock() 

    empleado_data = UsuarioRegistroEmpleado(
        email="nuevo_empleado@compuya.com",
        password="securepassword123",
        nombre="Santi",
        apellido="Dev",
        tipo=TipoCliente.EMPLEADO,
        rol="supervisor"
    )

    
    res_email = MagicMock()
    res_email.scalar_one_or_none.return_value = None
    
    usuario_creado = Usuario(id=1, email="nuevo_empleado@compuya.com", tipo=TipoCliente.EMPLEADO)
    res_final = MagicMock()
    res_final.unique().scalar_one.return_value = usuario_creado
    
    db_mock.execute.side_effect = [res_email, res_final]

    servicio = UsuarioService(db=db_mock)

    
    with patch.object(servicio, 'crear_usuario_en_supabase_auth', new_callable=AsyncMock, return_value="uuid-mock-123"):
        
        resultado = await servicio.crear_usuario_empleado(empleado_data)

        
        assert resultado.id == 1
        assert resultado.email == "nuevo_empleado@compuya.com"
        assert db_mock.add.call_count == 2  
        db_mock.commit.assert_called_once()


@pytest.mark.asyncio
async def test_crear_usuario_empresa_exitoso():
    db_mock = AsyncMock()
    db_mock.flush = AsyncMock()
    db_mock.commit = AsyncMock()
    db_mock.add = MagicMock()

    from app.models.esquemas import UsuarioRegistroEmpresa
    empresa_data = UsuarioRegistroEmpresa(
        email="empresa_ok@compuya.com",
        password="password12345",
        razon_social="CompuYa S.A.",
        cuit="30-12345678-9",
        direccion_normalizada="Av. Siempreviva 742",
        latitud=-34.6,
        longitud=-58.6,
        tipo=TipoCliente.EMPRESA,
        rol="operario"
    )

    res_email = MagicMock()
    res_email.scalar_one_or_none.return_value = None
    
    usuario_creado = Usuario(id=2, email="empresa_ok@compuya.com", tipo=TipoCliente.EMPRESA)
    res_final = MagicMock()
    res_final.unique().scalar_one.return_value = usuario_creado
    
    db_mock.execute.side_effect = [res_email, res_final]

    servicio = UsuarioService(db=db_mock)

    with patch.object(servicio, 'crear_usuario_en_supabase_auth', new_callable=AsyncMock, return_value="uuid-empresa-123"):
        resultado = await servicio.crear_usuario_empresa(empresa_data)

        assert resultado.id == 2
        assert db_mock.add.call_count == 2  
        db_mock.commit.assert_called_once()


@pytest.mark.asyncio
async def test_login_usuario_camino_feliz():
    db_mock = AsyncMock()
    servicio = UsuarioService(db=db_mock)

    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "access_token": "token_secreto_jwt",
        "user": {"id": "uuid-123", "email": "test@compuya.com"}
    }

    with patch('httpx.AsyncClient.post', new_callable=AsyncMock, return_value=mock_response):
        resultado = await servicio.login_usuario("test@compuya.com", "clave123")
        
        assert "access_token" in resultado
        assert resultado["user"]["email"] == "test@compuya.com"


@pytest.mark.asyncio
async def test_modificar_usuario_perfiles_exitoso():
    
    usuario_mock = Usuario(id=5, tipo=TipoCliente.EMPLEADO, rol="visor")
    usuario_mock.perfil_empleado = PerfilEmpleado(nombre="Juan", apellido="Perez")

    db_mock = AsyncMock()
    db_mock.commit = AsyncMock()

    servicio = UsuarioService(db=db_mock)

    
    with patch.object(servicio, 'obtener_usuario_por_id', new_callable=AsyncMock, return_value=usuario_mock):
        
        data_cambios = {
            "rol": "admin",
            "nombre": "SantiModificado",
            "apellido": "ApellidoModificado"
        }

        
        resultado = await servicio.modificar_usuario(usuario_id=5, data=data_cambios)

        
        assert resultado.rol == "admin"
        assert resultado.perfil_empleado.nombre == "SantiModificado"
        assert resultado.perfil_empleado.apellido == "ApellidoModificado"
        db_mock.commit.assert_called_once()