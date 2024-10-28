import { downloadQuery, insertPagination, loadHeader } from './common-functions.js';
import { populateSelects } from "../js/game-settigns-fetch.js";

let currentPage = 1;
const itemsPerPage = 20;
let query = '';
let versionFacet = '';
let loaderFacet = '';
let facets = [];

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

let categories = [];
async function loadCategoriesPage() {
    const filtersContainer = document.getElementById("categories-container");
    categories.forEach(tag => {
        const tagContainer = document.createElement('div');
        tagContainer.classList.add('tag-container');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = tag.charAt(0).toUpperCase() + tag.slice(1);
        checkbox.value = tag;
        checkbox.classList.add("checkbox");
        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                if (facets.length === 0) {
                    facets.push(",[%22categories:" + tag + "%22]");
                } else {
                    facets.push("[%22categories:" + tag + "%22]");
                }
                fetchMods(0);
            } else {
                facets = facets.filter(facet => !facet.includes(tag));
                fetchMods(0);
            }
        });
        tagContainer.append(checkbox);

        const label = document.createElement('label');
        label.textContent = tag;
        label.classList.add("tag");
        tagContainer.append(label);

        filtersContainer.appendChild(tagContainer);
    });
}

async function setupGameSettingsSelects() {
    const loaderSelect = document.getElementById("loader-select");
    const gameVersionSelect = document.getElementById("game-version-select");

    let config = await window.api.getConfig();

    gameVersionSelect.value = config.userSettings.version || '';
    loaderSelect.value = config.userSettings.loader || '';

    gameVersionSelect.addEventListener('change', (event) => {
        config.userSettings.version = event.target.value;
        window.api.setUserSettings(config);
        if (event.target.value) {
            versionFacet = ",[%22versions:" + event.target.value + "%22]"
        } else {
            versionFacet = '';
        }
        fetchMods(0);
        loadHeader();
    });

    loaderSelect.addEventListener('change', (event) => {
        config.userSettings.loader = event.target.value;
        window.api.setUserSettings(config);
        if (event.target.value) {
            loaderFacet = ",[%22categories:" + event.target.value + "%22]"
        } else {
            loaderFacet = '';
        }
        fetchMods(0);
        loadHeader();
    });
}

async function fetchMods(page = 1) {
    try {
        if (page != 0) currentPage = page;

        const offsetAmount = (currentPage - 1) * itemsPerPage;
        const url = "https://api.modrinth.com/v2"
            + "/search?query=" + query
            + "&facets=[" + "[%22project_type:mod%22]" + versionFacet + loaderFacet + facets + "]"
            + "&limit=" + itemsPerPage
            + "&offset=" + offsetAmount
            + "&index=downloads";
        console.log(url);

        const response = await fetch(url);
        const data = await response.json();
        totalItems = data.total_hits;
        mods = data.hits;
    } catch (error) {
        console.error('Error fetching mods:', error);
    }
    await waitForDOMReady;
    loadModsPage();
}
fetchMods();

async function loadModsPage() {
    const modList = document.getElementById('mod-list');
    modList.innerHTML = '';

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
}

const waitForDOMReady = () => {
    return new Promise((resolve) => {
        if (document.readyState === "interactive" || document.readyState === "complete") {
            resolve();
        } else {
            document.addEventListener('DOMContentLoaded', () => resolve());
        }
    });
};

(async function () {
    await waitForDOMReady();
    await fetchCategoriesPromise;
    loadCategoriesPage();
    fetchMods();
    await populateSelects();
    setupGameSettingsSelects()
})();