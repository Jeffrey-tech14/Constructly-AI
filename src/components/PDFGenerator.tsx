import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Eye, Users } from 'lucide-react';
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.6;
            color: #1a202c;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border-radius: 16px;
            overflow: hidden;
        }
        
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 200"><polygon fill="rgba(255,255,255,0.1)" points="0,0 1000,0 1000,100 0,200"/></svg>');
            background-size: cover;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .company-name {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .quote-title {
            font-size: 24px;
            font-weight: 300;
            opacity: 0.9;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        .content {
            padding: 40px;
        }
        
        .client-section {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
        }
        
        .client-title {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 15px;
        }
        
        .client-name {
            font-size: 22px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .section {
            margin-bottom: 35px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
            position: relative;
        }
        
        .section-title::before {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .info-item {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .info-label {
            font-weight: 600;
            color: #4a5568;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            font-weight: 500;
            color: #2d3748;
            font-size: 16px;
            margin-top: 4px;
        }
        
        .cost-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .cost-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 14px;
        }
        
        .cost-table td {
            padding: 18px 20px;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 500;
        }
        
        .cost-table tr:hover {
            background-color: #f7fafc;
        }
        
        .total-row {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .total-row td {
            border-bottom: none;
            font-size: 18px;
            font-weight: 700;
        }
        
        .specs-section {
            background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #38b2ac;
            margin: 25px 0;
        }
        
        .footer {
            background: #f7fafc;
            padding: 30px;
            border-radius: 12px;
            margin-top: 40px;
            border: 1px solid #e2e8f0;
        }
        
        .footer h4 {
            color: #2d3748;
            font-weight: 600;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .footer ul {
            list-style: none;
            padding-left: 0;
        }
        
        .footer li {
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
            position: relative;
            padding-left: 20px;
        }
        
        .footer li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #38b2ac;
            font-weight: bold;
        }
        
        .footer li:last-child {
            border-bottom: none;
        }
        
        .generated-date {
            text-align: center;
            margin-top: 25px;
            font-style: italic;
            color: #718096;
            font-size: 14px;
        }
        
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="company-name">${contractorCompany || contractorName}</div>
                <div class="quote-title">Construction Quote</div>
            </div>
        </div>

        <div class="content">
            <div class="client-section">
                <div class="client-title">Prepared For:</div>
                <div class="client-name">${quote.client_name}</div>
                <div>${quote.client_email || ''}</div>
                <div style="margin-top: 10px; font-weight: 500;">Project: ${quote.title}</div>
                <div>Location: ${quote.location}</div>
            </div>

            <div class="section">
                <div class="section-title">Project Details</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Project Type</div>
                        <div class="info-value">${quote.project_type}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Contract Type</div>
                        <div class="info-value">${quote.contract_type === 'full_contract' ? 'Full Contract (Materials + Labor)' : 'Labor Only'}</div>
                    </div>
                    ${quote.house_length ? `
                    <div class="info-item">
                        <div class="info-label">Dimensions</div>
                        <div class="info-value">${quote.house_length}m × ${quote.house_width}m × ${quote.house_height}m</div>
                    </div>
                    ` : ''}
                    ${quote.total_volume ? `
                    <div class="info-item">
                        <div class="info-label">Volume</div>
                        <div class="info-value">${quote.total_volume.toFixed(2)} m³</div>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <div class="info-label">Region</div>
                        <div class="info-value">${quote.region}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Investment Breakdown</div>
                <table class="cost-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount (KSh)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quote.contract_type !== 'labor_only' ? `<tr><td>Materials & Supplies</td><td style="text-align: right;">${(quote.materials_cost / 100).toLocaleString()}</td></tr>` : ''}
                        <tr><td>Professional Labor</td><td style="text-align: right;">${(quote.labor_cost / 100).toLocaleString()}</td></tr>
                        ${quote.equipment_costs ? `<tr><td>Equipment & Machinery</td><td style="text-align: right;">${(quote.equipment_costs / 100).toLocaleString()}</td></tr>` : ''}
                        ${quote.transport_costs ? `<tr><td>Transportation & Logistics</td><td style="text-align: right;">${(quote.transport_costs / 100).toLocaleString()}</td></tr>` : ''}
                        ${quote.additional_services_cost ? `<tr><td>Additional Services</td><td style="text-align: right;">${(quote.additional_services_cost / 100).toLocaleString()}</td></tr>` : ''}
                        <tr class="total-row">
                            <td><strong>TOTAL INVESTMENT</strong></td>
                            <td style="text-align: right;"><strong>KSh ${(quote.total_amount / 100).toLocaleString()}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            ${quote.custom_specs ? `
            <div class="section">
                <div class="section-title">Project Specifications</div>
                <div class="specs-section">${quote.custom_specs}</div>
            </div>
            ` : ''}

            <div class="footer">
                <h4>Terms & Conditions</h4>
                <ul>
                    <li>This quote is valid for 30 days from the date of issue</li>
                    <li>All prices are in Kenyan Shillings (KSh) and include applicable taxes</li>
                    <li>Payment schedule: 30% deposit, 40% at 50% completion, 30% on completion</li>
                    <li>Any changes to the scope of work may result in additional charges</li>
                    <li>We guarantee quality workmanship and use of premium materials</li>
                </ul>
                
                <div class="generated-date">
                    Generated on ${new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
            </div>
        </div>
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.6;
            color: #1a202c;
            background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border-radius: 16px;
            overflow: hidden;
        }
        
        .header { 
            background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 200"><polygon fill="rgba(255,255,255,0.1)" points="0,0 1000,0 1000,100 0,200"/></svg>');
            background-size: cover;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .analysis-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .quote-title {
            font-size: 24px;
            font-weight: 300;
            opacity: 0.9;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        
        .content {
            padding: 40px;
        }
        
        .summary-section {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            border-left: 4px solid #ef4444;
        }
        
        .summary-title {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 15px;
        }
        
        .profit-value {
            font-size: 28px;
            font-weight: 700;
            color: #16a34a;
            margin-bottom: 5px;
        }
        
        .section {
            margin-bottom: 35px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e2e8f0;
            position: relative;
        }
        
        .section-title::before {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, #ef4444, #b91c1c);
        }
        
        .cost-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .cost-table th {
            background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
            color: white;
            padding: 20px;
            text-align: left;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 14px;
        }
        
        .cost-table td {
            padding: 18px 20px;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 500;
        }
        
        .cost-table tr:hover {
            background-color: #f7fafc;
        }
        
        .profit-row {
            font-weight: 700;
            color: #16a34a;
        }
        
        .footer {
            background: #f7fafc;
            padding: 30px;
            border-radius: 12px;
            margin-top: 40px;
            border: 1px solid #e2e8f0;
        }
        
        .footer p {
            color: #718096;
            font-size: 14px;
            text-align: center;
        }
        
        .generated-date {
            text-align: center;
            margin-top: 25px;
            font-style: italic;
            color: #718096;
            font-size: 14px;
        }
        
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="analysis-title">Internal Analysis</div>
                <div class="quote-title">Quote: ${quote.title}</div>
            </div>
        </div>

        <div class="content">
            <div class="summary-section">
                <div class="summary-title">Profit Summary</div>
                <div class="profit-value">KSh ${(quote.overall_profit_amount ? (quote.overall_profit_amount / 100).toLocaleString() : '0')}</div>
                <div>Profit Margin: ${quote.overall_profit_amount && quote.total_amount ? ((quote.overall_profit_amount / (quote.total_amount - quote.overall_profit_amount)) * 100).toFixed(1) : '0'}%</div>
            </div>

            <div class="section">
                <div class="section-title">Cost Breakdown</div>
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
            </div>

            ${quote.materials && quote.materials.length > 0 ? `
            <div class="section">
                <div class="section-title">Material Breakdown with Profit Margins</div>
                <table class="cost-table">
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
            </div>
            ` : ''}

            <div class="footer">
                <p>
                    This document contains sensitive financial information and should be kept confidential.
                </p>
                <div class="generated-date">
                    Generated on ${new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
            </div>
        </div>
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
    <Card className="gradient-card animate-fade-in">
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
            <SelectTrigger className="card-hover">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-600" />
                  Client Quote (Professional)
                </div>
              </SelectItem>
              <SelectItem value="contractor">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-purple-600" />
                  Internal Analysis (Profit Details)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-2">
            {pdfType === 'client' 
              ? '🎨 Beautiful professional quote for client presentation'
              : '📊 Detailed internal analysis with profit margins and cost breakdown'
            }
          </p>
        </div>

        <Button 
          onClick={handleDownloadPDF}
          disabled={generating}
          className="w-full gradient-primary card-hover"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          {generating ? (
            <>
              <div className="loading-spinner mr-2" />
              Generating Beautiful PDF...
            </>
          ) : (
            `Download ${pdfType === 'client' ? 'Client' : 'Internal'} PDF`
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PDFGenerator;
