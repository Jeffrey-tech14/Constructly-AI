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
  materialScheduleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    backgroundColor: "#1E40AF",
    padding: 8,
    marginBottom: 10,
    textAlign: "center",
  },
  materialScheduleHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    padding: 8,
    marginBottom: 2,
    borderRadius: 4,
  },
  materialScheduleColHeaderItem: {
    width: "8%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
  },
  materialScheduleColHeaderDescription: {
    width: "20%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 9,
  },
  materialScheduleColHeaderUnit: {
    width: "8%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
  },
  materialScheduleColHeaderQty: {
    width: "10%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "center",
  },
  materialScheduleColHeaderRate: {
    width: "12%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "right",
  },
  materialScheduleColHeaderAmount: {
    width: "12%",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 9,
    textAlign: "right",
  },
  materialScheduleRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    padding: 6,
    minHeight: 16,
  },
  materialScheduleColItem: {
    width: "8%",
    fontSize: 9,
    textAlign: "center",
    color: "#374151",
  },
  materialScheduleColDescription: {
    width: "20%",
    fontSize: 9,
    color: "#374151",
  },
  materialScheduleColUnit: {
    width: "8%",
    fontSize: 9,
    textAlign: "center",
    color: "#374151",
  },
  materialScheduleColQty: {
    width: "10%",
    fontSize: 9,
    textAlign: "center",
    color: "#374151",
  },
  materialScheduleColRate: {
    width: "12%",
    fontSize: 9,
    textAlign: "right",
    color: "#374151",
  },
  materialScheduleColAmount: {
    width: "12%",
    fontSize: 9,
    textAlign: "right",
    color: "#374151",
  },
  materialCategoryHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    padding: 8,
    marginTop: 10,
    marginBottom: 2,
    borderRadius: 4,
  },
  materialCategoryHeaderText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  categoryTotalRow: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 8,
    fontWeight: "bold",
    fontSize: 10,
    backgroundColor: "#EFF6FF",
    padding: 6,
    borderTop: "1pt solid #BFDBFE",
    borderRadius: 4,
  },
  categoryTotalLabel: {
    width: "68%",
    textAlign: "right",
    paddingRight: 8,
    color: "#1E40AF",
  },
  categoryTotalValue: {
    width: "12%",
    textAlign: "right",
    color: "#1E40AF",
    fontWeight: "bold",
  },
  grandTotalRow: {
    flexDirection: "row",
    marginTop: 15,
    borderTop: "2pt solid #3B82F6",
    paddingTop: 10,
    fontWeight: "bold",
    fontSize: 11,
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 6,
  },
  grandTotalLabel: {
    width: "68%",
    textAlign: "right",
    paddingRight: 8,
    color: "#1E40AF",
  },
  grandTotalValue: {
    width: "12%",
    textAlign: "right",
    color: "#1E40AF",
  },
  contingencyRow: {
    flexDirection: "row",
    marginTop: 5,
    fontWeight: "bold",
    fontSize: 10,
    backgroundColor: "#DBEAFE",
    padding: 8,
    borderRadius: 4,
  },
  contingencyLabel: {
    width: "68%",
    textAlign: "right",
    paddingRight: 8,
    color: "#1E40AF",
  },
  contingencyValue: {
    width: "12%",
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
    fontSize: 9,
    color: "#6B7280",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
});

const formatCurrency = (amount: number): string => {
  if (!amount || amount === 0) return "0";
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface MaterialSchedulePDFProps {
  workItems: any[];
  projectInfo: any;
}

const MaterialSchedulePDF: React.FC<MaterialSchedulePDFProps> = ({
  workItems,
  projectInfo,
}) => {
  const totalCost = workItems.reduce(
    (sum, item) => sum + (item.totalCost || 0),
    0,
  );
  const contingency = totalCost * 0.05;
  const grandTotal = totalCost + contingency;

  const renderMaterialRow = (material: any, index: number) => (
    <View style={styles.materialScheduleRow}>
      <Text style={styles.materialScheduleColItem}>{index + 1}</Text>
      <Text style={styles.materialScheduleColDescription}>
        {material.description}
      </Text>
      <Text style={styles.materialScheduleColUnit}>{material.unit}</Text>
      <Text style={styles.materialScheduleColQty}>
        {typeof material.quantity === "number"
          ? material.quantity.toFixed(2)
          : material.quantity}
      </Text>
      <Text style={styles.materialScheduleColRate}>
        {material.rate?.toLocaleString?.() || material.rate}
      </Text>
      <Text style={styles.materialScheduleColAmount}>
        {material.amount?.toLocaleString?.() || formatCurrency(material.amount)}
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>
            {projectInfo.companyName || "JTech AI Construction"}
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
            <Text style={styles.projectInfoValue}>{projectInfo.title}</Text>
          </View>
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Client:</Text>
            <Text style={styles.projectInfoValue}>
              {projectInfo.clientName}
            </Text>
          </View>
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Location:</Text>
            <Text style={styles.projectInfoValue}>{projectInfo.location}</Text>
          </View>
          <View style={styles.projectInfoRow}>
            <Text style={styles.projectInfoLabel}>Date:</Text>
            <Text style={styles.projectInfoValue}>{projectInfo.date}</Text>
          </View>
        </View>

        {/* Materials Table */}
        <View style={{ marginBottom: 20 }}>
          {/* Master header */}
          <View style={styles.materialScheduleHeaderRow}>
            <Text style={styles.materialScheduleColHeaderItem}>#</Text>
            <Text style={styles.materialScheduleColHeaderDescription}>
              Material Requirement
            </Text>
            <Text style={styles.materialScheduleColHeaderUnit}>Unit</Text>
            <Text style={styles.materialScheduleColHeaderQty}>Qty</Text>
            <Text style={styles.materialScheduleColHeaderRate}>Unit Cost</Text>
            <Text style={styles.materialScheduleColHeaderAmount}>Total</Text>
          </View>

          {/* Work items and materials */}
          {workItems.map((workItem, workIndex) => {
            const workItemMaterials = workItem.materials || [];
            const workItemTotal = workItemMaterials.reduce(
              (sum: number, m: any) => sum + (m.amount || 0),
              0,
            );

            return (
              <View key={`work-item-${workIndex}`}>
                {/* Work Item Header */}
                <View style={styles.materialCategoryHeaderRow}>
                  <Text style={styles.materialCategoryHeaderText}>
                    {workItem.workDescription} ({workItem.workQuantity}{" "}
                    {workItem.workUnit})
                  </Text>
                </View>

                {/* Materials for this work item */}
                {workItemMaterials.map((material, matIndex) =>
                  renderMaterialRow(material, matIndex),
                )}

                {/* Work item subtotal */}
                <View style={styles.categoryTotalRow}>
                  <Text style={styles.categoryTotalLabel}>
                    Subtotal - {workItem.workDescription}:
                  </Text>
                  <Text style={styles.categoryTotalValue}>
                    {formatCurrency(workItemTotal)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Summation Section */}
        <View style={{ marginTop: 10 }}>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>SUBTOTAL:</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(totalCost)}
            </Text>
          </View>

          <View style={styles.contingencyRow}>
            <Text style={styles.contingencyLabel}>5% CONTINGENCY:</Text>
            <Text style={styles.contingencyValue}>
              {formatCurrency(contingency)}
            </Text>
          </View>

          <View style={{ ...styles.grandTotalRow, marginTop: 5, fontSize: 12 }}>
            <Text style={styles.grandTotalLabel}>GRAND TOTAL:</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(grandTotal)}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.boqFooter} fixed>
          <Text>
            Generated on {new Date().toLocaleDateString()} - {projectInfo.title}
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
