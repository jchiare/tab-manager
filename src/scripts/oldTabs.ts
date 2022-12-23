async function getAllTabsIdsOfWindow() {
    const queryOptions = { currentWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    const tabs = await chrome.tabs.query(queryOptions);
    return tabs.map(tab => tab.id);
}

function executionFunction() {
    const now = new Date();

    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            console.log('The webpage is no longer visible.');
            // @ts-expect-error
            document.secondsSinceLastAccess = document.dateTimeLastAccessed ? (now.getTime() - document.dateTimeLastAccessed.getTime()) / 1000 : 0;
            // @ts-expect-error
            document.dateTimeLastAccessed = now;
        } else {
            console.log('The webpage is now visible.');
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

    return document.title;
}

function executionCallback(injectionResults: any) {
    for (const frameResult of injectionResults) {
        console.log('Frame Title: ' + frameResult.result);
    }
}

async function getOldTabs() {
    const tabIds = await getAllTabsIdsOfWindow();

    console.log('tab ids: ', tabIds);
    let scriptingResult = [];

    for (const tabId of tabIds) {
        if (tabId) {
            let result: string | chrome.scripting.InjectionResult<any>[] = ' .. skipping empty tab .. ';
            try {
                result = await chrome.scripting.executeScript({
                    target: { tabId },
                    func: executionFunction
                });
            } catch (error) {
                if (typeof error === 'string' && error.includes('Error: Cannot access a chrome:// URL')) {
                    console.log('skipping executing script on a new tab');
                    return;
                }
            }
            scriptingResult.push(result);
        }
    }

    console.log('scripting results:', scriptingResult);
}

const oldTabsBtn = document.getElementById('oldTabs-btn')!;
oldTabsBtn.addEventListener('click', getOldTabs);
