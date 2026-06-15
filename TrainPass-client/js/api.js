const API_URL = "https://localhost:7288/api/v1";

function getToken() {
    return localStorage.getItem("token");
}

function getRole() {
    return localStorage.getItem("role");
}

function getEmail() {
    return localStorage.getItem("email");
}

function getUserId() {
    return localStorage.getItem("userId");
}

function isLoggedIn() {
    return getToken() !== null && getToken() !== "";
}

function saveAuthData(response) {
    localStorage.setItem("token", response.token);
    localStorage.setItem("userId", response.id || response.userId || "");
    localStorage.setItem("role", response.role || "");
    localStorage.setItem("email", response.email || "");
}

function removeAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
}

async function apiRequest(url, method, body) {
    const headers = {};

    if (body !== null && body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    if (getToken()) {
        headers["Authorization"] = "Bearer " + getToken();
    }

    const options = {
        method: method,
        headers: headers
    };

    if (body !== null && body !== undefined) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_URL + url, options);
    const text = await response.text();

    if (!response.ok) {
        throw new Error(getErrorText(text));
    }

    if (text === "") {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function apiGet(url) {
    return apiRequest(url, "GET", null);
}

function apiPost(url, body) {
    return apiRequest(url, "POST", body);
}

function apiPut(url, body) {
    return apiRequest(url, "PUT", body);
}

function apiDelete(url) {
    return apiRequest(url, "DELETE", null);
}

function getErrorText(text) {
    if (!text) {
        return "A apărut o eroare.";
    }

    try {
        const data = JSON.parse(text);

        if (data.message) {
            return data.message;
        }

        if (data.title) {
            return data.title;
        }

        return text;
    } catch {
        return text;
    }
}