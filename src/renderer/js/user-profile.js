import { loadTheme } from './common-functions.js';
import { populateSelects } from "../js/game-settigns-fetch.js";
import * as config from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const userVersion = config.getVersion();
        const userLoader = config.getLoader();
        const autoDownloadDependenciesSetting = config.getAutoDownloadDependencies();
        const theme = config.getTheme();

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
        downloadPathBtn.textContent = config.getDownloadPath() ?? "Set Download Path";

        gameVersionSelect.addEventListener('change', (event) => {
            config.setVersion(event.target.value);
        });

        loaderSelect.addEventListener('change', (event) => {
            config.setLoader(event.target.value);
        });

        autoDownloadDependenciesSelect.addEventListener('change', (event) => {
            config.setAutodownloadDependencies(event.target.value === 'true');
        });

        themeSelect.addEventListener('change', (event) => {
            config.setTheme(event.target.value);
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
