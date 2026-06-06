from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
import models
import auth

router = APIRouter()

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    
    existing_user = db.query(models.User).filter(
        models.User.username == request.username
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    
    hashed = auth.hash_password(request.password)
    
   
    new_user = models.User(
        username=request.username,
        email=request.email,
        password_hash=hashed
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Account created successfully", "username": new_user.username}


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.username == request.username
    ).first()
    

    if not user or not auth.verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    
    token = auth.create_access_token(data={"sub": user.username})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username
    }