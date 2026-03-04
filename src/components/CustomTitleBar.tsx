// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect } from "react";
import { Minus, Square, X } from "lucide-react";
import "./CustomTitleBar.css";

const CustomTitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  // Check initial maximized state
  useEffect(() => {
    const checkMaximized = async () => {
      if (window.electronAPI?.windowIsMaximized) {
        const maximized = await window.electronAPI.windowIsMaximized();
        setIsMaximized(maximized);
      }
    };
    checkMaximized();
  }, []);

  const handleMinimize = async () => {
    if (window.electronAPI?.windowMinimize) {
      await window.electronAPI.windowMinimize();
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI?.windowMaximize) {
      await window.electronAPI.windowMaximize();
      // Toggle state
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = async () => {
    if (window.electronAPI?.windowClose) {
      await window.electronAPI.windowClose();
    }
  };

  return (
    <>
      <div className="custom-titlebar">
        {/* Draggable title area */}
        <div className="titlebar-drag-region">
          <div className="titlebar-logo-area"></div>
        </div>

        {/* Window control buttons */}
        <div className="titlebar-controls">
          <button
            className="titlebar-button minimize-button"
            onClick={handleMinimize}
            title="Minimize"
            aria-label="Minimize window"
          >
            <Minus size={14} />
          </button>

          <button
            className="titlebar-button maximize-button"
            onClick={handleMaximize}
            title={isMaximized ? "Restore" : "Maximize"}
            aria-label={isMaximized ? "Restore window" : "Maximize window"}
          >
            <Square size={14} />
          </button>

          <button
            className="titlebar-button close-button"
            onClick={handleClose}
            title="Close"
            aria-label="Close window"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      {/* Spacer to push content below the fixed titlebar */}
      <div className="titlebar-spacer" />
    </>
  );
};

export default CustomTitleBar;
