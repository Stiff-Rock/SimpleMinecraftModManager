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
export { populateSelects };

let populateSelectPomise
export { populateSelectPomise };

document.addEventListener("DOMContentLoaded", () => {
    populateSelectPomise = populateSelects();
});



