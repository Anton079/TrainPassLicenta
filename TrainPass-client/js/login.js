document.getElementById("btn-login").addEventListener("click", login);

async function login() {
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
        return;
    } catch {
    }

    try {
        const response = await apiPost("/auth/login-admin", {
            email: email,
            password: password
        });

        saveAuthData(response);
        window.location.href = "index.html";
        return;
    } catch {
        message.innerText = "Emailul sau parola sunt greșite.";
    }
}