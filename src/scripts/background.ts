function getStorageData(key: string) {
    new Promise((resolve, reject) => chrome.storage.sync.get(key, result => (chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve(result))));
}
function setStorageData(data: any) {
    new Promise((resolve, reject) => chrome.storage.sync.set(data, () => (chrome.runtime.lastError ? reject(Error(chrome.runtime.lastError.message)) : resolve())));
}

async function getCurrentTab(activeInfo: chrome.tabs.TabActiveInfo) {
    const currentTab = await chrome.tabs.get(activeInfo.tabId);
    const { url } = currentTab;

    const data = await chrome.storage.sync.get([url]);
    console.log('data: ', data);
    console.log('stringify data: ', JSON.stringify(data));
    if (data.url) {
        console.log(`found data "${JSON.stringify(data)}" from url "${url}"`);
    } else {
        console.log(`no data for "${url}"`);
        const setResult = await chrome.storage.sync.set({ url: 'hye' });
        console.log(JSON.stringify(setResult));
    }
    return currentTab;
}

chrome.tabs.onActivated.addListener(async activeInfo => {
    const result = await getCurrentTab(activeInfo);
    console.log(result);
});
console.log(`Started background service worker at ${new Date()}`);
