import { app, BrowserWindow, ipcMain, Menu } from "electron";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { initializeUpdater, checkForUpdatesOnStartup } from "./updater.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if running in development mode
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let mainWindow: any = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    frame: false, // Remove native frame for custom titlebar
    titleBarStyle: "hidden", // Hide default titlebar
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true, // Additional security
    },
    icon: path.join(__dirname, "../public/jtech-small-color.png"),
  });

  let startUrl;
  if (isDev) {
    startUrl = "http://localhost:5173";
  } else {
    // In production, load from dist/index.html
    // In ASAR: __dirname is app.asar/dist/electron
    // Going up one level (..) gets us to app.asar/dist where index.html is
    const indexPath = path.join(__dirname, "..", "index.html");
    startUrl = pathToFileURL(indexPath).toString();
  }

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Initialize auto updater
  initializeUpdater(mainWindow);

  // Check for updates on startup
  if (!isDev) {
    checkForUpdatesOnStartup(mainWindow);
  }
};

// Create application menu
const createMenu = () => {
  const template: Array<any> = [
    {
      label: "File",
      submenu: [
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Redo", accelerator: "CmdOrCtrl+Y", role: "redo" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { label: "Reload", accelerator: "CmdOrCtrl+R", role: "reload" },
        {
          label: "Toggle Developer Tools",
          accelerator: "CmdOrCtrl+I",
          role: "toggleDevTools",
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

app.on("ready", () => {
  createWindow();
  createMenu();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow == null) {
    createWindow();
  }
});

// Handle IPC messages from the renderer
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

// Window control handlers
ipcMain.handle("window-minimize", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle("window-close", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle("window-is-maximized", () => {
  if (mainWindow) {
    return mainWindow.isMaximized();
  }
  return false;
});
