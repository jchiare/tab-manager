async function getCurrentTab(activeInfo: chrome.tabs.TabActiveInfo) {
    const currentTab = await chrome.tabs.get(activeInfo.tabId);
    const { url } = currentTab;

    if (!url) {
        return;
    }

    console.log('background url: ', url);
    const data = await chrome.storage.local.get(url);
    console.log('data from background: ', data);

    if (data[url]) {
        console.log(`found data "${JSON.stringify(data)}" from url "${url}"`);
    } else {
        console.log(await chrome.storage.local.get(null));
    }
    return currentTab;
}

chrome.tabs.onActivated.addListener(async activeInfo => {
    const result = await getCurrentTab(activeInfo);
    console.log(result);
});
console.log(`Started background service worker at ${new Date()}`);
