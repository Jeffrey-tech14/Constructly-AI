
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { Quote } from '@/hooks/useQuotes';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Register fonts for better typography
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ]
});

// Enhanced styles with beautiful gradients and modern design
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.4,
  },
  headerGradient: {
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    padding: 25,
    borderRadius: 12,
    marginBottom: 25,
    color: '#ffffff',
  },
  companyTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  companySubtitle: {
    fontSize: 14,
    color: '#e0f2fe',
    textAlign: 'center',
    marginBottom: 15,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTop: '1 solid rgba(255,255,255,0.3)',
  },
  headerInfoItem: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 10,
    color: '#bae6fd',
    marginBottom: 3,
  },
  headerValue: {
    fontSize: 12,
    fontWeight: 600,
    color: '#ffffff',
  },
  sectionCard: {
    backgroundColor: '#f8fafc',
    border: '1 solid #e2e8f0',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0 1 3 rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottom: '2 solid #3b82f6',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 600,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: 400,
  },
  itemsTable: {
    borderRadius: 8,
    overflow: 'hidden',
    border: '1 solid #e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderBottom: '1 solid #e2e8f0',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1 solid #f1f5f9',
    backgroundColor: '#ffffff',
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  tableCell: {
    fontSize: 10,
    color: '#374151',
  },
  tableCellBold: {
    fontWeight: 600,
  },
  col1: { flex: 2 },
  col2: { flex: 1, textAlign: 'center' },
  col3: { flex: 1, textAlign: 'right' },
  costSummaryCard: {
    backgroundColor: '#f0f9ff',
    border: '2 solid #0ea5e9',
    borderRadius: 12,
    padding: 25,
    marginTop: 25,
  },
  costSummaryTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0c4a6e',
    textAlign: 'center',
    marginBottom: 20,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottom: '1 solid #bae6fd',
  },
  costLabel: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: 500,
  },
  costValue: {
    fontSize: 12,
    color: '#0c4a6e',
    fontWeight: 600,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 15,
    borderTop: '2 solid #0ea5e9',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 700,
    color: '#0c4a6e',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0c4a6e',
  },
  footerCard: {
    backgroundColor: '#f8fafc',
    border: '1 solid #e2e8f0',
    borderRadius: 8,
    padding: 20,
    marginTop: 30,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 1.5,
    marginBottom: 5,
  },
  logoArea: {
    textAlign: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e40af',
  },
});

interface PDFGeneratorProps {
  quote: Quote;
  contractorName?: string;
  contractorCompany?: string;
  contractorPhone?: string;
  contractorEmail?: string;
}

const formatCurrency = (amount: number) => {
  return `KSh ${(amount / 100).toLocaleString()}`;
};

export const QuotePDF = ({ quote }: { quote: Quote }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with gradient background */}
      <View style={styles.headerGradient}>
        <View style={styles.logoArea}>
          <Text style={styles.logoText}>CONSTRUCTLY</Text>
        </View>
        <Text style={styles.companyTitle}>Professional Construction Quote</Text>
        <Text style={styles.companySubtitle}>Quality • Reliability • Excellence</Text>
        
        <View style={styles.headerInfo}>
          <View style={styles.headerInfoItem}>
            <Text style={styles.headerLabel}>Quote ID</Text>
            <Text style={styles.headerValue}>{quote.id.substring(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.headerInfoItem}>
            <Text style={styles.headerLabel}>Date Issued</Text>
            <Text style={styles.headerValue}>{new Date(quote.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={styles.headerInfoItem}>
            <Text style={styles.headerLabel}>Status</Text>
            <Text style={styles.headerValue}>{quote.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Client Information Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Client Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Client Name</Text>
            <Text style={styles.infoValue}>{quote.client_name}</Text>
          </View>
          {quote.client_email && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{quote.client_email}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Project Location</Text>
            <Text style={styles.infoValue}>{quote.location}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Region</Text>
            <Text style={styles.infoValue}>{quote.region}</Text>
          </View>
        </View>
      </View>

      {/* Project Details Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Project Specifications</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Project Type</Text>
            <Text style={styles.infoValue}>{quote.project_type}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Project Title</Text>
            <Text style={styles.infoValue}>{quote.title}</Text>
          </View>
        </View>
        {quote.custom_specs && (
          <View style={{ marginTop: 15 }}>
            <Text style={styles.infoLabel}>Custom Specifications</Text>
            <Text style={styles.infoValue}>{quote.custom_specs}</Text>
          </View>
        )}
      </View>

      {/* Materials Table */}
      {quote.materials && quote.materials.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Materials Breakdown</Text>
          <View style={styles.itemsTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Material</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Quantity</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>Amount</Text>
            </View>
            {quote.materials.map((material: any, index: number) => (
              <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>{material.name}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{material.quantity} {material.unit}</Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                  {formatCurrency(material.total_cost)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Labor Table */}
      {quote.labor && quote.labor.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Labor Services</Text>
          <View style={styles.itemsTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Service</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Duration</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>Amount</Text>
            </View>
            {quote.labor.map((labor: any, index: number) => (
              <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>{labor.name}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{labor.quantity} days</Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                  {formatCurrency(labor.total_cost)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Equipment Table */}
      {quote.selected_equipment && quote.selected_equipment.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Equipment Rental</Text>
          <View style={styles.itemsTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Equipment</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Duration</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>Amount</Text>
            </View>
            {quote.selected_equipment.map((equipment: any, index: number) => (
              <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>{equipment.name}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{equipment.duration} days</Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                  {formatCurrency(equipment.total_cost)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Cost Summary Card */}
      <View style={styles.costSummaryCard}>
        <Text style={styles.costSummaryTitle}>Investment Summary</Text>
        
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Materials Cost</Text>
          <Text style={styles.costValue}>{formatCurrency(quote.materials_cost)}</Text>
        </View>
        
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Labor Cost</Text>
          <Text style={styles.costValue}>{formatCurrency(quote.labor_cost)}</Text>
        </View>
        
        {quote.equipment_costs && quote.equipment_costs > 0 && (
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Equipment Rental</Text>
            <Text style={styles.costValue}>{formatCurrency(quote.equipment_costs)}</Text>
          </View>
        )}
        
        {quote.transport_costs && quote.transport_costs > 0 && (
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Transportation</Text>
            <Text style={styles.costValue}>{formatCurrency(quote.transport_costs)}</Text>
          </View>
        )}
        
        {quote.additional_services_cost && quote.additional_services_cost > 0 && (
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Additional Services</Text>
            <Text style={styles.costValue}>{formatCurrency(quote.additional_services_cost)}</Text>
          </View>
        )}
        
        {quote.addons_cost > 0 && (
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Add-ons & Extras</Text>
            <Text style={styles.costValue}>{formatCurrency(quote.addons_cost)}</Text>
          </View>
        )}
        
        {quote.overall_profit_amount && quote.overall_profit_amount > 0 && (
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Service Fee</Text>
            <Text style={styles.costValue}>{formatCurrency(quote.overall_profit_amount)}</Text>
          </View>
        )}
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Investment</Text>
          <Text style={styles.totalValue}>{formatCurrency(quote.total_amount)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footerCard}>
        <Text style={styles.footerText}>
          This quote is valid for 30 days from the date of issue and subject to material price fluctuations.
        </Text>
        <Text style={styles.footerText}>
          We appreciate your trust in our construction services and look forward to bringing your vision to life.
        </Text>
        <Text style={[styles.footerText, { marginTop: 10, fontWeight: 600 }]}>
          Constructly Kenya - Building Dreams, Creating Futures
        </Text>
      </View>
    </Page>
  </Document>
);

export const generateQuotePDF = async (quote: Quote) => {
  const doc = <QuotePDF quote={quote} />;
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `constructly-quote-${quote.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const PDFGenerator = ({ quote, contractorName, contractorCompany, contractorPhone, contractorEmail }: PDFGeneratorProps) => {
  const handleGeneratePDF = async () => {
    await generateQuotePDF(quote);
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Generate Professional PDF Quote
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <Card className="gradient-card">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 text-primary">Quote Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title:</span>
                <span className="font-medium">{quote.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client:</span>
                <span className="font-medium">{quote.client_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{quote.location}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-primary text-lg">{formatCurrency(quote.total_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 text-primary">Contractor Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{contractorName || 'Constructly Kenya'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Company:</span>
                <span className="font-medium">{contractorCompany || 'Constructly Kenya Ltd'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{contractorPhone || '+254 700 000 000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{contractorEmail || 'info@constructly.co.ke'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleGeneratePDF} className="w-full h-12 text-base font-semibold">
          <Download className="w-5 h-5 mr-2" />
          Generate & Download Professional PDF
        </Button>
      </div>
    </div>
  );
};

export default PDFGenerator;
