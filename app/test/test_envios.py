import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture(scope="session")
def event_loop():
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


pytestmark = pytest.mark.asyncio(scope="session")


async def obtener_headers_autenticados(client: AsyncClient):
    login_data = {
        "username": "prueba@gmail.com",
        "password": "operador123"
    }
    login_response = await client.post("/usuarios/logintoken", data=login_data)
    token = login_response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}


async def test_ac1_ac3_ac6_crear_envio_exitoso():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await obtener_headers_autenticados(client)
        payload = {
            "razon_social_destinatario": "ni_idea",
            "cuit_destinatario": "12345",
            "descripcion": "Mi primer envío de prueba",
            "tipo_envio": "normal",
            "restriccion": "ninguna"
        }
        response = await client.post("/envios/", json=payload, headers=headers)

        assert response.status_code == 201, f"Error: {response.text}"
        data = response.json()
        assert data["tracking_id"].startswith("CY-2026")
        assert "creador" in data
        assert data["creador"]["id"] == 5


async def test_ac2_validacion_campos_incorrectos():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await obtener_headers_autenticados(client)
        payload = {
            "razon_social_destinatario": "ni_idea",
            "cuit_destinatario": "12345",
            "descripcion": "Envio con error",
            "tipo_envio": "SUPER_EXPRESS_INVALIDO",
            "restriccion": "ninguna"
        }
        response = await client.post("/envios/", json=payload, headers=headers)

        assert response.status_code in [422, 400]


async def test_ac5_cliente_no_existente():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await obtener_headers_autenticados(client)
        payload = {
            "razon_social_destinatario": "Empresa Inexistente S.A.",
            "cuit_destinatario": "99999999999",
            "descripcion": "Envio a cliente no existente",
            "tipo_envio": "normal",
            "restriccion": "ninguna"
        }
        response = await client.post("/envios/", json=payload, headers=headers)
        assert response.status_code == 404
        assert "no existe" in response.json()["detail"].lower()


async def test_proceso_envio_con_usuario_real():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await obtener_headers_autenticados(client)
        payload = {
            "razon_social_destinatario": "ni_idea",
            "cuit_destinatario": "12345",
            "descripcion": "Mi primer envío de prueba",
            "tipo_envio": "normal",
            "restriccion": "ninguna"
        }
        response = await client.post("/envios/", json=payload, headers=headers)
        assert response.status_code == 201
        data = response.json()
        print(f"\n Tracking ID generado con éxito: {data['tracking_id']}")


async def test_ac1_ac2_buscar_envio_por_tracking_id_existente():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        headers = await obtener_headers_autenticados(client)

        payload = {
            "razon_social_destinatario": "ni_idea",
            "cuit_destinatario": "12345",
            "descripcion": "Teclado Logitech G Pro X TKL",
            "tipo_envio": "normal",
            "restriccion": "ninguna"
        }

        repo_response = await client.post("/envios/", json=payload, headers=headers)
        assert repo_response.status_code == 201

        tracking_id_real = repo_response.json().get("tracking_id")
        assert tracking_id_real is not None

        response_busqueda = await client.get(f"/envios/{tracking_id_real}", headers=headers)
        assert response_busqueda.status_code == 200
        data = response_busqueda.json()
        assert data["tracking_id"] == tracking_id_real
        assert data["razon_social_destinatario"] == "ni_idea"
