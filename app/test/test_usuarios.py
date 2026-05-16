import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from app.main import app

client = TestClient(app)


@pytest.mark.asyncio
async def test_login_exitoso():

    payload = {
        "username": "prueba@gmail.com",
        "password": "operador123"
    }
    response = client.post("/usuarios/logintoken", data=payload)
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_fallido():
    payload = {
        "username": "prueba@gmail.com",
        "password": "password_error"
    }
    response = client.post("/usuarios/logintoken", data=payload)
    assert response.status_code == 401
