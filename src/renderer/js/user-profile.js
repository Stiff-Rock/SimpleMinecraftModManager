import { loadTheme } from './common-functions.js';
import { populateSelects } from "../js/game-settigns-fetch.js";

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const userVersion = await window.api.getVersion();
    const userLoader = await window.api.getLoader();
    const autoDownloadDependenciesSetting = await window.api.getAutoDownloadDependencies();
    const theme = await window.api.getTheme();

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
    downloadPathBtn.textContent = await window.api.getDownloadPath() ?? "Set Download Path";

    gameVersionSelect.addEventListener('change', (event) => {
      window.api.setVersion(event.target.value);
    });

    loaderSelect.addEventListener('change', (event) => {
      window.api.setLoader(event.target.value);
    });

    autoDownloadDependenciesSelect.addEventListener('change', (event) => {
      window.api.setAutodownloadDependencies(event.target.value === 'true');
    });

    themeSelect.addEventListener('change', (event) => {
      window.api.setTheme(event.target.value);
      loadTheme();
      location.reload();
    });

    downloadPathBtn.addEventListener('click', (_) => {
      window.api.setDownloadPath();
    });
  } catch (error) {
    console.error('Failed to load config:', error);
  }
});
