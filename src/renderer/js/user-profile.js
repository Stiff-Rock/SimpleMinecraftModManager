import { loadTheme } from './common-functions.js';

let loaders = [];
let gameVersions = [];

async function loadLoaders() {
    try {

    } catch (error) {
        console.error("Failed to fetching game-settings-tags:", error);
    }
    const response = await fetch("https://api.modrinth.com/v2/tag/loader");
    const data = await response.json();

    const filter = ["mod", "project", "modpack"];

    data.forEach(element => {
        if (filter.every(type => element.supported_project_types.includes(type))) {
            loaders.push(element.name);
        }
    });
}
const loadersLoading = loadLoaders();

async function loadGameVersions() {
    try {

    } catch (error) {
        console.error("Failed to fetching game-settings-tags:", error);
    }
    const response = await fetch("https://api.modrinth.com/v2/tag/game_version");
    const data = await response.json();

    data.forEach(element => {
        if (element.version_type == "release") {
            gameVersions.push(element.version);
        }
    });
}
const gameVersionsLoading = loadGameVersions();

async function populateSelects() {
    await loadersLoading;
    await gameVersionsLoading;

    const loaderSelect = document.getElementById("loader-select");
    const gameVersionSelect = document.getElementById("game-version-select");

    loaders.forEach(loader => {
        const option = document.createElement('option');
        option.value = loader;
        option.textContent = loader.charAt(0).toUpperCase() + loader.slice(1);
        loaderSelect.appendChild(option);
    });

    gameVersions.forEach(version => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = version;
        gameVersionSelect.appendChild(option);
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        let config = await window.api.getConfig();

        const userVersion = config.userSettings.version;
        const userLoader = config.userSettings.loader;
        const autoDownloadDependenciesSetting = config.userSettings.autoDownloadDependencies;
        const theme = config.userSettings.theme;

        const gameVersionSelect = document.getElementById('game-version-select');
        const loaderSelect = document.getElementById('loader-select');
        const autoDownloadDependenciesSelect = document.getElementById('autoDownloadDependencies');
        const themeSelect = document.getElementById('theme');

        await populateSelects();;

        gameVersionSelect.value = userVersion || '';
        loaderSelect.value = userLoader || '';
        autoDownloadDependenciesSelect.value = autoDownloadDependenciesSetting;
        themeSelect.value = theme || 'sys';

        gameVersionSelect.addEventListener('change', (event) => {
            config.userSettings.version = event.target.value;
            window.api.setUserSettings(config);
        });

        loaderSelect.addEventListener('change', (event) => {
            config.userSettings.loader = event.target.value;
            window.api.setUserSettings(config);
        });

        autoDownloadDependenciesSelect.addEventListener('change', (event) => {
            config.userSettings.autoDownloadDependencies = (event.target.value === 'true');
            window.api.setUserSettings(config);
        });

        themeSelect.addEventListener('change', (event) => {
            config.userSettings.theme = event.target.value;
            window.api.setUserSettings(config);
            loadTheme();
            location.reload();
        });
    } catch (error) {
        console.error('Failed to load config:', error);
    }
});