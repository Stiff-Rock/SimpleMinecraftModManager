import { downloadQuery, insertPagination } from './common-functions.js';

let currentPage = 1;
let query = '';
let categories = [];

let totalItems = 0;
let mods = [];

async function fetchCategories() {
    try {
        const response = await fetch("https://api.modrinth.com/v2/tag/category");
        const data = await response.json();
        data.forEach(element => {
            if (element.project_type == "mod") {
                categories.push(element.name);
            }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}
const fetchCategoriesPromise = fetchCategories();

const itemsPerPage = 20;
async function fetchMods(page = 1) {
    try {
        if (!page == 0) currentPage = page;

        const offsetAmount = (currentPage - 1) * itemsPerPage;

        const url = "https://api.modrinth.com/v2"
            + "/search?query=" + query
            + "&facets=[" + "[%22project_type:mod%22]" + "]"
            + "&limit=" + itemsPerPage
            + "&offset=" + offsetAmount
            + "&index=downloads";

        const response = await fetch(url);
        const data = await response.json();
        totalItems = data.total_hits;
        mods = data.hits;
    } catch (error) {
        console.error('Error fetching mods:', error);
    }
}
const fetchModsPromise = fetchMods();


async function loadCategories() {
    const filtersContainer = document.getElementById("filters-aside");
    categories.forEach(tag => {
        const tagContainer = document.createElement('div');
        tagContainer.classList.add('tag-container');

        const label = document.createElement('label');
        label.textContent = tag;
        label.classList.add("tag");
        tagContainer.append(label);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = tag.charAt(0).toUpperCase() + tag.slice(1);
        checkbox.value = tag;
        checkbox.classList.add("checkbox");
        tagContainer.append(checkbox);

        filtersContainer.appendChild(tagContainer);
    });
    
}

async function loadMods() {
    const modList = document.getElementById('mod-list');
    modList.innerHTML = '';

    if (mods.length === 0) {
        const noModsMessage = document.createElement('p');
        noModsMessage.textContent = 'No mods found.';
        modList.appendChild(noModsMessage);
        return;
    }

    const queryContainer = document.createElement('div');
    queryContainer.style.display = "flex";
    queryContainer.style.alignItems = "center";
    queryContainer.style.height = "fit-content"
    queryContainer.style.width = "100%"
    queryContainer.style.gap = "20px"

    const input = document.createElement('input');
    input.id = 'querySearchInput';
    input.placeholder = 'Search mods...';
    input.value = query;
    input.type = 'text';
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            query = input.value;
            fetchMods(0);
        }
    });
    queryContainer.appendChild(input);

    const submitButton = document.createElement('button');
    submitButton.id = 'submitButton';
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', (event) => {
        query = input.value;
        fetchMods(0);
    });

    queryContainer.appendChild(submitButton);

    modList.appendChild(queryContainer);

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
}

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([fetchCategoriesPromise, fetchModsPromise]);

    loadCategories();
    loadMods();
})