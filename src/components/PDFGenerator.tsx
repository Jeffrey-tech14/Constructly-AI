import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import { Quote } from '@/hooks/useQuotes';
import { pdf, Document as PDFDocument, Page as PDFPage, Text as PDFText, View as PDFView, StyleSheet } from '@react-pdf/renderer';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ExportedQuotePDFProps {
  quote: Quote;
  isClientExport?: boolean;
}

export const generateQuotePDF = async ({ quote, isClientExport = false }: ExportedQuotePDFProps) => {
  try {
    // Clean quote data before rendering
    if (!quote || !quote.id) {
      throw new Error("Invalid quote data");
    }

    // Ensure all arrays exist and are not undefined
    const safeQuote = {
      ...quote,
      materials: Array.isArray(quote.materials) ? quote.materials : [],
      labor: Array.isArray(quote.labor) ? quote.labor : [],
      equipment: Array.isArray(quote.equipment) ? quote.equipment : [],
      concrete: Array.isArray(quote.concrete) ? quote.concrete : [],
      formwork: Array.isArray(quote.formwork) ? quote.formwork : [],
      rebar: Array.isArray(quote.rebar) ? quote.rebar : [],
      plaster: Array.isArray(quote.plaster) ? quote.plaster : []
    };

    const doc = <QuotePDF quote={safeQuote} isClientExport={isClientExport} />;
    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();

    const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${isClientExport ? 'Client' : 'Contractor'}_Quote_${quote.title.replace(/\s+/g, '_')}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Error generating PDF:", error);
    toast({
        variant:'destructive',
        title: 'Failed to generate PDF. Please check your quote data and try again.'
   })
  }
};


// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10
  },
  header: {
    marginBottom: 20,
    textAlign: 'center'
  },
  logo: {
    width: 80,
    height: 40,
    margin: 'auto',
    marginBottom: 5
  },
  companyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: 10
  },
  companySubtitle: {
    fontSize: 10,
    color: '#3b82f6',
    marginBottom: 20
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: 5,
    marginBottom: 5
  },
  itemName: {
    fontSize: 10,
    color: '#1e40af',
    fontWeight: 'bold'
  },
  itemValue: {
    fontSize: 10,
    color: '#0f172a',
    fontWeight: 'bold'
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 15,
    marginTop: 10
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0c4a6e'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: 5
  },
  footerCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 20,
    marginTop: 30,
    textAlign: 'center'
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 1.5,
    marginBottom: 5
  }
});

interface QuotePDFProps {
  quote: Quote;
  isClientExport?: boolean;
}

export const QuotePDF = ({ quote, isClientExport = false }: QuotePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        
        <Text style={styles.companyTitle}>Constructly Kenya</Text>
        <Text style={styles.companySubtitle}>Quality • Reliability • Excellence</Text>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Project Summary</Text>
        <View style={styles.itemRow}>
          <Text>Title:</Text>
          <Text>{quote.title}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text>Client:</Text>
          <Text>{quote.client_name}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text>Location:</Text>
          <Text>{quote.location}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text>House type:</Text>
          <Text>{quote.house_type}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text>Date:</Text>
          <Text>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Materials Breakdown */}
      {!isClientExport && quote.materials?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materials Breakdown</Text>
          {quote.materials.map((item, idx) => (
            <View key={`material-${idx}`} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemValue}>{formatCurrency(item.total_price || 0)}</Text>
            </View>
          ))}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Materials Cost:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(quote.materials_cost || 0)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Distance:</Text>
            <Text style={styles.summaryValue}>{quote.distance_km+" kms"}</Text>
          </View>
        </View>
      )}

      {/* Equipment Rental */}
      {!isClientExport && quote.equipment?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Used</Text>
          {quote.equipment.map((eq, idx) => (
            <View key={`equipment-${idx}`} style={styles.itemRow}>
              <Text style={styles.itemName}>{eq.name}</Text>
              <Text style={styles.itemValue}>{formatCurrency(eq.total_cost || 0)}</Text>
            </View>
          ))}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Equipment Cost:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(quote.equipment_costs || 0)}</Text>
          </View>
        </View>
      )}

      {/* Additional Services */}
      {!isClientExport && quote.addons?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Services</Text>
          {quote.addons.map((service, idx) => (
            <View key={`service-${idx}`} style={styles.itemRow}>
              <Text style={styles.itemName}>{service.name}</Text>
              <Text style={styles.itemValue}>{formatCurrency(service.price || 0)}</Text>
            </View>
          ))}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Services Cost:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(quote.addons_cost || 0)}</Text>
          </View>
        </View>
      )}

      {/* Total Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Final Project Cost:</Text>
        <Text style={styles.summaryValue}>{formatCurrency(quote.total_amount || 0)}</Text>
        {!isClientExport && (
          <Text style={{ ...styles.summaryLabel, marginTop: 10 }}>
            Profit Margin: {formatCurrency(quote.profit_amount || 0)}
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footerCard}>
        <Text style={styles.footerText}>
          This quote is valid for 30 days from the date of issue.
        </Text>
        <Text style={styles.footerText}>
          Prices may vary based on market conditions or unforeseen changes.
        </Text>
        <Text style={styles.footerText}>
          We appreciate your trust in our construction services and look forward to bringing your vision to life.
        </Text>
        <Text style={{ ...styles.footerText, marginTop: 10, fontWeight: 'bold' }}>
          Constructly Kenya - Building Dreams, Creating Futures
        </Text>
      </View>
    </Page>
  </Document>
);

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `KSh ${Number(value || 0).toLocaleString()}`;
};