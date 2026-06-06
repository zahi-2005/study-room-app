from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routes import users, rooms, timer
import traceback

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def catch_exceptions(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})

app.include_router(users.router, prefix="/auth", tags=["Authentication"])
app.include_router(rooms.router, prefix="/rooms", tags=["Rooms"])
app.include_router(timer.router, tags=["WebSocket"])

@app.get("/")
def root():
    return {"message": "Study Room API is running"}