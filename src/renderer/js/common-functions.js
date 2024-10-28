import { populateSelects } from "../js/game-settigns-fetch.js";

let config = {};
let userLoader = '';
let userVersion = '';

async function loadConfig() {
    config = await window.api.getConfig()
    userLoader = config.userSettings.loader;
    userVersion = config.userSettings.version;
}
const loadConfigPromise = loadConfig();

async function loadHeader() {
    await loadConfig();
    try {
        const response = await fetch('../html/bones/header.html');
        const headerHTML = await response.text();
        document.querySelector('header').innerHTML = headerHTML;

        const loader = document.getElementById('loader-profile');
        const gameVersion = document.getElementById('game-version-profile');

        if (loader) loader.textContent = (userLoader.charAt(0) + userLoader.slice(1)) || "Loader not selected";
        if (gameVersion) gameVersion.textContent = userVersion || "Version not selected";
    } catch (error) {
        console.error('Failed to load header:', error);
    }

    document.getElementById("manage-folders-btn").addEventListener("click", () => {
        window.location.href = "manage-folders.html";
    });

    document.getElementById("mods-btn").addEventListener("click", () => {
        window.location.href = "index.html";
    });

    document.getElementById("resourcepacks-btn").addEventListener("click", () => {
        window.location.href = "resourcepacks.html";
    });

    document.getElementById("shaders-btn").addEventListener("click", () => {
        window.location.href = "shaders.html";
    });

    document.getElementById("profile").addEventListener("click", () => {
        window.location.href = "user-profile.html";
    });
}
export { loadHeader };

async function loadTheme() {
    const theme = config.userSettings.theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'sys') {
        if (prefersDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    } else if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}
export { loadTheme };

async function downloadQuery(modId) {
    if (!config.userSettings.loader || !config.userSettings.version) {
        await showGameSettingsModal();
    }

    // https://api.modrinth.com/v2/project/YL57xq9U/version MANAGE FOLDER OR AT LEAST STORE IT
    try {
        const fetchProjectUrl = 'https://api.modrinth.com/v2/project/' + modId;
        const fetchedProjectData = await fetch(fetchProjectUrl);
        const projectData = await fetchedProjectData.json();

        if (!projectData.loaders.includes(userLoader)) {
            window.api.showErrorDialog("Requested loader not available for this mod");
            return;
        }

        if (!projectData.game_versions.includes(userVersion)) {
            window.api.showErrorDialog("Requested version not available for this mod");
            return;
        }

        const versionsListUrl = 'https://api.modrinth.com/v2/project/' + modId + '/version';
        const listRawData = await fetch(versionsListUrl);
        const versionsList = await listRawData.json();

        let foundVersion = null;

        // SEARCH FOR REALEASE VERSION?
        for (const version of versionsList) {
            if (version.game_versions.includes(userVersion) && version.loaders.includes(userLoader)) {
                foundVersion = version;
                break;
            }
        }
        console.log('https://api.modrinth.com/v2/project/' + modId + '/version/' + foundVersion.id)
        if (foundVersion == null) { console.error("Mod not Found"); return; }

        await startDownload(foundVersion);
    } catch (error) {
        console.error('Error invoking downloadFile:', error);
        alert(`Download failed: ${error.message}`);
    }
}
export { downloadQuery };

async function startDownload(version) {
    if (!config.userSettings.downloadPath) {
        await window.api.setDownloadPath();
    }

    const fileUrl = version.files[0].url;
    const fileName = version.files[0].filename ?? path.basename(fileUrl);

    window.api.downloadFile(fileUrl, fileName);

    //DOWNLOAD DEPENDENCY
    const depdendenciesList = version.dependencies;
    for (const dependency of depdendenciesList) {
        if (dependency.dependency_type == "required") {
            const projectVersion = dependency.version_id;
            const projectId = dependency.project_id;

            let dependencyUrl = '';
            if (projectVersion) {
                dependencyUrl = 'https://api.modrinth.com/v2/project/' + projectId + '/version/' + projectVersion;
            } else {
                dependencyUrl = 'https://api.modrinth.com/v2/project/' + projectId + '/version';
            }

            const dependencyRawJson = await fetch(dependencyUrl);
            let dependencyJson = await dependencyRawJson.json();

            if (!projectVersion) {
                for (const dependencyVersion of dependencyJson) {
                    if (dependencyVersion.game_versions.includes(userVersion) && dependencyVersion.loaders.includes(userLoader)) {
                        dependencyJson = dependencyVersion;
                        break;
                    }
                }
            }

            const dependencyFileUrl = dependencyJson.files[0].url;
            const depdendencfileName = dependencyJson.files[0].filename ?? path.basename(dependencyFileUrl);

            window.api.downloadFile(dependencyFileUrl, depdendencfileName);
        }
    }
}
export { startDownload };

async function insertPagination(container, totalItems, currentPage, itemsPerPage, loadingFunction) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const responseHtml = await fetch('../html/bones/pagination.html');
    const paginationTemplateHTML = await responseHtml.text();
    const paginationTemplate = document.createElement('template');
    paginationTemplate.innerHTML = paginationTemplateHTML;

    function createButton(page, pagesContainer, isActive = false) {
        const button = document.createElement('button');
        button.textContent = page;
        button.className = isActive ? 'activePage' : '';
        button.dataset.page = page;
        button.classList.add('pagination-button');

        button.addEventListener('click', () => {
            loadingFunction(page);
        });

        const li = document.createElement('li');
        li.appendChild(button);
        pagesContainer.appendChild(li);
    }

    container.appendChild(paginationTemplate.content.cloneNode(true));
    const pagesContainer = container.querySelector('#pages');
    pagesContainer.innerHTML = '';

    if (currentPage > 1) {
        createButton(1, pagesContainer);

        const separator = document.createElement('p');
        separator.textContent = "...";
        separator.style.margin = "0";
        separator.style.marginLeft = "5px";
        separator.style.marginRight = "5px";
        pagesContainer.appendChild(separator);
    }

    for (let page = currentPage; page <= currentPage + 4 && page <= totalPages; page++) {
        createButton(page, pagesContainer, page === currentPage);
    }

    if (currentPage < totalPages) {
        const separator = document.createElement('p');
        separator.textContent = "...";
        separator.style.margin = "0";
        separator.style.marginLeft = "5px";
        separator.style.marginRight = "5px";
        pagesContainer.appendChild(separator);

        createButton(totalPages, pagesContainer);
    }

    const prevButtonBottom = container.querySelector('#prev-btn');
    const nextButtonBottom = container.querySelector('#next-btn');

    prevButtonBottom.disabled = currentPage === 1;
    nextButtonBottom.disabled = currentPage === totalPages;

    prevButtonBottom.onclick = () => {
        if (currentPage > 1) {
            loadingFunction(currentPage - 1);
        }
    };

    nextButtonBottom.onclick = () => {
        if (currentPage < totalPages) {
            loadingFunction(currentPage + 1);
        }
    };
}
export { insertPagination };

async function showGameSettingsModal() {
    const response = await fetch('../html/bones/select-gameSettings-popUp.html');
    const templateHTML = await response.text();
    const template = document.createElement('template');
    template.innerHTML = templateHTML;

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.appendChild(template.content.cloneNode(true));
    document.body.appendChild(modal);

    await populateSelects();

    await new Promise((resolve, reject) => {
        const confirmButton = modal.querySelector('button');

        confirmButton.addEventListener('click', () => {
            const loaderSelect = document.getElementById('loader-select');
            const gameVersionSelect = document.getElementById('game-version-select');

            config.userSettings.loader = loaderSelect.value;
            config.userSettings.version = gameVersionSelect.value;

            userLoader = config.userSettings.loader;
            userVersion = config.userSettings.version;

            resolve();

            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                reject('User canceled the action');
                document.body.removeChild(modal);
            }
        });
    });

    loadHeader();
    await window.api.setUserSettings(config);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfigPromise;
    await loadTheme();

    loadHeader();
});