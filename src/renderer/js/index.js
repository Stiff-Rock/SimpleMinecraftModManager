import { downloadQuery, insertPagination } from './common-functions.js';

let currentPage = 1;
let query = '';

async function fetchMods(page = 1) {
    try {
        if (!page == 0) currentPage = page;

        const itemsPerPage = 20;
        const offsetAmount = (currentPage - 1) * itemsPerPage;

        const url = "https://api.modrinth.com/v2"
            + "/search?query=" + query
            + "&facets=[" + "[%22project_type:mod%22]" + "]"
            + "&limit=" + itemsPerPage
            + "&offset=" + offsetAmount
            + "&index=downloads";

        const response = await fetch(url);
        const data = await response.json();
        const totalItems = data.total_hits;
        const mods = data.hits;

        const modList = document.getElementById('mod-list');
        modList.innerHTML = '';

        if (mods.length === 0) {
            const noModsMessage = document.createElement('p');
            noModsMessage.textContent = 'No mods found.';
            modList.appendChild(noModsMessage);
            return;
        }

        mods.forEach(mod => {
            const modItem = document.createElement('div');
            modItem.classList.add('mod-item');

            const modContent = document.createElement('div');
            modContent.classList.add('mod-content');
            modContent.addEventListener('click', () => {
                localStorage.setItem('selectedMod', mod.project_id);
                window.location.href = 'mod-view.html';
            });
            modItem.appendChild(modContent);

            const modImg = document.createElement('img');
            modImg.src = mod.icon_url ?? '../img/default-mod-icon.png';
            modImg.classList.add('mod-img');
            modContent.appendChild(modImg);

            const modInfoContainer = document.createElement('div');
            modInfoContainer.classList.add('mod-info-container');
            modContent.appendChild(modInfoContainer);

            const modName = document.createElement('p');
            modName.classList.add('mod-title');
            modName.textContent = mod.title;
            modInfoContainer.appendChild(modName);

            const modDescription = document.createElement('p');
            modDescription.classList.add('mod-description');
            modDescription.textContent = mod.description;
            modInfoContainer.appendChild(modDescription);

            const buttonDiv = document.createElement('div');
            buttonDiv.classList.add('download-section')
            modItem.appendChild(buttonDiv);

            const downloadButton = document.createElement('button');
            downloadButton.classList.add('download-btn');
            downloadButton.textContent = 'Download';
            downloadButton.addEventListener('click', (e) => {
                e.stopImmediatePropagation;
                downloadQuery(mod.project_id);
            });
            buttonDiv.appendChild(downloadButton);

            modList.appendChild(modItem);
        });
        await insertPagination(modList, totalItems, currentPage, itemsPerPage, fetchMods, true);
    } catch (error) {
        console.error('Error fetching mods:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchMods();
})