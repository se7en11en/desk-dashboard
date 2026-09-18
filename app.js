
/*
    DESK DASHBOARD V2

    Compatible con JavaScript antiguo.

    No utiliza:
    - frameworks
    - módulos
    - async/await
    - fetch
    - APIs modernas innecesarias
*/


/*
    ============================
    CONFIGURACIÓN
    ============================
*/

var CONFIG = {

    latitude: -36.6066,

    longitude: -72.1034,

    location: "Chillán · Chile",

    timezone: "America/Santiago"

};


/*
    ============================
    ELEMENTOS
    ============================
*/

var clockElement =
    document.getElementById("clock");

var secondsElement =
    document.getElementById("seconds");

var dateElement =
    document.getElementById("date");


/*
    ============================
    RELOJ
    ============================
*/

function updateClock() {

    var now = new Date();

    var hours =
        now.getHours();

    var minutes =
        now.getMinutes();

    var seconds =
        now.getSeconds();


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


    dateElement.textContent =

        days[now.getDay()] +
        ", " +
        now.getDate() +
        " de " +
        months[now.getMonth()];

}


updateClock();

setInterval(
    updateClock,
    1000
);



/*
    ============================
    CLIMA
    ============================
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
    Obtener clima mediante XHR.

    XMLHttpRequest se utiliza en lugar de fetch
    para mejorar compatibilidad con navegadores
    antiguos.
*/

function loadWeather() {

    var url =

        "https://api.open-meteo.com/v1/forecast" +

        "?latitude=" +
        CONFIG.latitude +

        "&longitude=" +
        CONFIG.longitude +

        "&current=" +
        "temperature_2m," +
        "apparent_temperature," +
        "weather_code" +

        "&timezone=" +
        CONFIG.timezone +

        "&temperature_unit=celsius";


    var request =
        new XMLHttpRequest();


    request.open(
        "GET",
        url,
        true
    );


    request.onreadystatechange =
        function () {

            if (
                request.readyState !== 4
            ) {

                return;

            }


            if (
                request.status !== 200
            ) {

                showWeatherError();

                return;

            }


            try {

                var data =
                    JSON.parse(
                        request.responseText
                    );


                displayWeather(data);

            }

            catch (error) {

                showWeatherError();

            }

        };


    request.send();

}


/*
    Mostrar clima
*/

function displayWeather(data) {

    var current =
        data.current;


    var info =
        weatherCodes[
            current.weather_code
        ];


    if (!info) {

        info = [
            "·",
            "Condición desconocida"
        ];

    }


    document.getElementById(
        "weather-icon"
    ).textContent =
        info[0];


    document.getElementById(
        "temperature"
    ).textContent =

        Math.round(
            current.temperature_2m
        ) + "°";


    document.getElementById(
        "condition"
    ).textContent =
        info[1];


    document.getElementById(
        "feels-like"
    ).textContent =

        "Sensación " +

        Math.round(
            current.apparent_temperature
        ) +

        "°";


    document.getElementById(
        "weather-updated"
    ).textContent =

        "Clima actualizado " +
        getCurrentTime();

}


/*
    Error de clima
*/

function showWeatherError() {

    document.getElementById(
        "weather-icon"
    ).textContent = "·";


    document.getElementById(
        "temperature"
    ).textContent = "--°";


    document.getElementById(
        "condition"
    ).textContent =
        "Clima no disponible";


    document.getElementById(
        "weather-updated"
    ).textContent =
        "Sin conexión";

}


/*
    Obtener hora
*/

function getCurrentTime() {

    var now =
        new Date();


    var hours =
        now.getHours();


    var minutes =
        now.getMinutes();


    if (hours < 10) {

        hours =
            "0" + hours;

    }


    if (minutes < 10) {

        minutes =
            "0" + minutes;

    }


    return hours + ":" + minutes;

}


loadWeather();


/*
    Actualizar cada 30 minutos.
*/

setInterval(

    loadWeather,

    30 * 60 * 1000

);


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
    "desk-dashboard-todos-v2";


var todos = [];


/*
    Cargar tareas
*/

function loadTodos() {

    try {

        var saved =
            localStorage.getItem(
                TODO_KEY
            );


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
    Guardar
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
            localStorage no disponible.
        */

    }

}


/*
    Dibujar lista
*/

function renderTodos() {

    var list =
        document.getElementById(
            "todo-list"
        );


    var empty =
        document.getElementById(
            "todo-empty"
        );


    list.innerHTML = "";


    if (todos.length === 0) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


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
    Crear tarea
*/

function createTodoElement(
    todo,
    index,
    list
) {

    var item =
        document.createElement(
            "li"
        );


    item.className =
        "todo-item";


    if (todo.done) {

        item.className +=
            " done";

    }


    var label =
        document.createElement(
            "label"
        );


    var checkbox =
        document.createElement(
            "input"
        );


    checkbox.type =
        "checkbox";


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
        document.createElement(
            "span"
        );


    text.textContent =
        todo.text;


    label.appendChild(
        checkbox
    );


    label.appendChild(
        text
    );


    var deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.className =
        "delete";


    deleteButton.type =
        "button";


    deleteButton.textContent =
        "×";


    deleteButton.addEventListener(
        "click",
        function () {

            todos.splice(
                index,
                1
            );


            saveTodos();

            renderTodos();

        }
    );


    item.appendChild(
        label
    );


    item.appendChild(
        deleteButton
    );


    list.appendChild(
        item
    );

}


/*
    Agregar tarea
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


loadTodos();



/*
    ============================
    SCREEN SAVER
    ============================

    Después de 30 minutos sin tocar
    la pantalla mostramos una versión
    extremadamente tenue del reloj.

    Esto NO reemplaza apagar la pantalla.
    Android debería seguir siendo el
    encargado de apagarla cuando sea
    posible.
*/


var lastInteraction =
    new Date().getTime();


var SCREEN_SAVER_DELAY =
    30 * 60 * 1000;


var screensaver =
    document.getElementById(
        "screensaver"
    );


var screensaverClock =
    document.getElementById(
        "screensaver-clock"
    );


function registerInteraction() {

    lastInteraction =
        new Date().getTime();


    screensaver.className =
        "screensaver";

}


/*
    Detectar interacción
*/

document.addEventListener(
    "touchstart",
    registerInteraction,
    false
);


document.addEventListener(
    "click",
    registerInteraction,
    false
);


document.addEventListener(
    "mousemove",
    registerInteraction,
    false
);


/*
    Comprobar cada minuto
*/

setInterval(
    function () {

        var now =
            new Date().getTime();


        if (
            now -
            lastInteraction
            >
            SCREEN_SAVER_DELAY
        ) {

            screensaver.className =
                "screensaver active";

        }

    },
    60 * 1000
);


/*
    Reloj del screen saver
*/

function updateScreensaver() {

    var now =
        new Date();


    var hours =
        now.getHours();


    var minutes =
        now.getMinutes();


    if (hours < 10) {

        hours =
            "0" + hours;

    }


    if (minutes < 10) {

        minutes =
            "0" + minutes;

    }


    screensaverClock.textContent =
        hours + ":" + minutes;


    /*
        Movimiento extremadamente lento.

        Evita mantener exactamente los
        mismos píxeles durante horas.
    */

    var seconds =
        now.getSeconds();


    var offset =
        Math.sin(
            seconds / 10
        ) * 4;


    screensaverClock.style.transform =
        "translateX(" +
        offset +
        "px)";

}


updateScreensaver();


setInterval(
    updateScreensaver,
    1000
);

