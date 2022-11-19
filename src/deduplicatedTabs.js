const dedupedUrlsTemplate = document.getElementById("deduplicate-urls");
const dedupedUrlsLocation = document.getElementById("deduped-urls-location");
const dedupResultDiv = document.getElementById("deduplicated-result");

async function findAndRemoveDuplicateTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const dedupedTabUrls = new Set();
  const tabSet = new Map();
  for (const tab of tabs) {
    const existingTabId = tabSet.get(tab.url);
    if (existingTabId) {
      dedupedTabUrls.add(tab.url);
      await chrome.tabs.remove(existingTabId);
    }
    tabSet.set(tab.url, tab.id);
  }
  return { numberOfDedupedTabs: tabs.length - tabSet.size, dedupedTabUrls };
}

async function addDedupedResultsToFrontend(
  numberOfDedupedTabs,
  dedupedTabUrls
) {
  const dedupNumbTemplate = document.getElementById("deduplicate-number");
  const dedupAmountElement =
    dedupNumbTemplate.content.firstElementChild.cloneNode(true);
  dedupAmountElement.querySelector("#dedup-amount").innerHTML =
    numberOfDedupedTabs > 1
      ? `Deduplicated <strong>${numberOfDedupedTabs}</strong> tabs `
      : `Deduplicated <strong>${numberOfDedupedTabs}</strong> tab `;

  dedupResultDiv.append(dedupAmountElement);

  for (const url of dedupedTabUrls) {
    const urlElement =
      dedupedUrlsTemplate.content.firstElementChild.cloneNode(true);
    urlElement.textContent = url;
    dedupedUrlsLocation.append(urlElement);
  }
}

function removeDedupResultFromFrontend() {
  while (dedupResultDiv.firstChild) {
    dedupResultDiv.removeChild(dedupResultDiv.firstChild);
  }
  while (dedupedUrlsLocation.firstChild) {
    dedupedUrlsLocation.removeChild(dedupedUrlsLocation.firstChild);
  }
}

async function deduplicateTabsByUrl() {
  const { numberOfDedupedTabs, dedupedTabUrls } =
    await findAndRemoveDuplicateTabs();
  await addDedupedResultsToFrontend(numberOfDedupedTabs, dedupedTabUrls);
  setTimeout(removeDedupResultFromFrontend, 5000);
}

const dedupBtn = document.getElementById("deduplicate-btn");
dedupBtn.addEventListener("click", deduplicateTabsByUrl);
