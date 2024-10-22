async function fetchSelectedMod() {
    try {
        const modId = localStorage.getItem('selectedMod');
        if (modId == null) {
            throw Error('Selected mod info not found in local storage');
        }

        const projectUrl = 'https://api.modrinth.com/v2/project/' + modId;
        const fetchData = await fetch(projectUrl);
        const mod = await fetchData.json();
        document.getElementById('mod-view-title').textContent = mod.title;
        document.getElementById('mod-view-img').src = mod.icon_url || '../img/default-mod-icon.png';

        const versionsList = 'https://api.modrinth.com/v2/project/' + modId + '/version';
        const listRawData = await fetch(versionsList);
        const list = await listRawData.json();

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

        const modVersion = await fetch(projectUrl + '/version/KZS9tylY');
        const modVersionData = await modVersion.json();
        return modVersionData;
    } catch (error) {
        console.error('Error fetching the selected mod:', error);
        alert(error.message);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    await fetchSelectedMod();

    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = "index.html";
    });
});
