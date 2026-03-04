interface UpdateCheckResult {
  updateAvailable: boolean;
  version?: string;
  description?: string;
}

// Module-level variables
let autoUpdater: any = null;
let ipcMain: any = null;

// Try to load electron-updater (may not be available in production)
async function getAutoUpdater() {
  if (autoUpdater) return autoUpdater;

  try {
    const module = await import("electron-updater");
    autoUpdater = module.autoUpdater;
    return autoUpdater;
  } catch (error) {
    console.warn("electron-updater not available, update checking disabled");
    return null;
  }
}

async function getIpcMain() {
  if (ipcMain) return ipcMain;

  try {
    const module = await import("electron");
    ipcMain = module.ipcMain;
    return ipcMain;
  } catch (error) {
    console.error("Failed to load ipcMain:", error);
    return null;
  }
}

export async function initializeUpdater(mainWindow: any) {
  const updater = await getAutoUpdater();
  const ipc = await getIpcMain();

  // Skip if updater is not available
  if (!updater || !ipc) {
    console.log("Update checking is disabled");

    // Register stub handlers
    ipc?.handle("check-for-updates", async () => ({
      updateAvailable: false,
    }));
    ipc?.handle("install-update", async () => {
      throw new Error("Update checking is disabled");
    });
    ipc?.handle("download-update", async () => ({
      success: false,
      error: "Update checking is disabled",
    }));
    return;
  }

  // Configure auto updater
  updater.checkForUpdatesAndNotify();

  // Listen for update available event
  updater.on("update-available", (info: any) => {
    console.log("Update available:", info.version);
    mainWindow.webContents.send("update-available", {
      version: info.version,
      description: info.releaseNotes,
    });
  });

  // Listen for update not available
  updater.on("update-not-available", () => {
    console.log("Update not available");
    mainWindow.webContents.send("update-not-available");
  });

  // Listen for download progress
  updater.on("download-progress", (progress: any) => {
    mainWindow.webContents.send("download-progress", {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      total: progress.total,
      transferred: progress.transferred,
    });
  });

  // Listen for update downloaded
  updater.on("update-downloaded", (info: any) => {
    console.log("Update downloaded:", info.version);
    mainWindow.webContents.send("update-downloaded", {
      version: info.version,
    });
  });

  // Handle errors
  updater.on("error", (err: any) => {
    console.error("Auto updater error:", err);
    mainWindow.webContents.send("update-error", {
      message: err.message,
    });
  });

  // IPC handlers
  ipc.handle("check-for-updates", async () => {
    try {
      const result = await updater.checkForUpdates();
      return {
        updateAvailable: !!result?.updateInfo,
        version: result?.updateInfo?.version,
      };
    } catch (error: any) {
      console.error("Error checking for updates:", error);
      return {
        updateAvailable: false,
        error: error.message,
      };
    }
  });

  ipc.handle("install-update", async () => {
    return updater.quitAndInstall();
  });

  ipc.handle("download-update", async () => {
    try {
      await updater.downloadUpdate();
      return { success: true };
    } catch (error: any) {
      console.error("Error downloading update:", error);
      return { success: false, error: error.message };
    }
  });
}

export async function checkForUpdatesOnStartup(mainWindow: any) {
  setImmediate(async () => {
    const updater = await getAutoUpdater();
    if (updater) {
      try {
        updater.checkForUpdates();
      } catch (error: any) {
        console.error("Error checking for updates on startup:", error);
      }
    }
  });
}
