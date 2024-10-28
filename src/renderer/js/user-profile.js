import { loadTheme } from './common-functions.js';
import { populateSelects } from "../js/game-settigns-fetch.js";

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
        const downloadPathBtn = document.getElementById('downloadPath-btn');

        await populateSelects();

        gameVersionSelect.value = userVersion || '';
        loaderSelect.value = userLoader || '';
        autoDownloadDependenciesSelect.value = autoDownloadDependenciesSetting;
        themeSelect.value = theme || 'sys';
        downloadPathBtn.textContent = config.userSettings.downloadPath ?? "Set Download Path";

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

        downloadPathBtn.addEventListener('click', (event) => {
            window.api.setDownloadPath();
        });
    } catch (error) {
        console.error('Failed to load config:', error);
    }
});