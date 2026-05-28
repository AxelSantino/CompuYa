import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_login_exitoso():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
       
        await client.post("/usuarios/registrar", json={
            "email": "sofia.rodriguez@sistema.com",
            "password": "SofiOps*2026",
            "nombre": "Sofia Rodriguez",
            "rol": "operador"
        })
        
        payload = {
            "username": "sofia.rodriguez@sistema.com",
            "password": "SofiOps*2026"
        }
        response = await client.post("/usuarios/logintoken", data=payload)
        assert response.status_code == 200
        assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_login_fallido():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "username": "sofia.rodriguez@sistema.com",
            "password": "password_error"
        }
        response = await client.post("/usuarios/logintoken", data=payload)
        assert response.status_code == 401