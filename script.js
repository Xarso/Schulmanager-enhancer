let path = window.location.href;
let root = document.documentElement;

async function getFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[key]);
            }
        });
    });
}

function removeSidebar() {
    let csb = document.querySelector(".custom-sidebar");
    if (csb) {
        csb.remove();
    }
}

window.onload = () => {
    chrome.storage.sync.get(["accentColor", "accentColorTransparent"], (data) => {
        if (data.accentColor) {
            // Setze die Akzentfarbe auf der Seite
            document.documentElement.style.setProperty("--accent-color", data.accentColor);
            document.documentElement.style.setProperty("--accent-color", data.accentColor, "important");
        }
        if (data.accentColorTransparent) {
            // Setze die transparente Akzentfarbe auf der Seite
            document.documentElement.style.setProperty("--accent-color_transparency", data.accentColorTransparent);
            document.documentElement.style.setProperty("--accent-color_transparency", data.accentColorTransparent, "important");
        }
    });

    chrome.storage.sync.get("backgroundImage", (data) => {
        if (data.backgroundImage) {
            (document.body.style.backgroundImage = "url(" + data.backgroundImage + ")"), "important";
        }
    });
};

// Zum Berechnen (addieren, subtrahieren) von Datums-Werten. Die Methode wird als String angegeben. ("-", "+")
function changeDate(date_object, method, amount) {
    let newDate = new Date();
    if (method == "+") {
        newDate = date_object.setDate(date_object.getDate() + amount);
    } else if (method == "-") {
        newDate = date_object.setDate(date_object.getDate() - amount);
    } else {
        console.log("Fehler beim Rechnen mit dem Datum");
    }
    newDate = new Date(newDate).toISOString().slice(0, 10);
    return newDate;
}

function insertTitle(title) {
    let logoElement = document.querySelector(".logo");
    if (logoElement) {
        logoElement.classList.add("counter_title");
        logoElement.innerHTML = title;
    } else {
        setTimeout(function () {
            insertTitle(title);
        }, 500);
    }
}

class Vacations {
    constructor(vacationBlock, position) {
        this.name = vacationBlock[position]["name"][0]["text"];
        this.startDate = new Date(vacationBlock[position]["startDate"]);
        this.endDate = new Date(vacationBlock[position]["endDate"]);
    }

    leftDaysUntil(datum) {
        let date = new Date(datum);
        // Berechnen der Differenz in Millisekunden
        let diffInMs = this.startDate - date;
        
        // Konvertieren der Differenz in Tage
        let diffInTage = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        return diffInTage;
    }
}

// API fragen
let today = new Date();
let today_in_about_one_year = new Date();
async function ask_api() {
    let lastRequest = await getFromStorage("dateOfLastRequest");
    let bundesland = await getFromStorage("bundesland");
    let oldBundesland = await getFromStorage("lastBundeslandRequest");
    let requestData = await getFromStorage("requestData");
    let testVac;
    if (requestData) {
        testVac = new Vacations(requestData, 0);
    }
    today_in_about_one_year = changeDate(today_in_about_one_year, "+", 410);
    const api_url = `https://openholidaysapi.org/SchoolHolidays?countryIsoCode=DE&subdivisionCode=DE-${bundesland}&languageIsoCode=DE&validFrom=${today.toISOString().slice(0, 10)}&validTo=${today_in_about_one_year}`;
    if (lastRequest == undefined || bundesland != oldBundesland || testVac == undefined || today >= testVac.startDate) {
        let rawResponse = await fetch(api_url);
        let jsonResponse = await rawResponse.json();
        //let jsonResponse = JSON.parse(`[{"id":"505960fd-25cb-4742-983c-3e1326f42ad6","startDate":"2023-12-21","endDate":"2024-01-05","type":"School","name":[{"language":"DE","text":"Weihnachtsferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]},{"id":"a9dbc89b-166f-46d8-9de1-8faae01ecf07","startDate":"2024-03-25","endDate":"2024-04-06","type":"School","name":[{"language":"DE","text":"Osterferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]},{"id":"36e1ca93-0a45-4d24-b5ca-523fd854604c","startDate":"2024-05-21","endDate":"2024-05-21","type":"School","name":[{"language":"DE","text":"Pfingstferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]},{"id":"8c430e77-c97c-418e-b928-6da34af4dc8b","startDate":"2024-07-08","endDate":"2024-08-20","type":"School","name":[{"language":"DE","text":"Sommerferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]},{"id":"c6a32bf4-0f28-4872-8b2e-771e438ce06c","startDate":"2024-10-14","endDate":"2024-10-26","type":"School","name":[{"language":"DE","text":"Herbstferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]},{"id":"29bd10aa-e6b8-4760-a44e-6a88ab783f03","startDate":"2024-12-23","endDate":"2025-01-06","type":"School","name":[{"language":"DE","text":"Weihnachtsferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]}]`);
        chrome.storage.sync.set({ requestData: jsonResponse });
        chrome.storage.sync.set({ lastBundeslandRequest: bundesland });
        console.log("API angefragt");
        return jsonResponse;
    } else {
        let oldData = await getFromStorage("requestData");
        return oldData;
    }
}

async function ask_feiertag_api() {
    let bundesland = await getFromStorage("bundesland");
    console.log("Bundesland: " + bundesland.toLowerCase());
    let url = `https://get.api-feiertage.de/?states=${bundesland.toLowerCase()}`;
    let rawJson = await fetch(url);
    let jsonResponse = await rawJson.json();
    return jsonResponse;
}

let newBarInserted = false;
function setHighlighter(element, barSelector) {
    let myBar = document.querySelector(barSelector);
    let highlighter;
    if (myBar) {
        highlighter = myBar.querySelector(".highlighter");
    }
    let elementRect = element.getBoundingClientRect();
    let barRect = myBar.getBoundingClientRect();

    highlighter.style.left = `${elementRect.left - barRect.left - 1}px`;
    highlighter.style.width = `${elementRect.width}px`;
}
function replaceHinUndHerWechsler() {
    let oldCrapContainer = document.querySelector(".overview-navigation");
    if (oldCrapContainer) {
        oldCrapContainer.remove();
        let newParent = document.querySelector(".sm-navbar-content");
        let newList = document.createElement("ul");
        newList.classList.add("custom-bar");

        let texts = ["Unterrichtsinhalte", "Berichte", "Hausaufgaben"];
        let hrefs = ["#/modules/classbook/topics/", "#/modules/classbook/reports2/student//statistics", "#/modules/classbook/homework/"];
        for (let i = 0; i < 3; i++) {
            let li = document.createElement("li");
            li.classList.add("custom-list-entry");
            let a = document.createElement("a");
            a.classList.add("custom-link");
            a.setAttribute("href", hrefs[i]);
            a.innerHTML = texts[i];
            if (i == 0 && path.includes("#/modules/classbook/topics/")) {
                a.classList.add("active");
            }
            if (i == 1 && path.includes("#/modules/classbook/reports2/")) {
                a.classList.add("active");
            }
            if (i == 2 && path.includes("/#/modules/classbook/homework/")) {
                a.classList.add("active");
            }
            li.appendChild(a);
            let highlighter = document.createElement("div");
            highlighter.classList.add("highlighter");
            newList.appendChild(highlighter);
            newList.appendChild(li);
        }
        newParent.appendChild(newList);
        let myLinks = newList.querySelectorAll(".custom-link");
        myLinks.forEach((link) => {
            link.addEventListener("click", () => {
                myLinks.forEach((customLink) => {
                    if (customLink.classList.contains("active")) {
                        customLink.classList.remove("active");
                    }
                });
                link.classList.add("active");
                setHighlighter(link, ".custom-bar");
            });
        });

        myLinks.forEach((item) => {
            if (item.classList.contains("active")) {
                setHighlighter(item, ".custom-bar");
            }
        });
        newBarInserted = true;
    }
}

// Baut einen Titel mit Anpassungen an Kasus, Groß- und Kleinschreibung und Plural
function buildTitle(vacationName, leftDays, leftDaysS) {
    let titleTemplate;
    let zu_den_or_zum = "zu den";
    let to_replace = ["Unterrichtsfreier", "Schulfreier", "Variabler", "Zusätzlicher"];
    let to_replace_with = ["unterrichtsfreien", "schulfreien", "variablen", "zusätzlichen"];
    for (let i = 0; i < to_replace.length; i++) {
        if (vacationName.includes(to_replace[i])) {
            vacationName = vacationName.replace(to_replace[i], to_replace_with[i]);
            zu_den_or_zum = "zum";
        }
    }
    day = "Tage";
    if (leftDays == 1) {
        day = "Tag";
    }
    if (leftDays >= 0 && vacationName != "Sommerferien") {
        titleTemplate = `Bis ${zu_den_or_zum} ${vacationName}: ${leftDays} ${day}, bis zu den Sommerferien: ${leftDaysS} Tage`;
    } else if (vacationName == "Sommerferien") {
        if (leftDaysS == 1) {
            day = "Tag";
        }
        titleTemplate = `Bis zu den Sommerferien: ${leftDaysSommerferien} ${day}`;
    }
    return titleTemplate;
}

let title;
async function main() {
    let countingTarget = await getFromStorage("countingTarget");
    let counter = await getFromStorage("counter");

    // Placeholdertext auf Anmeldeformular einfügen
    function placeholderTextInserter() {
        let usernam_input = document.querySelector("#emailOrUsername");
        let password_input = document.querySelector("#password");
        if (usernam_input) {
            usernam_input.placeholder = "Nutzername";
        }
        if (password_input) {
            password_input.placeholder = "Passwort";
        }

        try {
            placeholderTextInserter();
        } catch {
            setTimeout(() => {
                placeholderTextInserter();
            }, 500);
        }
    }

    let sidebarInserted = false;
    function is_bar_still_there() {
        try {
            let sidebar = document.querySelector(".custom-sidebar");
            if (sidebar) {
                sidebarInserted = true;
            } else {
                //console.log("Sidebar nicht gefunden 1, Wert von sidebar: "+sidebar)
                if (!path.includes("/#/login") && sidebarInserted == false) {
                    //insertSidebar()
                }
            }

            let smallCustomBar = document.querySelector(".custom-bar-small");
            if (!smallCustomBar && path.includes("classbook/reports2/student")) {
                smallBarInserted = false;
            }
        } catch {
            //console.log("Sidebar nicht gefunden 2, Wert von sidebar: "+sidebar)
        }
    }

    function is_titel_still_there() {
        try {
            let titleBar = document.querySelector(".logo.counter_title");
            if (titleBar) {
            } else {
                if (counter == "on") {
                    insertTitle(title);
                }
            }
        } catch {}
    }

    // Schultagezähler
    if (counter == "on") {
        let apiData = await ask_api();
        let nextVacations;
        let nextSummerVacations;

        apiData.forEach((dataBlock, index) => {
            tempVac = new Vacations(apiData, index);
            if (index == 0 && tempVac.name == "Sommerferien") {
                nextSummerVacations = tempVac;
                nextVacations = tempVac;
            } else if (index == 0) {
                nextVacations = tempVac;
            } else {
                if (tempVac.name == "Sommerferien") {
                    nextSummerVacations = tempVac;
                }
            }
        });

        let leftDaysUntilNext;
        let leftDaysUntilNextS;
        if (countingTarget == "letzterSchultag") {
            leftDaysUntilNext = nextVacations.leftDaysUntil(today);
            leftDaysUntilNextS = nextSummerVacations.leftDaysUntil(today);
        } else {
            leftDaysUntilNext = nextVacations.leftDaysUntil(today) + 1;
            leftDaysUntilNextS = nextSummerVacations.leftDaysUntil(today) + 1;
        }

        if (nextVacations.startDate.getDay() == 1) {
            leftDaysUntilNext -= 2;
        }
        if (nextSummerVacations.startDate.getDay() == 1) {
            leftDaysUntilNextS -= 2;
        }

        async function feiertagRemover(vacations) {
            if (vacations.startDate.getDay != 1) {
                let feiertagData = await ask_feiertag_api();
                let possibleFeiertag = vacations.startDate;
                possibleFeiertag.setDate(possibleFeiertag.getDate() - 1);
                function dayMatcher(day) {
                    feiertagData.feiertage.forEach((feiertag, i) => {
                        let trueFeiertag = new Date(feiertag.date);
                        if (day.toISOString().slice(0, 10) == trueFeiertag.toISOString().slice(0, 10) || day.getDay() == 0 || day.getDay() == 6) {
                            possibleFeiertag.setDate(possibleFeiertag.getDate() - 1);
                            if (vacations.name == "Sommerferien") {
                                leftDaysUntilNextS -= 1;
                            } else {
                                leftDaysUntilNext -= 1;
                            }
                            dayMatcher(possibleFeiertag);
                        }
                    });
                }

                dayMatcher(possibleFeiertag);
            }
        }
        await feiertagRemover(nextVacations);
        await feiertagRemover(nextSummerVacations);
        if (nextVacations.name == "Sommerferien") {
            if (leftDaysUntilNextS == 1) {
                title = `Bis zu den Sommerferien: 1 Tag`;
            } else if (leftDaysUntilNextS > 1) {
                title = `Bis zu den Sommerferien: ${leftDaysUntilNextS} Tage`;
            }
        }
        title = buildTitle(nextVacations.name, leftDaysUntilNext, leftDaysUntilNextS);
        if (today > nextVacations.startDate && today < nextVacations.endDate) {
            if (today.toISOString().slice(0,10) == nextVacations.startDate.toISOString().slice(0,10) && countingTarget == "letzterSchultag"){
                title = title
            }
            else if (nextVacations.name == "Sommerferien") {
                title = "Sommerferien 😊";
            } else {
                title = "Ferien 😊";
            }
        }
        if (title == undefined){
            title = "Tragischer Fehler 😔"
        }
        insertTitle(title);
    }

    setInterval(() => {
        path = window.location.href;
        is_bar_still_there();
        is_titel_still_there();
        let csb = document.querySelector(".custom-sidebar"); // csb = custom sidebar
        if (!csb && !path.includes("/#/login") && !path.includes("/#/logged-out")) {
            insertSidebar();
            csb = document.querySelector(".custom-sidebar");
        }
        if (path.includes("/#/logged-out") || path.includes("/#/login")) {
            if (csb) {
                removeSidebar();
            }
        }
        let counterTitle = document.querySelector(".counter_title");
        let customBar = document.querySelector(".custom-bar");
        if (path.includes("/#/modules/classbook/")) {
            if (counterTitle) {
                counterTitle.style.display = "none";
            }
            if (newBarInserted == false) {
                replaceHinUndHerWechsler();
            } else {
                if (customBar) {
                    customBar.style.display = "flex";
                }
            }

            replaceSmallHinUndHerWechsler();
            if (path.includes("/#/modules/classbook/topics/")) {
                const a = document.querySelector(".custom-bar.custom-link:nth-child(1)");
                setHighlighter(a, ".custom-bar");
            }
        } else {
            if (counterTitle) {
                counterTitle.style.display = "flex";
                if (customBar) {
                    customBar.style.display = "none";
                }
            }
        }
    }, 250);
}

main();
