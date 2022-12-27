chrome.runtime.onMessage.addListener(async function (request) {
    const { unsafePassword, activeTabId } = request;
    if (unsafePassword !== '!rweftesting9423') {
        console.log('failed password check');
        return;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    let tabIdsToBeRemoved: number[] = [];
    const allData = await chrome.storage.local.get(null);
    for (const urlData of Object.values(allData)) {
        if (nowInSeconds - urlData.lastAccessTime > 60) {
            // dont remove active tab
            if (activeTabId !== urlData.tabId) {
                tabIdsToBeRemoved.push(urlData.tabId);
            }
        }
    }
    await chrome.tabs.remove(tabIdsToBeRemoved);
});

console.log(`Started background service worker at ${new Date()}`);
