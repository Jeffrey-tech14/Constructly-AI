import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { Quote } from '@/hooks/useQuotes';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

// Create styles with green theme
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#f8fffe',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #22c55e',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#16a34a',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 5,
    border: '1 solid #bbf7d0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 8,
    borderBottom: '1 solid #16a34a',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'medium',
  },
  value: {
    fontSize: 11,
    color: '#111827',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1 solid #d1fae5',
    paddingVertical: 5,
  },
  itemName: {
    flex: 2,
    fontSize: 10,
    color: '#374151',
  },
  itemQuantity: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
    textAlign: 'right',
  },
  totalSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#dcfce7',
    borderRadius: 5,
    border: '2 solid #22c55e',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#15803d',
  },
  grandTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    borderTop: '2 solid #22c55e',
    paddingTop: 8,
  },
  footer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f0fdf4',
    borderRadius: 5,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#16a34a',
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Construction Quote</Text>
        <Text style={styles.subtitle}>Professional Construction Services</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Quote ID:</Text>
          <Text style={styles.value}>{quote.id.substring(0, 8).toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{new Date(quote.created_at).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Client Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Client Name:</Text>
          <Text style={styles.value}>{quote.client_name}</Text>
        </View>
        {quote.client_email && (
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{quote.client_email}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{quote.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Region:</Text>
          <Text style={styles.value}>{quote.region}</Text>
        </View>
      </View>

      {/* Project Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Project Type:</Text>
          <Text style={styles.value}>{quote.project_type}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Title:</Text>
          <Text style={styles.value}>{quote.title}</Text>
        </View>
        {quote.custom_specs && (
          <View style={styles.row}>
            <Text style={styles.label}>Specifications:</Text>
            <Text style={styles.value}>{quote.custom_specs}</Text>
          </View>
        )}
      </View>

      {/* Materials */}
      {quote.materials && quote.materials.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materials</Text>
          <View style={styles.itemRow}>
            <Text style={[styles.itemName, { fontWeight: 'bold' }]}>Item</Text>
            <Text style={[styles.itemQuantity, { fontWeight: 'bold' }]}>Quantity</Text>
            <Text style={[styles.itemPrice, { fontWeight: 'bold' }]}>Amount</Text>
          </View>
          {quote.materials.map((material: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{material.name}</Text>
              <Text style={styles.itemQuantity}>{material.quantity} {material.unit}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(material.total_cost)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Labor */}
      {quote.labor && quote.labor.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Labor</Text>
          <View style={styles.itemRow}>
            <Text style={[styles.itemName, { fontWeight: 'bold' }]}>Service</Text>
            <Text style={[styles.itemQuantity, { fontWeight: 'bold' }]}>Duration</Text>
            <Text style={[styles.itemPrice, { fontWeight: 'bold' }]}>Amount</Text>
          </View>
          {quote.labor.map((labor: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{labor.name}</Text>
              <Text style={styles.itemQuantity}>{labor.quantity} days</Text>
              <Text style={styles.itemPrice}>{formatCurrency(labor.total_cost)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Equipment */}
      {quote.selected_equipment && quote.selected_equipment.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment</Text>
          <View style={styles.itemRow}>
            <Text style={[styles.itemName, { fontWeight: 'bold' }]}>Equipment</Text>
            <Text style={[styles.itemQuantity, { fontWeight: 'bold' }]}>Duration</Text>
            <Text style={[styles.itemPrice, { fontWeight: 'bold' }]}>Amount</Text>
          </View>
          {quote.selected_equipment.map((equipment: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{equipment.name}</Text>
              <Text style={styles.itemQuantity}>{equipment.duration} days</Text>
              <Text style={styles.itemPrice}>{formatCurrency(equipment.total_cost)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Additional Services */}
      {quote.selected_services && quote.selected_services.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Services</Text>
          <View style={styles.itemRow}>
            <Text style={[styles.itemName, { fontWeight: 'bold' }]}>Service</Text>
            <Text style={[styles.itemQuantity, { fontWeight: 'bold' }]}>Quantity</Text>
            <Text style={[styles.itemPrice, { fontWeight: 'bold' }]}>Amount</Text>
          </View>
          {quote.selected_services.map((service: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{service.name}</Text>
              <Text style={styles.itemQuantity}>{service.quantity || 1}</Text>
              <Text style={styles.itemPrice}>{formatCurrency(service.total_cost)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Cost Breakdown with Profit Details */}
      <View style={styles.totalSection}>
        <Text style={styles.sectionTitle}>Cost Breakdown</Text>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Materials Cost:</Text>
          <Text style={styles.totalValue}>{formatCurrency(quote.materials_cost)}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Labor Cost:</Text>
          <Text style={styles.totalValue}>{formatCurrency(quote.labor_cost)}</Text>
        </View>
        
        {quote.equipment_costs && quote.equipment_costs > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Equipment Cost:</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.equipment_costs)}</Text>
          </View>
        )}
        
        {quote.transport_costs && quote.transport_costs > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Transport Cost:</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.transport_costs)}</Text>
          </View>
        )}
        
        {quote.additional_services_cost && quote.additional_services_cost > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Additional Services:</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.additional_services_cost)}</Text>
          </View>
        )}
        
        {quote.addons_cost > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Add-ons:</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.addons_cost)}</Text>
          </View>
        )}
        
        {quote.overall_profit_amount && quote.overall_profit_amount > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Profit Margin:</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.overall_profit_amount)}</Text>
          </View>
        )}
        
        <View style={[styles.totalRow, { marginTop: 10 }]}>
          <Text style={[styles.totalLabel, styles.grandTotal]}>Total Amount:</Text>
          <Text style={[styles.totalValue, styles.grandTotal]}>{formatCurrency(quote.total_amount)}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This quote is valid for 30 days from the date of issue.
        </Text>
        <Text style={styles.footerText}>
          Thank you for choosing our construction services!
        </Text>
      </View>
    </Page>
  </Document>
);

export const generateQuotePDF = async (quote: Quote) => {
  const doc = <QuotePDF quote={quote} />;
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `quote-${quote.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
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
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Generate PDF Quote</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Quote Details</h4>
          <div className="text-sm space-y-1">
            <p><strong>Title:</strong> {quote.title}</p>
            <p><strong>Client:</strong> {quote.client_name}</p>
            <p><strong>Total:</strong> {formatCurrency(quote.total_amount)}</p>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Contractor Information</h4>
          <div className="text-sm space-y-1">
            <p><strong>Name:</strong> {contractorName || 'Not provided'}</p>
            <p><strong>Company:</strong> {contractorCompany || 'Not provided'}</p>
            <p><strong>Phone:</strong> {contractorPhone || 'Not provided'}</p>
            <p><strong>Email:</strong> {contractorEmail || 'Not provided'}</p>
          </div>
        </div>

        <Button onClick={handleGeneratePDF} className="w-full">
          <FileText className="w-4 h-4 mr-2" />
          Generate & Download PDF
        </Button>
      </div>
    </div>
  );
};

export default PDFGenerator;
