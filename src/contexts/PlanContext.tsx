// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { Category } from "@/hooks/useConcreteCalculator";
import { Door, Window } from "@/hooks/useMasonryCalculatorNew";
import {
  Dimensions,
  WallSection,
  WallProperties,
} from "@/hooks/useMasonryCalculatorNew";
import {
  ElementTypes,
  FootingType,
  RebarCalculationMode,
  RebarSize,
  ReinforcementType,
  RetainingWallType,
} from "@/hooks/useRebarCalculator";
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
    houseType?: "bungalow" | "mansionate";
  };
  wallDimensions?: Dimensions;
  wallSections?: WallSection[];
  wallProperties?: WallProperties;
  floors: number;

  foundationDetails?: Array<{
    foundationType: string;
    totalPerimeter?: number;
    masonryType?: string;
    wallThickness?: string;
    wallHeight?: string;
    blockDimensions?: string;
    length?: string;
    width?: string;
    height?: string;
    groundFloorElevation?: number | string;
  }>;

  foundationWalling?: Array<{
    id: string;
    type: "external" | "internal";
    blockType: string;
    blockDimensions: string;
    wallLength: string;
    wallHeight: string;
    numberOfWalls: number;
    mortarRatio: string;
  }>;

  ringBeams?: Array<{
    id: string;
    name: string;
    perimeter: string;
    width: string;
    depth: string;
    concrete_mix: string;
    mainBarSize?: string;
    mainBarsCount?: string;
    stirrupSize?: string;
    stirrupSpacing?: string;
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
    id?: string;
    element: ElementTypes;
    name: string;
    length: string;
    width: string;
    depth: string;
    columnHeight?: string;
    mainBarSpacing?: string;
    distributionBarSpacing?: string;
    mainBarsCount?: string;
    distributionBarsCount?: string;
    slabLayers?: string;
    mainBarSize?: RebarSize;
    distributionBarSize?: RebarSize;
    stirrupSize?: RebarSize;
    tieSize?: RebarSize;
    stirrupSpacing?: string;
    tieSpacing?: string;
    category?: Category;
    number?: string;
    reinforcementType?: ReinforcementType;
    rebarCalculationMode: RebarCalculationMode; //default is NORMAL_REBAR_MODE always
    meshGrade?: string;
    meshSheetWidth?: string;
    meshSheetLength?: string;
    meshLapLength?: string;
    footingType?: FootingType;
    longitudinalBars?: string;
    transverseBars?: string;
    topReinforcement?: string;
    bottomReinforcement?: string;
    retainingWallType?: RetainingWallType;
    heelLength?: string;
    toeLength?: string;
    stemVerticalBarSize?: RebarSize;
    stemHorizontalBarSize?: RebarSize;
    stemVerticalSpacing?: string;
    stemHorizontalSpacing?: string;
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

  // Roofing systems - deterministic calculation inputs
  roofing?: {
    footprintAreaM2: number;
    externalPerimeterM: number;
    internalPerimeterM?: number; // Optional internal wall perimeter for wall plates
    buildingLengthM: number;
    buildingWidthM: number;
    roofTrussTypeKingPost: boolean;
    purlinSpacingM: number;
    roofingSheetEffectiveCoverWidthM: number;
    roofingSheetLengthM: number;
    roofType: "gable" | "hip" | "pitched" | "flat";
    pitchDegrees: number;
    eaveWidthM: number;
    rasterSpacingMm: number;
    trussSpacingMm: number;
  };

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

  // Finishes (legacy structure)
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

  // Finishes (new category-based structure)
  finishes_calculations?: {
    flooring?: Array<{
      id: string;
      category: "flooring";
      material: string;
      area: number;
      quantity: number;
      unit: string;
      location: string;
    }>;
    ceiling?: Array<{
      id: string;
      category: "ceiling";
      material: string;
      area: number;
      quantity: number;
      unit: string;
      location: string;
    }>;
    "wall-finishes"?: Array<{
      id: string;
      category: "wall-finishes";
      material: string;
      area: number;
      quantity: number;
      unit: string;
      location: string;
    }>;
    joinery?: Array<{
      id: string;
      category: "joinery";
      material: string;
      area: number;
      quantity: number;
      unit: string;
      location: string;
    }>;
    external?: Array<{
      id: string;
      category: "external";
      material: string;
      area: number;
      quantity: number;
      unit: string;
      location: string;
    }>;
  };

  // Bar Bending Schedule (BBS)
  bar_schedule?: Array<{
    bar_type: string; // D6, D8, D10, D12, D14, D16, D18, D20, D22, D25, D28, D32, D36, D40, D50
    bar_length: number; // in meters
    quantity: number; // total quantity for this bar type and length
    weight_per_meter?: number; // optional: weight per meter in kg
    total_weight?: number; // optional: total weight in kg
  }>;
  rebar_calculation_method?: "bbs" | "NORMAL_REBAR_MODE"; // defaults to "NORMAL_REBAR_MODE"

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
  bbs_file_url?: string;
  houseType?: string;
  totalArea?: number;
  projectType?: string;
  projectName?: string;
  projectLocation?: string;
  clientName?: string;
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
    null,
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
