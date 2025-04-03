document.addEventListener("DOMContentLoaded", function () {
    const dataForm = document.getElementById("dataForm");
    const dataList = document.getElementById("dataList");
    const searchBox = document.getElementById("searchBox");
    const calendar = document.getElementById("calendar");
    const eventDetails = document.getElementById("eventDetails");

    let entries = JSON.parse(localStorage.getItem("entries")) || [];

    function displayEntries(filterText = "") {
        dataList.innerHTML = "";
        entries.forEach((entry, index) => {
            if (entry.name.toLowerCase().includes(filterText.toLowerCase())) {
                const row = document.createElement("tr");

                const nameCell = document.createElement("td");
                const link = document.createElement("a");
                link.href = `details.html?index=${index}`;
                link.textContent = entry.name;
                nameCell.appendChild(link);

                const actionsCell = document.createElement("td");
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.classList.add("delete");
                deleteBtn.onclick = function () {
                    entries.splice(index, 1);
                    localStorage.setItem("entries", JSON.stringify(entries));
                    displayEntries(searchBox.value);
                    displayCalendar();
                };

                actionsCell.appendChild(deleteBtn);
                row.appendChild(nameCell);
                row.appendChild(actionsCell);
                dataList.appendChild(row);
            }
        });
    }

    searchBox.addEventListener("input", function () {
        displayEntries(this.value);
    });

    dataForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = document.getElementById("name").value;

        entries.push({ name, events: {} });
        localStorage.setItem("entries", JSON.stringify(entries));

        dataForm.reset();
        displayEntries(searchBox.value);
        displayCalendar();
    });

    // ---------------------- Calendar Functionality ----------------------

    function getAllEvents() {
        let allEvents = {};
        entries.forEach(entry => {
            if (entry.events) {
                Object.keys(entry.events).forEach(date => {
                    if (!allEvents[date]) {
                        allEvents[date] = [];
                    }
                    allEvents[date].push({ name: entry.name, event: entry.events[date] });
                });
            }
        });
        return allEvents;
    }

    function displayCalendar() {
        calendar.innerHTML = ""; 

        let allEvents = getAllEvents();
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

        let calendarHTML = `<table><tr>`;
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        daysOfWeek.forEach(day => {
            calendarHTML += `<th>${day}</th>`;
        });
        calendarHTML += `</tr><tr>`;

        for (let i = 0; i < firstDay; i++) {
            calendarHTML += `<td></td>`;
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            let eventClass = "";
            if (allEvents[dateString]) {
                eventClass = "event-day";
            }

            if (today.getDate() === day) {
                eventClass += " today";
            }

            calendarHTML += `<td class="${eventClass}" data-date="${dateString}">${day}</td>`;

            if ((firstDay + day) % 7 === 0) {
                calendarHTML += `</tr><tr>`;
            }
        }

        calendarHTML += `</tr></table>`;
        calendar.innerHTML = calendarHTML;

        document.querySelectorAll(".event-day").forEach(td => {
            td.classList.add("event-blink"); // Apply CSS class for animation
            td.addEventListener("click", function () {
                showEventDetails(this.getAttribute("data-date"));
            });
        });
        

        displayAllEventsOnHomePage(allEvents);
    }

    function showEventDetails(date) {
        let allEvents = getAllEvents();
        eventDetails.innerHTML = `<h3>Events on ${date}</h3>`;
        if (allEvents[date]) {
            allEvents[date].forEach(event => {
                eventDetails.innerHTML += `<p><strong>${event.name}:</strong> ${event.event}</p>`;
            });
        } else {
            eventDetails.innerHTML = "<p>No events on this day.</p>";
        }
    }

    function displayAllEventsOnHomePage(allEvents) {
        eventDetails.innerHTML = "<h3>All Scheduled Events</h3>";
        if (Object.keys(allEvents).length === 0) {
            eventDetails.innerHTML += "<p>No events scheduled.</p>";
            return;
        }

        Object.keys(allEvents).forEach(date => {
            eventDetails.innerHTML += `<h4>${date}</h4>`;
            allEvents[date].forEach(event => {
                eventDetails.innerHTML += `<p><strong>${event.name}:</strong> ${event.event}</p>`;
            });
        });
    }

    displayEntries();
    displayCalendar();
});
