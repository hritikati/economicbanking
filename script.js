document.addEventListener("DOMContentLoaded", function () {
    const dataForm = document.getElementById("dataForm");
    const dataList = document.getElementById("dataList");
    const searchBox = document.getElementById("searchBox");
    const calendar = document.getElementById("calendar");
    const eventDetails = document.getElementById("eventDetails");
    const monthYearLabel = document.getElementById("calendarMonthYear");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const prevMonthBtn = document.getElementById("prevMonthBtn");

    let entries = JSON.parse(localStorage.getItem("entries")) || [];
    let currentDate = new Date();

    function displayEntries(filterText = "") {
        dataList.innerHTML = "";
        let serial = 1;
        entries.forEach((entry, index) => {
            if (entry.name.toLowerCase().includes(filterText.toLowerCase())) {
                const row = document.createElement("tr");

                const serialCell = document.createElement("td");
                serialCell.textContent = serial++;
                row.appendChild(serialCell);

                const nameCell = document.createElement("td");
                const link = document.createElement("a");
                link.href = `details.html?index=${index}`;
                link.textContent = entry.name;
                nameCell.appendChild(link);

                const actionsCell = document.createElement("td");
                const editBtn = document.createElement("button");
                editBtn.textContent = "Edit";
                editBtn.classList.add("edit");
                editBtn.onclick = function () {
                    const newName = prompt("Enter the new name:", entry.name);
                    if (newName && newName.trim()) {
                        entries[index].name = newName.trim();
                        localStorage.setItem("entries", JSON.stringify(entries));
                        displayEntries(searchBox.value);
                        displayCalendar();
                    }
                };

                actionsCell.appendChild(editBtn);
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

    // ---------------------- Calendar ----------------------

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
        const allEvents = getAllEvents();

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const today = new Date();

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        monthYearLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;

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

            if (
                today.getDate() === day &&
                today.getMonth() === currentMonth &&
                today.getFullYear() === currentYear
            ) {
                eventClass += " today";
            }

            calendarHTML += `<td class="${eventClass}" data-date="${dateString}">${day}</td>`;

            if ((firstDay + day) % 7 === 0) {
                calendarHTML += `</tr><tr>`;
            }
        }

        calendarHTML += `</tr></table>`;
        calendar.innerHTML = calendarHTML;

        document.querySelectorAll("td[data-date]").forEach(td => {
            td.addEventListener("click", function () {
                showEventDetails(this.getAttribute("data-date"));
            });
        });

        document.querySelectorAll(".event-day").forEach(td => {
            td.classList.add("event-blink");
        });
    }

    function showEventDetails(date) {
        const allEvents = getAllEvents();
        eventDetails.innerHTML = "";
    
        if (allEvents[date]) {
            let serial = 1;
    
            const heading = document.createElement("h3");
            heading.textContent = `Events on ${date}`;
            eventDetails.appendChild(heading);
    
            // Wrapper for scrollable table
            const wrapper = document.createElement("div");
            wrapper.style.overflowX = "auto";
            wrapper.style.width = "100%";
    
            const table = document.createElement("table");
            table.style.width = "100%";
            table.style.borderCollapse = "collapse";
            table.style.boxSizing = "border-box";
            table.innerHTML = `
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="border: 1px solid #ccc; padding: 8px; min-width: 60px;">S.No</th>
                        <th style="border: 1px solid #ccc; padding: 8px; min-width: 120px;">Name</th>
                        <th style="border: 1px solid #ccc; padding: 8px; min-width: 200px;">Event</th>
                    </tr>
                </thead>
                <tbody></tbody>
            `;
    
            const tbody = table.querySelector("tbody");
    
            allEvents[date].forEach(event => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td style="border: 1px solid #ccc; padding: 8px;">${serial++}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${event.name}</td>
                    <td style="border: 1px solid #ccc; padding: 8px;">${event.event}</td>
                `;
                tbody.appendChild(row);
            });
    
            wrapper.appendChild(table);
            eventDetails.appendChild(wrapper);
        } else {
            eventDetails.innerHTML = "<p>No events on this day.</p>";
        }
    }
    

    nextMonthBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        displayCalendar();
        eventDetails.innerHTML = ""; // Clear event details when navigating
    });

    prevMonthBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        displayCalendar();
        eventDetails.innerHTML = ""; // Clear event details when navigating
    });
    let activityData = JSON.parse(localStorage.getItem("activityData")) || {};

document.getElementById("activityForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const date = document.getElementById("activityDate").value;
    const company = document.getElementById("companyName").value.trim();
    const activity = document.getElementById("activityDesc").value.trim();

    if (!activityData[date]) {
        activityData[date] = [];
    }

    activityData[date].push({ company, activity });
    localStorage.setItem("activityData", JSON.stringify(activityData));
    this.reset();
    updateActivityCalendar();
});

// Activity Calendar
let currentActivityMonth = new Date().getMonth();
let currentActivityYear = new Date().getFullYear();

function updateActivityCalendar() {
    const calendar = document.getElementById("activityCalendar");
    const header = document.getElementById("activityCalendarMonthYear");

    const firstDay = new Date(currentActivityYear, currentActivityMonth, 1);
    const lastDate = new Date(currentActivityYear, currentActivityMonth + 1, 0).getDate();
    const todayStr = new Date().toISOString().split("T")[0];

    header.textContent = `${firstDay.toLocaleString("default", { month: "long" })} ${currentActivityYear}`;
    calendar.innerHTML = "";

    for (let i = 1; i <= lastDate; i++) {
        const dateStr = `${currentActivityYear}-${String(currentActivityMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        const cell = document.createElement("div");
        cell.classList.add("calendar-date");
        cell.dataset.date = dateStr;
        cell.textContent = i;

        if (activityData[dateStr]) {
            cell.classList.add("activity-date");
        }

        calendar.appendChild(cell);
    }

    document.querySelectorAll("#activityCalendar .calendar-date").forEach(cell => {
        cell.addEventListener("click", () => {
            const clickedDate = cell.dataset.date;
            showActivitiesForDate(clickedDate);
        });
    });
}

function showActivitiesForDate(date) {
    const container = document.getElementById("activityTableContainer");
    container.innerHTML = "";

    const activities = activityData[date];
    if (!activities || activities.length === 0) {
        const noActivityMessage = document.createElement("p");
        noActivityMessage.textContent = "No activities for this date.";
        noActivityMessage.classList.add("no-activity-message");
        container.appendChild(noActivityMessage);
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.id = "activityPrintSection";

    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr><th>Date</th><th>S.No</th><th>Company</th><th>Activity</th></tr>
        </thead>
        <tbody>
            ${activities.map((item, index) => `
                <tr>
                    <td>${date}</td>
                    <td>${index + 1}</td>
                    <td>${item.company}</td>
                    <td>${item.activity}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    wrapper.appendChild(table);

    // Add Print Button
    const printBtn = document.createElement("button");
    printBtn.textContent = "Print as PDF";
    printBtn.style.marginTop = "10px";
    printBtn.onclick = () => {
        const printWindow = window.open('', '', 'width=800,height=600');
        const printContent = `
            <html>
            <head>
                <title>Activity Report - ${date}</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    th, td {
                        border: 1px solid #333;
                        padding: 8px;
                        text-align: center;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h2>Activity Report - ${date}</h2>
                ${document.getElementById("activityPrintSection").innerHTML}
            </body>
            </html>
        `;
    
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
    

    container.appendChild(wrapper);

const printWrapper = document.createElement("div");
printWrapper.style.textAlign = "center";
printWrapper.style.marginTop = "15px";
printWrapper.appendChild(printBtn);

container.appendChild(printWrapper);

}


document.getElementById("prevActivityMonthBtn").addEventListener("click", () => {
    currentActivityMonth--;
    if (currentActivityMonth < 0) {
        currentActivityMonth = 11;
        currentActivityYear--;
    }
    updateActivityCalendar();
});

document.getElementById("nextActivityMonthBtn").addEventListener("click", () => {
    currentActivityMonth++;
    if (currentActivityMonth > 11) {
        currentActivityMonth = 0;
        currentActivityYear++;
    }
    updateActivityCalendar();
});

updateActivityCalendar();

    

    // Init
    displayEntries();
    displayCalendar();
    eventDetails.innerHTML = ""; // Start with no event shown
});
