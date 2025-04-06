document.addEventListener("DOMContentLoaded", function () {
    const dataForm = document.getElementById("dataForm");
    const dataList = document.getElementById("dataList");
    const searchBox = document.getElementById("searchBox");
    const calendar = document.getElementById("calendar");
    const eventDetails = document.getElementById("eventDetails");
    const monthYearLabel = document.getElementById("calendarMonthYear");
    const nextMonthBtn = document.getElementById("nextMonthBtn");
    const prevMonthBtn = document.getElementById("prevMonthBtn");
    document.addEventListener("DOMContentLoaded", function () {
        const openModalButton = document.getElementById("openAchievementModal");
        const closeModalButton = document.getElementById("closeAchievementModal");
        const achievementModal = document.getElementById("achievementModal");
        const achievementForm = document.getElementById("achievementForm");
        const achievementTableBody = document.querySelector("#achievementTable tbody");
    
        // Open the modal
        openModalButton.addEventListener("click", function () {
            achievementModal.showModal();
            loadAchievements();
        });
    
        // Close the modal
        closeModalButton.addEventListener("click", function () {
            achievementModal.close();
        });
    
        // Handle form submission
        achievementForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const date = document.getElementById("achievementDate").value;
            const value = document.getElementById("achievementValue").value;
    
            if (date && value) {
                saveAchievement(date, value);
                loadAchievements();
                achievementForm.reset();
            }
        });
    
        // Save achievement to localStorage
        function saveAchievement(date, value) {
            const achievements = JSON.parse(localStorage.getItem("achievements")) || [];
            achievements.push({ date, value });
            localStorage.setItem("achievements", JSON.stringify(achievements));
        }
    
        // Load achievements from localStorage and display them
        function loadAchievements() {
            achievementTableBody.innerHTML = "";
            const achievements = JSON.parse(localStorage.getItem("achievements")) || [];
            achievements.forEach(achievement => {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${achievement.date}</td><td>${achievement.value}</td>`;
                achievementTableBody.appendChild(row);
            });
        }
    });
    

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
        eventDetails.innerHTML = `<h3>Events on ${date}</h3>`;
        if (allEvents[date]) {
            allEvents[date].forEach(event => {
                eventDetails.innerHTML += `<p><strong>${event.name}:</strong> ${event.event}</p>`;
            });
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

    // Init
    displayEntries();
    displayCalendar();
    eventDetails.innerHTML = ""; // Start with no event shown
});
