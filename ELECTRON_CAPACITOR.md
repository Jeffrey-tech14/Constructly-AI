# Electron & Capacitor Integration Guide

> How Constructly AI ships as a web app, a Windows/macOS desktop app (Electron), and an Android mobile app (Capacitor) — all from a single React + TypeScript codebase.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Electron (Desktop)](#electron-desktop)
  - [Project Structure](#electron-project-structure)
  - [Main Process](#main-process)
  - [Preload Script](#preload-script)
  - [Auto-Updater](#auto-updater)
  - [Custom Titlebar](#custom-titlebar)
  - [Build Pipeline](#build-pipeline)
  - [Vite Configuration](#vite-configuration)
  - [Supabase Auth in Electron](#supabase-auth-in-electron)
  - [Routing (HashRouter)](#routing-hashrouter)
  - [Building & Distribution](#building--distribution)
- [Capacitor (Mobile)](#capacitor-mobile)
  - [Capacitor Configuration](#capacitor-configuration)
  - [Android Project](#android-project)
  - [Building for Android](#building-for-android)
- [Platform Detection](#platform-detection)
- [Key Differences by Platform](#key-differences-by-platform)
- [Common Pitfalls & Solutions](#common-pitfalls--solutions)

---

## Architecture Overview

Constructly AI uses a **single React + TypeScript codebase** that targets three platforms:

| Platform    | Technology                  | Distribution                                    |
| ----------- | --------------------------- | ----------------------------------------------- |
| **Web**     | Vite + React                | Hosted (Vercel/Render)                          |
| **Desktop** | Electron + electron-builder | Windows NSIS installer, portable exe; macOS DMG |
| **Mobile**  | Capacitor + Android SDK     | APK / Google Play                               |

The web app is the canonical build. Electron wraps it in a Chromium shell for desktop, and Capacitor wraps it in a native Android WebView for mobile. Platform-specific behavior (custom titlebar, auth storage, routing) is toggled at runtime using platform detection flags.

```
┌─────────────────────────────────────────────────┐
│              React + TypeScript App              │
│         (Vite build → static HTML/JS/CSS)        │
├──────────┬──────────────────┬────────────────────┤
│   Web    │     Electron     │     Capacitor      │
│  Browser │  Chromium Shell  │  Android WebView   │
│          │  + Node.js APIs  │  + Native Bridge   │
└──────────┴──────────────────┴────────────────────┘
```

---

## Electron (Desktop)

### Electron Project Structure

```
electron/
├── main.ts          # Main process — window creation, menu, IPC handlers
├── preload.ts       # Preload script — secure IPC bridge (contextBridge)
└── updater.ts       # Auto-update logic via electron-updater

src/
├── components/
│   ├── CustomTitleBar.tsx   # Custom frameless window titlebar
│   ├── CustomTitleBar.css   # Titlebar styles (position: fixed, z-index: 9999)
│   └── UpdateNotifier.tsx   # In-app update notification UI
├── electron.d.ts            # TypeScript declarations for window.electronAPI

scripts/
├── copy-electron.js         # Copies compiled Electron files into dist/

electron-builder.yml         # electron-builder configuration
tsconfig.electron.json       # TypeScript config for Electron files
```

### Main Process

**File:** `electron/main.ts`

The main process creates a frameless `BrowserWindow` and loads the app:

```typescript
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
      sandbox: true,
    },
  });

  // In development: load from Vite dev server
  // In production: load from local file
  if (isDev) {
    startUrl = "http://localhost:5173";
  } else {
    const indexPath = path.join(__dirname, "..", "index.html");
    startUrl = pathToFileURL(indexPath).toString();
  }

  mainWindow.loadURL(startUrl);
};
```

**Key details:**

- `frame: false` removes the native OS window frame so we can render a custom titlebar
- `contextIsolation: true` + `sandbox: true` ensures security — the renderer cannot access Node.js APIs directly
- In production, `pathToFileURL()` is used to correctly convert Windows backslash paths to `file://` URLs
- IPC handlers are registered for window controls (minimize, maximize, close, isMaximized) and app version

### Preload Script

**File:** `electron/preload.ts`

The preload script uses Electron's `contextBridge` to expose a safe API on `window.electronAPI`:

```typescript
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // App info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Auto-update
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  onUpdateAvailable: (callback) => ipcRenderer.on("update-available", ...),
  onDownloadProgress: (callback) => ipcRenderer.on("download-progress", ...),
  onUpdateDownloaded: (callback) => ipcRenderer.on("update-downloaded", ...),

  // Window controls
  windowMinimize: () => ipcRenderer.invoke("window-minimize"),
  windowMaximize: () => ipcRenderer.invoke("window-maximize"),
  windowClose: () => ipcRenderer.invoke("window-close"),
  windowIsMaximized: () => ipcRenderer.invoke("window-is-maximized"),
});
```

> **Important:** The preload script uses **CommonJS** (`require`) even though the rest of the project uses ES modules. This is an Electron requirement for preload scripts.

TypeScript declarations for this API live in `src/electron.d.ts`:

```typescript
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      checkForUpdates: () => Promise<{
        updateAvailable: boolean;
        version?: string;
      }>;
      windowMinimize: () => Promise<void>;
      windowMaximize: () => Promise<void>;
      windowClose: () => Promise<void>;
      windowIsMaximized: () => Promise<boolean>;
      // ... update event listeners
    };
  }
}
```

### Auto-Updater

**File:** `electron/updater.ts`

Uses `electron-updater` to check GitHub Releases for new versions:

- On startup, calls `checkForUpdatesOnStartup()` to silently check
- Sends IPC events to the renderer: `update-available`, `download-progress`, `update-downloaded`, `update-error`
- The renderer's `UpdateNotifier` component listens for these events and shows a toast/dialog

**Publishing:** Configured in `electron-builder.yml`:

```yaml
publish:
  provider: github
  owner: Jeffrey-tech14
  repo: Constructly-AI
```

When a new GitHub Release is created with the built installer, existing installations will detect and offer to install the update.

### Custom Titlebar

Since the native frame is disabled (`frame: false`), a custom React titlebar component replaces it:

**`CustomTitleBar.tsx`** renders:

- A draggable region (`-webkit-app-region: drag`) for moving the window
- Minimize, maximize/restore, and close buttons wired to IPC calls
- Fixed positioning at `top: 0; z-index: 9999; height: 40px`
- A spacer `<div>` (40px) immediately after the titlebar to push page content below

**Layout stacking order (top to bottom):**

1. `CustomTitleBar` — fixed, z-index 9999, 40px tall
2. Titlebar spacer — 40px in document flow
3. `Navbar` — sticky, `top: 40px` in Electron (below titlebar)
4. Page content — normal flow

### Build Pipeline

The Electron build has four stages:

```
1. tsc --project tsconfig.electron.json
   → Compiles electron/*.ts to .electron-dist/ (ES modules)

2. vite build --mode electron
   → Builds React app to dist/ with base: "./" (relative paths)

3. node scripts/copy-electron.js
   → Copies .electron-dist/ files into dist/electron/

4. electron-builder --win (or --mac)
   → Packages dist/ into ASAR archive and creates installer
```

**NPM scripts:**

```json
{
  "build:electron:win": "npm run build:electron-main && vite build --mode electron && npm run copy:electron && electron-builder --win",
  "build:electron:mac": "npm run build:electron-main && vite build --mode electron && npm run copy:electron && electron-builder --mac",
  "build:electron:all": "npm run build:electron-main && vite build --mode electron && npm run copy:electron && electron-builder -mwl"
}
```

### Vite Configuration

**File:** `vite.config.ts`

```typescript
export default defineConfig(({ mode }) => {
  const isElectron = mode === "electron" || process.env.ELECTRON === "true";

  return {
    base: isElectron ? "./" : "/", // Relative paths for file:// protocol
    // ...
  };
});
```

When building for Electron (`--mode electron`), Vite uses `base: "./"` so all asset references are relative (e.g., `./assets/index.js` instead of `/assets/index.js`). This is critical because Electron loads the app via `file://` protocol where absolute paths don't resolve correctly.

### Supabase Auth in Electron

**File:** `src/integrations/supabase/client.ts`

Cookies don't work with the `file://` protocol, so Electron uses `localStorage` for Supabase session persistence:

```typescript
const isElectron = () => {
  return typeof window !== "undefined" && window.electronAPI !== undefined;
};

const storage = isElectron() ? localStorage : createCookieStorage();

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage,
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

### Routing (HashRouter)

**File:** `src/main.tsx`

The app uses `HashRouter` instead of `BrowserRouter`. This is essential for Electron because:

- `BrowserRouter` maps routes to URL paths (e.g., `/dashboard`), which conflict with the `file://` protocol
- `HashRouter` stores routes in the URL hash (e.g., `file:///path/to/index.html#/dashboard`), which works on any protocol

> **Critical note:** Inside `HashRouter`, `useLocation().pathname` returns the parsed route (e.g., `/dashboard`), NOT the file path. `location.hash` is always empty inside HashRouter. All route detection must use `location.pathname`.

### Building & Distribution

**File:** `electron-builder.yml`

```yaml
appId: com.jtech.construction
productName: Jtech Construction

asar: true
asarUnpack:
  - dist/electron/preload.js
  - node_modules/electron-updater/**/*

win:
  target:
    - nsis # Standard installer
    - portable # Standalone exe
  icon: public/jtech-small-color.png

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true

mac:
  target:
    - dmg
    - zip

linux:
  target:
    - AppImage
    - deb
```

**Output:** `dist_electron/` contains the built installers.

---

## Capacitor (Mobile)

### Capacitor Configuration

**File:** `capacitor.config.ts`

```typescript
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jtech.ai",
  appName: "JTech AI",
  webDir: "dist", // Points to Vite build output
};

export default config;
```

Capacitor takes the same Vite `dist/` build output and wraps it inside a native Android WebView.

### Android Project

The `android/` folder is a standard Android Gradle project generated by Capacitor:

```
android/
├── app/
│   ├── build.gradle              # App-level Gradle config (appId: com.jtech.ai)
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/jtech/ai/
│       │   └── MainActivity.java  # Extends BridgeActivity (Capacitor bridge)
│       ├── assets/                # Web assets copied here during build
│       └── res/                   # Android resources (icons, layouts)
├── capacitor-cordova-android-plugins/  # Cordova plugin compatibility layer
├── build.gradle                  # Root Gradle config
└── gradle/                       # Gradle wrapper
```

**`MainActivity.java`** is minimal — it just extends Capacitor's `BridgeActivity`:

```java
package com.jtech.ai;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {}
```

### Capacitor Plugins Used

| Plugin                            | Purpose                                                |
| --------------------------------- | ------------------------------------------------------ |
| `@capacitor/core`                 | Core runtime and bridge                                |
| `@capacitor/android`              | Android platform support                               |
| `@capacitor/filesystem`           | File system access on device                           |
| `@capacitor/preferences`          | Key-value storage (replaces localStorage where needed) |
| `capacitor-secure-storage-plugin` | Encrypted key-value storage                            |

### Building for Android

```bash
# 1. Build the web app
npm run build

# 2. Sync web assets to the Android project
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. Build APK from Android Studio (Build → Build APK)
```

---

## Platform Detection

Throughout the codebase, platform detection is done at runtime:

```typescript
// Detect Electron
const isElectron =
  typeof window !== "undefined" && window.electronAPI !== undefined;

// Detect Capacitor (native mobile)
import { Capacitor } from "@capacitor/core";
const isNative = Capacitor.isNativePlatform();

// Web is the default (neither Electron nor Capacitor)
```

This flag controls:

- Whether `CustomTitleBar` renders (Electron only)
- Navbar sticky offset (`top: 40px` in Electron, `top: 0` on web)
- Auth storage mechanism (localStorage in Electron, cookies on web)
- Grid background offset to account for titlebar
- Vite `base` path (`./` for Electron, `/` for web)

---

## Key Differences by Platform

| Feature          | Web                   | Electron (Desktop)                 | Capacitor (Mobile)     |
| ---------------- | --------------------- | ---------------------------------- | ---------------------- |
| **Protocol**     | `https://`            | `file://`                          | `file://` (WebView)    |
| **Routing**      | HashRouter            | HashRouter                         | HashRouter             |
| **Auth Storage** | Cookies               | localStorage                       | Capacitor Preferences  |
| **Window Frame** | Browser chrome        | Custom titlebar (40px)             | Native status bar      |
| **Auto-Update**  | N/A (server-side)     | electron-updater + GitHub Releases | App store update       |
| **Asset Paths**  | Absolute (`/assets/`) | Relative (`./assets/`)             | Relative (`./assets/`) |
| **Build Output** | `dist/`               | `dist_electron/*.exe`              | `android/app/build/`   |

---

## Common Pitfalls & Solutions

### 1. Assets not loading in Electron

**Symptom:** Blank screen or 404 errors for JS/CSS files.
**Cause:** Vite builds with `base: "/"` (absolute paths), which don't work with `file://`.
**Fix:** Build with `--mode electron` so Vite uses `base: "./"`.

### 2. Supabase session not persisting in Electron

**Symptom:** User gets logged out immediately.
**Cause:** Cookies don't work with `file://` protocol.
**Fix:** Use `localStorage` as the Supabase auth storage when `window.electronAPI` is detected.

### 3. Routing returns 404 in Electron

**Symptom:** Navigation shows 404 or blank page.
**Cause:** `BrowserRouter` doesn't work with `file://`. Also, `location.hash` is always empty inside `HashRouter`.
**Fix:** Use `HashRouter` and always reference `location.pathname` for route detection (React Router parses the hash internally).

### 4. Content hidden behind custom titlebar

**Symptom:** Page content starts at the very top of the window, overlapping the titlebar.
**Fix:** The `CustomTitleBar` component includes a spacer div (40px). The Navbar uses `sticky top-[40px]` in Electron to sit below the titlebar.

### 5. Windows backslash in file:// URLs

**Symptom:** App fails to load with a malformed URL error.
**Cause:** `path.join()` uses backslashes on Windows, which break `file://` URLs.
**Fix:** Use Node's `pathToFileURL()` instead of manual string concatenation.

### 6. Preload script module error

**Symptom:** `require is not defined` or `ERR_REQUIRE_ESM`.
**Cause:** Electron preload scripts must use CommonJS even when the project uses ES modules.
**Fix:** Keep preload script as CommonJS (`require()`) while main process uses ES `import`.

---

## Development Workflow

### Running in Development

```bash
# Web only
npm run dev

# Electron (dev mode with hot reload)
npm run dev:electron
```

### Building for Production

```bash
# Web
npm run build

# Desktop (Windows)
npm run build:electron:win

# Desktop (macOS)
npm run build:electron:mac

# Desktop (all platforms)
npm run build:electron:all

# Android
npm run build && npx cap sync android && npx cap open android
```

### Publishing Updates (Electron)

1. Update `version` in `package.json`
2. Run `npm run build:electron:win` (or `:mac`)
3. Create a GitHub Release with the version tag
4. Upload the installer artifact to the release
5. Existing installations will detect the new version via `electron-updater`
