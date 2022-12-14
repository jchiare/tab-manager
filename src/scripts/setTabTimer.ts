export type StoredTabValue = {
    lastAccessTime: number;
    tabId: number;
    url: string;
    niceDate?: string;
    active: boolean;
};

async function getValidTabIds() {
    const queryOptions = { currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    const validTabs = tabs.filter(tab => !tab?.url?.toLowerCase()?.startsWith('chrome://') && tab.id);
    return validTabs.map(tab => tab.id);
}

async function scriptingFunction(args: any[]) {
    function isEmptyObject(obj: object) {
        return Object.keys(obj).length === 0;
    }

    function createStorageValue(tabId: string, url: string) {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        return {
            lastAccessTime: nowInSeconds,
            tabId,
            url
        };
    }

    const tabId: string = args[0].toString();
    const tabIdInStorage = await chrome.storage.session.get(tabId);
    if (!tabIdInStorage || isEmptyObject(tabIdInStorage)) {
        const storageValue = createStorageValue(tabId, document.URL);
        await chrome.storage.session.set({ [tabId]: storageValue });
    }

    document.addEventListener('visibilitychange', async function () {
        if (document.hidden) {
            const storageValue = createStorageValue(tabId, document.URL);
            await chrome.storage.session.set({ [tabId]: storageValue });
        }
    });
}

async function setTimerToTabs() {
    chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

    const validTabIds = await getValidTabIds();
    for (const tabId of validTabIds) {
        await chrome.scripting.executeScript({
            target: { tabId: tabId! },
            func: scriptingFunction,
            args: [[tabId]]
        });
    }
}

setTimerToTabs();
