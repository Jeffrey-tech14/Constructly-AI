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
    padding: 20,
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
  // Updated Material Schedule Column Styles for new structure
  materialScheduleColHeader: {
    padding: 8, // Adjust padding if needed
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12, // Adjust font size if needed
    color: "#FFFFFF",
  },
  materialScheduleColHeaderItem: {
    width: "8%", // Adjust width as needed
    padding: 8,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
    color: "#FFFFFF",
  },
  materialScheduleColHeaderDescription: {
    width: "52%", // Adjust width as needed
    padding: 8,
    fontWeight: "bold",
    textAlign: "left", // Description usually left-aligned
    fontSize: 12,
    color: "#FFFFFF",
  },
  materialScheduleColHeaderUnit: {
    width: "8%",
    padding: 8,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
    color: "#FFFFFF",
  },
  materialScheduleColHeaderQty: {
    width: "10%",
    padding: 8,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
    color: "#FFFFFF",
  },
  materialScheduleColHeaderRate: {
    width: "11%",
    padding: 8,
    fontWeight: "bold",
    textAlign: "right", // Rate usually right-aligned
    fontSize: 12,
    color: "#FFFFFF",
  },
  materialScheduleColHeaderAmount: {
    width: "11%", // Adjust width as needed
    padding: 8,
    fontWeight: "bold",
    textAlign: "right", // Amount usually right-aligned
    fontSize: 12,
    color: "#FFFFFF",
  },
  // Material Schedule Cell Styles
  materialScheduleCol: {
    padding: 8,
    textAlign: "center",
    fontSize: 11, // Adjust font size if needed
    color: "#4B5563",
  },
  materialScheduleColItem: {
    width: "8%",
    padding: 8,
    textAlign: "center",
    fontSize: 11,
    color: "#4B5563",
  },
  materialScheduleColDescription: {
    width: "52%",
    padding: 8,
    textAlign: "left",
    fontSize: 11,
    color: "#4B5563",
  },
  materialScheduleColUnit: {
    width: "8%",
    padding: 8,
    textAlign: "center",
    fontSize: 11,
    color: "#4B5563",
  },
  materialScheduleColQty: {
    width: "10%",
    padding: 8,
    textAlign: "center",
    fontSize: 11,
    color: "#4B5563",
  },
  materialScheduleColRate: {
    width: "11%",
    padding: 8,
    textAlign: "right",
    fontSize: 11,
    color: "#4B5563",
  },
  materialScheduleColAmount: {
    width: "11%",
    padding: 8,
    textAlign: "right",
    fontSize: 11,
    color: "#4B5563",
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

// --- Type for Project Info (Updated) ---
interface ProjectInfo {
  title: string;
  clientName: string;
  clientEmail?: string; // Optional
  location: string;
  projectType: string;
  houseType?: string; // Optional
  region?: string; // Optional
  floors?: number; // Optional
  date: string;
  consultant?: string;
  contractor?: string; // Added contractor
  drawingReference?: string;
  boqReference?: string;
  logoUrl?: string; // Added logo URL
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
  preliminariesData = [], // Default to empty array
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
  // --- Calculate Preliminaries Total ---
  const calculatePreliminariesTotal = (): number => {
    // console.log(preliminariesData); // Optional debug log
    if (!Array.isArray(preliminariesData)) return 0; // Safety check
    return preliminariesData.reduce((total, item) => {
      if (item?.isHeader) return total;
      return total + (item?.amount || 0);
    }, 0);
  };

  interface MaterialScheduleDisplayItem {
    itemNo: string; // e.g., "A", "B", "C" or "1", "2" if needed
    description: string;
    unit: string;
    quantity: number;
    rate: number; // You might need to derive or use a default/prompt user
    amount: number; // quantity * rate (or use item.amount if available)
  }
  // --- Generate Material Schedule ---
  // --- Generate Material Schedule (Updated Logic) ---
  const generateMaterialScheduleForDisplay =
    (): MaterialScheduleDisplayItem[] => {
      // This map will hold categorized materials with aggregated quantities
      // Key: Display Description, Value: Aggregated data
      const materialMap: Record<
        string,
        { unit: string; quantity: number; items: BOQItem[] }
      > = {};

      // Helper to determine if an item represents a material that should be scheduled
      const isMaterialItem = (item: BOQItem): boolean => {
        const descLower = (item.description || "").toLowerCase();
        // Define keywords for materials to be included
        const materialKeywords = [
          "cement",
          "sand",
          "ballast",
          "stone",
          "block",
          "brick",
          "steel",
          "reinforcement",
          "rebar",
          "ribbed bar",
          "concrete",
          "window",
          "door",
          "tiles",
          "paint",
          "bitumen",
          "hardcore",
          "dpm",
          "polythene",
          "wire",
          "formwork",
          "ply",
        ];
        return materialKeywords.some((keyword) => descLower.includes(keyword));
      };

      // Helper to get a standardized display name for the material category
      const getMaterialCategory = (item: BOQItem): string => {
        const descLower = (item.description || "").toLowerCase();
        if (descLower.includes("cement")) return "Cement";
        if (descLower.includes("sand")) return "Sand";
        if (descLower.includes("ballast") || descLower.includes("stone"))
          return "Ballast";
        if (descLower.includes("block")) return "Blocks";
        if (descLower.includes("brick")) return "Bricks";
        if (
          descLower.includes("steel") ||
          descLower.includes("reinforcement") ||
          descLower.includes("rebar") ||
          descLower.includes("ribbed bar")
        )
          return "Reinforcement Steel";
        if (descLower.includes("concrete")) return "Concrete";
        if (descLower.includes("window")) return "Windows";
        if (descLower.includes("door")) return "Doors";
        if (descLower.includes("door frame")) return "Door Frames";
        if (descLower.includes("window frame")) return "Window Frames";
        if (descLower.includes("tiles")) return "Tiles";
        if (descLower.includes("paint")) return "Paint";
        if (descLower.includes("bitumen")) return "Bitumen";
        if (descLower.includes("hardcore")) return "Hardcore";
        if (descLower.includes("dpm") || descLower.includes("polythene"))
          return "Damp Proof Membrane";
        if (descLower.includes("wire")) return "Wire";
        if (descLower.includes("formwork") || descLower.includes("ply"))
          return "Formwork";
        // Default case if no specific keyword matched but isMaterialItem was true
        // Try to extract a generic name or use description
        const match = descLower.match(
          /(\w+\s*\w*)\s*(?:bags?|tonnes?|m3|m2|kg|no\.?|litres?|rolls?)/i
        );
        return match
          ? match[1].trim().replace(/\b\w/g, (l) => l.toUpperCase())
          : item.description || "Other Material";
      };

      // Helper to get a standard unit for the material category
      const getStandardUnit = (category: string): string => {
        switch (category) {
          case "Cement":
            return "Bags";
          case "Sand":
            return "m³";
          case "Ballast":
            return "m³";
          case "Blocks":
            return "No.";
          case "Bricks":
            return "No.";
          case "Reinforcement Steel":
            return "Kg";
          case "Concrete":
            return "m³";
          case "Windows":
            return "No.";
          case "Window Frames":
            return "No.";
          case "Doors":
            return "No.";
          case "Door Frames":
            return "No.";
          case "Tiles":
            return "m²"; // Or m2 depending on context
          case "Paint":
            return "Litres";
          case "Bitumen":
            return "Litres";
          case "Hardcore":
            return "Tonnes";
          case "Damp Proof Membrane":
            return "m²"; // Or Rolls, depending on item
          case "Wire":
            return "Kg"; // Or m, depending on item
          case "Formwork":
            return "m²"; // Or Pcs, depending on item
          default:
            return "Unit"; // Generic fallback
        }
      };

      if (Array.isArray(boqData)) {
        boqData.forEach((section) => {
          if (Array.isArray(section.items)) {
            section.items.forEach((item) => {
              // Skip headers and non-material items
              if (item.isHeader || !isMaterialItem(item)) return;

              const category = getMaterialCategory(item);
              const unit = item.unit || getStandardUnit(category); // Prefer item unit, fallback to standard
              const quantity =
                typeof item.quantity === "number" ? item.quantity : 0;

              if (!materialMap[category]) {
                materialMap[category] = { unit, quantity: 0, items: [] };
              }
              // Aggregate quantity
              materialMap[category].quantity += quantity;
              // Store item for potential rate/amount calculation if needed
              materialMap[category].items.push(item);
            });
          }
        });
      }

      // Convert the aggregated map into the display format array
      // Assign simple sequential letters as itemNo for display
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let index = 0;

      return Object.entries(materialMap)
        .map(([description, { unit, quantity, items }]) => {
          const itemNo = alphabet[index++] || `Z${index - 26}`; // Handle beyond Z if needed

          // --- Determine Rate and Amount ---
          // Strategy 1: If all items in the category have the same rate, use it.
          // Strategy 2: If rates vary or are missing, you might:
          //   a) Use an average rate (sum of (rate*qty) / total qty)
          //   b) Use the rate from the first item
          //   c) Indicate it needs calculation/user input (e.g., set rate to 0 or NaN)
          // For simplicity here, we'll try to find a common rate or use 0.
          let rate = 0;
          let amount = 0;
          const uniqueRates = [
            ...new Set(
              items
                .map((i) => i.rate)
                .filter((r) => r !== undefined && r !== null)
            ),
          ];
          if (uniqueRates.length === 1) {
            rate = uniqueRates[0] ?? 0;
            amount = rate * quantity;
          } else if (
            items.length > 0 &&
            items[0].rate !== undefined &&
            items[0].rate !== null
          ) {
            // Fallback: Use first item's rate if available
            rate = items[0].rate ?? 0;
            amount = rate * quantity;
          } else {
            // Mark as needing rate input, amount will be 0 or NaN
            rate = 0; // Or NaN
            amount = 0; // Or NaN * quantity = NaN
          }

          return {
            itemNo,
            description,
            unit,
            quantity,
            rate, // Derived or placeholder
            amount, // Derived or placeholder
          };
        })
        .sort((a, b) => a.description.localeCompare(b.description)); // Sort alphabetically by description
    };

  // Replace the old useMemo hook
  const materialScheduleDisplayData = useMemo(
    () => generateMaterialScheduleForDisplay(), // <-- Call the new function
    [boqData]
  );
  // Make sure you remove the old one:
  // const materialScheduleData = useMemo(
  //   () => generateMaterialSchedule(),
  //   [boqData]
  // );
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
          {/* Placeholder for Logo */}
          {projectInfo.logoUrl ? (
            <Image
              style={styles.logoContainer} // Use existing style for size/shape
              source={{ uri: projectInfo.logoUrl }}
            />
          ) : (
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>LOGO</Text>
            </View>
          )}
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
          {/* Placeholder for Logo */}
          {projectInfo.logoUrl ? (
            <Image
              style={styles.logoContainer} // Use existing style for size/shape
              source={{ uri: projectInfo.logoUrl }}
            />
          ) : (
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>LOGO</Text>
            </View>
          )}
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
          {/* Placeholder for Logo */}
          {projectInfo.logoUrl ? (
            <Image
              style={styles.logoContainer} // Use existing style for size/shape
              source={{ uri: projectInfo.logoUrl }}
            />
          ) : (
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>LOGO</Text>
            </View>
          )}
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
                  <Text style={[styles.tableColHeader, { width: "15%" }]}>
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

      {/* --- Material Schedule Page (Redesigned) --- */}
      <Page size="A4" style={styles.page}>
        {/* Updated Header with Logo */}
        <View style={styles.companyHeader}>
          {/* Placeholder for Logo */}
          {projectInfo.logoUrl ? (
            <Image
              style={styles.logoContainer} // Use existing style for size/shape
              source={{ uri: projectInfo.logoUrl }}
            />
          ) : (
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>LOGO</Text>
            </View>
          )}
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Construction Solutions Ltd</Text>
            <Text style={styles.companyTagline}>
              Quality Construction Services
            </Text>
          </View>
        </View>

        {/* Project Header (Same as other pages) */}
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

        {/* Material Schedule Section */}
        <View style={styles.materialScheduleSection}>
          <Text style={styles.materialScheduleTitle}>MATERIAL SCHEDULE</Text>
          <View style={styles.materialScheduleTable}>
            {/* Updated Header Row */}
            <View style={styles.materialScheduleHeaderRow}>
              <Text style={styles.materialScheduleColHeaderItem}>ITEM</Text>
              <Text style={styles.materialScheduleColHeaderDescription}>
                DESCRIPTION
              </Text>
              <Text style={styles.materialScheduleColHeaderUnit}>UNIT</Text>
              <Text style={styles.materialScheduleColHeaderQty}>QUANTITY</Text>
              <Text style={styles.materialScheduleColHeaderRate}>
                RATE (KSh)
              </Text>
              <Text style={styles.materialScheduleColHeaderAmount}>
                AMOUNT (KSh)
              </Text>
            </View>

            {/* Data Rows */}
            {materialScheduleDisplayData.length > 0 ? (
              materialScheduleDisplayData.map((material, index) => (
                <View
                  style={styles.materialScheduleRow}
                  key={`material-display-${index}`}
                >
                  <Text style={styles.materialScheduleColItem}>
                    {material.itemNo}
                  </Text>
                  <Text style={styles.materialScheduleColDescription}>
                    {material.description}
                  </Text>
                  <Text style={styles.materialScheduleColUnit}>
                    {material.unit}
                  </Text>
                  <Text style={styles.materialScheduleColQty}>
                    {material.quantity % 1 === 0
                      ? material.quantity.toFixed(0)
                      : material.quantity.toFixed(2)}
                  </Text>
                  <Text style={styles.materialScheduleColRate}>
                    {material.rate > 0 ? formatCurrency(material.rate) : "-"}{" "}
                    {/* Show dash if rate is 0/missing */}
                  </Text>
                  <Text style={styles.materialScheduleColAmount}>
                    {material.amount > 0
                      ? formatCurrency(material.amount)
                      : "-"}{" "}
                    {/* Show dash if amount is 0/missing */}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.materialScheduleRow}>
                <Text
                  style={[
                    styles.materialScheduleCol,
                    { width: "100%", textAlign: "center" }, // Span full width or adjust
                  ]}
                >
                  No materials found or schedule data unavailable.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
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
          {/* Placeholder for Logo */}
          {projectInfo.logoUrl ? (
            <Image
              style={styles.logoContainer} // Use existing style for size/shape
              source={{ uri: projectInfo.logoUrl }}
            />
          ) : (
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>LOGO</Text>
            </View>
          )}
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
