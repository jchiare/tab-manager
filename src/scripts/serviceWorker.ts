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

async function getTabsToBeRemoved(nowInSeconds: number, expirySeconds: number, activeTabId: any): Promise<string[]> {
    let tabIdsToBeRemoved: string[] = [];

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
    return tabIdsToBeRemoved;
}

async function removeExpiredTabs(message: any) {
    const { activeTabId, expiryTime, timeRange } = message;
    const expirySeconds = normalizeTimeToSeconds(timeRange, expiryTime);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    const tabIdsToBeRemoved = await getTabsToBeRemoved(nowInSeconds, expirySeconds, activeTabId);

    if (tabIdsToBeRemoved.length > 0) {
        await chrome.tabs.remove(tabIdsToBeRemoved.map(tabId => parseInt(tabId)));
        await chrome.storage.session.remove(tabIdsToBeRemoved);
    }
}

chrome.runtime.onMessage.addListener(async function (request) {
    await removeExpiredTabs(request);
});

// handle case where a tab is removed
// maunally by a user
chrome.tabs.onRemoved.addListener(async tadId => {
    try {
        await chrome.storage.session.remove(tadId.toString());
    } catch (error) {
        // dont throw error if it's an extension page or
        // some other edge case
    }
});

console.log(`Started background service worker at ${new Date()}`);
