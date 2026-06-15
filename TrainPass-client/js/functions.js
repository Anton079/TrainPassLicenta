function showLoginMessage(message) {
    document.getElementById("login-message").innerText = message;
}

function showRegisterMessage(message) {
    document.getElementById("register-message").innerText = message;
}

function showSchedules(data) {
    const table = document.getElementById("schedules-table");

    table.innerHTML = "";

    const schedules = data.listTrainSchedule || data || [];

    schedules.forEach(schedule => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${schedule.id}</td>
            <td>${schedule.trainId}</td>
            <td>${schedule.departureStationId}</td>
            <td>${schedule.arrivalStationId}</td>
            <td>${formatDate(schedule.departureTime)}</td>
            <td>${formatDate(schedule.arrivalTime)}</td>
            <td>${schedule.price}</td>
            <td>
                <button onclick="selectSchedule(${schedule.id})">Select</button>
            </td>
        `;

        table.appendChild(row);
    });
}

function selectSchedule(id) {
    document.getElementById("ticket-schedule-id").value = id;
}

function showMyTickets(data) {
    const table = document.getElementById("my-tickets-table");

    table.innerHTML = "";

    const tickets = data.ticketList || data || [];

    tickets.forEach(ticket => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${ticket.id}</td>
            <td>${ticket.customerId}</td>
            <td>${ticket.trainScheduleId}</td>
            <td>${ticket.seatNumber}</td>
            <td>${formatDate(ticket.purchaseDate)}</td>
            <td>${ticket.status}</td>
            <td>
                <button onclick="cancelTicket(${ticket.id})">Cancel</button>
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
            <td>${ticket.id}</td>
            <td>${ticket.customerId}</td>
            <td>${ticket.trainScheduleId}</td>
            <td>${ticket.seatNumber}</td>
            <td>${formatDate(ticket.purchaseDate)}</td>
            <td>${ticket.status}</td>
        `;

        table.appendChild(row);
    });
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "-";
    }

    return new Date(dateValue).toLocaleString();
}