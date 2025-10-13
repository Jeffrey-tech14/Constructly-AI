export interface MaterialRelationship {
  material: string;
  type: "requires" | "optional" | "precedes" | "follows";
  description: string;
}

export interface MaterialBreakdown {
  material: string;
  unit: string;
  ratio: number;
  category: string;
  quantity: number;
  element: string;
  materialType?: string;
  relationships?: MaterialRelationship[];
  requirements?: string[];
  preparationSteps?: string[];
  variations?: string[];
}

export interface BOQItem {
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  category: string;
  element: string;
  calculatedFrom?: string;
  isHeader: boolean;
  isProvision?: boolean;
  // New fields for material tracking
  materialType?: string;
  materialBreakdown?: MaterialBreakdown[];
  sourceLocation?: string;
  workType?: string;
  // Tracking properties for existing items
  isExisting?: boolean;
  wasMatched?: boolean;
}

export interface BOQSection {
  title: string;
  items: BOQItem[];
  summary?: number;
}

export interface PrelimItem {
  itemNo: string;
  description: string;
  amount: number;
  isHeader?: boolean;
}

export interface PrelimSection {
  title: string;
  items: PrelimItem[];
}

export interface BOQDocument {
  preliminaries: BOQSection[];
  measuredWorks: BOQSection[];
  primeCostSums: BOQSection[];
  provisionalSums: BOQSection[];
  summaries: {
    sectionSummaries: { [key: string]: number };
    grandTotal: number;
  };
}

// Helper function to generate item numbers
export const generateItemNumber = (prefix: string, index: number): string => {
  return `${prefix}-${index.toString().padStart(3, "0")}`;
};
