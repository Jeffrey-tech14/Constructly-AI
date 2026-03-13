const { contextBridge, ipcRenderer } = require("electron");

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  onUpdateAvailable: (callback: any) =>
    ipcRenderer.on("update-available", (_event: any, data: any) =>
      callback(data),
    ),
  onUpdateNotAvailable: (callback: any) =>
    ipcRenderer.on("update-not-available", callback),
  onDownloadProgress: (callback: any) =>
    ipcRenderer.on("download-progress", (_event: any, data: any) =>
      callback(data),
    ),
  onUpdateDownloaded: (callback: any) =>
    ipcRenderer.on("update-downloaded", (_event: any, data: any) =>
      callback(data),
    ),
  onUpdateError: (callback: any) =>
    ipcRenderer.on("update-error", (_event: any, data: any) => callback(data)),

  // Window control functions
  windowMinimize: () => ipcRenderer.invoke("window-minimize"),
  windowMaximize: () => ipcRenderer.invoke("window-maximize"),
  windowClose: () => ipcRenderer.invoke("window-close"),
  windowIsMaximized: () => ipcRenderer.invoke("window-is-maximized"),
});
