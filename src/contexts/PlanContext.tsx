import React, { createContext, useContext, useState } from "react";
export interface Door {
    sizeType: string;
    standardSize: string;
    custom: {
        height: string;
        width: string;
        price?: string;
    };
    type: string;
    frame: string;
    count: number;
}
export interface Window {
    sizeType: string;
    standardSize: string;
    custom: {
        height: string;
        width: string;
        price?: string;
    };
    glass: string;
    frame: string;
    count: number;
}
export interface ExtractedPlan {
    rooms: {
        roomType: string;
        room_name: string;
        width: string;
        thickness: string;
        blockType: string;
        length: string;
        height: string;
        customBlock: {
            length: string;
            height: string;
            thickness: string;
            price: string;
        };
        plaster: string;
        doors: Door[];
        windows: Window[];
    }[];
    floors: number;
    foundationDetails?: {
        foundationType: string;
        totalPerimeter: number;
        masonryType: string;
        wallThickness: string;
        wallHeight: string;
        blockDimensions?: string;
        length: string;
        width: string;
        height: string;
    };
    file_url?: string;
    file_name?: string;
    uploaded_at?: string;
}
interface PlanContextType {
    extractedPlan: ExtractedPlan | null;
    setExtractedPlan: (plan: ExtractedPlan) => void;
}
const PlanContext = createContext<PlanContextType | undefined>(undefined);
export const PlanProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children, }) => {
    const [extractedPlan, setExtractedPlan] = useState<ExtractedPlan | null>(null);
    return (<PlanContext.Provider value={{ extractedPlan, setExtractedPlan }}>
      {children}
    </PlanContext.Provider>);
};
export const usePlan = () => {
    const context = useContext(PlanContext);
    if (!context)
        throw new Error("usePlan must be used within a PlanProvider");
    return context;
};
