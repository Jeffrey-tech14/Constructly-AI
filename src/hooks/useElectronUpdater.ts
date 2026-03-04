import { useState, useEffect, useCallback } from "react";

interface UpdateState {
  updateAvailable: boolean;
  updateDownloading: boolean;
  downloadProgress: number;
  updateDownloaded: boolean;
  updateVersion?: string;
  error?: string;
}

export const useElectronUpdater = () => {
  const [state, setState] = useState<UpdateState>({
    updateAvailable: false,
    updateDownloading: false,
    downloadProgress: 0,
    updateDownloaded: false,
  });

  const checkForUpdates = useCallback(async () => {
    if (!window.electronAPI) return;

    try {
      const result = await window.electronAPI.checkForUpdates();
      if (result.updateAvailable) {
        setState((prev) => ({
          ...prev,
          updateAvailable: true,
          updateVersion: result.version,
        }));
      }
    } catch (error: any) {
      console.error("Error checking for updates:", error);
      setState((prev) => ({
        ...prev,
        error: error.message,
      }));
    }
  }, []);

  const downloadUpdate = useCallback(async () => {
    if (!window.electronAPI) return;

    setState((prev) => ({ ...prev, updateDownloading: true }));

    try {
      const result = await window.electronAPI.downloadUpdate();
      if (!result.success) {
        throw new Error(result.error || "Failed to download update");
      }
    } catch (error: any) {
      console.error("Error downloading update:", error);
      setState((prev) => ({
        ...prev,
        updateDownloading: false,
        error: error.message,
      }));
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!window.electronAPI) return;

    try {
      await window.electronAPI.installUpdate();
    } catch (error: any) {
      console.error("Error installing update:", error);
      setState((prev) => ({
        ...prev,
        error: error.message,
      }));
    }
  }, []);

  useEffect(() => {
    if (!window.electronAPI) return;

    // Listen for update available event
    window.electronAPI.onUpdateAvailable((data: any) => {
      setState((prev) => ({
        ...prev,
        updateAvailable: true,
        updateVersion: data.version,
      }));
    });

    // Listen for update not available
    window.electronAPI.onUpdateNotAvailable(() => {
      setState((prev) => ({
        ...prev,
        updateAvailable: false,
      }));
    });

    // Listen for download progress
    window.electronAPI.onDownloadProgress((data: any) => {
      setState((prev) => ({
        ...prev,
        updateDownloading: true,
        downloadProgress: Math.round(data.percent),
      }));
    });

    // Listen for update downloaded
    window.electronAPI.onUpdateDownloaded((data: any) => {
      setState((prev) => ({
        ...prev,
        updateDownloading: false,
        updateDownloaded: true,
        updateVersion: data.version,
      }));
    });

    // Listen for errors
    window.electronAPI.onUpdateError((data: any) => {
      setState((prev) => ({
        ...prev,
        updateDownloading: false,
        error: data.message,
      }));
    });

    // Check for updates on mount
    checkForUpdates();
  }, [checkForUpdates]);

  return {
    ...state,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
  };
};
