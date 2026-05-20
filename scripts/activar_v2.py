import asyncio
import httpx
import logging

API_URL = "http://localhost:8000"
PASSWORD = "Password123!"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def activar_v2():
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Usamos un sufijo '.final' para asegurar que sean cuentas nuevas en Supabase
        empleados = [
            {"email": "admin.compu@gmail.com", "rol": "admin", "nombre": "Admin", "apellido": "Sistema"},
            {"email": "super.compu@gmail.com", "rol": "supervisor", "nombre": "Super", "apellido": "Visor"},
            {"email": "oper.compu@gmail.com", "rol": "operador", "nombre": "Oper", "apellido": "Ador"},
            {"email": "repar.compu@gmail.com", "rol": "repartidor", "nombre": "Repar", "apellido": "Tidor"},
        ]

        logger.info("=== REGISTRANDO NUEVOS USUARIOS ===")
        for e in empleados:
            res = await client.post(f"{API_URL}/usuarios/registro-empleado", json={
                **e, "password": PASSWORD, "tipo": "empleado"
            })
            if res.status_code == 201:
                logger.info(f"✅ Creado: {e['email']} (Rol: {e['rol']})")
            else:
                logger.error(f"❌ Error en {e['email']}: {res.text}")

        # Cliente Empresa
        res_cli = await client.post(f"{API_URL}/usuarios/registro-empresa", json={
            "email": "cliente.test@techstore.com",
            "password": PASSWORD,
            "tipo": "empresa",
            "rol": "visor",
            "razon_social": "TechStore Argentina S.A.",
            "latitud": -34.5823,
            "longitud": -58.4062,
            "provincia": "CABA",
            "municipio": "Palermo"
        })
        if res_cli.status_code == 201:
            logger.info("✅ Creado: cliente.test@techstore.com")

        logger.info("\n=== REGISTRO COMPLETADO ===")
        logger.info(f"Contraseña: {PASSWORD}")

if __name__ == "__main__":
    asyncio.run(activar_v2())
