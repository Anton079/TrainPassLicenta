document.getElementById("btn-login").addEventListener("click", login);
document.getElementById("btn-logout").addEventListener("click", logout);
document.getElementById("btn-load-schedules").addEventListener("click", loadSchedules);
document.getElementById("btn-free-seats").addEventListener("click", loadFreeSeats);
document.getElementById("btn-buy-ticket").addEventListener("click", buyTicket);

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await apiPost("/auth/login", {
            email: email,
            password: password
        });

        saveToken(response.token);

        document.getElementById("login-message").innerText = "Login reusit.";
    } catch (error) {
        document.getElementById("login-message").innerText = error.message;
    }
}

function logout() {
    removeToken();
    document.getElementById("login-message").innerText = "Te-ai delogat.";
}

async function loadSchedules() {
    try {
        const data = await apiGet("/trainSchedules/allTrainSchedules");
        showSchedules(data);
    } catch (error) {
        alert("Nu s-au putut incarca schedule-urile.");
    }
}

async function loadFreeSeats() {
    const trainScheduleId = document.getElementById("free-seats-schedule-id").value;

    try {
        const seats = await apiGet(`/tickets/freeSeats/${trainScheduleId}`);
        showFreeSeats(seats);
    } catch (error) {
        alert("Nu s-au putut incarca locurile libere.");
    }
}

async function buyTicket() {
    const customerId = Number(document.getElementById("ticket-customer-id").value);
    const trainScheduleId = Number(document.getElementById("ticket-schedule-id").value);
    const seatNumber = Number(document.getElementById("ticket-seat-number").value);

    try {
        const response = await apiPost("/tickets/buyTicket", {
            customerId: customerId,
            trainScheduleId: trainScheduleId,
            seatNumber: seatNumber
        });

        document.getElementById("ticket-message").innerText =
            "Bilet cumparat cu succes. Id: " + response.id;

        loadFreeSeats();
    } catch (error) {
        document.getElementById("ticket-message").innerText = error.message;
    }
}