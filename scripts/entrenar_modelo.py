import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

def entrenar_y_guardar_modelo(dataset_path: str, model_output_path: str, encoder_output_path: str):
    print("Iniciando el proceso de entrenamiento del modelo...")

    print(f"Cargando dataset desde {dataset_path}...")
    df = pd.read_csv(dataset_path)

    X = df.drop('prioridad', axis=1)
    y_str = df['prioridad']

    print("Codificando la variable objetivo...")
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_str)

    categorical_features = ['tipo_envio', 'restriccion']
    numeric_features = ['distancia', 'antiguedad_dias']
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])

    X_train, X_test, y_train, y_test, y_str_train, y_str_test = train_test_split(
        X, y, y_str, test_size=0.2, random_state=42, stratify=y_str
    )
    print(f"Datos divididos: {len(X_train)} para entrenamiento y {len(X_test)} para prueba.")

    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', GradientBoostingClassifier(n_estimators=100, random_state=42))
    ])

    print("Entrenando el modelo...")
    model_pipeline.fit(X_train, y_train)
    print("¡Entrenamiento completado!")

    print("\n--- Evaluación del Modelo en el conjunto de prueba ---")
    y_pred = model_pipeline.predict(X_test)
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

    print(f"Guardando el modelo entrenado en {model_output_path}...")
    joblib.dump(model_pipeline, model_output_path)
    print("¡Modelo guardado exitosamente!")

    print(f"Guardando el codificador de etiquetas en {encoder_output_path}...")
    joblib.dump(label_encoder, encoder_output_path)
    print("¡Codificador guardado exitosamente!")


if __name__ == "__main__":
    entrenar_y_guardar_modelo(
        dataset_path="dataset_envios.csv",
        model_output_path="modelo_prioridad.joblib",
        encoder_output_path="label_encoder.joblib"
    )