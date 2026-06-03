import pandas as pd
import random
from enum import Enum

class TipoEnvio(Enum):
    NORMAL = "normal"
    EXPRESS = "express"

class RestriccionEnvio(Enum):
    FRAGIL = "fragil"
    VALIOSO = "valioso"
    NINGUNA = "ninguna"

class Prioridad(Enum):
    ALTA = "alta"
    MEDIA = "media"
    BAJA = "baja"

def asignar_prioridad_segun_reglas(envio: dict) -> str:
    if envio["antiguedad_dias"] > 5:
        return Prioridad.ALTA.value

    if envio["tipo_envio"] == TipoEnvio.EXPRESS.value and envio["restriccion"] == RestriccionEnvio.VALIOSO.value:
        return Prioridad.ALTA.value

    if envio["tipo_envio"] == TipoEnvio.EXPRESS.value and envio["distancia"] > 50:
        return Prioridad.ALTA.value

    if envio["tipo_envio"] == TipoEnvio.NORMAL.value and envio["restriccion"] == RestriccionEnvio.VALIOSO.value:
        return Prioridad.MEDIA.value

    if envio["tipo_envio"] == TipoEnvio.EXPRESS.value and envio["restriccion"] == RestriccionEnvio.NINGUNA.value \
       and envio["distancia"] < 15:
        return Prioridad.MEDIA.value

    if envio["tipo_envio"] == TipoEnvio.NORMAL.value and envio["restriccion"] == RestriccionEnvio.NINGUNA.value \
       and envio["antiguedad_dias"] < 3:
        return Prioridad.BAJA.value

    if envio["tipo_envio"] == TipoEnvio.NORMAL.value and envio["distancia"] < 5:
        return Prioridad.BAJA.value

    return Prioridad.BAJA.value


def generar_datos_controlados(n_muestras_por_regla: int = 500) -> pd.DataFrame:
    print("Generando dataset con distribución controlada (lógica en días)...")
    datos = []

    for _ in range(n_muestras_por_regla):
        datos.append({ "distancia": round(random.uniform(1.0, 100.0), 2), "tipo_envio": random.choice(["normal",
       "express"]), "restriccion": "ninguna", "antiguedad_dias": round(random.uniform(5.1, 15), 2) })

    for _ in range(n_muestras_por_regla):
        datos.append({ "distancia": round(random.uniform(1.0, 100.0), 2), "tipo_envio": "express", "restriccion":
       "valioso", "antiguedad_dias": round(random.uniform(3.1, 4.9), 2) })

    for _ in range(n_muestras_por_regla):
        datos.append({ "distancia": round(random.uniform(50.1, 100.0), 2), "tipo_envio": "express",
       "restriccion": "ninguna", "antiguedad_dias": round(random.uniform(3.1, 4.9), 2) })

    for _ in range(n_muestras_por_regla):
        datos.append({ "distancia": round(random.uniform(5.1, 100.0), 2), "tipo_envio": "normal", "restriccion":
       "valioso", "antiguedad_dias": round(random.uniform(3.1, 4.9), 2) })

    for _ in range(n_muestras_por_regla):
        datos.append({ "distancia": round(random.uniform(1.0, 14.9), 2), "tipo_envio": "express", "restriccion":
       "ninguna", "antiguedad_dias": round(random.uniform(3.1, 4.9), 2) })

    for _ in range(n_muestras_por_regla):
        datos.append({ "distancia": round(random.uniform(5.1, 100.0), 2), "tipo_envio": "normal", "restriccion":
       "ninguna", "antiguedad_dias": round(random.uniform(0.1, 2.9), 2) })

    for _ in range(n_muestras_por_regla):
        datos.append({ "distancia": round(random.uniform(1.0, 4.9), 2), "tipo_envio": "normal", "restriccion":
       "ninguna", "antiguedad_dias": round(random.uniform(3.1, 4.9), 2) })

    df = pd.DataFrame(datos)

    df['prioridad'] = df.apply(asignar_prioridad_segun_reglas, axis=1)

    df = df.sample(frac=1).reset_index(drop=True)

    print("¡Generación de datos completada!")
    return df

if __name__ == "__main__":
    df_controlado = generar_datos_controlados()

    output_path = "dataset_envios.csv"
    df_controlado.to_csv(output_path, index=False)

    print(f"Dataset guardado exitosamente en: {output_path}")
    print("Primeras 5 filas del nuevo dataset:")
    print(df_controlado.head())
    print("\nNueva distribución de prioridades:")
    print(df_controlado['prioridad'].value_counts(normalize=True))