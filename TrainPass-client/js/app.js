let stations = [];
let trains = [];
let allSchedules = [];
let schedules = [];
let myTickets = [];
let allTickets = [];
let customers = [];
let schedulesPage = 1;
const schedulesPerPage = 10;

document.addEventListener("DOMContentLoaded", startApp);

async function startApp() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    showUserData();
    showPageByRole();
    setEvents();

    await loadStations();
    await loadTrains();
    await loadSchedules();

    if (isCustomer()) {
        await loadMyTickets();
    }

    if (isAdmin()) {
        await loadAllTickets();
        await loadCustomers();
    }

    updateDashboard();
}

function showUserData() {
    setText("user-email", getEmail());
    setText("user-role", getRole());
}

function showPageByRole() {
    document.querySelectorAll(".admin-only").forEach(function (section) {
        section.style.display = isAdmin() ? "" : "none";
    });

    document.querySelectorAll(".customer-only").forEach(function (section) {
        section.style.display = isCustomer() ? "" : "none";
    });
}

function setEvents() {
    click("btn-logout", logout);
    click("btn-search", searchSchedules);
    click("btn-clear-search", resetSearch);
    click("btn-buy-ticket", buyTicket);
    click("btn-create-train", createTrain);
    click("btn-create-station", createStation);
    click("btn-create-schedule", createSchedule);
    click("btn-prev-schedules", previousSchedulesPage);
    click("btn-next-schedules", nextSchedulesPage);
}

async function loadStations() {
    try {
        const data = await apiGet("/admin/stations/getStations");
        stations = getList(data, "stationList");
    } catch {
        stations = [];
    }

    fillStationSelect("search-departure");
    fillStationSelect("search-arrival");
    fillStationSelect("schedule-departure");
    fillStationSelect("schedule-arrival");
    renderStations();
    updateDashboard();
}

async function loadTrains() {
    try {
        const data = await apiGet("/trains/get");
        trains = getList(data, "trainList");
    } catch {
        trains = [];
    }

    fillTrainSelect();
    renderTrains();
    updateDashboard();
}

async function loadSchedules() {
    try {
        const data = await apiGet("/train-schedules/get");
        allSchedules = getList(data, "listTrainSchedule");
        schedules = allSchedules;
        schedulesPage = 1;
        setMessage("search-message", "", false);
    } catch (error) {
        allSchedules = [];
        schedules = [];
        schedulesPage = 1;
        setMessage("search-message", error.message, true);
    }

    renderSchedules();
    renderAdminSchedules();
    updateDashboard();
}

async function loadMyTickets() {
    try {
        const data = await apiGet("/tickets/my-tickets");
        myTickets = getList(data, "ticketList");
    } catch {
        myTickets = [];
    }

    renderMyTickets();
}

async function loadAllTickets() {
    try {
        const data = await apiGet("/tickets/allTickets");
        allTickets = getList(data, "ticketList");
    } catch {
        allTickets = [];
    }

    renderAllTickets();
    updateDashboard();
}

async function loadCustomers() {
    try {
        const data = await apiGet("/customers/allCustomers");
        customers = getList(data, "customerList");
    } catch {
        customers = [];
    }

    renderCustomers();
    updateDashboard();
}

function searchSchedules() {
    const departureId = inputValue("search-departure");
    const arrivalId = inputValue("search-arrival");
    const date = inputValue("search-date");

    if (!departureId && !arrivalId && !date) {
        setMessage("search-message", "Alege cel puțin un filtru.", true);
        return;
    }

    if (departureId && arrivalId && departureId === arrivalId) {
        setMessage("search-message", "Stația de plecare trebuie să fie diferită de stația de sosire.", true);
        return;
    }

    schedules = allSchedules.filter(function (schedule) {
        const scheduleDepartureId = String(value(schedule, "departureStationId"));
        const scheduleArrivalId = String(value(schedule, "arrivalStationId"));
        const scheduleDepartureTime = value(schedule, "departureTime");

        const matchDeparture = !departureId || scheduleDepartureId === departureId;
        const matchArrival = !arrivalId || scheduleArrivalId === arrivalId;
        const matchDate = !date || isSameDate(scheduleDepartureTime, date);

        return matchDeparture && matchArrival && matchDate;
    });

    schedulesPage = 1;
    renderSchedules();

    if (schedules.length === 0) {
        setMessage("search-message", "Nu există curse pentru filtrele alese.", true);
    } else {
        setMessage("search-message", "Curse găsite: " + schedules.length, false);
    }
}

function resetSearch() {
    setInput("search-departure", "");
    setInput("search-arrival", "");
    setInput("search-date", "");

    schedules = allSchedules;
    schedulesPage = 1;

    renderSchedules();
    setMessage("search-message", "", false);
}

async function buyTicket() {
    const scheduleId = inputValue("ticket-schedule-id");
    const seatNumber = inputValue("ticket-seat");

    if (!scheduleId || !seatNumber) {
        setMessage("ticket-message", "Completează ID-ul cursei și numărul locului.", true);
        return;
    }

    const body = {
        trainScheduleId: Number(scheduleId),
        seatNumber: Number(seatNumber),
        purchaseDate: new Date().toISOString(),
        status: "Active"
    };

    try {
        await apiPost("/tickets/buyTicket", body);

        setMessage("ticket-message", "Biletul a fost cumpărat. Îl găsești în tabelul Biletele mele.", false);
        clearInputs(["ticket-schedule-id", "ticket-seat"]);
        await loadMyTickets();
    } catch (error) {
        setMessage("ticket-message", error.message, true);
    }
}

async function cancelTicket(ticketId) {
    const answer = confirm("Vrei să anulezi acest bilet?");

    if (!answer) {
        return;
    }

    try {
        await apiPut("/tickets/cancelTicket/" + ticketId, null);
        await loadMyTickets();
    } catch (error) {
        alert(error.message);
    }
}

async function createTrain() {
    const name = inputValue("train-name");
    const trainNumber = inputValue("train-number");
    const totalSeats = inputValue("train-seats");

    if (!name || !trainNumber || !totalSeats) {
        setMessage("train-message", "Completează toate câmpurile.", true);
        return;
    }

    const body = {
        name: name,
        trainNumber: trainNumber,
        totalSeats: Number(totalSeats)
    };

    try {
        await apiPost("/trains/create", body);

        setMessage("train-message", "Trenul a fost adăugat.", false);
        clearInputs(["train-name", "train-number", "train-seats"]);
        await loadTrains();
    } catch (error) {
        setMessage("train-message", error.message, true);
    }
}

async function createStation() {
    const name = inputValue("station-name");
    const city = inputValue("station-city");

    if (!name || !city) {
        setMessage("station-message", "Completează toate câmpurile.", true);
        return;
    }

    const body = {
        name: name,
        city: city
    };

    try {
        await apiPost("/admin/stations/createStation", body);

        setMessage("station-message", "Stația a fost adăugată.", false);
        clearInputs(["station-name", "station-city"]);
        await loadStations();
    } catch (error) {
        setMessage("station-message", error.message, true);
    }
}

async function createSchedule() {
    const trainId = inputValue("schedule-train");
    const departureStationId = inputValue("schedule-departure");
    const arrivalStationId = inputValue("schedule-arrival");
    const departureTime = inputValue("schedule-departure-time");
    const arrivalTime = inputValue("schedule-arrival-time");
    const price = inputValue("schedule-price");

    if (!trainId || !departureStationId || !arrivalStationId || !departureTime || !arrivalTime || !price) {
        setMessage("schedule-message", "Completează toate câmpurile.", true);
        return;
    }

    if (departureStationId === arrivalStationId) {
        setMessage("schedule-message", "Stația de plecare trebuie să fie diferită de stația de sosire.", true);
        return;
    }

    const body = {
        trainId: Number(trainId),
        departureStationId: Number(departureStationId),
        arrivalStationId: Number(arrivalStationId),
        departureTime: departureTime,
        arrivalTime: arrivalTime,
        price: Number(price)
    };

    try {
        await apiPost("/train-schedules/create", body);

        setMessage("schedule-message", "Cursa a fost adăugată.", false);
        clearInputs(["schedule-departure-time", "schedule-arrival-time", "schedule-price"]);
        await loadSchedules();
    } catch (error) {
        setMessage("schedule-message", error.message, true);
    }
}

async function deleteSchedule(scheduleId) {
    const answer = confirm("Vrei să ștergi această cursă?");

    if (!answer) {
        return;
    }

    try {
        await apiDelete("/train-schedules/delete/" + scheduleId);
        await loadSchedules();
    } catch (error) {
        alert(error.message);
    }
}

function renderSchedules() {
    const table = document.getElementById("schedules-table");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    if (schedules.length === 0) {
        emptyRow(table, 6, "Nu există curse de afișat.");
        updateSchedulesPagination();
        return;
    }

    const start = (schedulesPage - 1) * schedulesPerPage;
    const end = start + schedulesPerPage;
    const pageSchedules = schedules.slice(start, end);

    pageSchedules.forEach(function (schedule) {
        const id = value(schedule, "id");
        const departureId = value(schedule, "departureStationId");
        const arrivalId = value(schedule, "arrivalStationId");
        const departureTime = value(schedule, "departureTime");
        const arrivalTime = value(schedule, "arrivalTime");
        const price = value(schedule, "price");

        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + id + "</td>" +
            "<td>" + stationName(departureId) + " - " + stationName(arrivalId) + "</td>" +
            "<td>" + formatDate(departureTime) + "</td>" +
            "<td>" + formatDate(arrivalTime) + "</td>" +
            "<td>" + formatPrice(price) + "</td>" +
            "<td>" + scheduleActionButton(id) + "</td>";

        table.appendChild(row);
    });

    updateSchedulesPagination();
}

function previousSchedulesPage() {
    if (schedulesPage > 1) {
        schedulesPage--;
        renderSchedules();
    }
}

function nextSchedulesPage() {
    const totalPages = Math.ceil(schedules.length / schedulesPerPage);

    if (schedulesPage < totalPages) {
        schedulesPage++;
        renderSchedules();
    }
}

function updateSchedulesPagination() {
    const pageInfo = document.getElementById("schedules-page-info");
    const prevButton = document.getElementById("btn-prev-schedules");
    const nextButton = document.getElementById("btn-next-schedules");

    if (!pageInfo || !prevButton || !nextButton) {
        return;
    }

    const totalPages = Math.ceil(schedules.length / schedulesPerPage) || 1;

    pageInfo.innerText = "Pagina " + schedulesPage + " din " + totalPages;

    prevButton.disabled = schedulesPage === 1;
    nextButton.disabled = schedulesPage === totalPages;
}

function renderAdminSchedules() {
    const table = document.getElementById("admin-schedules-table");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    if (allSchedules.length === 0) {
        emptyRow(table, 7, "Nu există curse de afișat.");
        return;
    }

    allSchedules.forEach(function (schedule) {
        const id = value(schedule, "id");
        const trainId = value(schedule, "trainId");
        const departureId = value(schedule, "departureStationId");
        const arrivalId = value(schedule, "arrivalStationId");
        const departureTime = value(schedule, "departureTime");
        const arrivalTime = value(schedule, "arrivalTime");
        const price = value(schedule, "price");

        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + id + "</td>" +
            "<td>" + trainName(trainId) + "</td>" +
            "<td>" + stationName(departureId) + " - " + stationName(arrivalId) + "</td>" +
            "<td>" + formatDate(departureTime) + "</td>" +
            "<td>" + formatDate(arrivalTime) + "</td>" +
            "<td>" + formatPrice(price) + "</td>" +
            "<td><button class='btn-small btn-danger' onclick='deleteSchedule(" + id + ")'>Șterge</button></td>";

        table.appendChild(row);
    });
}

function renderTrains() {
    const table = document.getElementById("trains-table");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    if (trains.length === 0) {
        emptyRow(table, 4, "Nu există trenuri.");
        return;
    }

    trains.forEach(function (train) {
        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + value(train, "id") + "</td>" +
            "<td>" + value(train, "name") + "</td>" +
            "<td>" + value(train, "trainNumber") + "</td>" +
            "<td>" + value(train, "totalSeats") + "</td>";

        table.appendChild(row);
    });
}

function renderStations() {
    const table = document.getElementById("stations-table");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    if (stations.length === 0) {
        emptyRow(table, 3, "Nu există stații.");
        return;
    }

    stations.forEach(function (station) {
        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + value(station, "id") + "</td>" +
            "<td>" + value(station, "name") + "</td>" +
            "<td>" + value(station, "city") + "</td>";

        table.appendChild(row);
    });
}

function renderMyTickets() {
    const table = document.getElementById("my-tickets-table");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    if (myTickets.length === 0) {
        emptyRow(table, 6, "Nu ai bilete cumpărate.");
        return;
    }

    myTickets.forEach(function (ticket) {
        const id = value(ticket, "id");
        const scheduleId = value(ticket, "trainScheduleId");
        const seatNumber = value(ticket, "seatNumber");
        const purchaseDate = value(ticket, "purchaseDate");
        const status = statusText(value(ticket, "status"));

        let actions =
            "<div class='table-actions'>" +
            "<button class='btn-small btn-light' onclick='printTicketById(" + id + ")'>Print</button>" +
            "<button class='btn-small btn-light' onclick='downloadTicketById(" + id + ")'>Download</button>";

        if (status === "Activ") {
            actions += "<button class='btn-small btn-danger' onclick='cancelTicket(" + id + ")'>Anulează</button>";
        }

        actions += "</div>";

        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + id + "</td>" +
            "<td>" + scheduleRoute(scheduleId) + "</td>" +
            "<td>" + seatNumber + "</td>" +
            "<td>" + formatDate(purchaseDate) + "</td>" +
            "<td>" + statusBadge(status) + "</td>" +
            "<td>" + actions + "</td>";

        table.appendChild(row);
    });
}

function renderAllTickets() {
    const table = document.getElementById("all-tickets-table");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    if (allTickets.length === 0) {
        emptyRow(table, 6, "Nu există bilete.");
        return;
    }

    allTickets.forEach(function (ticket) {
        const status = statusText(value(ticket, "status"));
        const customer = value(ticket, "customerEmail") || value(ticket, "customerId") || "-";
        const scheduleId = value(ticket, "trainScheduleId");

        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + value(ticket, "id") + "</td>" +
            "<td>" + customer + "</td>" +
            "<td>" + scheduleRoute(scheduleId) + "</td>" +
            "<td>" + value(ticket, "seatNumber") + "</td>" +
            "<td>" + formatDate(value(ticket, "purchaseDate")) + "</td>" +
            "<td>" + statusBadge(status) + "</td>";

        table.appendChild(row);
    });
}

function renderCustomers() {
    const table = document.getElementById("customers-table");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    if (customers.length === 0) {
        emptyRow(table, 3, "Nu există clienți.");
        return;
    }

    customers.forEach(function (customer) {
        const firstName = value(customer, "firstName");
        const lastName = value(customer, "lastName");

        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + value(customer, "id") + "</td>" +
            "<td>" + firstName + " " + lastName + "</td>" +
            "<td>" + value(customer, "email") + "</td>";

        table.appendChild(row);
    });
}

function scheduleActionButton(id) {
    return "<button class='btn-small' onclick='selectSchedule(" + id + ")'>Alege</button>";
}

function selectSchedule(scheduleId) {
    setInput("ticket-schedule-id", scheduleId);

    const seatInput = document.getElementById("ticket-seat");

    if (seatInput) {
        seatInput.focus();
    }
}

function printTicketById(ticketId) {
    const ticket = findMyTicket(ticketId);

    if (!ticket) {
        alert("Biletul nu a fost găsit.");
        return;
    }

    printTicketData(makeTicketData(ticket));
}

function downloadTicketById(ticketId) {
    const ticket = findMyTicket(ticketId);

    if (!ticket) {
        alert("Biletul nu a fost găsit.");
        return;
    }

    downloadTicketData(makeTicketData(ticket));
}

function printTicketData(ticket) {
    const page = window.open("", "_blank");

    if (!page) {
        alert("Browserul a blocat fereastra de print.");
        return;
    }

    page.document.open();
    page.document.write(ticketHtml(ticket));
    page.document.close();

    page.onload = function () {
        page.focus();
        page.print();
    };
}

function downloadTicketData(ticket) {
    const content = ticketHtml(ticket);
    const file = new Blob([content], { type: "text/html" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(file);
    link.download = "bilet-" + ticket.id + ".html";
    link.click();

    URL.revokeObjectURL(link.href);
}

function makeTicketData(ticket) {
    return {
        id: value(ticket, "id"),
        trainScheduleId: value(ticket, "trainScheduleId"),
        seatNumber: value(ticket, "seatNumber"),
        purchaseDate: value(ticket, "purchaseDate"),
        status: statusText(value(ticket, "status"))
    };
}

function ticketHtml(ticket) {
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

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: white;
            color: #111827;
        }

        .ticket {
            width: 100%;
            max-width: 720px;
            border: 1px solid #dbeafe;
            border-radius: 18px;
            padding: 28px;
        }

        .top {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 18px;
            margin-bottom: 18px;
        }

        h1 {
            margin: 0;
            color: #2563eb;
            font-size: 30px;
        }

        h2 {
            margin: 8px 0 0;
            font-size: 20px;
        }

        .row {
            display: grid;
            grid-template-columns: 170px 1fr;
            gap: 10px;
            margin-bottom: 12px;
            font-size: 16px;
        }

        .label {
            color: #64748b;
            font-weight: 700;
        }

        .badge {
            display: inline-block;
            border-radius: 999px;
            padding: 7px 12px;
            background: #dcfce7;
            color: #166534;
            font-weight: 700;
        }

        .footer {
            margin-top: 24px;
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="top">
            <div>
                <h1>TrainPass</h1>
                <h2>Bilet de tren</h2>
            </div>
            <div>
                <span class="badge">${ticket.status}</span>
            </div>
        </div>

        <div class="row">
            <div class="label">Cod bilet</div>
            <div>${ticket.id}</div>
        </div>

        <div class="row">
            <div class="label">Cursă</div>
            <div>${scheduleRoute(ticket.trainScheduleId)}</div>
        </div>

        <div class="row">
            <div class="label">Loc</div>
            <div>${ticket.seatNumber}</div>
        </div>

        <div class="row">
            <div class="label">Data cumpărării</div>
            <div>${formatDate(ticket.purchaseDate)}</div>
        </div>

        <div class="row">
            <div class="label">Status</div>
            <div>${ticket.status}</div>
        </div>

        <p class="footer">Bilet generat de aplicația TrainPass.</p>
    </div>
</body>
</html>`;
}

function findMyTicket(ticketId) {
    return myTickets.find(function (ticket) {
        return Number(value(ticket, "id")) === Number(ticketId);
    });
}

function fillStationSelect(id) {
    const select = document.getElementById(id);

    if (!select) {
        return;
    }

    select.innerHTML = "<option value=''>Alege stația</option>";

    stations.forEach(function (station) {
        const option = document.createElement("option");

        option.value = value(station, "id");
        option.innerText = stationLabel(option.value);

        select.appendChild(option);
    });
}

function fillTrainSelect() {
    const select = document.getElementById("schedule-train");

    if (!select) {
        return;
    }

    select.innerHTML = "<option value=''>Alege trenul</option>";

    trains.forEach(function (train) {
        const option = document.createElement("option");

        option.value = value(train, "id");
        option.innerText = trainName(option.value);

        select.appendChild(option);
    });
}

function updateDashboard() {
    setText("total-schedules", allSchedules.length);
    setText("total-tickets", allTickets.length);
    setText("total-trains", trains.length);
    setText("total-stations", stations.length);
    setText("total-customers", customers.length);

    const active = allTickets.filter(function (ticket) {
        return statusText(value(ticket, "status")) === "Activ";
    }).length;

    const cancelled = allTickets.filter(function (ticket) {
        return statusText(value(ticket, "status")) === "Anulat";
    }).length;

    setText("active-tickets", active);
    setText("cancelled-tickets", cancelled);
}

function stationName(id) {
    const station = stations.find(function (item) {
        return Number(value(item, "id")) === Number(id);
    });

    if (!station) {
        return "Stația " + id;
    }

    return value(station, "name");
}

function stationLabel(id) {
    const station = stations.find(function (item) {
        return Number(value(item, "id")) === Number(id);
    });

    if (!station) {
        return "Stația " + id;
    }

    const name = value(station, "name");
    const city = value(station, "city");

    if (city && city !== name) {
        return name + " - " + city;
    }

    return name;
}

function trainName(id) {
    const train = trains.find(function (item) {
        return Number(value(item, "id")) === Number(id);
    });

    if (!train) {
        return "Tren " + id;
    }

    const name = value(train, "name");
    const number = value(train, "trainNumber");

    if (number) {
        return name + " (" + number + ")";
    }

    return name;
}

function scheduleRoute(scheduleId) {
    const schedule = allSchedules.find(function (item) {
        return Number(value(item, "id")) === Number(scheduleId);
    });

    if (!schedule) {
        return "Cursa " + scheduleId;
    }

    const departureId = value(schedule, "departureStationId");
    const arrivalId = value(schedule, "arrivalStationId");

    return stationName(departureId) + " - " + stationName(arrivalId);
}

function statusText(status) {
    const text = String(status || "").toLowerCase();

    if (text.includes("cancel") || text.includes("anulat")) {
        return "Anulat";
    }

    if (text.includes("active") || text.includes("activ")) {
        return "Activ";
    }

    return status || "-";
}

function statusBadge(status) {
    if (status === "Activ") {
        return "<span class='badge badge-green'>Activ</span>";
    }

    if (status === "Anulat") {
        return "<span class='badge badge-red'>Anulat</span>";
    }

    return "<span class='badge badge-blue'>" + status + "</span>";
}

function getList(data, propertyName) {
    if (!data) {
        return [];
    }

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data[propertyName])) {
        return data[propertyName];
    }

    for (const key in data) {
        if (Array.isArray(data[key])) {
            return data[key];
        }
    }

    return [];
}

function value(object, key) {
    if (!object) {
        return "";
    }

    if (object[key] !== undefined && object[key] !== null) {
        return object[key];
    }

    const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);

    if (object[pascalKey] !== undefined && object[pascalKey] !== null) {
        return object[pascalKey];
    }

    return "";
}

function inputValue(id) {
    const element = document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();
}

function setInput(id, valueToSet) {
    const element = document.getElementById(id);

    if (element) {
        element.value = valueToSet;
    }
}

function setText(id, valueToSet) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    if (valueToSet === undefined || valueToSet === null) {
        element.innerText = "";
    } else {
        element.innerText = valueToSet;
    }
}

function setMessage(id, text, isError) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.innerText = text || "";
    element.className = isError ? "message error" : "message success";
}

function click(id, action) {
    const element = document.getElementById(id);

    if (element) {
        element.addEventListener("click", action);
    }
}

function clearInputs(ids) {
    ids.forEach(function (id) {
        setInput(id, "");
    });
}

function emptyRow(table, columns, text) {
    const row = document.createElement("tr");

    row.innerHTML = "<td colspan='" + columns + "' class='empty-row'>" + text + "</td>";
    table.appendChild(row);
}

function formatDate(valueToFormat) {
    if (!valueToFormat) {
        return "-";
    }

    const date = new Date(valueToFormat);

    if (isNaN(date.getTime())) {
        return valueToFormat;
    }

    return date.toLocaleString("ro-RO", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function isSameDate(scheduleDate, selectedDate) {
    if (!scheduleDate || !selectedDate) {
        return false;
    }

    const date = new Date(scheduleDate);

    if (isNaN(date.getTime())) {
        return false;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day === selectedDate;
}

function formatPrice(price) {
    if (price === undefined || price === null || price === "") {
        return "-";
    }

    return price + " lei";
}

function isAdmin() {
    return String(getRole()).toLowerCase() === "admin";
}

function isCustomer() {
    return String(getRole()).toLowerCase() === "customer";
}

function logout() {
    removeAuthData();
    window.location.href = "login.html";
}