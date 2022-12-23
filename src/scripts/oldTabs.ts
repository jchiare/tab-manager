async function getAllTabsIdsOfWindow() {
    const queryOptions = { currentWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs.map(tab => tab.id);
}

function scriptingFunction() {
    document.addEventListener('visibilitychange', function () {
        const now = new Date();
        if (document.hidden) {
            // @ts-expect-error
            document.secondsSinceLastAccess = document.dateTimeLastAccessed ? (now.getTime() - document.dateTimeLastAccessed.getTime()) / 1000 : 0;
            // @ts-expect-error
            document.dateTimeLastAccessed = now;
        } else {
            // @ts-expect-error
            document.secondsSinceLastAccess = document.dateTimeLastAccessed ? (now.getTime() - document.dateTimeLastAccessed.getTime()) / 1000 : 0;
            // @ts-expect-error
            document.dateTimeLastAccessed = now;
        }

        // @ts-expect-error
        console.log('seconds since last access: ', document.secondsSinceLastAccess);

        // @ts-expect-error
        console.log('doc time last accessed after : ', document.dateTimeLastAccessed);
    });
}

async function getOldTabs() {
    const tabIds = await getAllTabsIdsOfWindow();

    for (const tabId of tabIds) {
        if (tabId) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId },
                    func: scriptingFunction
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

const oldTabsBtn = document.getElementById('oldTabs-btn')!;
oldTabsBtn.addEventListener('click', getOldTabs);
