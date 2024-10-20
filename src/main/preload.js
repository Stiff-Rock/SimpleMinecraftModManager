const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  setDownloadPath: () => ipcRenderer.invoke('dialog:openDirectory')
})