/*
    DESK DASHBOARD V2 + CALENDAR
    Compatible con JavaScript clásico (ES5 / WebViews antiguos).
*/

/* ==========================================================================
   1. CONFIGURACIÓN GENERAL
   ========================================================================== */
var CONFIG = {
    latitude: -36.6066,
    longitude: -72.1034,
    location: "Chillán · Chile",
    timezone: "America/Santiago"
};

var MONTH_NAMES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

var DAY_NAMES = [
    "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
];

/* ==========================================================================
   2. RELOJ (PRINCIPAL Y VISTA CALENDARIO)
   ========================================================================== */
var clockElement = document.getElementById("clock");
var secondsElement = document.getElementById("seconds");
var dateElement = document.getElementById("date");
var calClockTime = document.getElementById("cal-clock-time");
var calClockDate = document.getElementById("cal-clock-date");

function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }

    var timeStr = hours + ":" + minutes;

    if (clockElement) { clockElement.textContent = timeStr; }
    if (secondsElement) { secondsElement.textContent = seconds; }
    if (calClockTime) { calClockTime.textContent = timeStr; }

    var dateStr = DAY_NAMES[now.getDay()] + ", " + now.getDate() + " de " + MONTH_NAMES[now.getMonth()];
    if (dateElement) { dateElement.textContent = dateStr; }
    if (calClockDate) { calClockDate.textContent = "Hoy · " + dateStr; }
}

updateClock();
setInterval(updateClock, 1000);

/* ==========================================================================
   3. CLIMA (OPEN-METEO VIA XHR)
   ========================================================================== */
var weatherCodes = {
    0: ["☀", "Despejado"],
    1: ["🌤", "Mayormente despejado"],
    2: ["⛅", "Parcialmente nublado"],
    3: ["☁", "Nublado"],
    45: ["🌫", "Niebla"],
    48: ["🌫", "Niebla"],
    51: ["🌦", "Llovizna ligera"],
    53: ["🌦", "Llovizna"],
    55: ["🌧", "Llovizna intensa"],
    61: ["🌧", "Lluvia ligera"],
    63: ["🌧", "Lluvia"],
    65: ["🌧", "Lluvia intensa"],
    71: ["🌨", "Nieve ligera"],
    73: ["🌨", "Nieve"],
    75: ["❄", "Nieve intensa"],
    80: ["🌦", "Chubascos"],
    81: ["🌦", "Chubascos"],
    82: ["⛈", "Chubascos fuertes"],
    95: ["⛈", "Tormenta"],
    96: ["⛈", "Tormenta con granizo"],
    99: ["⛈", "Tormenta fuerte"]
};

function loadWeather() {
    var url = "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" + CONFIG.latitude +
        "&longitude=" + CONFIG.longitude +
        "&current=temperature_2m,apparent_temperature,weather_code" +
        "&timezone=" + CONFIG.timezone +
        "&temperature_unit=celsius";

    var request = new XMLHttpRequest();
    request.open("GET", url, true);

    request.onreadystatechange = function () {
        if (request.readyState !== 4) { return; }
        if (request.status !== 200) {
            showWeatherError();
            return;
        }

        try {
            var data = JSON.parse(request.responseText);
            displayWeather(data);
        } catch (e) {
            showWeatherError();
        }
    };

    request.send();
}

function displayWeather(data) {
    var current = data.current;
    var info = weatherCodes[current.weather_code] || ["·", "Condición desconocida"];

    document.getElementById("weather-icon").textContent = info[0];
    document.getElementById("temperature").textContent = Math.round(current.temperature_2m) + "°";
    document.getElementById("condition").textContent = info[1];
    document.getElementById("feels-like").textContent = "Sensación " + Math.round(current.apparent_temperature) + "°";
    document.getElementById("weather-updated").textContent = "Clima actualizado " + getCurrentTime();
}

function showWeatherError() {
    document.getElementById("weather-icon").textContent = "·";
    document.getElementById("temperature").textContent = "--°";
    document.getElementById("condition").textContent = "Clima no disponible";
    document.getElementById("weather-updated").textContent = "Sin conexión";
}

function getCurrentTime() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    if (h < 10) { h = "0" + h; }
    if (m < 10) { m = "0" + m; }
    return h + ":" + m;
}

loadWeather();
setInterval(loadWeather, 30 * 60 * 1000);

document.getElementById("refresh-weather").addEventListener("click", loadWeather);

/* ==========================================================================
   4. TAREAS Y NOTAS (CALENDARIO Y DASHBOARD)
   ========================================================================== */
var CAL_TASKS_KEY = "desk-calendar-day-tasks-v1";
var calendarTasks = {}; // Formato: { "YYYY-MM-DD": [ { text: "...", done: false } ] }

function formatDateISO(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d);
}

function migrateLegacyTodos() {
    try {
        var legacy = localStorage.getItem("desk-dashboard-todos-v2");
        if (legacy) {
            var parsed = JSON.parse(legacy);
            if (parsed && parsed.length > 0) {
                var todayKey = formatDateISO(new Date());
                if (!calendarTasks[todayKey]) {
                    calendarTasks[todayKey] = [];
                }
                for (var i = 0; i < parsed.length; i++) {
                    calendarTasks[todayKey].push(parsed[i]);
                }
                saveCalendarTasks();
            }
            localStorage.removeItem("desk-dashboard-todos-v2");
        }
    } catch (e) {}
}

function loadCalendarTasks() {
    try {
        var saved = localStorage.getItem(CAL_TASKS_KEY);
        if (saved) { calendarTasks = JSON.parse(saved); }
    } catch (e) {
        calendarTasks = {};
    }
    migrateLegacyTodos();
}

function saveCalendarTasks() {
    try {
        localStorage.setItem(CAL_TASKS_KEY, JSON.stringify(calendarTasks));
    } catch (e) {}
}

function renderDashboardTodayTasks() {
    var list = document.getElementById("dashboard-today-list");
    var empty = document.getElementById("dashboard-today-empty");
    var countEl = document.getElementById("dashboard-today-count");
    if (!list) { return; }

    list.innerHTML = "";

    var todayStr = formatDateISO(new Date());
    var todayList = (calendarTasks && calendarTasks[todayStr]) ? calendarTasks[todayStr] : [];

    if (countEl) {
        countEl.textContent = todayList.length + (todayList.length === 1 ? " tarea" : " tareas");
    }

    if (todayList.length === 0) {
        if (empty) { empty.style.display = "block"; }
        return;
    }

    if (empty) { empty.style.display = "none"; }

    for (var i = 0; i < todayList.length; i++) {
        var item = document.createElement("li");
        item.className = "dashboard-today-item" + (todayList[i].done ? " done" : "");

        var bullet = document.createElement("span");
        bullet.className = "dashboard-today-bullet";
        bullet.textContent = todayList[i].done ? "✓" : "•";

        var text = document.createElement("span");
        text.className = "dashboard-today-text";
        text.textContent = todayList[i].text;

        item.appendChild(bullet);
        item.appendChild(text);
        list.appendChild(item);
    }
}

loadCalendarTasks();
renderDashboardTodayTasks();

/* ==========================================================================
   5. CALENDARIO Y NOTAS POR DÍA
   ========================================================================== */
var calCurrentYear;
var calCurrentMonth;
var selectedDateStr = null;

function getStartAndEndOfWeek(date) {
    var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var day = d.getDay();
    var diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste a Lunes
    var monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    var sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { start: monday, end: sunday };
}

function renderCalendar() {
    var label = document.getElementById("cal-current-month");
    label.textContent = MONTH_NAMES[calCurrentMonth] + " " + calCurrentYear;

    var grid = document.getElementById("cal-grid");
    grid.innerHTML = "";

    var today = new Date();
    var todayStr = formatDateISO(today);
    var weekRange = getStartAndEndOfWeek(today);

    // Primer día del mes
    var firstDayOfMonth = new Date(calCurrentYear, calCurrentMonth, 1);
    var startingDay = firstDayOfMonth.getDay();
    startingDay = (startingDay === 0) ? 6 : startingDay - 1; // Lunes = 0

    var daysInCurrentMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
    var daysInPrevMonth = new Date(calCurrentYear, calCurrentMonth, 0).getDate();

    // Días del mes anterior para rellenar
    for (var p = startingDay - 1; p >= 0; p--) {
        var prevDateNum = daysInPrevMonth - p;
        var prevDate = new Date(calCurrentYear, calCurrentMonth - 1, prevDateNum);
        grid.appendChild(createCalCell(prevDate, true, todayStr, weekRange));
    }

    // Días del mes actual
    for (var d = 1; d <= daysInCurrentMonth; d++) {
        var curDate = new Date(calCurrentYear, calCurrentMonth, d);
        grid.appendChild(createCalCell(curDate, false, todayStr, weekRange));
    }

    // Días del mes siguiente para completar cuadrícula
    var totalRendered = startingDay + daysInCurrentMonth;
    var remaining = (totalRendered % 7 === 0) ? 0 : 7 - (totalRendered % 7);
    for (var n = 1; n <= remaining; n++) {
        var nextDate = new Date(calCurrentYear, calCurrentMonth + 1, n);
        grid.appendChild(createCalCell(nextDate, true, todayStr, weekRange));
    }

    // Renderizar panel lateral
    renderSelectedDayPanel();
    // Renderizar resumen global de tareas (solo lectura)
    renderCalendarSummary();
    // Renderizar tareas de hoy en dashboard (solo lectura)
    renderDashboardTodayTasks();
}

function createCalCell(dateObj, isOtherMonth, todayStr, weekRange) {
    var cell = document.createElement("div");
    cell.className = "cal-day-cell";
    if (isOtherMonth) { cell.className += " other-month"; }

    var dateStr = formatDateISO(dateObj);

    if (dateStr === todayStr) {
        cell.className += " today";
    }

    // Resaltar semana actual
    var checkTime = dateObj.getTime();
    if (checkTime >= weekRange.start.getTime() && checkTime <= weekRange.end.getTime()) {
        cell.className += " current-week";
    }

    if (dateStr === selectedDateStr) {
        cell.className += " selected";
    }

    var btn = document.createElement("button");
    btn.className = "cal-day-btn";
    btn.type = "button";

    var numSpan = document.createElement("span");
    numSpan.className = "day-number";
    numSpan.textContent = dateObj.getDate();
    btn.appendChild(numSpan);

    // Indicador si hay tareas en ese día
    if (calendarTasks[dateStr] && calendarTasks[dateStr].length > 0) {
        var badge = document.createElement("span");
        badge.className = "day-task-badge";
        btn.appendChild(badge);
    }

    btn.addEventListener("click", function () {
        selectedDateStr = dateStr;
        renderCalendar();
    });

    cell.appendChild(btn);
    return cell;
}

function renderSelectedDayPanel() {
    var title = document.getElementById("selected-day-title");
    var subtitle = document.getElementById("selected-day-subtitle");
    var list = document.getElementById("day-task-list");
    var empty = document.getElementById("day-task-empty");

    list.innerHTML = "";

    if (!selectedDateStr) {
        title.textContent = "Selecciona un día";
        subtitle.textContent = "Para ver o programar notas";
        empty.style.display = "block";
        empty.textContent = "Toca cualquier día del calendario para gestionarlo.";
        return;
    }

    var parts = selectedDateStr.split("-");
    var dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    var dayName = DAY_NAMES[dateObj.getDay()];

    title.textContent = dayName + " " + dateObj.getDate() + " de " + MONTH_NAMES[dateObj.getMonth()];
    subtitle.textContent = "Notas y tareas (" + selectedDateStr + ")";

    var dayList = calendarTasks[selectedDateStr] || [];

    if (dayList.length === 0) {
        empty.style.display = "block";
        empty.textContent = "No hay notas añadidas para este día.";
        return;
    }

    empty.style.display = "none";

    for (var i = 0; i < dayList.length; i++) {
        (function (idx) {
            var item = document.createElement("li");
            item.className = "todo-item" + (dayList[idx].done ? " done" : "");

            var label = document.createElement("label");
            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = dayList[idx].done;

            checkbox.addEventListener("change", function () {
                dayList[idx].done = checkbox.checked;
                saveCalendarTasks();
                renderSelectedDayPanel();
                renderCalendarSummary();
                renderDashboardTodayTasks();
            });

            var text = document.createElement("span");
            text.textContent = dayList[idx].text;

            label.appendChild(checkbox);
            label.appendChild(text);

            var deleteButton = document.createElement("button");
            deleteButton.className = "delete";
            deleteButton.type = "button";
            deleteButton.textContent = "×";

            deleteButton.addEventListener("click", function () {
                dayList.splice(idx, 1);
                if (dayList.length === 0) {
                    delete calendarTasks[selectedDateStr];
                }
                saveCalendarTasks();
                renderCalendar();
            });

            item.appendChild(label);
            item.appendChild(deleteButton);
            list.appendChild(item);
        })(i);
    }
}

document.getElementById("day-task-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!selectedDateStr) { return; }

    var input = document.getElementById("day-task-input");
    var text = input.value.trim();
    if (!text) { return; }

    if (!calendarTasks[selectedDateStr]) {
        calendarTasks[selectedDateStr] = [];
    }

    calendarTasks[selectedDateStr].push({ text: text, done: false });
    saveCalendarTasks();
    input.value = "";

    renderCalendar();
});

// Navegación de mes
document.getElementById("cal-prev-btn").addEventListener("click", function () {
    calCurrentMonth--;
    if (calCurrentMonth < 0) {
        calCurrentMonth = 11;
        calCurrentYear--;
    }
    renderCalendar();
});

document.getElementById("cal-next-btn").addEventListener("click", function () {
    calCurrentMonth++;
    if (calCurrentMonth > 11) {
        calCurrentMonth = 0;
        calCurrentYear++;
    }
    renderCalendar();
});

function renderCalendarSummary() {
    var container = document.getElementById("cal-summary-list");
    var empty = document.getElementById("cal-summary-empty");
    var countEl = document.getElementById("cal-summary-count");
    if (!container) { return; }

    container.innerHTML = "";

    var dates = [];
    for (var dateKey in calendarTasks) {
        if (calendarTasks.hasOwnProperty(dateKey)) {
            if (calendarTasks[dateKey] && calendarTasks[dateKey].length > 0) {
                dates.push(dateKey);
            }
        }
    }

    dates.sort();

    var totalTasks = 0;
    for (var i = 0; i < dates.length; i++) {
        totalTasks += calendarTasks[dates[i]].length;
    }

    if (countEl) {
        countEl.textContent = totalTasks + (totalTasks === 1 ? " tarea" : " tareas");
    }

    if (dates.length === 0) {
        if (empty) { empty.style.display = "block"; }
        return;
    }

    if (empty) { empty.style.display = "none"; }

    var today = new Date();
    var todayStr = formatDateISO(today);

    for (var d = 0; d < dates.length; d++) {
        (function (dateStr) {
            var taskList = calendarTasks[dateStr];
            var parts = dateStr.split("-");
            var dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            var dayName = DAY_NAMES[dateObj.getDay()];
            var monthName = MONTH_NAMES[dateObj.getMonth()];

            var card = document.createElement("div");
            card.className = "cal-summary-card";
            if (dateStr === todayStr) {
                card.className += " is-today";
            }
            if (dateStr === selectedDateStr) {
                card.className += " is-selected";
            }

            var header = document.createElement("div");
            header.className = "cal-summary-card-header";

            var dateTitle = document.createElement("div");
            dateTitle.className = "cal-summary-card-date";
            var dateFormatted = dayName + ", " + dateObj.getDate() + " de " + monthName;
            if (dateObj.getFullYear() !== today.getFullYear()) {
                dateFormatted += " " + dateObj.getFullYear();
            }
            dateTitle.textContent = dateFormatted;
            header.appendChild(dateTitle);

            if (dateStr === todayStr) {
                var badge = document.createElement("span");
                badge.className = "cal-summary-badge-today";
                badge.textContent = "Hoy";
                header.appendChild(badge);
            }

            card.appendChild(header);

            var ul = document.createElement("ul");
            ul.className = "cal-summary-task-list";

            for (var t = 0; t < taskList.length; t++) {
                var taskItem = taskList[t];
                var li = document.createElement("li");
                li.className = "cal-summary-task-item" + (taskItem.done ? " done" : "");

                var bullet = document.createElement("span");
                bullet.className = "cal-summary-bullet";
                bullet.textContent = taskItem.done ? "✓" : "•";

                var textSpan = document.createElement("span");
                textSpan.className = "cal-summary-task-text";
                textSpan.textContent = taskItem.text;

                li.appendChild(bullet);
                li.appendChild(textSpan);
                ul.appendChild(li);
            }

            card.appendChild(ul);

            card.addEventListener("click", function () {
                selectedDateStr = dateStr;
                var clickedParts = dateStr.split("-");
                var targetYear = parseInt(clickedParts[0], 10);
                var targetMonth = parseInt(clickedParts[1], 10) - 1;
                if (calCurrentYear !== targetYear || calCurrentMonth !== targetMonth) {
                    calCurrentYear = targetYear;
                    calCurrentMonth = targetMonth;
                }
                renderCalendar();
            });

            container.appendChild(card);
        })(dates[d]);
    }
}

// Inicializar fecha y mes
var initDate = new Date();
calCurrentYear = initDate.getFullYear();
calCurrentMonth = initDate.getMonth();
selectedDateStr = formatDateISO(initDate);
loadCalendarTasks();
renderCalendarSummary();

/* ==========================================================================
   6. ALTERNAR ENTRE VISTA DASHBOARD Y VISTA CALENDARIO
   ========================================================================== */
var currentView = "dashboard";
var viewDashboard = document.getElementById("view-dashboard");
var viewCalendar = document.getElementById("view-calendar");
var toggleBtn = document.getElementById("toggle-view-btn");
var toggleText = document.getElementById("toggle-text");
var toggleIcon = document.getElementById("toggle-icon");

toggleBtn.addEventListener("click", function () {
    if (currentView === "dashboard") {
        currentView = "calendar";
        viewDashboard.className = "dashboard-view";
        viewCalendar.className = "calendar-view active";
        toggleText.textContent = "Ver Dashboard";
        // toggleIcon.textContent = "🕒";
        renderCalendar();
    } else {
        currentView = "dashboard";
        viewCalendar.className = "calendar-view";
        viewDashboard.className = "dashboard-view active";
        toggleText.textContent = "Ver Calendario";
        // toggleIcon.textContent = "📅";
        renderDashboardTodayTasks();
    }
});

/* ==========================================================================
   7. SCREEN SAVER (GLOBAL PARA CUALQUIER VISTA)
   ========================================================================== */
var lastInteraction = new Date().getTime();
var SCREEN_SAVER_DELAY = 5 * 60 * 1000;
var screensaver = document.getElementById("screensaver");
var screensaverClock = document.getElementById("screensaver-clock");

function registerInteraction() {
    lastInteraction = new Date().getTime();
    screensaver.className = "screensaver";
}

document.addEventListener("touchstart", registerInteraction, false);
document.addEventListener("click", registerInteraction, false);
document.addEventListener("mousemove", registerInteraction, false);

setInterval(function () {
    var now = new Date().getTime();
    if (now - lastInteraction > SCREEN_SAVER_DELAY) {
        screensaver.className = "screensaver active";
    }
}, 60 * 1000);

function updateScreensaver() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }

    screensaverClock.textContent = hours + ":" + minutes;

    var seconds = now.getSeconds();
    var offset = Math.sin(seconds / 10) * 4;
    screensaverClock.style.transform = "translateX(" + offset + "px)";
}

updateScreensaver();
setInterval(updateScreensaver, 1000);

/* ==========================================================================
   8. MODO OSCURO / MODO CLARO (THEME TOGGLE)
   Compatible con Android 7 y navegadores antiguos.
   ========================================================================== */
var THEME_KEY = "desk-dashboard-theme-v1";
var currentTheme = "dark";
var themeToggleBtn = document.getElementById("toggle-theme-btn");
var metaThemeColor = document.getElementById("meta-theme-color");
var metaColorScheme = document.getElementById("meta-color-scheme");

function applyTheme(theme) {
    currentTheme = theme;
    var htmlEl = document.documentElement;
    var bodyEl = document.body;

    if (theme === "light") {
        if (htmlEl.classList) {
            htmlEl.classList.add("light-theme");
            if (bodyEl) { bodyEl.classList.add("light-theme"); }
        } else {
            if (htmlEl.className.indexOf("light-theme") === -1) {
                htmlEl.className = (htmlEl.className + " light-theme").trim();
            }
            if (bodyEl && bodyEl.className.indexOf("light-theme") === -1) {
                bodyEl.className = (bodyEl.className + " light-theme").trim();
            }
        }

        if (metaThemeColor) { metaThemeColor.setAttribute("content", "#f3f5f6"); }
        if (metaColorScheme) { metaColorScheme.setAttribute("content", "light"); }
        if (themeToggleBtn) {
            themeToggleBtn.setAttribute("aria-label", "Cambiar a modo oscuro");
            themeToggleBtn.setAttribute("title", "Cambiar a modo oscuro");
        }
    } else {
        if (htmlEl.classList) {
            htmlEl.classList.remove("light-theme");
            if (bodyEl) { bodyEl.classList.remove("light-theme"); }
        } else {
            htmlEl.className = htmlEl.className.replace(/\blight-theme\b/g, "").replace(/\s+/g, " ").trim();
            if (bodyEl) {
                bodyEl.className = bodyEl.className.replace(/\blight-theme\b/g, "").replace(/\s+/g, " ").trim();
            }
        }

        if (metaThemeColor) { metaThemeColor.setAttribute("content", "#050707"); }
        if (metaColorScheme) { metaColorScheme.setAttribute("content", "dark"); }
        if (themeToggleBtn) {
            themeToggleBtn.setAttribute("aria-label", "Cambiar a modo claro");
            themeToggleBtn.setAttribute("title", "Cambiar a modo claro");
        }
    }
}

function initTheme() {
    var savedTheme = null;
    try {
        savedTheme = localStorage.getItem(THEME_KEY);
    } catch (e) {}

    if (savedTheme === "light") {
        applyTheme("light");
    } else {
        applyTheme("dark");
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
        var nextTheme = (currentTheme === "dark") ? "light" : "dark";
        applyTheme(nextTheme);
        try {
            localStorage.setItem(THEME_KEY, nextTheme);
        } catch (e) {}
    });
}

initTheme();