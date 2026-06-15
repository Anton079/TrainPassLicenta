const stationNames = {
    101: "Bucuresti Nord",
    102: "Ploiesti Vest",
    103: "Brasov",
    104: "Constanta",
    105: "Sibiu",
    106: "Cluj-Napoca",
    107: "Iasi",
    108: "Timisoara Nord",
    109: "Craiova",
    110: "Arad",
    111: "Oradea",
    112: "Galati",
    113: "Suceava Nord",
    114: "Targu Mures",
    115: "Baia Mare"
};

let loadedSchedules = [];

checkAuth();
showUserInfo();
showSectionsByRole();
addSearchValidationEvents();
loadSchedules();

if (getRole() === "Customer") {
    loadMyTickets();
}

if (getRole() === "Admin") {
    loadAllTickets();
}

document.getElementById("btn-logout").addEventListener("click", logout);
document.getElementById("btn-search-schedules").addEventListener("click", searchSchedules);
document.getElementById("btn-buy-ticket").addEventListener("click", buyTicket);
document.getElementById("round-trip").addEventListener("change", toggleReturnDate);

function checkAuth() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

function showUserInfo() {
    document.getElementById("user-info").innerText =
        getEmail() + " - " + getRole();
}

function showSectionsByRole() {
    const role = getRole();

    const customerSections = document.querySelectorAll(".customer-section");
    const adminSections = document.querySelectorAll(".admin-section");

    if (role === "Customer") {
        adminSections.forEach(section => section.style.display = "none");
    }

    if (role === "Admin") {
        customerSections.forEach(section => section.style.display = "none");
    }
}

function logout() {
    removeAuthData();
    window.location.href = "login.html";
}

function toggleReturnDate() {
    const isRoundTrip = document.getElementById("round-trip").checked;
    const returnDateBox = document.getElementById("return-date-box");

    if (isRoundTrip) {
        returnDateBox.classList.remove("hidden");
    } else {
        returnDateBox.classList.add("hidden");
        document.getElementById("return-date").value = "";
    }
}

function addSearchValidationEvents() {
    document.getElementById("search-departure").addEventListener("change", clearSearchErrors);
    document.getElementById("search-arrival").addEventListener("change", clearSearchErrors);
    document.getElementById("search-date").addEventListener("change", clearSearchErrors);
    document.getElementById("return-date").addEventListener("change", clearSearchErrors);
}

function clearSearchErrors() {
    document.getElementById("search-departure").classList.remove("input-error");
    document.getElementById("search-arrival").classList.remove("input-error");
    document.getElementById("search-date").classList.remove("input-error");
    document.getElementById("return-date").classList.remove("input-error");
    document.getElementById("search-error").innerText = "";
}

function validateSearchFields() {
    let valid = true;

    const departure = document.getElementById("search-departure");
    const arrival = document.getElementById("search-arrival");
    const date = document.getElementById("search-date");
    const returnDate = document.getElementById("return-date");
    const roundTrip = document.getElementById("round-trip").checked;

    clearSearchErrors();

    if (departure.value === "") {
        departure.classList.add("input-error");
        valid = false;
    }

    if (arrival.value === "") {
        arrival.classList.add("input-error");
        valid = false;
    }

    if (date.value === "") {
        date.classList.add("input-error");
        valid = false;
    }

    if (roundTrip && returnDate.value === "") {
        returnDate.classList.add("input-error");
        valid = false;
    }

    if (!valid) {
        document.getElementById("search-error").innerText =
            "Completeaza toate campurile pentru cautare.";
    }

    return valid;
}

async function loadSchedules() {
    try {
        const data = await apiGet("/train-schedules/get");
        const schedules = getSchedulesArray(data);

        schedules.forEach(schedule => {
            schedule.tripType = "Cursa";
        });

        loadedSchedules = schedules;

        showSchedules(schedules);
        updateScheduleDashboard(schedules);
    } catch (error) {
        alert(error.message);
    }
}

async function searchSchedules() {
    if (!validateSearchFields()) {
        return;
    }

    const departureStationId = document.getElementById("search-departure").value;
    const arrivalStationId = document.getElementById("search-arrival").value;
    const date = document.getElementById("search-date").value;
    const returnDate = document.getElementById("return-date").value;
    const roundTrip = document.getElementById("round-trip").checked;

    try {
        const firstUrl = "/train-schedules/search"
            + "?departureStationId=" + departureStationId
            + "&arrivalStationId=" + arrivalStationId
            + "&date=" + date;

        const firstData = await apiGet(firstUrl);
        const firstSchedules = getSchedulesArray(firstData);

        firstSchedules.forEach(schedule => {
            schedule.tripType = "Dus";
        });

        let allSchedules = firstSchedules;

        if (roundTrip) {
            const secondUrl = "/train-schedules/search"
                + "?departureStationId=" + arrivalStationId
                + "&arrivalStationId=" + departureStationId
                + "&date=" + returnDate;

            const secondData = await apiGet(secondUrl);
            const secondSchedules = getSchedulesArray(secondData);

            secondSchedules.forEach(schedule => {
                schedule.tripType = "Intors";
            });

            allSchedules = firstSchedules.concat(secondSchedules);
        }

        loadedSchedules = allSchedules;
        showSchedules(allSchedules);
    } catch (error) {
        alert(error.message);
    }
}

async function buyTicket() {
    const trainScheduleId = Number(document.getElementById("ticket-schedule-id").value);
    const seatNumber = Number(document.getElementById("ticket-seat-number").value);

    try {
        const response = await apiPost("/tickets/buyTicket", {
            customerId: getUserId(),
            trainScheduleId: trainScheduleId,
            seatNumber: seatNumber
        });

        document.getElementById("ticket-message").innerText =
            "Bilet cumparat cu succes.";

        showTicketCard(response);
        loadMyTickets();
    } catch (error) {
        document.getElementById("ticket-message").innerText = error.message;
    }
}

async function loadMyTickets() {
    try {
        const data = await apiGet("/tickets/my-tickets");
        showMyTickets(data);
    } catch (error) {
        document.getElementById("my-tickets-table").innerHTML = "";
    }
}

async function loadAllTickets() {
    try {
        const data = await apiGet("/tickets/allTickets");
        showAllTickets(data);
        updateTicketDashboard(data);
    } catch (error) {
        document.getElementById("all-tickets-table").innerHTML = "";
    }
}

async function cancelTicket(ticketId) {
    try {
        await apiPut("/tickets/cancelTicket/" + ticketId);
        alert("Bilet anulat.");
        loadMyTickets();
        loadSchedules();
    } catch (error) {
        alert(error.message);
    }
}

function showSchedules(schedules) {
    const table = document.getElementById("schedules-table");

    table.innerHTML = "";

    schedules.forEach(schedule => {
        const departureName = getStationName(schedule.departureStationId);
        const arrivalName = getStationName(schedule.arrivalStationId);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${getTripBadge(schedule.tripType)}</td>
            <td>
                <div class="route-name">${departureName} → ${arrivalName}</div>
                <div class="small-text">Cursa ${schedule.id}</div>
            </td>
            <td>${formatDate(schedule.departureTime)}</td>
            <td>${formatDate(schedule.arrivalTime)}</td>
            <td>${schedule.price} lei</td>
            <td>
                <button onclick="selectSchedule(${schedule.id})">Alege</button>
            </td>
        `;

        table.appendChild(row);
    });
}

function selectSchedule(id) {
    document.getElementById("ticket-schedule-id").value = id;
    document.getElementById("ticket-message").innerText =
        "Ai ales cursa " + id + ". Acum scrie numarul locului.";
}

function showMyTickets(data) {
    const table = document.getElementById("my-tickets-table");

    table.innerHTML = "";

    const tickets = data.ticketList || data || [];

    tickets.forEach(ticket => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>Bilet ${ticket.id}</td>
            <td>Cursa ${ticket.trainScheduleId}</td>
            <td>Loc ${ticket.seatNumber}</td>
            <td>${getStatusLabel(ticket.status)}</td>
            <td>
                <button onclick="cancelTicket(${ticket.id})">Anuleaza</button>
            </td>
        `;

        table.appendChild(row);
    });
}

function showAllTickets(data) {
    const table = document.getElementById("all-tickets-table");

    table.innerHTML = "";

    const tickets = data.ticketList || data || [];

    tickets.forEach(ticket => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>Bilet ${ticket.id}</td>
            <td>Client ${ticket.customerId}</td>
            <td>Cursa ${ticket.trainScheduleId}</td>
            <td>Loc ${ticket.seatNumber}</td>
            <td>${getStatusLabel(ticket.status)}</td>
        `;

        table.appendChild(row);
    });
}

function updateScheduleDashboard(schedules) {
    const totalSchedules = document.getElementById("total-schedules");

    if (totalSchedules) {
        totalSchedules.innerText = schedules.length;
    }
}

function updateTicketDashboard(data) {
    const tickets = data.ticketList || data || [];

    const totalTickets = tickets.length;

    const activeTickets = tickets.filter(ticket =>
        ticket.status !== "Cancelled"
    ).length;

    const cancelledTickets = tickets.filter(ticket =>
        ticket.status === "Cancelled"
    ).length;

    document.getElementById("total-tickets").innerText = totalTickets;
    document.getElementById("active-tickets").innerText = activeTickets;
    document.getElementById("cancelled-tickets").innerText = cancelledTickets;
}

function showTicketCard(ticket) {
    const ticketCard = document.getElementById("ticket-card");

    const schedule = loadedSchedules.find(s =>
        Number(s.id) === Number(ticket.trainScheduleId)
    );

    let route = "Cursa " + ticket.trainScheduleId;

    if (schedule) {
        route = getStationName(schedule.departureStationId)
            + " → "
            + getStationName(schedule.arrivalStationId);
    }

    document.getElementById("ticket-code").innerText = "TP-" + ticket.id;
    document.getElementById("ticket-route").innerText = route;
    document.getElementById("ticket-schedule").innerText = ticket.trainScheduleId;
    document.getElementById("ticket-seat").innerText = ticket.seatNumber;
    document.getElementById("ticket-status").innerText = "Activ";

    ticketCard.classList.remove("hidden");
}

function printTicket() {
    window.print();
}

function getSchedulesArray(data) {
    return data.listTrainSchedule || data || [];
}

function getStationName(id) {
    return stationNames[id] || "Statia " + id;
}

function getTripBadge(type) {
    if (type === "Dus") {
        return `<span class="trip-badge trip-go">Dus</span>`;
    }

    if (type === "Intors") {
        return `<span class="trip-badge trip-return">Intors</span>`;
    }

    return `<span class="trip-badge">Cursa</span>`;
}

function getStatusLabel(status) {
    if (status === "Cancelled") {
        return `<span class="status-cancelled">Anulat</span>`;
    }

    return `<span class="status-active">Activ</span>`;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    return new Date(dateValue).toLocaleString("ro-RO");
}