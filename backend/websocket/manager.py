from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: int, username: str):
        """Accept a new WebSocket connection and add to room"""
        await websocket.accept()
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        
        self.active_connections[room_id].append(websocket)
        await self.broadcast(room_id, {
            "event": "user_joined",
            "username": username
        }, exclude=websocket)

    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)

    async def broadcast(self, room_id: int, message: dict, exclude: WebSocket = None):
        if room_id not in self.active_connections:
            return
        
        import json
        for connection in self.active_connections[room_id]:
            if connection != exclude:
                await connection.send_text(json.dumps(message))

    def get_users_in_room(self, room_id: int):
        if room_id not in self.active_connections:
            return 0
        return len(self.active_connections[room_id])


manager = ConnectionManager()