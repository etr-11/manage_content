// frontend/script.js

document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8000";

    // === ЭЛЕМЕНТЫ ===
    const showLoginBtn = document.getElementById("show-login");
    const showRegisterBtn = document.getElementById("show-register");
    const logoutBtn = document.getElementById("logout");
    const uploadTab = document.getElementById("upload-tab");
    const browseTab = document.getElementById("browse-tab");
    const statsSection = document.getElementById("stats");
    const welcomeMessage = document.getElementById("welcome-message");

    const navLinks = document.querySelectorAll(".nav-link");
    const tabs = document.querySelectorAll(".tab-content");

    // === ОТКРЫТИЕ ВКЛАДКИ ===
    function openTab(tabId) {
        tabs.forEach(t => t.classList.remove("active"));
        document.getElementById(tabId).classList.add("active");
        navLinks.forEach(l => l.classList.remove("active"));
        const link = document.querySelector(`[data-tab="${tabId}"]`);
        if (link) link.classList.add("active");
    }

    // === ПРОВЕРКА АВТОРИЗАЦИИ ===
    function checkAuth() {
        const token = localStorage.getItem("token");
        if (token) {
            showLoginBtn.style.display = "none";
            showRegisterBtn.style.display = "none";
            logoutBtn.style.display = "inline";
            uploadTab.style.display = "list-item";
            browseTab.style.display = "list-item";
            statsSection.style.display = "flex";
            welcomeMessage.textContent = "Добро пожаловать!";
            getContent();
        } else {
            showLoginBtn.style.display = "inline";
            showRegisterBtn.style.display = "inline";
            logoutBtn.style.display = "none";
            uploadTab.style.display = "none";
            browseTab.style.display = "none";
            statsSection.style.display = "none";
            welcomeMessage.textContent = "Войдите или зарегистрируйтесь.";
        }
    }

    // === КНОПКИ "ВОЙТИ" / "РЕГИСТРАЦИЯ" ===
    showLoginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openTab("login");
    });

    showRegisterBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openTab("register");
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        checkAuth();
        openTab("home");
        alert("Вы вышли!");
    });

    // === НАВИГАЦИЯ ===
    navLinks.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const tabId = link.dataset.tab;
            openTab(tabId);
        });
    });

    // === ЛОГИН ===
    document.getElementById("login-form").addEventListener("submit", async e => {
        e.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;

        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.access_token);
            document.getElementById("login-form").reset();
            checkAuth();
            openTab("home");
            alert("Вход выполнен!");
        } else {
            alert(data.detail || "Ошибка входа");
        }
    });

    // === РЕГИСТРАЦИЯ ===
    document.getElementById("register-form").addEventListener("submit", async e => {
        e.preventDefault();
        const username = document.getElementById("register-username").value;
        const password = document.getElementById("register-password").value;

        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
            document.getElementById("register-form").reset();
            alert("Регистрация успешна! Войдите.");
            openTab("login");
        } else {
            alert(data.detail || "Ошибка");
        }
    });

    // === ЗАГРУЗКА КОНТЕНТА ===
    async function uploadContent(formData) {
        const res = await fetch(`${API_URL}/content/`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
            body: formData
        });
        return res.ok ? res.json() : null;
    }

    // Текст
    document.getElementById("text-form").addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", document.getElementById("text-title").value);
        formData.append("text", document.getElementById("text-content").value);
        if (await uploadContent(formData)) {
            e.target.reset();
            alert("Текст добавлен!");
            getContent();
        }
    });

    // Остальные формы — аналогично

    // === ПОЛУЧЕНИЕ КОНТЕНТА ===
    async function getContent() {
        const res = await fetch(`${API_URL}/content/`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) {
            const data = await res.json();
            renderContent(data);
            updateStats(data);
        }
    }

    function renderContent(items) {
        const list = document.getElementById("content-list");
        list.innerHTML = "";
        items.forEach(item => {
            const div = document.createElement("div");
            div.className = "content-item";
            div.innerHTML = `
                <h3>${item.title}</h3>
                <small>${new Date(item.created_at).toLocaleString()}</small>
                ${item.file_path ? `<p><strong>Файл:</strong> ${item.file_path}</p>` : `<p>${item.text}</p>`}
                ${!item.is_safe ? `<p style="color:red">Недопустимо!</p>` : ""}
            `;
            list.appendChild(div);
        });
    }

    function updateStats(items) {
        document.getElementById("text-count").textContent = items.filter(i => !i.file_path).length;
        document.getElementById("image-count").textContent = items.filter(i => i.file_path && /\.(jpe?g|png|gif)$/i.test(i.file_path)).length;
        document.getElementById("file-count").textContent = items.filter(i => i.file_path && !/\.(jpe?g|png|gif)$/i.test(i.file_path)).length;
    }

    // === ИНИЦИАЛИЗАЦИЯ ===
    checkAuth();
});