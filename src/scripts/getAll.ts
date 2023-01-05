import type { StoredTabValue } from './setTabTimer';

type StoredTabObject = {
    [key: string]: StoredTabValue;
};

async function getAllData() {
    const allUrls = await (<Promise<StoredTabObject>>chrome.storage.session.get(null));
    for (const values of Object.values(allUrls)) {
        if (values) {
            values.niceDate = new Date(values.lastAccessTime * 1000).toString();
        }
    }
}

const getAllBtn = document.getElementById('getAll')!;
getAllBtn.addEventListener('click', getAllData);
