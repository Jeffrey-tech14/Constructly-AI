import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@radix-ui/react-label';
import { Download } from 'lucide-react';
import { generateQuoteExcel } from './ExcelGenerator';
import { generateQuotePDF, QuotePDF } from './PDFGenerator';

interface QuoteExportDialogProps {
  quote: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuoteExportDialog = ({ quote, open, onOpenChange }: QuoteExportDialogProps) => {
  const [exportType, setExportType] = useState<'client' | 'contractor'>('client');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');

  const handleExport = () => {
    if (exportFormat === 'pdf') {
      generateQuotePDF({
        quote, 
        isClientExport: exportType === 'client' 
      });
    } else {
      generateQuoteExcel({
        quote,
        isClientExport: exportType === 'contractor'
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Quote
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Export Type</Label>
            <Select 
              onValueChange={(value: 'client' | 'contractor') => setExportType(value)}
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
            <Label>File Format</Label>
            <Select 
              onValueChange={(value: 'pdf' | 'excel') => setExportFormat(value)}
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
            <Download className="w-4 h-4 mr-2" />
            Download {exportFormat.toUpperCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};