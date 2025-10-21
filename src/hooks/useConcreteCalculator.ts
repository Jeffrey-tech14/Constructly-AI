import { useCallback, useEffect, useState } from "react";
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
  netCementBags: number;
  netSandM3: number;
  netStoneM3: number;
  netWaterRequiredL: number;
  netTotalBlocks?: number;
  netMortarCementBags?: number;
  netMortarSandM3?: number;
  grossCementBags: number;
  grossSandM3: number;
  grossStoneM3: number;
  grossWaterRequiredL: number;
  grossTotalBlocks?: number;
  grossMortarCementBags?: number;
  grossMortarSandM3?: number;
  waterMixingL: number;
  waterCuringL: number;
  waterOtherL: number;
  waterAggregateAdjustmentL: number;
  materialCost: number;
  totalConcreteCost: number;
  unitRate: number;
}
const CEMENT_DENSITY = 1440;
const SAND_DENSITY = 1600;
const STONE_DENSITY = 1500;
const CEMENT_BAG_KG = 50;
const CEMENT_BAG_VOLUME_M3 = 0.035;
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
const MASONRY_MORTAR_MIX = { cement: 1, sand: 4 };
const MORTAR_DRY_VOLUME_FACTOR = 1.3;
const STANDARD_BLOCK_SIZE = { length: 0.4, height: 0.2, thickness: 0.2 };
const BRICK_SIZE = { length: 0.225, height: 0.075, thickness: 0.1125 };

function parseMortarRatio(ratio: string): {
  sand: number;
  cement: number;
} {
  if (!ratio) return { cement: 1, sand: 4 }; // Default fallback

  const parts = ratio.split(":").map((part) => parseFloat(part.trim()));
  if (parts.length !== 2 || parts.some(isNaN) || parts.some((p) => p <= 0)) {
    return { cement: 1, sand: 4 }; // Default fallback
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
  settings: QSSettings
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
export function calculateConcrete(
  row: ConcreteRow,
  materials: any[],
  settings: QSSettings,
  quote
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
    masonryBlockDimensions,
    masonryWallThickness,
    masonryWallHeight,
    masonryWallPerimeter,
    masonryBlockType,
    cementWaterRatio = settings.cementWaterRatio,
  } = row;
  const len = parseFloat(length) || 0;
  const wid = parseFloat(width) || 0;
  const hei = parseFloat(height) || 0;
  const num = parseInt(number) || 1;
  const bedDepthNum = parseFloat(bedDepth) || 0;
  const aggregateDepthNum = parseFloat(aggregateDepth) || 0;
  const wallThicknessNum = parseFloat(masonryWallThickness) || 0.2;
  const wallHeightNum = parseFloat(masonryWallHeight) || 0;
  let mainVolume = 0;
  let surfaceAreaM2 = 0;
  let formworkM2 = 0;
  switch (element) {
    case "slab":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = len * wid * num;
      formworkM2 = len * wid * num;
      break;
    case "beam":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = (2 * (len * hei) + len * wid) * num;
      formworkM2 = (2 * hei * len + wid * len) * num;
      break;
    case "column":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = 2 * (len + wid) * hei * num;
      formworkM2 = 2 * (len + wid) * hei * num;
      break;
    case "foundation":
      mainVolume = len * wid * hei * num;
      surfaceAreaM2 = len * wid * num;
      formworkM2 = 2 * (len + wid) * hei * num;
      break;
  }
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
  const concreteMaterials = calculateConcreteMaterials(
    totalConcreteVolume,
    mix,
    settings
  );
  const waterCalc = calculateWaterRequirements(
    concreteMaterials.cementMass,
    cementWaterRatio,
    settings,
    concreteMaterials.sandMass,
    concreteMaterials.stoneMass,
    surfaceAreaM2,
    totalConcreteVolume
  );
  let netTotalBlocks = 0;
  let netMortarCementBags = 0;
  let netMortarSandM3 = 0;
  if (hasMasonryWall && wallHeightNum > 0 && element === "foundation") {
    const masonry = calculateMasonryQuantities(
      len * num,
      wallHeightNum,
      wallThicknessNum,
      masonryBlockDimensions,
      settings
    );
    netTotalBlocks = masonry.blocks;
    const mortarVolume = masonry.mortarVolume;
    const dryMortarVolume = mortarVolume * MORTAR_DRY_VOLUME_FACTOR;
    const mortar_ratio = parseMortarRatio(quote.mortar_ratio);
    const totalMortarParts = mortar_ratio.cement + mortar_ratio.sand;
    const mortarCementVolume =
      (mortar_ratio.cement / totalMortarParts) * dryMortarVolume;
    const mortarSandVolume =
      (mortar_ratio.sand / totalMortarParts) * dryMortarVolume;
    netMortarCementBags = mortarCementVolume / CEMENT_BAG_VOLUME_M3;
    netMortarSandM3 = mortarSandVolume;
  }
  const grossCementBags = Math.ceil(
    concreteMaterials.cementBags * (1 + settings.wastageCementPercent / 100)
  );
  const grossSandM3 =
    concreteMaterials.sandM3 * (1 + settings.wastageSandPercent / 100);
  const grossStoneM3 =
    concreteMaterials.stoneM3 * (1 + settings.wastageStonePercent / 100);
  const grossWaterRequiredL =
    waterCalc.totalWaterL * (1 + settings.wastageWaterPercent / 100);
  const grossTotalBlocks = Math.ceil(
    netTotalBlocks * (1 + settings.wastageBlocksPercent / 100)
  );
  const grossMortarCementBags = Math.ceil(
    netMortarCementBags * (1 + settings.wastageCementPercent / 100)
  );
  const grossMortarSandM3 =
    netMortarSandM3 * (1 + settings.wastageSandPercent / 100);
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
    netCementBags: concreteMaterials.cementBags,
    netSandM3: concreteMaterials.sandM3,
    netStoneM3: concreteMaterials.stoneM3,
    netWaterRequiredL: waterCalc.totalWaterL,
    netTotalBlocks,
    netMortarCementBags,
    netMortarSandM3,
    grossCementBags: grossCementBags,
    grossSandM3,
    grossStoneM3,
    grossWaterRequiredL,
    grossTotalBlocks,
    grossMortarCementBags,
    grossMortarSandM3,
    waterMixingL: waterCalc.waterMixingL,
    waterCuringL: waterCalc.waterCuringL,
    waterOtherL: waterCalc.waterOtherL,
    waterAggregateAdjustmentL: waterCalc.waterAggregateAdjustmentL,
    materialCost: totalConcreteCost,
    totalConcreteCost,
    unitRate,
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
  settings: QSSettings,
  element: ElementType,
  length: number,
  width: number,
  height: number,
  number: number = 1
): number {
  const { cementPrice, sandPrice, stonePrice, waterPrice } = prices;
  let volume = 0;
  let surfaceArea = 0;
  let formworkArea = 0;
  switch (element) {
    case "slab":
      volume = length * width * height * number;
      surfaceArea = length * width * number;
      formworkArea = length * width * number;
      break;
    case "beam":
      volume = length * width * height * number;
      surfaceArea = (2 * (length * height) + length * width) * number;
      formworkArea = (2 * height * length + width * length) * number;
      break;
    case "column":
      volume = length * width * height * number;
      surfaceArea = 2 * (length + width) * height * number;
      formworkArea = 2 * (length + width) * height * number;
      break;
    case "foundation":
      volume = length * width * height * number;
      surfaceArea = length * width * number;
      formworkArea = 2 * length * height * number;
      break;
  }
  const materials = calculateConcreteMaterials(volume, mix, settings);
  const waterCalc = calculateWaterRequirements(
    materials.cementMass,
    cementWaterRatio,
    settings,
    materials.sandMass,
    materials.stoneMass,
    surfaceArea,
    volume
  );
  const grossCementBags =
    materials.cementBags * (1 + settings.wastageCementPercent / 100);
  const grossSandM3 =
    materials.sandM3 * (1 + settings.wastageSandPercent / 100);
  const grossStoneM3 =
    materials.stoneM3 * (1 + settings.wastageStonePercent / 100);
  const grossWaterRequiredL =
    waterCalc.totalWaterL * (1 + settings.wastageWaterPercent / 100);
  const effectiveWaterPrice = settings.clientProvidesWater ? 0 : waterPrice;
  const cementCost = grossCementBags * cementPrice;
  const sandCost = grossSandM3 * sandPrice;
  const stoneCost = grossStoneM3 * stonePrice;
  const waterCost = (grossWaterRequiredL / 1000) * effectiveWaterPrice;
  const totalCost = cementCost + sandCost + stoneCost + waterCost;
  const ratePerM3 = volume > 0 ? totalCost / volume : 0;
  return ratePerM3;
}
export function useConcreteCalculator(
  rows: ConcreteRow[],
  materials: any[],
  settings: QSSettings,
  quote
) {
  const [results, setResults] = useState<ConcreteResult[]>([]);
  const [totals, setTotals] = useState<any>({});
  useEffect(() => {
    const calculatedResults = rows.map((row) =>
      calculateConcrete(row, materials, settings, quote)
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
        acc.mortarCementBags += r.grossMortarCementBags || 0;
        acc.formworkM2 += r.formworkM2;
        acc.waterRequired += r.grossWaterRequiredL;
        acc.waterCost += r.waterCost || 0;
        acc.mortarSandM3 += r.grossMortarSandM3 || 0;
        acc.aggregateVolume += r.aggregateVolume || 0;
        acc.totalBlocks += r.grossTotalBlocks || 0;
        acc.materialCost += r.materialCost;
        acc.totalCost += r.totalConcreteCost;
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
        num
      );
    },
    [materials, settings]
  );
  return {
    results,
    totals,
    calculateConcreteRateForRow,
  };
}
