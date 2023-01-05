import type { StoredTabValue } from './setTabTimer';

type StoredTabObject = {
    [key: string]: StoredTabValue;
};

async function consoleLogAllData() {
    const allUrls = await (<Promise<StoredTabObject>>chrome.storage.session.get(null));
    for (const values of Object.values(allUrls)) {
        if (values) {
            values.niceDate = new Date(values.lastAccessTime * 1000).toString();
        }
    }

    const sortedUrls = Object.values(allUrls).sort((a, b) => a.lastAccessTime - b.lastAccessTime);
    console.log(sortedUrls);
}

const debugBtn = document.getElementById('debug')!;
debugBtn.addEventListener('click', consoleLogAllData);
