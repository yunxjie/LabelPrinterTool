const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('labelAPI', {
  chooseHistoryDir: () => ipcRenderer.invoke('choose-history-dir'),
  getHistoryInfo: () => ipcRenderer.invoke('get-history-info'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  saveHistory: (item) => ipcRenderer.invoke('save-history', item),
  printLabel: (payload) => ipcRenderer.invoke('print-label', payload)
});
