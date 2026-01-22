// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Clock, MapPin, User, Building2, CreditCard } from "lucide-react";
import { exportQuote } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface QuoteExportDialogProps {
  quote: any;
  open: boolean;
  contractorName: string;
  companyName: string;
  onOpenChange: (open: boolean) => void;
  logoUrl: string;
}

export const QuoteExportDialog = ({
  quote,
  open,
  onOpenChange,
  contractorName,
  companyName,
  logoUrl,
}: QuoteExportDialogProps) => {
  const { toast } = useToast();
  const [exportType, setExportType] = useState<"client" | "contractor">(
    "contractor"
  );
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "docx">(
    "pdf"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    // Check if quote is paid
    if (!quote?.status || quote.status !== "paid") {
      setError("Payment required before exporting. Please pay for this quote first.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    try {
      const success = await exportQuote({
        format: exportFormat,
        audience: exportType,
        quote,
        projectInfo: {
          title: quote.title,
          date: new Date().toLocaleDateString(),
          clientName: quote.client_name,
          clientEmail: quote.client_email,
          location: quote.location,
          projectType: quote.project_type,
          houseType: quote.house_type,
          region: quote.region,
          floors: quote.floors,
          companyName,
          logoUrl,
        },
      });

      if (!success) {
        setError(
          "Something went wrong while generating the document. Please try again later."
        );
        toast({
          title: "Error generating document",
          description: "Please try again",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      toast({
        title: "Document generated successfully",
        description: "Your file has been downloaded",
        variant: "default",
      });
      setIsProcessing(false);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong while generating the document. Please try again later."
      );
      toast({
        title: "Error generating document",
        description: "Please try again",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleExport();
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="flex flex-col items-center justify-center space-y-4 bg-red-50 dark:bg-red-900 border border-red-400 rounded-lg p-4">
          <div className="text-red-600 dark:text-red-300">
            <svg
              className="w-8 h-8 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-red-700 dark:text-red-200 font-semibold text-center text-lg">
            Something Went Wrong
          </p>
          <p className="text-red-600 dark:text-red-300 text-sm text-center">
            {error}
          </p>
          <Button
            onClick={handleRetry}
            className="w-full text-white bg-red-600 hover:bg-red-700 flex items-center justify-center space-x-2"
          >
            <span>Try Again</span>
          </Button>
        </div>
      ) : isProcessing ? (
        <div className="flex flex-col items-center justify-center space-y-3 bg-green-50 dark:bg-green-900 border border-green-400 rounded-lg p-4">
          <Clock className="w-8 h-8 text-green-600 dark:text-green-300 animate-spin" />
          <p className="text-green-700 dark:text-green-400 font-semibold text-center text-lg">
            Processing your Document...
          </p>
          <p className="text-green-700 dark:text-green-400 text-sm text-center">
            This may take a few seconds. Please do not close the dialog.
          </p>
        </div>
      ) : (
        <>
          {/* Payment Required Section */}
          {(!quote?.status || quote.status !== "paid") && (
            <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-400 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Payment Required
                </h3>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
                You need to pay KES 1,000 for this quote before you can export it.
              </p>
              <Button
                onClick={() => {
                  // Navigate to payment page or open payment modal
                  window.open('/payment?quote=' + quote.id, '_blank');
                }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pay KES 1,000 to Export
              </Button>
            </div>
          )}

          {/* Quote Info Section */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2 border border-muted">
            <h3 className="text-lg font-semibold text-white">Quote Summary</h3>
            <div className="text-sm dark:text-gray-300 text-white space-y-1">
              <p className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />{" "}
                <span className="font-medium">Project:</span>{" "}
                {quote?.title || "—"}
              </p>
              <p className="flex items-center gap-2">
                <User className="w-4 h-4" />{" "}
                <span className="font-medium">Client:</span>{" "}
                {quote?.client_name || "—"}
              </p>
              <p className="flex items-center gap-2">
                <User className="w-4 h-4" />{" "}
                <span className="font-medium">Contractor:</span>{" "}
                {contractorName || "—"}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />{" "}
                <span className="font-medium">Location:</span>{" "}
                {quote?.location || "—"}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4" />{" "}
                <span className="font-medium">Date:</span>{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <div>
              <Label className="text-white">Export Type</Label>
              <Select
                onValueChange={(value: "client" | "contractor") =>
                  setExportType(value)
                }
                value={exportType}
                disabled={isProcessing || !quote?.status || quote.status !== "paid"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select export type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client-Friendly</SelectItem>
                  <SelectItem value="contractor">
                    Full Contractor BOQ
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-gray-300 text-sm mt-1">
                {exportType === "client"
                  ? "Simplified version without cost breakdowns"
                  : "Detailed version with all cost calculations"}
              </p>
            </div>

            <div>
              <Label className="text-white">File Format</Label>
              <Select
                onValueChange={(value: "pdf" | "excel" | "docx") =>
                  setExportFormat(value)
                }
                value={exportFormat}
                disabled={isProcessing || !quote?.status || quote.status !== "paid"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="docx">Docx (.docx)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleExport}
              className="w-full text-white flex items-center justify-center space-x-2"
              disabled={isProcessing || !quote?.status || quote.status !== "paid"}
            >
              <Download className="w-5 h-5" />
              <span>
                {isProcessing
                  ? "Generating..."
                  : `Download ${exportFormat.toUpperCase()}`}
              </span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
