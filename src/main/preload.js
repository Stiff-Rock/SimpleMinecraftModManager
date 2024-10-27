const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  setDownloadPath: () => ipcRenderer.invoke('dialog:openDirectory'),
  setUserSettings: (config) => ipcRenderer.invoke('setUserSettings', config),
  downloadFile: (url, fileName) => ipcRenderer.invoke('download-file', url, fileName),
  showErrorDialog: (message) => ipcRenderer.invoke('showErrorDialog', message)
});
