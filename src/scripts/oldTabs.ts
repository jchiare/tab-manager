async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

function executionFunction() {
    return document.title;
}

function executionCallback(injectionResults) {
    for (const frameResult of injectionResults) {
        console.log('Frame Title: ' + frameResult.result);
    }
}

async function query() {
    const currentTab = await getCurrentTab();

    if (!currentTab.id) {
        return;
    }

    let scriptingResult;
    try {
        scriptingResult = await chrome.scripting.executeScript({
            target: { allFrames: true, tabId: currentTab.id },
            func: executionFunction
        });
    } catch (error) {
        console.log(chrome);
        if (error.endsWith('Error: Cannot access a chrome:// URL')) {
            console.log('skipping executing script on a new tab');
            return;
        }
        throw new Error(error);
    }

    console.log('scripting results:', scriptingResult);
}
