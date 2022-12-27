chrome.runtime.onMessage.addListener(async function (request) {
    if (request.unsafePassword !== '!rweftesting9423') {
        console.log('failed password check');
        return;
    }
    const allData = await chrome.storage.local.get(null);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    console.log('allData: ', allData);
    let tabIdsToBeRemoved: number[] = [];
    for (const [url, urlData] of Object.entries(allData)) {
        if (nowInSeconds - urlData.lastAccessTime > 60) {
            console.log('removed this url "', url, '" with this tabId "', urlData.tabId, '"');
            tabIdsToBeRemoved.push(urlData.tabId);
        }
    }
    await chrome.tabs.remove(tabIdsToBeRemoved);
});

console.log(`Started background service worker at ${new Date()}`);
