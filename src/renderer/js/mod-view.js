import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import { downloadQuery } from './common-functions.js';

let loadedData = [];
let list = '';
let modId = '';

async function fetchSelectedMod() {
    try {
        modId = localStorage.getItem('selectedMod');
        if (modId == null) {
            throw Error('Selected mod info not found in local storage');
        }

        const projectUrl = 'https://api.modrinth.com/v2/project/' + modId;
        const fetchData = await fetch(projectUrl);
        const mod = await fetchData.json();
        loadedData[0] = mod.title;
        loadedData[1] = mod.icon_url || '../img/default-mod-icon.png';
        loadedData[2] = mod.downloads.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        const versionsList = 'https://api.modrinth.com/v2/project/' + modId + '/version';
        const listRawData = await fetch(versionsList);
        list = await listRawData.json();
        const firstVersion = list[0];
        const authorId = firstVersion.author_id;
        const userInfo = await fetch("https://api.modrinth.com/v2/user/" + authorId);
        const userJson = await userInfo.json();
        loadedData[3] = userJson.username

        loadedData[4] = mod.description + "\n" + mod.body;

        let aboutInfo = [];
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        }
        aboutInfo[0] = "Published: " + formatDate(mod.published);
        aboutInfo[1] = "Updated:  " + formatDate(mod.updated);
        if (mod.license?.name) aboutInfo[2] = "License: " + mod.license.name;

        loadedData[5] = aboutInfo;

        const categories = mod.categories;
        categories.forEach((category) => {
            loadedData[6] = category + "\n";
        });

        let urls = [];
        urls[0] = mod.source_url;
        if (mod.wiki_url) urls[1] = mod.wiki_url;
        if (mod.discord_url) urls[2] = mod.discord_url;

        loadedData[7] = urls;

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
    document.getElementById("mod-view-downloads-text").textContent = loadedData[2];
    document.getElementById("mod-view-author-text").textContent = loadedData[3];

    document.getElementById("description-text").innerHTML = marked(loadedData[4]);

    const aboutSection = document.getElementById("about-text");
    const aboutEntries = loadedData[5];
    aboutEntries.forEach((aboutText) => {
        const text = document.createElement("p");
        text.textContent = aboutText;
        aboutSection.appendChild(text);
    });

    const catText = document.getElementById("categories-text");
    if (Array.isArray(loadedData[6])) {
        loadedData[6].forEach((tag) => {
            const categoryTag = document.createElement("p");
            categoryTag.textContent = tag;
            categoryTag.className = "categories-tag";
            catText.appendChild(categoryTag);
        });
    } else {
        const categoryTag = document.createElement("p");
        categoryTag.textContent = loadedData[6];
        categoryTag.className = "categories-tag";
        catText.appendChild(categoryTag);
    }

    const linkDiv = document.getElementById("links-div");
    const urls = loadedData[7];
    urls.forEach((linkUrl) => {
        const link = document.createElement("a");
        link.id = "links-text";
        link.href = linkUrl;
        link.textContent = linkUrl;

        linkDiv.appendChild(link);
    });

    const select = document.getElementById('game-versions-select');
    select.innerHTML = '';
    const modVersionList = document.getElementById('mod-version-list');
    modVersionList.innerHTML = '';
    
    const response = await fetch('../html/bones/mod-version-item.html');
    const templateHTML = await response.text();
    const template = document.createElement('template');
    template.innerHTML = templateHTML;
    
    list.forEach((version) => {
        // The regex expression ensures that no snapshots are shown.
        if (/^[0-9]+(\.[0-9]+)*$/.test(version.game_versions)) {
            // Add option to the version select
            const option = document.createElement('option');
            option.value = version.game_versions;
            option.innerHTML = version.game_versions;
            select.appendChild(option);

            // Add each version card to the list
            const modVersionItem = template.content.cloneNode(true);
            modVersionItem.querySelector('.game-version').innerHTML = version.game_versions;
            console.log(version.game_versions)
            modVersionItem.querySelector('.mod-name').innerHTML = version.name;
            modVersionItem.querySelector('.loader').innerHTML = version.loaders[0];

            const downloadButton = modVersionItem.querySelector('.download-button');
            downloadButton.addEventListener("click", async () => {
                downloadSelectedMod(version);
            });

            modVersionList.appendChild(modVersionItem);
        }
    });
}

const descriptionTab = document.getElementById("description-text");
const versionsTab = document.getElementById("mod-version-list");

const descriptionButton = document.getElementById("description-button");
const versionsButton = document.getElementById("versions-button");

descriptionButton.onclick = function () {
    descriptionTab.style.display = "block";
    versionsTab.style.display = "none";

    descriptionButton.classList.add("active");
    versionsButton.classList.remove("active");
};

versionsButton.onclick = function () {
    versionsTab.style.display = "block";
    descriptionTab.style.display = "none";

    versionsButton.classList.add("active");
    descriptionButton.classList.remove("active");
}

function downloadSelectedMod(version) {
    console.log("Implement this: " + version);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadInfoIntoPage();

    document.querySelectorAll("a").forEach(link => {
        link.target = "_blank";
    });

    document.getElementById("download-btn").addEventListener("click", () => {
        downloadQuery(modId);
    });
});