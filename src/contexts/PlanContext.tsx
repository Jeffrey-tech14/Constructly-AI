import { ParsedPlan } from '@/pages/UploadPage';
import React, { createContext, useContext, useState } from 'react';

export interface Door {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  custom: { height: string; width: string; price?: string };
  type: string; // Panel | Flush | Metal
  frame: string; // Wood | Steel | Aluminum
  count: number;
}

export interface Window {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  custom: { height: string; width: string; price?: string };
  glass: string; // Clear | Frosted | Tinted
  frame: string; // Wood | Steel | Aluminum
  count: number;
}

interface ExtractedPlan {
  rooms: {
     roomType: string;
  room_name: string;
  width: string;
  thickness: string;
  blockType: string; // Hollow, Solid, etc
  length: string;
  height: string;
  customBlock: { length: string; height: string; thickness: string; price: string };
  plaster: string; // "None" | "One Side" | "Both Sides"
  doors: Door[];
  windows: Window[];
  }[];
  floors: number;
  file_url?: string;
  file_name?: string;
  uploaded_at?: string;
}

interface PlanContextType {
  extractedPlan: ExtractedPlan | null;
  setExtractedPlan: (plan: ExtractedPlan) => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extractedPlan, setExtractedPlan] = useState<ParsedPlan | null>(null);

  return (
    <PlanContext.Provider value={{ extractedPlan, setExtractedPlan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) throw new Error('usePlan must be used within a PlanProvider');
  return context;
};
