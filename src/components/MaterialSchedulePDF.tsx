// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import {
  GeminiMaterialResponse,
  MaterialScheduleItem,
  MaterialScheduleSection,
} from "@/services/geminiService";

Font.register({
  family: "Outfit",
  fonts: [
    {
      src: "/fonts/Outfit-Regular.ttf",
      fontWeight: "normal",
      fontStyle: "normal",
    },
    { src: "/fonts/Outfit-Bold.ttf", fontWeight: "bold", fontStyle: "normal" },
    {
      src: "/fonts/Outfit-Light.ttf",
      fontWeight: "light",
      fontStyle: "normal",
    },
    {
      src: "/fonts/Outfit-Medium.ttf",
      fontWeight: "medium",
      fontStyle: "normal",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Outfit",
    lineHeight: 1.3,
    backgroundColor: "#FFFFFF",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#1E40AF",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  companyTagline: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 8,
    textAlign: "center",
  },
  projectInfoContainer: {
    marginBottom: 15,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  projectInfoRow: {
    flexDirection: "row",
    marginBottom: 3,
    fontSize: 9,
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
  materialScheduleHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    padding: 8,
    marginBottom: 2,
    borderRadius: 4,
  },
  materialScheduleColHeaderItem: {
    width: "6%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "center",
  },
  materialScheduleColHeaderDescription: {
    width: "22%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "left",
  },
  materialScheduleColHeaderSpecification: {
    width: "18%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "left",
  },
  materialScheduleColHeaderUnit: {
    width: "8%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "center",
  },
  materialScheduleColHeaderQty: {
    width: "10%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "right",
  },
  materialScheduleColHeaderRate: {
    width: "12%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "right",
  },
  materialScheduleColHeaderAmount: {
    width: "12%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "right",
  },
  materialScheduleColHeaderRemarks: {
    width: "12%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 8,
    textAlign: "left",
  },
  materialScheduleRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    padding: 6,
    minHeight: 16,
  },
  materialScheduleColItem: {
    width: "6%",
    fontSize: 8,
    textAlign: "center",
    color: "#374151",
  },
  materialScheduleColDescription: {
    width: "22%",
    fontSize: 8,
    color: "#374151",
  },
  materialScheduleColSpecification: {
    width: "18%",
    fontSize: 7,
    color: "#6B7280",
  },
  materialScheduleColUnit: {
    width: "8%",
    fontSize: 8,
    textAlign: "center",
    color: "#374151",
  },
  materialScheduleColQty: {
    width: "10%",
    fontSize: 8,
    textAlign: "right",
    color: "#374151",
  },
  materialScheduleColRate: {
    width: "12%",
    fontSize: 8,
    textAlign: "right",
    color: "#374151",
  },
  materialScheduleColAmount: {
    width: "12%",
    fontSize: 8,
    textAlign: "right",
    color: "#374151",
    fontWeight: "bold",
  },
  materialScheduleColRemarks: {
    width: "12%",
    fontSize: 7,
    color: "#6B7280",
    textAlign: "left",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    padding: 8,
    marginTop: 10,
    marginBottom: 2,
    borderRadius: 4,
  },
  sectionHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subheaderRow: {
    flexDirection: "row",
    backgroundColor: "#DBEAFE",
    padding: 6,
    marginTop: 4,
    marginBottom: 2,
    borderRadius: 2,
  },
  subheaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  noteRow: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    padding: 6,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  noteText: {
    fontSize: 8,
    color: "#92400E",
    fontStyle: "italic",
  },
  sectionSubtotalRow: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 9,
    backgroundColor: "#EFF6FF",
    padding: 6,
    borderTop: "1pt solid #BFDBFE",
    borderRadius: 4,
  },
  sectionSubtotalLabel: {
    width: "66%",
    textAlign: "right",
    paddingRight: 8,
    color: "#1E40AF",
  },
  sectionSubtotalValue: {
    width: "12%",
    textAlign: "right",
    color: "#1E40AF",
    fontWeight: "bold",
  },
  summarySection: {
    marginTop: 15,
    borderTopWidth: 2,
    paddingTop: 10,
    borderTopColor: "#1E40AF",
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 6,
    fontSize: 10,
  },
  summaryLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 12,
    fontWeight: "bold",
    color: "#1F2937",
  },
  summaryValue: {
    width: "15%",
    textAlign: "right",
    fontWeight: "bold",
    color: "#1E40AF",
  },
  grandTotalRow: {
    flexDirection: "row",
    marginTop: 10,
    borderTop: "2pt solid #1E40AF",
    paddingTop: 8,
    fontWeight: "bold",
    fontSize: 12,
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 4,
  },
  grandTotalLabel: {
    flex: 1,
    textAlign: "right",
    paddingRight: 12,
    color: "#1E40AF",
  },
  grandTotalValue: {
    width: "15%",
    textAlign: "right",
    color: "#1E40AF",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    textAlign: "center",
    fontSize: 8,
    color: "#6B7280",
  },
  boqFooter: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#6B7280",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
});

const formatCurrency = (amount: number | null): string => {
  if (!amount || amount === 0) return "0";
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatQuantity = (qty: number | null): string => {
  if (qty === null || qty === undefined) return "-";
  return qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(2);
};

interface MaterialSchedulePDFProps {
  materialSchedule: GeminiMaterialResponse;
  projectInfo: any;
}

const MaterialSchedulePDF: React.FC<MaterialSchedulePDFProps> = ({
  materialSchedule,
  projectInfo,
}) => {
  const renderMaterialItem = (item: MaterialScheduleItem, itemNum: string) => {
    switch (item.type) {
      case "subheader":
        return (
          <View key={itemNum} style={styles.subheaderRow}>
            <Text style={styles.subheaderText}>{item.description}</Text>
          </View>
        );

      case "note":
        return (
          <View key={itemNum} style={styles.noteRow}>
            <Text style={styles.noteText}>{item.description}</Text>
          </View>
        );

      case "item":
      default:
        return (
          <View key={itemNum} style={styles.materialScheduleRow}>
            <Text style={styles.materialScheduleColItem}>{itemNum}</Text>
            <Text style={styles.materialScheduleColDescription}>
              {item.description}
            </Text>
            <Text style={styles.materialScheduleColSpecification}>
              {item.specification || "-"}
            </Text>
            <Text style={styles.materialScheduleColUnit}>
              {item.unit || "-"}
            </Text>
            <Text style={styles.materialScheduleColQty}>
              {formatQuantity(item.quantity)}
            </Text>
            <Text style={styles.materialScheduleColRate}>
              {item.unit_rate ? formatCurrency(item.unit_rate) : "-"}
            </Text>
            <Text style={styles.materialScheduleColAmount}>
              {item.total_cost ? formatCurrency(item.total_cost) : "-"}
            </Text>
            <Text style={styles.materialScheduleColRemarks}>
              {item.calculated ? "Calculated" : ""}
            </Text>
          </View>
        );
    }
  };

  const calculateSectionTotal = (section: MaterialScheduleSection): number => {
    return section.items
      .filter((item) => item.type === "item")
      .reduce((sum, item) => sum + (item.total_cost || 0), 0);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>
            {projectInfo.companyName || "Construction Company"}
          </Text>
          {projectInfo.companyTagline && (
            <Text style={styles.companyTagline}>
              {projectInfo.companyTagline}
            </Text>
          )}
          <Text style={styles.title}>MATERIAL SCHEDULE</Text>
        </View>

        {/* Project Information */}
        <View style={styles.projectInfoContainer}>
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Project:</Text>
            <Text style={styles.projectInfoValue}>
              {materialSchedule.project.title || projectInfo.title}
            </Text>
          </View>
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Document Type:</Text>
            <Text style={styles.projectInfoValue}>
              {materialSchedule.project.document_type}
            </Text>
          </View>
          {materialSchedule.project.prepared_by && (
            <View style={styles.projectInfoRow}>
              <Text style={styles.projectInfoLabel}>Prepared By:</Text>
              <Text style={styles.projectInfoValue}>
                {materialSchedule.project.prepared_by}
              </Text>
            </View>
          )}
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Currency:</Text>
            <Text style={styles.projectInfoValue}>
              {materialSchedule.project.currency}
            </Text>
          </View>
          {projectInfo.clientName && (
            <View style={styles.projectInfoRow}>
              <Text style={styles.projectInfoLabel}>Client:</Text>
              <Text style={styles.projectInfoValue}>
                {projectInfo.clientName}
              </Text>
            </View>
          )}
          {projectInfo.location && (
            <View style={styles.projectInfoRow}>
              <Text style={styles.projectInfoLabel}>Location:</Text>
              <Text style={styles.projectInfoValue}>
                {projectInfo.location}
              </Text>
            </View>
          )}
          {projectInfo.date && (
            <View style={styles.projectInfoRow}>
              <Text style={styles.projectInfoLabel}>Date:</Text>
              <Text style={styles.projectInfoValue}>{projectInfo.date}</Text>
            </View>
          )}
        </View>

        {/* Materials Table */}
        <View style={{ marginBottom: 20 }}>
          {/* Master header - 8 columns */}
          <View style={styles.materialScheduleHeaderRow}>
            <Text style={styles.materialScheduleColHeaderItem}>Item</Text>
            <Text style={styles.materialScheduleColHeaderDescription}>
              Description
            </Text>
            <Text style={styles.materialScheduleColHeaderSpecification}>
              Specification
            </Text>
            <Text style={styles.materialScheduleColHeaderUnit}>Unit</Text>
            <Text style={styles.materialScheduleColHeaderQty}>Qty</Text>
            <Text style={styles.materialScheduleColHeaderRate}>Unit Rate</Text>
            <Text style={styles.materialScheduleColHeaderAmount}>
              Total Cost
            </Text>
            <Text style={styles.materialScheduleColHeaderRemarks}>Remarks</Text>
          </View>

          {/* Render sections */}
          {materialSchedule.sections.map((section, sectionIdx) => {
            const sectionTotal = calculateSectionTotal(section);

            return (
              <View key={`section-${sectionIdx}`}>
                {/* Section Header */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeaderText}>{section.name}</Text>
                </View>

                {/* Section Items */}
                {section.items.map((item, itemIdx) => {
                  const itemNum = `${section.section_id}.${itemIdx + 1}`;
                  return renderMaterialItem(item, itemNum);
                })}

                {/* Section Subtotal */}
                {sectionTotal > 0 && (
                  <View style={styles.sectionSubtotalRow}>
                    <Text style={styles.sectionSubtotalLabel}>
                      Section Total:
                    </Text>
                    <Text style={styles.sectionSubtotalValue}>
                      {formatCurrency(sectionTotal)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(materialSchedule.summary.sub_total)}
            </Text>
          </View>

          {materialSchedule.summary.contingency_percentage && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Contingency ({materialSchedule.summary.contingency_percentage}
                  %):
                </Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(materialSchedule.summary.contingency_amount)}
                </Text>
              </View>
            </>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(materialSchedule.summary.grand_total)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.boqFooter} fixed>
          <Text>
            Generated on {new Date().toLocaleDateString()} -{" "}
            {materialSchedule.project.title}
          </Text>
          <Text style={{ fontSize: 7, marginTop: 4, color: "#9CA3AF" }}>
            This is an automatically generated document. All calculations are
            subject to site verification.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default MaterialSchedulePDF;
