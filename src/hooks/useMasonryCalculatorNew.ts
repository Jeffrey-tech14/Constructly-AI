// Â© 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { useMaterialPrices } from "./useMaterialPrices";
import { RebarSize, REBAR_PROPERTIES } from "./useRebarCalculator";
import { Material } from "./useQuoteCalculations";
import { supabase } from "@/integrations/supabase/client";

type PriceMap = Record<RebarSize, number>;

// Door and Window interfaces (unchanged)
export interface Door {
  sizeType: string;
  standardSize: string;
  price?: number;
  custom: { height: string; width: string; price?: number };
  type: string;
  count: number;
  wallThickness: number;
  frame: {
    type: string;
    price?: number;
    sizeType: string;
    standardSize: string;
    height: string;
    width: string;
    thickness?: string;
    custom: { height: string; width: string; price?: number };
  };
  architrave?: {
    selected?: { type?: string; size?: string };
    customSize?: string;
    quantity?: number;
    price?: number;
  };
  quarterRound?: {
    selected?: { type?: string; size?: string };
    customSize?: string;
    quantity?: number;
    price?: number;
  };
  ironmongery?: {
    hinges?: {
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number;
      price?: number;
      enabled?: boolean;
    };
    locks?: {
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number;
      price?: number;
      enabled?: boolean;
    };
    handles?: {
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number;
      price?: number;
      enabled?: boolean;
    };
    bolts?: {
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number;
      price?: number;
      enabled?: boolean;
    };
    closers?: {
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number;
      price?: number;
      enabled?: boolean;
    };
  };
  transom?: {
    enabled?: boolean;
    height?: string;
    width?: string;
    quantity?: number;
    price?: number;
    glazing?: {
      included?: boolean;
      glassAreaM2?: number;
      glassPricePerM2?: number;
    };
  };
}

export interface Window {
  sizeType: string;
  standardSize: string;
  price?: number;
  custom: { height: string; width: string; price?: number };
  type: string;
  count: number;
  wallThickness?: number;
  frame: {
    type: string;
    price?: number;
    sizeType: string;
    standardSize: string;
    height: string;
    width: string;
    thickness?: string;
    custom: { height: string; width: string; price?: number };
  };
  ironmongery?: {
    hinges?: {
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number;
      price?: number;
      enabled?: boolean;
    };
    locks?: {
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number;
      price?: number;
      enabled?: boolean;
    };
    handles?: {
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number;
      price?: number;
      enabled?: boolean;
    };
    bolts?: {
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number;
      price?: number;
      enabled?: boolean;
    };
    closers?: {
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number;
      price?: number;
      enabled?: boolean;
    };
  };
  glazing?: {
    glass?: {
      type?: string;
      thickness?: number;
      quantity?: number;
      pricePerM2?: number;
    };
    putty?: {
      quantity?: number;
      unit?: string;
      price?: number;
      size?: string;
      color?: string;
      lengthNeeded?: number;
      tinsNeeded?: number;
    };
  };
  glassType?: string;
  glassThickness?: number;
  span?: number;
  isGlassUnderSized?: boolean;
  recommendedGlassThickness?: number;
}

export const getRecommendedGlassThickness = (spanM: number): number => {
  if (spanM <= 1.2) return 3;
  if (spanM <= 1.5) return 4;
  if (spanM <= 2.0) return 5;
  if (spanM <= 2.4) return 6;
  if (spanM <= 3.0) return 8;
  if (spanM <= 3.6) return 10;
  return 12;
};

export const isGlassThicknessSufficient = (
  spanM: number,
  thicknessMm: number,
): boolean => {
  return thicknessMm >= getRecommendedGlassThickness(spanM);
};

// Wall dimension interface - core of new structure
export interface Dimensions {
  externalWallPerimiter: number;
  internalWallPerimiter: number;
  externalWallHeight: number;
  internalWallHeight: number;
  length: number;
  width: number;
}

// Wall section with doors/windows
export interface WallSection {
  type: "external" | "internal";
  doors: Door[];
  windows: Window[];
  blockType?: string;
  thickness?: number;
  plaster?: "None" | "One Side" | "Both Sides";
  customBlockName?: string;
  customBlockLength?: number;
  customBlockHeight?: number;
  customBlockPrice?: number;
}

// Wall properties (shared across all walls)
export interface WallProperties {
  externalBlockType: string;
  internalBlockType: string;
  plaster: "None" | "One Side" | "Both Sides";
}

// Professional elements interfaces
export interface Lintel {
  length: number;
  width: number;
  depth: number;
  reinforcement: number;
  concrete: number;
}

export interface Reinforcement {
  bedJoint: { length: number; spacing: number };
  verticalReinforcement: { bars: number; length: number };
}

export interface DPC {
  length: number;
  width: number;
  material: string;
}

export interface DPCPricing {
  type: string;
  sizes_m: string[];
  price_kes: Record<string, number>;
  thickness_mm: number[];
}

export interface MovementJoint {
  length: number;
  material: string;
  sealant: number;
}

export interface Scaffolding {
  area: number;
  duration: number;
}

export interface WasteRemoval {
  volume: number;
  skipHire: number;
}

export interface MasonryQSSettings {
  wastageConcrete: number;
  wastageReinforcement: number;
  wastageMasonry: number;
  wastageRoofing: number;
  wastageFinishes: number;
  wastageFinishesFlooring: number;
  wastageFinishesWalls: number;
  wastageFinishesCeiling: number;
  wastageFinishesOthers: number;
  wastageElectricals: number;
  labour_fixed: number;
  overhead_fixed: number;
  profit_fixed: number;
  contingency_fixed: number;
  permit_cost_fixed: number;
  unknowns_contingency_fixed: number;
  financialModes: {
    labour: "percentage" | "fixed";
    overhead: "percentage" | "fixed";
    profit: "percentage" | "fixed";
    contingency: "percentage" | "fixed";
    permit_cost: "percentage" | "fixed";
    unknowns_contingency: "percentage" | "fixed";
  };
  wastageWater: number;
  wastagePlumbing: number;
  clientProvidesWater: boolean;
  cementWaterRatio: string;
  sandMoistureContentPercent: number;
  otherSiteWaterAllowanceLM3: number;
  aggregateMoistureContentPercent: number;
  aggregateAbsorptionPercent: number;
  curingWaterRateLM2PerDay: number;
  curingDays: number;
  mortarJointThicknessM: number;
  includesLintels: boolean;
  includesReinforcement: boolean;
  includesDPC: boolean;
  includesScaffolding: boolean;
  includesMovementJoints: boolean;
  includesWasteRemoval: boolean;
  includesRingBeams?: boolean;
  lintelDepth: number;
  lintelWidth: number;
  ringBeamDepth?: number;
  ringBeamWidth?: number;
  reinforcementSpacing: number;
  verticalReinforcementSpacing: number;
  DPCWidth: number;
  movementJointSpacing: number;
  scaffoldingDailyRate: number;
  wasteRemovalRate: number;
  concreteMixRatio: string;
  concreteWaterCementRatio: number;
  lintelRebarSize: RebarSize;
  verticalRebarSize: RebarSize;
  bedJointRebarSize: RebarSize;
  ringBeamRebarSize?: RebarSize;
  ringBeamMainBarsCount?: number;
  ringBeamStirrupSize?: RebarSize;
  ringBeamStirrupSpacing?: number;
  developmentLengthFactor?: number;
  lapLengthFactor?: number;
  mortarRatio?: string;
  plaster_ratio?: string;
}

export const REBAR_WEIGHTS: Record<RebarSize, number> = {
  R6: 0.222,
  D6: 0.222,
  D8: 0.395,
  D10: 0.617,
  D12: 0.888,
  D14: 1.21,
  D16: 1.579,
  D18: 2.0,
  D20: 2.466,
  D22: 2.98,
  D25: 3.855,
  D28: 4.834,
  D32: 6.313,
  D36: 8.0,
  D40: 9.864,
  D50: 15.41,
};

interface CalculationTotals {
  netArea: number;
  netBlocks: number;
  netBlocksFeet: number;
  netMortar: number;
  netPlaster: number;
  netCement: number;
  netSand: number;
  netWater: number;
  netDoors: number;
  netWindows: number;
  netDoorFrames: number;
  netWindowFrames: number;
  grossArea: number;
  grossBlocks: number;
  grossBlocksFeet: number;
  grossMortar: number;
  grossPlaster: number;
  grossCement: number;
  grossSand: number;
  grossWater: number;
  grossDoors: number;
  grossWindows: number;
  grossDoorFrames: number;
  grossWindowFrames: number;
  netBlocksCost: number;
  netMortarCost: number;
  netPlasterCost: number;
  netWaterCost: number;
  netDoorsCost: number;
  netWindowsCost: number;
  netDoorFramesCost: number;
  netWindowFramesCost: number;
  netOpeningsCost: number;
  netTotalCost: number;
  grossBlocksCost: number;
  grossMortarCost: number;
  grossPlasterCost: number;
  grossWaterCost: number;
  grossDoorsCost: number;
  grossWindowsCost: number;
  grossDoorFramesCost: number;
  grossWindowFramesCost: number;
  grossOpeningsCost: number;
  grossTotalCost: number;
  waterPrice: number;
  netConcrete: number;
  grossConcrete: number;
  netConcreteCement: number;
  grossConcreteCement: number;
  netConcreteSand: number;
  grossConcreteSand: number;
  netReinforcementKg: number;
  netReinforcementBars: number;
  grossReinforcementKg: number;
  grossReinforcementBars: number;
  netConcreteBallast: number;
  netDPC: number;
  grossDPC: number;
  netSealantLiters: number;
  grossSealantLiters: number;
  grossConcreteBallast: number;
  netConcreteWater: number;
  grossConcreteWater: number;
  breakdown: any[];
  netLintelsCost: number;
  grossLintelsCost: number;
  netLintelRebar: number;
  grossLintelRebar: number;
  netLintelRebarCost: number;
  grossLintelRebarCost: number;
  netLintelConcrete?: number;
  grossLintelConcrete?: number;
  netRingBeamsCost?: number;
  grossRingBeamsCost?: number;
  netRingBeamRebar?: number;
  grossRingBeamRebar?: number;
  netRingBeamRebarCost?: number;
  grossRingBeamRebarCost?: number;
  netRingBeamConcrete?: number;
  grossRingBeamConcrete?: number;
  netWallRebar: number;
  grossWallRebar: number;
  netWallRebarCost: number;
  grossWallRebarCost: number;
  netDPCArea: number;
  grossDPCArea: number;
  netDPCCost: number;
  grossDPCCost: number;
  netMovementJoints: number;
  grossMovementJoints: number;
  netMovementJointsCost: number;
  grossMovementJointsCost: number;
  netScaffoldingArea: number;
  grossScaffoldingArea: number;
  netScaffoldingCost: number;
  grossScaffoldingCost: number;
  netWasteVolume: number;
  grossWasteVolume: number;
  netWasteRemovalCost: number;
  grossWasteRemovalCost: number;
  netDoorArchitraveCost: number;
  grossDoorArchitraveCost: number;
  netWindowArchitraveCost: number;
  grossWindowArchitraveCost: number;
  netDoorArchitraveQty: number;
  grossDoorArchitraveQty: number;
  netWindowArchitraveQty: number;
  grossWindowArchitraveQty: number;
  netDoorQuarterRoundCost: number;
  grossDoorQuarterRoundCost: number;
  netDoorQuarterRoundQty: number;
  grossDoorQuarterRoundQty: number;
  netDoorIronmongCost: number;
  grossDoorIronmongCost: number;
  netDoorIronmongQty: number;
  grossDoorIronmongQty: number;
  netDoorTransomCost: number;
  grossDoorTransomCost: number;
  netDoorTransomQty: number;
  grossDoorTransomQty: number;
  netWindowGlassArea: number;
  grossWindowGlassArea: number;
  netWindowPuttyLength: number;
  grossWindowPuttyLength: number;
  netWindowGlassCost: number;
  grossWindowGlassCost: number;
  netWindowPuttyCost: number;
  grossWindowPuttyCost: number;
  netTransomGlassArea: number;
  grossTransomGlassArea: number;
  netTransomPuttyLength: number;
  grossTransomPuttyLength: number;
  netTransomGlassCost: number;
  grossTransomGlassCost: number;
  netTransomPuttyCost: number;
  grossTransomPuttyCost: number;
  professionalElementsTotalCost: number;
  hoopIronLength: number;
  hoopIronCoils: number;
}

interface UseMasonryCalculatorProps {
  setQuote: (updater: any) => void;
  quote: any;
  materialBasePrices: any[];
  userMaterialPrices: any[];
  regionalMultipliers: any[];
  userRegion: string;
  getEffectiveMaterialPrice: (
    materialId: string,
    userRegion: string,
    userOverride: any,
    materialBasePrices: any[],
    regionalMultipliers: any[],
  ) => any;
}

export default function useMasonryCalculatorNew({
  setQuote,
  quote,
  materialBasePrices,
  userMaterialPrices,
  regionalMultipliers,
  userRegion,
  getEffectiveMaterialPrice,
}: UseMasonryCalculatorProps) {
  const { user, profile } = useAuth();
  const PLASTER_THICKNESS = 0.015;
  const CEMENT_DENSITY = 1440;
  const MORTAR_PER_SQM = 0.017;
  const SAND_DENSITY = 1600;
  const CEMENT_BAG_KG = 50;
  const METERS_TO_FEET = 3.28084;

  // State
  const [results, setResults] = useState<CalculationTotals>({
    netArea: 0,
    netBlocks: 0,
    netBlocksFeet: 0,
    netMortar: 0,
    netPlaster: 0,
    netCement: 0,
    netSand: 0,
    netWater: 0,
    netDoors: 0,
    netWindows: 0,
    netDoorFrames: 0,
    netWindowFrames: 0,
    netReinforcementKg: 0,
    netReinforcementBars: 0,
    grossReinforcementKg: 0,
    grossReinforcementBars: 0,
    netDPC: 0,
    grossDPC: 0,
    netSealantLiters: 0,
    grossSealantLiters: 0,
    grossArea: 0,
    grossBlocks: 0,
    grossBlocksFeet: 0,
    grossMortar: 0,
    grossPlaster: 0,
    grossCement: 0,
    grossSand: 0,
    grossWater: 0,
    grossDoors: 0,
    grossWindows: 0,
    grossDoorFrames: 0,
    grossWindowFrames: 0,
    netBlocksCost: 0,
    netMortarCost: 0,
    netPlasterCost: 0,
    netWaterCost: 0,
    netDoorsCost: 0,
    netWindowsCost: 0,
    netDoorFramesCost: 0,
    netWindowFramesCost: 0,
    netOpeningsCost: 0,
    netTotalCost: 0,
    grossBlocksCost: 0,
    grossMortarCost: 0,
    grossPlasterCost: 0,
    grossWaterCost: 0,
    grossDoorsCost: 0,
    grossWindowsCost: 0,
    grossDoorFramesCost: 0,
    grossWindowFramesCost: 0,
    grossOpeningsCost: 0,
    grossTotalCost: 0,
    waterPrice: 0,
    netConcrete: 0,
    grossConcrete: 0,
    netConcreteCement: 0,
    grossConcreteCement: 0,
    netConcreteSand: 0,
    grossConcreteSand: 0,
    netConcreteBallast: 0,
    grossConcreteBallast: 0,
    netConcreteWater: 0,
    grossConcreteWater: 0,
    breakdown: [],
    netLintelsCost: 0,
    grossLintelsCost: 0,
    netLintelRebar: 0,
    grossLintelRebar: 0,
    netLintelRebarCost: 0,
    grossLintelRebarCost: 0,
    netLintelConcrete: 0,
    grossLintelConcrete: 0,
    netRingBeamsCost: 0,
    grossRingBeamsCost: 0,
    netRingBeamRebar: 0,
    grossRingBeamRebar: 0,
    netRingBeamRebarCost: 0,
    grossRingBeamRebarCost: 0,
    netRingBeamConcrete: 0,
    grossRingBeamConcrete: 0,
    netWallRebar: 0,
    grossWallRebar: 0,
    netWallRebarCost: 0,
    grossWallRebarCost: 0,
    netDPCArea: 0,
    grossDPCArea: 0,
    netDPCCost: 0,
    grossDPCCost: 0,
    netMovementJoints: 0,
    grossMovementJoints: 0,
    netMovementJointsCost: 0,
    grossMovementJointsCost: 0,
    netScaffoldingArea: 0,
    grossScaffoldingArea: 0,
    netScaffoldingCost: 0,
    grossScaffoldingCost: 0,
    netWasteVolume: 0,
    grossWasteVolume: 0,
    netWasteRemovalCost: 0,
    grossWasteRemovalCost: 0,
    professionalElementsTotalCost: 0,
    netDoorArchitraveCost: 0,
    grossDoorArchitraveCost: 0,
    netWindowArchitraveCost: 0,
    grossWindowArchitraveCost: 0,
    netDoorArchitraveQty: 0,
    grossDoorArchitraveQty: 0,
    netWindowArchitraveQty: 0,
    grossWindowArchitraveQty: 0,
    netDoorQuarterRoundCost: 0,
    grossDoorQuarterRoundCost: 0,
    netDoorQuarterRoundQty: 0,
    grossDoorQuarterRoundQty: 0,
    netDoorIronmongCost: 0,
    grossDoorIronmongCost: 0,
    netDoorIronmongQty: 0,
    grossDoorIronmongQty: 0,
    netDoorTransomCost: 0,
    grossDoorTransomCost: 0,
    netDoorTransomQty: 0,
    grossDoorTransomQty: 0,
    netWindowGlassArea: 0,
    grossWindowGlassArea: 0,
    netWindowPuttyLength: 0,
    grossWindowPuttyLength: 0,
    netWindowGlassCost: 0,
    grossWindowGlassCost: 0,
    netWindowPuttyCost: 0,
    grossWindowPuttyCost: 0,
    netTransomGlassArea: 0,
    grossTransomGlassArea: 0,
    netTransomPuttyLength: 0,
    grossTransomPuttyLength: 0,
    netTransomGlassCost: 0,
    grossTransomGlassCost: 0,
    netTransomPuttyCost: 0,
    grossTransomPuttyCost: 0,
    hoopIronLength: 0,
    hoopIronCoils: 0,
  });

  const [rebarPrices, setRebarPrices] = useState<PriceMap>({} as PriceMap);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Get data from quote
  const wallDimensions = quote?.wallDimensions as Dimensions | undefined;
  const wallSections = quote?.wallSections as WallSection[] | undefined;
  const wallProperties = (quote?.wallProperties || {}) as WallProperties;
  const qsSettings = quote?.qsSettings as MasonryQSSettings | undefined;

  const blockTypes = [
    {
      id: 1,
      name: "Large Block",
      dimensions_m: {
        length: 0.2,
        height: 0.2,
        thickness: 0.2,
      },
    },
    {
      id: 2,
      name: "Standard Block",
      dimensions_m: {
        length: 0.15,
        height: 0.2,
        thickness: 0.15,
      },
    },
    {
      id: 3,
      name: "Small Block",
      dimensions_m: {
        length: 0.1,
        height: 0.2,
        thickness: 0.1,
      },
    },
    {
      id: 4,
      name: "Standard Natural Block",
      dimensions_m: {
        length: 0.15,
        height: 0.2,
        thickness: 0.15,
      },
    },

    { id: 4, name: "Custom", size: null, volume: 0 },
  ];

  // ============ HELPER FUNCTIONS ============

  const parseSize = useCallback((str: string): number => {
    if (!str) return 0;
    const cleaned = str.replace(/[Ã—x]/g, "x").replace(/[^\d.x]/g, "");
    const [w, h] = cleaned.split("x").map((s) => parseFloat(s.trim()));
    if (isNaN(w) || isNaN(h)) return 0;
    return w * h;
  }, []);

  const parseCementWaterRatio = useCallback((ratio: string): number => {
    const parsed = parseFloat(ratio);
    return isNaN(parsed) || parsed <= 0 ? 0.5 : parsed;
  }, []);

  const parseConcreteMixRatio = useCallback((ratio: string) => {
    const parts = ratio.split(":").map((part) => parseFloat(part.trim()));
    if (parts.length !== 3 || parts.some(isNaN)) {
      return { cement: 1, sand: 2, ballast: 4 };
    }
    return { cement: parts[0], sand: parts[1], ballast: parts[2] };
  }, []);

  const calculateConcreteMaterials = useCallback(
    (volume: number, mixRatio: string, waterCementRatio: number) => {
      const ratio = parseConcreteMixRatio(mixRatio);
      const totalParts = ratio.cement + ratio.sand + ratio.ballast;
      const cementVolume = (ratio.cement / totalParts) * volume * 1.54;
      const sandVolume = (ratio.sand / totalParts) * volume * 1.54;
      const ballastVolume = (ratio.ballast / totalParts) * volume * 1.54;
      const cementBags = cementVolume / 0.035;
      const cementWeight = cementBags * 50;
      const waterLiters = cementWeight * waterCementRatio * 1.54;
      return {
        cementBags,
        sand: sandVolume,
        ballast: ballastVolume,
        water: waterLiters,
      };
    },
    [parseConcreteMixRatio],
  );

  const getRebarWeight = useCallback(
    (length: number, size: RebarSize): number => {
      return length * REBAR_WEIGHTS[size];
    },
    [],
  );

  // ============ WALL DIMENSION VALIDATION ============

  const validateWallDimensions = useCallback(
    (dims: Dimensions | undefined): boolean => {
      if (!dims) return false;
      const values = [
        dims.externalWallPerimiter,
        dims.internalWallPerimiter,
        dims.externalWallHeight,
        dims.internalWallHeight,
      ];
      return values.every(
        (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 1000,
      );
    },
    [],
  );

  // ============ WALL CALCULATIONS ============

  const calculateWallAreas = useCallback(
    (
      dims: Dimensions | undefined,
    ): { external: number; internal: number; total: number } => {
      if (!validateWallDimensions(dims)) {
        return { external: 0, internal: 0, total: 0 };
      }
      const externalArea =
        Number(dims!.externalWallPerimiter) * Number(dims!.externalWallHeight);
      const internalArea =
        Number(dims!.internalWallPerimiter) * Number(dims!.internalWallHeight);
      return {
        external: externalArea,
        internal: internalArea,
        total: externalArea + internalArea,
      };
    },
    [validateWallDimensions],
  );

  const calculateOpeningsAreaFromSections = useCallback(
    (sections: WallSection[] | undefined): number => {
      if (!sections || sections.length === 0) return 0;
      let totalOpeningsArea = 0;
      sections.forEach((section) => {
        section.doors.forEach((door) => {
          const area =
            door.sizeType === "standard"
              ? parseSize(door.standardSize)
              : Number(door.custom.height) * Number(door.custom.width);
          totalOpeningsArea += (area || 0) * door.count;
        });
        section.windows.forEach((window) => {
          const area =
            window.sizeType === "standard"
              ? parseSize(window.standardSize)
              : Number(window.custom.height) * Number(window.custom.width);
          totalOpeningsArea += (area || 0) * window.count;
        });
      });
      return totalOpeningsArea;
    },
    [parseSize],
  );

  // ============ CENTER LINE METHOD FOR BRICK CALCULATION ============

  interface BrickCalculationResult {
    wallType: "external" | "internal";
    perimeter: number;
    centerLine: number;
    height: number;
    thickness: number;
    blockType: string;
    blockLength: number;
    blockHeight: number;
    mortarJoint: number;
    blockArea: number;
    grossArea: number;
    grossBricks: number;
    netBricks: number;
  }

  let thickness = 0.15; // Default thickness, will be updated based on block type

  const calculateBricksUsingCenterLineMethod = useCallback(
    (
      dims: Dimensions | undefined,
      sections: WallSection[] | undefined,
      properties: WallProperties,
    ): BrickCalculationResult[] => {
      if (!validateWallDimensions(dims)) return [];

      const results: BrickCalculationResult[] = [];
      const joint = qsSettings?.mortarJointThicknessM || 0.01;

      // Process external walls
      if (dims!.externalWallPerimiter > 0 && dims!.externalWallHeight > 0) {
        const blockType = properties.externalBlockType || "Standard Block";
        const blockDef = blockTypes.find((b) => b.name === blockType);
        const blockLength = blockDef?.size?.length || 0.4;
        const blockHeight = blockDef?.size?.height || 0.2;

        // Center line method: average of inner and outer perimeters
        // For external walls: centerLine = perimeter (as we're measuring from external face)
        const centerLine = dims!.externalWallPerimiter;
        const height = dims!.externalWallHeight;

        // Gross area from center line
        const grossArea = centerLine * height;

        // Block area including mortar joint
        const blockArea = (blockLength + joint) * (blockHeight + joint);

        // Calculate gross bricks (full area)
        const grossBricks = Math.ceil(grossArea / blockArea);

        // Calculate net bricks (deduct openings)
        const externalOpeningsArea =
          sections
            ?.filter((s) => s.type === "external")
            .reduce((sum, section) => {
              let area = 0;
              section.doors.forEach((door) => {
                const doorArea =
                  door.sizeType === "standard"
                    ? parseSize(door.standardSize)
                    : Number(door.custom.height) * Number(door.custom.width);
                area += (doorArea || 0) * door.count;
              });
              section.windows.forEach((window) => {
                const windowArea =
                  window.sizeType === "standard"
                    ? parseSize(window.standardSize)
                    : Number(window.custom.height) *
                      Number(window.custom.width);
                area += (windowArea || 0) * window.count;
              });
              return sum + area;
            }, 0) || 0;

        const netArea = Math.max(0, grossArea - externalOpeningsArea);
        const netBricks = Math.ceil(netArea / blockArea);
        thickness = blockDef?.size?.thickness || 0.15;

        results.push({
          wallType: "external",
          perimeter: dims!.externalWallPerimiter,
          centerLine,
          height,
          thickness,
          blockType,
          blockLength,
          blockHeight,
          mortarJoint: joint,
          blockArea,
          grossArea,
          grossBricks,
          netBricks,
        });
      }

      // Process internal walls
      if (dims!.internalWallPerimiter > 0 && dims!.internalWallHeight > 0) {
        const blockType = properties.internalBlockType || "Standard Block";
        const blockDef = blockTypes.find((b) => b.name === blockType);
        const blockLength = blockDef?.size?.length || 0.4;
        const blockHeight = blockDef?.size?.height || 0.2;

        // Center line method for internal walls
        const centerLine = dims!.internalWallPerimiter;
        const height = dims!.internalWallHeight;

        // Gross area from center line
        const grossArea = centerLine * height;

        // Block area including mortar joint
        const blockArea = (blockLength + joint) * (blockHeight + joint);

        // Calculate gross bricks (full area)
        const grossBricks = Math.ceil(grossArea / blockArea);

        // Calculate net bricks (deduct openings)
        const internalOpeningsArea =
          sections
            ?.filter((s) => s.type === "internal")
            .reduce((sum, section) => {
              let area = 0;
              section.doors.forEach((door) => {
                const doorArea =
                  door.sizeType === "standard"
                    ? parseSize(door.standardSize)
                    : Number(door.custom.height) * Number(door.custom.width);
                area += (doorArea || 0) * door.count;
              });
              section.windows.forEach((window) => {
                const windowArea =
                  window.sizeType === "standard"
                    ? parseSize(window.standardSize)
                    : Number(window.custom.height) *
                      Number(window.custom.width);
                area += (windowArea || 0) * window.count;
              });
              return sum + area;
            }, 0) || 0;

        const netArea = Math.max(0, grossArea - internalOpeningsArea);
        const netBricks = Math.ceil(netArea / blockArea);
        thickness = blockDef?.size?.thickness || 0.15;

        results.push({
          wallType: "internal",
          perimeter: dims!.internalWallPerimiter,
          centerLine,
          height,
          thickness,
          blockType,
          blockLength,
          blockHeight,
          mortarJoint: joint,
          blockArea,
          grossArea,
          grossBricks,
          netBricks,
        });
      }

      return results;
    },
    [
      blockTypes,
      qsSettings?.mortarJointThicknessM,
      validateWallDimensions,
      parseSize,
    ],
  );

  // ============ MATERIAL PRICES ============

  const getMaterialPrice = useCallback(
    (materialName: string, specificType?: string): number => {
      if (!materialBasePrices || materialBasePrices.length === 0) return 0;
      const material = materialBasePrices.find(
        (m) => m.name && m.name.toLowerCase() === materialName.toLowerCase(),
      );
      if (!material) return 0;
      const userOverride = userMaterialPrices.find(
        (p) => p.material_id === material.id && p.region === userRegion,
      );
      const effectiveMaterial = getEffectiveMaterialPrice(
        material.id,
        userRegion,
        userOverride,
        materialBasePrices,
        regionalMultipliers,
      );
      if (!effectiveMaterial) return 0;
      if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
        const type = specificType
          ? effectiveMaterial.type.find(
              (t: any) => t.name === specificType || t.type === specificType,
            )
          : effectiveMaterial.type[0];
        return type?.price_kes || 0;
      }
      return effectiveMaterial.price_kes || 0;
    },
    [
      materialBasePrices,
      userRegion,
      userMaterialPrices,
      regionalMultipliers,
      getEffectiveMaterialPrice,
    ],
  );

  const getDPCPrice = useCallback(
    (dpcArea: number, dpcType: string = "Polyethylene"): number => {
      if (!materialBasePrices || materialBasePrices.length === 0) return 0;
      const dpcMaterial = materials.find((m) =>
        m.name?.toLowerCase().includes("dpc"),
      )?.type;
      if (!dpcMaterial) return 0;
      return dpcArea * (dpcMaterial[dpcType] || 0);
    },
    [materialBasePrices, materials],
  );

  const fetchMaterials = useCallback(async () => {
    if (!profile?.id) return;
    const { data: baseMaterials, error: baseError } = await supabase
      .from("material_base_prices")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_material_prices")
      .select("material_id, region, price")
      .eq("user_id", profile.id);
    if (baseError || overrideError) {
      console.error("Error fetching materials:", baseError || overrideError);
      return;
    }
    const merged =
      baseMaterials?.map((material) => {
        const userRegionVal = profile?.location || "Nairobi";
        const userRate = overrides?.find(
          (o) => o.material_id === material.id && o.region === userRegionVal,
        );
        const multiplier =
          regionalMultipliers.find((r) => r.region === userRegionVal)
            ?.multiplier || 1;
        const materialPrice = (material.price || 0) * multiplier;
        return {
          ...material,
          price: userRate ? userRate.price : materialPrice,
          region: userRegionVal,
          source: userRate ? "user" : material.price != null ? "base" : "none",
        };
      }) || [];
    setMaterials(merged);
  }, [profile, regionalMultipliers]);

  const getRebarPrice = useCallback(
    async (size: RebarSize): Promise<number> => {
      try {
        if (!profile?.id) return 0;
        const { data: baseMaterial } = await supabase
          .from("material_base_prices")
          .select("type")
          .eq("name", "Rebar")
          .single();
        if (!baseMaterial?.type) return 0;
        const rebarType = (baseMaterial.type as any[]).find(
          (t: any) => t.size === size,
        );
        return rebarType?.price_kes_per_kg || 0;
      } catch (error) {
        console.error("Error getting rebar price:", error);
        return 0;
      }
    },
    [profile?.id],
  );

  // ============ WALL MANAGEMENT FUNCTIONS ============

  const updateWallDimensions = (dimensions: Partial<Dimensions>) => {
    setQuote((prev: any) => ({
      ...prev,
      wallDimensions: { ...prev.wallDimensions, ...dimensions },
    }));
  };

  const updateWallProperties = (props: Partial<WallProperties>) => {
    setQuote((prev: any) => ({
      ...prev,
      wallProperties: { ...prev.wallProperties, ...props },
    }));
  };

  const addWallSection = (type: "external" | "internal") => {
    setQuote((prev: any) => ({
      ...prev,
      wallSections: [
        ...(prev.wallSections || []),
        { type, doors: [], windows: [], plaster: "Both Sides" },
      ],
    }));
  };

  const removeWallSection = (index: number) => {
    setQuote((prev: any) => ({
      ...prev,
      wallSections: (prev.wallSections || []).filter(
        (_: any, i: number) => i !== index,
      ),
    }));
  };

  const addDoorToSection = (sectionIndex: number) => {
    setQuote((prev: any) => {
      const sections = [...(prev.wallSections || [])];
      const section = sections[sectionIndex];
      sections[sectionIndex].doors.push({
        sizeType: "standard",
        standardSize: "0.9 × 2.1 m",
        price: 0,
        custom: { height: "2.1", width: "0.9", price: 0 },
        type: "Panel",
        count: 1,
        wallThickness: section.thickness || 0.2,
        frame: {
          type: "Wood",
          price: 0,
          sizeType: "standard",
          standardSize: "0.9 × 2.1 m",
          height: "2.1",
          width: "0.9",
          custom: { height: "2.1", width: "0.9", price: 0 },
        },
        architrave: {
          selected: { type: "", size: "" },
          quantity: 0,
          price: 0,
        },
        quarterRound: {
          selected: { type: "", size: "" },
          quantity: 0,
          price: 0,
        },
        ironmongery: {
          hinges: {
            selected: { type: "", size: "" },
            quantity: 0,
            price: 0,
          },
          locks: {
            selected: { type: "", size: "" },
            quantity: 0,
            price: 0,
          },
          handles: {
            selected: { type: "", size: "" },
            quantity: 0,
            price: 0,
          },
          bolts: {
            selected: { type: "", size: "" },
            quantity: 0,
            price: 0,
          },
          closers: {
            selected: { type: "", size: "" },
            quantity: 0,
            price: 0,
          },
        },
        transom: {
          enabled: false,
          height: "",
          width: "",
          quantity: 0,
          price: 0,
          glazing: {
            included: false,
            glassAreaM2: 0,
            puttyLengthM: 0,
            glassPricePerM2: 0,
            puttyPricePerM: 0,
          },
        },
      });
      return { ...prev, wallSections: sections };
    });
  };

  const addWindowToSection = (sectionIndex: number) => {
    setQuote((prev: any) => {
      const sections = [...(prev.wallSections || [])];
      const section = sections[sectionIndex];
      sections[sectionIndex].windows.push({
        sizeType: "standard",
        standardSize: "1.2 × 1.2 m",
        price: 0,
        custom: { height: "1.2", width: "1.2", price: 0 },
        type: "Clear",
        count: 1,
        wallThickness: section.thickness || 0.2,
        frame: {
          type: "Steel",
          price: 0,
          sizeType: "standard",
          standardSize: "1.2 × 1.2 m",
          height: "1.2",
          width: "1.2",
          custom: { height: "1.2", width: "1.2", price: 0 },
        },
        architrave: {
          selected: { type: "", size: "" },
          quantity: 0,
          price: 0,
        },
        quarterRound: {
          selected: { type: "", size: "" },
          quantity: 0,
          price: 0,
        },
        ironmongery: {
          hinges: {
            selected: { type: "", size: "" },
            quantity: 0,
            price: 0,
          },
          locks: {
            selected: { type: "", size: "" },
            quantity: 0,
            price: 0,
          },
          handles: {
            selected: { type: "", size: "" },
            quantity: 0,
            price: 0,
          },
          bolts: {
            selected: { type: "", size: "" },
            quantity: 0,
            price: 0,
          },
          closers: {
            selected: { type: "", size: "" },
            quantity: 0,
            price: 0,
          },
        },
        glassType: "Clear",
        glassThickness: 3,
        span: 1.2,
        isGlassUnderSized: false,
        recommendedGlassThickness: 3,
        glazing: {
          glass: {
            type: "Clear",
            thickness: 3,
            quantity: 1,
            pricePerM2: 0,
          },
          putty: {
            quantity: 0,
            unit: "m",
            price: 0,
          },
        },
      });
      return { ...prev, wallSections: sections };
    });
  };

  const removeDoorFromSection = (sectionIndex: number, doorIndex: number) => {
    setQuote((prev: any) => {
      const sections = [...(prev.wallSections || [])];
      sections[sectionIndex].doors.splice(doorIndex, 1);
      return { ...prev, wallSections: sections };
    });
  };

  const removeWindowFromSection = (
    sectionIndex: number,
    windowIndex: number,
  ) => {
    setQuote((prev: any) => {
      const sections = [...(prev.wallSections || [])];
      sections[sectionIndex].windows.splice(windowIndex, 1);
      return { ...prev, wallSections: sections };
    });
  };

  const updateDoorInSection = (
    sectionIndex: number,
    doorIndex: number,
    field: string,
    value: any,
  ) => {
    setQuote((prev: any) => {
      const sections = [...(prev.wallSections || [])];
      const door = { ...sections[sectionIndex].doors[doorIndex] };
      if (field.startsWith("frame.")) {
        door.frame = { ...door.frame, [field.split(".")[1]]: value };
      } else if (field.startsWith("custom.")) {
        door.custom = { ...door.custom, [field.split(".")[1]]: value };
      } else {
        door[field] = value;
      }
      sections[sectionIndex].doors[doorIndex] = door;
      return { ...prev, wallSections: sections };
    });
  };

  const updateWindowInSection = (
    sectionIndex: number,
    windowIndex: number,
    field: string,
    value: any,
  ) => {
    setQuote((prev: any) => {
      const sections = [...(prev.wallSections || [])];
      const window = { ...sections[sectionIndex].windows[windowIndex] };
      if (field.startsWith("frame.")) {
        window.frame = { ...window.frame, [field.split(".")[1]]: value };
      } else if (field.startsWith("custom.")) {
        window.custom = { ...window.custom, [field.split(".")[1]]: value };
      } else {
        window[field] = value;
      }
      sections[sectionIndex].windows[windowIndex] = window;
      return { ...prev, wallSections: sections };
    });
  };

  const updateWallSectionProperties = (
    sectionIndex: number,
    properties: Partial<WallSection>,
  ) => {
    setQuote((prev: any) => {
      const sections = [...(prev.wallSections || [])];
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        ...properties,
      };
      return { ...prev, wallSections: sections };
    });
  };

  // ============ PRICE CALCULATION FUNCTIONS ============

  const calculateDoorPrice = useCallback(
    (door: any): number => {
      if (!door) return 0;
      const customPrice = Number(door.custom?.price ?? door.price);
      if (Number.isFinite(customPrice) && customPrice > 0) return customPrice;
      const doorTypeMap: Record<string, string> = {
        Steel: "Metal",
        "Solid flush": "Flush",
        "Semi-solid flush": "Flush",
        Panel: "Panel",
        "T&G": "Flush",
      };
      const mappedType = doorTypeMap[door.type] || door.type;
      const doorMaterial = materialBasePrices?.find(
        (m) => m.name?.toLowerCase() === "doors",
      );
      if (!doorMaterial) return 0;
      const typeItem = doorMaterial.type?.find(
        (t: any) => t.name === mappedType,
      );
      if (!typeItem) return 0;
      const price = typeItem[door.standardSize];
      return Number.isFinite(Number(price)) ? Number(price) : 0;
    },
    [materialBasePrices],
  );

  const calculateFramePrice = useCallback(
    (frame: any, wallThickness: number): number => {
      if (!frame) return 0;
      const customPrice = Number(frame.custom?.price ?? frame.price);
      if (Number.isFinite(customPrice) && customPrice > 0) return customPrice;
      const frameMaterial = materialBasePrices?.find(
        (m) => m.name?.toLowerCase() === "door frames",
      );
      if (!frameMaterial) return 0;
      const frameType = frame.type || "Wood";
      const typeItem = frameMaterial.type?.find(
        (t: any) => t.name === frameType,
      );
      if (!typeItem) return 0;
      const price = typeItem[frame.standardSize];
      return Number.isFinite(Number(price)) ? Number(price) : 0;
    },
    [materialBasePrices],
  );

  const calculateWindowPrice = useCallback(
    (window: any): number => {
      if (!window) return 0;
      const customPrice = Number(window.custom?.price ?? window.price);
      if (Number.isFinite(customPrice) && customPrice > 0) return customPrice;
      const windowMaterial = materialBasePrices?.find(
        (m) => m.name?.toLowerCase() === "windows",
      );
      if (!windowMaterial) return 0;
      const typeItem = windowMaterial.type?.find(
        (t: any) => t.name === "Standard",
      );
      if (!typeItem) return 0;
      const price = typeItem[window.standardSize];
      return Number.isFinite(Number(price)) ? Number(price) : 0;
    },
    [materialBasePrices],
  );

  const calculateFastenerPrice = useCallback(
    (fastenerType: string, selected: any): number => {
      if (!selected?.type || !selected?.size) return 0;
      const fastenersMaterial = materials.find(
        (m) => m.name?.toLowerCase() === "fasteners",
      );
      if (!fastenersMaterial?.type) return 0;
      const categoryKey = fastenerType.toLowerCase();
      const categoryArray = fastenersMaterial.type[categoryKey];
      if (!Array.isArray(categoryArray)) return 0;
      const fastener = categoryArray.find(
        (item: any) =>
          item.type === selected.type && item.size === selected.size,
      );
      return fastener?.price || 0;
    },
    [materials],
  );

  const calculateIronmongeryPrice = useCallback(
    (ironmongeryType: string, selected: any): number => {
      if (!selected?.type || !selected?.size) return 0;
      const ironmongeryMaterial = materials.find(
        (m) => m.name?.toLowerCase() === "ironmongery",
      );
      if (!ironmongeryMaterial?.type) return 0;
      const categoryKey = ironmongeryType.toLowerCase();
      const categoryArray = ironmongeryMaterial.type[categoryKey];
      if (!Array.isArray(categoryArray)) return 0;
      const item = categoryArray.find(
        (i: any) => i.type === selected.type && i.size === selected.size,
      );
      return item?.price || 0;
    },
    [materials],
  );

  const calculateDoorTotalCost = useCallback(
    (
      door: any,
      sectionIndex: number,
    ): {
      doorCost: number;
      frameCost: number;
      accessories: number;
      total: number;
    } => {
      const doorPrice = calculateDoorPrice(door);
      const frameCost =
        calculateFramePrice(door.frame, door.wallThickness) * (door.count || 1);
      const doorCost = doorPrice * (door.count || 1);
      let accessoriesCost = 0;

      // Architrave
      if (door.architrave?.quantity && door.architrave?.selected?.type) {
        const price = calculateFastenerPrice(
          "architrave",
          door.architrave?.selected,
        );
        accessoriesCost +=
          Number(door.architrave.quantity) * price * (door.count || 1);
      }

      // Quarter round
      if (door.quarterRound?.quantity && door.quarterRound?.selected?.type) {
        const price = calculateFastenerPrice(
          "quarterRound",
          door.quarterRound?.selected,
        );
        accessoriesCost +=
          Number(door.quarterRound.quantity) * price * (door.count || 1);
      }

      // Ironmongery
      if (door.ironmongery) {
        if (
          door.ironmongery.hinges?.quantity &&
          door.ironmongery.hinges?.selected?.type
        ) {
          const price = calculateIronmongeryPrice(
            "hinges",
            door.ironmongery.hinges?.selected,
          );
          accessoriesCost +=
            Number(door.ironmongery.hinges.quantity) *
            price *
            (door.count || 1);
        }
        if (
          door.ironmongery.locks?.quantity &&
          door.ironmongery.locks?.selected?.type
        ) {
          const price = calculateIronmongeryPrice(
            "locks",
            door.ironmongery.locks?.selected,
          );
          accessoriesCost +=
            Number(door.ironmongery.locks.quantity) * price * (door.count || 1);
        }
        if (
          door.ironmongery.handles?.quantity &&
          door.ironmongery.handles?.selected?.type
        ) {
          const price = calculateIronmongeryPrice(
            "handles",
            door.ironmongery.handles?.selected,
          );
          accessoriesCost +=
            Number(door.ironmongery.handles.quantity) *
            price *
            (door.count || 1);
        }
        if (
          door.ironmongery.bolts?.quantity &&
          door.ironmongery.bolts?.selected?.type
        ) {
          const price = calculateIronmongeryPrice(
            "bolts",
            door.ironmongery.bolts?.selected,
          );
          accessoriesCost +=
            Number(door.ironmongery.bolts.quantity) * price * (door.count || 1);
        }
        if (
          door.ironmongery.closers?.quantity &&
          door.ironmongery.closers?.selected?.type
        ) {
          const price = calculateIronmongeryPrice(
            "closers",
            door.ironmongery.closers?.selected,
          );
          accessoriesCost +=
            Number(door.ironmongery.closers.quantity) *
            price *
            (door.count || 1);
        }
      }

      return {
        doorCost,
        frameCost,
        accessories: accessoriesCost,
        total: doorCost + frameCost + accessoriesCost,
      };
    },
    [
      calculateDoorPrice,
      calculateFramePrice,
      calculateFastenerPrice,
      calculateIronmongeryPrice,
    ],
  );

  const calculateWindowTotalCost = useCallback(
    (
      window: any,
    ): {
      windowCost: number;
      frameCost: number;
      glass: number;
      putty: number;
      total: number;
    } => {
      const windowPrice = calculateWindowPrice(window);
      const frameCost =
        calculateFramePrice(window.frame, window.wallThickness) *
        (window.count || 1);
      const windowCost = windowPrice * (window.count || 1);

      let glassCost = 0;
      let puttyCost = 0;

      if (window.glass && window.glass.thickness) {
        const glassM2 =
          parseFloat(window.width || 0) *
          parseFloat(window.height || 0) *
          (window.count || 1);
        const glassPrice = getMaterialPrice("Glazing", window.type || "Clear");
        glassCost =
          glassM2 *
          (Number.isFinite(Number(glassPrice)) ? Number(glassPrice) : 0);

        const puttyPrice =
          getMaterialPrice("Sealant", "Glazing Putty") ||
          getMaterialPrice("Sealant", "Putty") ||
          getMaterialPrice("Sealant", "Silicone");
        const windowPerimeter =
          2 * (parseFloat(window.width || 0) + parseFloat(window.height || 0));
        puttyCost =
          windowPerimeter *
          (Number.isFinite(Number(puttyPrice)) ? Number(puttyPrice) : 0) *
          (window.count || 1);
      }

      return {
        windowCost,
        frameCost,
        glass: glassCost,
        putty: puttyCost,
        total: windowCost + frameCost + glassCost + puttyCost,
      };
    },
    [calculateWindowPrice, calculateFramePrice, getMaterialPrice],
  );

  // ============ MAIN CALCULATION ============

  const calculateMasonry = useCallback(() => {
    if (!validateWallDimensions(wallDimensions) || !qsSettings) return;

    // Initialize totals
    let totals: CalculationTotals = {
      netArea: 0,
      netBlocks: 0,
      netBlocksFeet: 0,
      netMortar: 0,
      netPlaster: 0,
      netCement: 0,
      netSand: 0,
      netWater: 0,
      netDoors: 0,
      netWindows: 0,
      netDoorFrames: 0,
      netWindowFrames: 0,
      netReinforcementKg: 0,
      netReinforcementBars: 0,
      grossReinforcementKg: 0,
      grossReinforcementBars: 0,
      netDPC: 0,
      grossDPC: 0,
      netSealantLiters: 0,
      grossSealantLiters: 0,
      grossArea: 0,
      grossBlocks: 0,
      grossBlocksFeet: 0,
      grossMortar: 0,
      grossPlaster: 0,
      grossCement: 0,
      grossSand: 0,
      grossWater: 0,
      grossDoors: 0,
      grossWindows: 0,
      grossDoorFrames: 0,
      grossWindowFrames: 0,
      netBlocksCost: 0,
      netMortarCost: 0,
      netPlasterCost: 0,
      netWaterCost: 0,
      netDoorsCost: 0,
      netWindowsCost: 0,
      netDoorFramesCost: 0,
      netWindowFramesCost: 0,
      netOpeningsCost: 0,
      netTotalCost: 0,
      grossBlocksCost: 0,
      grossMortarCost: 0,
      grossPlasterCost: 0,
      grossWaterCost: 0,
      grossDoorsCost: 0,
      grossWindowsCost: 0,
      grossDoorFramesCost: 0,
      grossWindowFramesCost: 0,
      grossOpeningsCost: 0,
      grossTotalCost: 0,
      waterPrice: 0,
      netConcrete: 0,
      grossConcrete: 0,
      netConcreteCement: 0,
      grossConcreteCement: 0,
      netConcreteSand: 0,
      grossConcreteSand: 0,
      netConcreteBallast: 0,
      grossConcreteBallast: 0,
      netConcreteWater: 0,
      grossConcreteWater: 0,
      breakdown: [],
      netLintelsCost: 0,
      grossLintelsCost: 0,
      netLintelRebar: 0,
      grossLintelRebar: 0,
      netLintelRebarCost: 0,
      grossLintelRebarCost: 0,
      netLintelConcrete: 0,
      grossLintelConcrete: 0,
      netRingBeamsCost: 0,
      grossRingBeamsCost: 0,
      netRingBeamRebar: 0,
      grossRingBeamRebar: 0,
      netRingBeamRebarCost: 0,
      grossRingBeamRebarCost: 0,
      netRingBeamConcrete: 0,
      grossRingBeamConcrete: 0,
      netWallRebar: 0,
      grossWallRebar: 0,
      netWallRebarCost: 0,
      grossWallRebarCost: 0,
      netDPCArea: 0,
      grossDPCArea: 0,
      netDPCCost: 0,
      grossDPCCost: 0,
      netMovementJoints: 0,
      grossMovementJoints: 0,
      netMovementJointsCost: 0,
      grossMovementJointsCost: 0,
      netScaffoldingArea: 0,
      grossScaffoldingArea: 0,
      netScaffoldingCost: 0,
      grossScaffoldingCost: 0,
      netWasteVolume: 0,
      grossWasteVolume: 0,
      netWasteRemovalCost: 0,
      grossWasteRemovalCost: 0,
      netDoorArchitraveCost: 0,
      grossDoorArchitraveCost: 0,
      netDoorArchitraveQty: 0,
      grossDoorArchitraveQty: 0,
      netWindowArchitraveCost: 0,
      grossWindowArchitraveCost: 0,
      netWindowArchitraveQty: 0,
      grossWindowArchitraveQty: 0,
      netDoorQuarterRoundCost: 0,
      grossDoorQuarterRoundCost: 0,
      netDoorQuarterRoundQty: 0,
      grossDoorQuarterRoundQty: 0,
      netDoorIronmongCost: 0,
      grossDoorIronmongCost: 0,
      netDoorIronmongQty: 0,
      grossDoorIronmongQty: 0,
      netDoorTransomCost: 0,
      grossDoorTransomCost: 0,
      netDoorTransomQty: 0,
      grossDoorTransomQty: 0,
      netWindowGlassArea: 0,
      grossWindowGlassArea: 0,
      netWindowPuttyLength: 0,
      grossWindowPuttyLength: 0,
      netWindowGlassCost: 0,
      grossWindowGlassCost: 0,
      netWindowPuttyCost: 0,
      grossWindowPuttyCost: 0,
      netTransomGlassArea: 0,
      grossTransomGlassArea: 0,
      netTransomPuttyLength: 0,
      grossTransomPuttyLength: 0,
      netTransomGlassCost: 0,
      grossTransomGlassCost: 0,
      netTransomPuttyCost: 0,
      grossTransomPuttyCost: 0,
      hoopIronCoils: 0,
      hoopIronLength: 0,
      professionalElementsTotalCost: 0,
    };

    // Calculate blocks using CENTER LINE METHOD
    const brickCalcs = calculateBricksUsingCenterLineMethod(
      wallDimensions,
      wallSections,
      wallProperties,
    );

    // Aggregate brick counts from all wall types
    let totalNetBlocks = 0;
    let totalGrossBlocks = 0;
    let totalNetArea = 0;
    let totalGrossArea = 0;

    brickCalcs.forEach((calc) => {
      totalNetBlocks += calc.netBricks;
      totalGrossBlocks += calc.grossBricks;
      totalNetArea +=
        calc.grossArea -
        calculateOpeningsAreaFromSections(
          wallSections?.filter((s) => s.type === calc.wallType),
        );
      totalGrossArea += calc.grossArea;
    });

    // Use aggregated values
    const netBlocks = totalNetBlocks;
    const centerLineNetWallArea = totalNetArea;
    const centerLineGrossWallArea = totalGrossArea;

    // Calculate materials
    const cementPrice =
      materials.find((m) => m.name?.toLowerCase() === "cement")?.price || 0;
    const sandPrice =
      materials.find((m) => m.name?.toLowerCase() === "sand")?.price || 0;

    // Get block types and prices for each wall type
    const externalBlockType =
      wallProperties.externalBlockType || "Standard Block";
    const internalBlockType =
      wallProperties.internalBlockType || "Standard Block";

    const externalBlockPrice = getMaterialPrice("Bricks", externalBlockType);
    const internalBlockPrice = getMaterialPrice("Bricks", internalBlockType);

    // Calculate block costs by wall type
    let netBlocksCost = 0;
    let grossBlocksCost = 0;
    let totalNetBlocksFeet = 0;
    let totalGrossBlocksFeet = 0;

    brickCalcs.forEach((calc) => {
      const blockPrice =
        calc.wallType === "external" ? externalBlockPrice : internalBlockPrice;
      const blockLength = calc.blockLength * METERS_TO_FEET;

      const netBlocksFeet = calc.netBricks * blockLength;
      const grossBlocksFeet =
        calc.grossBricks * (1 + qsSettings.wastageMasonry / 100) * blockLength;

      netBlocksCost += netBlocksFeet * blockPrice;
      grossBlocksCost += grossBlocksFeet * blockPrice;
      totalNetBlocksFeet += netBlocksFeet;
      totalGrossBlocksFeet += grossBlocksFeet;
    });

    const netBlocksFeet = totalNetBlocksFeet;
    const grossBlocksFeet = totalGrossBlocksFeet;

    const waterPrice =
      materials.find((m) => m.name?.toLowerCase() === "water")?.price || 0;

    const mortarRatio = qsSettings?.mortarRatio || "1:4";
    const netMortarVolume = centerLineNetWallArea * MORTAR_PER_SQM * 1.33;

    // Mortar materials calculation
    const mortarRatioParts = mortarRatio.split(":").map((p) => parseFloat(p));
    const mortarTotalParts = mortarRatioParts[0] + mortarRatioParts[1];
    const mortarCementVolume =
      (mortarRatioParts[0] / mortarTotalParts) * netMortarVolume;
    const mortarSandVolume =
      (mortarRatioParts[1] / mortarTotalParts) * netMortarVolume;
    const mortarCementBags = mortarCementVolume / 0.035;
    const mortarCementKg = mortarCementBags * CEMENT_BAG_KG;

    // Plaster calculation
    let netPlasterArea = 0;
    const plaster = wallProperties.plaster || "None";
    if (plaster === "One Side") {
      netPlasterArea = centerLineNetWallArea;
    } else if (plaster === "Both Sides") {
      netPlasterArea = centerLineNetWallArea * 2;
    }

    const plasterVolume = netPlasterArea * PLASTER_THICKNESS * 1.33;
    const plasterRatioParts = (qsSettings.plaster_ratio || mortarRatio)
      .split(":")
      .map((p) => parseFloat(p));
    const plasterTotalParts = plasterRatioParts[0] + plasterRatioParts[1];
    const plasterCementVolume =
      (plasterRatioParts[0] / plasterTotalParts) * plasterVolume;
    const plasterSandVolume =
      (plasterRatioParts[1] / plasterTotalParts) * plasterVolume;
    const plasterCementBags = plasterCementVolume / 0.035;
    const plasterCementKg = plasterCementBags * CEMENT_BAG_KG;

    // Water calculation
    const waterRatio = parseCementWaterRatio(qsSettings.cementWaterRatio);
    const totalCementKg = mortarCementKg + plasterCementKg;
    const totalWater = totalCementKg * waterRatio;

    const netMortarCost =
      mortarCementBags * cementPrice + mortarSandVolume * sandPrice;
    const netPlasterCost =
      plasterCementBags * cementPrice + plasterSandVolume * sandPrice;
    const netWaterCost = qsSettings.clientProvidesWater
      ? 0
      : (totalWater / 1000) * waterPrice;

    // Openings (doors and windows) - with separate cost tracking
    let totalOpeningsCost = 0;
    let doorsCount = 0,
      windowsCount = 0,
      doorFramesCount = 0,
      windowFramesCount = 0;
    let netDoorsCost = 0,
      netDoorFramesCost = 0,
      netDoorArchitraveCost = 0,
      netWindowArchitraveCost = 0,
      netDoorArchitraveQty = 0,
      netWindowArchitraveQty = 0,
      netDoorQuarterRoundCost = 0,
      netDoorQuarterRoundQty = 0,
      netDoorIronmongCost = 0,
      netDoorIronmongQty = 0,
      netDoorTransomCost = 0,
      netDoorTransomQty = 0,
      netWindowGlassArea = 0,
      netWindowPuttyLength = 0,
      netWindowGlassCost = 0,
      netWindowPuttyCost = 0,
      netTransomGlassArea = 0,
      netTransomPuttyLength = 0,
      netTransomGlassCost = 0,
      netTransomPuttyCost = 0,
      netWindowsCost = 0,
      netWindowFramesCost = 0;

    const normalizeFastenerKey = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]/g, "");

    const resolveFastenerCategory = (
      fastenersType: Record<string, any> | undefined,
      category: string,
    ) => {
      if (!fastenersType) return null;
      const target = normalizeFastenerKey(category);
      const candidates = target.endsWith("s")
        ? [target, target.slice(0, -1)]
        : [target];
      const match = Object.keys(fastenersType).find((key) =>
        candidates.includes(normalizeFastenerKey(key)),
      );
      return match || null;
    };

    const resolvePrice = (override?: number, fallback?: number) => {
      const overrideNumber = Number(override);
      if (Number.isFinite(overrideNumber)) return overrideNumber;
      const fallbackNumber = Number(fallback);
      return Number.isFinite(fallbackNumber) ? fallbackNumber : 0;
    };

    const getLinearGrossQuantity = (value: number) =>
      Number((value * (1 + qsSettings.wastageMasonry / 100)).toFixed(2));

    const getFastenerPrice = (
      fastenerCategory: string,
      selected?: { type?: string; size?: string },
    ): number => {
      if (!selected?.type || !selected?.size) return 0;
      try {
        const fastenersMaterial = materials.find(
          (m) => m.name?.toLowerCase() === "fasteners",
        );
        if (!fastenersMaterial?.type) return 0;

        const resolvedCategory = resolveFastenerCategory(
          fastenersMaterial.type,
          fastenerCategory,
        );
        const categoryKey = resolvedCategory || fastenerCategory;
        const categoryArray = fastenersMaterial.type[categoryKey];
        if (!Array.isArray(categoryArray)) return 0;

        const fastener = categoryArray.find(
          (item: any) =>
            item.type === selected.type && item.size === selected.size,
        );
        return fastener?.price || 0;
      } catch (error) {
        console.warn(
          `Error looking up fastener price for ${fastenerCategory}:`,
          error,
        );
        return 0;
      }
    };

    const getGlassPricePerM2 = (glassType?: string) => {
      const price = getMaterialPrice("Glazing", glassType || "Clear");
      return Number.isFinite(Number(price)) ? Number(price) : 0;
    };

    const getPuttyPricePerM = () => {
      const price =
        getMaterialPrice("Sealant", "Glazing Putty") ||
        getMaterialPrice("Sealant", "Putty") ||
        getMaterialPrice("Sealant", "Silicone") ||
        0;
      return Number.isFinite(Number(price)) ? Number(price) : 0;
    };

    wallSections?.forEach((section) => {
      section.doors.forEach((door) => {
        doorsCount += door.count;
        const doorCustomPrice = Number(door.custom?.price ?? door.price);
        const hasDoorCustomPrice = Number.isFinite(doorCustomPrice);
        const doorLeafPrice = hasDoorCustomPrice
          ? doorCustomPrice
          : getMaterialPrice("Doors", door.type);

        const doorPrice = hasDoorCustomPrice
          ? doorCustomPrice
          : doorLeafPrice[door.standardSize] || 0;

        const frameLeafPrice =
          getMaterialPrice("Door Frames", door.frame?.type) || "Wood";

        const frameCustomPrice = Number(
          door.frame?.custom?.price ?? door.frame?.price,
        );
        const framePrice = Number.isFinite(frameCustomPrice)
          ? frameCustomPrice
          : frameLeafPrice[door.standardSize] || 0;

        door.price = doorPrice;
        door.frame.price = framePrice;

        // Track costs separately
        const doorCost = doorPrice * door.count;
        const frameCost = framePrice * door.count;
        netDoorsCost += doorCost;
        netDoorFramesCost += frameCost;
        totalOpeningsCost += doorCost + frameCost;
        doorFramesCount += door.count;

        // Helper function to get fastener price from materials (fixed for nested structure)
        // Calculate door accessories costs
        if (door.architrave?.quantity) {
          const price = resolvePrice(
            door.architrave?.price,
            getFastenerPrice("architrave", door.architrave?.selected),
          );
          const qty = Number(door.architrave.quantity) * door.count;
          netDoorArchitraveQty += qty;
          if (price > 0) {
            const architraveCost =
              Number(door.architrave.quantity) * price * door.count;
            netDoorArchitraveCost += architraveCost;
            totalOpeningsCost += architraveCost;
          }
        }

        if (door.quarterRound?.quantity) {
          const price = resolvePrice(
            door.quarterRound?.price,
            getFastenerPrice("quarterRound", door.quarterRound?.selected),
          );
          const qty = Number(door.quarterRound.quantity) * door.count;
          netDoorQuarterRoundQty += qty;
          if (price > 0) {
            const quarterRoundCost =
              Number(door.quarterRound.quantity) * price * door.count;
            netDoorQuarterRoundCost += quarterRoundCost;
            totalOpeningsCost += quarterRoundCost;
          }
        }

        // Calculate ironmongery costs
        if (door.ironmongery) {
          const hinge = door.ironmongery.hinges;
          const hasIronmongeryQty =
            (hinge?.quantity || 0) > 0 ||
            (door.ironmongery.locks?.quantity || 0) > 0 ||
            (door.ironmongery.handles?.quantity || 0) > 0 ||
            (door.ironmongery.bolts?.quantity || 0) > 0 ||
            (door.ironmongery.closers?.quantity || 0) > 0;
          if (hasIronmongeryQty) {
            netDoorIronmongQty += door.count;
          }
          if (hinge?.quantity) {
            const price = resolvePrice(
              hinge?.price,
              getFastenerPrice("hinges", hinge?.selected),
            );
            if (price > 0) {
              const hingeCost = Number(hinge.quantity) * price * door.count;
              netDoorIronmongCost += hingeCost;
              totalOpeningsCost += hingeCost;
            }
          }

          const lock = door.ironmongery.locks;
          if (lock?.quantity) {
            const price = resolvePrice(
              lock?.price,
              getFastenerPrice("locks", lock?.selected),
            );
            if (price > 0) {
              const lockCost = Number(lock.quantity) * price * door.count;
              netDoorIronmongCost += lockCost;
              totalOpeningsCost += lockCost;
            }
          }

          const handle = door.ironmongery.handles;
          if (handle?.quantity) {
            const price = resolvePrice(
              handle?.price,
              getFastenerPrice("handles", handle?.selected),
            );
            if (price > 0) {
              const handleCost = Number(handle.quantity) * price * door.count;
              netDoorIronmongCost += handleCost;
              totalOpeningsCost += handleCost;
            }
          }

          const bolt = door.ironmongery.bolts;
          if (bolt?.quantity) {
            const price = resolvePrice(
              bolt?.price,
              getFastenerPrice("bolts", bolt?.selected),
            );
            if (price > 0) {
              const boltCost = Number(bolt.quantity) * price * door.count;
              netDoorIronmongCost += boltCost;
              totalOpeningsCost += boltCost;
            }
          }

          const closer = door.ironmongery.closers;
          if (closer?.quantity) {
            const price = resolvePrice(
              closer?.price,
              getFastenerPrice("closers", closer?.selected),
            );
            if (price > 0) {
              const closerCost = Number(closer.quantity) * price * door.count;
              netDoorIronmongCost += closerCost;
              totalOpeningsCost += closerCost;
            }
          }
        }

        // Calculate transom costs (custom pricing, not from materials)
        if (door.transom?.quantity && door.transom?.price) {
          const transomCost =
            Number(door.transom.quantity) *
            Number(door.transom.price) *
            door.count;
          netDoorTransomCost += transomCost;
          totalOpeningsCost += transomCost;
        }
        if (door.transom?.quantity) {
          netDoorTransomQty += Number(door.transom.quantity) * door.count;
        }

        if (door.transom?.glazing?.glassAreaM2) {
          const glassAreaPerUnit =
            Number(door.transom.glazing.glassAreaM2) || 0;
          const transomQty = Number(door.transom?.quantity) || 1;
          const glassAreaTotal = glassAreaPerUnit * transomQty * door.count;
          netTransomGlassArea += glassAreaTotal;

          const glassPrice = resolvePrice(
            door.transom.glazing?.glassPricePerM2,
            getGlassPricePerM2("Clear"),
          );
          if (glassPrice > 0) {
            const glassCost = glassAreaTotal * glassPrice;
            netTransomGlassCost += glassCost;
            totalOpeningsCost += glassCost;
          }
        }
      });

      section.windows.forEach((window) => {
        windowsCount += window.count;
        const windowCustomPrice = Number(window.custom?.price ?? window.price);
        const hasWindowCustomPrice = Number.isFinite(windowCustomPrice);
        const windowLeafPrice = hasWindowCustomPrice
          ? windowCustomPrice
          : getMaterialPrice("Windows", window.type);

        const windowPrice = hasWindowCustomPrice
          ? windowCustomPrice
          : windowLeafPrice[window.standardSize] || 0;

        const frameLeafPrice =
          getMaterialPrice("window Frames", window.frame?.type) || "Wood";

        const windowFrameCustomPrice = Number(
          window.frame?.custom?.price ?? window.frame?.price,
        );
        const framePrice = Number.isFinite(windowFrameCustomPrice)
          ? windowFrameCustomPrice
          : frameLeafPrice[window.standardSize] || 0;

        window.price = windowPrice;
        window.frame.price = framePrice;

        // Track costs separately
        const windowCost = windowPrice * window.count;
        const frameCost = framePrice * window.count;
        netWindowsCost += windowCost;
        netWindowFramesCost += frameCost;
        totalOpeningsCost += windowCost + frameCost;
        windowFramesCount += window.count;

        const windowArea =
          window.sizeType === "standard"
            ? parseSize(window.standardSize)
            : Number(window.custom.height) * Number(window.custom.width);
        const glassPanes = Number(window.glazing?.glass?.quantity) || 1;
        const windowGlassArea = (windowArea || 0) * glassPanes * window.count;
        if (windowGlassArea > 0) {
          netWindowGlassArea += windowGlassArea;
          const glassPrice = resolvePrice(
            window.glazing?.glass?.pricePerM2,
            getGlassPricePerM2(window.glazing?.glass?.type || window.glassType),
          );
          if (glassPrice > 0) {
            const glassCost = windowGlassArea * glassPrice;
            netWindowGlassCost += glassCost;
            totalOpeningsCost += glassCost;
          }
        }

        const puttyPerWindow = Number(window.glazing?.putty?.quantity) || 0;
        if (puttyPerWindow > 0) {
          const puttyTotal = puttyPerWindow * window.count;
          netWindowPuttyLength += puttyTotal;
          const puttyPrice = resolvePrice(
            window.glazing?.putty?.price,
            getPuttyPricePerM(),
          );
          if (puttyPrice > 0) {
            const puttyCost = puttyTotal * puttyPrice;
            netWindowPuttyCost += puttyCost;
            totalOpeningsCost += puttyCost;
          }
        }
      });
    });

    // Wastage calculations
    const grossBlocks = Math.ceil(
      netBlocks * (1 + qsSettings.wastageMasonry / 100),
    );
    const grossMortarCementBags =
      mortarCementBags * (1 + qsSettings.wastageMasonry / 100);
    const grossMortarSand =
      mortarSandVolume * (1 + qsSettings.wastageMasonry / 100);
    const grossPlasterCementBags =
      plasterCementBags * (1 + qsSettings.wastageMasonry / 100);
    const grossPlasterSand =
      plasterSandVolume * (1 + qsSettings.wastageMasonry / 100);
    const grossWater = totalWater * (1 + qsSettings.wastageWater / 100);

    const netRoomTotalCost =
      netBlocksCost +
      netMortarCost +
      netPlasterCost +
      totalOpeningsCost +
      netWaterCost;
    const grossMortarCost =
      grossMortarCementBags * cementPrice + grossMortarSand * sandPrice;
    const grossPlasterCost =
      grossPlasterCementBags * cementPrice + grossPlasterSand * sandPrice;
    const grossWaterCost = qsSettings.clientProvidesWater
      ? 0
      : (grossWater / 1000) * waterPrice;
    const grossOpeningsCost =
      totalOpeningsCost * (1 + qsSettings.wastageMasonry / 100);
    const grossRoomTotalCost =
      grossBlocksCost +
      grossMortarCost +
      grossPlasterCost +
      grossOpeningsCost +
      grossWaterCost;

    // Professional elements
    let professionalCost = 0;

    // Lintels
    if (qsSettings.includesLintels) {
      // Total lintel length = total wall perimeter (external + internal)
      const totalLintelLength =
        Number(wallDimensions.externalWallPerimiter) +
        Number(wallDimensions.internalWallPerimiter);

      const lintelConcrete =
        totalLintelLength * qsSettings.lintelWidth * qsSettings.lintelDepth;
      const lintelMaterials = calculateConcreteMaterials(
        lintelConcrete,
        qsSettings.concreteMixRatio,
        qsSettings.concreteWaterCementRatio,
      );
      const lintelCost =
        lintelMaterials.cementBags * cementPrice +
        lintelMaterials.sand * sandPrice;
      const lintelRebarWeight = getRebarWeight(
        totalLintelLength * 4,
        qsSettings.lintelRebarSize,
      );
      const lintelRebarCost =
        lintelRebarWeight * (rebarPrices[qsSettings.lintelRebarSize] || 0);
      professionalCost += lintelCost + lintelRebarCost;

      totals.netLintelsCost = Math.ceil(lintelCost);
      totals.grossLintelsCost = Math.ceil(
        lintelCost * (1 + qsSettings.wastageMasonry / 100),
      );
      totals.netLintelRebar = lintelRebarWeight;
      totals.grossLintelRebar = lintelRebarWeight;
      totals.netLintelRebarCost = Math.ceil(lintelRebarCost);
      totals.grossLintelRebarCost = Math.ceil(
        lintelRebarCost * (1 + qsSettings.wastageMasonry / 100),
      );
      totals.netLintelConcrete = lintelConcrete;
      totals.grossLintelConcrete =
        lintelConcrete * (1 + qsSettings.wastageMasonry / 100);
    }

    // Ring Beams
    if (qsSettings.includesRingBeams && wallDimensions.externalWallPerimiter) {
      const ringBeamPerimeter = Number(wallDimensions.externalWallPerimiter);
      const ringBeamWidth =
        qsSettings.ringBeamWidth || qsSettings.lintelWidth || 0.2;
      const ringBeamDepth =
        qsSettings.ringBeamDepth || qsSettings.lintelDepth || 0.15;

      const ringBeamConcrete =
        ringBeamPerimeter * ringBeamWidth * ringBeamDepth;
      const ringBeamMaterials = calculateConcreteMaterials(
        ringBeamConcrete,
        qsSettings.concreteMixRatio,
        qsSettings.concreteWaterCementRatio,
      );
      const ringBeamCost =
        ringBeamMaterials.cementBags * cementPrice +
        ringBeamMaterials.sand * sandPrice;

      // Ring beam main reinforcement with development and lap lengths
      const ringBeamMainBarsCount = qsSettings.ringBeamMainBarsCount || 8;
      const ringBeamMainRebarSize =
        qsSettings.ringBeamRebarSize || qsSettings.lintelRebarSize;

      // Calculate development and lap lengths for ring beam (using QS Settings factors)
      const devLengthFactor = qsSettings.developmentLengthFactor ?? 40;
      const lapLengthFactor = qsSettings.lapLengthFactor ?? 50;
      const developmentLength =
        devLengthFactor *
        (REBAR_PROPERTIES[ringBeamMainRebarSize]?.diameterMm / 1000 || 0.012);
      const lapLength =
        lapLengthFactor *
        (REBAR_PROPERTIES[ringBeamMainRebarSize]?.diameterMm / 1000 || 0.012);

      // Ring beam circumference with development length (single lap at one point)
      const circumference = ringBeamPerimeter;
      const mainBarLength = circumference + developmentLength;

      // Calculate optimized bars (accounting for standard bar length and lap)
      const standardBarLength = 12; // Standard bar length in meters
      const effectiveBarLength = standardBarLength - lapLength;
      const mainBarsNeeded = Math.ceil(mainBarLength / effectiveBarLength);
      const totalMainBarLength = mainBarsNeeded * standardBarLength;

      const ringBeamMainRebarWeight = getRebarWeight(
        ringBeamMainBarsCount * totalMainBarLength,
        ringBeamMainRebarSize,
      );

      // Ring beam stirrups as circular links
      const stirrupSpacing = (qsSettings.ringBeamStirrupSpacing || 200) / 1000; // Convert mm to m
      const numberOfStirrups = Math.ceil(circumference / stirrupSpacing);
      const stirrupBarSize = qsSettings.ringBeamStirrupSize || "D8";

      // Stirrup link dimensions (forms a closed loop around the cross-section)
      const stirrupBendDeduction =
        2 * (REBAR_PROPERTIES[stirrupBarSize]?.diameterMm / 1000 || 0.008);
      const stirrupLength =
        2 * (ringBeamWidth + ringBeamDepth) - stirrupBendDeduction;

      const ringBeamStirrupRebarWeight = getRebarWeight(
        numberOfStirrups * stirrupLength,
        stirrupBarSize,
      );

      const totalRingBeamRebarWeight =
        ringBeamMainRebarWeight + ringBeamStirrupRebarWeight;
      const ringBeamRebarCost =
        totalRingBeamRebarWeight * (rebarPrices[ringBeamMainRebarSize] || 0);
      professionalCost += ringBeamCost + ringBeamRebarCost;

      totals.netRingBeamsCost = Math.ceil(ringBeamCost);
      totals.grossRingBeamsCost = Math.ceil(
        ringBeamCost * (1 + qsSettings.wastageMasonry / 100),
      );
      totals.netRingBeamRebar = totalRingBeamRebarWeight;
      totals.grossRingBeamRebar = totalRingBeamRebarWeight;
      totals.netRingBeamRebarCost = Math.ceil(ringBeamRebarCost);
      totals.grossRingBeamRebarCost = Math.ceil(
        ringBeamRebarCost * (1 + qsSettings.wastageMasonry / 100),
      );
      totals.netRingBeamConcrete = ringBeamConcrete;
      totals.grossRingBeamConcrete =
        ringBeamConcrete * (1 + qsSettings.wastageMasonry / 100);
    }

    // Wall reinforcement
    if (qsSettings.includesReinforcement) {
      const perimeter =
        Number(wallDimensions.externalWallPerimiter) +
        Number(wallDimensions.internalWallPerimiter);
      const height = Math.max(
        Number(wallDimensions.externalWallHeight),
        Number(wallDimensions.internalWallHeight),
      );
      const courses = Math.ceil(height / 0.2);

      const bedJointLength =
        perimeter * Math.ceil(courses / (qsSettings.reinforcementSpacing || 3));
      const verticalBars = Math.ceil(
        perimeter / (qsSettings.verticalReinforcementSpacing || 1),
      );
      const verticalLength = verticalBars * height;

      const bedJointWeight = getRebarWeight(
        bedJointLength,
        qsSettings.bedJointRebarSize,
      );
      const verticalWeight = getRebarWeight(
        verticalLength,
        qsSettings.verticalRebarSize,
      );
      const totalRebarWeight = bedJointWeight + verticalWeight;

      const rebarCost =
        bedJointWeight * (rebarPrices[qsSettings.bedJointRebarSize] || 0) +
        verticalWeight * (rebarPrices[qsSettings.verticalRebarSize] || 0);

      professionalCost += rebarCost;
      totals.netWallRebar = totalRebarWeight;
      totals.grossWallRebar = totalRebarWeight;
      totals.netWallRebarCost = Math.ceil(rebarCost);
      totals.grossWallRebarCost = Math.ceil(
        rebarCost * (1 + qsSettings.wastageMasonry / 100),
      );
    }

    // DPC
    if (qsSettings.includesDPC) {
      const dpcArea = Number(wallDimensions.externalWallPerimiter);
      const dpcCost = getDPCPrice(dpcArea, quote.dpcType || "Polyethylene");
      professionalCost += dpcCost;
      totals.netDPCArea = dpcArea;
      totals.grossDPCArea = dpcArea;
      totals.netDPCCost = Math.ceil(dpcCost);
      totals.grossDPCCost = Math.ceil(
        dpcCost * (1 + qsSettings.wastageMasonry / 100),
      );
    }

    // Movement joints
    if (qsSettings.includesMovementJoints) {
      const perimeter =
        Number(wallDimensions.externalWallPerimiter) +
        Number(wallDimensions.internalWallPerimiter);
      const joints = Math.ceil(
        perimeter / (qsSettings.movementJointSpacing || 5),
      );
      const sealantPrice = getMaterialPrice("Sealant", "Polyurethane");
      const sealantPriceTube = sealantPrice["600 ml sausage"] || 0;
      const sealantVolume = joints * 0.01;
      const sealantCost = sealantVolume * sealantPriceTube;
      professionalCost += sealantCost;
      totals.netMovementJoints = joints;
      totals.grossMovementJoints = joints;
      totals.netMovementJointsCost = Math.ceil(sealantCost);
      totals.grossMovementJointsCost = Math.ceil(
        sealantCost * (1 + qsSettings.wastageMasonry / 100),
      );
    }

    // Scaffolding
    if (qsSettings.includesScaffolding) {
      const scaffoldingArea = centerLineGrossWallArea;
      const scaffoldingCost =
        (scaffoldingArea * qsSettings.scaffoldingDailyRate * 7) / 100;
      professionalCost += scaffoldingCost;
      totals.netScaffoldingArea = scaffoldingArea;
      totals.grossScaffoldingArea = scaffoldingArea;
      totals.netScaffoldingCost = Math.ceil(scaffoldingCost);
      totals.grossScaffoldingCost = Math.ceil(
        scaffoldingCost * (1 + qsSettings.wastageMasonry / 100),
      );
    }

    // Waste removal
    if (qsSettings.includesWasteRemoval) {
      // Use average thickness from wall sections or fall back to wallProperties
      const thicknessForWaste =
        wallSections && wallSections.length > 0
          ? wallSections.reduce(
              (sum, s) => sum + (s.thickness || thickness || 0.2),
              0,
            ) / wallSections.length
          : thickness || 0.2;

      const wasteVolume = centerLineGrossWallArea * 0.05 * thicknessForWaste;
      const wasteCost = wasteVolume * qsSettings.wasteRemovalRate;
      professionalCost += wasteCost;
      totals.netWasteVolume = wasteVolume;
      totals.grossWasteVolume = wasteVolume;
      totals.netWasteRemovalCost = Math.ceil(wasteCost);
      totals.grossWasteRemovalCost = Math.ceil(
        wasteCost * (1 + qsSettings.wastageMasonry / 100),
      );
    }

    // Update totals
    totals.netArea = centerLineNetWallArea;
    totals.grossArea = centerLineGrossWallArea;
    totals.netBlocks = netBlocks;
    totals.netBlocksFeet = netBlocksFeet;
    totals.grossBlocks = grossBlocks;
    totals.grossBlocksFeet = grossBlocksFeet;
    totals.netMortar = netMortarVolume;
    totals.netPlaster = netPlasterArea;
    totals.netCement = totalCementKg;
    totals.netSand = mortarSandVolume + plasterSandVolume;
    totals.netWater = totalWater;
    totals.grossMortar =
      netMortarVolume * (1 + qsSettings.wastageMasonry / 100);
    totals.grossPlaster =
      netPlasterArea * (1 + qsSettings.wastageMasonry / 100);
    totals.grossCement = totalCementKg * (1 + qsSettings.wastageMasonry / 100);
    totals.grossSand =
      (mortarSandVolume + plasterSandVolume) *
      (1 + qsSettings.wastageMasonry / 100);
    totals.grossWater = grossWater;
    totals.waterPrice = waterPrice;
    totals.netDoors = doorsCount;
    totals.netWindows = windowsCount;
    totals.netDoorFrames = doorFramesCount;
    totals.netWindowFrames = windowFramesCount;
    totals.grossDoors = Math.ceil(
      doorsCount * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.grossWindows = Math.ceil(
      windowsCount * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.grossDoorFrames = Math.ceil(
      doorFramesCount * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.grossWindowFrames = Math.ceil(
      windowFramesCount * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netDoorsCost = Math.ceil(netDoorsCost);
    totals.netDoorFramesCost = Math.ceil(netDoorFramesCost);
    totals.netWindowsCost = Math.ceil(netWindowsCost);
    totals.netWindowFramesCost = Math.ceil(netWindowFramesCost);
    totals.grossDoorsCost = Math.ceil(
      netDoorsCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.grossDoorFramesCost = Math.ceil(
      netDoorFramesCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.grossWindowsCost = Math.ceil(
      netWindowsCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.grossWindowFramesCost = Math.ceil(
      netWindowFramesCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netDoorArchitraveCost = Math.ceil(netDoorArchitraveCost);
    totals.grossDoorArchitraveCost = Math.ceil(
      netDoorArchitraveCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netWindowArchitraveCost = Math.ceil(netWindowArchitraveCost);
    totals.grossWindowArchitraveCost = Math.ceil(
      netWindowArchitraveCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netDoorArchitraveQty = Number(netDoorArchitraveQty.toFixed(2));
    totals.grossDoorArchitraveQty =
      getLinearGrossQuantity(netDoorArchitraveQty);
    totals.netWindowArchitraveQty = Number(netWindowArchitraveQty.toFixed(2));
    totals.grossWindowArchitraveQty = getLinearGrossQuantity(
      netWindowArchitraveQty,
    );
    totals.netDoorQuarterRoundCost = Math.ceil(netDoorQuarterRoundCost);
    totals.grossDoorQuarterRoundCost = Math.ceil(
      netDoorQuarterRoundCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netDoorQuarterRoundQty = Number(netDoorQuarterRoundQty.toFixed(2));
    totals.grossDoorQuarterRoundQty = getLinearGrossQuantity(
      netDoorQuarterRoundQty,
    );
    totals.netDoorIronmongCost = Math.ceil(netDoorIronmongCost);
    totals.grossDoorIronmongCost = Math.ceil(
      netDoorIronmongCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netDoorIronmongQty = Math.ceil(netDoorIronmongQty);
    totals.grossDoorIronmongQty = Math.ceil(
      netDoorIronmongQty * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netDoorTransomCost = Math.ceil(netDoorTransomCost);
    totals.grossDoorTransomCost = Math.ceil(
      netDoorTransomCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netDoorTransomQty = Math.ceil(netDoorTransomQty);
    totals.grossDoorTransomQty = Math.ceil(
      netDoorTransomQty * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netWindowGlassArea = Number(netWindowGlassArea.toFixed(2));
    totals.grossWindowGlassArea = getLinearGrossQuantity(netWindowGlassArea);
    totals.netWindowPuttyLength = Number(netWindowPuttyLength.toFixed(2));
    totals.grossWindowPuttyLength =
      getLinearGrossQuantity(netWindowPuttyLength);
    totals.netWindowGlassCost = Math.ceil(netWindowGlassCost);
    totals.grossWindowGlassCost = Math.ceil(
      netWindowGlassCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netWindowPuttyCost = Math.ceil(netWindowPuttyCost);
    totals.grossWindowPuttyCost = Math.ceil(
      netWindowPuttyCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netTransomGlassArea = Number(netTransomGlassArea.toFixed(2));
    totals.grossTransomGlassArea = getLinearGrossQuantity(netTransomGlassArea);
    totals.netTransomPuttyLength = Number(netTransomPuttyLength.toFixed(2));
    totals.grossTransomPuttyLength = getLinearGrossQuantity(
      netTransomPuttyLength,
    );
    totals.netTransomGlassCost = Math.ceil(netTransomGlassCost);
    totals.grossTransomGlassCost = Math.ceil(
      netTransomGlassCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netTransomPuttyCost = Math.ceil(netTransomPuttyCost);
    totals.grossTransomPuttyCost = Math.ceil(
      netTransomPuttyCost * (1 + qsSettings.wastageMasonry / 100),
    );
    totals.netBlocksCost = netBlocksCost;
    totals.grossBlocksCost = grossBlocksCost;
    totals.netMortarCost = netMortarCost;
    totals.grossMortarCost = grossMortarCost;
    totals.netPlasterCost = netPlasterCost;
    totals.grossPlasterCost = grossPlasterCost;
    totals.netWaterCost = netWaterCost;
    totals.grossWaterCost = grossWaterCost;
    totals.netOpeningsCost = totalOpeningsCost;
    totals.grossOpeningsCost = grossOpeningsCost;
    totals.netTotalCost = netRoomTotalCost + professionalCost;
    totals.grossTotalCost = grossRoomTotalCost + professionalCost;
    totals.professionalElementsTotalCost = professionalCost;

    // Calculate hoop iron
    const hoopIronRollWeight = quote?.hoopIronRollWeight || "20kg";
    const externalWallHeight = wallDimensions?.externalWallHeight || 0;
    const externalWallPerimeter = wallDimensions?.externalWallPerimiter || 0;
    const internalWallPerimeter = wallDimensions?.internalWallPerimiter || 0;

    // Calculate number of hoops: first at ground level, then every 400mm (two courses)
    const numberOfCourses = Math.floor(externalWallHeight / 0.4) + 1;

    // Total hoop iron length needed (applied to all walls)
    const totalHoopLength =
      numberOfCourses * (externalWallPerimeter + internalWallPerimeter);

    // Roll length per kg: 20kg = 65m, 25kg = 80m
    const rollLength = hoopIronRollWeight === "25kg" ? 80 : 65;

    // Number of rolls needed
    const numberOfCoils = Math.ceil(totalHoopLength / rollLength);

    // Get hoop iron pricing
    const hoopIronPrice = getMaterialPrice("Hoop Iron", hoopIronRollWeight);
    const hoopIronTotalCost = numberOfCoils * hoopIronPrice;

    totals.hoopIronLength = Number(totalHoopLength.toFixed(2));
    totals.hoopIronCoils = numberOfCoils;

    setResults(totals);
    setQuote((prev: any) => ({
      ...prev,
      masonry_materials: {
        ...totals,
        materials: [
          {
            type: "blocks",
            netQuantity: totals.netBlocks,
            grossQuantity: totals.grossBlocks,
            netCost: totals.netBlocksCost,
            grossCost: totals.grossBlocksCost,
            unit: "pcs",
          },
          {
            type: "mortar",
            netQuantity: totals.netMortar,
            grossQuantity: totals.grossMortar,
            netCost: totals.netMortarCost,
            grossCost: totals.grossMortarCost,
            unit: "mÂ³",
          },
          {
            type: "plaster",
            netQuantity: totals.netPlaster,
            grossQuantity: totals.grossPlaster,
            netCost: totals.netPlasterCost,
            grossCost: totals.grossPlasterCost,
            unit: "mÂ²",
          },
          {
            type: "door_leaves",
            netQuantity: totals.netDoors,
            grossQuantity: totals.grossDoors,
            netCost: totals.netDoorsCost,
            grossCost: totals.grossDoorsCost,
            unit: "pcs",
          },
          {
            type: "door_frames",
            netQuantity: totals.netDoorFrames,
            grossQuantity: totals.grossDoorFrames,
            netCost: totals.netDoorFramesCost,
            grossCost: totals.grossDoorFramesCost,
            unit: "pcs",
          },
          {
            type: "window_leaves",
            netQuantity: totals.netWindows,
            grossQuantity: totals.grossWindows,
            netCost: totals.netWindowsCost,
            grossCost: totals.grossWindowsCost,
            unit: "pcs",
          },
          {
            type: "window_frames",
            netQuantity: totals.netWindowFrames,
            grossQuantity: totals.grossWindowFrames,
            netCost: totals.netWindowFramesCost,
            grossCost: totals.grossWindowFramesCost,
            unit: "pcs",
          },
          {
            type: "door_architrave",
            netQuantity: totals.netDoorArchitraveQty,
            grossQuantity: totals.grossDoorArchitraveQty,
            netCost: totals.netDoorArchitraveCost,
            grossCost: totals.grossDoorArchitraveCost,
            unit: "m",
          },
          {
            type: "window_architrave",
            netQuantity: totals.netWindowArchitraveQty,
            grossQuantity: totals.grossWindowArchitraveQty,
            netCost: totals.netWindowArchitraveCost,
            grossCost: totals.grossWindowArchitraveCost,
            unit: "m",
          },
          {
            type: "door_quarter_round",
            netQuantity: totals.netDoorQuarterRoundQty,
            grossQuantity: totals.grossDoorQuarterRoundQty,
            netCost: totals.netDoorQuarterRoundCost,
            grossCost: totals.grossDoorQuarterRoundCost,
            unit: "m",
          },
          {
            type: "door_ironmongery",
            netQuantity: totals.netDoorIronmongQty,
            grossQuantity: totals.grossDoorIronmongQty,
            netCost: totals.netDoorIronmongCost,
            grossCost: totals.grossDoorIronmongCost,
            unit: "set",
          },
          {
            type: "door_transom",
            netQuantity: totals.netDoorTransomQty,
            grossQuantity: totals.grossDoorTransomQty,
            netCost: totals.netDoorTransomCost,
            grossCost: totals.grossDoorTransomCost,
            unit: "pcs",
          },
          {
            type: "window_glass",
            netQuantity: totals.netWindowGlassArea,
            grossQuantity: totals.grossWindowGlassArea,
            netCost: totals.netWindowGlassCost,
            grossCost: totals.grossWindowGlassCost,
            unit: "mÂ²",
          },
          {
            type: "window_putty",
            netQuantity: totals.netWindowPuttyLength,
            grossQuantity: totals.grossWindowPuttyLength,
            netCost: totals.netWindowPuttyCost,
            grossCost: totals.grossWindowPuttyCost,
            unit: "m",
          },
          {
            type: "transom_glass",
            netQuantity: totals.netTransomGlassArea,
            grossQuantity: totals.grossTransomGlassArea,
            netCost: totals.netTransomGlassCost,
            grossCost: totals.grossTransomGlassCost,
            unit: "mÂ²",
          },
          {
            type: "transom_putty",
            netQuantity: totals.netTransomPuttyLength,
            grossQuantity: totals.grossTransomPuttyLength,
            netCost: totals.netTransomPuttyCost,
            grossCost: totals.grossTransomPuttyCost,
            unit: "m",
          },
          ...(qsSettings.clientProvidesWater
            ? []
            : [
                {
                  type: "water",
                  netQuantity: totals.netWater,
                  grossQuantity: totals.grossWater,
                  netCost: totals.netWaterCost,
                  grossCost: totals.grossWaterCost,
                  unit: "liters",
                },
              ]),
        ],
        summary: {
          netTotalCost: totals.netTotalCost,
          grossTotalCost: totals.grossTotalCost,
          totalWastageCost: totals.grossTotalCost - totals.netTotalCost,
          wastagePercentage:
            ((totals.grossTotalCost - totals.netTotalCost) /
              totals.netTotalCost) *
              100 || 0,
        },
      },
      hoop_iron: {
        input: {
          rollWeight: hoopIronRollWeight,
        },
        results: {
          numberOfCourses: numberOfCourses,
          length: totals.hoopIronLength,
          coils: numberOfCoils,
          pricePerRoll: hoopIronPrice,
          totalCost: Math.ceil(hoopIronTotalCost),
        },
      },
    }));
  }, [
    wallDimensions,
    wallSections,
    wallProperties,
    qsSettings,
    materials,
    calculateWallAreas,
    calculateOpeningsAreaFromSections,
    getMaterialPrice,
    rebarPrices,
    setQuote,
  ]);

  // ============ EFFECTS ============

  useEffect(() => {
    if (user && profile !== null) {
      fetchMaterials();
    }
  }, [user, profile, fetchMaterials]);

  useEffect(() => {
    const fetchAllRebarPrices = async () => {
      if (!profile?.id) return;
      const prices: Record<string, number> = {};
      const rebarSizes: RebarSize[] = [
        "R6",
        "D6",
        "D8",
        "D10",
        "D12",
        "D14",
        "D16",
        "D18",
        "D20",
        "D22",
        "D25",
        "D28",
        "D32",
        "D36",
        "D40",
        "D50",
      ];
      for (const size of rebarSizes) {
        prices[size] = await getRebarPrice(size);
      }
      setRebarPrices(prices as PriceMap);
    };
    fetchAllRebarPrices();
  }, [getRebarPrice, profile?.id]);

  useEffect(() => {
    calculateMasonry();
  }, [calculateMasonry]);

  // ============ RETURN ============

  return {
    wallDimensions,
    wallSections,
    wallProperties,
    updateWallDimensions,
    updateWallProperties,
    addWallSection,
    removeWallSection,
    addDoorToSection,
    addWindowToSection,
    removeDoorFromSection,
    removeWindowFromSection,
    updateDoorInSection,
    updateWindowInSection,
    updateWallSectionProperties,
    materials,
    results,
    calculateMasonry,
    getMaterialPrice,
    materialBasePrices,
    qsSettings,
    waterPrice: results.waterPrice,
    // Price calculation functions
    calculateDoorPrice,
    calculateFramePrice,
    calculateWindowPrice,
    calculateFastenerPrice,
    calculateIronmongeryPrice,
    calculateDoorTotalCost,
    calculateWindowTotalCost,
  };
}
