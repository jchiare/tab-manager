async function getCurrentTab(activeInfo: chrome.tabs.TabActiveInfo) {
    const currentTab = await chrome.tabs.get(activeInfo.tabId);
    const { url } = currentTab;

    if (!url) {
        throw new Error('Missing url');
    }
    const data = await chrome.storage.sync.get(url);
    if (data.url) {
        console.log(`found data "${JSON.stringify(data)}" from url "${url}"`);
    } else {
        console.log(await chrome.storage.sync.get(null));
        await chrome.storage.sync.set({ [url]: 'hye' });
    }
    return currentTab;
}

chrome.tabs.onActivated.addListener(async activeInfo => {
    const result = await getCurrentTab(activeInfo);
    console.log(result);
});
console.log(`Started background service worker at ${new Date()}`);
