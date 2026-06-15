document.getElementById("btn-login-customer").addEventListener("click", loginCustomer);
document.getElementById("btn-login-admin").addEventListener("click", loginAdmin);

async function loginCustomer() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await apiPost("/auth/login-customer", {
            email: email,
            password: password
        });

        saveAuthData(response);

        window.location.href = "index.html";
    } catch (error) {
        document.getElementById("message").innerText = error.message;
    }
}

async function loginAdmin() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await apiPost("/auth/login-admin", {
            email: email,
            password: password
        });

        saveAuthData(response);

        window.location.href = "index.html";
    } catch (error) {
        document.getElementById("message").innerText = error.message;
    }
}