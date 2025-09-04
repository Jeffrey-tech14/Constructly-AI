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
import { generateQuoteExcel } from "./ExcelGenerator";
import { exportBOQPDF } from "@/utils/exportBOQPDF";

interface QuoteExportDialogProps {
  quote: any;
  open: boolean;
  contractorName: string;
  companyName: string;
  onOpenChange: (open: boolean) => void;
}

export const QuoteExportDialog = ({
  quote,
  open,
  onOpenChange,
  contractorName,
  companyName,
}: QuoteExportDialogProps) => {
  const [exportType, setExportType] = useState<"client" | "contractor">(
    "contractor"
  );
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");

  const safeQuote = {
    ...quote,
    contractor_name: contractorName,
    company_name: companyName,
  };

  const handleExport = () => {
    if (exportFormat === "pdf") {
      exportBOQPDF(
        quote.boq_data,
        {
          title: quote.title,
          date: Date(),
          clientName: quote.client_name,
          clientEmail: quote.client_email,
          location: quote.location,
          projectType: quote.project_type,
          houseType: quote.house_type,
          region: quote.region,
          floors: quote.floors,
        },
        quote.preliminaries
      );
    } else {
      generateQuoteExcel({
        quote,
        isClientExport: exportType === "contractor",
      });
    }
    onOpenChange(false);
  };

  return (
    <Card className="bg-transparent border border-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Download className="w-5 h-5 text-white" />
          Export Quote
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
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
        </div>

        <div>
          <Label className="text-white">File Format</Label>
          <Select
            onValueChange={(value: "pdf" | "excel") => setExportFormat(value)}
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

        <Button onClick={handleExport} className="w-full mt-4 text-white">
          <Download className="w-4 h-4 mr-1" />
          Download {exportFormat.toUpperCase()}
        </Button>
      </CardContent>
    </Card>
  );
};
