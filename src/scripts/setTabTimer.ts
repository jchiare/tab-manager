async function getAllTabsIdsOfWindow() {
    const queryOptions = { currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs.map(tab => tab.id);
}

async function scriptingFunction(args: any[]) {
    function createStorageValue(tabId: number) {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        return {
            lastAccessTime: nowInSeconds,
            tabId
        };
    }

    document.addEventListener('visibilitychange', async function () {
        if (document.hidden) {
            const tabId = args[0];
            const storageValue = createStorageValue(tabId);
            await chrome.storage.local.set({ [document.URL]: storageValue });
            const storageData = await chrome.storage.local.get(document.URL);
            console.log('storageData: ', storageData);
        } else {
            console.log('doc not hidden');
        }
    });
}

async function setTimerToTabs() {
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

setTimerToTabs();
