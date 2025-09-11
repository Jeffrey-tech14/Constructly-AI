// src/utils/excelGenerator.ts
import * as XLSX from "xlsx";

interface ExcelExportOptions {
  quote: any;
  isClientExport?: boolean;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  if (!amount || amount === 0) return "";
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format quantity
const formatQuantity = (quantity: any): string => {
  if (quantity === null || quantity === undefined || quantity === "") return "";
  const num = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  if (isNaN(num)) return "";
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
};

// Helper function to extract materials from quote
const extractMaterialsFromQuote = (quote: any): any[] => {
  // Implementation depends on your data structure
  if (quote.materialSchedule) {
    return quote.materialSchedule;
  }

  if (quote.consolidatedMaterials) {
    return quote.consolidatedMaterials;
  }

  return [];
};

export const generateQuoteExcel = async ({
  quote,
  isClientExport = false,
}: ExcelExportOptions) => {
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  wb.Props = {
    Title: `${isClientExport ? "Client" : "Contractor"} Quote - ${quote.title}`,
    Author: quote.contractor_name || "Elaris AI",
    CreatedDate: new Date(),
  };

  // 1. Summary Sheet
  const summaryData = [
    ["PROJECT SUMMARY"],
    ["Project Title", quote.title],
    ["Client Name", quote.client_name],
    ["Location", quote.location],
    ["Project Type", quote.project_type],
    ["House Type", quote.house_type],
    ["Region", quote.region],
    ["Floors", quote.floors],
    ["Date Generated", new Date().toLocaleDateString()],
    [""],
    ["COST BREAKDOWN"],
    ["Materials Cost", quote.materials_cost],
    ["Labor Cost", quote.labor_cost],
    ["Equipment Cost", quote.equipment_cost],
    ["Transport Cost", quote.transport_costs],
    ["Services Cost", quote.services_cost],
    ["Subcontractors Cost", quote.subcontractors_cost],
    ["Preliminaries Cost", quote.preliminaries_cost],
    ["Additional Items Cost", quote.addons_cost],
    ["Permit Cost", quote.permit_cost],
    [""],
    ["Subtotal", quote.subtotal],
  ];

  // Add profit information based on audience
  if (!isClientExport) {
    summaryData.push(
      ["Overhead", quote.overhead_amount],
      ["Contingency", quote.contingency_amount],
      ["Profit", quote.profit_amount]
    );
  } else {
    summaryData.push(["Profit", "Included in total"]);
  }

  summaryData.push([""], ["GRAND TOTAL", quote.total_amount]);

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // 2. BOQ Sections (only for contractor)
  if (!isClientExport && quote.boq_data) {
    quote.boq_data.forEach((section: any, index: number) => {
      if (section.items && section.items.length > 0) {
        const sectionData = [
          [section.title.toUpperCase()],
          ["Item", "Description", "Unit", "Quantity", "Rate", "Amount"],
        ];

        section.items.forEach((item: any) => {
          if (!item.isHeader) {
            sectionData.push([
              item.itemNo,
              item.description,
              item.unit,
              formatQuantity(item.quantity),
              formatCurrency(item.rate),
              formatCurrency(item.amount),
            ]);
          } else {
            sectionData.push(["", item.description, "", "", "", ""]);
          }
        });

        // Add section total
        const sectionTotal = section.items
          .filter((item: any) => !item.isHeader)
          .reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

        sectionData.push([
          "",
          "SECTION TOTAL",
          "",
          "",
          "",
          formatCurrency(sectionTotal),
        ]);

        const sectionWs = XLSX.utils.aoa_to_sheet(sectionData);
        XLSX.utils.book_append_sheet(wb, sectionWs, `BOQ-${index + 1}`);
      }
    });
  }

  // 3. Materials Schedule (only for contractor)
  if (!isClientExport) {
    const materials = extractMaterialsFromQuote(quote);
    if (materials && materials.length > 0) {
      const materialsData = [
        ["MATERIALS SCHEDULE"],
        ["Item", "Description", "Unit", "Quantity", "Rate", "Amount"],
      ];

      materials.forEach((material: any, index: number) => {
        materialsData.push([
          index + 1,
          material.description,
          material.unit,
          formatQuantity(material.quantity),
          formatCurrency(material.rate),
          formatCurrency(material.amount),
        ]);
      });

      const materialsTotal = materials.reduce(
        (sum: number, m: any) => sum + m.amount,
        0
      );
      materialsData.push([
        "",
        "TOTAL MATERIALS COST",
        "",
        "",
        "",
        formatCurrency(materialsTotal),
      ]);

      const materialsWs = XLSX.utils.aoa_to_sheet(materialsData);
      XLSX.utils.book_append_sheet(wb, materialsWs, "Materials");
    }
  }

  // 4. Additional Costs (only for contractor)
  if (!isClientExport) {
    const additionalCostsData = [["ADDITIONAL COSTS"], ["Cost Type", "Amount"]];

    if (quote.equipment_cost > 0) {
      additionalCostsData.push([
        "Equipment",
        formatCurrency(quote.equipment_cost),
      ]);
    }

    if (quote.transport_costs > 0) {
      additionalCostsData.push([
        "Transport",
        formatCurrency(quote.transport_costs),
      ]);
    }

    if (quote.services_cost > 0) {
      additionalCostsData.push([
        "Services",
        formatCurrency(quote.services_cost),
      ]);
    }

    if (quote.subcontractors_cost > 0) {
      additionalCostsData.push([
        "Subcontractors",
        formatCurrency(quote.subcontractors_cost),
      ]);
    }

    if (quote.addons_cost > 0) {
      additionalCostsData.push([
        "Additional Items",
        formatCurrency(quote.addons_cost),
      ]);
    }

    if (quote.permit_cost > 0) {
      additionalCostsData.push(["Permits", formatCurrency(quote.permit_cost)]);
    }

    const additionalCostsWs = XLSX.utils.aoa_to_sheet(additionalCostsData);
    XLSX.utils.book_append_sheet(wb, additionalCostsWs, "Additional Costs");
  }

  // Save file
  const fileName = `${
    isClientExport ? "Client" : "Contractor"
  }_Quote_${quote.title.replace(/\s+/g, "_")}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return true;
};
