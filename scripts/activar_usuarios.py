import asyncio
import httpx
import logging

# Configuración
API_URL = "http://localhost:8000"
PASSWORD = "Password123!"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def activar_sistema():
    async with httpx.AsyncClient(timeout=30.0) as client:
        # 1. Lista de Empleados a registrar
        empleados = [
            {"email": "admin@compuya.com", "rol": "admin", "nombre": "Admin", "apellido": "Sistema"},
            {"email": "supervisor@compuya.com", "rol": "supervisor", "nombre": "Super", "apellido": "Visor"},
            {"email": "operador@compuya.com", "rol": "operador", "nombre": "Oper", "apellido": "Ador"},
            {"email": "repartidor@compuya.com", "rol": "repartidor", "nombre": "Repar", "apellido": "Tidor"},
        ]

        logger.info("=== ACTIVANDO EMPLEADOS ===")
        for e in empleados:
            try:
                logger.info(f"Registrando {e['rol']}: {e['email']}...")
                res = await client.post(f"{API_URL}/usuarios/registro-empleado", json={
                    "email": e["email"],
                    "password": PASSWORD,
                    "tipo": "empleado",
                    "rol": e["rol"],
                    "nombre": e["nombre"],
                    "apellido": e["apellido"]
                })
                if res.status_code in [200, 201]:
                    logger.info(f"✅ ÉXITO: {e['email']} creado.")
                else:
                    logger.warning(f"⚠️ AVISO: {e['email']} devolvió {res.status_code} ({res.json().get('detail')})")
            except Exception as ex:
                logger.error(f"❌ ERROR en {e['email']}: {ex}")

        # 2. Registro de Cliente Empresa
        logger.info("\n=== ACTIVANDO CLIENTE EMPRESA ===")
        try:
            res_cli = await client.post(f"{API_URL}/usuarios/registro-empresa", json={
                "email": "cliente@techstore.com",
                "password": PASSWORD,
                "tipo": "empresa",
                "rol": "visor",
                "razon_social": "TechStore Argentina S.A.",
                "latitud": -34.5823,
                "longitud": -58.4062,
                "provincia": "CABA",
                "municipio": "Palermo"
            })
            if res_cli.status_code in [200, 201]:
                logger.info("✅ ÉXITO: cliente@techstore.com creado.")
            else:
                logger.warning(f"⚠️ AVISO: cliente@techstore.com devolvió {res_cli.status_code}")
        except Exception as ex:
            logger.error(f"❌ ERROR en cliente: {ex}")

        logger.info("\n=== PROCESO FINALIZADO ===")
        logger.info(f"Contraseña para todos: {PASSWORD}")

if __name__ == "__main__":
    asyncio.run(activar_sistema())
