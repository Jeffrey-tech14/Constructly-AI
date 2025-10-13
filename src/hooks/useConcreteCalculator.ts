// hooks/useConcreteCalculator.ts
import { useCallback, useEffect, useState } from "react";

// --- TYPE DEFINITIONS ---
export type ElementType = "slab" | "beam" | "column" | "foundation";
export type Category = "substructure" | "superstructure";

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

  // Foundation specific
  hasConcreteBed?: boolean;
  bedDepth?: string;
  hasAggregateBed?: boolean;
  aggregateDepth?: string;
  hasMasonryWall?: boolean;
  masonryBlockType?: string;
  masonryBlockDimensions?: string;
  masonryWallThickness?: string;
  masonryWallHeight?: string;

  // Water settings
  clientProvidesWater?: boolean;
  cementWaterRatio?: string;
}

export interface QSSettings {
  wastageCementPercent: number;
  wastageSandPercent: number;
  wastageStonePercent: number;
  wastageBlocksPercent: number;
  wastageWaterPercent: number;
  clientProvidesWater: boolean;
  cementWaterRatio: string;
  aggregateMoistureContentPercent: number;
  aggregateAbsorptionPercent: number;
  curingWaterRateLM2PerDay: number;
  curingDays: number;
  otherSiteWaterAllowanceLM3: number;
  mortarJointThicknessM: number;
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
  totalBlocks?: number;
  masonryMortarCementBags?: number;
  masonryMortarSandM3?: number;
  waterRequired?: number;
  waterCost?: number;
  cementWaterRatio?: number;

  // Net quantities
  netCementBags: number;
  netSandM3: number;
  netStoneM3: number;
  netWaterRequiredL: number;
  netTotalBlocks?: number;
  netMortarCementBags?: number;
  netMortarSandM3?: number;

  // Gross quantities
  grossCementBags: number;
  grossSandM3: number;
  grossStoneM3: number;
  grossWaterRequiredL: number;
  grossTotalBlocks?: number;
  grossMortarCementBags?: number;
  grossMortarSandM3?: number;

  // Water breakdown
  waterMixingL: number;
  waterCuringL: number;
  waterOtherL: number;
  waterAggregateAdjustmentL: number;

  // Costs
  materialCost: number;
  totalConcreteCost: number;
  unitRate: number;
}

// --- CORRECTED CONSTANTS ---
const CEMENT_DENSITY = 1440; // kg/m³
const SAND_DENSITY = 1600; // kg/m³
const STONE_DENSITY = 1500; // kg/m³
const CEMENT_BAG_KG = 50;
const CEMENT_BAG_VOLUME_M3 = 0.035; // 35L per bag

// Standard concrete mix proportions (by VOLUME)
const STANDARD_MIXES: {
  [key: string]: { cement: number; sand: number; stone: number };
} = {
  "1:2:4": { cement: 1, sand: 2, stone: 4 },
  "1:1.5:3": { cement: 1, sand: 1.5, stone: 3 },
  "1:3:6": { cement: 1, sand: 3, stone: 6 },
  "1:4:8": { cement: 1, sand: 4, stone: 8 },
};

// Masonry constants
const MASONRY_MORTAR_MIX = { cement: 1, sand: 4 }; // by volume
const MORTAR_DRY_VOLUME_FACTOR = 1.3; // 30% bulking
const STANDARD_BLOCK_SIZE = { length: 0.4, height: 0.2, thickness: 0.2 }; // 400×200×200mm
const BRICK_SIZE = { length: 0.225, height: 0.075, thickness: 0.1125 }; // 225×75×112.5mm

// --- CORRECTED UTILITY FUNCTIONS ---
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

// CORRECTED: Calculate concrete materials based on VOLUME proportions
export function calculateConcreteMaterials(
  volumeM3: number,
  mix: string,
  settings: QSSettings
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

  // Calculate volumes of each material (based on volume proportions)
  const cementVolumeM3 = (mixRatio.cement / totalParts) * volumeM3;
  const sandVolumeM3 = (mixRatio.sand / totalParts) * volumeM3;
  const stoneVolumeM3 = (mixRatio.stone / totalParts) * volumeM3;

  // Convert to practical units
  const cementBags = cementVolumeM3 / CEMENT_BAG_VOLUME_M3;
  const sandM3 = sandVolumeM3;
  const stoneM3 = stoneVolumeM3;

  // Calculate masses for water calculation
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

// CORRECTED: Water calculation
export function calculateWaterRequirements(
  cementMass: number,
  cementWaterRatio: string,
  settings: QSSettings,
  sandMass: number,
  stoneMass: number,
  surfaceAreaM2: number,
  totalConcreteVolume: number
): {
  waterMixingL: number;
  waterCuringL: number;
  waterOtherL: number;
  waterAggregateAdjustmentL: number;
  totalWaterL: number;
} {
  const ratio = parseCementWaterRatio(cementWaterRatio);

  // Water for cement hydration (0.4-0.6 water:cement ratio by mass)
  const hydrationWater = cementMass * ratio;

  // Adjust for aggregate moisture and absorption
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

  // Curing water (typically 5-7 L/m²/day for 7-14 days)
  const waterCuringL =
    surfaceAreaM2 * settings.curingWaterRateLM2PerDay * settings.curingDays;

  // Other site water
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

// CORRECTED: Block calculation for masonry walls
export function calculateMasonryQuantities(
  wallLength: number,
  wallHeight: number,
  wallThickness: number,
  blockDimensions: string,
  settings: QSSettings
): { blocks: number; mortarVolume: number } {
  const [bL, bH, bT] = blockDimensions.split("x").map(parseFloat);
  const joint = settings.mortarJointThicknessM;

  // Calculate blocks in both directions
  const blocksLength = Math.ceil(wallLength / (bL + joint));
  const blocksHeight = Math.ceil(wallHeight / (bH + joint));

  // For wall thickness: calculate how many blocks thick
  const blocksThickness = Math.ceil(wallThickness / bT);

  const totalBlocks = blocksLength * blocksHeight * blocksThickness;

  // Calculate mortar volume (simplified - based on joints)
  const horizontalJointVolume =
    wallLength * wallThickness * joint * blocksHeight;
  const verticalJointVolume = wallHeight * wallThickness * joint * blocksLength;
  const mortarVolume = horizontalJointVolume + verticalJointVolume;

  return {
    blocks: totalBlocks,
    mortarVolume,
  };
}

// CORRECTED: Main calculation function
export function calculateConcrete(
  row: ConcreteRow,
  materials: any[],
  settings: QSSettings
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
    hasMasonryWall,
    masonryBlockDimensions = "0.4x0.2x0.2",
    masonryWallThickness = "0.2",
    masonryWallHeight,
    cementWaterRatio = settings.cementWaterRatio,
  } = row;

  // Parse numeric values
  const len = parseFloat(length) || 0;
  const wid = parseFloat(width) || 0;
  const hei = parseFloat(height) || 0;
  const num = parseInt(number) || 1;
  const bedDepthNum = parseFloat(bedDepth) || 0;
  const aggregateDepthNum = parseFloat(aggregateDepth) || 0;
  const wallThicknessNum = parseFloat(masonryWallThickness) || 0.2;
  const wallHeightNum = parseFloat(masonryWallHeight) || 0;

  // CORRECTED: Volume calculation based on element type
  let mainVolume = 0;
  let surfaceAreaM2 = 0;
  let formworkM2 = 0;

  switch (element) {
    case "slab":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = len * wid * num; // Top surface for curing
      formworkM2 = len * wid * num; // Bottom formwork
      break;

    case "beam":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = (2 * (len * hei) + len * wid) * num; // Sides + bottom for curing
      formworkM2 = (2 * hei * len + wid * len) * num; // 2 sides + bottom
      break;

    case "column":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = 2 * (len + wid) * hei * num; // All sides for curing
      formworkM2 = 2 * (len + wid) * hei * num; // All sides
      break;

    case "foundation":
      // For strip foundation: length = total perimeter, width = footing width, height = footing depth
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = len * wid * num; // Top surface
      formworkM2 = 2 * len * hei * num; // Two vertical sides
      break;
  }

  // Foundation beds
  let bedVolume = 0;
  let bedArea = 0;
  let aggregateVolume = 0;
  let aggregateArea = 0;

  if (element === "foundation") {
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

  // CORRECTED: Calculate concrete materials using VOLUME-based approach
  const concreteMaterials = calculateConcreteMaterials(
    totalConcreteVolume,
    mix,
    settings
  );

  // CORRECTED: Water calculation
  const waterCalc = calculateWaterRequirements(
    concreteMaterials.cementMass,
    cementWaterRatio,
    settings,
    concreteMaterials.sandMass,
    concreteMaterials.stoneMass,
    surfaceAreaM2,
    totalConcreteVolume
  );

  // Masonry calculations
  let netTotalBlocks = 0;
  let netMortarCementBags = 0;
  let netMortarSandM3 = 0;

  if (hasMasonryWall && wallHeightNum > 0 && element === "foundation") {
    const masonry = calculateMasonryQuantities(
      len * num, // Total wall length
      wallHeightNum,
      wallThicknessNum,
      masonryBlockDimensions,
      settings
    );

    netTotalBlocks = masonry.blocks;

    // Calculate mortar materials
    const mortarVolume = masonry.mortarVolume;
    const dryMortarVolume = mortarVolume * MORTAR_DRY_VOLUME_FACTOR;
    const totalMortarParts =
      MASONRY_MORTAR_MIX.cement + MASONRY_MORTAR_MIX.sand;

    const mortarCementVolume =
      (MASONRY_MORTAR_MIX.cement / totalMortarParts) * dryMortarVolume;
    const mortarSandVolume =
      (MASONRY_MORTAR_MIX.sand / totalMortarParts) * dryMortarVolume;

    netMortarCementBags = mortarCementVolume / CEMENT_BAG_VOLUME_M3;
    netMortarSandM3 = mortarSandVolume;
  }

  // Apply wastage
  const grossCementBags =
    Math.ceil(
      concreteMaterials.cementBags * (1 + settings.wastageCementPercent / 100)
    ) / CEMENT_BAG_KG;
  const grossSandM3 =
    concreteMaterials.sandM3 * (1 + settings.wastageSandPercent / 100);
  const grossStoneM3 =
    concreteMaterials.stoneM3 * (1 + settings.wastageStonePercent / 100);
  const grossWaterRequiredL =
    waterCalc.totalWaterL * (1 + settings.wastageWaterPercent / 100);
  const grossTotalBlocks = Math.ceil(
    netTotalBlocks * (1 + settings.wastageBlocksPercent / 100)
  );
  const grossMortarCementBags =
    Math.ceil(netMortarCementBags * (1 + settings.wastageCementPercent / 100)) /
    CEMENT_BAG_KG;
  const grossMortarSandM3 =
    netMortarSandM3 * (1 + settings.wastageSandPercent / 100);

  // Cost calculation
  const cement = materials.find((m) => m.name?.toLowerCase() === "cement");
  const sand = materials.find((m) => m.name?.toLowerCase() === "sand");
  const stone = materials.find(
    (m) =>
      m.name?.toLowerCase() === "ballast" || m.name?.toLowerCase() === "stone"
  );
  const water = materials.find((m) => m.name?.toLowerCase() === "water");

  const cementCost = grossCementBags * (cement?.price || 0);
  const sandCost = grossSandM3 * (sand?.price || 0);
  const stoneCost = grossStoneM3 * (stone?.price || 0);
  const waterCost = settings.clientProvidesWater
    ? 0
    : (grossWaterRequiredL / 1000) * (water?.price || 0);
  const mortarCementCost = (grossMortarCementBags || 0) * (cement?.price || 0);
  const mortarSandCost = (grossMortarSandM3 || 0) * (sand?.price || 0);

  const totalConcreteCost =
    cementCost +
    sandCost +
    stoneCost +
    waterCost +
    mortarCementCost +
    mortarSandCost;
  const unitRate =
    totalConcreteVolume > 0 ? totalConcreteCost / totalConcreteVolume : 0;

  return {
    id,
    name,
    element,
    number,
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
    totalBlocks: grossTotalBlocks,
    masonryMortarCementBags: grossMortarCementBags,
    masonryMortarSandM3: grossMortarSandM3,
    waterRequired: grossWaterRequiredL,
    waterCost,
    cementWaterRatio: parseCementWaterRatio(cementWaterRatio),

    // Net quantities
    netCementBags: concreteMaterials.cementBags,
    netSandM3: concreteMaterials.sandM3,
    netStoneM3: concreteMaterials.stoneM3,
    netWaterRequiredL: waterCalc.totalWaterL,
    netTotalBlocks,
    netMortarCementBags,
    netMortarSandM3,

    // Gross quantities
    grossCementBags,
    grossSandM3,
    grossStoneM3,
    grossWaterRequiredL,
    grossTotalBlocks,
    grossMortarCementBags,
    grossMortarSandM3,

    // Water breakdown
    waterMixingL: waterCalc.waterMixingL,
    waterCuringL: waterCalc.waterCuringL,
    waterOtherL: waterCalc.waterOtherL,
    waterAggregateAdjustmentL: waterCalc.waterAggregateAdjustmentL,

    materialCost: totalConcreteCost,
    totalConcreteCost,
    unitRate,
  };
}

// CORRECTED: Rate calculation
export function computeConcreteRatePerM3(
  mix: string,
  cementWaterRatio: string,
  prices: {
    cementPrice: number;
    sandPrice: number;
    stonePrice: number;
    waterPrice: number;
  },
  settings: QSSettings
) {
  const { cementPrice, sandPrice, stonePrice, waterPrice } = prices;

  // Calculate materials for 1m³ of concrete
  const materialsPerM3 = calculateConcreteMaterials(1, mix, settings);

  // Calculate water for 1m³ (approximate surface area)
  const waterCalc = calculateWaterRequirements(
    materialsPerM3.cementMass,
    cementWaterRatio,
    settings,
    materialsPerM3.sandMass,
    materialsPerM3.stoneMass,
    6, // Approx surface area per m³
    1
  );

  // Apply wastage
  const grossCementBags =
    materialsPerM3.cementBags * (1 + settings.wastageCementPercent / 100);
  const grossSandM3 =
    materialsPerM3.sandM3 * (1 + settings.wastageSandPercent / 100);
  const grossStoneM3 =
    materialsPerM3.stoneM3 * (1 + settings.wastageStonePercent / 100);
  const grossWaterM3 =
    (waterCalc.totalWaterL / 1000) * (1 + settings.wastageWaterPercent / 100);

  const effectiveWaterPrice = settings.clientProvidesWater ? 0 : waterPrice;

  const cementCost = grossCementBags * cementPrice;
  const sandCost = grossSandM3 * sandPrice;
  const stoneCost = grossStoneM3 * stonePrice;
  const waterCost = grossWaterM3 * effectiveWaterPrice;

  const ratePerM3 = cementCost + sandCost + stoneCost + waterCost;

  return {
    ratePerM3: Math.round(ratePerM3),
    breakdown: {
      cementBagsPerM3: grossCementBags,
      sandM3PerM3: grossSandM3,
      stoneM3PerM3: grossStoneM3,
      waterM3PerM3: grossWaterM3,
      cementCostPerM3: cementCost,
      sandCostPerM3: sandCost,
      stoneCostPerM3: stoneCost,
      waterCostPerM3: waterCost,
    },
  };
}

// Hook remains largely the same
export function useConcreteCalculator(
  rows: ConcreteRow[],
  materials: any[],
  settings: QSSettings
) {
  const [results, setResults] = useState<ConcreteResult[]>([]);
  const [totals, setTotals] = useState<any>({});

  useEffect(() => {
    const calculatedResults = rows.map((row) =>
      calculateConcrete(row, materials, settings)
    );
    setResults(calculatedResults);
  }, [rows, materials, settings]);

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
        acc.totalCost += r.totalConcreteCost;
        return acc;
      },
      {
        volume: 0,
        cement: 0,
        sand: 0,
        stone: 0,
        formworkM2: 0,
        waterRequired: 0,
        waterCost: 0,
        totalCost: 0,
      }
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
          m.name?.toLowerCase() === "stone"
      );
      const water = materials.find((m) => m.name?.toLowerCase() === "water");

      if (!cement || !sand || !stone) return 0;

      const { ratePerM3 } = computeConcreteRatePerM3(
        row.mix,
        row.cementWaterRatio || settings.cementWaterRatio,
        {
          cementPrice: cement.price,
          sandPrice: sand.price,
          stonePrice: stone.price,
          waterPrice: water?.price || 0,
        },
        settings
      );

      return ratePerM3;
    },
    [materials, settings]
  );

  return {
    results,
    totals,
    calculateConcreteRateForRow,
  };
}
