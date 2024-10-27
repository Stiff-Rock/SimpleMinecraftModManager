import { loadTheme } from './common-functions.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        let config = await window.api.getConfig();

        const userVersion = config.userSettings.version;
        const userLoader = config.userSettings.loader;
        const autoDownloadDependenciesSetting = config.userSettings.autoDownloadDependencies;
        const theme = config.userSettings.theme;

        document.getElementById('game-version').value = userVersion || '';
        document.getElementById('loader').value = userLoader || '';
        document.getElementById('autoDownloadDependencies').value = autoDownloadDependenciesSetting;
        document.getElementById('theme').value = theme || 'sys';

        document.getElementById('game-version').addEventListener('change', (event) => {
            config.userSettings.version = event.target.value;
            window.api.setUserSettings(config);
        });

        document.getElementById('loader').addEventListener('change', (event) => {
            config.userSettings.loader = event.target.value;
            window.api.setUserSettings(config);
        });

        document.getElementById('autoDownloadDependencies').addEventListener('change', (event) => {
            config.userSettings.autoDownloadDependencies = (event.target.value === 'true');
            window.api.setUserSettings(config);
        });

        document.getElementById('theme').addEventListener('change', (event) => {
            config.userSettings.theme = event.target.value;
            window.api.setUserSettings(config);
            loadTheme();
            location.reload();
        });

    } catch (error) {
        console.error('Failed to load config:', error);
    }
});