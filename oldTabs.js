const dedupedUrlsTemplate = document.getElementById("deduplicate-urls");
const dedupedUrlsLocation = document.getElementById("deduped-urls-location");
const dedupResultDiv = document.getElementById("deduplicated-result");

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

function executionFunction(context) {
  console.log("context:", context);
  return document.title;
}

function executionCallback(injectionResults) {
  for (const frameResult of injectionResults) {
    console.log("Frame Title: " + frameResult.result);
  }
}

async function query() {
  const currentTab = await getCurrentTab();

  const injectionObject = {
    target: { allFrames: true, tabId: currentTab.id },
    func: executionFunction,
  };

  let scriptingResult;
  try {
    scriptingResult = await chrome.scripting.executeScript(injectionObject);
  } catch (error) {
    console.log(chrome);
    if (error.endsWith("Error: Cannot access a chrome:// URL")) {
      console.log("skipping executing script on a new tab");
      return;
    }
    throw new Error(error);
  }

  console.log("scripting results:", scriptingResult);
}

const dedupBtn = document.getElementById("oldTabs-btn");
dedupBtn.addEventListener("click", query);
