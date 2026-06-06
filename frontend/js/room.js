const API = "http://127.0.0.1:8000";
const WS = "ws://127.0.0.1:8000";

const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

// Get room_id from URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room_id");

if (!token) window.location.href = "index.html";
if (!roomId) window.location.href = "dashboard.html";


let timerInterval = null;
let timeLeft = 25 * 60; 
let timerRunning = false;


let ws = null;
let members = [username]; 


function connectWebSocket() {
    ws = new WebSocket(`${WS}/ws/${roomId}?token=${token}`);

    ws.onopen = () => {
        console.log("Connected to room");
        updateMembersList();
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.event === "user_joined") {
            if (!members.includes(message.username)) {
                members.push(message.username);
            }
            updateMembersList();
            addChatMessage("System", `${message.username} joined the room`);
        }

        else if (message.event === "user_left") {
            members = members.filter(m => m !== message.username);
            updateMembersList();
            addChatMessage("System", `${message.username} left the room`);
        }

        else if (message.event === "timer_start") {
            timeLeft = message.duration * 60;
            startLocalTimer();
            addChatMessage("System", `${message.username} started the timer`);
        }

        else if (message.event === "timer_end") {
            clearInterval(timerInterval);
            timerRunning = false;
            document.getElementById("timer").textContent = "25:00";
            addChatMessage("System", "Focus session complete!");
        }

        else if (message.event === "message") {
            addChatMessage(message.username, message.text);
        }
    };

    ws.onclose = () => {
        console.log("Disconnected from room");
    };
}


async function loadRoom() {
    try {
        const response = await fetch(`${API}/rooms/`);
        const rooms = await response.json();
        const room = rooms.find(r => r.id == roomId);

        if (room) {
            document.getElementById("room-name").textContent = room.name;
            document.getElementById("room-topic").textContent = room.topic;
            document.title = room.name;
        }
    } catch (err) {
        console.error("Could not load room details");
    }
}

function updateMembersList() {
    const list = document.getElementById("members-list");
    list.innerHTML = members.map(m => `
        <div class="member-item">
            <div class="member-dot"></div>
            <span>${m}</span>
        </div>
    `).join("");
}

function addChatMessage(sender, text) {
    const chat = document.getElementById("chat-messages");
    const div = document.createElement("div");
    div.className = "chat-message";
    div.innerHTML = `<span>${sender}:</span> ${text}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function startLocalTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerRunning = true;

    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            document.getElementById("timer").textContent = "00:00";
            return;
        }
        timeLeft--;
        const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
        const secs = (timeLeft % 60).toString().padStart(2, "0");
        document.getElementById("timer").textContent = `${mins}:${secs}`;
    }, 1000);
}

function startTimer() {
    if (timerRunning) return;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert("Not connected to room");
        return;
    }
    ws.send(JSON.stringify({ event: "timer_start", duration: 25 }));
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timeLeft = 25 * 60;
    document.getElementById("timer").textContent = "25:00";
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ event: "timer_end" }));
    }
}

function sendMessage() {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({ event: "message", text }));
    addChatMessage(username, text);
    input.value = "";
}

function leaveRoom() {
    if (ws) ws.close();
    window.location.href = "dashboard.html";
}


loadRoom();
connectWebSocket();