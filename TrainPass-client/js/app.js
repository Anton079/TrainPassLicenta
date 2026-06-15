const stationNames = {
    101: "București Nord",
    102: "Ploiești Vest",
    103: "Brașov",
    104: "Constanța",
    105: "Sibiu",
    106: "Cluj-Napoca",
    107: "Iași",
    108: "Timișoara Nord",
    109: "Craiova",
    110: "Arad",
    111: "Oradea",
    112: "Galați",
    113: "Suceava Nord",
    114: "Târgu Mureș",
    115: "Baia Mare"
};

let loadedSchedules = [];
let loadedTickets = [];
let currentSeatsInfo = null;
let lastBoughtTickets = [];

startPage();

async function startPage() {
    checkAuth();
    showUserInfo();
    showSectionsByRole();
    addEvents();
    toggleReturnDate();

    await loadSchedules();

    if (getRole() === "Customer") {
        await loadMyTickets();
    }

    if (getRole() === "Admin") {
        await loadAllTickets();
    }
}

function addEvents() {
    document.getElementById("btn-logout").addEventListener("click", logout);
    document.getElementById("btn-search-schedules").addEventListener("click", searchSchedules);
    document.getElementById("btn-buy-ticket").addEventListener("click", buyTickets);
    document.getElementById("round-trip").addEventListener("change", toggleReturnDate);
    document.getElementById("ticket-seat-count").addEventListener("change", loadSeatsInfo);
    document.getElementById("search-departure").addEventListener("change", clearSearchErrors);
    document.getElementById("search-arrival").addEventListener("change", clearSearchErrors);
    document.getElementById("search-date").addEventListener("change", clearSearchErrors);
    document.getElementById("return-date").addEventListener("change", clearSearchErrors);
    document.getElementById("btn-print-last-ticket").addEventListener("click", function () {
        printTickets(lastBoughtTickets);
    });
    document.getElementById("btn-save-last-ticket").addEventListener("click", function () {
        printTickets(lastBoughtTickets);
    });
}

function checkAuth() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

function showUserInfo() {
    const email = getEmail();
    const role = getRole();
    const badge = document.getElementById("role-badge");

    document.getElementById("user-info").innerText = email;

    if (role === "Admin") {
        badge.innerText = "Administrator";
    } else {
        badge.innerText = "Utilizator";
    }
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
    const checked = document.getElementById("round-trip").checked;
    const returnDate = document.getElementById("return-date");

    if (checked) {
        returnDate.disabled = false;
    } else {
        returnDate.disabled = true;
        returnDate.value = "";
        returnDate.classList.remove("input-error");
    }

    clearSearchErrors();
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
        document.getElementById("search-error").innerText = "Completează câmpurile marcate.";
    }

    return valid;
}

async function loadSchedules() {
    try {
        showEmptyRow("schedules-table", "Se încarcă datele...", 6);

        const data = await apiGet("/train-schedules/get");
        const schedules = getSchedulesArray(data);

        schedules.forEach(schedule => {
            schedule.tripType = "Cursă";
        });

        loadedSchedules = schedules;

        showSchedules(schedules);
        updateScheduleDashboard(schedules);
    } catch (error) {
        showEmptyRow("schedules-table", "Nu s-au putut încărca datele.", 6);
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
        showEmptyRow("schedules-table", "Se caută cursele...", 6);

        const firstUrl = "/train-schedules/search?departureStationId=" + departureStationId + "&arrivalStationId=" + arrivalStationId + "&date=" + date;
        const firstData = await apiGet(firstUrl);
        const firstSchedules = getSchedulesArray(firstData);

        firstSchedules.forEach(schedule => {
            schedule.tripType = "Dus";
        });

        let allSchedules = firstSchedules;

        if (roundTrip) {
            const secondUrl = "/train-schedules/search?departureStationId=" + arrivalStationId + "&arrivalStationId=" + departureStationId + "&date=" + returnDate;
            const secondData = await apiGet(secondUrl);
            const secondSchedules = getSchedulesArray(secondData);

            secondSchedules.forEach(schedule => {
                schedule.tripType = "Întors";
            });

            allSchedules = firstSchedules.concat(secondSchedules);
        }

        loadedSchedules = allSchedules;
        showSchedules(allSchedules);
    } catch (error) {
        showEmptyRow("schedules-table", "Nu s-au găsit curse pentru această căutare.", 6);
    }
}

function showSchedules(schedules) {
    const table = document.getElementById("schedules-table");
    table.innerHTML = "";

    if (!schedules || schedules.length === 0) {
        showEmptyRow("schedules-table", "Nu există curse disponibile.", 6);
        return;
    }

    schedules.forEach(schedule => {
        const id = getScheduleId(schedule);
        const departureName = getStationName(getScheduleDeparture(schedule));
        const arrivalName = getStationName(getScheduleArrival(schedule));

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${getTripBadge(schedule.tripType)}</td>
            <td>
                <strong>${departureName} → ${arrivalName}</strong>
                <br>
                <span class="small-text">Cursa ${id}</span>
            </td>
            <td>${formatDate(getScheduleDepartureTime(schedule))}</td>
            <td>${formatDate(getScheduleArrivalTime(schedule))}</td>
            <td><strong>${getSchedulePrice(schedule)} lei</strong></td>
            <td><button onclick="selectSchedule(${id})">Alege</button></td>
        `;

        table.appendChild(row);
    });
}

async function selectSchedule(id) {
    document.getElementById("ticket-schedule-id").value = id;
    document.getElementById("ticket-message").innerText = "Ai ales cursa " + id + ". Alege numărul de locuri.";
    document.getElementById("ticket-message").classList.remove("error");
    await loadSeatsInfo();
}

async function loadSeatsInfo() {
    const scheduleId = Number(document.getElementById("ticket-schedule-id").value);
    const count = getSeatCount();

    currentSeatsInfo = null;
    document.getElementById("seat-selects").innerHTML = "";

    if (!scheduleId) {
        showSeatInfoMessage("Selectează mai întâi o cursă din tabel.");
        return;
    }

    try {
        showSeatInfoMessage("Se încarcă locurile disponibile...");
        const data = await apiGet("/tickets/available-seats/" + scheduleId + "?numberOfSeats=" + count);
        currentSeatsInfo = data;
        renderSeatInputs();
    } catch (error) {
        showSeatInfoMessage("Nu s-au putut încărca locurile disponibile.");
    }
}

function renderSeatInputs() {
    const count = getSeatCount();
    const availableSeats = getAvailableSeats();
    const occupiedSeats = getOccupiedSeats();
    const totalSeats = getValue(currentSeatsInfo, "totalSeats");
    const box = document.getElementById("seat-selects");

    document.getElementById("seat-info-box").innerHTML = `
        <p><strong>Locuri totale:</strong> ${totalSeats} · <strong>Libere:</strong> ${availableSeats.length} · <strong>Ocupate:</strong> ${occupiedSeats.length}</p>
    `;

    box.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const div = document.createElement("div");
        div.className = "seat-field";

        div.innerHTML = `
            <label for="seat-select-${i}">Locul ${i + 1}</label>
            <select id="seat-select-${i}" class="seat-select" onchange="refreshSeatDropdowns()">
                ${getSeatOptions(i)}
            </select>
        `;

        box.appendChild(div);
    }

    refreshSeatDropdowns();
}

function refreshSeatDropdowns() {
    const selects = document.querySelectorAll(".seat-select");

    selects.forEach((select, index) => {
        const currentValue = select.value;
        select.innerHTML = getSeatOptions(index);

        if (currentValue) {
            select.value = currentValue;
        }
    });
}

function getSeatOptions(index) {
    const availableSeats = getAvailableSeats();
    const selectedSeats = getSelectedSeats();
    const currentSelect = document.getElementById("seat-select-" + index);
    const currentValue = currentSelect ? Number(currentSelect.value) : 0;

    let html = `<option value="">Alege locul</option>`;

    availableSeats.forEach(seat => {
        const isUsed = selectedSeats.includes(seat) && seat !== currentValue;

        if (!isUsed) {
            html += `<option value="${seat}">Loc ${seat}</option>`;
        }
    });

    return html;
}

function getSelectedSeats() {
    const selects = document.querySelectorAll(".seat-select");
    const seats = [];

    selects.forEach(select => {
        const value = Number(select.value);

        if (value) {
            seats.push(value);
        }
    });

    return seats;
}

function getAvailableSeats() {
    if (!currentSeatsInfo) {
        return [];
    }

    return getValue(currentSeatsInfo, "availableSeats") || [];
}

function getOccupiedSeats() {
    if (!currentSeatsInfo) {
        return [];
    }

    return getValue(currentSeatsInfo, "occupiedSeats") || [];
}

function getSeatCount() {
    const input = document.getElementById("ticket-seat-count");
    let value = Number(input.value);

    if (!value || value < 1) {
        value = 1;
        input.value = 1;
    }

    return value;
}

function showSeatInfoMessage(message) {
    document.getElementById("seat-info-box").innerHTML = "<p>" + message + "</p>";
    document.getElementById("seat-selects").innerHTML = "";
}

async function buyTickets() {
    const trainScheduleId = Number(document.getElementById("ticket-schedule-id").value);
    const count = getSeatCount();
    const selectedSeats = getSelectedSeats();
    const message = document.getElementById("ticket-message");

    message.innerText = "";
    message.classList.remove("error");

    if (!trainScheduleId) {
        message.innerText = "Alege o cursă din tabel.";
        message.classList.add("error");
        return;
    }

    if (selectedSeats.length !== count) {
        message.innerText = "Selectează toate locurile.";
        message.classList.add("error");
        return;
    }

    try {
        const response = await apiPost("/tickets/buyTickets", {
            trainScheduleId: trainScheduleId,
            seatNumbers: selectedSeats
        });

        const tickets = getTicketsArray(response);

        lastBoughtTickets = tickets;
        message.classList.remove("error");
        message.innerText = "Bilet cumpărat cu succes.";

        showTicketCard(tickets);
        await loadSeatsInfo();
        await loadMyTickets();
    } catch (error) {
        message.classList.add("error");
        message.innerText = error.message;
    }
}

async function loadMyTickets() {
    try {
        showEmptyRow("my-tickets-table", "Se încarcă biletele...", 8);

        const data = await apiGet("/tickets/my-tickets");
        loadedTickets = getTicketsArray(data);
        showMyTickets(loadedTickets);
    } catch (error) {
        loadedTickets = [];
        showEmptyRow("my-tickets-table", "Nu ai bilete cumpărate.", 8);
    }
}

async function loadAllTickets() {
    try {
        showEmptyRow("all-tickets-table", "Se încarcă biletele...", 5);

        const data = await apiGet("/tickets/allTickets");
        const tickets = getTicketsArray(data);
        showAllTickets(tickets);
        updateTicketDashboard(data);
    } catch (error) {
        showEmptyRow("all-tickets-table", "Nu există bilete.", 5);
    }
}

async function cancelTicket(ticketId) {
    try {
        await apiPut("/tickets/cancelTicket/" + ticketId);
        alert("Bilet anulat.");
        await loadSchedules();
        await loadMyTickets();
        await loadSeatsInfo();
    } catch (error) {
        alert(error.message);
    }
}

function showMyTickets(tickets) {
    const table = document.getElementById("my-tickets-table");
    table.innerHTML = "";

    if (!tickets || tickets.length === 0) {
        showEmptyRow("my-tickets-table", "Nu ai bilete cumpărate.", 8);
        return;
    }

    tickets.forEach(ticket => {
        const details = getTicketDetails(ticket);
        const id = getTicketId(ticket);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>Bilet ${id}</strong><br><span class="small-text">Cursa ${details.scheduleId}</span></td>
            <td>${details.route}</td>
            <td>${details.departureTime}</td>
            <td>${details.arrivalTime}</td>
            <td>Loc ${details.seatNumber}</td>
            <td>${details.price}</td>
            <td>${getStatusLabel(details.status)}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="printTicketById(${id})">Printează</button>
                    <button class="btn-dark" onclick="printTicketById(${id})">Salvează PDF</button>
                    ${getTicketAction(ticket)}
                </div>
            </td>
        `;

        table.appendChild(row);
    });
}

function showAllTickets(tickets) {
    const table = document.getElementById("all-tickets-table");
    table.innerHTML = "";

    if (!tickets || tickets.length === 0) {
        showEmptyRow("all-tickets-table", "Nu există bilete.", 5);
        return;
    }

    tickets.forEach(ticket => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>Bilet ${getTicketId(ticket)}</strong></td>
            <td>Client ${getCustomerId(ticket)}</td>
            <td>Cursa ${getTrainScheduleId(ticket)}</td>
            <td>Loc ${getSeatNumber(ticket)}</td>
            <td>${getStatusLabel(getTicketStatus(ticket))}</td>
        `;

        table.appendChild(row);
    });
}

function getTicketAction(ticket) {
    if (getTicketStatus(ticket) === "Cancelled") {
        return "";
    }

    return `<button class="btn-danger" onclick="cancelTicket(${getTicketId(ticket)})">Anulează</button>`;
}

function updateScheduleDashboard(schedules) {
    const totalSchedules = document.getElementById("total-schedules");

    if (totalSchedules) {
        totalSchedules.innerText = schedules.length;
    }
}

function updateTicketDashboard(data) {
    const tickets = getTicketsArray(data);
    const totalTickets = tickets.length;
    const activeTickets = tickets.filter(ticket => getTicketStatus(ticket) !== "Cancelled").length;
    const cancelledTickets = tickets.filter(ticket => getTicketStatus(ticket) === "Cancelled").length;

    document.getElementById("total-tickets").innerText = totalTickets;
    document.getElementById("active-tickets").innerText = activeTickets;
    document.getElementById("cancelled-tickets").innerText = cancelledTickets;
}

function showTicketCard(tickets) {
    if (!tickets || tickets.length === 0) {
        return;
    }

    const firstTicket = tickets[0];
    const details = getTicketDetails(firstTicket);
    const ids = tickets.map(ticket => "TP-" + getTicketId(ticket)).join(", ");
    const seats = tickets.map(ticket => getSeatNumber(ticket)).join(", ");
    const total = getTotalPrice(tickets);

    document.getElementById("ticket-code").innerText = ids;
    document.getElementById("ticket-route").innerText = details.route;
    document.getElementById("ticket-schedule").innerText = details.scheduleId;
    document.getElementById("ticket-seat").innerText = seats;
    document.getElementById("ticket-total").innerText = total;
    document.getElementById("ticket-status").innerText = "Activ";

    document.getElementById("ticket-card").classList.remove("hidden");
}

function printTicketById(ticketId) {
    const ticket = loadedTickets.find(item => getTicketId(item) === ticketId);

    if (!ticket) {
        alert("Biletul nu a fost găsit.");
        return;
    }

    printTickets([ticket]);
}

function printTickets(tickets) {
    if (!tickets || tickets.length === 0) {
        return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Browserul a blocat fereastra de printare.");
        return;
    }

    printWindow.document.open();
    printWindow.document.write(getPrintHtml(tickets));
    printWindow.document.close();

    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
    };
}

function getPrintHtml(tickets) {
    let ticketHtml = "";

    tickets.forEach(ticket => {
        const details = getTicketDetails(ticket);

        ticketHtml += `
            <div class="ticket">
                <div class="ticket-header">
                    <div>
                        <h1>TrainPass</h1>
                        <p>Bilet de tren</p>
                    </div>
                    <strong>TP-${getTicketId(ticket)}</strong>
                </div>

                <div class="ticket-row">
                    <span>Rută</span>
                    <strong>${details.route}</strong>
                </div>

                <div class="ticket-row">
                    <span>Plecare</span>
                    <strong>${details.departureTime}</strong>
                </div>

                <div class="ticket-row">
                    <span>Sosire</span>
                    <strong>${details.arrivalTime}</strong>
                </div>

                <div class="ticket-grid">
                    <div>
                        <span>Cursă</span>
                        <strong>${details.scheduleId}</strong>
                    </div>
                    <div>
                        <span>Loc</span>
                        <strong>${details.seatNumber}</strong>
                    </div>
                    <div>
                        <span>Preț</span>
                        <strong>${details.price}</strong>
                    </div>
                    <div>
                        <span>Stare</span>
                        <strong>${details.statusText}</strong>
                    </div>
                </div>
            </div>
        `;
    });

    return `
        <!DOCTYPE html>
        <html lang="ro">
        <head>
            <meta charset="UTF-8">
            <title>Bilet TrainPass</title>
            <style>
                @page {
                    size: A4;
                    margin: 16mm;
                }

                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    color: #0f172a;
                    background: white;
                }

                .ticket {
                    border: 2px solid #1d4ed8;
                    border-radius: 18px;
                    padding: 24px;
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }

                .ticket-header {
                    background: #1d4ed8;
                    color: white;
                    padding: 18px;
                    border-radius: 14px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 22px;
                }

                .ticket-header h1 {
                    margin: 0 0 4px 0;
                }

                .ticket-header p {
                    margin: 0;
                }

                .ticket-row {
                    border-bottom: 1px solid #e2e8f0;
                    padding: 12px 0;
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                }

                .ticket-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-top: 18px;
                }

                .ticket-grid div {
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 14px;
                }

                span {
                    display: block;
                    color: #64748b;
                    font-size: 13px;
                    margin-bottom: 6px;
                }

                strong {
                    font-size: 16px;
                }
            </style>
        </head>
        <body>
            ${ticketHtml}
        </body>
        </html>
    `;
}

function getTicketDetails(ticket) {
    const scheduleId = getTrainScheduleId(ticket);
    const schedule = loadedSchedules.find(item => getScheduleId(item) === scheduleId);
    const seatNumber = getSeatNumber(ticket);
    const status = getTicketStatus(ticket);

    if (!schedule) {
        return {
            scheduleId: scheduleId,
            route: "Cursa " + scheduleId,
            departureTime: "-",
            arrivalTime: "-",
            seatNumber: seatNumber,
            price: "-",
            status: status,
            statusText: getStatusText(status)
        };
    }

    return {
        scheduleId: scheduleId,
        route: getStationName(getScheduleDeparture(schedule)) + " → " + getStationName(getScheduleArrival(schedule)),
        departureTime: formatDate(getScheduleDepartureTime(schedule)),
        arrivalTime: formatDate(getScheduleArrivalTime(schedule)),
        seatNumber: seatNumber,
        price: getSchedulePrice(schedule) + " lei",
        status: status,
        statusText: getStatusText(status)
    };
}

function getTotalPrice(tickets) {
    if (!tickets || tickets.length === 0) {
        return "-";
    }

    const firstTicket = tickets[0];
    const scheduleId = getTrainScheduleId(firstTicket);
    const schedule = loadedSchedules.find(item => getScheduleId(item) === scheduleId);

    if (!schedule) {
        return "-";
    }

    return Number(getSchedulePrice(schedule)) * tickets.length + " lei";
}

function showEmptyRow(tableId, message, columns) {
    const table = document.getElementById(tableId);

    table.innerHTML = `
        <tr>
            <td colspan="${columns}" class="empty-message">${message}</td>
        </tr>
    `;
}

function getSchedulesArray(data) {
    if (!data) {
        return [];
    }

    return data.listTrainSchedule || data.ListTrainSchedule || data || [];
}

function getTicketsArray(data) {
    if (!data) {
        return [];
    }

    return data.ticketList || data.TicketList || data || [];
}

function getValue(object, key) {
    if (!object) {
        return null;
    }

    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);

    return object[key] ?? object[pascalKey];
}

function getScheduleId(schedule) {
    return getValue(schedule, "id");
}

function getScheduleDeparture(schedule) {
    return getValue(schedule, "departureStationId");
}

function getScheduleArrival(schedule) {
    return getValue(schedule, "arrivalStationId");
}

function getScheduleDepartureTime(schedule) {
    return getValue(schedule, "departureTime");
}

function getScheduleArrivalTime(schedule) {
    return getValue(schedule, "arrivalTime");
}

function getSchedulePrice(schedule) {
    return getValue(schedule, "price");
}

function getTicketId(ticket) {
    return getValue(ticket, "id");
}

function getCustomerId(ticket) {
    return getValue(ticket, "customerId");
}

function getTrainScheduleId(ticket) {
    return getValue(ticket, "trainScheduleId");
}

function getSeatNumber(ticket) {
    return getValue(ticket, "seatNumber");
}

function getTicketStatus(ticket) {
    return getValue(ticket, "status");
}

function getStationName(id) {
    return stationNames[id] || "Stația " + id;
}

function getTripBadge(type) {
    if (type === "Dus") {
        return `<span class="badge badge-blue">Dus</span>`;
    }

    if (type === "Întors") {
        return `<span class="badge badge-green">Întors</span>`;
    }

    return `<span class="badge badge-blue">Cursă</span>`;
}

function getStatusLabel(status) {
    if (status === "Cancelled") {
        return `<span class="badge badge-red">Anulat</span>`;
    }

    return `<span class="badge badge-green">Activ</span>`;
}

function getStatusText(status) {
    if (status === "Cancelled") {
        return "Anulat";
    }

    return "Activ";
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    return new Date(dateValue).toLocaleString("ro-RO");
}