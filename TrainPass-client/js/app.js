let stations = [];
let trains = [];
let allSchedules = [];
let schedules = [];
let myTickets = [];
let allTickets = [];
let customers = [];
let availableSeats = [];
let occupiedSeats = [];
let selectedSeats = [];
let modalSelectedSeats = [];
let selectedScheduleId = null;
let schedulesPage = 1;
let editingScheduleId = null;
let selectedTrainTotalSeats = 0;
let currentWagon = 1;

const schedulesPerPage = 10;
const maxWagons = 2;
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

  if (isCustomerRole()) {
    await loadMyTickets();
  }

  if (isAdminRole()) {
    await loadAllTickets();
    await loadCustomers();
  }

  updateDashboard();
}

function showUserData() {
  setText("user-info", getEmail() || "Utilizator");
  setText("role-badge", getRole() || "Rol");
}

function showPageByRole() {
  document.querySelectorAll(".admin-section").forEach(function (section) {
    section.style.display = isAdminRole() ? "" : "none";
  });

  document.querySelectorAll(".customer-section").forEach(function (section) {
    section.style.display = isCustomerRole() ? "" : "none";
  });
}

function setEvents() {
  click("btn-logout", logout);
  click("btn-search-schedules", searchSchedules);
  click("btn-clear-search", resetSearch);
  click("btn-buy-ticket", buyTickets);
  click("btn-create-train", createTrain);
  click("btn-create-station", createStation);
  click("btn-save-schedule", saveSchedule);
  click("btn-cancel-schedule-edit", cancelScheduleEdit);
  click("btn-prev-schedules", previousSchedulesPage);
  click("btn-next-schedules", nextSchedulesPage);
  click("btn-open-seat-modal", openSeatModal);
  click("btn-close-seat-modal", closeSeatModal);
  click("btn-confirm-seats", confirmSeatSelection);
  click("btn-prev-wagon", previousWagon);
  click("btn-next-wagon", nextWagon);

  const modal = document.getElementById("seat-modal");

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeSeatModal();
      }
    });
  }
}

async function loadStations() {
  try {
    const data = await apiGet("/admin/stations/getStations");
    stations = getList(data, ["stationList", "stations"]);
  } catch {
    stations = [];
  }

  fillStationSelect("search-departure");
  fillStationSelect("search-arrival");
  fillStationSelect("schedule-departure");
  fillStationSelect("schedule-arrival");
  renderStations();
}

async function loadTrains() {
  try {
    const data = await apiGet("/trains/get");
    trains = getList(data, ["trainList", "trains"]);
  } catch {
    trains = [];
  }

  fillTrainSelect();
  renderTrains();
}

async function loadSchedules() {
  try {
    const data = await apiGet("/train-schedules/get");
    allSchedules = getList(data, ["listTrainSchedule", "trainSchedules", "schedules"]);
    schedules = allSchedules.slice();
    schedulesPage = 1;
  } catch {
    allSchedules = [];
    schedules = [];
  }

  renderSchedules();
  renderAdminSchedules();
  updateDashboard();
}

async function loadMyTickets() {
  try {
    const data = await apiGet("/tickets/my-tickets");
    myTickets = getList(data, ["ticketList", "tickets"]);
  } catch {
    myTickets = [];
  }

  renderMyTickets();
}

async function loadAllTickets() {
  try {
    const data = await apiGet("/tickets/allTickets");
    allTickets = getList(data, ["ticketList", "tickets"]);
  } catch {
    allTickets = [];
  }

  renderAllTickets();
  updateDashboard();
}

async function loadCustomers() {
  try {
    const data = await apiGet("/customers/allCustomers");
    customers = getList(data, ["customerList", "customers"]);
  } catch {
    customers = [];
  }

  renderCustomers();
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
    const scheduleDepartureId = String(getValue(schedule, "departureStationId", "DepartureStationId"));
    const scheduleArrivalId = String(getValue(schedule, "arrivalStationId", "ArrivalStationId"));
    const scheduleDate = dateOnly(getValue(schedule, "departureTime", "DepartureTime"));

    if (departureId && scheduleDepartureId !== String(departureId)) {
      return false;
    }

    if (arrivalId && scheduleArrivalId !== String(arrivalId)) {
      return false;
    }

    if (date && scheduleDate !== date) {
      return false;
    }

    return true;
  });

  schedulesPage = 1;
  clearSelectedSchedule();
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
  schedules = allSchedules.slice();
  schedulesPage = 1;
  clearSelectedSchedule();
  renderSchedules();
  setMessage("search-message", "", false);
  setMessage("ticket-message", "", false);
}

async function selectSchedule(scheduleId) {
  selectedScheduleId = Number(scheduleId);
  selectedSeats = [];
  modalSelectedSeats = [];
  availableSeats = [];
  occupiedSeats = [];
  currentWagon = 1;

  const schedule = findSchedule(selectedScheduleId);

  if (!schedule) {
    clearSelectedSchedule();
    return;
  }

  selectedTrainTotalSeats = Math.min(getTrainTotalSeats(getValue(schedule, "trainId", "TrainId")), maxWagons * seatsPerWagon);

  setText("selected-schedule-box", scheduleRoute(schedule) + " | Plecare: " + formatDateTime(getValue(schedule, "departureTime", "DepartureTime")));

  await loadAvailableSeats();
  chooseRandomSeat();
  updateSelectedSeatsText();

  if (selectedSeats.length > 0) {
    currentWagon = wagonBySeat(selectedSeats[0]);
    setMessage("ticket-message", "Am ales automat locul " + selectedSeats[0] + ". Poți schimba locul din butonul Alege locurile.", false);
  }
}

function clearSelectedSchedule() {
  selectedScheduleId = null;
  selectedSeats = [];
  modalSelectedSeats = [];
  availableSeats = [];
  occupiedSeats = [];
  selectedTrainTotalSeats = 0;
  currentWagon = 1;
  setText("selected-schedule-box", "Nu ai selectat încă o cursă.");
  updateSelectedSeatsText();
  updateModalSelectedSeatsText();
  updateBuyButtons();
}

async function loadAvailableSeats() {
  if (!selectedScheduleId) {
    availableSeats = [];
    occupiedSeats = [];
    updateBuyButtons();
    return;
  }

  try {
    const data = await apiGet("/tickets/available-seats/" + selectedScheduleId + "?numberOfSeats=1");
    availableSeats = getList(getValue(data, "availableSeats", "AvailableSeats")).map(Number);
    occupiedSeats = getList(getValue(data, "occupiedSeats", "OccupiedSeats")).map(Number);

    const totalSeats = Number(getValue(data, "totalSeats", "TotalSeats"));

    if (totalSeats > 0) {
      selectedTrainTotalSeats = Math.min(totalSeats, maxWagons * seatsPerWagon);
    }

    availableSeats = availableSeats.filter(function (seat) {
      return seat >= 1 && seat <= selectedTrainTotalSeats;
    });

    occupiedSeats = occupiedSeats.filter(function (seat) {
      return seat >= 1 && seat <= selectedTrainTotalSeats;
    });

    if (availableSeats.length === 0) {
      selectedSeats = [];
      modalSelectedSeats = [];
      setMessage("ticket-message", "Nu mai există locuri disponibile pentru această cursă.", true);
    }
  } catch (error) {
    availableSeats = [];
    occupiedSeats = [];
    selectedSeats = [];
    modalSelectedSeats = [];
    setMessage("ticket-message", error.message, true);
  }

  updateBuyButtons();
}

function chooseRandomSeat() {
  if (availableSeats.length === 0) {
    selectedSeats = [];
    updateBuyButtons();
    return;
  }

  const index = Math.floor(Math.random() * availableSeats.length);
  selectedSeats = [availableSeats[index]];
  updateBuyButtons();
}

function openSeatModal() {
  if (!selectedScheduleId) {
    setMessage("ticket-message", "Alege mai întâi o cursă.", true);
    return;
  }

  if (availableSeats.length === 0) {
    setMessage("ticket-message", "Nu există locuri disponibile.", true);
    return;
  }

  modalSelectedSeats = selectedSeats.slice();

  if (modalSelectedSeats.length > 0) {
    currentWagon = wagonBySeat(modalSelectedSeats[0]);
  } else {
    currentWagon = 1;
  }

  renderSeatMap();
  updateModalSelectedSeatsText();
  showModal("seat-modal");
}

function closeSeatModal() {
  modalSelectedSeats = selectedSeats.slice();
  updateModalSelectedSeatsText();
  hideModal("seat-modal");
}

function previousWagon() {
  if (currentWagon > 1) {
    currentWagon--;
    renderSeatMap();
  }
}

function nextWagon() {
  if (currentWagon < getTotalWagons()) {
    currentWagon++;
    renderSeatMap();
  }
}

function renderSeatMap() {
  const map = document.getElementById("wagon-map");

  if (!map) {
    return;
  }

  const wagonStart = (currentWagon - 1) * seatsPerWagon + 1;
  const wagonEnd = currentWagon * seatsPerWagon;
  let html = '<div class="wagon"><h3>Vagonul ' + currentWagon + '</h3><div class="seat-grid">';

  for (let seat = wagonStart; seat <= wagonEnd; seat++) {
    const exists = seat <= selectedTrainTotalSeats;
    const occupied = occupiedSeats.includes(seat);
    const selected = modalSelectedSeats.includes(seat);
    let className = "seat";

    if (!exists || occupied) {
      className += " occupied";
    }

    if (selected) {
      className += " selected";
    }

    html += '<button type="button" class="' + className + '" ' + (!exists || occupied ? "disabled" : "") + ' data-seat="' + seat + '">' + seat + '</button>';
  }

  html += '</div></div>';
  map.innerHTML = html;

  document.querySelectorAll(".seat[data-seat]").forEach(function (button) {
    button.addEventListener("click", function () {
      toggleSeat(Number(button.dataset.seat));
    });
  });

  setText("wagon-page-info", "Vagonul " + currentWagon + " din " + getTotalWagons());

  const prevButton = document.getElementById("btn-prev-wagon");
  const nextButton = document.getElementById("btn-next-wagon");

  if (prevButton) {
    prevButton.disabled = currentWagon <= 1;
  }

  if (nextButton) {
    nextButton.disabled = currentWagon >= getTotalWagons();
  }
}

function toggleSeat(seat) {
  seat = Number(seat);

  if (!availableSeats.includes(seat)) {
    return;
  }

  if (modalSelectedSeats.includes(seat)) {
    modalSelectedSeats = modalSelectedSeats.filter(function (item) {
      return item !== seat;
    });
  } else {
    modalSelectedSeats.push(seat);
  }

  modalSelectedSeats.sort(function (a, b) {
    return a - b;
  });

  renderSeatMap();
  updateModalSelectedSeatsText();
}

function confirmSeatSelection() {
  if (modalSelectedSeats.length === 0) {
    setMessage("ticket-message", "Alege cel puțin un loc.", true);
    return;
  }

  selectedSeats = modalSelectedSeats.slice();
  selectedSeats.sort(function (a, b) {
    return a - b;
  });

  updateSelectedSeatsText();
  updateModalSelectedSeatsText();
  updateBuyButtons();
  hideModal("seat-modal");
  setMessage("ticket-message", "Locuri selectate: " + selectedSeats.join(", "), false);
}

function updateSelectedSeatsText() {
  const text = selectedSeats.length === 0 ? "-" : selectedSeats.join(", ");
  setText("selected-seats-text", text);
}

function updateModalSelectedSeatsText() {
  const text = modalSelectedSeats.length === 0 ? "-" : modalSelectedSeats.join(", ");
  setText("modal-selected-seats-text", text);
}

function updateBuyButtons() {
  const buyButton = document.getElementById("btn-buy-ticket");
  const seatButton = document.getElementById("btn-open-seat-modal");

  if (buyButton) {
    buyButton.disabled = !selectedScheduleId || selectedSeats.length === 0;
  }

  if (seatButton) {
    seatButton.disabled = !selectedScheduleId || availableSeats.length === 0;
  }
}

async function buyTickets() {
  if (!selectedScheduleId) {
    setMessage("ticket-message", "Alege mai întâi o cursă.", true);
    return;
  }

  if (selectedSeats.length === 0) {
    setMessage("ticket-message", "Alege cel puțin un loc.", true);
    return;
  }

  try {
    await apiPost("/tickets/buyTickets", {
      TrainScheduleId: selectedScheduleId,
      SeatNumbers: selectedSeats
    });

    const count = selectedSeats.length;
    selectedSeats = [];
    modalSelectedSeats = [];

    await loadAvailableSeats();
    chooseRandomSeat();
    updateSelectedSeatsText();
    updateModalSelectedSeatsText();
    await loadMyTickets();

    if (count === 1) {
      setMessage("ticket-message", "Bilet cumpărat cu succes.", false);
    } else {
      setMessage("ticket-message", "Bilete cumpărate cu succes: " + count + ".", false);
    }
  } catch (error) {
    setMessage("ticket-message", error.message, true);
  }
}

async function cancelTicket(ticketId) {
  if (!confirm("Sigur vrei să anulezi acest bilet?")) {
    return;
  }

  try {
    await apiPut("/tickets/cancelTicket/" + ticketId, null);
    await loadMyTickets();
    setMessage("ticket-message", "Bilet anulat.", false);
  } catch (error) {
    setMessage("ticket-message", error.message, true);
  }
}

async function createTrain() {
  const name = inputValue("train-name");
  const trainNumber = inputValue("train-number");
  const totalSeats = Number(inputValue("train-seats"));

  if (!name || !trainNumber || !totalSeats) {
    setMessage("train-message", "Completează toate câmpurile.", true);
    return;
  }

  if (totalSeats < 1 || totalSeats > 80) {
    setMessage("train-message", "Trenul poate avea între 1 și 80 de locuri.", true);
    return;
  }

  try {
    await apiPost("/trains/create", {
      Name: name,
      TrainNumber: trainNumber,
      TotalSeats: totalSeats
    });

    setInput("train-name", "");
    setInput("train-number", "");
    setInput("train-seats", "");
    setMessage("train-message", "Tren adăugat.", false);
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

  try {
    await apiPost("/admin/stations/createStation", {
      Name: name,
      City: city
    });

    setInput("station-name", "");
    setInput("station-city", "");
    setMessage("station-message", "Stație adăugată.", false);
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

  if (new Date(arrivalTime) <= new Date(departureTime)) {
    setMessage("schedule-message", "Ora sosirii trebuie să fie după ora plecării.", true);
    return;
  }

  const body = {
    TrainId: Number(trainId),
    DepartureStationId: Number(departureStationId),
    ArrivalStationId: Number(arrivalStationId),
    DepartureTime: departureTime,
    ArrivalTime: arrivalTime,
    Price: Number(price)
  };

  try {
    if (editingScheduleId) {
      await apiPut("/train-schedules/update/" + editingScheduleId, body);
      setMessage("schedule-message", "Cursă actualizată.", false);
    } else {
      await apiPost("/train-schedules/create", body);
      setMessage("schedule-message", "Cursă adăugată.", false);
    }

    clearScheduleForm();
    await loadSchedules();
  } catch (error) {
    setMessage("schedule-message", error.message, true);
  }
}

function editSchedule(scheduleId) {
  const schedule = findSchedule(scheduleId);

  if (!schedule) {
    return;
  }

  editingScheduleId = Number(scheduleId);

  setInput("schedule-train", getValue(schedule, "trainId", "TrainId"));
  setInput("schedule-departure", getValue(schedule, "departureStationId", "DepartureStationId"));
  setInput("schedule-arrival", getValue(schedule, "arrivalStationId", "ArrivalStationId"));
  setInput("schedule-departure-time", toDateTimeLocal(getValue(schedule, "departureTime", "DepartureTime")));
  setInput("schedule-arrival-time", toDateTimeLocal(getValue(schedule, "arrivalTime", "ArrivalTime")));
  setInput("schedule-price", getValue(schedule, "price", "Price"));

  setText("btn-save-schedule", "Salvează modificările");
  show("btn-cancel-schedule-edit");
}

function cancelScheduleEdit() {
  clearScheduleForm();
  setMessage("schedule-message", "", false);
}

async function deleteSchedule(scheduleId) {
  if (!confirm("Sigur vrei să ștergi această cursă?")) {
    return;
  }

  try {
    await apiDelete("/train-schedules/delete/" + scheduleId);
    setMessage("schedule-message", "Cursă ștearsă.", false);
    await loadSchedules();
  } catch (error) {
    setMessage("schedule-message", error.message, true);
  }
}

function clearScheduleForm() {
  editingScheduleId = null;

  setInput("schedule-train", "");
  setInput("schedule-departure", "");
  setInput("schedule-arrival", "");
  setInput("schedule-departure-time", "");
  setInput("schedule-arrival-time", "");
  setInput("schedule-price", "");

  setText("btn-save-schedule", "Adaugă cursă");
  hide("btn-cancel-schedule-edit");
}

function previousSchedulesPage() {
  if (schedulesPage > 1) {
    schedulesPage--;
    renderSchedules();
  }
}

function nextSchedulesPage() {
  const totalPages = Math.max(1, Math.ceil(schedules.length / schedulesPerPage));

  if (schedulesPage < totalPages) {
    schedulesPage++;
    renderSchedules();
  }
}

function renderSchedules() {
  const body = document.getElementById("schedules-body");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  if (schedules.length === 0) {
    body.innerHTML = '<tr><td colspan="7">Nu există curse disponibile.</td></tr>';
    setText("schedules-page-info", "Pagina 1");
    return;
  }

  const totalPages = Math.max(1, Math.ceil(schedules.length / schedulesPerPage));
  const start = (schedulesPage - 1) * schedulesPerPage;
  const pageItems = schedules.slice(start, start + schedulesPerPage);

  pageItems.forEach(function (schedule) {
    const id = getValue(schedule, "id", "Id");
    body.innerHTML += '<tr>' +
      '<td>' + escapeHtml(id) + '</td>' +
      '<td>' + escapeHtml(trainName(getValue(schedule, "trainId", "TrainId"))) + '</td>' +
      '<td>' + escapeHtml(scheduleRoute(schedule)) + '</td>' +
      '<td>' + escapeHtml(formatDateTime(getValue(schedule, "departureTime", "DepartureTime"))) + '</td>' +
      '<td>' + escapeHtml(formatDateTime(getValue(schedule, "arrivalTime", "ArrivalTime"))) + '</td>' +
      '<td>' + escapeHtml(formatPrice(getValue(schedule, "price", "Price"))) + '</td>' +
      '<td><button onclick="selectSchedule(' + Number(id) + ')">Alege</button></td>' +
      '</tr>';
  });

  setText("schedules-page-info", "Pagina " + schedulesPage + " din " + totalPages);
}

function renderAdminSchedules() {
  const body = document.getElementById("admin-schedules-body");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  if (allSchedules.length === 0) {
    body.innerHTML = '<tr><td colspan="7">Nu există curse.</td></tr>';
    return;
  }

  allSchedules.forEach(function (schedule) {
    const id = getValue(schedule, "id", "Id");
    body.innerHTML += '<tr>' +
      '<td>' + escapeHtml(id) + '</td>' +
      '<td>' + escapeHtml(trainName(getValue(schedule, "trainId", "TrainId"))) + '</td>' +
      '<td>' + escapeHtml(scheduleRoute(schedule)) + '</td>' +
      '<td>' + escapeHtml(formatDateTime(getValue(schedule, "departureTime", "DepartureTime"))) + '</td>' +
      '<td>' + escapeHtml(formatDateTime(getValue(schedule, "arrivalTime", "ArrivalTime"))) + '</td>' +
      '<td>' + escapeHtml(formatPrice(getValue(schedule, "price", "Price"))) + '</td>' +
      '<td><div class="table-actions"><button onclick="editSchedule(' + Number(id) + ')">Editează</button><button class="btn-danger" onclick="deleteSchedule(' + Number(id) + ')">Șterge</button></div></td>' +
      '</tr>';
  });
}

function renderTrains() {
  const body = document.getElementById("trains-body");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  if (trains.length === 0) {
    body.innerHTML = '<tr><td colspan="4">Nu există trenuri.</td></tr>';
    return;
  }

  trains.forEach(function (train) {
    body.innerHTML += '<tr>' +
      '<td>' + escapeHtml(getValue(train, "id", "Id")) + '</td>' +
      '<td>' + escapeHtml(getValue(train, "name", "Name")) + '</td>' +
      '<td>' + escapeHtml(getValue(train, "trainNumber", "TrainNumber")) + '</td>' +
      '<td>' + escapeHtml(getValue(train, "totalSeats", "TotalSeats")) + '</td>' +
      '</tr>';
  });
}

function renderStations() {
  const body = document.getElementById("stations-body");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  if (stations.length === 0) {
    body.innerHTML = '<tr><td colspan="3">Nu există stații.</td></tr>';
    return;
  }

  stations.forEach(function (station) {
    body.innerHTML += '<tr>' +
      '<td>' + escapeHtml(getValue(station, "id", "Id")) + '</td>' +
      '<td>' + escapeHtml(getValue(station, "name", "Name")) + '</td>' +
      '<td>' + escapeHtml(getValue(station, "city", "City")) + '</td>' +
      '</tr>';
  });
}

function renderMyTickets() {
  const body = document.getElementById("my-tickets-body");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  if (myTickets.length === 0) {
    body.innerHTML = '<tr><td colspan="6">Nu ai bilete cumpărate.</td></tr>';
    return;
  }

  myTickets.forEach(function (ticket) {
    const id = getValue(ticket, "id", "Id");
    const status = getValue(ticket, "status", "Status");
    const isCancelled = String(status).toLowerCase().includes("cancel");

    body.innerHTML += '<tr>' +
      '<td>' + escapeHtml(id) + '</td>' +
      '<td>' + escapeHtml(routeByScheduleId(getValue(ticket, "trainScheduleId", "TrainScheduleId"))) + '</td>' +
      '<td>' + escapeHtml(getValue(ticket, "seatNumber", "SeatNumber")) + '</td>' +
      '<td>' + escapeHtml(formatDateTime(getValue(ticket, "purchaseDate", "PurchaseDate"))) + '</td>' +
      '<td>' + escapeHtml(status) + '</td>' +
      '<td><div class="table-actions">' +
      '<button onclick="downloadTicket(' + Number(id) + ')">Descarcă</button>' +
      (isCancelled ? '' : '<button class="btn-danger" onclick="cancelTicket(' + Number(id) + ')">Anulează</button>') +
      '</div></td>' +
      '</tr>';
  });
}

function downloadTicket(ticketId) {
  const ticket = myTickets.find(function (item) {
    return Number(getValue(item, "id", "Id")) === Number(ticketId);
  });

  if (!ticket) {
    setMessage("ticket-message", "Biletul nu a fost găsit.", true);
    return;
  }

  const scheduleId = getValue(ticket, "trainScheduleId", "TrainScheduleId");
  const schedule = findSchedule(scheduleId);
  const route = routeByScheduleId(scheduleId);
  const train = schedule ? trainName(getValue(schedule, "trainId", "TrainId")) : "-";
  const departureTime = schedule ? formatDateTime(getValue(schedule, "departureTime", "DepartureTime")) : "-";
  const arrivalTime = schedule ? formatDateTime(getValue(schedule, "arrivalTime", "ArrivalTime")) : "-";
  const price = schedule ? formatPrice(getValue(schedule, "price", "Price")) : "-";
  const seatNumber = getValue(ticket, "seatNumber", "SeatNumber");
  const purchaseDate = formatDateTime(getValue(ticket, "purchaseDate", "PurchaseDate"));
  const status = getValue(ticket, "status", "Status");
  const email = getEmail() || "-";

  const content =
    '<!DOCTYPE html>' +
    '<html lang="ro">' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<title>Bilet TrainPass #' + escapeHtml(ticketId) + '</title>' +
    '<style>' +
    'body{font-family:Arial,sans-serif;background:#f1f5f9;color:#0f172a;padding:40px;}' +
    '.ticket{max-width:720px;margin:0 auto;background:white;border-radius:18px;padding:32px;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(15,23,42,.08);}' +
    '.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #e2e8f0;padding-bottom:18px;margin-bottom:24px;}' +
    '.logo{background:#2563eb;color:white;padding:14px 18px;border-radius:14px;font-weight:900;font-size:22px;}' +
    'h1{margin:0;font-size:28px;}' +
    'p{margin:6px 0;}' +
    '.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;}' +
    '.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px;}' +
    '.label{color:#64748b;font-size:13px;font-weight:700;margin-bottom:6px;}' +
    '.value{font-size:17px;font-weight:800;}' +
    '.footer{margin-top:24px;color:#64748b;font-size:13px;text-align:center;}' +
    '@media print{body{background:white;padding:0}.ticket{box-shadow:none;border:1px solid #ddd}}' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div class="ticket">' +
    '<div class="header">' +
    '<div><h1>Bilet TrainPass</h1><p>Bilet #' + escapeHtml(ticketId) + '</p></div>' +
    '<div class="logo">TP</div>' +
    '</div>' +
    '<div class="grid">' +
    '<div class="box"><div class="label">Client</div><div class="value">' + escapeHtml(email) + '</div></div>' +
    '<div class="box"><div class="label">Status</div><div class="value">' + escapeHtml(status) + '</div></div>' +
    '<div class="box"><div class="label">Rută</div><div class="value">' + escapeHtml(route) + '</div></div>' +
    '<div class="box"><div class="label">Tren</div><div class="value">' + escapeHtml(train) + '</div></div>' +
    '<div class="box"><div class="label">Plecare</div><div class="value">' + escapeHtml(departureTime) + '</div></div>' +
    '<div class="box"><div class="label">Sosire</div><div class="value">' + escapeHtml(arrivalTime) + '</div></div>' +
    '<div class="box"><div class="label">Loc</div><div class="value">' + escapeHtml(seatNumber) + '</div></div>' +
    '<div class="box"><div class="label">Preț</div><div class="value">' + escapeHtml(price) + '</div></div>' +
    '<div class="box"><div class="label">Data cumpărării</div><div class="value">' + escapeHtml(purchaseDate) + '</div></div>' +
    '<div class="box"><div class="label">ID cursă</div><div class="value">' + escapeHtml(scheduleId) + '</div></div>' +
    '</div>' +
    '<div class="footer">Document generat automat de TrainPass.</div>' +
    '</div>' +
    '</body>' +
    '</html>';

  const blob = new Blob([content], {
    type: "text/html;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "bilet-trainpass-" + ticketId + ".html";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function renderAllTickets() {
  const body = document.getElementById("all-tickets-body");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  if (allTickets.length === 0) {
    body.innerHTML = '<tr><td colspan="6">Nu există bilete.</td></tr>';
    return;
  }

  allTickets.forEach(function (ticket) {
    body.innerHTML += '<tr>' +
      '<td>' + escapeHtml(getValue(ticket, "id", "Id")) + '</td>' +
      '<td>' + escapeHtml(customerName(getValue(ticket, "customerId", "CustomerId"))) + '</td>' +
      '<td>' + escapeHtml(routeByScheduleId(getValue(ticket, "trainScheduleId", "TrainScheduleId"))) + '</td>' +
      '<td>' + escapeHtml(getValue(ticket, "seatNumber", "SeatNumber")) + '</td>' +
      '<td>' + escapeHtml(formatDateTime(getValue(ticket, "purchaseDate", "PurchaseDate"))) + '</td>' +
      '<td>' + escapeHtml(getValue(ticket, "status", "Status")) + '</td>' +
      '</tr>';
  });
}

function renderCustomers() {
  const body = document.getElementById("customers-body");

  if (!body) {
    return;
  }

  body.innerHTML = "";

  if (customers.length === 0) {
    body.innerHTML = '<tr><td colspan="3">Nu există clienți.</td></tr>';
    return;
  }

  customers.forEach(function (customer) {
    const firstName = getValue(customer, "firstName", "FirstName");
    const lastName = getValue(customer, "lastName", "LastName");
    const name = (firstName + " " + lastName).trim();

    body.innerHTML += '<tr>' +
      '<td>' + escapeHtml(getValue(customer, "id", "Id")) + '</td>' +
      '<td>' + escapeHtml(name || "-") + '</td>' +
      '<td>' + escapeHtml(getValue(customer, "email", "Email")) + '</td>' +
      '</tr>';
  });
}

function updateDashboard() {
  setText("stat-schedules", allSchedules.length);
  setText("stat-tickets-total", allTickets.length);

  const active = allTickets.filter(function (ticket) {
    return !String(getValue(ticket, "status", "Status")).toLowerCase().includes("cancel");
  }).length;

  const cancelled = allTickets.length - active;

  setText("stat-tickets-active", active);
  setText("stat-tickets-cancelled", cancelled);
}

function fillStationSelect(id) {
  const select = document.getElementById(id);

  if (!select) {
    return;
  }

  select.innerHTML = '<option value="">Alege stația</option>';

  stations.forEach(function (station) {
    const stationId = getValue(station, "id", "Id");
    const name = getValue(station, "name", "Name");
    const city = getValue(station, "city", "City");
    select.innerHTML += '<option value="' + escapeHtml(stationId) + '">' + escapeHtml(name + " - " + city) + '</option>';
  });
}

function fillTrainSelect() {
  const select = document.getElementById("schedule-train");

  if (!select) {
    return;
  }

  select.innerHTML = '<option value="">Alege trenul</option>';

  trains.forEach(function (train) {
    const trainId = getValue(train, "id", "Id");
    const name = getValue(train, "name", "Name");
    const number = getValue(train, "trainNumber", "TrainNumber");
    select.innerHTML += '<option value="' + escapeHtml(trainId) + '">' + escapeHtml(name + " (" + number + ")") + '</option>';
  });
}

function trainName(trainId) {
  const train = trains.find(function (item) {
    return Number(getValue(item, "id", "Id")) === Number(trainId);
  });

  if (!train) {
    return "Tren #" + trainId;
  }

  return getValue(train, "name", "Name") + " (" + getValue(train, "trainNumber", "TrainNumber") + ")";
}

function getTrainTotalSeats(trainId) {
  const train = trains.find(function (item) {
    return Number(getValue(item, "id", "Id")) === Number(trainId);
  });

  if (!train) {
    return maxWagons * seatsPerWagon;
  }

  return Number(getValue(train, "totalSeats", "TotalSeats")) || maxWagons * seatsPerWagon;
}

function stationName(stationId) {
  const station = stations.find(function (item) {
    return Number(getValue(item, "id", "Id")) === Number(stationId);
  });

  if (!station) {
    return "Stație #" + stationId;
  }

  return getValue(station, "name", "Name");
}

function customerName(customerId) {
  const customer = customers.find(function (item) {
    return String(getValue(item, "id", "Id")) === String(customerId);
  });

  if (!customer) {
    return customerId || "-";
  }

  const firstName = getValue(customer, "firstName", "FirstName");
  const lastName = getValue(customer, "lastName", "LastName");
  const email = getValue(customer, "email", "Email");
  const name = (firstName + " " + lastName).trim();

  return name ? name + " - " + email : email;
}

function scheduleRoute(schedule) {
  const departureId = getValue(schedule, "departureStationId", "DepartureStationId");
  const arrivalId = getValue(schedule, "arrivalStationId", "ArrivalStationId");

  return stationName(departureId) + " - " + stationName(arrivalId);
}

function routeByScheduleId(scheduleId) {
  const schedule = findSchedule(scheduleId);

  if (!schedule) {
    return "Cursă #" + scheduleId;
  }

  return scheduleRoute(schedule);
}

function findSchedule(scheduleId) {
  return allSchedules.find(function (schedule) {
    return Number(getValue(schedule, "id", "Id")) === Number(scheduleId);
  });
}

function wagonBySeat(seat) {
  return Math.ceil(Number(seat) / seatsPerWagon) || 1;
}

function getTotalWagons() {
  return Math.max(1, Math.ceil(selectedTrainTotalSeats / seatsPerWagon));
}

function getList(data, names) {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(names)) {
    for (const name of names) {
      const value = getValue(data, name);

      if (Array.isArray(value)) {
        return value;
      }
    }
  }

  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  return [];
}

function getValue(object) {
  if (!object) {
    return "";
  }

  for (let i = 1; i < arguments.length; i++) {
    const key = arguments[i];

    if (Object.prototype.hasOwnProperty.call(object, key)) {
      return object[key];
    }

    const foundKey = Object.keys(object).find(function (item) {
      return item.toLowerCase() === String(key).toLowerCase();
    });

    if (foundKey) {
      return object[foundKey];
    }
  }

  return "";
}

function inputValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

function setInput(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.value = value === null || value === undefined ? "" : value;
  }
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value === null || value === undefined ? "" : value;
  }
}

function setMessage(id, text, isError) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  element.textContent = text || "";
  element.classList.toggle("error", Boolean(isError));
}

function click(id, handler) {
  const element = document.getElementById(id);

  if (element) {
    element.addEventListener("click", handler);
  }
}

function show(id) {
  const element = document.getElementById(id);

  if (element) {
    element.classList.remove("hidden");
  }
}

function hide(id) {
  const element = document.getElementById(id);

  if (element) {
    element.classList.add("hidden");
  }
}

function showModal(id) {
  const element = document.getElementById(id);

  if (element) {
    element.classList.remove("hidden");
    element.classList.add("visible");
  }
}

function hideModal(id) {
  const element = document.getElementById(id);

  if (element) {
    element.classList.remove("visible");
    element.classList.add("hidden");
  }
}

function logout() {
  removeAuthData();
  window.location.href = "login.html";
}

function isAdminRole() {
  return getRole() === "Admin";
}

function isCustomerRole() {
  return getRole() === "Customer";
}

function dateOnly(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ro-RO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatPrice(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return value || "-";
  }

  return number.toFixed(2) + " lei";
}

function toDateTimeLocal(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 16);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return year + "-" + month + "-" + day + "T" + hour + ":" + minute;
}

function escapeHtml(value) {
  return String(value === null || value === undefined ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}