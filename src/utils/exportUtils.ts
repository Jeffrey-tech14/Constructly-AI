// src/utils/exportUtils.ts
import { BOQSection } from "@/types/boq";
import { exportBOQPDF } from "./exportBOQPDF";
import { generateQuoteExcel } from "./excelGenerator";
import { generateQuoteDOCX } from "./doxGenerator";

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

    switch (format) {
      case "pdf":
        return await exportBOQPDF(
          quote.boq_data,
          {
            ...projectInfo,
          },
          quote.preliminaries,
          quote
        );
      case "excel":
        await generateQuoteExcel({
          quote,
          isClientExport: audience === "client",
        });
        return true;
      case "docx":
        await generateQuoteDOCX({
          quote,
          projectInfo: {
            ...projectInfo,
          },
          isClientExport: audience === "client",
        });
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error("Error exporting document:", error);
    return false;
  }
};
