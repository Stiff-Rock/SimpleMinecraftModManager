const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');
const { log } = require('console');

let config = {};
const configPath = path.join(__dirname, '..', 'config', 'config.json');
let userDownloadDirectory = null;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
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
  return new Promise((resolve, reject) => {
    const dir = config.userSettings.downloadPath;

    fs.readdir(dir, (err, files) => {
      if (err) {
        window.api.showErrorDialog("Error reading mod folder");
        reject(err); // Reject the promise with the error
        return;
      }

      // Filter the files that end with '.jar'
      const jarFiles = files.filter(archivo => archivo.endsWith('.jar'));
      resolve(jarFiles); // Resolve the promise with the filtered list
    });
  });
}

// Handling the request from the renderer process using IPC
ipcMain.handle('load-mod-folder-list', async () => {
  try {
    return await loadModFolderList(); // Await the result of the Promise
  } catch (err) {
    console.error('Error loading mod folder list:', err);
    return []; // Return an empty array in case of error
  }
});

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
