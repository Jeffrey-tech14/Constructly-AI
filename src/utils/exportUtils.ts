// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { exportBOQPDF } from "./exportBOQPDF";
import { generateQuoteExcel } from "./excelGenerator";
import { generateQuoteDOCX } from "./doxGenerator";
import {
  geminiService,
  GeminiMaterialResponse,
} from "@/services/geminiService";

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
    let materialSchedule: GeminiMaterialResponse | null = null;
    const hasMaterialData =
      quote?.concrete_materials || quote?.rebar_calculations || quote?.boq_data;

    // Extract material schedule
    if (hasMaterialData) {
      try {
        materialSchedule = await geminiService.analyzeMaterials(quote);

        if (
          !materialSchedule?.sections ||
          materialSchedule.sections.length === 0
        ) {
          throw new Error("No material schedule sections returned from Gemini");
        }
      } catch (error) {
        if (format === "pdf") {
          // For PDF, fail if extraction doesn't work
          console.error("Gemini extraction failed for PDF export:", error);
          throw new Error(
            `Material extraction failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        } else {
          // For other formats, warn but continue
          console.warn(
            "AI extraction failed, falling back to local extraction:",
            error,
          );
        }
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
            audience === "client",
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
            }`,
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
            }`,
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
            }`,
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
