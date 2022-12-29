function normalizeTimeToSeconds(timeRange: string, expiryTime: string): number {
    const expiryTimeAsNumber = parseInt(expiryTime, 10);
    switch (timeRange.toLowerCase()) {
        case 'seconds':
            return expiryTimeAsNumber;
        case 'minutes':
            return expiryTimeAsNumber * 60;
        case 'hours':
            return expiryTimeAsNumber * 60 * 60;
        case 'days':
            return expiryTimeAsNumber * 60 * 60 * 24;
        default:
            return expiryTimeAsNumber;
    }
}

async function removeExpiredTabs(message: any) {
    const { activeTabId, expiryTime, timeRange } = message;
    const expirySeconds = normalizeTimeToSeconds(timeRange, expiryTime);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    let tabIdsToBeRemoved: number[] = [];

    // loop through all urls in storage
    const allUrls = await chrome.storage.local.get(null);
    for (const singleUrlData of Object.values(allUrls)) {
        if (nowInSeconds - singleUrlData.lastAccessTime > expirySeconds) {
            // dont remove active tab
            if (activeTabId !== singleUrlData.tabId) {
                tabIdsToBeRemoved.push(singleUrlData.tabId);
            }
        }
    }
    await chrome.tabs.remove(tabIdsToBeRemoved);
    await chrome.storage.local.remove(tabIdsToBeRemoved.map(tabId => tabId.toString()));
}

chrome.runtime.onMessage.addListener(async function (request) {
    await removeExpiredTabs(request);
});

console.log(`Started background service worker at ${new Date()}`);
