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
    localStorage.setItem("token", response.token || response.Token);
    localStorage.setItem("userId", response.id || response.Id);
    localStorage.setItem("role", response.role || response.Role);
    localStorage.setItem("email", response.email || response.Email);
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

function getHeaders(hasBody) {
    const headers = {};

    if (hasBody) {
        headers["Content-Type"] = "application/json";
    }

    if (getToken()) {
        headers["Authorization"] = "Bearer " + getToken();
    }

    return headers;
}

async function apiGet(url) {
    const response = await fetch(API_URL + url, {
        method: "GET",
        headers: getHeaders(false)
    });

    return readResponse(response);
}

async function apiPost(url, body) {
    const response = await fetch(API_URL + url, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(body)
    });

    return readResponse(response);
}

async function apiPut(url) {
    const response = await fetch(API_URL + url, {
        method: "PUT",
        headers: getHeaders(false)
    });

    return readResponse(response);
}

async function readResponse(response) {
    const text = await response.text();

    if (!response.ok) {
        throw new Error(getErrorMessage(text));
    }

    if (text === "") {
        return null;
    }

    return JSON.parse(text);
}

function getErrorMessage(text) {
    if (!text) {
        return "A apărut o eroare.";
    }

    try {
        const error = JSON.parse(text);

        if (error.errors) {
            const messages = [];

            Object.keys(error.errors).forEach(key => {
                error.errors[key].forEach(message => {
                    messages.push(translateField(key) + ": " + translateMessage(message));
                });
            });

            return messages.join(" ");
        }

        if (error.title) {
            return translateMessage(error.title);
        }

        if (error.message) {
            return translateMessage(error.message);
        }
    } catch {
        return translateMessage(text);
    }

    return "A apărut o eroare.";
}

function translateField(field) {
    if (field === "CustomerId") {
        return "Client";
    }

    if (field === "TrainScheduleId") {
        return "Cursă";
    }

    if (field === "SeatNumber") {
        return "Loc";
    }

    if (field === "SeatNumbers") {
        return "Locuri";
    }

    if (field === "Status") {
        return "Stare";
    }

    return field;
}

function translateMessage(message) {
    if (message.includes("The CustomerId field is required")) {
        return "Trebuie să intri din nou în cont.";
    }

    if (message.includes("The Status field is required")) {
        return "Starea biletului lipsește.";
    }

    if (message.includes("One or more validation errors occurred")) {
        return "Verifică datele introduse.";
    }

    return message;
}