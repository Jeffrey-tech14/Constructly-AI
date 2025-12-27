// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { Material } from "./useQuoteCalculations";
import { supabase } from "@/integrations/supabase/client";
import { REBAR_PROPERTIES, RebarSize } from "./useRebarCalculator";
import { useMaterialPrices } from "./useMaterialPrices";

type PriceMap = Record<RebarSize, number>;

// Door and Window interfaces
export interface Door {
  sizeType: string;
  standardSize: string;
  price?: string;
  custom: {
    height: string;
    width: string;
    price?: string;
  };
  type: string;
  count: number;
  frame: {
    type: string;
    price?: string;
    sizeType: string;
    standardSize: string;
    height: string;
    width: string;
    custom: {
      height: string;
      width: string;
      price?: string;
    };
  };
}

export interface Window {
  sizeType: string;
  standardSize: string;
  price?: string;
  custom: {
    height: string;
    width: string;
    price?: string;
  };
  type: string;
  count: number;
  frame: {
    type: string;
    price?: string;
    sizeType: string;
    standardSize: string;
    height: string;
    width: string;
    custom: {
      height: string;
      width: string;
      price?: string;
    };
  };
}

// Wall dimension interface
export interface Dimensions {
  externalWallPerimiter: number;
  internalWallPerimiter: number;
  externalWallHeight: number;
  internalWallHeight: number;
}

// Wall section interface for doors and windows
export interface WallSection {
  type: "external" | "internal";
  doors: Door[];
  windows: Window[];
}
// Add the new interfaces for professional elements
export interface Lintel {
  length: number;
  width: number;
  depth: number;
  reinforcement: number; // kg of rebar
  concrete: number; // m³
}

export interface Reinforcement {
  bedJoint: {
    length: number; // meters
    spacing: number; // courses
  };
  verticalReinforcement: {
    bars: number;
    length: number; // meters per bar
  };
}

export interface DPC {
  length: number; // meters
  width: number; // meters
  material: string;
}

export interface DPCPricing {
  type: string; // e.g., "Polyethylene", "Bituminous Felt", "PVC DPC Roll"
  sizes_m: string[]; // e.g., ["0.15 × 30", "0.20 × 30"]
  price_kes: Record<string, number>; // e.g., { "0.15 × 30 m": 1800 }
  thickness_mm: number[]; // e.g., [250, 500, 1000]
}

export interface MovementJoint {
  length: number;
  material: string;
  sealant: number; // liters
}

export interface Scaffolding {
  area: number; // m²
  duration: number; // days;
}

export interface WasteRemoval {
  volume: number; // m³
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
  financialModes: {
    labour: "percentage" | "fixed";
    overhead: "percentage" | "fixed";
    profit: "percentage" | "fixed";
    contingency: "percentage" | "fixed";
    permit_cost: "percentage" | "fixed";
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

  // New professional settings
  includesLintels: boolean;
  includesReinforcement: boolean;
  includesDPC: boolean;
  includesScaffolding: boolean;
  includesMovementJoints: boolean;
  includesWasteRemoval: boolean;
  lintelDepth: number; // meters
  lintelWidth: number; // meters
  reinforcementSpacing: number; // courses between bed joint reinforcement
  verticalReinforcementSpacing: number; // meters between vertical bars
  DPCWidth: number; // meters
  movementJointSpacing: number; // meters between joints
  scaffoldingDailyRate: number;
  wasteRemovalRate: number; // per m³

  concreteMixRatio: string; // e.g., "1:2:4"
  concreteWaterCementRatio: number;
  lintelRebarSize: RebarSize;
  verticalRebarSize: RebarSize;
  bedJointRebarSize: RebarSize;
}
export const REBAR_WEIGHTS: Record<RebarSize, number> = {
  R6: 0.222,
  Y6: 0.222,
  Y8: 0.395,
  Y10: 0.617,
  Y12: 0.888,
  Y14: 1.21,
  Y16: 1.579,
  Y18: 2.0,
  Y20: 2.466,
  Y22: 2.98,
  Y25: 3.855,
  Y28: 4.834,
  Y32: 6.313,
  Y36: 8.0,
  Y40: 9.864,
  Y50: 15.41,
};

interface CalculationTotals {
  netArea: number;
  netBlocks: number;
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

export default function useMasonryCalculator({
  setQuote,
  quote,
  materialBasePrices,
  userMaterialPrices,
  regionalMultipliers,
  userRegion,
  getEffectiveMaterialPrice,
}) {
  const [results, setResults] = useState<CalculationTotals>({
    netArea: 0,
    netBlocks: 0,
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

  const { user, profile } = useAuth();
  const PLASTER_THICKNESS = 0.015;
  const CEMENT_DENSITY = 1440;
  const MORTAR_PER_SQM = 0.017;
  const SAND_DENSITY = 1600;
  const CEMENT_BAG_KG = 50;
  const qsSettings = quote?.qsSettings;
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
  // Use wall dimensions instead of rooms
  const wallDimensions = quote?.wallDimensions as Dimensions | undefined;
  const wallSections = quote?.wallSections as WallSection[] | undefined;
  const [rebarPrices, setRebarPrices] = useState<PriceMap>({} as PriceMap);
  const [priceMap, setPriceMap] = useState<PriceMap>({} as PriceMap);
  const [bindingWirePrice, setBindingWirePrice] = useState<number>(0);
  const [materials, setMaterials] = useState<Material[]>([]);

  const parseConcreteMixRatio = useCallback((ratio: string) => {
    const parts = ratio.split(":").map((part) => parseFloat(part.trim()));
    if (parts.length !== 3 || parts.some(isNaN)) {
      return { cement: 1, sand: 2, ballast: 4 }; // Default ratio
    }
    return { cement: parts[0], sand: parts[1], ballast: parts[2] };
  }, []);

  // Calculate concrete materials per m³
  const calculateConcreteMaterials = useCallback(
    (volume: number, mixRatio: string, waterCementRatio: number) => {
      const ratio = parseConcreteMixRatio(mixRatio);
      const totalParts = ratio.cement + ratio.sand + ratio.ballast;

      // Calculate volumes (m³)
      const cementVolume = (ratio.cement / totalParts) * volume;
      const sandVolume = (ratio.sand / totalParts) * volume;
      const ballastVolume = (ratio.ballast / totalParts) * volume;

      // Convert cement volume to bags (1 bag = 0.035 m³)
      const cementBags = cementVolume / 0.035;

      // Calculate water (liters) based on cement weight
      const cementWeight = cementBags * 50; // 50kg per bag
      const waterLiters = cementWeight * waterCementRatio;

      return {
        cementBags,
        sand: sandVolume,
        ballast: ballastVolume,
        water: waterLiters,
      };
    },
    [parseConcreteMixRatio]
  );

  // Get rebar weight based on size
  const getRebarWeight = useCallback(
    (length: number, size: RebarSize): number => {
      return length * REBAR_WEIGHTS[size];
    },
    []
  );

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

  // Validate wall dimensions
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
        (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 1000
      );
    },
    []
  );

  // Calculate wall areas based on dimensions
  const calculateWallAreas = useCallback(
    (
      dims: Dimensions | undefined
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
    [validateWallDimensions]
  );

  // Calculate openings area from wall sections
  const calculateOpeningsAreaFromSections = useCallback(
    (sections: WallSection[] | undefined): number => {
      if (!sections || sections.length === 0) return 0;

      let totalOpeningsArea = 0;

      sections.forEach((section) => {
        // Calculate doors openings
        section.doors.forEach((door) => {
          const area =
            door.sizeType === "standard"
              ? parseSize(door.standardSize)
              : Number(door.custom.height) * Number(door.custom.width);
          totalOpeningsArea += (area || 0) * door.count;
        });

        // Calculate windows openings
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
    [parseSize]
  );

  // Calculate block count based on wall dimensions
  const calculateBlockCountFromWalls = useCallback(
    (
      dims: Dimensions | undefined,
      wallArea: number,
      blockType: string
    ): number => {
      if (!validateWallDimensions(dims) || wallArea <= 0) return 0;

      const joint = qsSettings.mortarJointThicknessM;
      let blockLength = 0.225,
        blockHeight = 0.075;

      if (blockType !== "Custom") {
        const blockDef = blockTypes.find((b) => b.name === blockType);
        if (blockDef?.size) {
          blockLength = blockDef.size.length;
          blockHeight = blockDef.size.height;
        }
      }

      const effectiveBlockLength = blockLength + joint;
      const effectiveBlockHeight = blockHeight + joint;
      const blockArea = effectiveBlockLength * effectiveBlockHeight;

      return Math.ceil(wallArea / blockArea);
    },
    [validateWallDimensions, qsSettings.mortarJointThicknessM, blockTypes]
  );

  // Phase 4: Centre-Line Method Calculation for walls
  const getBlockCountCentreLinMethodForWalls = (
    externalPerimeter: number,
    internalPerimeter: number,
    height: number,
    wallThickness: number
  ): { external: number; internal: number; total: number } => {
    const joint = qsSettings.mortarJointThicknessM;

    let blockLength = 0.225,
      blockHeight = 0.075;

    const blockDef = blockTypes.find((b) => b.name !== "Custom");
    if (blockDef?.size) {
      blockLength = blockDef.size.length;
      blockHeight = blockDef.size.height;
    }

    // Centre-line method: calculate using centre line perimeter
    const externalCentreLine = externalPerimeter;
    const internalCentreLine = internalPerimeter;

    const effectiveBlockLength = blockLength + joint;
    const effectiveBlockHeight = blockHeight + joint;

    const externalBlocksPerCourse = Math.ceil(
      externalCentreLine / effectiveBlockLength
    );
    const internalBlocksPerCourse = Math.ceil(
      internalCentreLine / effectiveBlockLength
    );
    const courses = Math.ceil(height / effectiveBlockHeight);

    return {
      external: externalBlocksPerCourse * courses,
      internal: internalBlocksPerCourse * courses,
      total: (externalBlocksPerCourse + internalBlocksPerCourse) * courses,
    };
  };

  // Calculate calculation assumptions for display
  const getCalculationAssumptionsFromWalls = (
    dims: Dimensions | undefined
  ): Record<string, any> => {
    if (!validateWallDimensions(dims)) return {};

    const joint = qsSettings.mortarJointThicknessM;

    let blockLength = 0.225,
      blockHeight = 0.075;

    const blockDef = blockTypes.find((b) => b.name !== "Custom");
    if (blockDef?.size) {
      blockLength = blockDef.size.length;
      blockHeight = blockDef.size.height;
    }

    const externalCentreLine = Number(dims!.externalWallPerimiter);
    const internalCentreLine = Number(dims!.internalWallPerimiter);

    const effectiveBlockLength = blockLength + joint;
    const effectiveBlockHeight = blockHeight + joint;

    const externalBlocksPerCourse = Math.ceil(
      externalCentreLine / effectiveBlockLength
    );
    const internalBlocksPerCourse = Math.ceil(
      internalCentreLine / effectiveBlockLength
    );
    const courses = Math.ceil(
      Number(dims!.externalWallHeight) / effectiveBlockHeight
    );

    return {
      blockDimensions: {
        length: blockLength,
        height: blockHeight,
      },
      mortarJoint: joint,
      effectiveBlockDimensions: {
        length: effectiveBlockLength,
        height: effectiveBlockHeight,
      },
      externalPerimeter: externalCentreLine,
      internalPerimeter: internalCentreLine,
      externalBlocksPerCourse: externalBlocksPerCourse,
      internalBlocksPerCourse: internalBlocksPerCourse,
      courses: courses,
      externalTotalBlocks: externalBlocksPerCourse * courses,
      internalTotalBlocks: internalBlocksPerCourse * courses,
      totalBlocks:
        (externalBlocksPerCourse + internalBlocksPerCourse) * courses,
      wastagePercent: qsSettings.wastageMasonry,
      calculationMethod: "centre-line",
    };
  };

  const calculateWaterRequirements = useCallback(
    (
      cementQtyKg: number,
      sandQtyM3: number,
      currentQsSettings: MasonryQSSettings
    ): {
      waterMixingL: number;
      waterOtherL: number;
      totalWaterL: number;
    } => {
      const ratio = parseCementWaterRatio(currentQsSettings.cementWaterRatio);
      const hydrationWater = cementQtyKg * ratio;
      const sandMassKg = sandQtyM3 * SAND_DENSITY;
      const existingWaterInSand =
        sandMassKg * (currentQsSettings.sandMoistureContentPercent / 100);
      const additionalWaterNeeded = Math.max(
        0,
        hydrationWater - existingWaterInSand
      );
      const waterOtherL =
        (cementQtyKg / CEMENT_DENSITY) *
        currentQsSettings.otherSiteWaterAllowanceLM3 *
        1000;
      const totalWaterL = additionalWaterNeeded + waterOtherL;
      return {
        waterMixingL: additionalWaterNeeded,
        waterOtherL,
        totalWaterL,
      };
    },
    [parseCementWaterRatio]
  );
  const getBlockAreaWithJoint = useCallback((room: Room): number => {
    const joint = qsSettings.mortarJointThicknessM;
    if (
      room.blockType === "Custom" &&
      room.customBlock?.length &&
      room.customBlock?.height
    ) {
      const l = Number(room.customBlock.length) + joint;
      const h = Number(room.customBlock.height) + joint;
      return l * h;
    }
    const blockDef = blockTypes.find((b) => b.name === room.blockType);
    if (blockDef?.size) {
      return (blockDef.size.length + joint) * (blockDef.size.height + joint);
    }
    return (0.225 + joint) * (0.075 + joint);
  }, []);
  const calculateWallArea = useCallback(
    (room: Room): number => {
      if (!validateRoomDimensions(room)) return 0;
      const length = Number(room.length);
      const width = Number(room.width);
      const height = Number(room.height);
      return (length * 2 + width * 2) * height;
    },
    [validateRoomDimensions]
  );
  const calculateOpeningsArea = useCallback(
    (room: Room): number => {
      let openingsArea = 0;
      room.doors.forEach((door) => {
        const area =
          door.sizeType === "standard"
            ? parseSize(door.standardSize)
            : Number(door.custom.height) * Number(door.custom.width);
        openingsArea += (area || 0) * door.count;
      });
      room.windows.forEach((window) => {
        const area =
          window.sizeType === "standard"
            ? parseSize(window.standardSize)
            : Number(window.custom.height) * Number(window.custom.width);
        openingsArea += (area || 0) * window.count;
      });
      return openingsArea;
    },
    [parseSize]
  );
  const getMaterialPrice = useCallback(
    (materialName: string, specificType?: string): number => {
      if (!materialBasePrices || materialBasePrices.length === 0) return 0;

      // Find the base material
      const material = materialBasePrices.find(
        (m) => m.name && m.name.toLowerCase() === materialName.toLowerCase()
      );

      if (!material) return 0;

      // Get user override if exists
      const userOverride = userMaterialPrices.find(
        (p) => p.material_id === material.id && p.region === userRegion
      );

      // Get effective material with applied regional multiplier
      const effectiveMaterial = getEffectiveMaterialPrice(
        material.id,
        userRegion,
        userOverride,
        materialBasePrices,
        regionalMultipliers
      );

      if (!effectiveMaterial) return 0;
      else if (effectiveMaterial.name === "Bricks") {
        // For blocks/bricks, return the price of the first type or a specific type
        if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
          const blockType = specificType
            ? effectiveMaterial.type.find((t) => t.name === specificType) || 10
            : effectiveMaterial.type[0];

          return blockType?.price_kes || 10;
        }
      } else if (effectiveMaterial.name === "Doors") {
        // For doors, return the price of the first type and first size
        if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
          const doorType = specificType
            ? effectiveMaterial.type.find((t) => t.type === specificType)
            : effectiveMaterial.type[0];

          if (doorType && doorType.price_kes) {
            return doorType?.price_kes || 0;
            // Return the first price in the price_kes object
          } else {
            return 0;
          }
        }
      } else if (effectiveMaterial.name === "Door Frames") {
        // For doors, return the price of the first type and first size
        if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
          const doorFrameType = specificType
            ? effectiveMaterial.type.find((t) => t.type === specificType)
            : effectiveMaterial.type[0];

          if (doorFrameType && doorFrameType.price_kes) {
            return doorFrameType?.price_kes || 10;
            // Return the first price in the price_kes object
          } else {
            return 0;
          }
        }
      } else if (effectiveMaterial.name === "Windows") {
        // For windows, return the price of the first type and first size
        if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
          const windowType = specificType
            ? effectiveMaterial.type.find((t) => t.type === specificType)
            : effectiveMaterial.type[0];

          if (windowType && windowType.price_kes) {
            // Return the first price in the price_kes object
            return windowType?.price_kes || 0;
          } else {
            return 0;
          }
        }
      } else if (effectiveMaterial.name === "Window Frames") {
        // For windows, return the price of the first type and first size
        if (effectiveMaterial.type && effectiveMaterial.type.length > 0) {
          const windowFrameType = specificType
            ? effectiveMaterial.type.find((t) => t.type === specificType)
            : effectiveMaterial.type[0];

          if (windowFrameType && windowFrameType.price_kes) {
            // Return the first price in the price_kes object
            return windowFrameType?.price_kes || 0;
          } else {
            return 0;
          }
        }
      } else {
        // For other materials with simple pricing
        return effectiveMaterial.price_kes || 0;
      }

      return 0;
    },
    [
      materialBasePrices,
      userRegion,
      userMaterialPrices,
      regionalMultipliers,
      getEffectiveMaterialPrice,
    ]
  );

  // Helper function to get DPC price from new Supabase structure
  const getDPCPrice = useCallback(
    (dpcArea: number, dpcType: string = "Polyethylene"): number => {
      if (!materialBasePrices || materialBasePrices.length === 0) return 0;

      const dpcMaterial = materials.find((m) =>
        m.name?.toLowerCase().includes("dpc")
      )?.type;
      if (!dpcMaterial) return 0;
      const dpcCost = dpcArea * (dpcMaterial[dpcType || "Polyethylene"] || 0);

      if (!dpcMaterial) return 0;

      return dpcCost;
    },
    [
      materialBasePrices,
      userRegion,
      userMaterialPrices,
      regionalMultipliers,
      getEffectiveMaterialPrice,
    ]
  );
  const calculateLintels = useCallback(
    (
      room: Room,
      currentQsSettings: MasonryQSSettings
    ): {
      concrete: number;
      reinforcement: number;
      totalLength: number;
      formwork: number;
      materials: any; // concrete materials breakdown
    } => {
      if (!currentQsSettings.includesLintels)
        return {
          concrete: 0,
          reinforcement: 0,
          totalLength: 0,
          formwork: 0,
          materials: { cementBags: 0, sand: 0, ballast: 0, water: 0 },
        };

      let totalLength = 0;
      let formworkArea = 0;

      // Calculate lintels for doors
      room.doors.forEach((door) => {
        const width =
          door.sizeType === "standard"
            ? parseFloat(door.standardSize.split("×")[0]?.trim() || "0.9")
            : parseFloat(door.custom.width) || 0.9;
        const lintelLength = width + 0.3; // width + 150mm bearing each side
        totalLength += lintelLength;
        formworkArea +=
          lintelLength *
          (currentQsSettings.lintelDepth * 2 + currentQsSettings.lintelWidth);
      });

      // Calculate lintels for windows
      room.windows.forEach((window) => {
        const width =
          window.sizeType === "standard"
            ? parseFloat(window.standardSize.split("×")[0]?.trim() || "1.2")
            : parseFloat(window.custom.width) || 1.2;
        const lintelLength = width + 0.3; // width + 150mm bearing each side
        totalLength += lintelLength;
        formworkArea +=
          lintelLength *
          (currentQsSettings.lintelDepth * 2 + currentQsSettings.lintelWidth);
      });

      const concreteVolume =
        totalLength *
        currentQsSettings.lintelWidth *
        currentQsSettings.lintelDepth;

      // Calculate concrete materials
      const concreteMaterials = calculateConcreteMaterials(
        concreteVolume,
        currentQsSettings.concreteMixRatio,
        currentQsSettings.concreteWaterCementRatio
      );

      // Calculate reinforcement weight
      const reinforcementWeight =
        getRebarWeight(totalLength, currentQsSettings.lintelRebarSize) * 4; // 4 bars per lintel

      return {
        concrete: concreteVolume,
        reinforcement: reinforcementWeight,
        totalLength,
        formwork: formworkArea,
        materials: concreteMaterials,
      };
    },
    [calculateConcreteMaterials, getRebarWeight]
  );

  const calculateReinforcement = useCallback(
    (
      room: Room,
      currentQsSettings: MasonryQSSettings
    ): {
      bedJoint: number;
      vertical: number;
      bedJointWeight: number;
      verticalWeight: number;
    } => {
      if (!currentQsSettings.includesReinforcement)
        return {
          bedJoint: 0,
          vertical: 0,
          bedJointWeight: 0,
          verticalWeight: 0,
        };

      const length = Number(room.length) || 0;
      const width = Number(room.width) || 0;
      const height = Number(room.height) || 0;

      if (!length || !width || !height)
        return {
          bedJoint: 0,
          vertical: 0,
          bedJointWeight: 0,
          verticalWeight: 0,
        };

      const perimeter = 2 * (length + width);
      const courses = Math.ceil(height / 0.2); // assuming 200mm block height

      // Bed joint reinforcement
      const bedJointLength =
        perimeter * Math.ceil(courses / currentQsSettings.reinforcementSpacing);
      const bedJointWeight = getRebarWeight(
        bedJointLength,
        currentQsSettings.bedJointRebarSize
      );

      // Vertical reinforcement
      const verticalBars = Math.ceil(
        perimeter / currentQsSettings.verticalReinforcementSpacing
      );
      const verticalLength = verticalBars * height;
      const verticalWeight = getRebarWeight(
        verticalLength,
        currentQsSettings.verticalRebarSize
      );

      return {
        bedJoint: bedJointLength,
        vertical: verticalLength,
        bedJointWeight,
        verticalWeight,
      };
    },
    [getRebarWeight]
  );

  const calculateDPC = useCallback(
    (room: Room, currentQsSettings: MasonryQSSettings): number => {
      if (!currentQsSettings.includesDPC) return 0;

      const length = Number(room.length) || 0;

      return length;
    },
    []
  );

  const calculateMovementJoints = useCallback(
    (
      room: Room,
      currentQsSettings: MasonryQSSettings
    ): { length: number; sealant: number } => {
      if (!currentQsSettings.includesMovementJoints)
        return { length: 0, sealant: 0 };

      const length = Number(room.length) || 0;
      const width = Number(room.width) || 0;

      if (!length || !width) return { length: 0, sealant: 0 };

      const perimeter = 2 * (length + width);
      const joints = Math.ceil(
        perimeter / currentQsSettings.movementJointSpacing
      );
      const sealantVolume = joints * 0.01; // 10mm wide × 10mm deep × 1m long = 0.1 liter per meter

      return {
        length: joints,
        sealant: sealantVolume,
      };
    },
    []
  );

  const calculateScaffolding = useCallback(
    (room: Room, currentQsSettings: MasonryQSSettings): number => {
      if (!currentQsSettings.includesScaffolding) return 0;

      const length = Number(room.length) || 0;
      const width = Number(room.width) || 0;
      const height = Number(room.height) || 0;

      if (!length || !width || !height) return 0;

      const wallArea = 2 * (length + width) * height;
      // Assume scaffolding is required for 7 days per room
      const scaffoldingCost =
        (wallArea * currentQsSettings.scaffoldingDailyRate * 7) / 100; // per m² per day

      return scaffoldingCost;
    },
    []
  );

  const calculateWasteRemoval = useCallback(
    (room: Room, currentQsSettings: MasonryQSSettings): number => {
      if (!currentQsSettings.includesWasteRemoval) return 0;

      const length = Number(room.length) || 0;
      const width = Number(room.width) || 0;
      const height = Number(room.height) || 0;

      if (!length || !width || !height) return 0;

      const wallArea = 2 * (length + width) * height;
      // Assume 5% of materials become waste
      const wasteVolume = wallArea * 0.05 * 0.2; // 5% of wall volume (assuming 200mm thick)
      const wasteCost = wasteVolume * currentQsSettings.wasteRemovalRate;

      return wasteCost;
    },
    []
  );

  const addRoom = () => {
    setQuote((prev) => ({
      ...prev,
      rooms: [
        ...(prev.rooms || []),
        {
          room_name: "",
          roomType: "",
          blockType: "",
          length: "",
          height: "",
          width: "",
          thickness: "",
          customBlock: { length: "", height: "", thickness: "", price: "" },
          plaster: "One Side",
          doors: [],
          windows: [],
        },
      ],
    }));
  };
  const removeRoom = (i: number) => {
    setQuote((prev) => ({
      ...prev,
      rooms: (prev.rooms || []).filter((_, index) => index !== i),
    }));
  };
  const handleRoomChange = (i: number, field: keyof Room, value: any) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      if (!updatedRooms[i]) return prev;
      updatedRooms[i] = {
        ...updatedRooms[i],
        [field]: value,
      };
      return { ...prev, rooms: updatedRooms };
    });
  };
  const handleNestedChange = (
    i: number,
    field: "doors" | "windows",
    idx: number,
    key: string,
    value: any
  ) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      const roomCopy = {
        ...updatedRooms[i],
        [field]: [...updatedRooms[i][field]],
      };
      const nestedItem = { ...roomCopy[field][idx] };
      if (key.startsWith("frame.")) {
        const subKey = key.split(".")[1];
        nestedItem.frame = { ...nestedItem.frame, [subKey]: value };
      } else if (key === "frame") {
        nestedItem.frame = { ...nestedItem.frame, ...value };
      } else {
        nestedItem[key] = value;
      }
      roomCopy[field][idx] = nestedItem;
      updatedRooms[i] = roomCopy;
      return { ...prev, rooms: updatedRooms };
    });
  };
  const addDoor = (i: number) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      const roomCopy = { ...updatedRooms[i] };
      roomCopy.doors = [
        ...(roomCopy.doors || []),
        {
          sizeType: "",
          standardSize: "",
          custom: { height: "", width: "", price: "" },
          type: "",
          count: 1,
          frame: { type: "", price: "" },
        },
      ];
      updatedRooms[i] = roomCopy;
      return { ...prev, rooms: updatedRooms };
    });
  };
  const addWindow = (i: number) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      const roomCopy = { ...updatedRooms[i] };
      roomCopy.windows = [
        ...(roomCopy.windows || []),
        {
          sizeType: "",
          standardSize: "",
          custom: { height: "", width: "", price: "" },
          type: "",
          count: 1,
          frame: { type: "", price: "" },
        },
      ];
      updatedRooms[i] = roomCopy;
      return { ...prev, rooms: updatedRooms };
    });
  };
  const removeNested = (i: number, field: "doors" | "windows", idx: number) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      updatedRooms[i][field].splice(idx, 1);
      return { ...prev, rooms: updatedRooms };
    });
  };
  const removeEntry = (
    roomIndex: number,
    type: "doors" | "windows",
    entryIndex: number
  ) => {
    setQuote((prev) => {
      const updatedRooms = [...(prev.rooms || [])];
      if (type === "doors") {
        updatedRooms[roomIndex].doors = updatedRooms[roomIndex].doors.filter(
          (_, i) => i !== entryIndex
        );
      } else {
        updatedRooms[roomIndex].windows = updatedRooms[
          roomIndex
        ].windows.filter((_, i) => i !== entryIndex);
      }
      return { ...prev, rooms: updatedRooms };
    });
  };
  const fetchMaterials = useCallback(async () => {
    if (!profile?.id) return;
    const { data: baseMaterials, error: baseError } = await supabase
      .from("material_base_prices")
      .select("*");
    const { data: overrides, error: overrideError } = await supabase
      .from("user_material_prices")
      .select("material_id, region, price")
      .eq("user_id", profile.id);
    if (baseError) console.error("Base materials error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);
    const merged =
      baseMaterials?.map((material) => {
        const userRegion = profile?.location || "Nairobi";
        const userRate = overrides?.find(
          (o) => o.material_id === material.id && o.region === userRegion
        );
        const multiplier =
          regionalMultipliers.find((r) => r.region === userRegion)
            ?.multiplier || 1;
        const materialP = (material.price || 0) * multiplier;
        const price = userRate ? userRate.price : materialP ?? 0;
        return {
          ...material,
          price,
          region: userRegion,
          source: userRate ? "user" : material.price != null ? "base" : "none",
        };
      }) || [];
    setMaterials(merged);
  }, [profile, regionalMultipliers]);
  useEffect(() => {
    if (user && profile !== null) {
      fetchMaterials();
    }
  }, [user, profile, fetchMaterials]);

  const getRebarPrice = useCallback(
    async (size: RebarSize): Promise<number> => {
      try {
        if (!profile?.id) return 0;

        let basePrice = 0;

        // Get base rebar price from material_base_prices
        const { data: baseMaterial, error: baseError } = await supabase
          .from("material_base_prices")
          .select("type")
          .eq("name", "Rebar")
          .single();

        if (baseError) {
          console.error("Error fetching base rebar price:", baseError);
          return 0;
        }

        if (baseMaterial?.type) {
          const rebarType = baseMaterial.type.find((t: any) => t.size === size);
          if (rebarType?.price_kes_per_kg) {
            basePrice = rebarType.price_kes_per_kg;
          }
        }

        // Check for user override
        const { data: userOverride, error: overrideError } = await supabase
          .from("user_material_prices")
          .select("type")
          .eq("user_id", profile.id)
          .eq("region", userRegion)
          .maybeSingle();

        if (!overrideError && userOverride?.type) {
          const userRebarType = userOverride.type.find(
            (t: any) => t.size === size
          );
          if (userRebarType?.price_kes_per_kg) {
            basePrice = userRebarType.price_kes_per_kg;
          }
        }

        // Apply regional multiplier
        const regionalMultiplier =
          regionalMultipliers.find((r) => r.region === userRegion)
            ?.multiplier || 1;

        return basePrice * regionalMultiplier;
      } catch (error) {
        console.error("Error getting rebar price:", error);
        return 0;
      }
    },
    [profile?.id, userRegion, regionalMultipliers]
  );

  useEffect(() => {
    const fetchAllRebarPrices = async () => {
      if (!profile?.id) return;

      const prices: Record<string, number> = {};
      const rebarSizes: RebarSize[] = [
        "R6",
        "Y6",
        "Y8",
        "Y10",
        "Y12",
        "Y14",
        "Y16",
        "Y18",
        "Y20",
        "Y22",
        "Y25",
        "Y28",
        "Y32",
        "Y36",
        "Y40",
        "Y50",
      ];

      for (const size of rebarSizes) {
        const price = await getRebarPrice(size);
        prices[size] = price;
      }

      setRebarPrices(prices as PriceMap);
    };

    fetchAllRebarPrices();
  }, [getRebarPrice, profile?.id]);

  // Parse the mortar ratio from quote settings
  const parseMortarRatio = useCallback((ratio: string) => {
    if (!ratio) return { cement: 1, sand: 4 }; // Default fallback

    const parts = ratio.split(":").map((part) => parseFloat(part.trim()));
    if (parts.length !== 2 || parts.some(isNaN) || parts.some((p) => p <= 0)) {
      return { cement: 1, sand: 6 }; // Default fallback
    }
    return { cement: parts[0], sand: parts[1] };
  }, []);

  // Calculate mortar materials based on the ratio
  const calculateMortarMaterials = useCallback(
    (volume: number, ratio: string) => {
      const mixRatio = parseMortarRatio(ratio);
      const totalParts = mixRatio.cement + mixRatio.sand;

      // Calculate volumes based on ratio (by volume)
      const cementVolume = (mixRatio.cement / totalParts) * volume;
      const sandVolume = (mixRatio.sand / totalParts) * volume;

      // Convert cement volume to bags (1 bag = 0.035 m³)
      const cementBags = cementVolume / 0.035;
      const cementKg = cementBags * CEMENT_BAG_KG;

      return {
        cementBags,
        cementKg,
        sandM3: sandVolume,
      };
    },
    [parseMortarRatio]
  );

  const calculateOpeningsCost = useCallback(
    (room: Room): number => {
      let totalCost = 0;

      room.doors.forEach((door) => {
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

        door.price = doorPrice.toString();
        door.frame.price = framePrice.toString();

        totalCost += (doorPrice + framePrice) * door.count;
      });

      room.windows.forEach((window) => {
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

        window.price = windowPrice.toString();
        window.frame.price = framePrice.toString();

        totalCost += (windowPrice + framePrice) * window.count;
      });

      return totalCost;
    },
    [getMaterialPrice]
  );

  const calculateProfessionalElementsWithConnectivity = useCallback(
    (
      room: Room,
      currentQsSettings: MasonryQSSettings,
      efficiencyMultiplier: number
    ): number => {
      const cementPrice =
        materials.find((m) => m.name?.toLowerCase() === "cement")?.price || 0;
      const sandPrice =
        materials.find((m) => m.name?.toLowerCase() === "sand")?.price || 0;
      const ballastPrice =
        materials.find((m) => m.name?.toLowerCase() === "ballast")?.price || 0;
      const waterPrice =
        materials.find((m) => m.name?.toLowerCase() === "water")?.price || 0;
      const sealantPrice = getMaterialPrice("Sealant", "Polyurethane");

      let totalProfessionalCost = 0;

      // Calculate lintels
      const lintels = calculateLintels(room, currentQsSettings);
      const lintelRebarPrice =
        rebarPrices[currentQsSettings.lintelRebarSize] || 0;

      if (currentQsSettings.includesLintels) {
        // Calculate lintel concrete cost
        const lintelsConcreteCost =
          lintels.materials.cementBags * cementPrice +
          lintels.materials.sand * sandPrice +
          lintels.materials.ballast * ballastPrice +
          (lintels.materials.water / 1000) * waterPrice;

        // Calculate lintel reinforcement cost
        const lintelsReinforcementCost =
          lintels.reinforcement * lintelRebarPrice;
        const totalLintelsCost =
          (lintelsConcreteCost + lintelsReinforcementCost) *
          efficiencyMultiplier;

        totalProfessionalCost += totalLintelsCost;
      }

      // Calculate wall reinforcement
      if (currentQsSettings.includesReinforcement) {
        const reinforcement = calculateReinforcement(room, currentQsSettings);
        const bedJointRebarPrice =
          rebarPrices[currentQsSettings.bedJointRebarSize] || 0;
        const verticalRebarPrice =
          rebarPrices[currentQsSettings.verticalRebarSize] || 0;

        const reinforcementCost =
          reinforcement.bedJointWeight * bedJointRebarPrice +
          reinforcement.verticalWeight * verticalRebarPrice;
        const adjustedReinforcementCost =
          reinforcementCost * efficiencyMultiplier;

        totalProfessionalCost += adjustedReinforcementCost;
      }

      // Calculate DPC
      if (currentQsSettings.includesDPC) {
        const dpcArea = calculateDPC(room, currentQsSettings);
        const dpcCost = getDPCPrice(dpcArea, quote.dpcType || "Polyethylene");
        totalProfessionalCost += dpcCost;
      }

      // Calculate movement joints
      if (currentQsSettings.includesMovementJoints) {
        const movementJoints = calculateMovementJoints(room, currentQsSettings);
        const movementJointsCost = movementJoints.sealant * sealantPrice;
        totalProfessionalCost += movementJointsCost;
      }

      // Calculate scaffolding
      if (currentQsSettings.includesScaffolding) {
        const scaffoldingCost = calculateScaffolding(room, currentQsSettings);
        totalProfessionalCost += scaffoldingCost;
      }

      // Calculate waste removal
      if (currentQsSettings.includesWasteRemoval) {
        const wasteRemovalCost = calculateWasteRemoval(room, currentQsSettings);
        totalProfessionalCost += wasteRemovalCost;
      }

      return totalProfessionalCost;
    },
    [
      materials,
      getMaterialPrice,
      rebarPrices,
      calculateLintels,
      calculateReinforcement,
      calculateDPC,
      calculateMovementJoints,
      calculateScaffolding,
      calculateWasteRemoval,
    ]
  );

  const calculateMortarCost = useCallback(
    (
      mortarMaterials: { cementBags: number; sandM3: number },
      efficiencyMultiplier: number = 1.0
    ): number => {
      const cementPrice =
        materials.find((m) => m.name?.toLowerCase() === "cement")?.price || 0;
      const sandPrice =
        materials.find((m) => m.name?.toLowerCase() === "sand")?.price || 0;

      return (
        (mortarMaterials.cementBags * cementPrice +
          mortarMaterials.sandM3 * sandPrice) *
        efficiencyMultiplier
      );
    },
    [materials]
  );

  const calculatePlasterCost = useCallback(
    (
      room: Room,
      netPlasterArea: number,
      efficiencyMultiplier: number = 1.0
    ): number => {
      const cementPrice =
        materials.find((m) => m.name?.toLowerCase() === "cement")?.price || 0;
      const sandPrice =
        materials.find((m) => m.name?.toLowerCase() === "sand")?.price || 0;

      const plasterVolume = netPlasterArea * PLASTER_THICKNESS;
      const plasterRatio = qsSettings.mortarRatio || "1:4";
      const plasterMaterials = calculateMortarMaterials(
        plasterVolume,
        plasterRatio
      );

      return (
        (plasterMaterials.cementBags * cementPrice +
          plasterMaterials.sandM3 * sandPrice) *
        efficiencyMultiplier
      );
    },
    [materials, calculateMortarMaterials]
  );

  const calculateMasonry = useCallback(() => {
    if (!rooms.length || !rooms.some(validateRoomDimensions)) return;
    const currentQsSettings = quote?.qsSettings || qsSettings;
    const waterPrice =
      materials.find((m) => m.name?.toLowerCase() === "water")?.price || 0;

    const lintelRebarPrice =
      rebarPrices[currentQsSettings.lintelRebarSize] || 0;
    const verticalRebarPrice =
      rebarPrices[currentQsSettings.verticalRebarSize] || 0;
    const bedJointRebarPrice =
      rebarPrices[currentQsSettings.bedJointRebarSize] || 0;
    let totals: CalculationTotals = {
      netArea: 0,
      netBlocks: 0,
      netMortar: 0,
      netPlaster: 0,
      netCement: 0,
      netSand: 0,
      netWater: 0,
      netDoors: 0,
      netWindows: 0,
      netDoorFrames: 0,
      netWindowFrames: 0,
      grossArea: 0,
      grossBlocks: 0,
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
      netReinforcementKg: 0,
      netReinforcementBars: 0,
      netDPC: 0,
      netSealantLiters: 0,
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

      grossReinforcementKg: 0,
      grossReinforcementBars: 0,
      grossDPC: 0,
      grossSealantLiters: 0,
      waterPrice,
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
    const updatedRooms = rooms.map((room, index) => {
      if (!validateRoomDimensions(room)) {
        return { ...room, totalCost: 0 };
      }
      const blockPrice = room.customBlock?.price
        ? Number(room.customBlock.price)
        : getMaterialPrice("Bricks", room.blockType);
      const cementPrice = materials.find(
        (m) => m.name?.toLowerCase() === "cement"
      )?.price;
      const sandPrice = materials.find(
        (m) => m.name?.toLowerCase() === "sand"
      )?.price;
      const ballastMat = materials.find(
        (m) => m.name?.toLowerCase() === "ballast"
      );
      const aggregateMat = materials.find(
        (m) => m.name?.toLowerCase() === "aggregate"
      );
      const formworkMat = materials.find(
        (m) => m.name?.toLowerCase() === "formwork"
      );
      const grossWallArea = calculateWallArea(room);
      const openingsArea = calculateOpeningsArea(room);
      const netWallArea = Math.max(0, grossWallArea - openingsArea);

      // Phase 4: Use centre-line method (only method now)
      let netBlocks = getBlockCountCentreLinMethod(room);
      let calculationAssumptions = null;

      // Apply efficiency bonus to costs
      const efficiencyMultiplier = 1;

      // Apply efficiency bonus to block count
      const adjustedNetBlocks = Math.ceil(netBlocks * efficiencyMultiplier);
      // Add these helper functions for cost calculations

      // Calculate mortar with connectivity adjustments
      const mortarRatio = quote?.mortarRatio || "1:4";
      const netMortarVolume = netWallArea * MORTAR_PER_SQM;
      const mortarMaterials = calculateMortarMaterials(
        netMortarVolume,
        mortarRatio
      );

      // Calculate plaster area considering connectivity
      let netPlasterArea = 0;
      if (room.plaster === "One Side") {
        netPlasterArea = netWallArea;
      } else if (room.plaster === "Both Sides") {
        netPlasterArea = netWallArea * 2;
      }

      // Calculate openings costs with connectivity consideration
      const openingsCost = calculateOpeningsCost(room);

      // Apply efficiency bonus to costs
      const netBlocksCost =
        adjustedNetBlocks * blockPrice * efficiencyMultiplier;
      const netMortarCost = calculateMortarCost(
        mortarMaterials,
        efficiencyMultiplier
      );
      const netPlasterCost = calculatePlasterCost(
        room,
        netPlasterArea,
        efficiencyMultiplier
      );

      // Calculate professional elements with connectivity
      const professionalElementsCost =
        calculateProfessionalElementsWithConnectivity(
          room,
          currentQsSettings,
          efficiencyMultiplier
        );

      // Calculate gross quantities with wastage
      const grossBlocks = Math.ceil(
        adjustedNetBlocks * (1 + currentQsSettings.wastageMasonry / 100)
      );
      const waterMat = materials.find((m) => m.name?.toLowerCase() === "water");
      const blockAreaWithJoint = getBlockAreaWithJoint(room);

      const netMortarCementKg = mortarMaterials.cementKg;
      const grossMortarCementKg =
        netMortarCementKg * (1 + currentQsSettings.wastageMasonry / 100);
      const netMortarSandM3 = mortarMaterials.sandM3;
      const grossMortarSandM3 =
        netMortarSandM3 * (1 + currentQsSettings.wastageMasonry / 100);
      const netPlasterVolume = netPlasterArea * PLASTER_THICKNESS;

      // For plaster - you might want a separate ratio or use the same
      const plasterRatio =
        currentQsSettings.plaster_ratio || quote.mortarRatio || "1:4";
      const plasterMaterials = calculateMortarMaterials(
        netPlasterVolume,
        plasterRatio
      );

      const netPlasterCementKg = plasterMaterials.cementKg;
      const grossPlasterCementKg =
        netPlasterCementKg * (1 + currentQsSettings.wastageMasonry / 100);
      const netPlasterSandM3 = plasterMaterials.sandM3;
      const grossPlasterSandM3 =
        netPlasterSandM3 * (1 + currentQsSettings.wastageMasonry / 100);
      const mortarWater = calculateWaterRequirements(
        netMortarCementKg,
        netMortarSandM3,
        currentQsSettings
      );
      const plasterWater = calculateWaterRequirements(
        netPlasterCementKg,
        netPlasterSandM3,
        currentQsSettings
      );
      let netDoors = 0,
        netWindows = 0,
        netDoorFrames = 0,
        netWindowFrames = 0;
      let netDoorsCost = 0,
        netWindowsCost = 0,
        netDoorFramesCost = 0,
        netWindowFramesCost = 0;

      room.doors.forEach((door) => {
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

        door.price = doorPrice.toString();
        door.frame.price = framePrice.toString();
        netDoorsCost += doorPrice * door.count;
        netDoorFramesCost += framePrice * door.count;
        netDoors += door.count;
        netDoorFrames += door.count;
      });

      room.windows.forEach((window) => {
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

        window.price = windowPrice.toString();
        window.frame.price = framePrice.toString();
        netWindowsCost += windowPrice * window.count;
        netWindowFramesCost += framePrice * window.count;
        netWindows += window.count;
        netWindowFrames += window.count;
      });

      const netOpeningsCost =
        (netDoorsCost +
          netWindowsCost +
          netDoorFramesCost +
          netWindowFramesCost) *
        (1 + currentQsSettings.wastageMasonry / 100);
      const grossDoors = Math.ceil(
        netDoors * (1 + currentQsSettings.wastageMasonry / 100)
      );
      const grossWindows = Math.ceil(
        netWindows * (1 + currentQsSettings.wastageMasonry / 100)
      );
      const grossDoorFrames = Math.ceil(
        netDoorFrames * (1 + currentQsSettings.wastageMasonry / 100)
      );
      const grossWindowFrames = Math.ceil(
        netWindowFrames * (1 + currentQsSettings.wastageMasonry / 100)
      );
      // Calculate professional QS elements
      const lintels = calculateLintels(room, currentQsSettings);
      const reinforcement = calculateReinforcement(room, currentQsSettings);
      const dpcArea = calculateDPC(room, currentQsSettings);
      const movementJoints = calculateMovementJoints(room, currentQsSettings);
      const scaffoldingCost = calculateScaffolding(room, currentQsSettings);
      const wasteRemovalCost = calculateWasteRemoval(room, currentQsSettings);

      const dpcPrice = getMaterialPrice("DPC", "Polyethylene");
      const sealantPrice = getMaterialPrice("Sealant", "Polyurethane");

      // Calculate costs for lintels
      const lintelsConcreteCost =
        (lintels.materials.cementBags * cementPrice || 0) +
        (lintels.materials.sand * sandPrice || 0) +
        (lintels.materials.ballast * ballastMat?.price || 0) +
        ((lintels.materials.water / 1000) * waterPrice || 0); // Convert liters to m³

      const lintelsReinforcementCost = lintels.reinforcement * lintelRebarPrice;

      // Calculate costs for reinforcement
      const reinforcementCost =
        reinforcement.bedJointWeight * bedJointRebarPrice +
        reinforcement.verticalWeight * verticalRebarPrice;

      const dpcCost = dpcArea * dpcPrice;
      const movementJointsCost = movementJoints.sealant * sealantPrice;

      const totalNetWater =
        mortarWater.totalWaterL +
        plasterWater.totalWaterL +
        lintels.materials.water;
      const totalNetCementKg =
        netMortarCementKg + netPlasterCementKg + lintels.materials.cementBags;
      const totalNetSandM3 =
        netMortarSandM3 + netPlasterSandM3 + lintels.materials.sand;

      const netWaterCost = currentQsSettings.clientProvidesWater
        ? 0
        : (totalNetWater / 1000) * waterPrice;

      const netRoomTotalCost =
        netBlocksCost +
        netMortarCost +
        netPlasterCost +
        netOpeningsCost +
        netWaterCost +
        professionalElementsCost +
        dpcCost;

      const grossCementKg =
        Math.ceil(
          totalNetCementKg * (1 + currentQsSettings.wastageMasonry / 100)
        ) / CEMENT_BAG_KG;
      const grossSandM3 =
        totalNetSandM3 * (1 + currentQsSettings.wastageMasonry / 100);
      const grossWater =
        totalNetWater * (1 + currentQsSettings.wastageWater / 100);

      const grossBlocksCost = grossBlocks * blockPrice;
      const grossMortarCost =
        (grossMortarCementKg / CEMENT_BAG_KG) * cementPrice +
        grossMortarSandM3 * sandPrice;
      const grossPlasterCost =
        (grossPlasterCementKg / CEMENT_BAG_KG) * cementPrice +
        grossPlasterSandM3 * sandPrice;
      const grossWaterCost = currentQsSettings.clientProvidesWater
        ? 0
        : (grossWater / 1000) * waterPrice;
      const grossDoorsCost =
        grossDoors * (netDoorsCost / Math.max(netDoors, 1));
      const grossWindowsCost =
        grossWindows * (netWindowsCost / Math.max(netWindows, 1));
      const grossDoorFramesCost =
        grossDoorFrames * (netDoorFramesCost / Math.max(netDoorFrames, 1));
      const grossWindowFramesCost =
        grossWindowFrames *
        (netWindowFramesCost / Math.max(netWindowFrames, 1));
      const grossOpeningsCost =
        grossDoorsCost +
        grossWindowsCost +
        grossDoorFramesCost +
        grossWindowFramesCost;
      const grossRoomTotalCost =
        grossBlocksCost +
        grossMortarCost +
        grossPlasterCost +
        grossOpeningsCost +
        grossWaterCost +
        professionalElementsCost +
        dpcCost;
      totals.netLintelsCost += lintelsConcreteCost;
      totals.grossLintelsCost += lintelsConcreteCost;

      totals.netLintelRebar += lintels.reinforcement;
      totals.grossLintelRebar += lintels.reinforcement;
      totals.netLintelRebarCost += lintelsReinforcementCost;
      totals.grossLintelRebarCost += lintelsReinforcementCost;

      totals.netWallRebar +=
        reinforcement.bedJointWeight + reinforcement.verticalWeight;
      totals.grossWallRebar +=
        reinforcement.bedJointWeight + reinforcement.verticalWeight;
      totals.netWallRebarCost += reinforcementCost;
      totals.grossWallRebarCost += reinforcementCost;

      totals.netDPCArea += dpcArea;
      totals.grossDPCArea += dpcArea;
      totals.netDPCCost += dpcCost;
      totals.grossDPCCost += dpcCost;

      totals.netMovementJoints += movementJoints.length;
      totals.grossMovementJoints += movementJoints.length;
      totals.netMovementJointsCost += movementJointsCost;
      totals.grossMovementJointsCost += movementJointsCost;

      // For scaffolding, calculate area (you might want to track this differently)
      const scaffoldingArea =
        2 * (Number(room.length) + Number(room.width)) * Number(room.height);
      totals.netScaffoldingArea += scaffoldingArea;
      totals.grossScaffoldingArea += scaffoldingArea;
      totals.netScaffoldingCost += scaffoldingCost;
      totals.grossScaffoldingCost += scaffoldingCost;

      // For waste, calculate volume
      const wasteVolume = scaffoldingArea * 0.05 * 0.2; // Same calculation as in calculateWasteRemoval
      totals.netWasteVolume += wasteVolume;
      totals.grossWasteVolume += wasteVolume;
      totals.netWasteRemovalCost += wasteRemovalCost;
      totals.grossWasteRemovalCost += wasteRemovalCost;

      // Total professional elements cost
      const roomProfessionalElementsCost = professionalElementsCost;
      totals.professionalElementsTotalCost += roomProfessionalElementsCost;
      totals.netArea += netWallArea;
      totals.netBlocks += netBlocks;
      totals.netMortar += netMortarVolume;
      totals.netPlaster += netPlasterArea;
      totals.netCement += totalNetCementKg;
      totals.netSand += totalNetSandM3;
      totals.netWater += totalNetWater;
      totals.netDoors += netDoors;
      totals.netWindows += netWindows;
      totals.netDoorFrames += netDoorFrames;
      totals.netWindowFrames += netWindowFrames;
      totals.grossArea += grossWallArea;
      totals.grossBlocks += grossBlocks;
      totals.grossMortar += netMortarVolume;
      totals.grossPlaster += netPlasterArea;
      totals.grossCement += grossCementKg;
      totals.grossSand += grossSandM3;
      totals.grossWater += grossWater;
      totals.grossDoors += grossDoors;
      totals.grossWindows += grossWindows;
      totals.grossDoorFrames += grossDoorFrames;
      totals.grossWindowFrames += grossWindowFrames;
      totals.netBlocksCost += netBlocksCost;
      totals.netMortarCost += netMortarCost;
      totals.netPlasterCost += netPlasterCost;
      totals.netWaterCost += netWaterCost;
      totals.netDoorsCost += netDoorsCost;
      totals.netWindowsCost += netWindowsCost;
      totals.netDoorFramesCost += netDoorFramesCost;
      totals.netWindowFramesCost += netWindowFramesCost;
      totals.netOpeningsCost += netOpeningsCost;
      totals.netTotalCost += netRoomTotalCost;
      totals.grossBlocksCost += grossBlocksCost;
      totals.grossMortarCost += grossMortarCost;
      totals.grossPlasterCost += grossPlasterCost;
      totals.grossWaterCost += grossWaterCost;
      totals.grossDoorsCost += grossDoorsCost;
      totals.grossWindowsCost += grossWindowsCost;
      totals.grossDoorFramesCost += grossDoorFramesCost;
      totals.grossWindowFramesCost += grossWindowFramesCost;
      totals.grossOpeningsCost += grossOpeningsCost;
      totals.grossTotalCost += grossRoomTotalCost;
      totals.breakdown.push({
        roomIndex: index + 1,
        roomType: room.roomType,
        room_name: room.room_name,
        grossWallArea,
        openingsArea,
        netPlasterArea,
        netWallArea,
        netBlocks,
        grossBlocks,
        totalCost: grossRoomTotalCost,
        professionalElements: {
          lintels: {
            concreteVolume: lintels.concrete,
            cementBags: lintels.materials.cementBags,
            sandM3: lintels.materials.sand,
            ballastM3: lintels.materials.ballast,
            waterL: lintels.materials.water,
            reinforcementKg: lintels.reinforcement,
            cost: lintelsConcreteCost + lintelsReinforcementCost,
          },
          reinforcement: {
            bedJointKg: reinforcement.bedJointWeight,
            verticalKg: reinforcement.verticalWeight,
            cost: reinforcementCost,
          },
          dpc: { areaM2: dpcArea, cost: dpcCost },
          sealant: { liters: movementJoints.sealant, cost: movementJointsCost },
          scaffolding: { cost: scaffoldingCost },
          wasteRemoval: { cost: wasteRemovalCost },
        },
      });
      return {
        ...room,
        netArea: netWallArea,
        netBlocks,
        grossBlocks,
        blockCost: grossBlocksCost,
        blockRate: blockPrice,
        netMortar: netMortarVolume,
        netPlaster: netPlasterArea,
        netCement: totalNetCementKg / CEMENT_BAG_KG,
        netSand: totalNetSandM3,
        netWater: totalNetWater,
        totalCost: grossRoomTotalCost,
        // Phase 4: Include calculation assumptions for display
        calculationAssumptions: calculationAssumptions,
      };
    });
    setQuote((prev) => ({
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
            unit: "m\u00B3",
          },
          {
            type: "plaster",
            netQuantity: totals.netPlaster,
            grossQuantity: totals.grossPlaster,
            netCost: totals.netPlasterCost,
            grossCost: totals.grossPlasterCost,
            unit: "m\u00B2",
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
          {
            type: "door_frames",
            netQuantity: totals.netDoorFrames,
            grossQuantity: totals.grossDoorFrames,
            netCost: totals.netDoorFramesCost,
            grossCost: totals.grossDoorFramesCost,
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
          // New professional elements
          {
            type: "concrete_lintels",
            netQuantity: totals.netConcrete,
            grossQuantity: totals.grossConcrete,
            netCost: totals.netLintelsCost || 0,
            grossCost: totals.grossLintelsCost || 0,
            unit: "m\u00B3",
          },
          {
            type: "lintel_reinforcement",
            netQuantity: totals.netLintelRebar || 0,
            grossQuantity: totals.grossLintelRebar || 0,
            netCost: totals.netLintelRebarCost || 0,
            grossCost: totals.grossLintelRebarCost || 0,
            unit: "kg",
          },
          {
            type: "wall_reinforcement",
            netQuantity: totals.netWallRebar || 0,
            grossQuantity: totals.grossWallRebar || 0,
            netCost: totals.netWallRebarCost || 0,
            grossCost: totals.grossWallRebarCost || 0,
            unit: "kg",
          },
          {
            type: "dpc",
            netQuantity: totals.netDPCArea || 0,
            grossQuantity: totals.grossDPCArea || 0,
            netCost: totals.netDPCCost || 0,
            grossCost: totals.grossDPCCost || 0,
            unit: "m\u00B2",
          },
          {
            type: "movement_joints",
            netQuantity: totals.netMovementJoints || 0,
            grossQuantity: totals.grossMovementJoints || 0,
            netCost: totals.netMovementJointsCost || 0,
            grossCost: totals.grossMovementJointsCost || 0,
            unit: "m",
          },
          {
            type: "scaffolding",
            netQuantity: totals.netScaffoldingArea || 0,
            grossQuantity: totals.grossScaffoldingArea || 0,
            netCost: totals.netScaffoldingCost || 0,
            grossCost: totals.grossScaffoldingCost || 0,
            unit: "m\u00B2\u00B7days",
          },
          {
            type: "waste_removal",
            netQuantity: totals.netWasteVolume || 0,
            grossQuantity: totals.grossWasteVolume || 0,
            netCost: totals.netWasteRemovalCost || 0,
            grossCost: totals.grossWasteRemovalCost || 0,
            unit: "m\u00B3",
          },
          ...(!currentQsSettings.clientProvidesWater
            ? [
                {
                  type: "water",
                  netQuantity: totals.netWater,
                  grossQuantity: totals.grossWater,
                  netCost: totals.netWaterCost,
                  grossCost: totals.grossWaterCost,
                  unit: "liters",
                },
              ]
            : []),
        ],
        clientProvidesWater: currentQsSettings.clientProvidesWater,
        cementWaterRatio: currentQsSettings.cementWaterRatio,
        waterPrice,
        professionalElements: {
          includesLintels: currentQsSettings.includesLintels,
          includesReinforcement: currentQsSettings.includesReinforcement,
          includesDPC: currentQsSettings.includesDPC,
          includesScaffolding: currentQsSettings.includesScaffolding,
          includesMovementJoints: currentQsSettings.includesMovementJoints,
          includesWasteRemoval: currentQsSettings.includesWasteRemoval,
          totalCost: totals.professionalElementsTotalCost || 0,
        },
        summary: {
          netTotalCost: totals.netTotalCost,
          grossTotalCost: totals.grossTotalCost,
          totalWastageCost: totals.grossTotalCost - totals.netTotalCost,
          wastagePercentage:
            ((totals.grossTotalCost - totals.netTotalCost) /
              totals.netTotalCost) *
              100 || 0,
          professionalElementsBreakdown: {
            lintels: totals.netLintelsCost || 0,
            reinforcement:
              (totals.netLintelRebarCost || 0) + (totals.netWallRebarCost || 0),
            dpc: totals.netDPCCost || 0,
            movementJoints: totals.netMovementJointsCost || 0,
            scaffolding: totals.netScaffoldingCost || 0,
            wasteRemoval: totals.netWasteRemovalCost || 0,
          },
        },
      },
      rooms: updatedRooms,
    }));
    setResults(totals);
  }, [
    rooms,
    quote?.qsSettings,
    materials,
    validateRoomDimensions,
    getMaterialPrice,
    calculateWallArea,
    calculateOpeningsArea,
    getBlockAreaWithJoint,
    calculateWaterRequirements,
    calculateLintels,
    getRebarPrice,
    calculateReinforcement,
    calculateDPC,
    calculateMovementJoints,
    calculateScaffolding,
    calculateWasteRemoval,
    setQuote,
    qsSettings,
  ]);
  useEffect(() => {
    if (quote?.rooms && quote.rooms.length > 0) {
      calculateMasonry();
    }
  }, [rooms]);

  return {
    rooms,
    addRoom,
    removeRoom,
    handleRoomChange,
    handleNestedChange,
    addDoor,
    addWindow,
    removeNested,
    removeEntry,
    materials,
    results,
    calculateMasonry,
    getMaterialPrice,
    materialBasePrices,
    qsSettings,
    waterPrice: results.waterPrice,
  };
}
