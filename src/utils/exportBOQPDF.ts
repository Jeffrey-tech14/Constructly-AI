// src/utils/exportBOQPDF.ts
import { pdf } from "@react-pdf/renderer";
import React from "react"; // Import React to use createElement
import { BOQSection, PrelimItem, PrelimSection } from "@/types/boq"; // Adjust path if needed

// --- Define Types ---
interface ProjectInfo {
  title: string;
  clientName: string;
  clientEmail: string;
  location: string;
  projectType: string;
  houseType: string;
  region: string;
  floors: number;
  date: string; // Formatted date string, e.g., "1st January 2024"
}

// --- Helper Function for Dynamic Import ---
const getPDFGeneratorComponent = async () => {
  const module = await import("@/components/PDFGenerator");
  return module.default; // Return the default export (the component function)
};

/**
 * Generates and downloads a PDF BOQ file.
 * @param boqData The structured BOQ data.
 * @param projectInfo Project details, including a formatted 'date' string.
 * @param preliminaries
 * @returns True if successful, false otherwise.
 */
const exportBOQPDF = async (
  boqData: BOQSection[],
  projectInfo: ProjectInfo,
  preliminaries: any[]
): Promise<boolean> => {
  try {
    const PDFGeneratorComponent = await getPDFGeneratorComponent();
    const pdfReactElement = React.createElement(PDFGeneratorComponent, {
      boqData,
      projectInfo,
      preliminariesData: preliminaries[0].items,
    });

    const blob = await pdf(pdfReactElement as any).toBlob();

    // --- Create Download Link and Trigger Download ---
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // Sanitize filename
    const filenameTitle = projectInfo.title
      .replace(/[^a-z0-9_\-\s]/gi, "_")
      .replace(/\s+/g, "_");
    link.download = `BOQ_${filenameTitle}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // --- Cleanup ---
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (error) {
    console.error("Error generating or downloading PDF:", error);
    // Optionally, display an error message to the user
    return false;
  }
};

// Export the function and type
export { exportBOQPDF };
export type { ProjectInfo };
