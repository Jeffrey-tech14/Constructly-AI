// src/components/PDFGenerator.tsx
import React, { useMemo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { BOQSection, BOQItem } from "@/types/boq";
import {
  AdvancedMaterialExtractor,
  CategorizedMaterial,
  MaterialSchedule,
} from "@/utils/advancedMaterialExtractor";
import {
  ConsolidatedMaterial,
  MaterialConsolidator,
} from "@/utils/materialConsolidator";

// --- Register Outfit Font ---
Font.register({
  family: "Outfit",
  fonts: [
    { src: "/fonts/Outfit-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Outfit-Bold.ttf", fontWeight: "bold" },
    { src: "/fonts/Outfit-Light.ttf", fontWeight: "light" },
    { src: "/fonts/Outfit-Medium.ttf", fontWeight: "medium" },
    { src: "/fonts/Outfit-SemiBold.ttf", fontWeight: "semibold" },
  ],
});

// --- Styles ---
const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 10,
    fontFamily: "Outfit",
    lineHeight: 1.3,
    backgroundColor: "#FFFFFF",
  },
  header: {
    textAlign: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 6,
    color: "#4B5563",
    fontWeight: 500,
  },
  projectInfoContainer: {
    marginBottom: 15,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  projectInfoRow: {
    flexDirection: "row",
    marginBottom: 4,
    fontSize: 11,
  },
  projectInfoLabel: {
    width: 100,
    fontWeight: "bold",
    color: "#374151",
  },
  projectInfoValue: {
    flex: 1,
    color: "#6B7280",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
    borderRadius: 4,
  },
  table: {
    width: "100%",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    color: "#FFFFFF",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    minHeight: 18,
  },
  tableColHeader: {
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 9,
    color: "#FFFFFF",
  },
  tableColHeaderDescription: {
    padding: 5,
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
    fontSize: 9,
    color: "#FFFFFF",
  },
  tableCol: {
    padding: 5,
    textAlign: "center",
    fontSize: 9,
    color: "#4B5563",
  },
  tableColDescription: {
    padding: 5,
    textAlign: "left",
    flex: 1,
    fontSize: 9,
    color: "#4B5563",
  },
  tableColAmount: {
    padding: 5,
    textAlign: "right",
    fontSize: 9,
    color: "#4B5563",
  },
  sectionTotalRow: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 11,
    backgroundColor: "#F3F4F6",
    padding: 6,
    borderRadius: 4,
  },
  sectionTotalLabel: {
    width: "80%",
    textAlign: "right",
    paddingRight: 8,
    color: "#374151",
  },
  sectionTotalValue: {
    width: "20%",
    textAlign: "right",
    color: "#1F2937",
  },
  grandTotalRow: {
    flexDirection: "row",
    marginTop: 15,
    borderTop: "2pt solid #3B82F6",
    paddingTop: 10,
    fontWeight: "bold",
    fontSize: 14,
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 6,
  },
  grandTotalLabel: {
    width: "80%",
    textAlign: "right",
    paddingRight: 8,
    color: "#1E40AF",
  },
  grandTotalValue: {
    width: "20%",
    textAlign: "right",
    color: "#1E40AF",
  },
  pageNumber: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: "#6B7280",
  },
  materialScheduleTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },

  // Material schedule specific columns
  materialScheduleColHeaderItem: {
    width: "14%", // Slightly larger for item numbers
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 9,
    color: "#FFFFFF",
  },

  materialScheduleColHeaderDescription: {
    width: "30%", // Adjusted for balance
    padding: 5,
    fontWeight: "bold",
    textAlign: "left",
    fontSize: 9,
    color: "#FFFFFF",
  },

  materialScheduleColHeaderUnit: {
    width: "14%",
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 9,
    color: "#FFFFFF",
  },

  materialScheduleColHeaderQty: {
    width: "14%",
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 9,
    color: "#FFFFFF",
  },

  materialScheduleColHeaderRate: {
    width: "14%",
    padding: 5,
    fontWeight: "bold",
    textAlign: "right",
    fontSize: 9,
    color: "#FFFFFF",
  },

  materialScheduleColHeaderAmount: {
    width: "14%",
    padding: 5,
    fontWeight: "bold",
    textAlign: "right",
    fontSize: 9,
    color: "#FFFFFF",
  },

  // Corresponding data columns
  materialScheduleColItem: {
    width: "14%",
    padding: 5,
    textAlign: "center",
    fontSize: 9,
    color: "#4B5563",
  },

  materialScheduleColDescription: {
    width: "30%",
    padding: 5,
    textAlign: "left",
    fontSize: 9,
    color: "#4B5563",
  },

  materialScheduleColUnit: {
    width: "14%",
    padding: 5,
    textAlign: "center",
    fontSize: 9,
    color: "#4B5563",
  },

  materialScheduleColQty: {
    width: "14%",
    padding: 5,
    textAlign: "center",
    fontSize: 9,
    color: "#4B5563",
  },

  materialScheduleColRate: {
    width: "14%",
    padding: 5,
    textAlign: "right",
    fontSize: 9,
    color: "#4B5563",
  },

  materialScheduleColAmount: {
    width: "14%",
    padding: 5,
    textAlign: "right",
    fontSize: 9,
    color: "#4B5563",
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
  },
  logoContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
    backgroundColor: "#ffffffff",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  companyTagline: {
    fontSize: 10,
    color: "#6B7280",
  },
  materialScheduleSection: {
    marginTop: 15,
  },
  materialScheduleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
    borderRadius: 4,
    textAlign: "center",
  },
  materialScheduleHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
  },
  materialScheduleRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    minHeight: 18,
  },
  boqFooter: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#6B7280",
    paddingTop: 8,
    borderTop: "1pt solid #E5E7EB",
  },
  boldText: {
    fontWeight: "bold",
  },
  prelimPage: {
    padding: 25,
    fontSize: 11,
    fontFamily: "Outfit",
    lineHeight: 1.4,
    backgroundColor: "#FFFFFF",
  },
  prelimTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#1F2937",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#3B82F6",
    borderBottomStyle: "solid",
  },
  prelimSubtitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 10,
    marginTop: 12,
    color: "#374151",
    paddingLeft: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
    borderLeftStyle: "solid",
  },
  prelimContent: {
    marginBottom: 10,
    textAlign: "justify",
    color: "#4B5563",
  },
  headerRow: {
    backgroundColor: "#F3F4F6",
    fontWeight: "bold",
  },
});

// --- Helper Functions ---
const formatCurrency = (amount: number): string => {
  if (!amount || amount === 0) return "";
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatQuantity = (quantity: any): string => {
  if (quantity === null || quantity === undefined || quantity === "") return "";
  const num = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  if (isNaN(num)) return "";
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};

// --- Types ---
interface ProjectInfo {
  title: string;
  clientName: string;
  clientEmail?: string;
  location: string;
  projectType: string;
  houseType?: string;
  region?: string;
  floors?: number;
  date: string;
  consultant?: string;
  contractor?: string;
  drawingReference?: string;
  boqReference?: string;
  logoUrl?: string;
  companyName?: string;
  companyTagline?: string;
}

interface Preliminaries {
  items: PreliminariesItem[];
  title: string;
}

interface PreliminariesItem {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  isHeader?: boolean;
}

interface PDFGeneratorProps {
  boqData: BOQSection[];
  projectInfo: ProjectInfo;
  preliminariesData?: Preliminaries[];
  materialSchedule?: any[]; // Make this optional
}

// --- Main Component ---
const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  boqData,
  projectInfo,
  preliminariesData = [],
  materialSchedule,
}) => {
  // --- Filter out empty sections ---
  const nonEmptySections = useMemo(() => {
    return boqData.filter((section) => {
      // Include sections that have either non-header items OR are important structural sections
      const hasNonHeaderItems = section.items.some((item) => !item.isHeader);
      const hasHeadersOnly = section.items.some((item) => item.isHeader);

      // Keep sections with actual items OR sections that might be important for structure
      return hasNonHeaderItems || (hasHeadersOnly && section.items.length > 0);
    });
  }, [boqData]);

  const consolidatedMaterials = useMemo(() => {
    let allMaterials: CategorizedMaterial[] = [];

    if (materialSchedule && Array.isArray(materialSchedule)) {
      // Use the provided material schedule array directly
      allMaterials = materialSchedule;
    } else {
      // Fallback: extract from BOQ data
      const mockQuote = {
        boqData: boqData,
        concrete_materials: [],
        rebar_calculations: [],
        rooms: [],
      };
      const schedule = AdvancedMaterialExtractor.extractLocally(mockQuote);
      allMaterials = Object.values(schedule).flat();
    }

    // Consolidate all materials into a single array
    return MaterialConsolidator.consolidateAllMaterials(allMaterials);
  }, [boqData, materialSchedule]);

  // Remove the renderMaterialSchedule function and replace with a simple table renderer:
  const renderConsolidatedMaterials = (materials: ConsolidatedMaterial[]) => {
    if (materials.length === 0) return null;

    const itemChunks = chunkArray(materials, 20); // 20 items per page

    return itemChunks.map((chunk, chunkIndex) => (
      <Page key={`materials-chunk-${chunkIndex}`} style={styles.page}>
        <CompanyHeader />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MATERIALS SCHEDULE</Text>

          <View style={styles.table}>
            {/* Table headers only on first chunk */}
            {chunkIndex === 0 && (
              <View style={styles.tableHeaderRow}>
                <Text style={styles.tableColHeader}>ITEM</Text>
                <Text style={styles.tableColHeaderDescription}>
                  DESCRIPTION
                </Text>
                <Text style={styles.tableColHeader}>UNIT</Text>
                <Text style={styles.tableColHeader}>QTY</Text>
                <Text style={styles.tableColHeader}>RATE</Text>
                <Text style={styles.tableColHeader}>AMOUNT</Text>
              </View>
            )}

            {chunk.map((material, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCol}>{material.itemNo}</Text>
                <Text style={styles.tableColDescription}>
                  {material.description}
                </Text>
                <Text style={styles.tableCol}>{material.unit}</Text>
                <Text style={styles.tableCol}>
                  {formatQuantity(material.quantity)}
                </Text>
                <Text style={styles.tableCol}>
                  {formatCurrency(material.rate)}
                </Text>
                <Text style={styles.tableCol}>
                  {formatCurrency(material.amount)}
                </Text>
              </View>
            ))}
          </View>

          {/* Total on last chunk */}
          {chunkIndex === itemChunks.length - 1 && (
            <View style={styles.sectionTotalRow}>
              <Text style={styles.sectionTotalLabel}>
                TOTAL MATERIALS COST:
              </Text>
              <Text style={styles.sectionTotalValue}>
                {formatCurrency(
                  materials.reduce((sum, m) => sum + m.amount, 0)
                )}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.boqFooter} fixed>
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
          <Text>{projectInfo.title}</Text>
          <Text>{projectInfo.clientName}</Text>
        </View>
      </Page>
    ));
  };

  // --- Calculate Section Totals ---
  const calculateSectionTotal = (items: BOQItem[]): number => {
    return items.reduce((total, item) => {
      if (item.isHeader) return total; // Skip headers
      return total + (item.amount || 0);
    }, 0);
  };

  // --- Calculate Grand Total ---
  const calculateGrandTotal = (): number => {
    return nonEmptySections.reduce((total, section) => {
      return total + calculateSectionTotal(section.items);
    }, 0);
  };

  // --- Calculate Preliminaries Total ---
  const calculatePreliminariesTotal = (): number => {
    if (!Array.isArray(preliminariesData)) return 0;

    return preliminariesData.reduce((total, prelim) => {
      return (
        total +
        prelim.items.reduce((subTotal, item) => {
          if (item.isHeader) return subTotal; // skip headers
          return subTotal + (item.amount || 0);
        }, 0)
      );
    }, 0);
  };

  const grandTotal = useMemo(() => calculateGrandTotal(), [nonEmptySections]);
  const preliminariesTotal = useMemo(
    () => calculatePreliminariesTotal(),
    [preliminariesData]
  );

  // --- Chunk arrays for page breaks ---
  const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };
  const renderMaterialSchedule = (schedule: MaterialSchedule) => {
    return Object.entries(schedule).map(([category, materials]) => {
      const categoryItems = materials as CategorizedMaterial[];
      if (categoryItems.length === 0) return null;

      return (
        <Page key={category} style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {category.toUpperCase()} MATERIALS
            </Text>

            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.tableColHeader}>ITEM</Text>
                <Text style={styles.tableColHeader}>DESCRIPTION</Text>
                <Text style={styles.tableColHeader}>UNIT</Text>
                <Text style={styles.tableColHeader}>QTY</Text>
                <Text style={styles.tableColHeader}>RATE</Text>
                <Text style={styles.tableColHeader}>AMOUNT</Text>
              </View>

              {materials.map((material, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCol}>{material.itemNo}</Text>
                  <Text style={styles.tableCol}>{material.description}</Text>
                  <Text style={styles.tableCol}>{material.unit}</Text>
                  <Text style={styles.tableCol}>{material.quantity}</Text>
                  <Text style={styles.tableCol}>
                    {formatCurrency(material.rate)}
                  </Text>
                  <Text style={styles.tableCol}>
                    {formatCurrency(material.amount)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionTotalRow}>
              <Text style={styles.sectionTotalLabel}>
                TOTAL {category.toUpperCase()}:
              </Text>
              <Text style={styles.sectionTotalValue}>
                {formatCurrency(
                  materials.reduce((sum, m) => sum + m.amount, 0)
                )}
              </Text>
            </View>
          </View>
        </Page>
      );
    });
  };
  // --- Company Header Component ---
  const CompanyHeader = () => (
    <View style={styles.companyHeader}>
      {projectInfo.logoUrl ? (
        <Image style={styles.logoContainer} source={projectInfo.logoUrl} />
      ) : projectInfo.companyName ? (
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            {projectInfo.companyName
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </Text>
        </View>
      ) : null}

      {(projectInfo.companyName || projectInfo.companyTagline) && (
        <View style={styles.companyInfo}>
          {projectInfo.companyName && (
            <Text style={styles.companyName}>{projectInfo.companyName}</Text>
          )}
          {projectInfo.companyTagline && (
            <Text style={styles.companyTagline}>
              {projectInfo.companyTagline}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <Document>
      {/* --- Title Page --- */}
      <Page size="A4" style={styles.prelimPage}>
        <CompanyHeader />

        <View style={styles.header}>
          <Text style={styles.title}>BILL OF QUANTITIES</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.title}>{projectInfo.title || "PROJECT"}</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.subtitle}>
            {projectInfo.clientName || "CLIENT"}
          </Text>
          <Text style={styles.subtitle}>
            ({projectInfo.location || "LOCATION"})
          </Text>
        </View>

        <View style={styles.projectInfoContainer}>
          <Text style={styles.prelimSubtitle}>PROJECT INFORMATION:</Text>
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Client:</Text>
            <Text style={styles.projectInfoValue}>
              {projectInfo.clientName || "Not provided"}
            </Text>
          </View>
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Location:</Text>
            <Text style={styles.projectInfoValue}>
              {projectInfo.location || "Not provided"}
            </Text>
          </View>
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Project Type:</Text>
            <Text style={styles.projectInfoValue}>
              {projectInfo.projectType || "Not provided"}
            </Text>
          </View>
          {projectInfo.consultant && (
            <View style={styles.projectInfoRow}>
              <Text style={styles.projectInfoLabel}>Consultant:</Text>
              <Text style={styles.projectInfoValue}>
                {projectInfo.consultant}
              </Text>
            </View>
          )}
          {projectInfo.contractor && (
            <View style={styles.projectInfoRow}>
              <Text style={styles.projectInfoLabel}>Contractor:</Text>
              <Text style={styles.projectInfoValue}>
                {projectInfo.contractor}
              </Text>
            </View>
          )}
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Date:</Text>
            <Text style={styles.projectInfoValue}>
              {projectInfo.date || "Not provided"}
            </Text>
          </View>
        </View>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* --- Preliminaries Page --- */}
      {preliminariesData.length > 0 && (
        <Page size="A4" style={styles.prelimPage}>
          <CompanyHeader />
          {preliminariesData.map((items, index) => (
            <Text style={styles.prelimTitle}>{items.title}</Text>
          ))}

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableColHeader, { width: "10%" }]}>
                ITEM
              </Text>
              <Text
                style={[styles.tableColHeaderDescription, { width: "70%" }]}
              >
                DESCRIPTION
              </Text>
              <Text style={[styles.tableColHeader, { width: "20%" }]}>
                AMOUNT (KSh)
              </Text>
            </View>

            {preliminariesData.map((prelim, index) =>
              prelim.items.map((item, subIndex) => {
                if (item.isHeader) {
                  // Header row - show empty item number but keep the row
                  return (
                    <View
                      style={[styles.tableRow, { backgroundColor: "#F3F4F6" }]}
                      key={`prelim-header-${index}-${subIndex}`}
                    >
                      <Text style={[styles.tableCol, { width: "10%" }]}>
                        {/* Empty for headers */}
                      </Text>
                      <Text
                        style={[
                          styles.tableColDescription,
                          { width: "70%", fontWeight: "bold" },
                        ]}
                      >
                        {item.description}
                      </Text>
                      <Text style={[styles.tableColAmount, { width: "20%" }]}>
                        {/* Empty for headers */}
                      </Text>
                    </View>
                  );
                }

                // Regular item
                return (
                  <View
                    style={styles.tableRow}
                    key={`prelim-${index}-${subIndex}`}
                  >
                    <Text style={[styles.tableCol, { width: "10%" }]}>
                      {item.itemNo}
                    </Text>
                    <Text
                      style={[styles.tableColDescription, { width: "70%" }]}
                    >
                      {item.description}
                    </Text>
                    <Text style={[styles.tableColAmount, { width: "20%" }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                );
              })
            )}

            <View style={[styles.tableRow, { backgroundColor: "#F3F4F6" }]}>
              <Text
                style={[
                  styles.tableColDescription,
                  { width: "80%", fontWeight: "bold" },
                ]}
              >
                TOTAL FOR PRELIMINARIES:
              </Text>
              <Text
                style={[
                  styles.tableColAmount,
                  { width: "20%", fontWeight: "bold" },
                ]}
              >
                {formatCurrency(preliminariesTotal)}
              </Text>
            </View>
          </View>

          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
            fixed
          />
        </Page>
      )}

      {/* --- BOQ Sections --- */}
      {nonEmptySections.map((section, sectionIndex) => {
        const displayItems = section.items;
        const sectionTotal = calculateSectionTotal(section.items);
        const itemChunks = chunkArray(displayItems, 20); // 20 items per page

        return itemChunks.map((chunk, chunkIndex) => (
          <Page
            size="A4"
            style={styles.page}
            key={`section-${sectionIndex}-chunk-${chunkIndex}`}
          >
            <CompanyHeader />

            {/* Section header only on first chunk */}
            {chunkIndex === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            )}

            <View style={styles.table}>
              {/* Table headers only on first chunk */}
              {chunkIndex === 0 && (
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableColHeader, { width: "12%" }]}>
                    ITEM
                  </Text>
                  <Text
                    style={[styles.tableColHeaderDescription, { width: "48%" }]}
                  >
                    DESCRIPTION
                  </Text>
                  <Text style={[styles.tableColHeader, { width: "8%" }]}>
                    UNIT
                  </Text>
                  <Text style={[styles.tableColHeader, { width: "10%" }]}>
                    QTY
                  </Text>
                  <Text style={[styles.tableColHeader, { width: "11%" }]}>
                    RATE (KSh)
                  </Text>
                  <Text style={[styles.tableColHeader, { width: "11%" }]}>
                    AMOUNT (KSh)
                  </Text>
                </View>
              )}

              {chunk.map((item, itemIndex) => {
                if (item.isHeader) {
                  // Header row - show empty item number but keep the row
                  return (
                    <View
                      style={[styles.tableRow, { backgroundColor: "#F3F4F6" }]}
                      key={`header-${sectionIndex}-${chunkIndex}-${itemIndex}`}
                    >
                      <Text style={[styles.tableCol, { width: "12%" }]}>
                        {/* Empty for headers */}
                      </Text>
                      <Text
                        style={[
                          styles.tableColDescription,
                          { width: "48%", fontWeight: "bold" },
                        ]}
                      >
                        {item.description}
                      </Text>
                      <Text style={[styles.tableCol, { width: "8%" }]}>
                        {/* Empty for headers */}
                      </Text>
                      <Text style={[styles.tableCol, { width: "10%" }]}>
                        {/* Empty for headers */}
                      </Text>
                      <Text style={[styles.tableCol, { width: "11%" }]}>
                        {/* Empty for headers */}
                      </Text>
                      <Text style={[styles.tableColAmount, { width: "11%" }]}>
                        {/* Empty for headers */}
                      </Text>
                    </View>
                  );
                }

                // Regular item row
                return (
                  <View
                    style={styles.tableRow}
                    key={`item-${sectionIndex}-${chunkIndex}-${itemIndex}`}
                  >
                    <Text style={[styles.tableCol, { width: "12%" }]}>
                      {item.itemNo}
                    </Text>
                    <Text
                      style={[styles.tableColDescription, { width: "48%" }]}
                    >
                      {item.description}
                    </Text>
                    <Text style={[styles.tableCol, { width: "8%" }]}>
                      {item.unit}
                    </Text>
                    <Text style={[styles.tableCol, { width: "10%" }]}>
                      {formatQuantity(item.quantity)}
                    </Text>
                    <Text style={[styles.tableCol, { width: "11%" }]}>
                      {formatCurrency(item.rate)}
                    </Text>
                    <Text style={[styles.tableColAmount, { width: "11%" }]}>
                      {formatCurrency(item.amount)}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Section total on last chunk */}
            {chunkIndex === itemChunks.length - 1 && (
              <View style={styles.sectionTotalRow}>
                <Text style={styles.sectionTotalLabel}>
                  TOTAL FOR{" "}
                  {section.title.toUpperCase().replace("ELEMENT ", "")}:
                </Text>
                <Text style={styles.sectionTotalValue}>
                  {formatCurrency(sectionTotal)}
                </Text>
              </View>
            )}

            <View style={styles.boqFooter} fixed>
              <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
              <Text>{projectInfo.title}</Text>
              <Text>{projectInfo.clientName}</Text>
            </View>
          </Page>
        ));
      })}

      {consolidatedMaterials.length > 0 &&
        renderConsolidatedMaterials(consolidatedMaterials)}

      {/* --- Summary Page --- */}
      <Page size="A4" style={styles.page}>
        <CompanyHeader />

        <View style={styles.header}>
          <Text style={styles.title}>SUMMARY OF QUANTITIES AND COSTS</Text>
        </View>

        {preliminariesData.length > 0 && (
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>
              PRELIMINARIES TOTAL (KES):
            </Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(preliminariesTotal)}
            </Text>
          </View>
        )}

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>MAIN WORKS TOTAL (KES):</Text>
          <Text style={styles.grandTotalValue}>
            {formatCurrency(grandTotal)}
          </Text>
        </View>

        <View
          style={[
            styles.grandTotalRow,
            {
              borderTop: "2pt solid #3B82F6",
              borderBottom: "2pt solid #3B82F6",
            },
          ]}
        >
          <Text style={styles.grandTotalLabel}>GRAND TOTAL (KES):</Text>
          <Text style={styles.grandTotalValue}>
            {formatCurrency(grandTotal + preliminariesTotal)}
          </Text>
        </View>

        <View style={styles.boqFooter} fixed>
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
          <Text>{projectInfo.title}</Text>
          <Text>{projectInfo.clientName}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFGenerator;
