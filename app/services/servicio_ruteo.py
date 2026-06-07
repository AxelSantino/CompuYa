import math
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.entidades import Sucursal
from cachetools import TTLCache

sucursales_cache = TTLCache(maxsize=1, ttl=3600)

class ServicioRuteo:
    def __init__(self, db: AsyncSession):
        self.db = db

    def calcular_distancia_haversine(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0 
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2)**2 + 
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
            math.sin(dlon / 2)**2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
    
    async def obtener_sucursal_mas_cercana(self, lat_destino: float, lon_destino: float) -> Sucursal:
        if "sucursales" in sucursales_cache:
            sucursales = sucursales_cache["sucursales"]
            for s in sucursales:
                self.db.add(s)
        else:
            query = select(Sucursal)
            result = await self.db.execute(query)
            sucursales = result.scalars().all()
            for s in sucursales:
                self.db.expunge(s)
            sucursales_cache["sucursales"] = sucursales
        
        if not sucursales:
            return None
            
        sucursal_optima = min(
            sucursales,
            key=lambda s: self.calcular_distancia_haversine(lat_destino, lon_destino, s.latitud, s.longitud)
        )
        
        return sucursal_optima
