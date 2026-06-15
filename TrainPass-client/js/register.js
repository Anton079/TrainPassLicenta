document.getElementById("btn-register").addEventListener("click", registerCustomer);

async function registerCustomer() {
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    message.innerText = "";

    if (firstName === "" || lastName === "" || email === "" || password === "") {
        message.innerText = "Completează toate câmpurile.";
        return;
    }

    try {
        const response = await apiPost("/auth/register", {
            firstName: firstName,
            lastName: lastName,
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