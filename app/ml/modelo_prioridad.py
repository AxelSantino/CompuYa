import pandas as pd
import joblib
import os
import sys
from app.models.entidades import PrioridadEnvio

def get_resource_path(relative_path):
    if getattr(sys, 'frozen', False):
        # Si es un binario de PyInstaller
        base_path = sys._MEIPASS
    else:
        # Modo desarrollo
        base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    return os.path.join(base_path, relative_path)

MODEL_PATH = get_resource_path('modelo_prioridad.joblib')
ENCODER_PATH = get_resource_path('label_encoder.joblib')

try:
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        print("Modelo de prioridad y codificador cargados exitosamente.")
    else:
        print(f"Error: No se encontraron los archivos del modelo en {MODEL_PATH}")
        model = None
        label_encoder = None
except Exception as e:
    print(f"Error al cargar el modelo: {str(e)}")
    model = None
    label_encoder = None


def predecir_prioridad(datos_envio: dict) -> str:
    if not model or not label_encoder:
        print("Error: El modelo o el encoder no están disponibles.")
        return PrioridadEnvio.BAJA
    df_prediccion = pd.DataFrame([datos_envio])
    prediccion_numerica = model.predict(df_prediccion)
    prediccion_texto = label_encoder.inverse_transform(prediccion_numerica)
    try:
        return PrioridadEnvio(prediccion_texto[0])
    except Exception:
        return PrioridadEnvio.BAJA
