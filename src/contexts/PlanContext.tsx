// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { Door, Window } from "@/hooks/useMasonryCalculatorNew";
import {
  Dimensions,
  WallSection,
  WallProperties,
} from "@/hooks/useMasonryCalculatorNew";
import React, { createContext, useContext, useState } from "react";

export interface EquipmentSection {
  equipmentData: {
    standardEquipment: EquipmentItem[];
    customEquipment: EquipmentItem[];
    usageUnits: string[];
    categories: string[];
  };
}

export interface EquipmentItem {
  id?: string;
  name: string;
  description?: string;
  usage_unit?: string;
  rate_per_unit?: number;
  category?: string;
}

export interface PaintingLayerCalculation {
  quantity: number; // raw calculated quantity
  roundedQuantity: number; // net quantity (rounded to purchasable units)
  grossQuantity: number; // rounded + wastage adjustment (what to purchase)
  unit: "bags" | "litres";
  unitRate: number; // price per unit
  totalCost: number;
  totalCostWithWastage: number;
}

export interface PaintingSpecificationData {
  id: string;
  surfaceArea: number; // m²
  location?: string; // e.g., "Living Room", "All Interior Walls"
  skimming?: {
    enabled: boolean;
    coats: number;
    coverage: number;
  };
  undercoat?: {
    enabled: boolean;
    coverage: number;
  };
  finishingPaint?: {
    category: "emulsion" | "enamel";
    subtype:
      | "vinyl-matt"
      | "vinyl-silk"
      | "antibacterial"
      | "eggshell"
      | "gloss";
    coats: number;
    coverage: number;
  };
  calculations?: {
    skimming: PaintingLayerCalculation | null;
    undercoat: PaintingLayerCalculation | null;
    finishing: PaintingLayerCalculation | null;
  };
}

export interface PaintingTotalsData {
  totalArea: number; // m²
  skimmingBags: number;
  skimmingCost: number;
  undercoatLitres: number;
  undercoatCost: number;
  finishingLitres: number;
  finishingCost: number;
  totalLitres: number;
  totalBags: number;
  totalCost: number;
  totalCostWithWastage: number; // includes wastage from finishes settings
}

export interface ExtractedPlan {
  projectInfo?: {
    projectType: string;
    floors: number;
    totalArea: number;
    description: string;
  };
  wallDimensions?: Dimensions;
  wallSections?: WallSection[];
  wallProperties?: WallProperties;
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

  // Existing structural elements
  earthworks?: Array<{
    id: string;
    type: string;
    length: string;
    width: string;
    depth: string;
    volume: string;
    material: string;
  }>;

  equipment?: EquipmentSection;

  concreteStructures?: Array<{
    id: string;
    name: string;
    element: string;
    length: string;
    width: string;
    height: string;
    volume?: string;
    mix: string;
    slabArea?: string;
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
    verandahArea: string;
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
    specifications?: any;
  }>;

  // Painting specifications (multi-layer painting system)
  painting?: PaintingSpecificationData[];
  paintingTotals?: PaintingTotalsData;

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
  projectType?: string;
  projectName?: string;
  projectLocation?: string;
}

interface PlanContextType {
  extractedPlan: ExtractedPlan | null;
  setExtractedPlan: (plan: ExtractedPlan) => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [extractedPlan, setExtractedPlan] = useState<ExtractedPlan | null>(
    null
  );

  const contextValue: PlanContextType = {
    extractedPlan,
    setExtractedPlan,
  };

  return (
    <PlanContext.Provider value={contextValue}>{children}</PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) throw new Error("usePlan must be used within a PlanProvider");
  return context;
};
