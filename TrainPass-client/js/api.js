const API_URL = "https://localhost:7288/api/v1";

function getToken() {
    return localStorage.getItem("token");
}

function getUserId() {
    return localStorage.getItem("userId");
}

function getRole() {
    return localStorage.getItem("role");
}

function getEmail() {
    return localStorage.getItem("email");
}

function saveAuthData(response) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("userId", response.id);
    localStorage.setItem("role", response.role);
    localStorage.setItem("email", response.email);
}

function removeAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
}

function isLoggedIn() {
    return getToken() !== null;
}

async function apiGet(url) {
    const response = await fetch(API_URL + url, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        }
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(text);
    }

    if (text === "") {
        return null;
    }

    return JSON.parse(text);
}

async function apiPost(url, body) {
    const response = await fetch(API_URL + url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + getToken()
        },
        body: JSON.stringify(body)
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(text);
    }

    if (text === "") {
        return null;
    }

    return JSON.parse(text);
}

async function apiPut(url) {
    const response = await fetch(API_URL + url, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + getToken()
        }
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(text);
    }

    if (text === "") {
        return null;
    }

    return JSON.parse(text);
}