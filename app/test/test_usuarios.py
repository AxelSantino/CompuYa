import pytest
from datetime import date
from pydantic import ValidationError
from uuid import UUID
from app.models.esquemas import (
    UsuarioBase, 
    UsuarioRegistroEmpleado, 
    UsuarioRegistroEmpresa, 
    UsuarioCrearEmpleado
)
from app.models.entidades import TipoCliente

def test_usuario_nuevo_recibe_rol_y_fecha_por_defecto():
    usuario = UsuarioBase(
        email="marcelo.gallardo@compuya.com",
        tipo=TipoCliente.EMPLEADO
    )
    assert usuario.rol == "visor"
    assert usuario.fecha == date.today()


def test_usuario_con_email_invalido_da_error():
    with pytest.raises(ValidationError):
        UsuarioBase(
            email="santinonotieneataque.com",  
            tipo=TipoCliente.EMPLEADO
        )


def test_usuario_con_contraseña_corta_da_error():
    with pytest.raises(ValidationError):
        UsuarioRegistroEmpleado(
            email="santi.software@compuya.com",
            tipo=TipoCliente.EMPLEADO,
            password="12345",  
            nombre="Santino",
            apellido="Ingenieria"
        )


def test_registro_empresa_con_datos_completos_funciona():
    empresa = UsuarioRegistroEmpresa(
        email="contacto@celestela.com",
        tipo=TipoCliente.EMPRESA,
        password="password123",
        razon_social="Celestela Beauty Center",
        latitud=-34.5,
        longitud=-58.7,
        cuit="30-54474295-9",
        direccion_normalizada="Ruta Provincial 23, Trujui"
    )
    assert empresa.razon_social == "Celestela Beauty Center"
    assert empresa.cuit == "30-54474295-9"


def test_crear_empleado_acepta_objeto_uuid_real():
    id_unico = UUID("11111111-2222-3333-4444-555555555555")
    empleado = UsuarioCrearEmpleado(
        email="operador@compuya.com",
        tipo=TipoCliente.EMPLEADO,
        supabase_id=id_unico,
        nombre="Enrique",
        apellido="Alfredo"
    )
    assert empleado.nombre == "Enrique"
    assert isinstance(empleado.supabase_id, UUID)