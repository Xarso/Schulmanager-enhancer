let accentColorInput = document.querySelector('#accentColorInput')
let accentColorInput_transparent = document.querySelector('#accentColorInput_transparent')
let store_color_button = document.querySelector('.store-color-button')
let reset_accent_color_button = document.querySelector('.reset-button')


// Tab neu laden
function reloadTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.reload(tabs[0].id);
    });
}


// Gespeicherte Akzentfarbe beim Öffnen des Popups abrufen und als Wert des Input-Feldes setzen
chrome.storage.sync.get('accentColor', (data) => {
    if (data.accentColor) {
        accentColorInput.value = data.accentColor;
    }
});


chrome.storage.sync.get('accentColorTransparent', (data) => {
    if (data.accentColorTransparent) {
        accentColorInput_transparent.value = data.accentColorTransparent;
    }
});


// Akzentfarbe speichern, wenn der Nutzer was eingibt
store_color_button.addEventListener('click', () => {
    chrome.storage.sync.set({ accentColor: accentColorInput.value });
    chrome.storage.sync.set({ accentColorTransparent: accentColorInput_transparent.value });
    chrome.storage.sync.get('accentColor', (data) => {
        if (data.accentColor) {
            document.documentElement.style.setProperty('--accent-color', data.accentColor);
        }
    });

    chrome.storage.sync.get('accentColorTransparent', (data) => {
        if (data.accentColorTransparent) {
            document.documentElement.style.setProperty('--accent-color_transparency', data.accentColorTransparent);
        }
    });
    reloadTab()
});

// Die Akzentfarbe im Popup beim Laden einstellen
function setPopupColor() {
    chrome.storage.sync.get('accentColor', (data) => {
        if (data.accentColor) {
            document.documentElement.style.setProperty('--accent-color', data.accentColor);
        }
    });

    chrome.storage.sync.get('accentColorTransparent', (data) => {
        if (data.accentColorTransparent) {
            document.documentElement.style.setProperty('--accent-color_transparency', data.accentColorTransparent);
        }
    });
}
setPopupColor()

// Akzentfarbe zurücksetzen-button
reset_accent_color_button.addEventListener('click', () => {
    chrome.storage.sync.set({ accentColor: 'rgba(0,100,200,1)' });
    chrome.storage.sync.set({ accentColorTransparent: 'rgba(0,100,200,0.25)' });
    reloadTab()
    setPopupColor()
})

// Bundesland laden
chrome.storage.sync.get('bundesland', (data) => {
    if ('bundesland' in data) {
        let option = document.querySelector(`option[name="${data.bundesland}"]`)
        if (option) {
            option.setAttribute('selected', 'selected')
        }
    } else {
        chrome.storage.sync.set({ 'bundesland': 'NW' })
    }
})


// Eventlistener für den Speichern-Button für's Bundesland
const bl_selector = document.querySelector('.bl-selector')
const store_bl_button = document.querySelector('.store-bl-button')
store_bl_button.addEventListener('click', () => {
    let bl_full_name = bl_selector.value
    for (let bl of bl_selector.querySelectorAll('option')) {
        if (bl.innerHTML == bl_full_name) {
            chrome.storage.sync.set({ 'bundesland': bl.getAttribute('name') })
            reloadTab()
        }
    }
})


function setCountingStatus(counting) {
    let toToggle = [letzterSchultagCheckbox, ersterFerientagCheckbox, store_bl_button, bl_selector]
    for (let element of toToggle) {
        if (counting == true) {
            element.disabled = false
        } else {
            element.disabled = true
        }
    }
    if (counting == true) {
        store_bl_button.style.backgroundColor = 'var(--accent-color_transparency)'
        store_bl_button.style.border = '1px solid var(--accent-color)'
        store_bl_button.style.boxShaddow = 'var(--glossy-box-shaddow)'
    } else {
        store_bl_button.style.backgroundColor = `rgba(255,255,255,0.05)`
        store_bl_button.style.borderColor = `gray`
        store_bl_button.style.boxShaddow = `none`
    }
}

// Laden, ob der Zähler aktiv ist und Voreinstellung setzen
let zählerAktivCheckbox = document.querySelector('.counter_activation_input')
chrome.storage.sync.get('counter', (data) => {
    if (data.counter) {
        if (data['counter'] == "on") {
            zählerAktivCheckbox.checked = true
            setCountingStatus(true)
        }
        else if (data.counter == "off") {
            zählerAktivCheckbox.removeAttribute('checked')
            setCountingStatus(false)
        }
    }
    else {
        //chrome.storage.sync.set({'counter': "on"})
    }
})

zählerAktivCheckbox.addEventListener('click', () => {
    if (zählerAktivCheckbox.checked == true) {
        chrome.storage.sync.set({ 'counter': 'on' })
        setCountingStatus(true)
    }
    else {
        chrome.storage.sync.set({ 'counter': 'off' })
        setCountingStatus(false)
    }

})

// Laden, welches Ziel für 0 Tage eingestellt ist
let letzterSchultagCheckbox = document.querySelector('.letzterSchultagCheckbox')
let ersterFerientagCheckbox = document.querySelector('.ersterFerientagCheckbox')
try {
    chrome.storage.sync.get('countingTarget', (data) => {
        if (data.countingTarget) {
            if (data.countingTarget == 'letzterSchultag') {
                letzterSchultagCheckbox.checked = true
                ersterFerientagCheckbox.checked = false
            }
            else if (data.countingTarget == 'ersterFerientag') {
                ersterFerientagCheckbox.checked = true
                letzterSchultagCheckbox.checked = false
            }
        }
    })
}
catch { }


ersterFerientagCheckbox.addEventListener('click', function (e) {
    if (ersterFerientagCheckbox.checked) {
        letzterSchultagCheckbox.checked = false;
        chrome.storage.sync.set({ 'countingTarget': 'ersterFerientag' });
    } else if (!letzterSchultagCheckbox.checked) {
        e.preventDefault();
        ersterFerientagCheckbox.checked = true;
    }
});

letzterSchultagCheckbox.addEventListener('click', function (e) {
    if (letzterSchultagCheckbox.checked) {
        ersterFerientagCheckbox.checked = false;
        chrome.storage.sync.set({ 'countingTarget': 'letzterSchultag' });
    } else if (!ersterFerientagCheckbox.checked) {
        e.preventDefault();
        letzterSchultagCheckbox.checked = true;
    }
});