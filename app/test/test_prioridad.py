import pytest
from scripts.generar_dataset import asignar_prioridad_segun_reglas


@pytest.mark.parametrize("envio, prioridad_esperada", [
    ({"distancia": 10, "tipo_envio": "express",
     "restriccion": "valioso", "antiguedad_dias": 1}, "alta"),
    ({"distancia": 60, "tipo_envio": "express",
     "restriccion": "ninguna", "antiguedad_dias": 1}, "alta"),
    ({"distancia": 10, "tipo_envio": "normal",
     "restriccion": "ninguna", "antiguedad_dias": 6}, "alta"),

    ({"distancia": 10, "tipo_envio": "normal",
     "restriccion": "valioso", "antiguedad_dias": 1}, "media"),
    ({"distancia": 10, "tipo_envio": "express",
     "restriccion": "ninguna", "antiguedad_dias": 1}, "media"),

    ({"distancia": 3, "tipo_envio": "normal",
     "restriccion": "ninguna", "antiguedad_dias": 1}, "baja"),
    ({"distancia": 100, "tipo_envio": "normal",
     "restriccion": "ninguna", "antiguedad_dias": 1}, "media"),
])
def test_asignacion_prioridad_reglas(envio, prioridad_esperada):
    assert asignar_prioridad_segun_reglas(envio) == prioridad_esperada
