let config = {};
let theme = '';
let userLoader = '';
let userVersion = '';

async function loadConfig() {
    config = await window.api.getConfig()
    theme = config.userSettings.theme;
    userLoader = config.userSettings.loader;
    userVersion = config.userSettings.version;
    //MAKE CONFIG.JS
}
const loadConfigPromise = loadConfig();

async function loadHeader() {
    try {
        const response = await fetch('../html/header.html');
        if (!response.ok) throw new Error('Network response was not ok');
        const headerHTML = await response.text();
        document.querySelector('header').innerHTML = headerHTML;

        const loader = document.getElementById('loader');
        const gameVersion = document.getElementById('game-version');

        if (loader) loader.textContent = userLoader ?? "Loader not selected";
        if (gameVersion) gameVersion.textContent = userVersion ?? "Version not selected";
    } catch (error) {
        console.error('Failed to load header:', error);
    }


    document.getElementById("profile").addEventListener("click", () => {
        window.location.href = "user-profile.html";
    });

    document.getElementById("manage-folders-btn").addEventListener("click", () => {
        window.location.href = "index.html";
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
}

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

    if (!config.userSettings.downloadPath) {
        await window.api.setDownloadPath();
    }

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

        for (const version of versionsList) {
            if (version.game_versions.includes(userVersion) && version.loaders.includes(userLoader)) {
                foundVersion = version;
                break;
            }
        }

        const url = foundVersion.files[0].url;
        const fileName = foundVersion.files[0].filename ?? path.basename(url);
        await window.api.downloadFile(url, fileName);
    } catch (error) {
        console.error('Error invoking downloadFile:', error);
        alert(`Download failed: ${error.message}`);
    }
}
export { downloadQuery };

async function insertPagination(container, totalItems, currentPage, itemsPerPage, loadingFunction, addToTop = false) {
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

    function createPaginationButtons(pagesContainer) {
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
    }

    container.appendChild(paginationTemplate.content.cloneNode(true));
    const bottomPagesContainer = container.querySelector('#pages');
    createPaginationButtons(bottomPagesContainer);

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

    if (addToTop) {
        const topPaginationContainer = document.createElement('div');
        topPaginationContainer.innerHTML = paginationTemplateHTML;
        container.prepend(topPaginationContainer);

        const topPagesContainer = topPaginationContainer.querySelector('#pages');
        createPaginationButtons(topPagesContainer);

        const prevButtonTop = topPaginationContainer.querySelector('#prev-btn');
        const nextButtonTop = topPaginationContainer.querySelector('#next-btn');

        prevButtonTop.disabled = currentPage === 1;
        nextButtonTop.disabled = currentPage === totalPages;

        prevButtonTop.onclick = () => {
            if (currentPage > 1) {
                loadingFunction(currentPage - 1);
            }
        };

        nextButtonTop.onclick = () => {
            if (currentPage < totalPages) {
                loadingFunction(currentPage + 1);
            }
        };
    }
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

    await new Promise((resolve, reject) => {
        const confirmButton = modal.querySelector('button');

        confirmButton.addEventListener('click', () => {
            config.userSettings.loader = modal.querySelector('#loader').value;
            config.userSettings.version = modal.querySelector('#game-version').value;
            resolve();
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                reject(new Error('User canceled the action'));
                document.body.removeChild(modal);
            }
        });
    });

    await window.api.setUserSettings(config);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfigPromise;
    await loadTheme();
    loadHeader();
});
