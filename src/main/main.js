const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');

let configPath = '';
let config = {};
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
    configPath = path.join(__dirname, '..', 'config', 'config.json');
    const rawData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(rawData);
    userDownloadDirectory = config.downloadPath;

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

ipcMain.handle('get-config', async () => {
  return config;
});

async function selectDirectory() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath: path.join(os.homedir()),
  });
  if (result.filePaths.length > 0) {
    userDownloadDirectory = result.filePaths[0];
    config.downloadPath = userDownloadDirectory;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
}

ipcMain.handle('dialog:openDirectory', async () => {
  selectDirectory()
  if (!userDownloadDirectory) {
    return { status: 'error', msg: 'Download directory not selected.' };
  }
});

ipcMain.handle('download-file', async (event, url, fileName) => {
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

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})