function showSchedules(data) {
    const list = document.getElementById("schedules-list");

    list.innerHTML = "";

    const schedules = data.listTrainSchedule || data;

    schedules.forEach(schedule => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${schedule.id}</td>
            <td>${schedule.trainId}</td>
            <td>${schedule.departureTime || "-"}</td>
            <td>${schedule.arrivalTime || "-"}</td>
            <td>${schedule.price}</td>
            <td>
                <button class="btn btn-primary" onclick="selectSchedule(${schedule.id})">
                    Select
                </button>
            </td>
        `;

        list.appendChild(row);
    });
}

function showFreeSeats(seats) {
    const list = document.getElementById("free-seats-list");

    list.innerHTML = "";

    seats.forEach(seat => {
        const div = document.createElement("div");
        div.className = "seat";
        div.innerText = seat;
        list.appendChild(div);
    });
}

function selectSchedule(id) {
    document.getElementById("free-seats-schedule-id").value = id;
    document.getElementById("ticket-schedule-id").value = id;
}