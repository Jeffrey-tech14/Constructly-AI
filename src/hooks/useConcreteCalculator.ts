// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useCallback, useEffect, useState } from "react";
import { RebarSize } from "./useRebarCalculator";
import { MasonryQSSettings } from "./useMasonryCalculatorNew";

export type Category = "substructure" | "superstructure";
export type ElementType =
  | "slab"
  | "beam"
  | "column"
  | "septic-tank"
  | "underground-tank"
  | "staircase"
  | "ring-beam"
  | "strip-footing"
  | "raft-foundation"
  | "pile-cap"
  | "water-tank"
  | "ramp"
  | "retaining-wall"
  | "culvert"
  | "swimming-pool"
  | "paving"
  | "kerb"
  | "drainage-channel"
  | "manhole"
  | "inspection-chamber"
  | "soak-pit"
  | "soakaway";

export interface FoundationStep {
  id: string;
  length: string;
  width: string;
  depth: string;
  offset: string;
}

export interface ConnectionDetails {
  lapLength?: number;
  developmentLength?: number;
  hookType?: "standard" | "seismic" | "special";
  spliceType?: "lap" | "mechanical" | "welded";
}

export interface WaterproofingDetails {
  includesDPC: boolean;
  dpcWidth?: string;
  dpcMaterial?: string;
  dpcSize?: string; // New: selected size from DPC options
  includesPolythene: boolean;
  polytheneGauge?: string;
  includesWaterproofing: boolean;
  waterproofingType?: "bituminous" | "crystalline" | "membrane";
}

export interface DPCPricing {
  type: string; // e.g., "Polyethylene", "Bituminous Felt", "PVC DPC Roll"
  sizes_m: string[]; // e.g., ["0.15 × 30", "0.20 × 30"]
  price_kes: Record<string, number>; // e.g., { "0.15 × 30 m": 1800 }
  thickness_mm: number[]; // e.g., [250, 500, 1000]
}

export interface SepticTankDetails {
  capacity: string;
  numberOfChambers: number;
  wallThickness: string;
  baseThickness: string;
  coverType: "slab" | "precast" | "none";
  depth: string;
  includesBaffles: boolean;
  includesManhole: boolean;
  manholeSize?: string;
}

export interface UndergroundTankDetails {
  capacity: string;
  wallThickness: string;
  baseThickness: string;
  coverType: "slab" | "precast" | "none";
  includesManhole: boolean;
  manholeSize?: string;
  waterProofingRequired: boolean;
}

export interface SoakPitDetails {
  diameter: string;
  depth: string;
  wallThickness: string;
  baseThickness: string;
  liningType: "brick" | "concrete" | "precast";
  includesGravel: boolean;
  gravelDepth?: string;
  includesGeotextile: boolean;
}

export interface SoakawayDetails {
  length: string;
  width: string;
  depth: string;
  wallThickness: string;
  baseThickness: string;
  includesGravel: boolean;
  gravelDepth?: string;
  includesPerforatedPipes: boolean;
}

export interface ConcreteRow {
  id: string;
  name: string;
  element: ElementType;
  length: string;
  width: string;
  height: string;
  mix: string;
  formwork?: string;
  category: Category;
  number: string;
  hasConcreteBed?: boolean;
  bedDepth?: string;
  hasAggregateBed?: boolean;
  aggregateDepth?: string;
  hasBlinding?: boolean;
  blindingDepth?: string;
  blindingRatio?: string;
  blindingMix?: string;
  hasMaramBlinding?: boolean;
  maramBlindingDepth?: string;
  hasAntiTermiteTreatment?: boolean;
  hasCompaction?: boolean;
  compactionArea?: string;
  hasReturnFill?: boolean;
  returnFillDepth?: string;
  hasBackFill?: boolean;
  backFillDepth?: string;

  foundationType?: string;
  clientProvidesWater?: boolean;
  cementWaterRatio?: string;

  isSteppedFoundation?: boolean;
  foundationSteps?: FoundationStep[];
  totalFoundationDepth?: string;

  waterproofing?: WaterproofingDetails;

  reinforcement?: {
    mainBarSize?: RebarSize;
    mainBarSpacing?: string;
    distributionBarSize?: RebarSize;
    distributionBarSpacing?: string;
    connectionDetails?: ConnectionDetails;
  };

  staircaseDetails?: {
    riserHeight?: number;
    treadWidth?: number;
    numberOfSteps?: number;
  };

  tankDetails?: {
    capacity?: string;
    wallThickness?: string;
    coverType?: string;
  };

  septicTankDetails?: SepticTankDetails;
  undergroundTankDetails?: UndergroundTankDetails;
  soakPitDetails?: SoakPitDetails;
  soakawayDetails?: SoakawayDetails;

  slabArea?: string;
  verandahArea?: string;
  corridorLobbyArea?: string;

  // Area selection fields - choose between direct area input or length x width
  areaSelectionMode?: "LENGTH_WIDTH" | "DIRECT_AREA"; // "LENGTH_WIDTH" or "DIRECT_AREA"
  area?: string; // Direct area input (m²) when using DIRECT_AREA mode
}

export interface ConcreteResult {
  id: string;
  name: string;
  element: ElementType;
  volumeM3: number;
  cementBags: number;
  sandM3: number;
  stoneM3: number;
  number: string;
  totalVolume: number;
  formworkM2: number;
  bedVolume?: number;
  bedArea?: number;
  aggregateVolume?: number;
  aggregateArea?: number;

  waterRequired?: number;
  waterCost?: number;
  cementWaterRatio?: number;
  netCementBags: number;
  netSandM3: number;
  netStoneM3: number;
  netWaterRequiredL: number;

  blocksCost?: number;
  grossCementBags: number;
  grossSandM3: number;
  grossStoneM3: number;
  grossWaterRequiredL: number;
  waterMixingL: number;
  waterCuringL: number;
  waterOtherL: number;
  waterAggregateAdjustmentL: number;
  materialCost: number;
  totalConcreteCost: number;
  unitRate: number;

  steppedFoundationVolume?: number;
  dpcArea?: number;
  dpcCost?: number;
  polytheneArea?: number;
  polytheneCost?: number;
  waterproofingArea?: number;
  waterproofingCost?: number;
  connectionDetails?: ConnectionDetails;
  gravelVolume?: number;
  gravelCost?: number;
  blindingVolume?: number;
  blindingCost?: number;
  maramBlindingVolume?: number;
  maramBlindingCost?: number;
  compactionArea?: number;
  compactionCost?: number;
  antiTermiteTreatmentArea?: number;
  antiTermiteTreatmentCost?: number;
  returnFillVolume?: number;
  returnFillCost?: number;
  backFillVolume?: number;
  backFillCost?: number;

  // Area selection fields - persisted from input
  areaSelectionMode?: "LENGTH_WIDTH" | "DIRECT_AREA"; // "LENGTH_WIDTH" or "DIRECT_AREA"
  area?: number; // Direct area (m²) when using DIRECT_AREA mode
}

const CEMENT_DENSITY = 1440;
const SAND_DENSITY = 1600;
const STONE_DENSITY = 1500;
const CEMENT_BAG_KG = 50;
const CEMENT_BAG_VOLUME_M3 = 0.035;
const METERS_TO_FEET = 3.28084;
const STANDARD_MIXES: {
  [key: string]: {
    cement: number;
    sand: number;
    stone: number;
  };
} = {
  "1:2:4": { cement: 1, sand: 2, stone: 4 },
  "1:1.5:3": { cement: 1, sand: 1.5, stone: 3 },
  "1:3:6": { cement: 1, sand: 3, stone: 6 },
  "1:4:8": { cement: 1, sand: 4, stone: 8 },
};

const MORTAR_DRY_VOLUME_FACTOR = 1.3;
const STANDARD_BLOCK_SIZE = { length: 0.4, height: 0.2, thickness: 0.2 };
const BRICK_SIZE = { length: 0.225, height: 0.075, thickness: 0.1125 };

function parseMortarRatio(ratio: string): {
  sand: number;
  cement: number;
} {
  if (!ratio) return { cement: 1, sand: 4 };
  const parts = ratio.split(":").map((part) => parseFloat(part.trim()));
  if (parts.length !== 2 || parts.some(isNaN) || parts.some((p) => p <= 0)) {
    return { cement: 1, sand: 4 };
  }
  return { cement: parts[0], sand: parts[1] };
}

export function parseMix(mix?: string): {
  cement: number;
  sand: number;
  stone: number;
} {
  if (!mix) return STANDARD_MIXES["1:2:4"];
  return STANDARD_MIXES[mix] || STANDARD_MIXES["1:2:4"];
}

export function parseCementWaterRatio(ratio: string): number {
  const parsed = parseFloat(ratio);
  return isNaN(parsed) || parsed <= 0 ? 0.5 : parsed;
}

export function calculateConcreteMaterials(
  volumeM3: number,
  mix: string,
  settings: MasonryQSSettings,
): {
  cementBags: number;
  sandM3: number;
  stoneM3: number;
  cementMass: number;
  sandMass: number;
  stoneMass: number;
} {
  const mixRatio = parseMix(mix);
  const totalParts = mixRatio.cement + mixRatio.sand + mixRatio.stone;
  const cementVolumeM3 = (mixRatio.cement / totalParts) * volumeM3;
  const sandVolumeM3 = (mixRatio.sand / totalParts) * volumeM3;
  const stoneVolumeM3 = (mixRatio.stone / totalParts) * volumeM3;
  const cementBags = cementVolumeM3 / CEMENT_BAG_VOLUME_M3;
  const sandM3 = sandVolumeM3;
  const stoneM3 = stoneVolumeM3;
  const cementMass = cementVolumeM3 * CEMENT_DENSITY;
  const sandMass = sandVolumeM3 * SAND_DENSITY;
  const stoneMass = stoneVolumeM3 * STONE_DENSITY;
  return {
    cementBags,
    sandM3,
    stoneM3,
    cementMass,
    sandMass,
    stoneMass,
  };
}

export function calculateWaterRequirements(
  cementMass: number,
  cementWaterRatio: string,
  settings: MasonryQSSettings,
  sandMass: number,
  stoneMass: number,
  surfaceAreaM2: number,
  totalConcreteVolume: number,
): {
  waterMixingL: number;
  waterCuringL: number;
  waterOtherL: number;
  waterAggregateAdjustmentL: number;
  totalWaterL: number;
} {
  const ratio = parseCementWaterRatio(cementWaterRatio);
  const hydrationWater = cementMass * ratio;
  const waterInSand =
    sandMass * (settings.aggregateMoistureContentPercent / 100);
  const waterInStone =
    stoneMass * (settings.aggregateMoistureContentPercent / 100);
  const waterAbsorbedBySand =
    sandMass * (settings.aggregateAbsorptionPercent / 100);
  const waterAbsorbedByStone =
    stoneMass * (settings.aggregateAbsorptionPercent / 100);
  const totalWaterInAggregate = waterInSand + waterInStone;
  const totalWaterAbsorbed = waterAbsorbedBySand + waterAbsorbedByStone;
  const waterAggregateAdjustment = totalWaterInAggregate - totalWaterAbsorbed;
  const waterMixingL = Math.max(0, hydrationWater - waterAggregateAdjustment);
  const waterCuringL =
    surfaceAreaM2 * settings.curingWaterRateLM2PerDay * settings.curingDays;
  const waterOtherL = totalConcreteVolume * settings.otherSiteWaterAllowanceLM3;
  const totalWaterL = waterMixingL + waterCuringL + waterOtherL;
  return {
    waterMixingL,
    waterCuringL,
    waterOtherL,
    waterAggregateAdjustmentL: waterAggregateAdjustment,
    totalWaterL,
  };
}

export function calculateMasonryQuantities(
  wallLength: number,
  wallHeight: number,
  wallThickness: number,
  blockDimensions: string,
  settings: MasonryQSSettings,
): {
  blocks: number;
  mortarVolume: number;
} {
  const [bL, bH, bT] = blockDimensions?.split("x").map(parseFloat) || [
    0.4, 0.4, 0.2,
  ];
  const joint = settings.mortarJointThicknessM;
  const blocksLength = Math.ceil(wallLength / (bL + joint));
  const blocksHeight = Math.ceil(wallHeight / (bH + joint));
  const blocksThickness = Math.ceil(wallThickness / bT);
  const totalBlocks = blocksLength * blocksHeight * blocksThickness;
  const horizontalJointVolume =
    wallLength * wallThickness * joint * blocksHeight;
  const verticalJointVolume = wallHeight * wallThickness * joint * blocksLength;
  const mortarVolume = horizontalJointVolume + verticalJointVolume;
  return {
    blocks: totalBlocks,
    mortarVolume,
  };
}

function calculateSteppedFoundationVolume(
  steps: FoundationStep[],
  num: number,
): number {
  return steps.reduce((total, step) => {
    const len = parseFloat(step.length) || 0;
    const wid = parseFloat(step.width) || 0;
    const depth = parseFloat(step.depth) || 0;
    return total + len * wid * depth * num;
  }, 0);
}

function calculateSepticTankQuantities(details: SepticTankDetails): {
  wallVolume: number;
  baseVolume: number;
  coverVolume: number;
  totalVolume: number;
  surfaceArea: number;
} {
  const capacity = parseFloat(details.capacity) || 0;
  const wallThickness = parseFloat(details.wallThickness) || 0.2;
  const baseThickness = parseFloat(details.baseThickness) || 0.25;
  const depth = parseFloat(details.depth) || 1.5;

  const width = Math.cbrt(capacity / (2 * depth));
  const length = 2 * width;

  const wallVolume = 2 * (length + width) * depth * wallThickness;
  const baseVolume = length * width * baseThickness;
  const coverVolume = details.coverType === "slab" ? length * width * 0.15 : 0;
  const totalVolume = wallVolume + baseVolume + coverVolume;
  const surfaceArea = 2 * (length + width) * depth + length * width;

  return {
    wallVolume,
    baseVolume,
    coverVolume,
    totalVolume,
    surfaceArea,
  };
}

function calculateUndergroundTankQuantities(details: UndergroundTankDetails): {
  wallVolume: number;
  baseVolume: number;
  coverVolume: number;
  totalVolume: number;
  surfaceArea: number;
} {
  const capacity = parseFloat(details.capacity) || 0;
  const wallThickness = parseFloat(details.wallThickness) || 0.2;
  const baseThickness = parseFloat(details.baseThickness) || 0.25;

  const side = Math.cbrt(capacity);
  const wallVolume = 4 * side * side * wallThickness;
  const baseVolume = side * side * baseThickness;
  const coverVolume = details.coverType === "slab" ? side * side * 0.15 : 0;
  const totalVolume = wallVolume + baseVolume + coverVolume;
  const surfaceArea = 4 * side * side + side * side;

  return {
    wallVolume,
    baseVolume,
    coverVolume,
    totalVolume,
    surfaceArea,
  };
}

function calculateSoakPitQuantities(details: SoakPitDetails): {
  wallVolume: number;
  baseVolume: number;
  coverVolume: number;
  totalVolume: number;
  surfaceArea: number;
  gravelVolume?: number;
} {
  const diameter = parseFloat(details.diameter) || 0;
  const depth = parseFloat(details.depth) || 0;
  const wallThickness = parseFloat(details.wallThickness) || 0.15;
  const baseThickness = parseFloat(details.baseThickness) || 0.2;
  const gravelDepth = parseFloat(details.gravelDepth) || 0.3;

  const radius = diameter / 2;
  const innerRadius = radius - wallThickness;

  const wallVolume =
    Math.PI * (radius * radius - innerRadius * innerRadius) * depth;
  const baseVolume = Math.PI * radius * radius * baseThickness;
  const coverVolume =
    details.liningType === "precast" ? 0 : Math.PI * radius * radius * 0.15;
  const totalVolume = wallVolume + baseVolume + coverVolume;
  const surfaceArea = 2 * Math.PI * radius * depth + Math.PI * radius * radius;

  const result: any = {
    wallVolume,
    baseVolume,
    coverVolume,
    totalVolume,
    surfaceArea,
  };

  if (details.includesGravel) {
    result.gravelVolume = Math.PI * innerRadius * innerRadius * gravelDepth;
  }

  return result;
}

function calculateSoakawayQuantities(details: SoakawayDetails): {
  wallVolume: number;
  baseVolume: number;
  totalVolume: number;
  surfaceArea: number;
  gravelVolume?: number;
} {
  const length = parseFloat(details.length) || 0;
  const width = parseFloat(details.width) || 0;
  const depth = parseFloat(details.depth) || 0;
  const wallThickness = parseFloat(details.wallThickness) || 0.15;
  const baseThickness = parseFloat(details.baseThickness) || 0.2;
  const gravelDepth = parseFloat(details.gravelDepth) || 0.3;

  const externalLength = length;
  const externalWidth = width;
  const internalLength = length - 2 * wallThickness;
  const internalWidth = width - 2 * wallThickness;

  const longWallsVolume = 2 * externalLength * depth * wallThickness;
  const shortWallsVolume =
    2 * (externalWidth - 2 * wallThickness) * depth * wallThickness;
  const wallVolume = longWallsVolume + shortWallsVolume;
  const baseVolume = externalLength * externalWidth * baseThickness;
  const totalVolume = wallVolume + baseVolume;
  const surfaceArea =
    2 * (externalLength + externalWidth) * depth +
    externalLength * externalWidth;

  const result: any = {
    wallVolume,
    baseVolume,
    totalVolume,
    surfaceArea,
  };

  if (details.includesGravel) {
    result.gravelVolume = internalLength * internalWidth * gravelDepth;
  }

  return result;
}

function calculateSurfaceArea(
  element: ElementType,
  len: number,
  wid: number,
  hei: number,
  num: number,
  staircaseDetails?,
): number {
  switch (element) {
    case "slab":
    case "raft-foundation":
    case "paving":
      return len * wid * num;
    case "beam":
    case "ring-beam":
      return (2 * (len * hei) + len * wid) * num;
    case "column":
      return 2 * (len + wid) * hei * num;
    case "strip-footing":
    case "pile-cap":
      return len * wid * num;
    case "septic-tank":
    case "underground-tank":
    case "water-tank":
    case "swimming-pool":
      return 2 * (len + wid) * hei * num + len * wid * num;
    case "staircase":
      const treadWidth = staircaseDetails?.treadWidth || 0.3;
      const riserHeight = staircaseDetails?.riserHeight || 0.15;
      const steps = staircaseDetails?.numberOfSteps || 10;
      return (treadWidth + riserHeight) * wid * steps * num;
    case "ramp":
      return len * wid * num;
    case "retaining-wall":
      return len * hei * num * 2;
    case "culvert":
      return 2 * (len + wid) * hei * num + len * wid * num;
    case "kerb":
      return (2 * hei * len + wid * len) * num;
    case "drainage-channel":
      return (len * hei * 2 + len * wid) * num;
    case "manhole":
    case "inspection-chamber":
      const diameter = Math.sqrt(len * wid);
      const circumference = Math.PI * diameter;
      return (circumference * hei + len * wid) * num;
    case "soak-pit":
      const radius = len / 2;
      return (2 * Math.PI * radius * hei + Math.PI * radius * radius) * num;
    case "soakaway":
      return 2 * (len + wid) * hei * num + len * wid * num;
    default:
      return len * wid * num;
  }
}

export function calculateConcrete(
  row: ConcreteRow,
  materials: any[],
  settings: MasonryQSSettings,
  quote,
): ConcreteResult {
  const {
    length,
    width,
    height,
    mix,
    id,
    name,
    element,
    number,
    hasConcreteBed,
    bedDepth,
    hasAggregateBed,
    aggregateDepth,
    cementWaterRatio = settings.cementWaterRatio,
    staircaseDetails,
    tankDetails,
    isSteppedFoundation,
    foundationSteps = [],
    waterproofing,
    septicTankDetails,
    undergroundTankDetails,
    soakPitDetails,
    soakawayDetails,
    slabArea,
    verandahArea,
    areaSelectionMode,
    area,
  } = row;

  const len = parseFloat(length) || 0;
  const wid = parseFloat(width) || 0;
  const hei = parseFloat(height) || 0;
  const num = parseInt(number) || 1;
  const bedDepthNum = parseFloat(bedDepth) || 0;
  const aggregateDepthNum = parseFloat(aggregateDepth) || 0;

  // Handle area selection mode for non-slab elements
  let effectiveLen = len;
  let effectiveWid = wid;
  if (
    element !== "slab" &&
    areaSelectionMode === "DIRECT_AREA" &&
    area &&
    parseFloat(area) > 0
  ) {
    const directArea = parseFloat(area) || 0;
    if (directArea > 0) {
      if (wid > 0) {
        effectiveLen = directArea / wid;
      } else {
        effectiveLen = Math.sqrt(directArea);
        effectiveWid = effectiveLen;
      }
    }
  }

  let mainVolume = 0;
  let surfaceAreaM2 = 0;
  let formworkM2 = 0;
  let steppedFoundationVolume = 0;
  let gravelVolume = 0;

  switch (element) {
    case "slab":
      {
        let calculatedSlabArea = 0;

        // Use provided slabArea if available, otherwise calculate from length and width
        if (slabArea) {
          calculatedSlabArea = parseFloat(slabArea) || 0;
        } else {
          calculatedSlabArea = len * wid;
        }

        // Add verandah area if provided
        if (verandahArea) {
          calculatedSlabArea += parseFloat(verandahArea) || 0;
        }

        // Ensure area is not negative
        calculatedSlabArea = Math.max(0, calculatedSlabArea);

        mainVolume = calculatedSlabArea * hei * num;
        surfaceAreaM2 = calculatedSlabArea * num;
        formworkM2 = calculatedSlabArea * num;
      }
      break;

    case "raft-foundation":
      {
        let calculatedRaftArea = 0;

        // Use provided slabArea (reused for raft) if available, otherwise calculate from length and width
        if (slabArea) {
          calculatedRaftArea = parseFloat(slabArea) || 0;
        } else {
          calculatedRaftArea = len * wid;
        }

        // Ensure area is not negative
        calculatedRaftArea = Math.max(0, calculatedRaftArea);

        // Raft foundation volume calculation
        mainVolume = calculatedRaftArea * hei * num;
        surfaceAreaM2 = calculatedRaftArea * num;
        // Raft formwork is typically under side only (top is open for building)
        formworkM2 = calculatedRaftArea * num;
      }
      break;

    case "paving":
      {
        let calculatedPavingArea = 0;

        // Use provided slabArea (reused for paving) if available, otherwise calculate from length and width
        if (slabArea) {
          calculatedPavingArea = parseFloat(slabArea) || 0;
        } else {
          calculatedPavingArea = len * wid;
        }

        // Ensure area is not negative
        calculatedPavingArea = Math.max(0, calculatedPavingArea);

        // Paving volume calculation (length × width × thickness)
        mainVolume = calculatedPavingArea * hei * num;
        surfaceAreaM2 = calculatedPavingArea * num;
        // Paving typically has minimal formwork (temporary edge support)
        formworkM2 = 2 * (len + wid) * num;
      }
      break;

    case "beam":
    case "ring-beam":
      mainVolume = effectiveLen * effectiveWid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(
        element,
        effectiveLen,
        effectiveWid,
        hei,
        num,
      );
      formworkM2 = (2 * hei * effectiveLen + effectiveWid * effectiveLen) * num;
      break;

    case "column":
      mainVolume = effectiveLen * effectiveWid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(
        element,
        effectiveLen,
        effectiveWid,
        hei,
        num,
      );
      formworkM2 = 2 * (effectiveLen + effectiveWid) * hei * num;
      break;

    case "strip-footing":
    case "pile-cap":
      if (isSteppedFoundation && foundationSteps.length > 0) {
        steppedFoundationVolume = calculateSteppedFoundationVolume(
          foundationSteps,
          num,
        );
        mainVolume = steppedFoundationVolume;
        surfaceAreaM2 = effectiveLen * effectiveWid * num;
        formworkM2 = foundationSteps.reduce((total, step) => {
          const stepLen = parseFloat(step.length) || 0;
          const stepWid = parseFloat(step.width) || 0;
          const stepDepth = parseFloat(step.depth) || 0;
          return total + 2 * (stepLen + stepWid) * stepDepth * num;
        }, 0);
      } else {
        mainVolume = effectiveLen * effectiveWid * hei * num;
        surfaceAreaM2 = calculateSurfaceArea(
          element,
          effectiveLen,
          effectiveWid,
          hei,
          num,
        );
        formworkM2 = 2 * (effectiveLen + effectiveWid) * hei * num;
      }
      break;

    case "septic-tank":
      if (septicTankDetails) {
        const tankQuantities = calculateSepticTankQuantities(septicTankDetails);
        mainVolume = tankQuantities.totalVolume * num;
        surfaceAreaM2 = tankQuantities.surfaceArea * num;
        formworkM2 = 2 * (tankQuantities.surfaceArea / 3) * num;
      } else {
        const tankWallThickness = parseFloat(tankDetails?.wallThickness) || 0.2;
        const wallVolume = 2 * (len + wid) * hei * tankWallThickness * num;
        const baseVolume = len * wid * 0.25 * num;
        const coverVolume =
          tankDetails?.coverType === "slab" ? len * wid * 0.15 * num : 0;
        mainVolume = wallVolume + baseVolume + coverVolume;
        surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
        formworkM2 = 2 * (len + wid) * hei * num;
      }
      break;

    case "underground-tank":
    case "water-tank":
      if (undergroundTankDetails) {
        const tankQuantities = calculateUndergroundTankQuantities(
          undergroundTankDetails,
        );
        mainVolume = tankQuantities.totalVolume * num;
        surfaceAreaM2 = tankQuantities.surfaceArea * num;
        formworkM2 = 2 * (tankQuantities.surfaceArea / 3) * num;
      } else {
        const tankWallThickness = parseFloat(tankDetails?.wallThickness) || 0.2;
        const wallVolume = 2 * (len + wid) * hei * tankWallThickness * num;
        const baseVolume = len * wid * 0.15 * num;
        const coverVolume =
          tankDetails?.coverType === "slab" ? len * wid * 0.1 * num : 0;
        mainVolume = wallVolume + baseVolume + coverVolume;
        surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
        formworkM2 = 2 * (len + wid) * hei * num;
      }
      break;

    case "soak-pit":
      if (soakPitDetails) {
        const soakPitQuantities = calculateSoakPitQuantities(soakPitDetails);
        mainVolume = soakPitQuantities.totalVolume * num;
        surfaceAreaM2 = soakPitQuantities.surfaceArea * num;
        formworkM2 =
          Math.PI *
          (parseFloat(soakPitDetails.diameter) || 0) *
          (parseFloat(soakPitDetails.depth) || 0) *
          num;

        if (soakPitQuantities.gravelVolume) {
          gravelVolume = soakPitQuantities.gravelVolume * num;
        }
      }
      break;

    case "soakaway":
      if (soakawayDetails) {
        const soakawayQuantities = calculateSoakawayQuantities(soakawayDetails);
        mainVolume = soakawayQuantities.totalVolume * num;
        surfaceAreaM2 = soakawayQuantities.surfaceArea * num;
        formworkM2 =
          2 *
          (parseFloat(soakawayDetails.length) ||
            0 + parseFloat(soakawayDetails.width) ||
            0) *
          (parseFloat(soakawayDetails.depth) || 0) *
          num;

        if (soakawayQuantities.gravelVolume) {
          gravelVolume = soakawayQuantities.gravelVolume * num;
        }
      }
      break;

    case "staircase":
      const riserHeight = staircaseDetails?.riserHeight || 0.15;
      const treadWidth = staircaseDetails?.treadWidth || 0.3;
      const numberOfSteps =
        staircaseDetails?.numberOfSteps || Math.ceil(hei / riserHeight);

      const stepVolume = (treadWidth * riserHeight * wid) / 2;
      const landingVolume = len * wid * 0.15;
      mainVolume = (stepVolume * numberOfSteps + landingVolume) * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = (treadWidth + riserHeight) * wid * numberOfSteps * 2 * num;
      break;

    case "ramp":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = len * wid * num;
      break;

    case "retaining-wall":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = len * hei * num;
      break;

    case "culvert":
      const culvertWallThickness = 0.2;
      const culvertBaseThickness = 0.25;
      const culvertCoverThickness = 0.2;

      const culvertWallVolume =
        2 * (len + wid) * hei * culvertWallThickness * num;
      const culvertBaseVolume = len * wid * culvertBaseThickness * num;
      const culvertCoverVolume = len * wid * culvertCoverThickness * num;
      mainVolume = culvertWallVolume + culvertBaseVolume + culvertCoverVolume;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = 2 * (len + wid) * hei * num;
      break;

    case "swimming-pool":
      const poolWallThickness = 0.25;
      const poolBaseThickness = 0.2;
      const poolWallVolume = 2 * (len + wid) * hei * poolWallThickness * num;
      const poolBaseVolume = len * wid * poolBaseThickness * num;
      mainVolume = poolWallVolume + poolBaseVolume;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = 2 * (len + wid) * hei * num;
      break;

    case "kerb":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = 2 * hei * len * num;
      break;

    case "drainage-channel":
      const channelBaseVolume = len * wid * 0.15 * num;
      const channelWallVolume = 2 * len * hei * 0.15 * num;
      mainVolume = channelBaseVolume + channelWallVolume;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = (2 * hei * len + wid * len) * num;
      break;

    case "manhole":
    case "inspection-chamber":
      const diameter = Math.sqrt(len * wid);
      const radius = diameter / 2;
      const chamberWallThickness = 0.15;
      const chamberBaseThickness = 0.2;
      const chamberCoverThickness = 0.1;

      const chamberWallVolume =
        Math.PI * diameter * hei * chamberWallThickness * num;
      const chamberBaseVolume =
        Math.PI * radius * radius * chamberBaseThickness * num;
      const chamberCoverVolume =
        Math.PI * radius * radius * chamberCoverThickness * num;
      mainVolume = chamberWallVolume + chamberBaseVolume + chamberCoverVolume;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = Math.PI * diameter * hei * num;
      break;

    default:
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = calculateSurfaceArea(element, len, wid, hei, num);
      formworkM2 = len * wid * num;
  }

  let bedVolume = 0;
  let bedArea = 0;
  let aggregateVolume = 0;
  let aggregateArea = 0;

  if (
    ["foundation", "strip-footing", "raft-foundation"].includes(element) &&
    !isSteppedFoundation
  ) {
    if (hasConcreteBed && bedDepthNum > 0) {
      bedArea = len * wid * num;
      bedVolume = bedArea * bedDepthNum;
    }
    if (hasAggregateBed && aggregateDepthNum > 0) {
      aggregateArea = len * wid * num;
      aggregateVolume = aggregateArea * aggregateDepthNum;
    }
  }

  const totalConcreteVolume = mainVolume + bedVolume;
  const concreteMaterials = calculateConcreteMaterials(
    totalConcreteVolume,
    mix,
    settings,
  );

  const waterCalc = calculateWaterRequirements(
    concreteMaterials.cementMass,
    cementWaterRatio,
    settings,
    concreteMaterials.sandMass,
    concreteMaterials.stoneMass,
    surfaceAreaM2,
    totalConcreteVolume,
  );

  const grossCementBags = Math.ceil(
    concreteMaterials.cementBags * 1.54 * (1 + settings.wastageConcrete / 100),
  );
  const grossSandM3 =
    concreteMaterials.sandM3 * 1.54 * (1 + settings.wastageConcrete / 100);
  const grossStoneM3 =
    concreteMaterials.stoneM3 * 1.54 * (1 + settings.wastageConcrete / 100);
  const grossWaterRequiredL =
    waterCalc.totalWaterL * 1.54 * (1 + settings.wastageWater / 100);
  let dpcArea = 0;
  let dpcCost = 0;
  let polytheneArea = 0;
  let polytheneCost = 0;
  let waterproofingArea = 0;
  let waterproofingCost = 0;
  let gravelCost = 0;

  if (waterproofing) {
    // DPC only for foundation elements
    if (
      (waterproofing.includesDPC && row.element === "raft-foundation") ||
      row.element === "strip-footing"
    ) {
      const dpcWidth = parseFloat(waterproofing.dpcWidth || "0.225");
      dpcArea = len * dpcWidth * num;
      const dpcMaterial = materials.find((m) =>
        m.name?.toLowerCase().includes("dpc"),
      )?.type;
      dpcCost = dpcArea * (dpcMaterial?.[waterproofing?.dpcMaterial] || 0);
    }

    // Polythene only for slab elements
    if (waterproofing.includesPolythene && row.element === "slab") {
      polytheneArea = len * wid * num;
      const polytheneMaterial = materials.find((m) =>
        m.name?.toLowerCase().includes("polythene"),
      )?.type;
      const polythene_cost =
        polytheneMaterial[waterproofing.polytheneGauge] || 0;
      polytheneCost = polytheneArea * (polythene_cost || 0);
    }

    if (waterproofing.includesWaterproofing) {
      waterproofingArea = surfaceAreaM2;
      const waterproofingMaterial = materials.find((m) =>
        m.name?.toLowerCase().includes("waterproof"),
      )?.type;
      waterproofingCost =
        waterproofingArea *
        (waterproofingMaterial[waterproofing.waterproofingType] || 0);
    }
  }

  if (gravelVolume > 0) {
    const gravelMaterial = materials.find((m) =>
      m.name?.toLowerCase().includes("aggregate"),
    );
    gravelCost = gravelVolume * (gravelMaterial?.price || 0);
  }

  // Blinding calculation (concrete blinding - usually 50mm at 1:4:8)
  let blindingVolume = 0;
  let blindingCost = 0;
  if (row.hasBlinding && row.blindingDepth) {
    const blindingDepth = parseFloat(row.blindingDepth) || 0;
    blindingVolume = len * wid * blindingDepth * num;
    // Calculate blinding materials based on 1:4:8 mix (or specified mix)
    const blindingMix = row.blindingMix || "1:4:8";
    const blindingMaterials = calculateConcreteMaterials(
      blindingVolume,
      blindingMix,
      settings,
    );
    const blindingCement = materials.find(
      (m) => m.name?.toLowerCase() === "cement",
    );
    const blindingSand = materials.find(
      (m) => m.name?.toLowerCase() === "sand",
    );
    const blindingStone = materials.find(
      (m) => m.name?.toLowerCase() === "ballast",
    );
    const blindingCementBags = Math.ceil(
      blindingMaterials.cementBags * (1 + settings.wastageConcrete / 100),
    );
    const blindingSandM3 =
      blindingMaterials.sandM3 * (1 + settings.wastageConcrete / 100);
    const blindingStoneM3 =
      blindingMaterials.stoneM3 * (1 + settings.wastageConcrete / 100);
    blindingCost =
      blindingCementBags * (blindingCement?.price || 0) +
      blindingSandM3 * (blindingSand?.price || 0) +
      blindingStoneM3 * (blindingStone?.price || 0);
  }

  // Maram blinding calculation
  let maramBlindingVolume = 0;
  let maramBlindingCost = 0;
  if (row.hasMaramBlinding && row.maramBlindingDepth) {
    const maramDepth = parseFloat(row.maramBlindingDepth) || 0;
    maramBlindingVolume = len * wid * maramDepth * num;
    // Maram (binding material) - typically sand and binding agent
    const maramMaterial = materials.find(
      (m) =>
        m.name?.toLowerCase().includes("maram") ||
        m.name?.toLowerCase().includes("binding"),
    );
    maramBlindingCost = maramBlindingVolume * (maramMaterial?.price || 0);
  }

  // Compaction calculation
  let compactionArea = 0;
  let compactionCost = 0;
  if (row.hasCompaction) {
    const compactionAreaInput =
      parseFloat(row.compactionArea || "0") || len * wid * num;
    compactionArea = compactionAreaInput;
    const compactionMaterial = materials.find((m) =>
      m.name?.toLowerCase().includes("compaction"),
    );
    compactionCost = compactionArea * (compactionMaterial?.price || 0);
  }

  // Anti-termite treatment calculation
  let antiTermiteTreatmentArea = 0;
  let antiTermiteTreatmentCost = 0;
  if (row.hasAntiTermiteTreatment) {
    antiTermiteTreatmentArea = len * wid * num;
    const antiTermiteMaterial = materials.find(
      (m) =>
        m.name?.toLowerCase().includes("anti-termite") ||
        m.name?.toLowerCase().includes("termite"),
    );
    antiTermiteTreatmentCost =
      antiTermiteTreatmentArea * (antiTermiteMaterial?.price || 0);
  }

  // Return fill calculation
  let returnFillVolume = 0;
  let returnFillCost = 0;
  if (row.hasReturnFill && row.returnFillDepth) {
    const returnDepth = parseFloat(row.returnFillDepth) || 0;
    returnFillVolume = len * wid * returnDepth * num;
    const fillMaterial = materials.find(
      (m) =>
        m.name?.toLowerCase().includes("aggregate") ||
        m.name?.toLowerCase().includes("backfill"),
    );
    returnFillCost = returnFillVolume * (fillMaterial?.price || 0);
  }

  // Back fill calculation
  let backFillVolume = 0;
  let backFillCost = 0;
  if (row.hasBackFill && row.backFillDepth) {
    const backDepth = parseFloat(row.backFillDepth) || 0;
    backFillVolume = len * wid * backDepth * num;
    const fillMaterial = materials.find(
      (m) =>
        m.name?.toLowerCase().includes("aggregate") ||
        m.name?.toLowerCase().includes("backfill"),
    );
    backFillCost = backFillVolume * (fillMaterial?.price || 0);
  }

  const cement = materials.find((m) => m.name?.toLowerCase() === "cement");
  const sand = materials.find((m) => m.name?.toLowerCase() === "sand");
  const stone = materials.find((m) => m.name?.toLowerCase() === "ballast");
  const water = materials.find((m) => m.name?.toLowerCase() === "water");
  const formworkMat = materials.find(
    (m) => m.name?.toLowerCase() === "formwork",
  );
  const aggregate = materials.find(
    (m) => m.name?.toLowerCase() === "aggregate",
  );

  const cementCost = grossCementBags * (cement?.price || 0);
  const sandCost = grossSandM3 * (sand?.price || 0);
  const stoneCost = grossStoneM3 * (stone?.price || 0);
  const waterCost = settings.clientProvidesWater
    ? 0
    : (grossWaterRequiredL / 1000) * (water?.price || 0);
  const formworkCost = formworkM2 * (formworkMat?.price || 0);
  const aggregateCost = aggregateVolume * (aggregate?.price || 0);

  // Block cost calculation - convert from per-foot pricing

  const totalConcreteCost = cementCost + sandCost + waterCost + stoneCost;

  const unitRate =
    totalConcreteVolume > 0 ? totalConcreteCost / totalConcreteVolume : 0;

  return {
    id,
    name,
    element,
    number: num.toString(),
    volumeM3: mainVolume,
    totalVolume: totalConcreteVolume,
    cementBags: grossCementBags,
    sandM3: grossSandM3,
    stoneM3: grossStoneM3,
    formworkM2,
    bedVolume,
    bedArea,
    aggregateVolume,
    aggregateArea,
    waterRequired: grossWaterRequiredL,
    waterCost,
    cementWaterRatio: parseCementWaterRatio(cementWaterRatio),
    netCementBags: concreteMaterials.cementBags,
    netSandM3: concreteMaterials.sandM3,
    netStoneM3: concreteMaterials.stoneM3,
    netWaterRequiredL: waterCalc.totalWaterL,

    grossCementBags,
    grossSandM3,
    grossStoneM3,
    grossWaterRequiredL,
    waterMixingL: waterCalc.waterMixingL,
    waterCuringL: waterCalc.waterCuringL,
    waterOtherL: waterCalc.waterOtherL,
    waterAggregateAdjustmentL: waterCalc.waterAggregateAdjustmentL,
    materialCost:
      totalConcreteCost +
      formworkCost +
      aggregateCost +
      polytheneCost +
      dpcCost +
      waterproofingCost +
      gravelCost +
      blindingCost +
      maramBlindingCost +
      compactionCost +
      antiTermiteTreatmentCost +
      returnFillCost +
      backFillCost,
    totalConcreteCost,
    unitRate,

    steppedFoundationVolume: isSteppedFoundation
      ? steppedFoundationVolume
      : undefined,
    dpcArea,
    dpcCost,
    polytheneArea,
    polytheneCost,
    waterproofingArea,
    waterproofingCost,
    connectionDetails: row.reinforcement?.connectionDetails,
    gravelVolume,
    gravelCost,
    blindingVolume,
    blindingCost,
    maramBlindingVolume,
    maramBlindingCost,
    compactionArea,
    compactionCost,
    antiTermiteTreatmentArea,
    antiTermiteTreatmentCost,
    returnFillVolume,
    returnFillCost,
    backFillVolume,
    backFillCost,

    // Area selection fields - persisted from input
    areaSelectionMode,
    area: area ? parseFloat(area) : undefined,
  };
}

export function computeConcreteRatePerM3(
  mix: string,
  cementWaterRatio: string,
  prices: {
    cementPrice: number;
    sandPrice: number;
    stonePrice: number;
    waterPrice: number;
  },
  settings: MasonryQSSettings,
  element: ElementType,
  length: number,
  width: number,
  height: number,
  number: number = 1,
): number {
  // Use the same calculations as calculateConcrete
  const volume = length * width * height * number;
  const materials = calculateConcreteMaterials(volume, mix, settings);

  // Apply wastage with Math.ceil() to match calculateConcrete
  const grossCementBags = Math.ceil(
    materials.cementBags * (1 + settings.wastageConcrete / 100),
  );
  const grossSandM3 = materials.sandM3 * (1 + settings.wastageConcrete / 100);
  const grossStoneM3 = materials.stoneM3 * (1 + settings.wastageConcrete / 100);

  // Calculate water
  const surfaceArea = calculateSurfaceArea(
    element,
    length,
    width,
    height,
    number,
  );
  const waterCalc = calculateWaterRequirements(
    materials.cementMass,
    cementWaterRatio,
    settings,
    materials.sandMass,
    materials.stoneMass,
    surfaceArea,
    volume,
  );

  const grossWaterRequiredL =
    waterCalc.totalWaterL * (1 + settings.wastageWater / 100);

  // Calculate costs (NO formwork, DPC, etc. - just concrete materials)
  const effectiveWaterPrice = settings.clientProvidesWater
    ? 0
    : grossWaterRequiredL;
  const cementCost = grossCementBags * prices.cementPrice;
  const sandCost = grossSandM3 * prices.sandPrice;
  const stoneCost = grossStoneM3 * prices.stonePrice;
  const waterCost = (grossWaterRequiredL / 1000) * effectiveWaterPrice;

  const totalCost = cementCost + sandCost + stoneCost + waterCost;
  return volume > 0 ? totalCost / volume : 0;
}

export function useConcreteCalculator(
  rows: ConcreteRow[],
  materials: any[],
  settings: MasonryQSSettings,
  quote,
) {
  const [results, setResults] = useState<ConcreteResult[]>([]);
  const [totals, setTotals] = useState<any>({});

  useEffect(() => {
    const calculatedResults = rows.map((row) =>
      calculateConcrete(row, materials, settings, quote),
    );
    setResults(calculatedResults);
  }, [rows, materials, settings, quote]);

  useEffect(() => {
    const newTotals = results.reduce(
      (acc, r) => {
        acc.volume += r.totalVolume;
        acc.cement += r.grossCementBags;
        acc.sand += r.grossSandM3;
        acc.stone += r.grossStoneM3;
        acc.formworkM2 += r.formworkM2;
        acc.waterRequired += r.grossWaterRequiredL;
        acc.waterCost += r.waterCost || 0;
        acc.aggregateVolume += r.aggregateVolume || 0;
        acc.materialCost += r.materialCost;
        acc.totalCost += r.totalConcreteCost;

        acc.dpcArea += r.dpcArea || 0;
        acc.dpcCost += r.dpcCost || 0;
        acc.polytheneArea += r.polytheneArea || 0;
        acc.polytheneCost += r.polytheneCost || 0;
        acc.waterproofingArea += r.waterproofingArea || 0;
        acc.waterproofingCost += r.waterproofingCost || 0;
        acc.gravelVolume += r.gravelVolume || 0;
        acc.gravelCost += r.gravelCost || 0;
        acc.blindingVolume += r.blindingVolume || 0;
        acc.blindingCost += r.blindingCost || 0;
        acc.maramBlindingVolume += r.maramBlindingVolume || 0;
        acc.maramBlindingCost += r.maramBlindingCost || 0;
        acc.compactionArea += r.compactionArea || 0;
        acc.compactionCost += r.compactionCost || 0;
        acc.antiTermiteTreatmentArea += r.antiTermiteTreatmentArea || 0;
        acc.antiTermiteTreatmentCost += r.antiTermiteTreatmentCost || 0;
        acc.returnFillVolume += r.returnFillVolume || 0;
        acc.returnFillCost += r.returnFillCost || 0;
        acc.backFillVolume += r.backFillVolume || 0;
        acc.backFillCost += r.backFillCost || 0;

        return acc;
      },
      {
        volume: 0,
        cement: 0,
        sand: 0,
        stone: 0,
        mortarCementBags: 0,
        formworkM2: 0,
        mortarSandM3: 0,
        aggregateVolume: 0,
        totalBlocks: 0,
        materialCost: 0,
        waterRequired: 0,
        waterCost: 0,
        totalCost: 0,
        dpcArea: 0,
        dpcCost: 0,
        polytheneArea: 0,
        polytheneCost: 0,
        waterproofingArea: 0,
        waterproofingCost: 0,
        gravelVolume: 0,
        gravelCost: 0,
        blindingVolume: 0,
        blindingCost: 0,
        maramBlindingVolume: 0,
        maramBlindingCost: 0,
        compactionArea: 0,
        compactionCost: 0,
        antiTermiteTreatmentArea: 0,
        antiTermiteTreatmentCost: 0,
        returnFillVolume: 0,
        returnFillCost: 0,
        backFillVolume: 0,
        backFillCost: 0,
      },
    );
    setTotals(newTotals);
  }, [results]);

  const calculateConcreteRateForRow = useCallback(
    (row: ConcreteRow): number => {
      const cement = materials.find((m) => m.name?.toLowerCase() === "cement");
      const sand = materials.find((m) => m.name?.toLowerCase() === "sand");
      const stone = materials.find(
        (m) =>
          m.name?.toLowerCase() === "ballast" ||
          m.name?.toLowerCase() === "stone",
      );
      const water = materials.find((m) => m.name?.toLowerCase() === "water");

      if (!cement || !sand || !stone) return 0;

      const len = parseFloat(row.length) || 0;
      const wid = parseFloat(row.width) || 0;
      const hei = parseFloat(row.height) || 0;
      const num = parseInt(row.number) || 1;

      return computeConcreteRatePerM3(
        row.mix,
        row.cementWaterRatio || settings.cementWaterRatio,
        {
          cementPrice: cement.price,
          sandPrice: sand.price,
          stonePrice: stone.price,
          waterPrice: water?.price || 0,
        },
        settings,
        row.element,
        len,
        wid,
        hei,
        num,
      );
    },
    [materials, settings],
  );

  return {
    results,
    totals,
    calculateConcreteRateForRow,
  };
}
