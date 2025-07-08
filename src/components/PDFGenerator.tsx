
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText } from 'lucide-react';
import { useState } from 'react';

interface Quote {
  id: string;
  title: string;
  client_name: string;
  client_email?: string;
  location: string;
  region: string;
  project_type: string;
  custom_specs?: string;
  status: string;
  materials_cost: number;
  labor_cost: number;
  addons_cost: number;
  total_amount: number;
  materials: any[];
  labor: any[];
  addons: any[];
  house_length?: number;
  house_width?: number;
  house_height?: number;
  total_volume?: number;
  contract_type?: string;
  distance_km?: number;
  equipment_costs?: number;
  transport_costs?: number;
  additional_services_cost?: number;
  overall_profit_amount?: number;
  selected_equipment?: any[];
  selected_services?: any[];
  created_at: string;
}

interface PDFGeneratorProps {
  quote: Quote;
  contractorName: string;
  contractorCompany?: string;
  contractorPhone?: string;
  contractorEmail?: string;
}

const PDFGenerator = ({ quote, contractorName, contractorCompany, contractorPhone, contractorEmail }: PDFGeneratorProps) => {
  const { toast } = useToast();
  const [pdfType, setPdfType] = useState<'client' | 'contractor'>('client');
  const [generating, setGenerating] = useState(false);

  const generateClientPDF = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
    <title>Construction Quote - ${quote.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .company-info { text-align: right; margin-bottom: 20px; }
        .client-info { margin-bottom: 30px; }
        .quote-title { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        .cost-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .cost-table th, .cost-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .cost-table th { background-color: #f9fafb; font-weight: bold; }
        .total-row { font-weight: bold; background-color: #f0f9ff; }
        .grand-total { font-size: 20px; color: #2563eb; }
        .specs { background-color: #f9fafb; padding: 15px; border-radius: 8px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h2>${contractorCompany || contractorName}</h2>
            <p>Email: ${contractorEmail || 'N/A'}<br>
            Phone: ${contractorPhone || 'N/A'}</p>
        </div>
        <div class="quote-title">CONSTRUCTION QUOTE</div>
    </div>

    <div class="client-info">
        <h3>Quote For:</h3>
        <p><strong>${quote.client_name}</strong><br>
        ${quote.client_email || ''}<br>
        Project: ${quote.title}<br>
        Location: ${quote.location}</p>
    </div>

    <div class="section">
        <div class="section-title">Project Details</div>
        <table class="cost-table">
            <tr><td><strong>Project Type:</strong></td><td>${quote.project_type}</td></tr>
            <tr><td><strong>Contract Type:</strong></td><td>${quote.contract_type === 'full_contract' ? 'Full Contract (Materials + Labor)' : 'Labor Only'}</td></tr>
            ${quote.house_length ? `<tr><td><strong>Dimensions:</strong></td><td>${quote.house_length}m × ${quote.house_width}m × ${quote.house_height}m</td></tr>` : ''}
            ${quote.total_volume ? `<tr><td><strong>Volume:</strong></td><td>${quote.total_volume.toFixed(2)} m³</td></tr>` : ''}
            <tr><td><strong>Region:</strong></td><td>${quote.region}</td></tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Cost Breakdown</div>
        <table class="cost-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Amount (KSh)</th>
                </tr>
            </thead>
            <tbody>
                ${quote.contract_type !== 'labor_only' ? `<tr><td>Materials</td><td>${(quote.materials_cost / 100).toLocaleString()}</td></tr>` : ''}
                <tr><td>Labor</td><td>${(quote.labor_cost / 100).toLocaleString()}</td></tr>
                ${quote.equipment_costs ? `<tr><td>Equipment</td><td>${(quote.equipment_costs / 100).toLocaleString()}</td></tr>` : ''}
                ${quote.transport_costs ? `<tr><td>Transport</td><td>${(quote.transport_costs / 100).toLocaleString()}</td></tr>` : ''}
                ${quote.additional_services_cost ? `<tr><td>Additional Services</td><td>${(quote.additional_services_cost / 100).toLocaleString()}</td></tr>` : ''}
                <tr class="total-row grand-total">
                    <td><strong>TOTAL AMOUNT</strong></td>
                    <td><strong>KSh ${(quote.total_amount / 100).toLocaleString()}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    ${quote.custom_specs ? `
    <div class="section">
        <div class="section-title">Specifications</div>
        <div class="specs">${quote.custom_specs}</div>
    </div>
    ` : ''}

    <div class="footer">
        <p><strong>Terms & Conditions:</strong></p>
        <ul>
            <li>This quote is valid for 30 days from the date of issue</li>
            <li>All prices are in Kenyan Shillings (KSh) and include applicable taxes</li>
            <li>Payment terms: 30% deposit, 40% at 50% completion, 30% on completion</li>
            <li>Any changes to the scope of work may result in additional charges</li>
        </ul>
        <p style="margin-top: 20px;"><em>Generated on ${new Date().toLocaleDateString()}</em></p>
    </div>
</body>
</html>
    `;
    
    return content;
  };

  const generateContractorPDF = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
    <title>Internal Quote Analysis - ${quote.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 30px; }
        .internal-label { background-color: #fef2f2; color: #dc2626; padding: 10px; border-radius: 8px; text-align: center; font-weight: bold; margin-bottom: 20px; }
        .profit-highlight { background-color: #f0fdf4; border: 2px solid #16a34a; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .cost-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .cost-table th, .cost-table td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .cost-table th { background-color: #f9fafb; font-weight: bold; }
        .profit-row { background-color: #dcfce7; font-weight: bold; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #374151; }
        .materials-detail { font-size: 12px; }
        .total-profit { font-size: 24px; color: #16a34a; font-weight: bold; text-align: center; }
    </style>
</head>
<body>
    <div class="internal-label">
        INTERNAL CONTRACTOR ANALYSIS - CONFIDENTIAL
    </div>

    <div class="header">
        <h2>Quote Analysis: ${quote.title}</h2>
        <p>Client: ${quote.client_name} | Date: ${new Date(quote.created_at).toLocaleDateString()}</p>
    </div>

    <div class="profit-highlight">
        <div class="total-profit">Total Profit: KSh ${quote.overall_profit_amount ? (quote.overall_profit_amount / 100).toLocaleString() : '0'}</div>
        <p style="text-align: center; margin-top: 10px;">Profit Margin: ${quote.overall_profit_amount && quote.total_amount ? ((quote.overall_profit_amount / (quote.total_amount - quote.overall_profit_amount)) * 100).toFixed(1) : '0'}%</p>
    </div>

    <div class="section-title">Detailed Cost Analysis</div>
    <table class="cost-table">
        <thead>
            <tr>
                <th>Category</th>
                <th>Base Cost (KSh)</th>
                <th>With Margins (KSh)</th>
                <th>Profit (KSh)</th>
            </tr>
        </thead>
        <tbody>
            ${quote.materials_cost ? `
            <tr>
                <td>Materials (with individual margins)</td>
                <td>${((quote.materials_cost * 0.85) / 100).toLocaleString()}</td>
                <td>${(quote.materials_cost / 100).toLocaleString()}</td>
                <td class="profit-row">${((quote.materials_cost * 0.15) / 100).toLocaleString()}</td>
            </tr>
            ` : ''}
            <tr>
                <td>Labor</td>
                <td>${(quote.labor_cost / 100).toLocaleString()}</td>
                <td>${(quote.labor_cost / 100).toLocaleString()}</td>
                <td>0</td>
            </tr>
            ${quote.equipment_costs ? `
            <tr>
                <td>Equipment</td>
                <td>${(quote.equipment_costs / 100).toLocaleString()}</td>
                <td>${(quote.equipment_costs / 100).toLocaleString()}</td>
                <td>0</td>
            </tr>
            ` : ''}
            ${quote.transport_costs ? `
            <tr>
                <td>Transport</td>
                <td>${(quote.transport_costs / 100).toLocaleString()}</td>
                <td>${(quote.transport_costs / 100).toLocaleString()}</td>
                <td>0</td>
            </tr>
            ` : ''}
        </tbody>
    </table>

    ${quote.materials && quote.materials.length > 0 ? `
    <div class="section-title">Material Breakdown with Profit Margins</div>
    <table class="cost-table materials-detail">
        <thead>
            <tr>
                <th>Material</th>
                <th>Quantity</th>
                <th>Base Price</th>
                <th>Margin %</th>
                <th>Total with Margin</th>
            </tr>
        </thead>
        <tbody>
            ${quote.materials.map((material: any) => `
            <tr>
                <td>${material.name}</td>
                <td>${material.quantity}</td>
                <td>KSh ${((material.unit_price / (1 + material.profit_margin/100)) || 0).toLocaleString()}</td>
                <td>${material.profit_margin || 0}%</td>
                <td>KSh ${(material.total_price / 100 || 0).toLocaleString()}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    ` : ''}

    <div style="margin-top: 40px; padding: 20px; background-color: #fef3c7; border-radius: 8px;">
        <h3 style="color: #d97706;">Financial Summary</h3>
        <p><strong>Total Project Value:</strong> KSh ${(quote.total_amount / 100).toLocaleString()}</p>
        <p><strong>Total Costs:</strong> KSh ${((quote.total_amount - (quote.overall_profit_amount || 0)) / 100).toLocaleString()}</p>
        <p><strong>Net Profit:</strong> KSh ${(quote.overall_profit_amount ? quote.overall_profit_amount / 100 : 0).toLocaleString()}</p>
        <p><strong>Profit Margin:</strong> ${quote.overall_profit_amount && quote.total_amount ? ((quote.overall_profit_amount / quote.total_amount) * 100).toFixed(1) : '0'}%</p>
    </div>

    <div style="margin-top: 30px; font-size: 12px; color: #6b7280;">
        <p><strong>Note:</strong> This document contains sensitive financial information and should be kept confidential.</p>
        <p><em>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</em></p>
    </div>
</body>
</html>
    `;
    
    return content;
  };

  const handleDownloadPDF = () => {
    setGenerating(true);
    
    try {
      const htmlContent = pdfType === 'client' ? generateClientPDF() : generateContractorPDF();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${quote.title.replace(/[^a-z0-9]/gi, '_')}_${pdfType}_quote.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Generated",
        description: `${pdfType === 'client' ? 'Client' : 'Contractor'} quote has been downloaded. Open in browser and print to PDF.`
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          PDF Quote Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select PDF Type</label>
          <Select value={pdfType} onValueChange={(value: 'client' | 'contractor') => setPdfType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Client Quote (No Profit Details)</SelectItem>
              <SelectItem value="contractor">Contractor Analysis (With Profit Breakdown)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            {pdfType === 'client' 
              ? 'Professional quote for client presentation without profit margin details'
              : 'Internal analysis with detailed profit margins and cost breakdown'
            }
          </p>
        </div>

        <Button 
          onClick={handleDownloadPDF}
          disabled={generating}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {generating ? 'Generating...' : `Download ${pdfType === 'client' ? 'Client' : 'Contractor'} PDF`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PDFGenerator;
