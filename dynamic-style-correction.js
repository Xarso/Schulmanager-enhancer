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
    let all_subject_tiles = document.querySelectorAll('div.col-lg-3 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > div:nth-child(1)')
    if (all_subject_tiles) {
        let trigger_strings = ['Spanisch', 'Sport', 'Deutsch', 'Englisch', 'Biologie', 'Chemie', 'Mathematik', 'Mathe', 'Sozialwissenschaften', 'SoWi', 'Erdkunde', 'Geographie', 'Geografie', 'Religion', 'Philosophie', 'Geschichte', 'Literatur']
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



async function main() {
    let backgroundURI = await getFromStorage("backgroundImage")

    async function observeMutations(selector, callback) {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList') {
                    var nodes = Array.from(mutation.target.querySelectorAll(selector));
                    nodes.forEach(callback);
                }
            });
        });

        observer.observe(document, { childList: true, subtree: true });
    }

    observeMutations('.text-danger', (element) => {
        element.style = 'color: var(--cancel-color) !important;';
    });

    observeMutations('#accountDropdown', (element) => {
        element.style.setProperty("background", "red", "!important")
    })
    observeMutations('body', (element) => {
        element.style.setProperty(`background`, `url(${backgroundURI})`)
    })

    observeMutations("div.row:nth-child(3)", (element) => {
        replaceSubjectTileTitle();
    })

}
main()

window.addEventListener('popstate', function(event) {
    console.log('Die URL hat sich geändert: ' + document.location);
    replaceHinUndHerWechsler()
});
