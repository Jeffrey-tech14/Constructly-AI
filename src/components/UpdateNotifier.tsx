import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { useElectronUpdater } from "@/hooks/useElectronUpdater";
import { Download, CheckCircle, AlertCircle } from "lucide-react";

export const UpdateNotifier = () => {
  const {
    updateAvailable,
    updateDownloading,
    downloadProgress,
    updateDownloaded,
    updateVersion,
    error,
    downloadUpdate,
    installUpdate,
  } = useElectronUpdater();

  const [showDialog, setShowDialog] = useState(false);
  const [userDismissedPrompt, setUserDismissedPrompt] = useState(false);

  // Show dialog when update is available
  React.useEffect(() => {
    if (updateAvailable && !userDismissedPrompt) {
      setShowDialog(true);
    }
  }, [updateAvailable, userDismissedPrompt]);

  // Only show this component if running in Electron
  if (typeof window === "undefined" || !window.electronAPI) {
    return null;
  }

  const handleDismiss = () => {
    setShowDialog(false);
    setUserDismissedPrompt(true);
  };

  const handleDownload = async () => {
    await downloadUpdate();
  };

  const handleInstall = async () => {
    await installUpdate();
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : updateDownloaded ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Download className="w-5 h-5 text-blue-500" />
            )}
            <AlertDialogTitle>
              {error
                ? "Update Error"
                : updateDownloaded
                  ? "Update Ready"
                  : "Update Available"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {error ? (
              <span className="text-red-600 dark:text-red-400">{error}</span>
            ) : updateDownloaded ? (
              <>
                Version <strong>{updateVersion}</strong> is ready to install.
                Restart the application to complete the update.
              </>
            ) : updateDownloading ? (
              <>
                Downloading update <strong>{updateVersion}</strong>...
                <div className="mt-3">
                  <Progress value={downloadProgress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-2">
                    {downloadProgress}% complete
                  </p>
                </div>
              </>
            ) : (
              <>
                A new version <strong>{updateVersion}</strong> is available.
                Would you like to download and install it?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-3 justify-end pt-4">
          {updateDownloaded ? (
            <>
              <AlertDialogCancel onClick={handleDismiss}>
                Later
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleInstall}>
                Install Now
              </AlertDialogAction>
            </>
          ) : updateDownloading ? (
            <AlertDialogCancel disabled>Downloading...</AlertDialogCancel>
          ) : error ? (
            <>
              <AlertDialogCancel onClick={handleDismiss}>
                Close
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDownload}>
                Retry
              </AlertDialogAction>
            </>
          ) : (
            <>
              <AlertDialogCancel onClick={handleDismiss}>
                Skip
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDownload}>
                Download & Install
              </AlertDialogAction>
            </>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpdateNotifier;
