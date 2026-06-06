const API = "http://127.0.0.1:8000";

function showTab(tab) {
    
    document.getElementById("login-form").style.display = tab === "login" ? "block" : "none";
    document.getElementById("register-form").style.display = tab === "register" ? "block" : "none";

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    event.target.classList.add("active");

    document.getElementById("message").textContent = "";
}

function showMessage(text, type) {
    const msg = document.getElementById("message");
    msg.textContent = text;
    msg.className = "message " + type;
}

async function login() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
        showMessage("Please fill in all fields", "error");
        return;
    }

    try {
        const response = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("username", data.username);
            showMessage("Login successful! Redirecting...", "success");
            setTimeout(() => window.location.href = "dashboard.html", 1000);
        } else {
            showMessage(data.detail || "Login failed", "error");
        }
    } catch (err) {
        showMessage("Cannot connect to server", "error");
    }
}

async function register() {
    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    if (!username || !email || !password) {
        showMessage("Please fill in all fields", "error");
        return;
    }

    try {
        const response = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage("Account created! Please login.", "success");
            setTimeout(() => showTab("login"), 1500);
        } else {
            showMessage(data.detail || "Registration failed", "error");
        }
    } catch (err) {
        showMessage("Cannot connect to server", "error");
    }
}


if (localStorage.getItem("token")) {
    window.location.href = "dashboard.html";
}
