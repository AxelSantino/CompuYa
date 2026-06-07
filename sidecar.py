import uvicorn
import sys
import os

# Añadir el directorio actual al path para que pueda encontrar el módulo 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    # El puerto 8000 es el que usa tu frontend para hablar con el backend
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
