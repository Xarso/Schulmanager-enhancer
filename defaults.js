// Standard-Werte für persistente Werte festlegen
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.get("countingTarget", function (result) {
        // Überprüfen Sie, ob die Einstellung bereits gesetzt ist
        if (!result.countingTarget) {
            // Wenn nicht, setzen Sie den Standardwert
            chrome.storage.sync.set({ countingTarget: "letzterSchultag" });
        }
    });

    chrome.storage.sync.get("bundesland", function (result) {
        // Überprüfen Sie, ob die Einstellung bereits gesetzt ist
        if (!result.bundesland) {
            // Wenn nicht, setzen Sie den Standardwert
            chrome.storage.sync.set({ bundesland: "NW" });
        }
    });

    chrome.storage.sync.get("counter", function (result) {
        if (!result.counter) {
            chrome.storage.sync.set({ counter: "on" });
        }
    });

    chrome.storage.sync.get("requestData", (result) => {
        if (!result.requestData) {
            chrome.storage.sync.set({ requestData: undefined })
        }
    })


    chrome.storage.sync.get("dateOfLastRequest", (result) => {
        if (!result.dateOfLastRequest) {
            let today = new Date()
            chrome.storage.sync.set({dateOfLastRequest: today})
        }
    })


    chrome.storage.sync.get("lastBundeslandRequest", (result) => {
        if (!result.lastBundeslandRequest) {
            let today = new Date()
            chrome.storage.sync.set({lastBundeslandRequest: undefined})
        }
    })

    chrome.storage.sync.get("backgroundImage", (result) => {
        if (!result.backgroundImage){
            chrome.storage.sync.set({"backgroundImage": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2346&q=80"})
        }
    })
});