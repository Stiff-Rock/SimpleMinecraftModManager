import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

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

        const categories = mod.categories;
        categories.forEach((category) => {
            loadedData[5] = category + "\n";
        });

        let urls = [];
        urls[0] = mod.source_url;
        if (mod.wiki_url) urls[1] = mod.wiki_url;
        if (mod.discord_url) urls[2] = mod.discord_url;

        loadedData[6] = urls;

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

    const catText = document.getElementById("categories-text");
    if (Array.isArray(loadedData[5])) {
        loadedData[5].forEach((tag) => {
            const categoryTag = document.createElement("p");
            categoryTag.textContent = tag;
            categoryTag.className = "categories-tag";
            catText.appendChild(categoryTag);
        });
    } else {
        const categoryTag = document.createElement("p");
        categoryTag.textContent = loadedData[5];
        categoryTag.className = "categories-tag";
        catText.appendChild(categoryTag);
    }

    const linkDiv = document.getElementById("links-div");
    const urls = loadedData[6];
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
    list.forEach((version) => {
        if (/^[0-9]+(\.[0-9]+)*$/.test(version.game_versions)) {
            const option = document.createElement('option');
            option.value = version.game_versions;
            option.innerHTML = version.game_versions;
            select.appendChild(option);

            const modVersionItem = document.createElement('div');
            modVersionItem.classList.add('mod-version-item');

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
    await loadInfoIntoPage();

    document.querySelectorAll("a").forEach(link => {
        link.target = "_blank";
    });
    
    document.getElementById("back-btn").addEventListener("click", () => {
        window.location.href = "index.html";
    });
});

const descriptionTab = document.getElementById("description-text");
const versionsTab = document.getElementById("mod-version-list");

const descriptionButton = document.getElementById("description-button");
const versionsButton = document.getElementById("versions-button");

descriptionButton.onclick = function() {
    descriptionTab.style.display = "block";
    versionsTab.style.display = "none"; 
};

versionsButton.onclick = function() {
    versionsTab.style.display = "block";
    descriptionTab.style.display = "none";
}