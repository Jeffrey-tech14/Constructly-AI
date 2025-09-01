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
  isHeader:boolean;
  isProvision?: boolean;
}

export interface BOQSection {
  title: string;
  items: BOQItem[];
  summary?: number;
}

export interface BOQDocument {
  preliminaries: BOQSection[];
  measuredWorks: BOQSection[];
  primeCostSums: BOQSection[];
  provisionalSums: BOQSection[];
  summaries: {
    sectionSummaries: {[key: string]: number};
    grandTotal: number;
  };
}

// Helper function to generate item numbers
export const generateItemNumber = (prefix: string, index: number): string => {
  return `${prefix}-${index.toString().padStart(3, '0')}`;
};
