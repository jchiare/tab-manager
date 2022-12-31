function normalizeTimeToSeconds(timeRange: string, expiryTime: string): number {
    const expiryTimeAsNumber = parseInt(expiryTime, 10);
    const timeRangeConversionFactors = new Map<string, number>([
        ['seconds', 1],
        ['minutes', 60],
        ['hours', 60 * 60],
        ['days', 60 * 60 * 24]
    ]);
    const conversionFactor = timeRangeConversionFactors.get(timeRange.toLowerCase());
    return conversionFactor ? conversionFactor * expiryTimeAsNumber : expiryTimeAsNumber;
}

async function removeExpiredTabs(message: any) {
    const { activeTabId, expiryTime, timeRange } = message;
    const expirySeconds = normalizeTimeToSeconds(timeRange, expiryTime);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    let tabIdsToBeRemoved: number[] = [];

    // loop through all urls in storage
    const allUrls = await chrome.storage.session.get(null);
    for (const singleUrlData of Object.values(allUrls)) {
        if (nowInSeconds - singleUrlData.lastAccessTime > expirySeconds) {
            // dont remove active tab
            if (activeTabId !== singleUrlData.tabId) {
                tabIdsToBeRemoved.push(singleUrlData.tabId);
            }
        }
    }
    await chrome.tabs.remove(tabIdsToBeRemoved);
    await chrome.storage.session.remove(tabIdsToBeRemoved.map(tabId => tabId.toString()));
}

chrome.runtime.onMessage.addListener(async function (request) {
    await removeExpiredTabs(request);
});

chrome.tabs.onRemoved.addListener(async tadId => {
    try {
        await chrome.storage.session.remove(tadId.toString());
    } catch (error) {
        // dont throw error
    }
});

console.log(`Started background service worker at ${new Date()}`);
