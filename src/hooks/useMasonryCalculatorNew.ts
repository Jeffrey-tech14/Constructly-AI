// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { useMaterialPrices } from "./useMaterialPrices";
import { RebarSize } from "./useRebarCalculator";
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
  frame: {
    type: string;
    price?: number;
    sizeType: string;
    standardSize: string;
    height: string;
    width: string;
    custom: { height: string; width: string; price?: number };
  };
}

export interface Window {
  sizeType: string;
  standardSize: string;
  price?: number;
  custom: { height: string; width: string; price?: number };
  type: string;
  count: number;
  frame: {
    type: string;
    price?: number;
    sizeType: string;
    standardSize: string;
    height: string;
    width: string;
    custom: { height: string; width: string; price?: number };
  };
}

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
  blockType: string;
  thickness: number;
  plaster: "None" | "One Side" | "Both Sides";
  customBlockLength?: number;
  customBlockHeight?: number;
  customBlockPrice?: number;
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
  lintelDepth: number;
  lintelWidth: number;
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
  professionalElementsTotalCost: number;
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
      name: "Standard Block",
      size: { length: 0.4, height: 0.2, thickness: 0.2 },
      volume: 0.016,
    },
    {
      id: 2,
      name: "Half Block",
      size: { length: 0.4, height: 0.2, thickness: 0.1 },
      volume: 0.008,
    },
    {
      id: 3,
      name: "Brick",
      size: { length: 0.225, height: 0.075, thickness: 0.1125 },
      volume: 0.0019,
    },
    { id: 4, name: "Custom", size: null, volume: 0 },
  ];

  // ============ HELPER FUNCTIONS ============

  const parseSize = useCallback((str: string): number => {
    if (!str) return 0;
    const cleaned = str.replace(/[×x]/g, "x").replace(/[^\d.x]/g, "");
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
      const cementVolume = (ratio.cement / totalParts) * volume;
      const sandVolume = (ratio.sand / totalParts) * volume;
      const ballastVolume = (ratio.ballast / totalParts) * volume;
      const cementBags = cementVolume / 0.035;
      const cementWeight = cementBags * 50;
      const waterLiters = cementWeight * waterCementRatio;
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
        const blockType = properties.blockType || "Standard Block";
        const thickness = properties.thickness || 0.2;
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
        const blockType = properties.blockType || "Standard Block";
        const thickness = properties.thickness || 0.2;
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
        const rebarType = baseMaterial.type.find((t: any) => t.size === size);
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
      sections[sectionIndex].doors.push({
        sizeType: "",
        standardSize: "",
        custom: { height: "", width: "", price: "" },
        type: "",
        count: 1,
        frame: { type: "", price: "" },
      });
      return { ...prev, wallSections: sections };
    });
  };

  const addWindowToSection = (sectionIndex: number) => {
    setQuote((prev: any) => {
      const sections = [...(prev.wallSections || [])];
      sections[sectionIndex].windows.push({
        sizeType: "",
        standardSize: "",
        custom: { height: "", width: "", price: "" },
        type: "",
        count: 1,
        frame: { type: "", price: "" },
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

    // Get block type from sections or fall back to wallProperties
    const blockTypeForCalculation: string =
      (wallSections?.[0]?.blockType as string) ||
      wallProperties.blockType ||
      "Standard Block";

    const blockPrice =
      wallProperties.customBlockPrice ||
      getMaterialPrice("Bricks", blockTypeForCalculation);

    // Calculate block dimensions in feet
    const blockDef = blockTypes.find((b) => b.name === blockTypeForCalculation);
    const blockLengthMeters = blockDef?.size?.length || 0.4;
    const blockLengthFeet = blockLengthMeters * METERS_TO_FEET;

    // Calculate total feet of blocks
    const netBlocksFeet = netBlocks * blockLengthFeet;
    const grossBlocksFeet =
      (totalNetBlocks + totalGrossBlocks) *
      (1 + qsSettings.wastageMasonry / 100) *
      blockLengthFeet;

    // Cost calculations using price per foot
    const netBlocksCost = netBlocksFeet * blockPrice;
    const grossBlocksCost = grossBlocksFeet * blockPrice;

    const waterPrice =
      materials.find((m) => m.name?.toLowerCase() === "water")?.price || 0;

    const mortarRatio = quote?.mortarRatio || "1:4";
    const netMortarVolume = centerLineNetWallArea * MORTAR_PER_SQM;

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

    const plasterVolume = netPlasterArea * PLASTER_THICKNESS;
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

    // Openings (doors and windows)
    let totalOpeningsCost = 0;
    let doorsCount = 0,
      windowsCount = 0,
      doorFramesCount = 0,
      windowFramesCount = 0;

    wallSections?.forEach((section) => {
      section.doors.forEach((door) => {
        doorsCount += door.count;
        const doorLeafPrice = door.custom?.price
          ? Number(door.custom.price)
          : getMaterialPrice("Doors", door.type);

        const doorPrice = door.custom?.price
          ? Number(door.custom.price)
          : doorLeafPrice[door.standardSize] || 0;

        const frameLeafPrice =
          getMaterialPrice("Door Frames", door.frame?.type) || "Wood";

        const framePrice = door.frame?.custom?.price
          ? Number(door.frame?.custom?.price)
          : frameLeafPrice[door.standardSize] || 0;

        door.price = doorPrice;
        door.frame.price = framePrice;

        totalOpeningsCost += (doorPrice + framePrice) * door.count;
        doorFramesCount += door.count;
      });

      section.windows.forEach((window) => {
        windowsCount += window.count;
        const windowLeafPrice = window.custom?.price
          ? Number(window.custom.price)
          : getMaterialPrice("Windows", window.type);

        const windowPrice = window.custom?.price
          ? Number(window.custom.price)
          : windowLeafPrice[window.standardSize] || 0;

        const frameLeafPrice =
          getMaterialPrice("window Frames", window.frame?.type) || "Wood";

        const framePrice = window.frame?.custom?.price
          ? Number(window.frame?.custom?.price)
          : frameLeafPrice[window.standardSize] || 0;

        window.price = windowPrice;
        window.frame.price = framePrice;

        totalOpeningsCost += (windowPrice + framePrice) * window.count;
        windowFramesCount += window.count;
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
              (sum, s) =>
                sum + (s.thickness || wallProperties.thickness || 0.2),
              0,
            ) / wallSections.length
          : wallProperties.thickness || 0.2;

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
            unit: "m³",
          },
          {
            type: "plaster",
            netQuantity: totals.netPlaster,
            grossQuantity: totals.grossPlaster,
            netCost: totals.netPlasterCost,
            grossCost: totals.grossPlasterCost,
            unit: "m²",
          },
          {
            type: "doors",
            netQuantity: totals.netDoors,
            grossQuantity: totals.grossDoors,
            netCost: totals.netDoorsCost,
            grossCost: totals.grossDoorsCost,
            unit: "pcs",
          },
          {
            type: "windows",
            netQuantity: totals.netWindows,
            grossQuantity: totals.grossWindows,
            netCost: totals.netWindowsCost,
            grossCost: totals.grossWindowsCost,
            unit: "pcs",
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
  };
}
