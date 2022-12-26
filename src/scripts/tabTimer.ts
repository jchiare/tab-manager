async function getAllTabsIdsOfWindow() {
    const queryOptions = { currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs.map(tab => tab.id);
}

async function scriptingFunction(args: number[]) {
    const tabId = args[0];

    document.addEventListener('visibilitychange', async function () {
        const now = Date.now();
        if (document.hidden) {
            await chrome.storage.local.set({ [document.URL]: now });
            const storageData = await chrome.storage.local.get(document.URL);
            console.log('storageData: ', storageData);
        } else {
            console.log('doc not hidden');
        }
    });
}

async function addTimerToTabs() {
    console.log('running add timer');
    const tabIds = await getAllTabsIdsOfWindow();

    for (const tabId of tabIds) {
        // tabId can be undefined for some reason
        // .. on new page maybe?
        if (tabId) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId },
                    func: scriptingFunction,
                    args: [[tabId]]
                });
            } catch (error) {
                if (typeof error === 'string' && error.includes('Error: Cannot access a chrome:// URL')) {
                    console.log('skipping executing script on a new tab');
                    return;
                }
            }
        }
    }
}

addTimerToTabs();
