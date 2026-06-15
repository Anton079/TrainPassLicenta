document.getElementById("btn-login-customer").addEventListener("click", loginCustomer);
document.getElementById("btn-login-admin").addEventListener("click", loginAdmin);

async function loginCustomer() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    message.innerText = "";

    if (email === "" || password === "") {
        message.innerText = "Completează emailul și parola.";
        return;
    }

    try {
        const response = await apiPost("/auth/login-customer", {
            email: email,
            password: password
        });

        saveAuthData(response);
        window.location.href = "index.html";
    } catch (error) {
        message.innerText = getFriendlyError(error.message);
    }
}

async function loginAdmin() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    message.innerText = "";

    if (email === "" || password === "") {
        message.innerText = "Completează emailul și parola.";
        return;
    }

    try {
        const response = await apiPost("/auth/login-admin", {
            email: email,
            password: password
        });

        saveAuthData(response);
        window.location.href = "index.html";
    } catch (error) {
        message.innerText = getFriendlyError(error.message);
    }
}

function getFriendlyError(text) {
    if (!text) {
        return "A apărut o eroare.";
    }

    return text;
}