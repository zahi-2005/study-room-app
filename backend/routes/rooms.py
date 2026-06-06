from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
import models
import auth

router = APIRouter()

class RoomRequest(BaseModel):
    name: str
    topic: str

def get_current_user(request: Request, db: Session = Depends(get_db)):
    
    authorization = request.headers.get("authorization")
    
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not logged in")
    
    token = authorization.split(" ")[1]
    username = auth.verify_token(token)
    
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


@router.get("/")
def get_rooms(db: Session = Depends(get_db)):
    rooms = db.query(models.Room).filter(models.Room.is_active == True).all()
    return [
        {
            "id": room.id,
            "name": room.name,
            "topic": room.topic,
            "created_by": room.created_by,
            "created_at": room.created_at
        }
        for room in rooms
    ]


@router.post("/")
def create_room(request: RoomRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new study room"""
    new_room = models.Room(
        name=request.name,
        topic=request.topic,
        created_by=current_user.id
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    return {
        "message": "Room created successfully",
        "room_id": new_room.id,
        "name": new_room.name,
        "topic": new_room.topic
    }


@router.post("/{room_id}/join")
def join_room(room_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
  
    already_joined = db.query(models.RoomMember).filter(
        models.RoomMember.room_id == room_id,
        models.RoomMember.user_id == current_user.id
    ).first()
    
    if already_joined:
        raise HTTPException(status_code=400, detail="Already in this room")
    
    member = models.RoomMember(room_id=room_id, user_id=current_user.id)
    db.add(member)
    db.commit()
    
    return {"message": f"Joined room: {room.name}"}