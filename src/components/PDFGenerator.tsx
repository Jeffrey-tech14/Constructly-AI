// components/QuotePDF.tsx
import React from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  pdf,
} from '@react-pdf/renderer';
import { toast } from '@/hooks/use-toast';
import { CalculationResult, QuoteCalculation } from '@/hooks/useQuoteCalculations';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

Font.register({
  family: 'Poppins',
  src: '/fonts/outfit.ttf',
});

Font.register({
  family: 'Bold',
  src: '/fonts/bold.ttf',
});

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return value?.toLocaleString() || '0';
};

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Poppins', backgroundColor: '#fff' },
  header: { flexDirection: 'column', alignItems: 'center', marginBottom: 20, borderBottom: '2px solid #e2e8f0', paddingBottom: 15 },
  logo: { width: 60, height: 60, borderRadius: 10 },
  title: { fontSize: 18, fontFamily: 'Bold', color: '#1e40af' },
  subtitle: { fontSize: 10, color: '#64748b' },
  section: { marginTop: 15, padding: 10, backgroundColor: '#f8fafc', borderRadius: 6 },
  sectionTitle: { fontSize: 14, fontFamily: 'Bold', color: '#1e293b', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, fontSize: 11 },
  name: { flex: 1, color: '#334155' },
  value: { color: '#0f172a' },
  summary: { marginTop: 10, padding: 8, backgroundColor: '#eff6ff', borderRadius: 6, flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: '#1e40af', fontFamily: 'Bold' },
  summaryValue: { color: '#1e40af', fontFamily: 'Bold' },
  footer: { marginTop: 25, paddingTop: 10, borderTop: '1px solid #e2e8f0', fontSize: 10, color: '#64748b', textAlign: 'center' }
});

interface QuotePDFProps {
  quote: QuoteCalculation & CalculationResult;
  isClientExport?: boolean;
}

export const QuotePDF = ({ quote, isClientExport = false }: QuotePDFProps) => {
  const showProfit = !isClientExport;

  const renderList = (title: string, list: any[], showProfitMargin = false) => {
    if (!list?.length) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {list.map((item, i) => (
          <View style={styles.row} key={`${title}-${i}`}>
            <Text style={styles.name}>{item.name || item.type}</Text>
            <Text style={styles.value}>
              {formatCurrency(item.total_price || item.price || item.cost || item.total_cost || 0)}
              {showProfit && showProfitMargin && item.profit_margin ? ` (${item.profit_margin}% profit)` : ''}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image src="/favicon.png" style={styles.logo} />
          <Text style={styles.title}>{quote.company_name}</Text>
          <Text style={styles.subtitle}>Constructly Kenya</Text>
          {isClientExport ? <Text style={styles.subtitle}>Client Quote</Text> : <Text style={styles.subtitle}>Contractor Quote</Text>}
          <Text style={styles.subtitle}>Quality • Reliability • Excellence</Text>
        </View>

        {/* PROJECT INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          {[
            ['Contractor Name', quote.contractor_name],
            ['Title', quote.title],
            ['Client Name', quote.client_name],
            ['Client Email', quote.client_email],
            ['Location', quote.location],
            ['House Type', quote.house_type],
            ['Status', quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace('_', ' ')],
            ['Contract Type', quote.contract_type.charAt(0).toUpperCase() + quote.contract_type.slice(1).replace('_', ' ')],
            ['Project Type', quote.project_type.charAt(0).toUpperCase() + quote.project_type.slice(1).replace('_', ' ')],
            ['Region', quote.region],
            ['Custom Specs', quote.custom_specs],
            ['Date', new Date().toLocaleDateString()],
          ].map(([label, val], i) => (
            <View style={styles.row} key={i}>
              <Text style={styles.name}>{label}:</Text>
              <Text style={styles.value}>{val || 'N/A'}</Text>
            </View>
          ))}
        </View>

        {/* BUILDING SPECS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Building Specifications</Text>
          {[
            ['Foundation Length', `${quote.foundation_length} m`],
            ['Foundation Width', `${quote.foundation_width} m`],
            ['Foundation Depth', `${quote.foundation_depth} m`],
            ['Concrete Mix Ratio', quote.concrete_mix_ratio],
            ['Plaster Thickness', `${quote.plaster_thickness} mm`],
            ['Rebar %', `${quote.percentages[0].rebar}%`],
            ['Wastage %', `${quote.percentages[0].wastage}%`],
          ].map(([label, val], i) => (
            <View style={styles.row} key={i}>
              <Text style={styles.name}>{label}:</Text>
              <Text style={styles.value}>{val}</Text>
            </View>
          ))}
        </View>

        {/* ROOMS */}
        {renderList('Rooms', quote.rooms?.map(r => ({
          name: `${r.room_name} (${r.length}m x ${r.width}m x ${r.height})`,
          total_price: parseFloat(r.length) * parseFloat(r.width) * parseFloat(r.height) + ' m³'
        })))}

        {/* MATERIALS & CONSTRUCTION */}
        {renderList('Materials', quote.materials, true)}
        {renderList('Concrete', quote.concrete, true)}
        {renderList('Formwork', quote.formwork, true)}
        {renderList('Rebar', quote.rebar, true)}
        {renderList('Plaster', quote.plaster, true)}
        {renderList('Ceiling', quote.ceiling, true)}

        {/* SERVICES & SUBCONTRACTORS */}
        {renderList('Additional Services', quote.services)}
        {renderList('Subcontractors', quote.subcontractors)}

        {/* ADDONS */}
        {renderList('Addons', quote.addons)}

        {/* EQUIPMENT */}
        {renderList('Equipment', quote.equipment)}

        {/* TRANSPORT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transport</Text>
          <View style={styles.row}>
            <Text style={styles.name}>Distance:</Text>
            <Text style={styles.value}>{quote.distance_km} km</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.name}>Cost:</Text>
            <Text style={styles.value}>{formatCurrency(quote.transport_costs)}</Text>
          </View>
        </View>

        {/* COST SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Summary</Text>
          {[
            ['Materials', quote.materials_cost],
            ['Labor', quote.labor_cost],
            ['Equipment', quote.equipment_costs],
            ['Addons', quote.addons_cost],
            ['Additional Services', quote.additional_services_cost],
            ['Permit', quote.permit_cost],
            ['Overhead', quote.overhead_amount],
            ['Contingency', quote.contingency_amount],
            ...(showProfit ? [['Profit', quote.profit_amount]] : []),
          ].map(([label, val], i) => (
            <View style={styles.row} key={i}>
              <Text style={styles.name}>{label}:</Text>
              <Text style={styles.value}>{formatCurrency(val as number)}</Text>
            </View>
          ))}
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>TOTAL PROJECT COST:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(quote.total_amount)}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Generated by Constructly Kenya • {quote.company_name} • www.constructly.co.ke</Text>
          <Text>For inquiries: hello@constructly.co.ke</Text>
        </View>
      </Page>
    </Document>
  );
};

// Utility to generate & download PDF
export const generateQuotePDF = async (
  quote: QuoteCalculation & CalculationResult,
  isClientExport = false
) => {
  try {
    if (!quote?.id) throw new Error('Invalid quote data');

    const safeQuote = { ...quote };
    const asPdf = pdf();
    asPdf.updateContainer(
      <QuotePDF quote={safeQuote} isClientExport={isClientExport} />
    );
    const blob = await asPdf.toBlob();

    const fileName = `${
      isClientExport ? 'Client' : 'Contractor'
    }_Quote_${quote.title?.replace(/\s+/g, '_') || 'Untitled'}.pdf`;

    if (Capacitor.getPlatform() === 'web') {
      // ✅ Browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // ✅ Native Android/iOS: save using Capacitor Filesystem
      const base64Data = await blobToBase64(blob);

      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents, // Downloads folder
      });

      console.log('PDF saved to Downloads:', fileName);
       toast({
        variant: 'default',
        title: 'PDF generated',
      });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast({
      variant: 'destructive',
      title: 'Failed to generate PDF',
      description: 'Please check your quote data and try again.',
    });
  }
};

// helper: convert blob → base64
const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve((reader.result as string).split(',')[1]); // remove data: prefix
    reader.readAsDataURL(blob);
  });
