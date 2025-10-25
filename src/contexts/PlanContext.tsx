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
  frame: {
    type: string;
    sizeType: string; // "standard" | "custom"
    standardSize: string;

    custom: {
      height: string;
      width: string;
      price?: string;
    };
  };
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
  frame: {
    type: string;
    sizeType: string; // "standard" | "custom"
    standardSize: string;

    custom: {
      height: string;
      width: string;
      price?: string;
    };
  };
  count: number;
}
export interface ExtractedPlan {
  projectInfo?: {
    projectType: string;
    floors: number;
    totalArea: number;
    description: string;
  };

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

  // New structural elements
  earthworks?: Array<{
    id: string;
    type: string;
    length: string;
    width: string;
    depth: string;
    volume: string;
    material: string;
  }>;

  concreteStructures?: Array<{
    id: string;
    name: string;
    element: string;
    length: string;
    width: string;
    height: string;
    volume?: string;
    mix: string;
    formwork?: string;
    category: string;
    number: string;
    hasConcreteBed?: boolean;
    bedDepth?: string;
    hasAggregateBed?: boolean;
    aggregateDepth?: string;
    hasMasonryWall?: boolean;
    masonryBlockType?: string;
    masonryBlockDimensions?: string;
    masonryWallThickness?: string;
    masonryWallHeight?: string;
    masonryWallPerimeter?: number;
    foundationType?: string;
    clientProvidesWater?: boolean;
    cementWaterRatio?: string;
    reinforcement?: {
      mainBarSize?: string;
      mainBarSpacing?: string;
      distributionBarSize?: string;
      distributionBarSpacing?: string;
    };
    staircaseDetails?: {
      riserHeight?: string;
      treadWidth?: string;
      numberOfSteps?: number;
    };
    tankDetails?: {
      capacity?: string;
      wallThickness?: string;
      coverType?: string;
    };
  }>;

  reinforcement?: Array<{
    id: string;
    element: string;
    name: string;
    length: string;
    width: string;
    depth: string;
    mainBarSize: string;
    mainBarSpacing: string;
    distributionBarSize?: string;
    distributionBarSpacing?: string;
  }>;

  masonry?: Array<{
    id: string;
    type: string;
    blockType: string;
    length: string;
    height: string;
    thickness: string;
    area: string;
  }>;

  // Roofing systems
  roofing?: Array<{
    id: string;
    name: string;
    type: string;
    material: string;
    area: string;
    pitch: string;
    length?: string;
    width?: string;
    structure?: string;
    span?: string;
    perimeter?: string;
    ridgeLength?: string;
    flashingLength?: string;
    valleyLength?: string;
    thickness?: string;
    underlayment?: string;
    insulation?: {
      type: string;
      thickness: string;
    };
  }>;

  // Plumbing systems
  plumbing?: Array<{
    id: string;
    name: string;
    system: string;
    pipes?: Array<{
      id: string;
      material: string;
      diameter: string;
      length: string;
      pressureRating?: string;
      insulation?: {
        type: string;
        thickness: number;
      };
      trenchDetails?: {
        width: number;
        depth: number;
        length: number;
      };
    }>;
    fixtures?: Array<{
      id: string;
      type: string;
      count: number;
      location: string;
      waterConsumption?: number;
    }>;
    tanks?: any[];
    pumps?: any[];
    fittings?: any[];
  }>;

  // Electrical systems
  electrical?: Array<{
    id: string;
    name: string;
    system: string;
    panels?: Array<{
      id: string;
      type: string;
      circuits: number;
      rating: string;
      accessories?: string[];
    }>;
    outlets?: Array<{
      id: string;
      type: string;
      count: number;
      location: string;
      rating: string;
      gang?: number;
      mounting?: string;
    }>;
    lighting?: Array<{
      id: string;
      type: string;
      count: number;
      location: string;
      wattage: string;
      controlType: string;
      emergency: boolean;
    }>;
    cables?: Array<{
      id: string;
      type: string;
      size: string;
      length: string;
      circuit: string;
      protection?: string;
      installationMethod?: string;
    }>;
    protectionDevices?: any[];
    voltage?: number;
  }>;

  // Finishes
  finishes?: Array<{
    id: string;
    type: string;
    material: string;
    area: string;
    length?: string;
    width?: string;
    height?: string;
    room?: string;
    specifications?: any;
  }>;

  // External works
  externalWorks?: Array<{
    id: string;
    type: string;
    material: string;
    area: string;
    length?: string;
    width?: string;
  }>;

  file_url?: string;
  file_name?: string;
  uploaded_at?: string;
  houseType?: string;
}
interface PlanContextType {
  extractedPlan: ExtractedPlan | null;
  setExtractedPlan: (plan: ExtractedPlan) => void;
}
const PlanContext = createContext<PlanContextType | undefined>(undefined);
export const PlanProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [extractedPlan, setExtractedPlan] = useState<ExtractedPlan | null>(
    null
  );
  return (
    <PlanContext.Provider value={{ extractedPlan, setExtractedPlan }}>
      {children}
    </PlanContext.Provider>
  );
};
export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) throw new Error("usePlan must be used within a PlanProvider");
  return context;
};
