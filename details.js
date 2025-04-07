document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const index = urlParams.get("index");

    let entries = JSON.parse(localStorage.getItem("entries")) || [];
    let entry = entries[index];

    if (!entry) {
        alert("Entry not found!");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("entryName").textContent = entry.name;

    // Ensure custom fields and events exist
    if (!entry.customFields) entry.customFields = {};
    if (!entry.events) entry.events = {};

    function displayFields() {
        const detailsList = document.getElementById("detailsList");
        const editFieldName = document.getElementById("editFieldName");

        detailsList.innerHTML = "";
        editFieldName.innerHTML = "";

        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr style="background-color: #f8d7da;">
                    <th>Field Name</th>
                    <th>Field Value</th>
                    <th>SBI Wallet Share</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        Object.keys(entry.customFields).forEach((key) => {
            const fieldData = entry.customFields[key];

            const row = document.createElement("tr");
            row.style.backgroundColor = "#e2f0d9";

            row.innerHTML = `
                <td><strong>${key}</strong></td>
                <td>${fieldData.value}</td>
                <td>${fieldData.walletShare || "N/A"}</td>
            `;

            tbody.appendChild(row);

            const option = document.createElement("option");
            option.value = key;
            option.textContent = key;
            editFieldName.appendChild(option);
        });

        detailsList.appendChild(table);
        localStorage.setItem("entries", JSON.stringify(entries));
    }

    function displayEvents() {
        const eventList = document.getElementById("eventList");
        eventList.innerHTML = "";

        const table = document.createElement("table");
        table.innerHTML = `
            <thead>
                <tr style="background-color: #cce5ff;">
                    <th>S.No</th>
                    <th>Date</th>
                    <th>Event</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        let count = 1;
        Object.keys(entry.events).forEach((date) => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${count++}</td>
                <td>${date}</td>
                <td>${entry.events[date]}</td>
                <td><button class="delete-event" data-date="${date}">Delete</button></td>
            `;

            tbody.appendChild(tr);
        });

        eventList.appendChild(table);

        document.querySelectorAll(".delete-event").forEach((button) => {
            button.addEventListener("click", function () {
                const eventDate = this.getAttribute("data-date");
                deleteEvent(eventDate);
            });
        });

        updateCalendar();
        localStorage.setItem("entries", JSON.stringify(entries));
    }

    function deleteEvent(date) {
        if (confirm("Are you sure you want to delete this event?")) {
            delete entry.events[date];
            localStorage.setItem("entries", JSON.stringify(entries));
            displayEvents();
        }
    }

    document.getElementById("customFieldForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const fieldName = document.getElementById("fieldName").value.trim();
        const fieldValue = document.getElementById("fieldValue").value.trim();
        const walletValue = document.getElementById("walletShareValue").value.trim();

        if (fieldName && fieldValue && walletValue) {
            entry.customFields[fieldName] = {
                value: fieldValue,
                walletShare: walletValue
            };

            displayFields();
            this.reset();
        }
    });

    document.getElementById("editFieldForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const fieldName = document.getElementById("editFieldName").value;
        const fieldValue = document.getElementById("editFieldValue").value.trim();
        const walletValue = document.getElementById("editWalletShare").value.trim();

        if (fieldName && fieldValue) {
            entry.customFields[fieldName] = {
                value: fieldValue,
                walletShare: walletValue || "N/A"
            };

            displayFields();
            this.reset();
        }
    });

    document.getElementById("eventForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const eventDate = document.getElementById("eventDate").value;
        const eventDescription = document.getElementById("eventDescription").value.trim();

        if (eventDate && eventDescription) {
            entry.events[eventDate] = eventDescription;
            displayEvents();
            this.reset();
        }
    });

    function updateCalendar() {
        let allEntries = JSON.parse(localStorage.getItem("entries")) || [];
        let eventDates = new Set();

        allEntries.forEach((entry) => {
            if (entry.events) {
                Object.keys(entry.events).forEach((date) => {
                    eventDates.add(date);
                });
            }
        });

        const today = new Date().toISOString().split('T')[0];

        document.querySelectorAll(".calendar-date").forEach((cell) => {
            const cellDate = cell.dataset.date;

            cell.classList.remove("current-date", "event-date");

            if (cellDate === today) {
                cell.classList.add("current-date");
            }

            if (eventDates.has(cellDate)) {
                cell.classList.add("event-date");
            }
        });
    }

    updateCalendar();
    displayFields();
    displayEvents();
});
