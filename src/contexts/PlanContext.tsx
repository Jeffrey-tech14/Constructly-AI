import { ParsedPlan } from '@/pages/UploadPage';
import React, { createContext, useContext, useState } from 'react';

interface ExtractedPlan {
  rooms: {
    name: string;
    length: number;
    width: number;
    height: number;
    doors: number;
    windows: number;
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
