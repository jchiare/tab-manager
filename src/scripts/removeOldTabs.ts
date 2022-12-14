function getActiveValidTab(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab | undefined {
    const validTabs = tabs.filter(tab => !tab.url?.toLowerCase().startsWith('chrome://') && tab.id);
    return validTabs.find(tab => tab.active);
}

function getFirstValidTab(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab {
    const validTabs = tabs.filter(tab => !tab.url?.toLowerCase().startsWith('chrome://') && tab.id);
    return validTabs[0];
}

async function getValidTab(): Promise<chrome.tabs.Tab> {
    const queryOptions: chrome.tabs.QueryInfo = { currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    const activeTab = getActiveValidTab(tabs);
    return activeTab ?? getFirstValidTab(tabs);
}

async function sendMessageToServiceWorker(args: any[]) {
    const [activeTabId, expiryTime, timeRange] = args;
    const message = { activeTabId, expiryTime, timeRange };
    await chrome.runtime.sendMessage(message);
}

async function removeOldTabs() {
    const validTab = await getValidTab();

    await chrome.scripting.executeScript<any, any>({
        target: { tabId: validTab.id! },
        func: sendMessageToServiceWorker,
        args: [[validTab.id, expiryTimeValueInput.value, expiryTimeRangeInput.value]]
    });
}

const removeOldTabsBtn = document.getElementById('removeOldTabs-btn')!;
removeOldTabsBtn.addEventListener('click', removeOldTabs);

const expiryTimeValueInput = <HTMLInputElement>document.getElementById('stale-tab-expiration')!;
const expiryTimeRangeInput = <HTMLSelectElement>document.getElementById('stale-tab-time')!;
