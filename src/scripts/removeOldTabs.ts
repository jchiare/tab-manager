async function getActiveTab(): Promise<chrome.tabs.Tab> {
    const queryOptions: chrome.tabs.QueryInfo = { active: true, currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs[0];
}

async function sendMessageToServiceWorker(args: any[]) {
    const [activeTabId, expiryTime] = args;
    const message = { activeTabId, expiryTime };
    await chrome.runtime.sendMessage(message);
}

async function removeOldTabs() {
    const activeTab = await getActiveTab();
    if (!activeTab.id) return;
    try {
        await chrome.scripting.executeScript<any, any>({
            target: { tabId: activeTab.id },
            func: sendMessageToServiceWorker,
            args: [[activeTab.id, expiryTimeInput.value]]
        });
    } catch (error) {
        if (typeof error === 'string' && error.includes('Error: Cannot access a chrome:// URL')) {
            console.log('skipping executing script on a new tab');
            return;
        }
    }
}

const removeOldTabsBtn = document.getElementById('removeOldTabs-btn')!;
removeOldTabsBtn.addEventListener('click', removeOldTabs);

const expiryTimeInput = <HTMLInputElement>document.getElementById('old-tab-expiration')!;
