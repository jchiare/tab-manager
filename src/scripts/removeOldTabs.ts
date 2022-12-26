type TabsInStorage = {
    [key: string]: string;
};

function handleOnTabActivated(activeInfo: chrome.tabs.TabActiveInfo) {
    console.log('tabId: ', activeInfo.tabId);
}

const memoize = {};
async function getAllTabsIdsOfWindowExceptActive() {
    const queryOptions = { currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs.filter(tab => !tab.active).map(tab => tab.id);
}

async function getAllDataFromStorage() {
    return chrome.storage.local.get(null);
}

const HOUR_IN_SECONDS = 60 * 60;
function getAllOldTabs(seconds = HOUR_IN_SECONDS, tabs: any) {}

async function oldTabsScriptingFunction() {
    const allData = await getAllDataFromStorage();
    console.log(allData);
    console.log(JSON.stringify(allData));
    return 'hey';
}

async function removeOldTabs() {
    const tabIds = await getAllTabsIdsOfWindowExceptActive();
    chrome.tabs.onActivated.addListener(handleOnTabActivated);

    for (const tabId of tabIds) {
        if (tabId) {
            try {
                const result = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: oldTabsScriptingFunction
                });
                if (result) {
                    console.log('would close tab id: ', tabId);
                    //await chrome.tabs.remove(tabId);
                }
            } catch (error) {
                if (typeof error === 'string' && error.includes('Error: Cannot access a chrome:// URL')) {
                    console.log('skipping executing script on a new tab');
                    return;
                }
            }
        }
    }
}

const removeOldTabsBtn = document.getElementById('removeOldTabs-btn')!;
removeOldTabsBtn.addEventListener('click', removeOldTabs);
