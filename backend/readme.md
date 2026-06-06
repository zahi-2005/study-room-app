# 📚 Study Room App

A real-time collaborative study platform where students can create or join study rooms, 
sync a Pomodoro timer together, and chat — all in real time.

## 🔥 Features

- **Authentication** — Register and login with JWT tokens
- **Study Rooms** — Create and join rooms by topic
- **Real-time Timer** — Shared Pomodoro timer synced across all users via WebSockets
- **Live Presence** — See who is online in the room
- **Chat** — Real-time messaging inside study rooms

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | FastAPI (Python) |
| Database | MySQL |
| Real-time | WebSockets |
| Authentication | JWT Tokens |

## 📁 Project Structure

```
study-room-app/
├── backend/
│   ├── main.py           # Entry point, FastAPI app
│   ├── database.py       # Database connection
│   ├── models.py         # Database table definitions
│   ├── auth.py           # JWT and password hashing
│   ├── routes/
│   │   ├── users.py      # Register and login endpoints
│   │   └── rooms.py      # Room CRUD endpoints
│   └── websocket/
│       └── manager.py    # WebSocket connection manager
└── frontend/
    ├── index.html        # Login and register page
    ├── dashboard.html    # Rooms listing page
    ├── room.html         # Study room with timer and chat
    ├── css/
    │   └── style.css     # Styling
    └── js/
        ├── auth.js       # Login and register logic
        ├── dashboard.js  # Rooms listing logic
        └── room.js       # Timer, WebSocket, chat logic
```

## ⚙️ Setup and Installation

### Prerequisites
- Python 3.10+
- MySQL

### Backend Setup

1. Clone the repository
```
git clone https://github.com/zahi-2005/study-room-app.git
cd study-room-app/backend
```

2. Create virtual environment
```
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies
```
pip install -r requirements.txt
```

4. Create MySQL database
```sql
CREATE DATABASE studyroom;
```

5. Update database URL in `database.py`
```python
DATABASE_URL = "mysql+pymysql://root:yourpassword@localhost/studyroom"
```

6. Run the server
```
uvicorn main:app --reload
```

Backend runs at: `http://127.0.0.1:8000`

### Frontend Setup

Open `frontend/index.html` with Live Server in VS Code.

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | /auth/register | Create account | No |
| POST | /auth/login | Login and get token | No |
| GET | /rooms/ | List all rooms | No |
| POST | /rooms/ | Create a room | Yes |
| POST | /rooms/{id}/join | Join a room | Yes |
| WS | /ws/{room_id} | WebSocket connection | Yes |

## 🔄 How WebSockets Work

When a user enters a study room, their browser opens a permanent WebSocket connection to the server. When one user starts the timer, the server instantly broadcasts that event to all other users in the same room — keeping everyone in sync without any page refresh.

## 📸 Screenshots

> Add screenshots of your app here

## 🚀 Future Improvements

- Streak tracking and session history
- User profiles
- Room search and filtering
- Mobile responsive design
- Deployment on cloud platform
