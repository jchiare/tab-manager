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
    const now = new Date();
    // @ts-expect-error
    console.log('from old tabs -- seconds since last access: ', document.secondsSinceLastAccess);
    // @ts-expect-error
    console.log('from old tabs -- doc time last accessed after : ', document.dateTimeLastAccessed);

    // @ts-expect-error
    console.log('document title: "', document.title, '" value: ', document.dateTimeLastAccessed);

    // @ts-expect-error
    const secondsSince = document.dateTimeLastAccessed ? (now.getTime() - document.dateTimeLastAccessed.getTime()) / 1000 : 0;
    console.log('seconds since: ', secondsSince);

    return secondsSince > 10;
}

async function getOldTabs() {
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

const getOldTabsBtn = document.getElementById('getOldTabs-btn')!;
getOldTabsBtn.addEventListener('click', getOldTabs);
