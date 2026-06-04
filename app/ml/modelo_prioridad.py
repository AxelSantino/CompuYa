import pandas as pd
import joblib
import os
from app.models.entidades import PrioridadEnvio

BASE_DIR = os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)))  # Esto es la carpeta 'app'
ROOT_DIR = os.path.dirname(BASE_DIR)  # Esto es la raíz del proyecto 'CompuYa'
MODEL_PATH = os.path.join(ROOT_DIR, 'modelo_prioridad.joblib')
ENCODER_PATH = os.path.join(ROOT_DIR, 'label_encoder.joblib')

try:
    model = joblib.load(MODEL_PATH)
    label_encoder = joblib.load(ENCODER_PATH)
    print("Modelo de prioridad y codificador cargados exitosamente.")
except FileNotFoundError:
    print(
        f"Error: No se encontraron los archivos del modelo en {MODEL_PATH} o {ENCODER_PATH}")
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
