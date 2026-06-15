const API_URL = "https://localhost:7000/api/v1";

function getToken() {
    return localStorage.getItem("token");
}

function saveToken(token) {
    localStorage.setItem("token", token);
}

function removeToken() {
    localStorage.removeItem("token");
}

async function apiGet(url) {
    const response = await fetch(API_URL + url, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + getToken()
        }
    });

    return response.json();
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