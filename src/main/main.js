const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');
const JSZip = require('jszip');
const toml = require('toml');
const { rejects } = require('assert');

let config = {};
const configPath = path.join(__dirname, '..', 'config', 'config.json');
let userDownloadDirectory = null;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    icon: path.join(__dirname, '../images/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  win.loadFile('src/renderer/html/index.html')
}

function loadConfig() {
  try {
    const rawData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(rawData);

    userDownloadDirectory = config.userSettings.downloadPath;
    if (!config.userSettings.theme) {
      config.userSettings.theme = "sys";
    }

  } catch (error) {
    console.error('Error loading config:', error);
    dialog.showMessageBox({
      type: 'error',
      title: 'Configuration Error',
      message: 'Could not load configuration file. Please check the config.json file.',
    });
  }
}
loadConfig()

async function selectDirectory() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath: path.join(os.homedir()),
  });

  if (result.filePaths.length > 0) {
    const userDownloadDirectory = result.filePaths[0];
    config.userSettings.downloadPath = userDownloadDirectory;
    setUserSettings(config);
    return userDownloadDirectory;
  }
  return null;
}

function setUserSettings(newConfig) {
  try {
    config = newConfig;
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
  } catch (error) {
    console.error('Error writing config file:', error);
  }
}

function showErrorDialog(message) {
  dialog.showMessageBox({
    type: 'error',
    title: 'Error',
    message: message,
    buttons: ['OK']
  });
}

function loadModFolderList() {
  const dir = config.userSettings.downloadPath;

  return new Promise((resolve, reject) => {
    fs.readdir(dir, async (err, files) => {
      if (err) return reject(err);

      const jarFiles = files.filter(file => file.endsWith('.jar'));

      let modsList = [];
      let modInfo = [];

      for (const jarFile of jarFiles) {
        try {

          const zip = await JSZip.loadAsync(fs.readFileSync(path.join(dir, jarFile)));

          const file = zip.file('fabric.mod.json') || zip.file('META-INF/mods.toml');

          if (file) {
            const extension = path.extname(file.name);
            if (extension === '.json') {
              const rawData = await file.async('string');
              const jsonData = JSON.parse(rawData);

              modInfo = [jsonData.name, jsonData.version, jsonData.description, jarFile];
            } else if (extension === '.toml') {
              const rawData = await file.async('string');
              const tomlData = toml.parse(rawData);
              const mod = tomlData.mods[0];

              modInfo = [mod.displayName, mod.version, mod.description, jarFile];
            }

            if (modInfo) {
              modsList.push(modInfo);
            } else {
              console.log(`No .json or .toml found in .jar at ${jarFile}`);
            }
          } else {
            console.log(`No mod metadata of any kind found at ${jarFile}`);
          }
        } catch (error) {
          console.error('Error reading JAR file:', error);
        }
      }

      resolve(modsList);
    });
  });
}

ipcMain.handle('load-mod-folder-list', async () => {
  try {
    return loadModFolderList();
  } catch (err) {
    console.error('Error loading mod folder list:', err);
    return [];
  }
});

ipcMain.handle('delete-file', async (_, fileName) => {
  const filePath = path.join(userDownloadDirectory, fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file: ${err.message}`);
      return;
    }
    console.log('File deleted successfully!');
  });

})

ipcMain.handle('get-config', async () => {
  return config;
});

ipcMain.handle('download-file', async (_, url, fileName) => {
  if (!userDownloadDirectory) {
    await selectDirectory();
    if (!userDownloadDirectory) {
      return { status: 'error', msg: 'Download directory not selected.' };
    }
  }

  const filePath = path.join(userDownloadDirectory, fileName);

  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      dialog.showMessageBox({
        type: 'info',
        title: 'Download Canceled',
        message: `File already exists at ${filePath}.`
      });
      return resolve();
    }

    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        dialog.showMessageBox({
          type: 'error',
          title: 'Download Failed',
          message: 'Unable to get file. Please check the URL and try again.'
        });
        return reject();
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          dialog.showMessageBox({
            type: 'info',
            title: 'Download Complete',
            message: 'The file has been downloaded successfully.'
          });
          resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {
        dialog.showMessageBox({
          type: 'error',
          title: 'Download Failed',
          message: `An error occurred: ${err.message}`
        });
        reject();
      });
    });
  });
});

ipcMain.handle('dialog:openDirectory', async () => {
  const selectedPath = await selectDirectory();
  if (!selectedPath) {
    return { status: 'error', msg: 'Download directory not selected.' };
  }
  return { status: 'success', path: selectedPath };
});

ipcMain.handle('showErrorDialog', async (_, message) => {
  showErrorDialog(message)
});

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

// IPC Handlers with direct value return
ipcMain.handle('get-mod-folder', () => {
  return config.modFolder;
});

ipcMain.handle('get-download-path', () => {
  return config.userSettings.downloadPath;
});

ipcMain.handle('get-theme', () => {
  return config.userSettings.theme;
});

ipcMain.handle('get-loader', () => {
  return config.userSettings.loader;
});

ipcMain.handle('get-version', () => {
  return config.userSettings.version;
});

ipcMain.handle('get-auto-download-dependencies', () => {
  return config.userSettings.autoDownloadDependencies;
});

ipcMain.handle('get-prefer-release', () => {
  return config.userSettings.preferRelease;
});

ipcMain.handle('set-mod-folder', (_, folder) => {
  setModFolder(folder);
});

ipcMain.handle('set-download-path', (_, path) => {
  setDownloadPath(path);
});

ipcMain.handle('set-theme', (_, theme) => {
  setTheme(theme);
});

ipcMain.handle('set-loader', (_, loader) => {
  setLoader(loader);
});

ipcMain.handle('set-version', (_, version) => {
  setVersion(version);
});

ipcMain.handle('set-auto-download-dependencies', (_, value) => {
  setAutoDownloadDependencies(value);
});

ipcMain.handle('set-prefer-release', (_, value) => {
  setPreferRelease(value);
});

function updateConfigFile() {
  try {
    fs.writeFileSync(path.join(__dirname, '..', 'config', 'config.json'), JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error writing config file:', error);
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
