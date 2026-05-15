from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# simula usuario, crea un envio y verifica que se haya creado correctamente
def test_proceso_envio_con_usuario_real():
    login_data = {
        "username": "prueba@gmail.com",
        "password": "operador123"
    }

    login_response = client.post("/usuarios/logintoken", data=login_data)

    assert login_response.status_code == 200, f"Error en login: {login_response.text}"

    token = login_response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "razon_social_destinatario": "ni_idea",
        "cuit_destinatario": "12345",
        "descripcion": "Mi primer envío de prueba",
        "tipo_envio": "normal",
        "restriccion": "ninguna"
    }

    response = client.post("/envios/", json=payload, headers=headers)

    assert response.status_code == 201, f"Error al crear envío: {response.text}"

    data = response.json()
    assert data["tracking_id"].startswith("CY-2026")
    assert data["creado_por_id"] == 5

    print(f"\n Tracking ID: {data['tracking_id']}")
