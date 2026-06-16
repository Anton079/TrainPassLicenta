let stations = [];
let trains = [];
let allSchedules = [];
let schedules = [];
let myTickets = [];
let allTickets = [];
let customers = [];
let schedulesPage = 1;
let selectedScheduleId = null;
let selectedSeats = [];
let seatsInfo = null;
let editingScheduleId = null;
let currentWagon = 1;

const schedulesPerPage = 10;
const seatsPerWagon = 40;

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
    setText("user-info", getEmail());
    setText("role-badge", getRole());
}

function showPageByRole() {
    document.querySelectorAll(".admin-section").forEach(function (section) {
        section.style.display = isAdmin() ? "" : "none";
    });

    document.querySelectorAll(".customer-section").forEach(function (section) {
        section.style.display = isCustomer() ? "" : "none";
    });
}

function setEvents() {
    click("btn-logout", logout);
    click("btn-search", searchSchedules);
    click("btn-clear-search", resetSearch);
    click("btn-buy-ticket", buyTickets);
    click("btn-create-train", createTrain);
    click("btn-create-station", createStation);
    click("btn-save-schedule", saveSchedule);
    click("btn-cancel-schedule-edit", cancelScheduleEdit);
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
    } catch (error) {
        allSchedules = [];
        schedules = [];
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
        const matchDeparture = !departureId || String(value(schedule, "departureStationId")) === departureId;
        const matchArrival = !arrivalId || String(value(schedule, "arrivalStationId")) === arrivalId;
        const matchDate = !date || isSameDate(value(schedule, "departureTime"), date);

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

async function selectSchedule(scheduleId) {
    selectedScheduleId = Number(scheduleId);
    selectedSeats = [];
    seatsInfo = null;
    currentWagon = 1;

    setInput("ticket-schedule-id", selectedScheduleId);

    const schedule = findSchedule(selectedScheduleId);

    if (schedule) {
        const text = scheduleRoute(selectedScheduleId) + " | Plecare: " + formatDate(value(schedule, "departureTime"));
        setText("selected-schedule-box", text);
    }

    renderTrainSeatMap();
    await loadSeatsForSelectedSchedule();
}

async function loadSeatsForSelectedSchedule() {
    if (!selectedScheduleId) {
        renderTrainSeatMap();
        return;
    }

    try {
        seatsInfo = await apiGet("/tickets/available-seats/" + selectedScheduleId + "?numberOfSeats=1");
        renderTrainSeatMap();
        setMessage("ticket-message", "Selectează locurile dorite.", false);
    } catch (error) {
        seatsInfo = null;
        renderTrainSeatMap();
        setMessage("ticket-message", error.message, true);
    }
}

function renderTrainSeatMap() {
    const container = document.getElementById("train-seat-map");

    if (!container) {
        return;
    }

    container.innerHTML = "";
    setText("selected-seats", selectedSeats.length ? selectedSeats.join(", ") : "-");

    if (!selectedScheduleId) {
        container.innerHTML = "<p class='empty-seat-message'>Alege o cursă.</p>";
        renderWagonTabs(0);
        setText("wagon-info", "");
        return;
    }

    if (!seatsInfo) {
        container.innerHTML = "<p class='empty-seat-message'>Se încarcă locurile...</p>";
        renderWagonTabs(0);
        setText("wagon-info", "");
        return;
    }

    const totalSeats = Number(value(seatsInfo, "totalSeats"));
    const occupiedSeats = getArray(seatsInfo, "occupiedSeats").map(Number);
    const availableSeats = getArray(seatsInfo, "availableSeats").map(Number);
    const totalWagons = Math.ceil(totalSeats / seatsPerWagon);

    if (currentWagon > totalWagons) {
        currentWagon = 1;
    }

    renderWagonTabs(totalWagons);

    const firstSeatInWagon = (currentWagon - 1) * seatsPerWagon + 1;
    const lastSeatInWagon = Math.min(firstSeatInWagon + seatsPerWagon - 1, totalSeats);
    const rows = Math.ceil((lastSeatInWagon - firstSeatInWagon + 1) / 4);

    setText("wagon-info", "Locurile " + firstSeatInWagon + " - " + lastSeatInWagon);

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        const row = document.createElement("div");
        row.className = "train-seat-row";

        const firstSeat = firstSeatInWagon + rowIndex * 4;

        row.appendChild(createSeatButton(firstSeat, totalSeats, occupiedSeats, availableSeats, lastSeatInWagon));
        row.appendChild(createSeatButton(firstSeat + 1, totalSeats, occupiedSeats, availableSeats, lastSeatInWagon));

        const aisle = document.createElement("div");
        aisle.className = "train-aisle";
        row.appendChild(aisle);

        row.appendChild(createSeatButton(firstSeat + 2, totalSeats, occupiedSeats, availableSeats, lastSeatInWagon));
        row.appendChild(createSeatButton(firstSeat + 3, totalSeats, occupiedSeats, availableSeats, lastSeatInWagon));

        container.appendChild(row);
    }
}

function renderWagonTabs(totalWagons) {
    const container = document.getElementById("wagon-tabs");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!totalWagons) {
        return;
    }

    for (let wagon = 1; wagon <= totalWagons; wagon++) {
        const button = document.createElement("button");
        button.type = "button";
        button.innerText = "Vagon " + wagon;
        button.className = wagon === currentWagon ? "wagon-tab active" : "wagon-tab";

        button.addEventListener("click", function () {
            currentWagon = wagon;
            renderTrainSeatMap();
        });

        container.appendChild(button);
    }
}

function createSeatButton(seatNumber, totalSeats, occupiedSeats, availableSeats, lastSeatInWagon) {
    const button = document.createElement("button");

    button.type = "button";
    button.innerText = seatNumber;
    button.className = "train-seat";

    if (seatNumber > totalSeats || seatNumber > lastSeatInWagon) {
        button.className += " invisible";
        button.disabled = true;
        return button;
    }

    if (occupiedSeats.includes(seatNumber) || !availableSeats.includes(seatNumber)) {
        button.className += " occupied";
        button.disabled = true;
        return button;
    }

    if (selectedSeats.includes(seatNumber)) {
        button.className += " selected";
    }

    button.addEventListener("click", function () {
        toggleSeat(seatNumber);
    });

    return button;
}

function toggleSeat(seatNumber) {
    if (selectedSeats.includes(seatNumber)) {
        selectedSeats = selectedSeats.filter(function (seat) {
            return seat !== seatNumber;
        });
    } else {
        selectedSeats.push(seatNumber);
        selectedSeats.sort(function (a, b) {
            return a - b;
        });
    }

    renderTrainSeatMap();
}

async function buyTickets() {
    if (!selectedScheduleId) {
        setMessage("ticket-message", "Alege o cursă.", true);
        return;
    }

    if (selectedSeats.length === 0) {
        setMessage("ticket-message", "Selectează cel puțin un loc.", true);
        return;
    }

    const body = {
        trainScheduleId: selectedScheduleId,
        seatNumbers: selectedSeats
    };

    try {
        await apiPost("/tickets/buyTickets", body);
        selectedSeats = [];
        await loadSeatsForSelectedSchedule();
        await loadMyTickets();
        setMessage("ticket-message", "Biletele au fost cumpărate.", false);
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

        if (selectedScheduleId) {
            await loadSeatsForSelectedSchedule();
        }
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

async function saveSchedule() {
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

    if (new Date(departureTime) >= new Date(arrivalTime)) {
        setMessage("schedule-message", "Ora sosirii trebuie să fie după ora plecării.", true);
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
        if (editingScheduleId) {
            await apiPut("/train-schedules/update/" + editingScheduleId, body);
            setMessage("schedule-message", "Cursa a fost actualizată.", false);
        } else {
            await apiPost("/train-schedules/create", body);
            setMessage("schedule-message", "Cursa a fost adăugată.", false);
        }

        cancelScheduleEdit();
        await loadSchedules();
    } catch (error) {
        setMessage("schedule-message", error.message, true);
    }
}

function editSchedule(scheduleId) {
    const schedule = findSchedule(scheduleId);

    if (!schedule) {
        alert("Cursa nu a fost găsită.");
        return;
    }

    editingScheduleId = Number(scheduleId);

    setInput("schedule-edit-id", editingScheduleId);
    setInput("schedule-train", value(schedule, "trainId"));
    setInput("schedule-departure", value(schedule, "departureStationId"));
    setInput("schedule-arrival", value(schedule, "arrivalStationId"));
    setInput("schedule-departure-time", toDatetimeLocal(value(schedule, "departureTime")));
    setInput("schedule-arrival-time", toDatetimeLocal(value(schedule, "arrivalTime")));
    setInput("schedule-price", value(schedule, "price"));

    setText("btn-save-schedule", "Salvează modificările");
    showElement("btn-cancel-schedule-edit");
    setMessage("schedule-message", "Editezi cursa cu ID-ul " + editingScheduleId + ".", false);

    const section = document.getElementById("schedule-form-section");

    if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function cancelScheduleEdit() {
    editingScheduleId = null;
    setInput("schedule-edit-id", "");
    setInput("schedule-train", "");
    setInput("schedule-departure", "");
    setInput("schedule-arrival", "");
    setInput("schedule-departure-time", "");
    setInput("schedule-arrival-time", "");
    setInput("schedule-price", "");
    setText("btn-save-schedule", "Adaugă cursă");
    hideElement("btn-cancel-schedule-edit");
}

async function deleteSchedule(scheduleId) {
    const answer = confirm("Vrei să ștergi această cursă?");

    if (!answer) {
        return;
    }

    try {
        await apiDelete("/train-schedules/delete/" + scheduleId);

        if (Number(editingScheduleId) === Number(scheduleId)) {
            cancelScheduleEdit();
        }

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
        emptyRow(table, 7, "Nu există curse de afișat.");
        updateSchedulesPagination();
        return;
    }

    const start = (schedulesPage - 1) * schedulesPerPage;
    const end = start + schedulesPerPage;
    const pageSchedules = schedules.slice(start, end);

    pageSchedules.forEach(function (schedule) {
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
            "<td><button class='btn-small' onclick='selectSchedule(" + id + ")'>Alege</button></td>";

        table.appendChild(row);
    });

    updateSchedulesPagination();
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
            "<td class='table-actions'>" +
            "<button class='btn-small' onclick='editSchedule(" + id + ")'>Editează</button>" +
            "<button class='btn-small btn-danger' onclick='deleteSchedule(" + id + ")'>Șterge</button>" +
            "</td>";

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

        let action = "-";

        if (status === "Activ") {
            action = "<button class='btn-small btn-danger' onclick='cancelTicket(" + id + ")'>Anulează</button>";
        }

        const row = document.createElement("tr");

        row.innerHTML =
            "<td>" + id + "</td>" +
            "<td>" + scheduleRoute(scheduleId) + "</td>" +
            "<td>" + seatNumber + "</td>" +
            "<td>" + formatDate(purchaseDate) + "</td>" +
            "<td>" + statusBadge(status) + "</td>" +
            "<td>" + action + "</td>";

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
        emptyRow(table, 5, "Nu există bilete.");
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

    const active = allTickets.filter(function (ticket) {
        return statusText(value(ticket, "status")) === "Activ";
    }).length;

    const cancelled = allTickets.filter(function (ticket) {
        return statusText(value(ticket, "status")) === "Anulat";
    }).length;

    setText("active-tickets", active);
    setText("cancelled-tickets", cancelled);
}

function findSchedule(scheduleId) {
    return allSchedules.find(function (schedule) {
        return Number(value(schedule, "id")) === Number(scheduleId);
    });
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
    const schedule = findSchedule(scheduleId);

    if (!schedule) {
        return "Cursa " + scheduleId;
    }

    return stationName(value(schedule, "departureStationId")) + " - " + stationName(value(schedule, "arrivalStationId"));
}

function statusText(status) {
    const text = String(status || "").toLowerCase();

    if (text === "0" || text.includes("active") || text.includes("activ")) {
        return "Activ";
    }

    if (text === "1" || text.includes("cancel") || text.includes("anulat")) {
        return "Anulat";
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

    const pascalName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);

    if (Array.isArray(data[pascalName])) {
        return data[pascalName];
    }

    for (const key in data) {
        if (Array.isArray(data[key])) {
            return data[key];
        }
    }

    return [];
}

function getArray(data, propertyName) {
    if (!data) {
        return [];
    }

    if (Array.isArray(data[propertyName])) {
        return data[propertyName];
    }

    const pascalName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);

    if (Array.isArray(data[pascalName])) {
        return data[pascalName];
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

    element.innerText = valueToSet === undefined || valueToSet === null ? "" : valueToSet;
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

function toDatetimeLocal(valueToFormat) {
    if (!valueToFormat) {
        return "";
    }

    const date = new Date(valueToFormat);

    if (isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return year + "-" + month + "-" + day + "T" + hour + ":" + minute;
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

function showElement(id) {
    const element = document.getElementById(id);

    if (element) {
        element.classList.remove("hidden");
    }
}

function hideElement(id) {
    const element = document.getElementById(id);

    if (element) {
        element.classList.add("hidden");
    }
}

function logout() {
    removeAuthData();
    window.location.href = "login.html";
}