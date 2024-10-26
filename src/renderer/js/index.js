async function fetchMods() {
    try {
        const config = await window.api.getConfig();
        const apiUrl = config.liveApiUrl;
        const endpoints = config.endpoints;
        const query = '';

        const url = apiUrl
            + endpoints.search
            + query
            + endpoints.facets
            + '[' + endpoints.onlyMods + ']'
            + endpoints.limit
            + endpoints.offset
            + endpoints.index;

        const response = await fetch(url);
        const data = await response.json();
        const mods = data.hits;
        const modList = document.getElementById('modList');
        modList.innerHTML = '';

        mods.forEach(mod => {
            const modItem = document.createElement('div');
            modItem.classList.add('mod-item');

            modItem.addEventListener('click', () => {
                localStorage.setItem('selectedMod', mod.project_id);
                window.location.href = 'mod-view.html';
            });

            const modImg = document.createElement('img');
            modImg.src = mod.icon_url ?? '../img/default-mod-icon.png';
            modImg.classList.add('mod-img');
            modItem.appendChild(modImg);

            const modInfoContainer = document.createElement('div');
            modInfoContainer.classList.add('mod-info-container');
            modItem.appendChild(modInfoContainer);

            const modName = document.createElement('p');
            modName.classList.add('mod-title');
            modName.textContent = mod.title;
            modInfoContainer.appendChild(modName);

            const modDescription = document.createElement('p');
            modDescription.classList.add('mod-description');
            modDescription.textContent = mod.description;
            modInfoContainer.appendChild(modDescription);

            /*
            const downloadButton = document.createElement('button');
            downloadButton.classList.add('download-btn');
            downloadButton.textContent = 'Download';
            downloadButton.addEventListener('click', (e) => {
                e.stopPropagation();
                // Download logic
            });
            modItem.appendChild(downloadButton);
            */
           
            modList.appendChild(modItem);
        });

        if (mods.length === 0) {
            const noModsMessage = document.createElement('p');
            noModsMessage.textContent = 'No mods found.';
            modList.appendChild(noModsMessage);
        }
    } catch (error) {
        console.error('Error fetching mods:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchMods()

    /*
    document.getElementById('setPathBtn').addEventListener('click', async () => {
        console.log('Set Path Button clicked');
        const path = await window.api.setDownloadPath()
        console.log('Selected path:', path);
        if (path) {
            alert(`Download path set to: ${path}`)
        } else {
            alert('Download path selection was canceled.')
        }
    })
    */


})