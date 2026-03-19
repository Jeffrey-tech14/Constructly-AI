// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
            size="icon"
            onClick={handleToggle}
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title={isOpen ? "Close guide" : "Open guide"}
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Collapsible overlay sidebar - slides in from right */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-0 top-0 h-screen w-96 border-l border-border bg-card shadow-lg overflow-y-auto z-30"
          >
            {/* Sidebar content */}
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-2 pb-4 border-b border-border">
                <HelpCircle className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
              </div>

              {/* Guidance items */}
              {guidanceData && Object.keys(guidanceData).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(guidanceData).map(([key, description]) => (
                    <div
                      key={key}
                      className="space-y-1.5 pb-3 border-b border-border/50 last:border-b-0"
                    >
                      <h3 className="font-semibold text-sm text-foreground leading-tight">
                        {key}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No guidance available for this step.
                  </p>
                </div>
              )}

              {/* Footer note */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground italic">
                  This guide explains each field in the current step. Refer to
                  it whenever you need clarification.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QuoteGuidanceSidebar;
