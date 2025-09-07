// src/components/QuoteExportDialog.tsx
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
import { Download } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { exportQuote } from "@/utils/exportUtils";
import { toast } from "@/hooks/use-toast";

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
  const [exportType, setExportType] = useState<"client" | "contractor">(
    "contractor"
  );
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "docx">(
    "pdf"
  );

  const handleExport = async () => {
    console.log(logoUrl);
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
        logoUrl: logoUrl,
      },
    });

    if (success) {
      toast({
        title: "Document generated successfully",
        description: "Your file has been downloaded",
      });
    } else {
      toast({
        title: "Error generating document",
        description: "Please try again",
        variant: "destructive",
      });
    }

    onOpenChange(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white">Export Type</Label>
        <Select
          onValueChange={(value: "client" | "contractor") =>
            setExportType(value)
          }
          value={exportType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select export type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Client-Friendly</SelectItem>
            <SelectItem value="contractor">Full Contractor BOQ</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-200 mt-1">
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
        >
          <SelectTrigger>
            <SelectValue placeholder="Select file type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="excel">Excel (.xlsx)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleExport} className="w-full mt-4">
        <Download className="w-4 h-4 mr-2" />
        Download {exportFormat.toUpperCase()}
      </Button>
    </div>
  );
};
