// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { exportBOQPDF } from "./exportBOQPDF";
import { generateQuoteExcel } from "./excelGenerator";
import { generateQuoteDOCX } from "./doxGenerator";
import {
  AdvancedMaterialExtractor,
  MaterialSchedule,
} from "@/utils/advancedMaterialExtractor";
import { MaterialConsolidator } from "@/utils/materialConsolidator";
export interface ExportOptions {
  format: "pdf" | "excel" | "docx";
  audience: "client" | "contractor";
  quote: any;
  projectInfo: ProjectInfo;
  logoUrl?: string;
}
export interface ProjectInfo {
  title: string;
  companyName: string;
  clientName: string;
  clientEmail: string;
  location: string;
  projectType: string;
  houseType: string;
  region: string;
  floors: number;
  date: string;
  logoUrl: string;
  companyTagline?: string;
  consultant?: string;
  contractor?: string;
  drawingReference?: string;
  boqReference?: string;
}
export const exportQuote = async (options: ExportOptions): Promise<boolean> => {
  try {
    const { format, audience, quote, projectInfo, logoUrl } = options;
    let materialSchedule: any[] = [];
    const hasMaterialData =
      quote?.concrete_materials || quote?.rebar_calculations || quote?.boq_data;

    // For PDF format, require successful Gemini extraction if material data exists
    if (format === "pdf" && hasMaterialData) {
      try {
        const rawSchedule: MaterialSchedule =
          await AdvancedMaterialExtractor.extractWithGemini(quote);
        materialSchedule = MaterialConsolidator.consolidateAllMaterials(
          Object.values(rawSchedule).flat()
        );
      } catch (error) {
        console.error("Gemini extraction failed for PDF export:", error);
        throw new Error(
          `Material extraction failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } else if (format !== "pdf" && hasMaterialData) {
      // For non-PDF formats, try Gemini but fall back to local extraction
      try {
        const rawSchedule: MaterialSchedule =
          await AdvancedMaterialExtractor.extractWithGemini(quote);
        materialSchedule = MaterialConsolidator.consolidateAllMaterials(
          Object.values(rawSchedule).flat()
        );
      } catch (error) {
        console.warn(
          "AI extraction failed, falling back to local extraction:",
          error
        );
      }
    } else {
      // No material data, use existing schedule if available
      if (Array.isArray(quote?.materialSchedule)) {
        materialSchedule = quote.materialSchedule;
      }
    }
    const enrichedQuote = {
      ...quote,
      materialSchedule,
    };
    switch (format) {
      case "pdf":
        try {
          const result = await exportBOQPDF(
            quote.boq_data,
            {
              ...projectInfo,
            },
            quote.preliminaries,
            quote,
            audience === "client"
          );
          if (!result) {
            throw new Error("PDF generation returned false");
          }
          return true;
        } catch (pdfError) {
          console.error("PDF export failed:", pdfError);
          throw new Error(
            `PDF export failed: ${
              pdfError instanceof Error ? pdfError.message : String(pdfError)
            }`
          );
        }
      case "excel":
        try {
          await generateQuoteExcel({
            quote: enrichedQuote,
            isClientExport: audience === "client",
          });
          return true;
        } catch (excelError) {
          console.error("Excel export failed:", excelError);
          throw new Error(
            `Excel export failed: ${
              excelError instanceof Error
                ? excelError.message
                : String(excelError)
            }`
          );
        }
      case "docx":
        try {
          await generateQuoteDOCX({
            quote: enrichedQuote,
            projectInfo: {
              ...projectInfo,
            },
            isClientExport: audience === "client",
          });
          return true;
        } catch (docxError) {
          console.error("DOCX export failed:", docxError);
          throw new Error(
            `DOCX export failed: ${
              docxError instanceof Error ? docxError.message : String(docxError)
            }`
          );
        }
      default:
        throw new Error(`Unknown export format: ${format}`);
    }
  } catch (error) {
    console.error("Error exporting document:", error);
    return false;
  }
};
