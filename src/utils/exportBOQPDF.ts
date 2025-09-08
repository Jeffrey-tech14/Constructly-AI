// src/utils/exportBOQPDF.ts
import { pdf } from "@react-pdf/renderer";
import React from "react";
import { BOQSection } from "@/types/boq";
import {
  AdvancedMaterialExtractor,
  MaterialSchedule,
} from "./advancedMaterialExtractor";
import { MaterialConsolidator } from "./materialConsolidator";
import PDFGeneratorComponent from "@/components/PDFGenerator";

// --- Define Types ---
interface ProjectInfo {
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
}

const exportBOQPDF = async (
  boqData: BOQSection[],
  projectInfo: ProjectInfo,
  preliminaries: any[],
  quote: any
): Promise<boolean> => {
  try {
    // Extract and consolidate material schedule from quote
    let materialSchedule: any[] | undefined;
    if (
      quote?.concrete_materials ||
      quote?.rebar_calculations ||
      quote?.rooms
    ) {
      const rawSchedule = AdvancedMaterialExtractor.extractLocally(quote);
      materialSchedule = MaterialConsolidator.consolidateAllMaterials(
        Object.values(rawSchedule).flat()
      );
      console.log(projectInfo.logoUrl);
    }

    const pdfReactElement = React.createElement(PDFGeneratorComponent, {
      boqData,
      projectInfo,
      preliminariesData: preliminaries,
      materialSchedule: materialSchedule,
      equipmentItems: quote.equipment,
      additionalServices: quote.services,
      calculationSummary: quote,
      subcontractors: quote.subcontractors,
      addons: quote.addons,
      transportCost: quote.transport_costs,
      contractType: quote.contract_type,
      profit: quote.profit_amount,
      contingency_amount: quote.contingency_amount,
      overhead_amount: quote.overhead_amount,
      labour: quote.labor_cost,
      permits: quote.permit_cost,
    });

    const blob = await pdf(pdfReactElement as any).toBlob();

    // Create Download Link and Trigger Download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filenameTitle = projectInfo.title
      .replace(/[^a-z0-9_\-\s]/gi, "_")
      .replace(/\s+/g, "_");
    link.download = `BOQ_${filenameTitle}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (error) {
    console.error("Error generating or downloading PDF:", error);
    return false;
  }
};

export { exportBOQPDF };
export type { ProjectInfo };
