// src/components/PDFGenerator.tsx
import React, { useMemo } from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { BOQSection, BOQItem } from '@/types/boq'; // Adjust import path

// --- Register Fonts ---
// Using built-in Helvetica for simplicity. You can register custom fonts if needed.
// Font.register({
//   family: 'Helvetica',
//   fonts: [
//     { src: 'https://cdn.jsdelivr.net/npm/@react-pdf/font@1.0.0/fonts/Helvetica.ttf' },
//     { src: 'https://cdn.jsdelivr.net/npm/@react-pdf/font@1.0.0/fonts/Helvetica-Bold.ttf', fontWeight: 'bold' },
//   ],
// });

// --- Styles ---
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12, // Slightly smaller base font
    fontFamily: 'Helvetica',
    lineHeight: 1.3, // Adjust line height for better spacing
  },
  header: {
    textAlign: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 5,
  },
  projectInfoRow: {
    flexDirection: 'row',
    marginBottom: 2,
    fontSize: 15, // Smaller font for project info
  },
  projectInfoLabel: {
    width: 100, // Adjusted width
    fontWeight: 'bold',
  },
  projectInfoValue: {
    flex: 1,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    paddingVertical: 2,
    borderBottom: '1pt solid #000',
    borderTop: '1pt solid #000',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    backgroundColor: '#f0f0f0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5, // Thinner row border
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
    minHeight: 15, // Adjusted row height
  },
  tableColHeader: {
    borderRightWidth: 0.5, // Thinner column border
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 2, // Reduced padding
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15, // Smaller header font
  },
  tableColHeaderDescription: {
    borderRightWidth: 0.5,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 2,
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1, // Take remaining space
    fontSize: 15,
  },
  tableCol: {
    borderRightWidth: 0.5,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 2,
    textAlign: 'center',
    fontSize: 15, // Smaller cell font
  },
  tableColDescription: {
    borderRightWidth: 0.5,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 2,
    textAlign: 'left',
    flex: 1,
    fontSize: 15,
  },
  tableColAmount: {
    padding: 2, // No right border for the last column
    textAlign: 'right',
    fontSize: 15,
  },
  sectionTotalRow: {
    flexDirection: 'row',
    marginTop: 3,
    marginBottom: 8,
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionTotalLabel: {
    width: '80%',
    textAlign: 'right',
    paddingRight: 5,
  },
  sectionTotalValue: {
    width: '20%',
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    marginTop: 15,
    borderTop: '2pt solid #000',
    paddingTop: 8,
    fontWeight: 'bold',
    fontSize: 15,
  },
  grandTotalLabel: {
    width: '80%',
    textAlign: 'right',
    paddingRight: 5,
  },
  grandTotalValue: {
    width: '20%',
    textAlign: 'right',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 15,
  },
  // --- Preliminary Pages Styles ---
  prelimPage: {
    padding: 40,
    fontSize: 14,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
  },
  prelimTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  prelimSubtitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  prelimContent: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  prelimList: {
    marginBottom: 8,
  },
  prelimListItem: {
    marginBottom: 4,
    paddingLeft: 10,
  },
  materialScheduleSection: {
    marginTop: 20,
  },
  materialScheduleTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottom: '1pt solid #000',
  },
  materialScheduleTable: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 8,
  },
  materialScheduleHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    backgroundColor: '#f0f0f0',
  },
  materialScheduleRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
    minHeight: 15,
  },
  materialScheduleColHeader: {
    borderRightWidth: 0.5,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 2,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    fontSize: 20,
  },
  materialScheduleCol: {
    borderRightWidth: 0.5,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
    padding: 2,
    textAlign: 'center',
    flex: 1,
    fontSize: 20,
  },
  materialScheduleColLast: {
    padding: 2,
    textAlign: 'center',
    flex: 1,
    fontSize: 20,
  },
  // --- Footer for BOQ pages ---
  boqFooter: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 20,
    borderTop: '0.5pt solid #000',
    paddingTop: 2,
  }
});

// --- Helper Functions ---
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// --- Type for Project Info ---
interface ProjectInfo {
  title: string;
  clientName: string;
  clientEmail: string;
  location: string;
  projectType: string;
  houseType: string;
  region: string;
  floors: number;
  date: string; // Formatted date string
}

// --- Type for Material Schedule Item ---
interface MaterialScheduleItem {
  description: string;
  unit: string;
  quantity: number;
}

// --- Main Component ---
interface PDFGeneratorProps {
  boqData: BOQSection[];
  projectInfo: ProjectInfo;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ boqData, projectInfo }) => {
  // --- Calculate Section Totals ---
  const calculateSectionTotal = (items: BOQItem[]): number => {
    return items.reduce((total, item) => {
      if (item.isHeader) return total;
      return total + (item.amount || 0);
    }, 0);
  };

  // --- Calculate Grand Total ---
  const calculateGrandTotal = (): number => {
    return boqData.reduce((total, section) => {
      return total + calculateSectionTotal(section.items);
    }, 0);
  };

  // --- Generate Material Schedule ---
  const generateMaterialSchedule = (): MaterialScheduleItem[] => {
    const materialMap: Record<string, { unit: string; quantity: number }> = {};

    if (Array.isArray(boqData)) {
      boqData.forEach(section => {
        if (Array.isArray(section.items)) {
          section.items.forEach(item => {
            if (item.isHeader) return; // Skip header items

            const descLower = (item.description || '').toLowerCase();
            let materialKey = '';
            let unit = item.unit || '';

            // Heuristic-based material identification based on description keywords
            if (descLower.includes('cement')) {
              materialKey = 'Cement';
              unit = 'bags';
            } else if (descLower.includes('sand')) {
              materialKey = 'Sand';
              unit = 'm³';
            } else if (descLower.includes('ballast') || descLower.includes('stone')) {
              materialKey = 'Ballast';
              unit = 'm³';
            } else if (descLower.includes('block')) {
              materialKey = 'Blocks';
              unit = 'No.';
            } else if (descLower.includes('brick')) {
              materialKey = 'Bricks';
              unit = 'No.';
            } else if (descLower.includes('steel') || descLower.includes('reinforcement') || descLower.includes('rebar') || descLower.includes('ribbed bar')) {
              materialKey = 'Reinforcement Steel';
              unit = 'Kg';
            } else if (descLower.includes('concrete')) {
                materialKey = 'Concrete';
                unit = 'm³';
            } else if (descLower.includes('window')) {
                 materialKey = 'Windows';
                 unit = 'No.';
            } else if (descLower.includes('door')) {
                 materialKey = 'Doors';
                 unit = 'No.';
            }
            // Add more material mappings as needed...

            if (materialKey) {
              if (!materialMap[materialKey]) {
                materialMap[materialKey] = { unit, quantity: 0 };
              }
              const itemQuantity = typeof item.quantity === 'number' ? item.quantity : 0;
              // Simple aggregation - assumes units are consistent for the same material key.
              // A more robust system would handle unit conversions.
              materialMap[materialKey].quantity += itemQuantity;
            }
          });
        }
      });
    }

    return Object.entries(materialMap)
      .map(([description, { unit, quantity }]) => ({
        description,
        unit,
        quantity,
      }))
      // Sort materials alphabetically
      .sort((a, b) => a.description.localeCompare(b.description));
  };

  const materialScheduleData = useMemo(() => generateMaterialSchedule(), [boqData]);
  const grandTotal = useMemo(() => calculateGrandTotal(), [boqData]);

  return (
    <Document>
      {/* --- Preliminary Pages --- */}
      {/* Page 1: Title Page */}
      <Page size="A4" style={styles.prelimPage}>
        <View style={styles.header}>
          <Text style={styles.title}>BILLS OF QUANTITIES</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.title}>{projectInfo.title || 'Not Provided'}</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.subtitle}>{projectInfo.clientName || 'Not provided'}</Text>
          <Text style={styles.subtitle}>({projectInfo.location || 'Location not provided'})</Text>
        </View>

        <View style={{ marginTop: 50 }}>
          <Text style={styles.prelimContent}>
            This document presents the Bill of Quantities (BOQ) for the {projectInfo.projectType || 'project'} located at {projectInfo.location || 'the specified location'}. The quantities have been measured and described according to standard practices.
          </Text>
          <Text style={styles.prelimContent}>
            The rates and prices included are based on current market conditions and the specifications provided. The Contractor is responsible for verifying all quantities and dimensions on site.
          </Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>

      {/* Page 2: Instructions & Conditions (Example) */}
      <Page size="A4" style={styles.prelimPage}>
        <Text style={styles.prelimTitle}>INSTRUCTIONS AND CONDITIONS OF CONTRACT</Text>

        <View style={styles.prelimList}>
          <Text style={styles.prelimListItem}>1. The Contractor shall carefully study and comply with all terms and conditions of this Contract.</Text>
          <Text style={styles.prelimListItem}>2. All work shall be executed in accordance with the Contract Documents, including these Bills of Quantities, Drawings, and Specifications.</Text>
          <Text style={styles.prelimListItem}>3. The quantities given are for the purpose of Tender only and are not necessarily the exact quantities which will be executed and measured in the course of the Contract.</Text>
          <Text style={styles.prelimListItem}>4. The Contractor shall take into account all factors affecting the work, including access, working space, and coordination with other trades.</Text>
          <Text style={styles.prelimListItem}>5. All materials shall be of the quality specified and approved by the Architect/Engineer.</Text>
          <Text style={styles.prelimListItem}>6. Payment will be made based on the measured and valued work executed, subject to the terms of the Contract.</Text>
          <Text style={styles.prelimListItem}>7. The Contractor shall provide and maintain all necessary insurances as required by the Contract.</Text>
          <Text style={styles.prelimListItem}>8. The Contractor shall ensure the safety of persons and property during the execution of the works.</Text>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>

      {/* Page 3: General Preliminaries (Example) */}
      <Page size="A4" style={styles.prelimPage}>
        <Text style={styles.prelimTitle}>GENERAL PRELIMINARIES</Text>
        <Text style={styles.prelimSubtitle}>BILL No. 1</Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColHeader, { width: '8%' }]}>ITEM</Text>
            <Text style={[styles.tableColHeaderDescription, { width: '52%' }]}>DESCRIPTION</Text>
            <Text style={[styles.tableColHeader, { width: '8%' }]}>UNIT</Text>
            <Text style={[styles.tableColHeader, { width: '10%' }]}>QTY</Text>
            <Text style={[styles.tableColHeader, { width: '11%' }]}>RATE (KSh)</Text>
            <Text style={[styles.tableColHeader, { width: '11%' }]}>AMOUNT (KSh)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { width: '8%' }]}>A</Text>
            <Text style={[styles.tableColDescription, { width: '52%' }]}>Signboard as designed and approved</Text>
            <Text style={[styles.tableCol, { width: '8%' }]}>ITEM</Text>
            <Text style={[styles.tableCol, { width: '10%' }]}>1.00</Text>
            <Text style={[styles.tableCol, { width: '11%' }]}>5,000.00</Text>
            <Text style={[styles.tableColAmount, { width: '11%' }]}>5,000.00</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { width: '8%' }]}>B</Text>
            <Text style={[styles.tableColDescription, { width: '52%' }]}>Insurance for the works</Text>
            <Text style={[styles.tableCol, { width: '8%' }]}>ITEM</Text>
            <Text style={[styles.tableCol, { width: '10%' }]}>1.00</Text>
            <Text style={[styles.tableCol, { width: '11%' }]}>3,000.00</Text>
            <Text style={[styles.tableColAmount, { width: '11%' }]}>3,000.00</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCol, { width: '8%' }]}>C</Text>
            <Text style={[styles.tableColDescription, { width: '52%' }]}>Site supervision</Text>
            <Text style={[styles.tableCol, { width: '8%' }]}>ITEM</Text>
            <Text style={[styles.tableCol, { width: '10%' }]}>1.00</Text>
            <Text style={[styles.tableCol, { width: '11%' }]}>10,000.00</Text>
            <Text style={[styles.tableColAmount, { width: '11%' }]}>10,000.00</Text>
          </View>
          <View style={styles.sectionTotalRow}>
            <Text style={styles.sectionTotalLabel}>TOTAL FOR GENERAL PRELIMINARIES:</Text>
            <Text style={styles.sectionTotalValue}>{formatCurrency(18000.00)}</Text>
          </View>
        </View>

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>

      {/* --- BOQ Pages --- */}
      {boqData.map((section, sectionIndex) => {
        // Filter out header items for display and calculation
        const displayItems = section.items.filter(item => !item.isHeader);
        const sectionTotal = calculateSectionTotal(section.items); // Calculate total including headers if they have amounts

        return (
          <Page size="A4" style={styles.page} key={`section-${sectionIndex}`} wrap>
            

            <View style={styles.projectInfoRow}>
              <Text style={styles.projectInfoLabel}>Date:</Text>
              <Text style={styles.projectInfoValue}>{projectInfo.date}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableColHeader, { width: '8%' }]}>ITEM</Text>
                  <Text style={[styles.tableColHeaderDescription, { width: '52%' }]}>DESCRIPTION</Text>
                  <Text style={[styles.tableColHeader, { width: '8%' }]}>UNIT</Text>
                  <Text style={[styles.tableColHeader, { width: '10%' }]}>QTY</Text>
                  <Text style={[styles.tableColHeader, { width: '11%' }]}>RATE (KSh)</Text>
                  <Text style={[styles.tableColHeader, { width: '11%' }]}>AMOUNT (KSh)</Text>
                </View>
                {/* Table Rows */}
                {displayItems.length > 0 ? (
                  displayItems.map((item, itemIndex) => (
                    <View style={styles.tableRow} key={`item-${sectionIndex}-${itemIndex}`}>
                      <Text style={[styles.tableCol, { width: '8%' }]}>{item.itemNo}</Text>
                      <Text style={[styles.tableColDescription, { width: '52%' }]}>{item.description}</Text>
                      <Text style={[styles.tableCol, { width: '8%' }]}>{item.unit}</Text>
                      <Text style={[styles.tableCol, { width: '10%' }]}>
                        {(item.quantity % 1 === 0) ? item.quantity.toFixed(0) : item.quantity.toFixed(2)}
                      </Text>
                      <Text style={[styles.tableCol, { width: '11%' }]}>
                        {item.rate > 0 ? formatCurrency(item.rate) : ''}
                      </Text>
                      <Text style={[styles.tableColAmount, { width: '11%' }]}>{formatCurrency(item.amount)}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCol, { width: '100%', textAlign: 'center' }]}>
                      No items in this section.
                    </Text>
                  </View>
                )}
              </View>

              {/* Section Total */}
              <View style={styles.sectionTotalRow}>
                <Text style={styles.sectionTotalLabel}>TOTAL FOR {section.title.toUpperCase().replace('ELEMENT ', '')}:</Text>
                <Text style={styles.sectionTotalValue}>{formatCurrency(sectionTotal)}</Text>
              </View>
            </View>

            {/* Footer for BOQ pages */}
            <View style={styles.boqFooter} fixed>
                 <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
                 <Text>{projectInfo.title}</Text>
                 <Text>{projectInfo.clientName}</Text>
            </View>
            <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
          </Page>
        );
      })}

      {/* --- Material Schedule Page --- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>BILLS OF QUANTITIES</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.title}>{projectInfo.title || 'Not Provided'}</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.subtitle}>{projectInfo.clientName || 'Not provided'}</Text>
        </View>

        <View style={styles.materialScheduleSection}>
          <Text style={styles.materialScheduleTitle}>MATERIAL SCHEDULE</Text>
          <View style={styles.materialScheduleTable}>
            <View style={styles.materialScheduleHeaderRow}>
              <Text style={styles.materialScheduleColHeader}>DESCRIPTION</Text>
              <Text style={styles.materialScheduleColHeader}>UNIT</Text>
              <Text style={styles.materialScheduleColHeader}>QUANTITY</Text>
            </View>
            {materialScheduleData.length > 0 ? (
              materialScheduleData.map((material, index) => (
                <View style={styles.materialScheduleRow} key={`material-${index}`}>
                  <Text style={styles.materialScheduleCol}>{material.description}</Text>
                  <Text style={styles.materialScheduleCol}>{material.unit}</Text>
                  <Text style={styles.materialScheduleColLast}>
                    {(material.quantity % 1 === 0) ? material.quantity.toFixed(0) : material.quantity.toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.materialScheduleRow}>
                <Text style={[styles.materialScheduleCol, { flex: 3, textAlign: 'center' }]}>
                  No materials found.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer for BOQ pages */}
        <View style={styles.boqFooter} fixed>
             <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
             <Text>{projectInfo.title}</Text>
             <Text>{projectInfo.clientName}</Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>

      {/* --- Summary Page (Grand Total) --- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>BILLS OF QUANTITIES</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.title}>{projectInfo.title || 'Not Provided'}</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.subtitle}>{projectInfo.clientName || 'Not provided'}</Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.prelimTitle}>SUMMARY OF QUANTITIES AND COSTS</Text>
        </View>

        {/* Grand Total */}
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>GRAND TOTAL (KES):</Text>
          <Text style={styles.grandTotalValue}>{formatCurrency(grandTotal)}</Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.prelimContent}>
            This Bill of Quantities has been prepared based on the information provided and the measurements taken. The quantities are subject to verification on site.
          </Text>
          <Text style={styles.prelimContent}>
            The rates and prices included herein are based on current market conditions and are valid for the period specified in the contract documents.
          </Text>
        </View>

        {/* Footer for BOQ pages */}
        <View style={styles.boqFooter} fixed>
             <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
             <Text>{projectInfo.title}</Text>
             <Text>{projectInfo.clientName}</Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>

    </Document>
  );
};

export default PDFGenerator;
