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
    if (!entry.customFields) {
        entry.customFields = {};
    }
    if (!entry.events) {
        entry.events = {};
    }

    function displayFields() {
        const detailsList = document.getElementById("detailsList");
        const editFieldName = document.getElementById("editFieldName");

        detailsList.innerHTML = "";
        editFieldName.innerHTML = "";

        Object.keys(entry.customFields).forEach((key) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${key}:</strong> ${entry.customFields[key]}`;
            detailsList.appendChild(li);

            const option = document.createElement("option");
            option.value = key;
            option.textContent = key;
            editFieldName.appendChild(option);
        });

        localStorage.setItem("entries", JSON.stringify(entries));
    }

    function displayEvents() {
        const eventList = document.getElementById("eventList");
        eventList.innerHTML = "";
    
        Object.keys(entry.events).forEach((date) => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${date}:</strong> ${entry.events[date]} 
                            <button class="delete-event" data-date="${date}">Delete</button>`;
            eventList.appendChild(li);
        });
    
        document.querySelectorAll(".delete-event").forEach(button => {
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
            displayEvents();
        }
    }
    

    // Add Custom Field
    document.getElementById("customFieldForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const fieldName = document.getElementById("fieldName").value.trim();
        const fieldValue = document.getElementById("fieldValue").value.trim();

        if (fieldName && fieldValue) {
            entry.customFields[fieldName] = fieldValue;
            displayFields();
            document.getElementById("customFieldForm").reset();
        }
    });

    // Edit Existing Field
    document.getElementById("editFieldForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const fieldName = document.getElementById("editFieldName").value;
        const fieldValue = document.getElementById("editFieldValue").value.trim();

        if (fieldName && fieldValue) {
            entry.customFields[fieldName] = fieldValue;
            displayFields();
            document.getElementById("editFieldForm").reset();
        }
    });

    // Add Event
    document.getElementById("eventForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const eventDate = document.getElementById("eventDate").value;
        const eventDescription = document.getElementById("eventDescription").value.trim();

        if (eventDate && eventDescription) {
            entry.events[eventDate] = eventDescription;
            displayEvents();
            document.getElementById("eventForm").reset();
        }
    });

    function updateCalendar() {
        let allEntries = JSON.parse(localStorage.getItem("entries")) || [];
        let eventDates = new Set();
    
        // Collect all event dates from all entries
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
    
            cell.classList.remove("current-date", "event-date"); // Reset colors
    
            if (cellDate === today) {
                cell.classList.add("current-date"); // Light Blue for today
            }
    
            if (eventDates.has(cellDate)) {
                cell.classList.add("event-date"); // Light Red for event dates
            }
        });
    }
    
    // Call this function after rendering the calendar
    updateCalendar();
    
    displayFields();
    displayEvents();
});
