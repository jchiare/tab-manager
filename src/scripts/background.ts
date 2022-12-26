async function getCurrentTab(activeInfo: chrome.tabs.TabActiveInfo) {
    const currentTab = await chrome.tabs.get(activeInfo.tabId);
    const { url } = currentTab;

    if (!url) {
        return;
    }
    const data = await chrome.storage.local.get(url);
    if (data.url) {
        console.log(`found data "${JSON.stringify(data)}" from url "${url}"`);
    } else {
        console.log(await chrome.storage.local.get(null));
        await chrome.storage.local.set({ [url]: 'hye' });
    }
    return currentTab;
}

chrome.tabs.onActivated.addListener(async activeInfo => {
    const result = await getCurrentTab(activeInfo);
    console.log(result);
});
console.log(`Started background service worker at ${new Date()}`);
