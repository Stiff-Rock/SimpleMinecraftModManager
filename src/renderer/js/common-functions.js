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
        window.location.href = "index.html";
    });

    document.getElementById("shaders-btn").addEventListener("click", () => {
        window.location.href = "index.html";
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
    if (!config.userSettings.downloadPath) {
        await window.api.setDownloadPath();
    }

    try {
        const fetchProjectUrl = 'https://api.modrinth.com/v2/project/' + modId;
        const fetchedProjectData = await fetch(fetchProjectUrl);
        const projectData = await fetchedProjectData.json();

        if (!projectData.loaders.includes(userLoader)) {
            console.error("This mod is not available for the requested loader");
            return;
        }

        if (!projectData.game_versions.includes(userVersion)) {
            console.error("This mod is not available for the requested version");
            return;
        }

        const versionsListUrl = 'https://api.modrinth.com/v2/project/' + modId + '/version';
        const listRawData = await fetch(versionsListUrl);
        const versionsList = await listRawData.json();

        let foundVersion = null;

        for (const version of versionsList) {
            if (version.game_versions[0] === userVersion && version.loaders[0] === userLoader) {
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

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfigPromise;
    await loadTheme();
    loadHeader();
});
