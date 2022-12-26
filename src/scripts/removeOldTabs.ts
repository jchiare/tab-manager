function handleOnTabActivated(activeInfo: chrome.tabs.TabActiveInfo) {
    console.log('tabId: ', activeInfo.tabId);
}

async function getAllTabsIdsOfWindowExceptActive() {
    const queryOptions = { currentWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs.filter(tab => !tab.active).map(tab => tab.id);
}

function oldTabsScriptingFunction() {
    console.log('dont do anything');

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
