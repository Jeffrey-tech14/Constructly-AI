// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash, RotateCcw } from "lucide-react";
import { format } from "date-fns";

interface SavedQuoteDialogProps {
  open: boolean;
  savedQuoteTimestamp: number;
  projectName: string;
  clientName: string;
  onContinue: () => void;
  onStart: () => void;
  onDelete: () => void;
}

export function SavedQuoteDialog({
  open,
  savedQuoteTimestamp,
  projectName,
  clientName,
  onContinue,
  onStart,
  onDelete,
}: SavedQuoteDialogProps) {
  const savedDate = new Date(savedQuoteTimestamp);
  const formattedDate = format(savedDate, "PPP 'at' p");

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Saved Quote Found
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              We found a previously saved quote draft. Would you like to
              continue where you left off?
            </p>
            <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
              {projectName && (
                <p>
                  <strong>Project:</strong> {projectName}
                </p>
              )}
              {clientName && (
                <p>
                  <strong>Client:</strong> {clientName}
                </p>
              )}
              <p>
                <strong>Saved:</strong> {formattedDate}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onDelete}
            variant="destructive"
            className="w-full sm:w-auto"
          >
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            onClick={onStart}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Start Fresh
          </Button>
          <Button onClick={onContinue} className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-2" />
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
