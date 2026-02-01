// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { pdf } from "@react-pdf/renderer";
import React from "react";
import {
  geminiService,
  GeminiMaterialResponse,
} from "@/services/geminiService";
import MaterialSchedulePDFComponent from "@/components/MaterialSchedulePDF";

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
  companyTagline?: string;
  consultant?: string;
  contractor?: string;
}

const exportMaterialSchedulePDF = async (
  projectInfo: ProjectInfo,
  quote: any,
): Promise<boolean> => {
  try {
    let materialSchedule: GeminiMaterialResponse | null = null;
    const hasMaterialData =
      quote?.concrete_materials || quote?.rebar_calculations || quote?.boq_data;

    // Extract material schedule using Gemini
    if (hasMaterialData) {
      try {
        materialSchedule = await geminiService.analyzeMaterials(quote);
        // Validate the structure
        if (
          !materialSchedule?.sections ||
          materialSchedule.sections.length === 0
        ) {
          throw new Error("No sections returned from Gemini analysis");
        }
      } catch (error) {
        console.error(
          "Gemini extraction failed for material schedule PDF:",
          error,
        );
        throw new Error("Material extraction failed for PDF export");
      }
    }

    if (!materialSchedule) {
      throw new Error("No material schedule data available for export");
    }

    const pdfReactElement = React.createElement(MaterialSchedulePDFComponent, {
      materialSchedule,
      projectInfo,
    });

    const blob = await pdf(pdfReactElement as any).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filenameTitle = projectInfo.title
      .replace(/[^a-z0-9_\-\s]/gi, "_")
      .replace(/\s+/g, "_");
    link.href = url;
    link.download = `MaterialSchedule_${filenameTitle}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    return true;
  } catch (error) {
    console.error("Error generating material schedule PDF:", error);
    return false;
  }
};

export { exportMaterialSchedulePDF };
export type { ProjectInfo };
