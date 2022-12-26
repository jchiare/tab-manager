async function getCurrentTab(activeInfo) {
    const currentTab = await chrome.tabs.get(activeInfo.tabId);
    console.log(currentTab);
    return currentTab;
}

chrome.tabs.onActivated.addListener(activeInfo => getCurrentTab(activeInfo).then(result => console.log(result)));
console.log('backgrrounds.js');
