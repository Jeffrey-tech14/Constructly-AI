// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useEffect } from "react";
import { Edit, HelpCircle, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { GuidanceSection } from "@/hooks/useQuoteGuidance";

interface QuoteGuidanceSidebarProps {
  guidanceData: GuidanceSection | null;
  title?: string;
  children?: React.ReactNode;
}

export function QuoteGuidanceSidebar({
  guidanceData,
  title = "Step Guide",
  children,
}: QuoteGuidanceSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip on mount for first-time hint
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("guidanceSidebarTooltip");
    if (!hasSeenTooltip) {
      setShowTooltip(true);
      const timer = setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem("guidanceSidebarTooltip", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowTooltip(false);
    }
  };

  return (
    <div className="relative w-full">
      {/* Main content area - full width */}
      <div className="w-full overflow-auto">{children}</div>

      {/* Toggle button - fixed on right side */}
      <div className="fixed right-6 top-6 z-40">
        <div className="relative">
          {/* Tooltip notification */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="absolute left-16 top-1 whitespace-nowrap bg-primary text-primary-foreground px-3 py-2 rounded-md shadow-lg text-sm font-medium pointer-events-none"
              >
                Click to open guide
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle button */}
          <Button
            variant="outline"
            onClick={handleToggle}
            className="shadow-lg hover:shadow-xl transition-shadow"
            title={isOpen ? "Close guide" : "Open guide"}
          >
            Help
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] text-white overflow-y-auto">
          <DialogHeader>
            <div className="mb-4 rounded-2xl bg-red-600/20 border border-red-500/50 p-4">
              <h3 className="text-lg font-semibold text-white">
                If you see a NaN value, this means the field or a value in QS
                settings is missing a required value or the calculation cannot
                be completed.
              </h3>
              <p className="text-sm text-white">
                If this is the case ensure all required fields are filled out
                and that your QS settings are correct. If you continue to see
                NaN values after verifying your inputs, please contact support
                for assistance.
              </p>
            </div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-white">
              Guidance and explanations for the current step
            </DialogDescription>
          </DialogHeader>

          {/* Guidance items */}
          {guidanceData && Object.keys(guidanceData).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(guidanceData).map(([key, description]) => (
                <div
                  key={key}
                  className="space-y-1.5 pb-3 border-b text-white border-border/50 last:border-b-0"
                >
                  <h3 className="font-semibold text-white text-sm text-foreground leading-tight">
                    {key}
                  </h3>
                  <p className="text-xs text-white leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-white">
                No guidance available for this step.
              </p>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-border mt-4">
            <div className="mb-2 space-y-2 rounded-2xl bg-blue/20 px-3 py-2 text-white">
              <div className="flex items-center gap-2 rounded-2xl bg-blue-500/20 p-3 font-semibold">
                <HelpCircle className="w-5 h-5" />
                Controls
              </div>
              <div className="space-y-1.5 text-md pl-2 text-white">
                <p className="flex items-center text-md gap-2">
                  <Edit className="w-5 h-5" />
                  Use to modify values.
                </p>
                <p className="flex items-center text-md gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Access this guide.
                </p>
                <p className="flex items-center text-md gap-2">
                  <span className="text-yellow-400 text-md ">⚠</span>
                  NaN values indicate missing or incomplete data.
                </p>
                <p className="flex items-center text-md gap-2">
                  <Trash className="w-5 h-5" />
                  Remove items.
                </p>
              </div>
            </div>
            <p className="text-xs text-white italic">
              This guide explains each field in the current step. Refer to it
              whenever you need clarification.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuoteGuidanceSidebar;
