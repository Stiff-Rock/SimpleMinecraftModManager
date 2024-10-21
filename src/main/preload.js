const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  setDownloadPath: () => ipcRenderer.invoke('dialog:openDirectory'),
  downloadFile: (url, fileName) => ipcRenderer.invoke('download-file', url, fileName)
});
