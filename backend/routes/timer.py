from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websocket.manager import manager
import auth
import json

router = APIRouter()

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int, token: str):
    
    username = auth.verify_token(token)
    if not username:
        await websocket.close(code=4001)
        return
    
   
    await manager.connect(websocket, room_id, username)
    
    try:
        while True:
            
            data = await websocket.receive_text()
            message = json.loads(data)
            
            event = message.get("event")
            
            if event == "timer_start":
                
                await manager.broadcast(room_id, {
                    "event": "timer_start",
                    "username": username,
                    "duration": message.get("duration", 25)
                })
            
            elif event == "timer_end":
                
                await manager.broadcast(room_id, {
                    "event": "timer_end",
                    "username": username
                })
            
            elif event == "message":
               
                await manager.broadcast(room_id, {
                    "event": "message",
                    "username": username,
                    "text": message.get("text", "")
                })

    except WebSocketDisconnect:
        
        manager.disconnect(websocket, room_id)
        await manager.broadcast(room_id, {
            "event": "user_left",
            "username": username
        })