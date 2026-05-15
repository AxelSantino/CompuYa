import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()

async def check_users():
    db_user = os.getenv("DB_USER")
    db_pass = os.getenv("DB_PASSWORD")
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")
    
    # Construir URL para asyncpg
    url = f"postgresql+asyncpg://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
    
    engine = create_async_engine(url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        result = await session.execute(text("SELECT email, rol, tipo FROM usuarios"))
        users = result.all()
        print("\n--- Usuarios en Base de Datos ---")
        for user in users:
            print(f"Email: {user[0]} | Rol: {user[1]} | Tipo: {user[2]}")
        print("---------------------------------\n")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_users())
