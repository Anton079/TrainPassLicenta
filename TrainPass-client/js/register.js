document.getElementById("btn-register").addEventListener("click", registerCustomer);

async function registerCustomer() {
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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
        document.getElementById("message").innerText = error.message;
    }
}