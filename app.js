
/*
    DESK DASHBOARD

    Funciones:
    - Reloj
    - Fecha
    - Clima mediante Open-Meteo
    - Lista To-Do
    - Guardado local mediante localStorage
*/


/*
    CONFIGURACIÓN
*/

var CONFIG = {

    latitude: -36.6066,

    longitude: -72.1034,

    location: "Chillán · Chile",

    timezone: "America/Santiago"

};


/*
    ELEMENTOS HTML
*/

var clockElement = document.getElementById("clock");
var secondsElement = document.getElementById("seconds");
var dateElement = document.getElementById("date");


/*
    RELOJ
*/

function updateClock() {

    var now = new Date();


    /*
        Hora
    */

    var hours = now.getHours();

    var minutes = now.getMinutes();

    var seconds = now.getSeconds();


    /*
        Añadir cero delante
    */

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    if (seconds < 10) {
        seconds = "0" + seconds;
    }


    clockElement.textContent =
        hours + ":" + minutes;


    secondsElement.textContent =
        seconds;


    /*
        Fecha
    */

    var days = [
        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado"
    ];


    var months = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre"
    ];


    var dateText =
        days[now.getDay()] +
        ", " +
        now.getDate() +
        " de " +
        months[now.getMonth()];


    dateElement.textContent = dateText;

}


/*
    Actualizar inmediatamente
*/

updateClock();


/*
    Actualizar cada segundo
*/

setInterval(updateClock, 1000);



/*
    CÓDIGOS METEOROLÓGICOS
    Open-Meteo
*/

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



/*
    OBTENER CLIMA
*/

function loadWeather() {

    var url =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=" + CONFIG.latitude +
        "&longitude=" + CONFIG.longitude +
        "&current=temperature_2m,apparent_temperature,weather_code" +
        "&timezone=" + CONFIG.timezone +
        "&temperature_unit=celsius";


    var request = new XMLHttpRequest();


    request.open("GET", url, true);


    request.onreadystatechange = function () {

        if (request.readyState !== 4) {
            return;
        }


        if (request.status !== 200) {

            showWeatherError();

            return;
        }


        try {

            var data =
                JSON.parse(request.responseText);


            displayWeather(data);

        }

        catch (error) {

            showWeatherError();

        }

    };


    request.send();

}



/*
    MOSTRAR CLIMA
*/

function displayWeather(data) {

    var current = data.current;


    var code =
        current.weather_code;


    var info =
        weatherCodes[code];


    if (!info) {

        info = ["☁", "Condición desconocida"];

    }


    document.getElementById(
        "weather-icon"
    ).textContent = info[0];


    document.getElementById(
        "temperature"
    ).textContent =
        Math.round(current.temperature_2m) + "°";


    document.getElementById(
        "condition"
    ).textContent = info[1];


    document.getElementById(
        "feels-like"
    ).textContent =
        "Sensación " +
        Math.round(current.apparent_temperature) +
        "°";


    document.getElementById(
        "weather-updated"
    ).textContent =
        "Clima actualizado " +
        getCurrentTime();

}



/*
    ERROR DE CLIMA
*/

function showWeatherError() {

    document.getElementById(
        "weather-icon"
    ).textContent = "—";


    document.getElementById(
        "temperature"
    ).textContent = "--°";


    document.getElementById(
        "condition"
    ).textContent =
        "No se pudo actualizar el clima";


    document.getElementById(
        "weather-updated"
    ).textContent =
        "Sin conexión al servicio meteorológico";

}



/*
    HORA PARA EL FOOTER
*/

function getCurrentTime() {

    var now = new Date();

    var hours = now.getHours();

    var minutes = now.getMinutes();


    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }


    return hours + ":" + minutes;

}


/*
    Cargar clima
*/

loadWeather();


/*
    Actualizar clima cada 30 minutos
*/

setInterval(
    loadWeather,
    30 * 60 * 1000
);


/*
    Botón actualizar
*/

document.getElementById(
    "refresh-weather"
).addEventListener(
    "click",
    loadWeather
);



/*
    ============================
    TODO
    ============================
*/


var TODO_KEY =
    "desk-dashboard-todos";


var todos = [];


/*
    Cargar tareas guardadas
*/

function loadTodos() {

    try {

        var saved =
            localStorage.getItem(TODO_KEY);


        if (saved) {

            todos =
                JSON.parse(saved);

        }

    }

    catch (error) {

        todos = [];

    }


    renderTodos();

}


/*
    Guardar tareas
*/

function saveTodos() {

    try {

        localStorage.setItem(
            TODO_KEY,
            JSON.stringify(todos)
        );

    }

    catch (error) {

        /*
            Si localStorage no está disponible,
            simplemente continuamos sin guardar.
        */

    }

}


/*
    Dibujar tareas
*/

function renderTodos() {

    var list =
        document.getElementById("todo-list");


    var empty =
        document.getElementById("todo-empty");


    list.innerHTML = "";


    if (todos.length === 0) {

        empty.style.display = "block";

        return;

    }


    empty.style.display = "none";


    for (
        var i = 0;
        i < todos.length;
        i++
    ) {

        createTodoElement(
            todos[i],
            i,
            list
        );

    }

}


/*
    Crear elemento To-Do
*/

function createTodoElement(
    todo,
    index,
    list
) {

    var item =
        document.createElement("li");


    item.className =
        "todo-item";


    if (todo.done) {

        item.className += " done";

    }


    var label =
        document.createElement("label");


    var checkbox =
        document.createElement("input");


    checkbox.type = "checkbox";

    checkbox.checked =
        todo.done;


    checkbox.addEventListener(
        "change",
        function () {

            todos[index].done =
                checkbox.checked;


            saveTodos();

            renderTodos();

        }
    );


    var text =
        document.createElement("span");


    text.textContent =
        todo.text;


    label.appendChild(checkbox);

    label.appendChild(text);


    var deleteButton =
        document.createElement("button");


    deleteButton.className =
        "delete";


    deleteButton.textContent =
        "×";


    deleteButton.type =
        "button";


    deleteButton.addEventListener(
        "click",
        function () {

            todos.splice(index, 1);

            saveTodos();

            renderTodos();

        }
    );


    item.appendChild(label);

    item.appendChild(deleteButton);


    list.appendChild(item);

}



/*
    AGREGAR TAREA
*/

document.getElementById(
    "todo-form"
).addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        var input =
            document.getElementById(
                "todo-input"
            );


        var text =
            input.value.trim();


        if (!text) {

            return;

        }


        todos.push({

            text: text,

            done: false

        });


        saveTodos();

        renderTodos();


        input.value = "";

    }
);


/*
    Inicializar To-Do
*/

loadTodos();

