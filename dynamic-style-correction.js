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

// Fächer-Fliesen Fächer umbenennen / klarer benennen
function replaceSubjectTileTitle() {
    let all_subject_tiles = document.querySelectorAll("div.col-lg-3 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1)");
    if (all_subject_tiles) {
        let trigger_strings = ["Spanisch", "Sport", "Deutsch", "Englisch", "Biologie", "Chemie", "Mathematik", "Mathe", "Sozialwissenschaften", "SoWi", "Erdkunde", "Geographie", "Geografie", "Religion", "Philosophie", "Geschichte", "Literatur"];
        for (let subject_tile of all_subject_tiles) {
            for (let i = 0; i < trigger_strings.length; i++) {
                if (subject_tile.textContent.toLowerCase().includes(trigger_strings[i].toLocaleLowerCase())) {
                    subject_tile.innerHTML = trigger_strings[i];
                }
            }
        }
    } else {
        console.log("all_subject_titles nicht gefunden");
    }
}

// Seitenleiste einfügen und "Module" in die Seitenleiste verschieben
let sidebar_inserted = false;
function insertSidebar() {
    let parentContainer = document.querySelector(".container-fluid");
    let moduleContainer = document.querySelector(".module-overview");
    let newSidebar = document.createElement("div");
    let rightNavigation = document.querySelector("ul.right-navigation:nth-child(1)");
    let outerNavBar = document.querySelector(".sm-navbar");
    if (parentContainer && newSidebar) {
        let nsb = document.querySelector(".custom-sidebar");
        if (!nsb) {
            parentContainer.appendChild(newSidebar);
        }
    }

    try {
        if (moduleContainer) {
            newSidebar.appendChild(moduleContainer);
        }
        newSidebar.classList.add("custom-sidebar");
        outerNavBar.appendChild(rightNavigation);
        sidebar_inserted = true;
    } catch {}

    // Dashboard hinzufügen
    let listOfItems = document.querySelector(".module-overview.dropdown-menu");
    let dashBoard = document.createElement("div");
    dashBoard.setAttribute("_ngcontent-rcu-c98", "");
    dashBoard.innerHTML = `<a _ngcontent-rcu-c98="" ngbdropdownitem="" class="dropdown-item module-label" href="#/dashboard" tabindex="0">
    <span _ngcontent-rcu-c98="" class="fa fa-file fa-fw"></span>
    Dashboard
    </a>`;
    if (listOfItems) {
        listOfItems.prepend(dashBoard);
    }
    //if (path.includes("/#/dashboard")) {
    //    let aTag = dashBoard.querySelector("a");
    //    aTag.addEventListener("click", () => {
    //        aTag.classList.toggle("active");
    //    });
    //}
}

// Anhand der URI dem entsprechenden Item in der Seitenleiste die Klasse active hinzufügen
function setActiveModule() {
    let index = 0;

    let keyWords = ["dashboard", "documents/browse", "letters/view", "exams/view", "classbook", "sick", "learning/student//select-course", "messenger", "schedules/view//"];
    for (let i = 0; i < keyWords.length; i++) {
        if (path.includes(keyWords[i])) {
            index = i + 1;
        }
    }
    let allActiveDropdownItems = document.querySelectorAll("dropdown-item.module-label.active");
    allActiveDropdownItems.forEach((item, index) => {
        item.classList.remove("active");
    });
    let dashBoardItem = document.querySelector(`div.custom-sidebar > div > div:nth-child(${index}) > a`);
    if (dashBoardItem) {
        dashBoardItem.classList.add("active");
    }
}

async function main() {
    let backgroundURI = await getFromStorage("backgroundImage");

    async function observeMutations(selector, callback) {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === "childList") {
                    var nodes = Array.from(mutation.target.querySelectorAll(selector));
                    nodes.forEach(callback);
                }
            });
        });

        observer.observe(document, { childList: true, subtree: true });
    }

    observeMutations(".text-danger", (element) => {
        element.style = "color: var(--cancel-color) !important;";
    });

    observeMutations("#accountDropdown", (element) => {
        element.style.setProperty("background", "red", "!important");
    });
    observeMutations("body", (element) => {
        element.style.setProperty(`background`, `url(${backgroundURI})`);
        if (sidebar_inserted == false) {
            insertSidebar();
        }
        setActiveModule();
        replaceSmallHinUndHerWechsler();
    });

    observeMutations("div.row:nth-child(3)", (element) => {
        replaceSubjectTileTitle();
    });

    observeMutations(".module-overview.dropdown-menu", (element) => {
        replaceSmallHinUndHerWechsler();
    });
}
main();

window.addEventListener("popstate", function (event) {
    console.log("Die URL hat sich geändert: " + document.location);
    replaceHinUndHerWechsler();
    replaceSmallHinUndHerWechsler();
});

let smallBarInserted = false;
function replaceSmallHinUndHerWechsler() {
    if (smallBarInserted == false) {
        if (path.includes("modules/classbook/reports2/student")) {
            let oldCrapContainer = document.querySelector("ul.nav:nth-child(1)");
            if (oldCrapContainer) {
                oldCrapContainer.remove();
            }

            let newParent = document.querySelector("body > app-root > ui-view > ng-component > div > div.main-content > div > ng-component > ui-view > ng-component > ui-view > ng-component > ui-view > ng-component > div.d-flex.justify-content-end.mt-2");
            let newList = document.createElement("ul");
            newList.classList.add("custom-bar-small");

            let texts = ["Statistik", "Historie"];
            let hrefs = ["#/modules/classbook/reports2/student//statistics", "#/modules/classbook/reports2/student//history"];

            for (let i = 0; i < 2; i++) {
                let li = document.createElement("li");
                li.classList.add("custom-list-entry");
                let a = document.createElement("a");
                a.classList.add("custom-link");
                a.setAttribute("href", hrefs[i]);
                a.innerHTML = texts[i];
                if (i == 0 && path.includes("#/modules/classbook/reports2/student//statistics")) {
                    a.classList.add("active");
                }
                if (i == 1 && path.includes("#/modules/classbook/reports2/student//history")) {
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
                    setHighlighter(link, ".custom-bar-small");
                });
            });

            myLinks.forEach((item) => {
                if (item.classList.contains("active")) {
                    setHighlighter(item, ".custom-bar-small");
                }
            });
        }
        console.log("eingefügt");
    }
    smallBarInserted = true;
}
