async function removeExpiredTabs(message: any) {
    const { activeTabId, expiryTime } = message;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    let tabIdsToBeRemoved: number[] = [];
    let storageToBeRemoved: string[] = [];

    // loop through all urls in storage
    const allUrls = await chrome.storage.local.get(null);
    for (const [urlKey, singleUrlData] of Object.entries(allUrls)) {
        console.log('single url before: ', singleUrlData);
        console.log('result: ', nowInSeconds - singleUrlData.lastAccessTime > parseInt(expiryTime, 10));
        if (nowInSeconds - singleUrlData.lastAccessTime > parseInt(expiryTime, 10)) {
            // dont remove active tab

            if (activeTabId !== singleUrlData.tabId) {
                tabIdsToBeRemoved.push(singleUrlData.tabId);
                storageToBeRemoved.push(urlKey);
            }
        }
    }
    await chrome.tabs.remove(tabIdsToBeRemoved);
    await chrome.storage.local.remove(storageToBeRemoved);
}

chrome.runtime.onMessage.addListener(async function (request) {
    await removeExpiredTabs(request);
});

console.log(`Started background service worker at ${new Date()}`);
