let loadedData = [];
let list = '';

async function fetchSelectedMod() {
    try {
        const modId = localStorage.getItem('selectedMod');
        if (modId == null) {
            throw Error('Selected mod info not found in local storage');
        }

        const projectUrl = 'https://api.modrinth.com/v2/project/' + modId;
        const fetchData = await fetch(projectUrl);
        const mod = await fetchData.json();
        loadedData[0] = mod.title;
        loadedData[1] = mod.icon_url || '../img/default-mod-icon.png';
        loadedData[2] = "Downloads: " + mod.downloads;

        const versionsList = 'https://api.modrinth.com/v2/project/' + modId + '/version';
        const listRawData = await fetch(versionsList);
        list = await listRawData.json();
        const firstVersion = list[0];
        const authorId = firstVersion.author_id;
        const userInfo = await fetch("https://api.modrinth.com/v2/user/" + authorId);
        const userJson = await userInfo.json();
        loadedData[3] = "Author: " + userJson.username

    } catch (error) {
        console.error('Error fetching the selected mod:', error);
        alert(error.message);
    }
}
const fetchPromise = fetchSelectedMod();

async function loadInfoIntoPage() {
    await fetchPromise;

    document.getElementById('mod-view-name').textContent = loadedData[0];
    document.getElementById('mod-view-img').src = loadedData[1];
    document.getElementById("mod-view-downloads").textContent = loadedData[2];
    document.getElementById("mod-view-author").textContent = loadedData[3];

    const select = document.getElementById('game-versions-select');
    select.innerHTML = '';
    const modVersionList = document.getElementById('mod-version-list');
    modVersionList.innerHTML = '';
    list.forEach((version) => {
        if (/^[0-9]+(\.[0-9]+)*$/.test(version.game_versions)) {
            const option = document.createElement('option');
            option.value = version.game_versions;
            option.innerHTML = version.game_versions;
            select.appendChild(option);

            const modVersionItem = document.createElement('div');
            modVersionItem.id = 'mod-version-item';

            const gameversionText = document.createElement('p');
            gameversionText.innerHTML = version.game_versions;
            modVersionItem.appendChild(gameversionText)

            const modVersionText = document.createElement('p');
            modVersionText.innerHTML = version.name;
            modVersionItem.appendChild(modVersionText)

            const loaderText = document.createElement('p');
            loaderText.innerHTML = version.loaders[0];
            modVersionItem.appendChild(loaderText)

            const downloadButton = document.createElement('button');
            downloadButton.innerHTML = 'Download';
            downloadButton.addEventListener("click", async () => {
                try {
                    const url = version.files[0].url;
                    const fileName = version.files[0].filename ?? path.basename(url);
                    await window.api.downloadFile(url, fileName);
                } catch (error) {
                    console.error('Error invoking downloadFile:', error);
                    alert(`Download failed: ${error.message}`);
                }
            });
            modVersionItem.appendChild(downloadButton)

            modVersionList.appendChild(modVersionItem);
        }
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    loadInfoIntoPage();

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = "index.html";
    });
});
