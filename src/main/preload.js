const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // config getters
  getModFolder: () => ipcRenderer.invoke('get-mod-folder'),
  getDownloadPath: () => ipcRenderer.invoke('get-download-path'),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  getLoader: () => ipcRenderer.invoke('get-loader'),
  getVersion: () => ipcRenderer.invoke('get-version'),
  getAutoDownloadDependencies: () => ipcRenderer.invoke('get-auto-download-dependencies'),
  getPreferRelease: () => ipcRenderer.invoke('get-prefer-release'),
  // config setters
  setModFolder: (folder) => ipcRenderer.invoke('set-mod-folder', folder),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  setLoader: (loader) => ipcRenderer.invoke('set-loader', loader),
  setVersion: (version) => ipcRenderer.invoke('set-version', version),
  setAutoDownloadDependencies: (value) => ipcRenderer.invoke('set-auto-download-dependencies', value),
  setPreferRelease: (value) => ipcRenderer.invoke('set-prefer-release', value),

  // Other existing methods
  loadModFolderList: () => ipcRenderer.invoke('load-mod-folder-list'),
  deleteFile: (fileName) => ipcRenderer.invoke('delete-file', fileName),
  getConfig: () => ipcRenderer.invoke('get-config'),
  setDownloadPath: () => ipcRenderer.invoke('dialog:openDirectory'),
  downloadFile: (url, fileName) => ipcRenderer.invoke('download-file', url, fileName),
  showErrorDialog: (message) => ipcRenderer.invoke('showErrorDialog', message)
});

