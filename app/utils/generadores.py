import random

def generar_pin_seguridad() -> str:
    """Genera un PIN aleatorio de 4 dígitos, rellenando con ceros a la izquierda."""
    return f"{random.randint(0, 9999):04d}"