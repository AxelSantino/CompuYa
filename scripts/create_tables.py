#!/usr/bin/env python3
import asyncio
import logging
from sqlalchemy import text
from app.db.session import engine
from app.models.entidades import Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_tables():
    try:
        logger.info("Creando tablas en la base de datos...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        logger.info("Tablas creadas exitosamente!")
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = result.fetchall()
            logger.info(f"Tablas creadas: {[table[0] for table in tables]}")  
    except Exception as e:
        logger.error(f"Error al crear las tablas: {e}")
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_tables())