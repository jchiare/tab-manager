async function getTabIds() {
    const queryOptions = { currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs.map(tab => tab.id);
}

async function scriptingFunction(args: any[]) {
    function createStorageValue(tabId: number, url: string) {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        return {
            lastAccessTime: nowInSeconds,
            tabId,
            url
        };
    }

    const tabId = args[0];
    const storageValue = createStorageValue(tabId, document.URL);
    await chrome.storage.local.set({ [tabId]: storageValue });

    document.addEventListener('visibilitychange', async function () {
        if (document.hidden) {
            const tabId = args[0];
            const storageValue = createStorageValue(tabId, document.URL);
            await chrome.storage.local.set({ [tabId]: storageValue });
        }
    });
}

async function setTimerToTabs() {
    const tabIds = await getTabIds();

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
