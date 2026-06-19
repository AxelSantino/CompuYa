from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.conexiones_activas: dict[str, WebSocket] = {}

    async def conectar(self, websocket: WebSocket, usuario_id: str):
        await websocket.accept()
        self.conexiones_activas[usuario_id] = websocket

    def desconectar(self, usuario_id: str):
        if usuario_id in self.conexiones_activas:
            del self.conexiones_activas[usuario_id]

    async def enviar_mensaje_personal(self, mensaje: dict, usuario_id: str):
        if usuario_id in self.conexiones_activas:
            websocket = self.conexiones_activas[usuario_id]
            await websocket.send_json(mensaje)
            
manager = ConnectionManager()