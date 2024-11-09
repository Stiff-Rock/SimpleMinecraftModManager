const { ipcMain } = require('electron');

let config = {};

// Function to load the initial configuration from a provided object
function loadConfigFile(fetchedConfig) {
  config = fetchedConfig;
}
module.exports = { loadConfigFile };

// IPC Handlers
ipcMain.handle('get-mod-folder', () => {
  return getModFolder();
});

ipcMain.handle('get-download-path', () => {
  return getDownloadPath();
});

ipcMain.handle('get-theme', () => {
  return getTheme();
});

ipcMain.handle('get-loader', () => {
  return getLoader();
});

ipcMain.handle('get-version', () => {
  return getVersion();
});

ipcMain.handle('get-auto-download-dependencies', () => {
  return getAutoDownloadDependencies();
});

ipcMain.handle('get-prefer-release', () => {
  return getPreferRelease();
});

ipcMain.handle('set-mod-folder', (event, folder) => {
  setModFolder(folder);
});

ipcMain.handle('set-download-path', (event, path) => {
  setDownloadPath(path);
});

ipcMain.handle('set-theme', (event, theme) => {
  setTheme(theme);
});

ipcMain.handle('set-loader', (event, loader) => {
  setLoader(loader);
});

ipcMain.handle('set-version', (event, version) => {
  setVersion(version);
});

ipcMain.handle('set-auto-download-dependencies', (event, value) => {
  setAutoDownloadDependencies(value);
});

ipcMain.handle('set-prefer-release', (event, value) => {
  setPreferRelease(value);
});

// Getters
function getModFolder() {
  return config.modFolder;
}

function getDownloadPath() {
  return config.userSettings.downloadPath;
}

function getTheme() {
  return config.userSettings.theme;
}

function getLoader() {
  return config.userSettings.loader;
}

function getVersion() {
  return config.userSettings.version;
}

function getAutoDownloadDependencies() {
  return config.userSettings.autoDownloadDependencies;
}

function getPreferRelease() {
  return config.userSettings.preferRelease;
}

// Setters
function setModFolder(folder) {
  config.modFolder = folder;
  updateConfigFile();
}

function setDownloadPath(path) {
  config.userSettings.downloadPath = path;
  updateConfigFile();
}
module.exports = {
  loadConfigFile,
  // If you need to export config as well, you can uncomment the line below
  // config,
}
function setTheme(theme) {
  config.userSettings.theme = theme;
  updateConfigFile();
}

function setLoader(loader) {
  config.userSettings.loader = loader;
  updateConfigFile();
}

function setVersion(version) {
  config.userSettings.version = version;
  updateConfigFile();
}

function setAutoDownloadDependencies(value) {
  config.userSettings.autoDownloadDependencies = value;
  updateConfigFile();
}

function setPreferRelease(value) {
  config.userSettings.preferRelease = value;
  updateConfigFile();
}

// Function to update the configuration file
function updateConfigFile() {
  try {
    fs.writeFileSync(path.join(__dirname, '..', 'config', 'config.json'), JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error writing config file:', error);
  }
}
