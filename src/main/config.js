let config = {};

// Function to load the initial configuration from a provided object
function loadConfigFile(fetchedConfig) {
  config = fetchedConfig;
}

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