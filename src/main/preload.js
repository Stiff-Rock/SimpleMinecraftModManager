const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Configuration-related methods
  getModFolder: () => ipcRenderer.invoke('get-mod-folder'),
  getDownloadPath: () => ipcRenderer.invoke('get-download-path'),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  getLoader: () => ipcRenderer.invoke('get-loader'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  getAutoDownloadDependencies: () => ipcRenderer.invoke('get-auto-download-dependencies'),
  getPreferRelease: () => ipcRenderer.invoke('get-prefer-release'),
  
  setModFolder: (folder) => ipcRenderer.invoke('set-mod-folder', folder),
  setDownloadPath: () => ipcRenderer.invoke('dialog:openDirectory'),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  setLoader: (loader) => ipcRenderer.invoke('set-loader', loader),
  setVersion: (version) => ipcRenderer.invoke('set-version', version),
  setAutoDownloadDependencies: (value) => ipcRenderer.invoke('set-auto-download-dependencies', value),
  setPreferRelease: (value) => ipcRenderer.invoke('set-prefer-release', value),

  // Other existing methods
  downloadFile: (url, fileName) => ipcRenderer.invoke('download-file', url, fileName),
  showErrorDialog: (message) => ipcRenderer.invoke('showErrorDialog', message)
});

