let path = window.location.href;

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

// Seitenleiste einfügen und "Module" in die Seitenleiste verschieben
function insertSidebar() {
    let parentContainer = document.querySelector('.container-fluid');
    let moduleContainer = document.querySelector('.module-overview');
    /*if (!moduleContainer) {
        setTimeout(() => {
            if (!path.includes('/#/login')){
                insertSidebar();
            }
        }, 250)
    }*/
    let newSidebar = document.createElement('div');
    let rightNavigation = document.querySelector('ul.right-navigation:nth-child(1)');
    let outerNavBar = document.querySelector('.sm-navbar');
    parentContainer.appendChild(newSidebar);
    newSidebar.classList.add('custom-sidebar');
    if (moduleContainer){
        newSidebar.appendChild(moduleContainer);
    }
    outerNavBar.appendChild(rightNavigation);

    // Dashboard hinzufügen
    let listOfItems = document.querySelector('.module-overview.dropdown-menu');
    let dashBoard = document.createElement('div');
    dashBoard.setAttribute('_ngcontent-rcu-c98', '')
    dashBoard.innerHTML = `<a _ngcontent-rcu-c98="" ngbdropdownitem="" class="dropdown-item module-label" href="#/dashboard" tabindex="0">
      <span _ngcontent-rcu-c98="" class="fa fa-file fa-fw"></span>
      Dashboard
    </a>`
    listOfItems.prepend(dashBoard)
    if (path.includes('/#/dashboard')) {
        let aTag = dashBoard.querySelector('a')
        aTag.addEventListener('click', () => {
            aTag.classList.toggle('active')
        })
    }
}


function removeSidebar() {
    let csb = document.querySelector('.custom-sidebar')
    if (csb) {
       csb.remove()
    }
}

// Highlighting der Einträge in der Seitenleiste
function updateEventListeners() {
    let dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach((item) => {
        item.addEventListener('click', () => {
            dropdownItems.forEach((generalItem) => {
                if (generalItem.classList.contains('active')) {
                    generalItem.classList.remove('active')
                }
            })
            item.classList.add('active')
        })
    })
}
updateEventListeners()


window.onload = () => {
    chrome.storage.sync.get(['accentColor', 'accentColorTransparent'], (data) => {
        if (data.accentColor) {
            // Setze die Akzentfarbe auf der Seite
            document.documentElement.style.setProperty('--accent-color', data.accentColor);
            document.documentElement.style.setProperty('--accent-color', data.accentColor, 'important');
        }
        if (data.accentColorTransparent) {
            // Setze die transparente Akzentfarbe auf der Seite
            document.documentElement.style.setProperty('--accent-color_transparency', data.accentColorTransparent);
            document.documentElement.style.setProperty('--accent-color_transparency', data.accentColorTransparent, 'important');
        }
    });
}

// Zum Berechnen (addieren, subtrahieren) von Datums-Werten. Die Methode wird als String angegeben. ("-", "+")
function changeDate(date_object, method, amount) {
    let newDate = new Date()
    if (method == '+') {
        newDate = date_object.setDate(date_object.getDate() + amount)
    }
    else if (method == '-') {
        newDate = date_object.setDate(date_object.getDate() - amount)
    }
    else {
        console.log('Fehler beim Rechnen mit dem Datum')
    }
    newDate = new Date(newDate).toISOString().slice(0, 10)
    return newDate
}

function insertTitle(title) {
    let logoElement = document.querySelector('.logo');
    if (logoElement) {
        logoElement.classList.add('counter_title')
        logoElement.innerHTML = title;
    } else {
        setTimeout(function () {
            insertTitle(title);
        }, 500);
    }
}


// API fragen
let today = new Date();
let today_in_about_one_year = new Date();
async function ask_api() {
    let lastRequest = getFromStorage("dateOfLastRequest")
    let bundesland = await getFromStorage("bundesland");
    let lastBundeslandRequest = await getFromStorage("lastBundeslandRequest")
    today_in_about_one_year = changeDate(today_in_about_one_year, "+", 410);
    const api_url = `https://openholidaysapi.org/SchoolHolidays?countryIsoCode=DE&subdivisionCode=DE-${bundesland}&languageIsoCode=DE&validFrom=${today.toISOString().slice(0, 10)}&validTo=${today_in_about_one_year}`;
    if (today >= lastRequest || lastRequest == undefined || lastBundeslandRequest == undefined || lastBundeslandRequest != bundesland){
        let rawResponse = await fetch(api_url);
        let jsonResponse = await rawResponse.json();
        //let jsonResponse = JSON.parse(`[{"id":"505960fd-25cb-4742-983c-3e1326f42ad6","startDate":"2023-12-21","endDate":"2024-01-05","type":"School","name":[{"language":"DE","text":"Weihnachtsferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]},{"id":"a9dbc89b-166f-46d8-9de1-8faae01ecf07","startDate":"2024-03-25","endDate":"2024-04-06","type":"School","name":[{"language":"DE","text":"Osterferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]},{"id":"36e1ca93-0a45-4d24-b5ca-523fd854604c","startDate":"2024-05-21","endDate":"2024-05-21","type":"School","name":[{"language":"DE","text":"Pfingstferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]},{"id":"8c430e77-c97c-418e-b928-6da34af4dc8b","startDate":"2024-07-08","endDate":"2024-08-20","type":"School","name":[{"language":"DE","text":"Sommerferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]},{"id":"c6a32bf4-0f28-4872-8b2e-771e438ce06c","startDate":"2024-10-14","endDate":"2024-10-26","type":"School","name":[{"language":"DE","text":"Herbstferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]},{"id":"29bd10aa-e6b8-4760-a44e-6a88ab783f03","startDate":"2024-12-23","endDate":"2025-01-06","type":"School","name":[{"language":"DE","text":"Weihnachtsferien"}],"nationwide":false,"subdivisions":[{"code":"DE-NW","shortName":"NW"}]}]`);
        chrome.storage.sync.set({requestData: jsonResponse})
        chrome.storage.sync.set({lastBundeslandRequest: bundesland})
        console.log("API angefragt");
        return jsonResponse;
    }else{
        let oldData = await getFromStorage("requestData")
        return oldData
    }


}


class Vacations {
    constructor(vacationBlock, position) {
        this.name = vacationBlock[position]['name'][0]['text']
        this.startDate = new Date(vacationBlock[position]['startDate'])
        this.endDate = new Date(vacationBlock[position]['endDate'])
    }

    leftDaysUntil(datum) {
        let date = new Date(datum)

        // Berechnen der Differenz in Millisekunden
        let diffInMs = this.startDate - date

        // Konvertieren der Differenz in Tage
        let diffInTage = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        return diffInTage;
    }
}


// Baut einen Titel mit Anpassungen an Kasus, Groß- und Kleinschreibung und Plural
function buildTitle(vacationName, leftDays, leftDaysS) {
    let titleTemplate;
    let zu_den_or_zum = "zu den";
    let to_replace = ['Unterrichtsfreier', 'Schulfreier', 'Variabler', 'Zusätzlicher'];
    let to_replace_with = ['unterrichtsfreien', 'schulfreien', 'variablen', 'zusätzlichen'];
    for (let i = 0; i < to_replace.length; i++) {
        if (vacationName.includes(to_replace[i])) {
            vacationName = vacationName.replace(to_replace[i], to_replace_with[i])
            zu_den_or_zum = "zum"
        }
    }
    day = "Tage"
    if (leftDays == 1) {
        day = "Tag"
    }
    if (leftDays > 0 && vacationName != "Sommerferien") {
        titleTemplate = `Bis ${zu_den_or_zum} ${vacationName}: ${leftDays} ${day}, bis zu den Sommerferien: ${leftDaysS} Tage`
    } else if (vacationName == "Sommerferien") {
        if (leftDaysS == 1) {
            day = "Tag"
        }
        titleTemplate = `Bis zu den Sommerferien: ${leftDaysSommerferien} ${day}`
    }
    return titleTemplate
}

let title;
async function main() {
    let countingTarget = await getFromStorage("countingTarget");
    let counter = await getFromStorage("counter");

    // Placeholdertext auf Anmeldeformular einfügen
    function placeholderTextInserter() {
        let usernam_input = document.querySelector('#emailOrUsername')
        let password_input = document.querySelector('#password')
        if (usernam_input) {
            usernam_input.placeholder = 'Nutzername'
        }
        if (password_input) {
            password_input.placeholder = 'Passwort'
        }

        try {
            placeholderTextInserter()
        } catch {
            setTimeout(() => {
                placeholderTextInserter()
            }, 500);
        }

    }


    // Fächer-Fliesen Fächer umbenennen / klarer benennen
    function replaceSubjectTileTitle() {
        let all_subject_tiles = document.querySelectorAll('div.col-lg-3 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1)')
        if (all_subject_tiles) {
            let trigger_strings = ['Spanisch', 'Sport', 'Deutsch', 'Englisch', 'Biologie', 'Chemie', 'Mathe', 'Mathematik', 'Sozialwissenschaften', 'SoWi', 'Erdkunde', 'Geographie', 'Geografie', 'Religion', 'Philosophie', 'Geschichte']
            for (let subject_tile of all_subject_tiles) {
                for (let i = 0; i < trigger_strings.length; i++) {
                    if (subject_tile.textContent.toLowerCase().includes(trigger_strings[i].toLocaleLowerCase())) {
                        subject_tile.innerHTML = trigger_strings[i]

                    }
                }
            }
        } else {
            console.log("all_subject_titles nicht gefunden")
        }
    }

    let sidebarInserted = false
    function is_sidebar_still_there() {
        try {
            let sidebar = document.querySelector('.custom-sidebar')
            if (sidebar) {
                sidebarInserted = true
            }
            else {
                //console.log("Sidebar nicht gefunden 1, Wert von sidebar: "+sidebar)
                if (!path.includes('/#/login') && sidebarInserted == false) {
                    insertSidebar()
                    updateEventListeners()
                }
            }
        }
        catch {
            //console.log("Sidebar nicht gefunden 2, Wert von sidebar: "+sidebar)
        }
    }


    // Schultagezähler
    if (counter == "on") {
        let apiData = await ask_api();
        let nextVacations;
        let nextSummerVacations;

        apiData.forEach((dataBlock, index) => {
            tempVac = new Vacations(apiData, index)
            if (index == 0 && tempVac.name == "Sommerferien") {
                nextSummerVacations = tempVac;
                nextVacations = tempVac;
            } else if (index == 0) {
                nextVacations = tempVac
            } else {
                if (tempVac.name == "Sommerferien") {
                    nextSummerVacations = tempVac
                }
            }
        })

        let leftDaysUntilNext;
        let leftDaysUntilNextS;
        if (countingTarget == "letzterSchultag") {
            leftDaysUntilNext = nextVacations.leftDaysUntil(today)
            leftDaysUntilNextS = nextSummerVacations.leftDaysUntil(today)
        } else {
            leftDaysUntilNext = nextVacations.leftDaysUntil(today) + 1
            leftDaysUntilNextS = nextSummerVacations.leftDaysUntil(today) + 1
        }

        if (nextVacations.startDate.getDay() == 1) {
            leftDaysUntilNext -= 2
        }
        if (nextSummerVacations.startDate.getDay() == 1) {
            leftDaysUntilNextS -= 2
        }

        if (nextVacations.name == "Sommerferien") {
            if (leftDaysUntilNextS == 1) {
                title = `Bis zu den Sommerferien: 1 Tag`
            } else if (leftDaysUntilNextS > 1) {
                title = `Bis zu den Sommerferien: ${leftDaysUntilNextS} Tage`
            }
        }
        title = buildTitle(nextVacations.name, leftDaysUntilNext, leftDaysUntilNextS)
        if (today > nextVacations.startDate && today < nextVacations.endDate) {
            if (nextVacations.name == "Sommerferien") {
                title = "Sommerferien 😊"
            } else {
                title = "Ferien 😊"
            }
        }
        insertTitle(title)
    }


    setInterval(() => {
        path = window.location.href;
        is_sidebar_still_there()
        let csb = document.querySelector('.custom-sidebar')  // csb = custom sidebar
        if (!csb && !path.includes("/#/login") && !path.includes("/#/logged-out")){
            console.log("Pfad: "+path)
            insertSidebar()
            csb = document.querySelector('.custom-sidebar')
        }
        if (path.includes('/#/modules/learning/student//select-course' || path.includes('/#/modules/learning/teacher//select-course'))) {
            replaceSubjectTileTitle();
        }
        if (path.includes('/#/logged-out') || path.includes('/#/login')) {
            if (csb){
                removeSidebar()
            }
        }
        let counterTitle = document.querySelector('.counter_title')
        if (path.includes('/#/modules/classbook/')) {
            if (counterTitle){
                counterTitle.style.display = "none"
            }
        } else {
            if (counterTitle){
                counterTitle.style.display = "flex"
            }
        }
    }, 500)

};


main();