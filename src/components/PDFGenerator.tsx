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

// --- Register Outfit Font ---
Font.register({
  family: "Outfit",
  fonts: [
    {
      src: "/fonts/Outfit-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/fonts/Outfit-Bold.ttf",
      fontWeight: "bold",
    },
    {
      src: "/fonts/Outfit-Light.ttf",
      fontWeight: "light", // light
    },
    {
      src: "/fonts/Outfit-Medium.ttf",
      fontWeight: "medium", // medium
    },
    {
      src: "/fonts/Outfit-SemiBold.ttf",
      fontWeight: "semibold", // semi-bold
    },
  ],
});

// --- Styles ---
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Outfit",
    lineHeight: 1.4,
    backgroundColor: "#FFFFFF",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
    color: "#4B5563",
    fontWeight: 500,
  },
  projectInfoContainer: {
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  projectInfoRow: {
    flexDirection: "row",
    marginBottom: 6,
    fontSize: 14,
  },
  projectInfoLabel: {
    width: 110,
    fontWeight: "bold",
    color: "#374151",
  },
  projectInfoValue: {
    flex: 1,
    color: "#6B7280",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
    borderRadius: 6,
  },
  table: {
    width: "100%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
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
    minHeight: 20,
  },
  tableColHeader: {
    padding: 8,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 13,
    color: "#FFFFFF",
  },
  tableColHeaderDescription: {
    padding: 8,
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
    fontSize: 13,
    color: "#FFFFFF",
  },
  tableCol: {
    padding: 8,
    textAlign: "center",
    fontSize: 12,
    color: "#4B5563",
  },
  tableColDescription: {
    padding: 8,
    textAlign: "left",
    flex: 1,
    fontSize: 12,
    color: "#4B5563",
  },
  tableColAmount: {
    padding: 8,
    textAlign: "right",
    fontSize: 12,
    color: "#4B5563",
  },
  sectionTotalRow: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 10,
    fontWeight: "bold",
    fontSize: 13,
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 6,
  },
  sectionTotalLabel: {
    width: "80%",
    textAlign: "right",
    paddingRight: 10,
    color: "#374151",
  },
  sectionTotalValue: {
    width: "20%",
    textAlign: "right",
    color: "#1F2937",
  },
  grandTotalRow: {
    flexDirection: "row",
    marginTop: 20,
    borderTop: "2pt solid #3B82F6",
    paddingTop: 12,
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
  },
  grandTotalLabel: {
    width: "80%",
    textAlign: "right",
    paddingRight: 10,
    color: "#1E40AF",
  },
  grandTotalValue: {
    width: "20%",
    textAlign: "right",
    color: "#1E40AF",
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12,
    color: "#6B7280",
  },
  // --- Preliminary Pages Styles ---
  prelimPage: {
    padding: 35,
    fontSize: 13,
    fontFamily: "Outfit",
    lineHeight: 1.5,
    backgroundColor: "#FFFFFF",
  },
  prelimTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1F2937",
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#3B82F6",
    borderBottomStyle: "solid",
  },
  prelimSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 12,
    marginTop: 15,
    color: "#374151",
    paddingLeft: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
    borderLeftStyle: "solid",
  },
  prelimContent: {
    marginBottom: 12,
    textAlign: "justify",
    color: "#4B5563",
  },
  prelimList: {
    marginBottom: 12,
  },
  prelimListItem: {
    marginBottom: 6,
    paddingLeft: 10,
    color: "#4B5563",
  },
  materialScheduleSection: {
    marginTop: 25,
  },
  materialScheduleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#3B82F6",
    color: "#FFFFFF",
    borderRadius: 6,
    textAlign: "center",
  },
  materialScheduleTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 15,
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
    minHeight: 20,
  },
  materialScheduleColHeader: {
    padding: 10,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 13,
    color: "#FFFFFF",
    flex: 1,
  },
  materialScheduleCol: {
    padding: 10,
    textAlign: "center",
    fontSize: 12,
    color: "#4B5563",
    flex: 1,
  },
  materialScheduleColLast: {
    padding: 10,
    textAlign: "center",
    fontSize: 12,
    color: "#4B5563",
    flex: 1,
  },
  // --- Footer for BOQ pages ---
  boqFooter: {
    position: "absolute",
    bottom: 25,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 11,
    color: "#6B7280",
    paddingTop: 10,
    borderTop: "1pt solid #E5E7EB",
  },
  // --- Text Formatting Styles ---
  boldText: {
    fontWeight: "bold",
  },
  underlineText: {
    textDecoration: "underline",
  },
  // --- Preliminaries Table Styles ---
  prelimTable: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
    marginTop: 15,
  },
  prelimTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
    minHeight: 22,
  },
  prelimTableHeader: {
    backgroundColor: "#1E40AF",
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  prelimTableCell: {
    padding: 8,
    fontSize: 12,
  },
  prelimTableDescription: {
    flex: 3,
    textAlign: "left",
  },
  prelimTableUnit: {
    width: "15%",
    textAlign: "center",
  },
  prelimTableQty: {
    width: "10%",
    textAlign: "center",
  },
  prelimTableRate: {
    width: "15%",
    textAlign: "right",
  },
  prelimTableAmount: {
    width: "15%",
    textAlign: "right",
  },
  // --- Logo and Company Info Styles ---
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderBottomStyle: "solid",
  },
  logoContainer: {
    width: 70,
    height: 70,
    marginRight: 15,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 12,
    color: "#6B7280",
  },
});

// --- Helper Functions ---
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
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
  date: string;
  consultant?: string;
  contractor?: string;
  drawingReference?: string;
  boqReference?: string;
}

// --- Type for Material Schedule Item ---
interface MaterialScheduleItem {
  description: string;
  unit: string;
  quantity: number;
}

// --- Type for Preliminaries Item ---
interface PreliminariesItem {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  isHeader?: boolean;
}

// --- Main Component ---
interface PDFGeneratorProps {
  boqData: BOQSection[];
  projectInfo: ProjectInfo;
  preliminariesData?: PreliminariesItem[];
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  boqData,
  projectInfo,
  preliminariesData,
}) => {
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

  // --- Calculate Preliminaries Total ---
  const calculatePreliminariesTotal = (): number => {
    console.log(preliminariesData);
    return preliminariesData.reduce((total, item) => {
      if (item.isHeader) return total;
      return total + (item.amount || 0);
    }, 0);
  };

  // --- Generate Material Schedule ---
  const generateMaterialSchedule = (): MaterialScheduleItem[] => {
    const materialMap: Record<string, { unit: string; quantity: number }> = {};

    if (Array.isArray(boqData)) {
      boqData.forEach((section) => {
        if (Array.isArray(section.items)) {
          section.items.forEach((item) => {
            if (item.isHeader) return;

            const descLower = (item.description || "").toLowerCase();
            let materialKey = "";
            let unit = item.unit || "";

            if (descLower.includes("cement")) {
              materialKey = "Cement";
              unit = "bags";
            } else if (descLower.includes("sand")) {
              materialKey = "Sand";
              unit = "m³";
            } else if (
              descLower.includes("ballast") ||
              descLower.includes("stone")
            ) {
              materialKey = "Ballast";
              unit = "m³";
            } else if (descLower.includes("block")) {
              materialKey = "Blocks";
              unit = "No.";
            } else if (descLower.includes("brick")) {
              materialKey = "Bricks";
              unit = "No.";
            } else if (
              descLower.includes("steel") ||
              descLower.includes("reinforcement") ||
              descLower.includes("rebar") ||
              descLower.includes("ribbed bar")
            ) {
              materialKey = "Reinforcement Steel";
              unit = "Kg";
            } else if (descLower.includes("concrete")) {
              materialKey = "Concrete";
              unit = "m³";
            } else if (descLower.includes("window")) {
              materialKey = "Windows";
              unit = "No.";
            } else if (descLower.includes("door")) {
              materialKey = "Doors";
              unit = "No.";
            }

            if (materialKey) {
              if (!materialMap[materialKey]) {
                materialMap[materialKey] = { unit, quantity: 0 };
              }
              const itemQuantity =
                typeof item.quantity === "number" ? item.quantity : 0;
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
      .sort((a, b) => a.description.localeCompare(b.description));
  };

  const materialScheduleData = useMemo(
    () => generateMaterialSchedule(),
    [boqData]
  );
  const grandTotal = useMemo(() => calculateGrandTotal(), [boqData]);
  const preliminariesTotal = useMemo(
    () => calculatePreliminariesTotal(),
    [preliminariesData]
  );

  return (
    <Document>
      {/* --- Title Page --- */}
      <Page size="A4" style={styles.prelimPage}>
        <View style={styles.companyHeader}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Construction Solutions Ltd</Text>
            <Text style={styles.companyTagline}>
              Quality Construction Services
            </Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>BILL OF QUANTITIES</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.title}>
            {projectInfo.title || "Not Provided"}
          </Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.subtitle}>
            {projectInfo.clientName || "Not provided"}
          </Text>
          <Text style={styles.subtitle}>
            ({projectInfo.location || "Location not provided"})
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

        <View style={{ marginTop: 20 }}>
          <Text style={styles.prelimContent}>
            This document presents the Bill of Quantities (BOQ) for the{" "}
            {projectInfo.projectType || "project"} located at{" "}
            {projectInfo.location || "the specified location"}. The quantities
            have been measured and described according to standard practices.
          </Text>
          <Text style={styles.prelimContent}>
            The rates and prices included are based on current market conditions
            and the specifications provided. The Contractor is responsible for
            verifying all quantities and dimensions on site.
          </Text>
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
      <Page size="A4" style={styles.prelimPage}>
        <View style={styles.companyHeader}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Construction Solutions Ltd</Text>
            <Text style={styles.companyTagline}>
              Quality Construction Services
            </Text>
          </View>
        </View>

        <Text style={styles.prelimTitle}>PRELIMINARIES</Text>

        <Text style={styles.prelimSubtitle}>INTRODUCTION</Text>
        <Text style={styles.prelimContent}>
          This Bill of Quantities has been prepared in accordance with the
          Standard Method of Measurement for Building Works. The Contractor
          shall allow for all necessary items to complete the works as described
          in the drawings and specifications.
        </Text>

        <Text style={styles.prelimSubtitle}>SCOPE OF WORKS</Text>
        <Text style={styles.prelimContent}>
          The works comprise the construction of a{" "}
          {projectInfo.houseType || "residential building"} with{" "}
          {projectInfo.floors || "G+1"} floors located at{" "}
          {projectInfo.location || "the specified site"}. The works include but
          are not limited to:
        </Text>

        <View style={styles.prelimList}>
          <Text style={styles.prelimListItem}>
            • All substructure works including excavation and foundations
          </Text>
          <Text style={styles.prelimListItem}>
            • Superstructure works including walls, floors, and roof
          </Text>
          <Text style={styles.prelimListItem}>
            • Finishes including plastering, painting, and flooring
          </Text>
          <Text style={styles.prelimListItem}>
            • Mechanical and electrical installations
          </Text>
          <Text style={styles.prelimListItem}>
            • External works including drainage and landscaping
          </Text>
        </View>

        <Text style={styles.prelimSubtitle}>CONTRACT INFORMATION</Text>
        <Text style={styles.prelimContent}>
          The Contractor shall provide all labor, materials, plant, and
          equipment necessary to complete the works in accordance with the
          contract documents. The Contractor shall allow for all statutory
          requirements, insurances, and permits necessary for the execution of
          the works.
        </Text>

        <Text style={styles.prelimSubtitle}>MEASUREMENT AND PAYMENT</Text>
        <Text style={styles.prelimContent}>
          The works will be measured in accordance with the Standard Method of
          Measurement. Payment will be made for measured works completed to the
          satisfaction of the Consultant. The Contractor shall submit monthly
          payment applications supported by necessary documentation.
        </Text>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* --- Preliminaries Bill Page --- */}
      <Page size="A4" style={styles.prelimPage}>
        <View style={styles.companyHeader}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Construction Solutions Ltd</Text>
            <Text style={styles.companyTagline}>
              Quality Construction Services
            </Text>
          </View>
        </View>

        <Text style={styles.prelimTitle}>PRELIMINARIES</Text>
        <Text style={styles.prelimSubtitle}>BILL No. 1</Text>

        {preliminariesData.length > 0 ? (
          <View style={styles.prelimTable}>
            <View style={[styles.prelimTableRow, styles.prelimTableHeader]}>
              <Text style={[styles.prelimTableCell, { width: "10%" }]}>
                ITEM
              </Text>
              <Text
                style={[styles.prelimTableCell, styles.prelimTableDescription]}
              >
                DESCRIPTION
              </Text>
              <Text style={[styles.prelimTableCell, styles.prelimTableAmount]}>
                AMOUNT (KSh)
              </Text>
            </View>

            {preliminariesData?.map((item, index) => (
              <View style={styles.prelimTableRow} key={`prelim-${index}`}>
                <Text style={[styles.prelimTableCell, { width: "10%" }]}>
                  {item.itemNo}
                </Text>
                <Text
                  style={[
                    styles.prelimTableCell,
                    styles.prelimTableDescription,
                  ]}
                >
                  {item.description}
                </Text>
                <Text
                  style={[styles.prelimTableCell, styles.prelimTableAmount]}
                >
                  {formatCurrency(item?.amount)}
                </Text>
              </View>
            ))}

            <View
              style={[styles.prelimTableRow, { backgroundColor: "#F3F4F6" }]}
            >
              <Text
                style={[
                  styles.prelimTableCell,
                  styles.prelimTableDescription,
                  { flex: 4, fontWeight: "bold" },
                ]}
              >
                TOTAL FOR PRELIMINARIES:
              </Text>
              <Text
                style={[
                  styles.prelimTableCell,
                  styles.prelimTableAmount,
                  { fontWeight: "bold" },
                ]}
              >
                {formatCurrency(preliminariesTotal)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.prelimTable}>
            <View style={[styles.prelimTableRow, styles.prelimTableHeader]}>
              <Text style={[styles.prelimTableCell, { width: "10%" }]}>
                ITEM
              </Text>
              <Text
                style={[styles.prelimTableCell, styles.prelimTableDescription]}
              >
                DESCRIPTION
              </Text>
              <Text style={[styles.prelimTableCell, styles.prelimTableUnit]}>
                UNIT
              </Text>
              <Text style={[styles.prelimTableCell, styles.prelimTableQty]}>
                QTY
              </Text>
              <Text style={[styles.prelimTableCell, styles.prelimTableRate]}>
                RATE (KSh)
              </Text>
              <Text style={[styles.prelimTableCell, styles.prelimTableAmount]}>
                AMOUNT (KSh)
              </Text>
            </View>
            <View style={styles.prelimTableRow}>
              <Text
                style={[
                  styles.prelimTableCell,
                  { textAlign: "center", flex: 6 },
                ]}
              >
                No preliminaries data available
              </Text>
            </View>
          </View>
        )}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* --- BOQ Pages --- */}
      {boqData.map((section, sectionIndex) => {
        const displayItems = section.items.filter((item) => !item.isHeader);
        const sectionTotal = calculateSectionTotal(section.items);

        return (
          <Page
            size="A4"
            style={styles.page}
            key={`section-${sectionIndex}`}
            wrap
          >
            <View style={styles.companyHeader}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>LOGO</Text>
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>
                  Construction Solutions Ltd
                </Text>
                <Text style={styles.companyTagline}>
                  Quality Construction Services
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.table}>
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
                {displayItems.length > 0 ? (
                  displayItems.map((item, itemIndex) => (
                    <View
                      style={styles.tableRow}
                      key={`item-${sectionIndex}-${itemIndex}`}
                    >
                      <Text style={[styles.tableCol, { width: "12%" }]}>
                        {item.itemNo}
                      </Text>
                      <Text
                        style={[styles.tableColDescription, { width: "58%" }]}
                      >
                        {item.description}
                      </Text>
                      <Text style={[styles.tableCol, { width: "8%" }]}>
                        {item.unit}
                      </Text>
                      <Text style={[styles.tableCol, { width: "10%" }]}>
                        {item.quantity % 1 === 0
                          ? item.quantity.toFixed(0)
                          : item.quantity.toFixed(2)}
                      </Text>
                      <Text style={[styles.tableCol, { width: "11%" }]}>
                        {item.rate > 0 ? formatCurrency(item.rate) : ""}
                      </Text>
                      <Text style={[styles.tableColAmount, { width: "11%" }]}>
                        {formatCurrency(item.amount)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.tableRow}>
                    <Text
                      style={[
                        styles.tableCol,
                        { width: "100%", textAlign: "center" },
                      ]}
                    >
                      No items in this section.
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.sectionTotalRow}>
                <Text style={styles.sectionTotalLabel}>
                  TOTAL FOR{" "}
                  {section.title.toUpperCase().replace("ELEMENT ", "")}:
                </Text>
                <Text style={styles.sectionTotalValue}>
                  {formatCurrency(sectionTotal)}
                </Text>
              </View>
            </View>

            <View style={styles.boqFooter} fixed>
              <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
              <Text>{projectInfo.title}</Text>
              <Text>{projectInfo.clientName}</Text>
            </View>
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
              fixed
            />
          </Page>
        );
      })}

      {/* --- Material Schedule Page --- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.companyHeader}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Construction Solutions Ltd</Text>
            <Text style={styles.companyTagline}>
              Quality Construction Services
            </Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>BILL OF QUANTITIES</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.title}>
            {projectInfo.title || "Not Provided"}
          </Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.subtitle}>
            {projectInfo.clientName || "Not provided"}
          </Text>
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
                <View
                  style={styles.materialScheduleRow}
                  key={`material-${index}`}
                >
                  <Text style={styles.materialScheduleCol}>
                    {material.description}
                  </Text>
                  <Text style={styles.materialScheduleCol}>
                    {material.unit}
                  </Text>
                  <Text style={styles.materialScheduleColLast}>
                    {material.quantity % 1 === 0
                      ? material.quantity.toFixed(0)
                      : material.quantity.toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.materialScheduleRow}>
                <Text
                  style={[
                    styles.materialScheduleCol,
                    { flex: 3, textAlign: "center" },
                  ]}
                >
                  No materials found.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.boqFooter} fixed>
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
          <Text>{projectInfo.title}</Text>
          <Text>{projectInfo.clientName}</Text>
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>

      {/* --- Summary Page (Grand Total) --- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.companyHeader}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Construction Solutions Ltd</Text>
            <Text style={styles.companyTagline}>
              Quality Construction Services
            </Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>BILL OF QUANTITIES</Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.title}>
            {projectInfo.title || "Not Provided"}
          </Text>
          <Text style={styles.subtitle}>FOR</Text>
          <Text style={styles.subtitle}>
            {projectInfo.clientName || "Not provided"}
          </Text>
        </View>

        <View style={{ marginTop: 30 }}>
          <Text style={styles.prelimTitle}>
            SUMMARY OF QUANTITIES AND COSTS
          </Text>
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

        <View style={{ marginTop: 30 }}>
          <Text style={styles.prelimContent}>
            This Bill of Quantities has been prepared based on the information
            provided and the measurements taken. The quantities are subject to
            verification on site.
          </Text>
          <Text style={styles.prelimContent}>
            The rates and prices included herein are based on current market
            conditions and are valid for the period specified in the contract
            documents.
          </Text>
        </View>

        <View style={styles.boqFooter} fixed>
          <Text render={({ pageNumber }) => `Page ${pageNumber}`} />
          <Text>{projectInfo.title}</Text>
          <Text>{projectInfo.clientName}</Text>
        </View>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default PDFGenerator;
