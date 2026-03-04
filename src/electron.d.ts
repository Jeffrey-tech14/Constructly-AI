declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      checkForUpdates: () => Promise<{
        updateAvailable: boolean;
        version?: string;
        error?: string;
      }>;
      downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
      installUpdate: () => Promise<void>;
      onUpdateAvailable: (
        callback: (data: { version: string; description?: string }) => void,
      ) => void;
      onUpdateNotAvailable: (callback: () => void) => void;
      onDownloadProgress: (
        callback: (data: {
          percent: number;
          bytesPerSecond: number;
          total: number;
          transferred: number;
        }) => void,
      ) => void;
      onUpdateDownloaded: (
        callback: (data: { version: string }) => void,
      ) => void;
      onUpdateError: (callback: (data: { message: string }) => void) => void;
      // Window control functions
      windowMinimize: () => Promise<void>;
      windowMaximize: () => Promise<void>;
      windowClose: () => Promise<void>;
      windowIsMaximized: () => Promise<boolean>;
    };
  }
}

export {};
