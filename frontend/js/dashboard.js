const API = "http://127.0.0.1:8000";


const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

if (!token) {
    window.location.href = "index.html";
}

document.getElementById("welcome-text").textContent = `Hi, ${username}`;

async function loadRooms() {
    try {
        const response = await fetch(`${API}/rooms/`);
        const rooms = await response.json();

        const grid = document.getElementById("rooms-grid");

        if (rooms.length === 0) {
            grid.innerHTML = `<p style="color:#888;">No rooms yet. Create one!</p>`;
            return;
        }

        grid.innerHTML = rooms.map(room => `
            <div class="room-card" onclick="joinAndEnter(${room.id})">
                <h3>${room.name}</h3>
                <p class="room-topic">${room.topic}</p>
                <button class="btn-primary">Join Room</button>
            </div>
        `).join("");

    } catch (err) {
        document.getElementById("rooms-grid").innerHTML = `<p style="color:#ff6b6b;">Cannot connect to server</p>`;
    }
}

async function joinAndEnter(roomId) {
    try {
        await fetch(`${API}/rooms/${roomId}/join`, {
            method: "POST",
            headers: { "authorization": `Bearer ${token}` }
        });
    } catch (err) {
        
    }
    
    window.location.href = `room.html?room_id=${roomId}`;
}

function openCreateModal() {
    document.getElementById("modal").classList.add("active");
}

function closeModal() {
    document.getElementById("modal").classList.remove("active");
    document.getElementById("modal-message").textContent = "";
}

async function createRoom() {
    const name = document.getElementById("room-name").value.trim();
    const topic = document.getElementById("room-topic").value.trim();

    if (!name || !topic) {
        document.getElementById("modal-message").textContent = "Please fill in all fields";
        document.getElementById("modal-message").className = "message error";
        return;
    }

    try {
        const response = await fetch(`${API}/rooms/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, topic })
        });

        const data = await response.json();

        if (response.ok) {
            closeModal();
            loadRooms();
        } else {
            document.getElementById("modal-message").textContent = data.detail || "Failed to create room";
            document.getElementById("modal-message").className = "message error";
        }
    } catch (err) {
        document.getElementById("modal-message").textContent = "Cannot connect to server";
        document.getElementById("modal-message").className = "message error";
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "index.html";
}


loadRooms();