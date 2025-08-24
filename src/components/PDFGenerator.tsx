// components/QuotePDF.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font, pdf } from '@react-pdf/renderer';
import { toast } from '@/hooks/use-toast';
import { CalculationResult, QuoteCalculation } from '@/hooks/useQuoteCalculations';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// Register fonts
Font.register({ family: 'Poppins', src: '/fonts/outfit.ttf' });
Font.register({ family: 'Bold', src: '/fonts/bold.ttf' });

// Format currency
const formatCurrency = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return value?.toLocaleString() || '0';
};

// Styles
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
  footer: { marginTop: 25, paddingTop: 10, borderTop: '1px solid #e2e8f0', fontSize: 10, color: '#64748b', textAlign: 'center' },
  list: { marginLeft: 15, fontSize: 10 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between' },
});

interface QuotePDFProps {
  quote: QuoteCalculation & CalculationResult;
  isClientExport?: boolean;
}

export const QuotePDF = ({ quote, isClientExport = false }: QuotePDFProps) => {
  const showProfit = !isClientExport;

  // Helper: Render section only if items exist and array is not empty
  const renderSection = (
  title: string,
  items: any[] | null | undefined,
  renderItem: (item: any, index: number) => JSX.Element
) => {
  // ✅ Safe: Ensure it's an array AND has items
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <View style={styles.section} key={title}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map(renderItem)} {/* Now safe to map */}
    </View>
  );
};

  // Helper: Render key-value list
  const renderList = (title: string, items: any[], valueKey: 'price' | 'total_price' | 'cost' | 'total_cost' | 'total' = 'price') => {
    return renderSection(title, items, (item, i) => (
      <View style={styles.row} key={i}>
        <Text style={styles.name}>{item.name || item.type || 'Item'}</Text>
        <Text style={styles.value}>
          {formatCurrency(item[valueKey] || 0)}
        </Text>
      </View>
    ));
  };

  // Render room details
  const renderRooms = () => {
    if (!quote.rooms?.length) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rooms & Walls</Text>
        {quote.rooms.map((room, idx) => (
          <View key={idx} style={{ marginBottom: 10 }}>
            <View style={styles.row}>
              <Text style={styles.name}>Room:</Text>
              <Text style={styles.value}>{room.room_name || "Unnamed"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.name}>Dimensions:</Text>
              <Text style={styles.value}>{room.length} × {room.width} × {room.height} m</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.name}>Wall Area:</Text>
              <Text style={styles.value}>{room.roomArea || 0} m²</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.name}>Plaster Area:</Text>
              <Text style={styles.value}>{room.plasterArea} m²</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.name}>Total Cost:</Text>
              <Text style={styles.value}>KSh {formatCurrency(room.totalCost || 0)}</Text>
            </View>

            {/* Doors */}
            {room.doors?.length > 0 && (
              <>
                <Text style={{ fontSize: 10, marginTop: 5, fontFamily: 'Bold' }}>Doors:</Text>
                {room.doors.map((door, dIdx) => (
                  <View style={styles.row} key={dIdx}>
                    <Text style={styles.name}>
                      {door.count} × {door.type} ({door.frame}) — {door.sizeType === 'standard' ? door.standardSize : `${door.custom.width}×${door.custom.height}m`}
                    </Text>
                    <Text style={styles.value}>
                      KSh {formatCurrency(door.price || door.custom.price || 0)}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* Windows */}
            {room.windows?.length > 0 && (
              <>
                <Text style={{ fontSize: 10, marginTop: 5, fontFamily: 'Bold' }}>Windows:</Text>
                {room.windows.map((window, wIdx) => (
                  <View style={styles.row} key={wIdx}>
                    <Text style={styles.name}>
                      {window.count} × {window.glass} ({window.frame}) — {window.sizeType === 'standard' ? window.standardSize : `${window.custom.width}×${window.custom.height}m`}
                    </Text>
                    <Text style={styles.value}>
                      KSh {formatCurrency(window.price || window.custom.price || 0)}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* Cost Breakdown */}
            <View style={{ marginTop: 5 }}>
              <Text style={{ fontSize: 10, fontFamily: 'Bold' }}>Cost Breakdown:</Text>
              <View style={styles.row}>
                <Text style={styles.name}>Blocks:</Text>
                <Text style={styles.value}>KSh {formatCurrency(room.blockCost || 0)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.name}>Cement:</Text>
                <Text style={styles.value}>KSh {formatCurrency(room.cementCost || 0)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.name}>Sand:</Text>
                <Text style={styles.value}>KSh {formatCurrency(room.sandCost || 0)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.name}>Mortar:</Text>
                <Text style={styles.value}>KSh {formatCurrency(room.mortarCost || 0)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.name}>Plaster:</Text>
                <Text style={styles.value}>KSh {formatCurrency(room.plasterCost || 0)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.name}>Openings:</Text>
                <Text style={styles.value}>KSh {formatCurrency(room.openingsCost || 0)}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Render rebar breakdown
  const renderRebar = () => {
    if (!quote.rebar_calculations?.length) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rebar</Text>
        {quote.rebar_calculations.map((item, idx) => (
          <View key={idx} style={{ marginBottom: 8 }}>
            <View style={styles.row}>
              <Text style={styles.name}>Total Bars:</Text>
              <Text style={styles.value}>{item.totalBars}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.name}>Total Length:</Text>
              <Text style={styles.value}>{item.totalLengthM} m</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.name}>Total Weight:</Text>
              <Text style={styles.value}>{item.totalWeightKg} kg</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.name}>Price per Meter:</Text>
              <Text style={styles.value}>KSh {formatCurrency(item.pricePerM || 0)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.name}>Total Price:</Text>
              <Text style={styles.value}>KSh {formatCurrency(item.totalPrice || 0)}</Text>
            </View>

            {/* Breakdown */}
            {item.breakdown && (
              <View style={{ marginLeft: 10, marginTop: 4 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Bold' }}>Breakdown:</Text>
                <View style={styles.row}><Text style={styles.name}>Ties:</Text><Text style={styles.value}>{item.breakdown.ties}</Text></View>
                <View style={styles.row}><Text style={styles.name}>Mesh X:</Text><Text style={styles.value}>{item.breakdown.meshX}</Text></View>
                <View style={styles.row}><Text style={styles.name}>Mesh Y:</Text><Text style={styles.value}>{item.breakdown.meshY}</Text></View>
                <View style={styles.row}><Text style={styles.name}>Stirrups:</Text><Text style={styles.value}>{item.breakdown.stirrups}</Text></View>
                <View style={styles.row}><Text style={styles.name}>Verticals:</Text><Text style={styles.value}>{item.breakdown.verticals}</Text></View>
                <View style={styles.row}><Text style={styles.name}>Longitudinal:</Text><Text style={styles.value}>{item.breakdown.longitudinal}</Text></View>
              </View>
            )}

            {/* Weight Breakdown */}
            {item.weightBreakdownKg && (
              <View style={{ marginLeft: 10, marginTop: 4 }}>
                <Text style={{ fontSize: 10, fontFamily: 'Bold' }}>Weight (kg):</Text>
                <View style={styles.row}><Text style={styles.name}>Mesh X:</Text><Text style={styles.value}>{item.weightBreakdownKg.meshX}</Text></View>
                <View style={styles.row}><Text style={styles.name}>Mesh Y:</Text><Text style={styles.value}>{item.weightBreakdownKg.meshY}</Text></View>
              </View>
            )}
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
          <Text style={styles.subtitle}>{isClientExport ? 'Client Quote' : 'Contractor Quote'}</Text>
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
            ['Status', quote.status?.charAt(0).toUpperCase() + quote.status.slice(1).replace('_', ' ')],
            ['Project Type', quote.project_type?.charAt(0).toUpperCase() + quote.project_type.slice(1).replace('_', ' ')],
            ['Region', quote.region],
            ['Custom Specs', quote.custom_specs],
            ['Floors', quote.floors],
            ['Date', new Date().toLocaleDateString()],
          ].map(([label, val], i) => val && (
            <View style={styles.row} key={i}>
              <Text style={styles.name}>{label}:</Text>
              <Text style={styles.value}>{val}</Text>
            </View>
          ))}
        </View>

        {/* BUILDING SPECS */}
        {quote.concrete_mix_ratio && quote.plaster_thickness && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Building Specifications</Text>
            {[
              ['Concrete Mix Ratio', quote.concrete_mix_ratio],
              ['Plaster Thickness', `${quote.plaster_thickness} mm`],
            ].map(([label, val], i) => (
              <View style={styles.row} key={i}>
                <Text style={styles.name}>{label}:</Text>
                <Text style={styles.value}>{val}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ROOMS */}
        {renderRooms()}

        {/* CONCRETE MATERIALS */}
        {renderList('Concrete Materials', quote.concrete_materials, 'total_price')}

        {/* MASONRY MATERIALS */}
        {renderList('Masonry Concrete', quote.masonry_materials, 'total_price')}

        {/* EQUIPMENT */}
        {renderList('Equipment', quote.equipment, 'total_cost')}

        {/* SUBCONTRACTORS */}
        {renderList('Subcontractors', quote.subcontractors, 'total')}

        {/* ADDONS (Subcontractor Materials) */}
        {renderList('Subcontractor Materials', quote.addons, 'price')}

        {/* SERVICES */}
        {renderList('Additional Services', quote.services, 'price')}

        {/* REBAR */}
        {renderRebar()}

        {/* TRANSPORT */}
        {quote.distance_km && quote.transport_costs && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transport</Text>
            <View style={styles.row}>
              <Text style={styles.name}>Distance:</Text>
              <Text style={styles.value}>{quote.distance_km} km</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.name}>Cost:</Text>
              <Text style={styles.value}>KSh {formatCurrency(quote.transport_costs)}</Text>
            </View>
          </View>
        )}

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
          ].map(([label, val]) => val !== undefined && val !== null && typeof val === 'number' && val > 0 && (
            <View style={styles.row} key={label}>
              <Text style={styles.name}>{label}:</Text>
              <Text style={styles.value}>KSh {formatCurrency(val)}</Text>
            </View>
          ))}
          <View style={styles.summary}>
            <Text style={styles.summaryLabel}>TOTAL PROJECT COST:</Text>
            <Text style={styles.summaryValue}>KSh {formatCurrency(quote.total_amount)}</Text>
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

// Export PDF generation
export const generateQuotePDF = async (
  quote: QuoteCalculation & CalculationResult,
  isClientExport = false
) => {
  try {
    if (!quote?.id) throw new Error('Invalid quote data');

    const asPdf = pdf();
    asPdf.updateContainer(
      <QuotePDF quote={quote} isClientExport={isClientExport} />
    );
    const blob = await asPdf.toBlob();

    const fileName = `${
      isClientExport ? 'Client' : 'Contractor'
    }_Quote_${(quote.title || 'Untitled').replace(/\s+/g, '_')}.pdf`;

    if (Capacitor.getPlatform() === 'web') {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const base64Data = await blobToBase64(blob);
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
      });
      toast({ variant: 'default', title: 'PDF generated' });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast({
      variant: 'destructive',
      title: 'Failed to generate PDF',
      description: 'Please try again.',
    });
  }
};

// Helper: blob → base64
const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(blob);
  });