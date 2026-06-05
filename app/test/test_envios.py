import pytest
from pydantic import ValidationError
from datetime import datetime, date
from uuid import UUID
from app.models.esquemas import (
    EnvioCrear, 
    EnvioRespuesta, 
    UsuarioSimple, 
    SucursalRespuesta, 
    HistorialRespuesta,
    UsuarioRespuesta,
    EmpresaRespuesta,
    PrioridadEnvio
)
from app.models.entidades import (
    TipoEnvio, 
    RestriccionEnvio, 
    EstadoEnvio, 
    TipoCliente
)

# Saca el primer elemento de cada lista para completar 
# los campos obligatorios del test de forma automática.

ENUM_TIPO_ENVIO = list(TipoEnvio)[0]
ENUM_RESTRICCION = list(RestriccionEnvio)[0]
ENUM_ESTADO = list(EstadoEnvio)[0]
ENUM_PRIORIDAD = list(PrioridadEnvio)[0]

def test_crear_envio_con_datos_correctos_funciona():
    envio = EnvioCrear(
        razon_social_destinatario="CompuYa Casa Central Haedo",
        cuit_destinatario="30-11344742-5",
        descripcion="Lote de 50 placas de video Nvidia RTX 4070 y fuentes",
        tipo_envio=ENUM_TIPO_ENVIO,       
        restriccion=ENUM_RESTRICCION  
    )
    assert envio.razon_social_destinatario == "CompuYa Casa Central Haedo"
    assert envio.cuit_destinatario == "30-11344742-5"


def test_crear_envio_sin_datos_obligatorios_falla():
    with pytest.raises(ValidationError):
        EnvioCrear(
            razon_social_destinatario="Logitrack Envios S.A."
        )


def test_sucursal_guarda_coordenadas_como_numeros():
    sucursal = SucursalRespuesta(
        id=999,  
        nombre="Deposito Principal Logitrack",
        direccion="Av. General Paz 4500",
        latitud=-34.6432,   
        longitud=-58.5985   
    )
    assert sucursal.id == 999
    assert isinstance(sucursal.latitud, float)


def test_historial_guarda_bien_los_datos_del_empleado():
    empleado_fijo = UsuarioSimple(
        id=777,  
        email="marcelo.gallardo@compuya.com"
    )
    
    historial = HistorialRespuesta(
        id=444,  
        estado=ENUM_ESTADO,
        fecha=datetime(2026, 5, 28, 12, 0, 0),  
        empleado=empleado_fijo
    )
    
    assert historial.id == 444
    assert historial.empleado.id == 777
    assert historial.empleado.email == "marcelo.gallardo@compuya.com"


def test_respuesta_final_del_envio_contiene_al_destinatario_correcto():
    creador_fijo = UsuarioSimple(
        id=101, 
        email="santi.backend@compuya.com"
    )
    
    destinatario_fijo = UsuarioRespuesta(
        id=888,
        supabase_id="11111111-2222-3333-4444-555555555555",
        email="celestela.beauty@compuya.com",
        tipo=TipoCliente.EMPRESA,
        rol="visor",
        fecha=date(2026, 5, 21),  
        perfil_empleado=None,
        perfil_empresa={
            "razon_social": "Celestela Beauty Center",
            "cuit": "30-54474295-9",
            "direccion_normalizada": "Ruta Provincial 23, Trujui, Buenos Aires",
            "latitud": -34.5,
            "longitud": -58.7
        }
    )
    
    envio_full = EnvioRespuesta(
        id=5555,
        tracking_id="CY-2026-LOGITRACK",  
        estado=ENUM_ESTADO,
        prioridad=ENUM_PRIORIDAD,
        fecha_creacion=datetime(2026, 5, 28, 20, 0, 0),
        creador=creador_fijo,
        destinatario=destinatario_fijo,
        sucursal=None, 
        razon_social_destinatario="Celestela Beauty Center",
        cuit_destinatario="30-54474295-9",
        descripcion="Pc gamer con RTX 4070 y fuente de 750W",
        tipo_envio=ENUM_TIPO_ENVIO,
        restriccion=ENUM_RESTRICCION,
        latitud_destino=-34.5,
        longitud_destino=-58.7
    )
    
    assert envio_full.id == 5555
    assert envio_full.tracking_id == "CY-2026-LOGITRACK"
    assert envio_full.creador.id == 101
    assert envio_full.destinatario.perfil_empresa.razon_social == "Celestela Beauty Center"


def test_respuesta_empresa_guarda_correctamente_cuit_y_codigo_postal():
    empresa = EmpresaRespuesta(
        razon_social="Celestela Beauty Center",
        cuit="30-54474295-9",
        direccion_normalizada="Ruta Provincial 23, Trujui, Buenos Aires",
        latitud=-34.5,
        longitud=-58.7,
        provincia="Buenos Aires",
        municipio="Moreno",
        cod_postal="1663",
        fecha=date(2026, 5, 21)
    )
    assert empresa.cuit == "30-54474295-9"
    assert empresa.cod_postal == "1663"
