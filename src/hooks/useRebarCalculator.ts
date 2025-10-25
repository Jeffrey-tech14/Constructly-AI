import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useEffect, useState, useCallback } from "react";
import { Category } from "./useConcreteCalculator";
import { Material } from "./useQuoteCalculations";
import { useMaterialPrices } from "./useMaterialPrices";

export type ElementTypes =
  | "slab"
  | "beam"
  | "column"
  | "foundation"
  | "strip_footing";
export type RebarSize = "Y8" | "Y10" | "Y12" | "Y16" | "Y20" | "Y25";
export type ReinforcementType = "individual_bars" | "mesh";
export type FootingType = "isolated" | "strip" | "combined";

export const REBAR_PROPERTIES: Record<
  RebarSize,
  {
    diameterMm: number;
    weightKgPerM: number;
    areaMm2: number;
    yieldStrength: number;
    standardLengths: number[];
  }
> = {
  Y8: {
    diameterMm: 8,
    weightKgPerM: 0.395,
    areaMm2: 50.27,
    yieldStrength: 500,
    standardLengths: [6, 9, 12],
  },
  Y10: {
    diameterMm: 10,
    weightKgPerM: 0.617,
    areaMm2: 78.54,
    yieldStrength: 500,
    standardLengths: [6, 9, 12],
  },
  Y12: {
    diameterMm: 12,
    weightKgPerM: 0.888,
    areaMm2: 113.1,
    yieldStrength: 500,
    standardLengths: [9, 12, 15],
  },
  Y16: {
    diameterMm: 16,
    weightKgPerM: 1.58,
    areaMm2: 201.06,
    yieldStrength: 500,
    standardLengths: [9, 12, 15],
  },
  Y20: {
    diameterMm: 20,
    weightKgPerM: 2.47,
    areaMm2: 314.16,
    yieldStrength: 500,
    standardLengths: [12, 15, 18],
  },
  Y25: {
    diameterMm: 25,
    weightKgPerM: 3.85,
    areaMm2: 490.87,
    yieldStrength: 500,
    standardLengths: [12, 15, 18],
  },
};

// BRC Mesh properties
export const MESH_PROPERTIES: Record<
  string,
  { weightPerSqm: number; wireDiameter: number; spacing: number }
> = {
  A142: {
    weightPerSqm: 2.22,
    wireDiameter: 6,
    spacing: 200,
  },
  A193: {
    weightPerSqm: 3.02,
    wireDiameter: 7,
    spacing: 200,
  },
  A252: {
    weightPerSqm: 3.95,
    wireDiameter: 8,
    spacing: 200,
  },
  A393: {
    weightPerSqm: 6.16,
    wireDiameter: 10,
    spacing: 200,
  },
  C283: {
    weightPerSqm: 4.34,
    wireDiameter: 7,
    spacing: 100,
  },
  C385: {
    weightPerSqm: 6.0,
    wireDiameter: 8.5,
    spacing: 100,
  },
};

export const STANDARD_MESH_SHEETS = [
  { width: 2.4, length: 4.8 },
  { width: 2.4, length: 6.0 },
  { width: 2.4, length: 7.2 },
  { width: 3.0, length: 6.0 },
  { width: 3.6, length: 6.0 },
];

export interface CodeComplianceLimits {
  minSlabReinforcement: number;
  maxSlabReinforcement: number;
  minBeamReinforcement: number;
  maxBeamReinforcement: number;
  minColumnReinforcement: number;
  maxColumnReinforcement: number;
  minStripFootingReinforcement: number;
  maxStripFootingReinforcement: number;
  minBarSpacing: number;
  maxBarSpacing: number;
  minSlabCover: number;
  minBeamCover: number;
  minColumnCover: number;
  minFoundationCover: number;
  maxCrackControlSpacing: number;
}

export interface BarScheduleItem {
  barMark: string;
  diameter: number;
  shape: string;
  cuttingLength: number;
  numberRequired: number;
  totalLength: number;
  weight: number;
  bendingInstructions?: string;
  bendingDiagram?: string;
}

export interface EfficiencyMetrics {
  materialUtilization: number;
  standardBarUtilization: number;
  wastePercentage: number;
  cuttingEfficiency: number;
  complianceScore: number;
}

export interface CuttingPattern {
  standardLength: number;
  requiredLengths: number[];
  cuts: Array<{
    requiredLength: number;
    waste: number;
    position: number;
  }>;
  totalWaste: number;
  efficiency: number;
}

export interface MeshReinforcementResult {
  totalSheets: number;
  totalArea: number;
  totalWeight: number;
  lapArea: number;
  netArea: number;
  wastePercentage: number;
}

export interface RebarQSSettings {
  wastagePercent: number;
  bindingWirePercent: number;
  standardBarLength: number;
  lapLengthFactor: number;
  developmentLengthFactor: number;
  slabCover: number;
  beamCover: number;
  columnCover: number;
  foundationCover: number;
  beamMainReinforcementRatio: number;
  beamDistributionReinforcementRatio: number;
  columnReinforcementRatio: number;
  stripFootingMainReinforcementRatio: number;
  stripFootingDistributionReinforcementRatio: number;
  minSlabBars: number;
  minBeamMainBars: number;
  minBeamDistributionBars: number;
  minColumnBars: number;
  minStripFootingBars: number;
  complianceLimits: CodeComplianceLimits;
  optimizeCutting: boolean;
  allowMultipleStandardLengths: boolean;
  // Mesh settings
  meshWastagePercent: number;
  standardMeshLap: number;
}

export interface CalcInput {
  id: string;
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
  mainBarSize: RebarSize;
  distributionBarSize?: RebarSize;
  stirrupSize?: RebarSize;
  tieSize?: RebarSize;
  stirrupSpacing?: string;
  tieSpacing?: string;
  category: Category;
  number: string;
  // New fields for mesh reinforcement
  reinforcementType: ReinforcementType;
  meshGrade?: string;
  meshSheetWidth?: string;
  meshSheetLength?: string;
  meshLapLength?: string;
  // Strip footing specific fields
  footingType?: FootingType;
  longitudinalBars?: string;
  transverseBars?: string;
  topReinforcement?: string;
  bottomReinforcement?: string;
}

export interface CalcBreakdown {
  mainBarsLength?: number;
  distributionBarsLength?: number;
  stirrupsLength?: number;
  tiesLength?: number;
  mainBarsCount?: number;
  distributionBarsCount?: number;
  stirrupsCount?: number;
  tiesCount?: number;
}

export interface WeightBreakdownKg {
  mainBars?: number;
  distributionBars?: number;
  stirrups?: number;
  ties?: number;
}

type PriceMap = Record<RebarSize, number>;

export interface CalcResult {
  id: string;
  name: string;
  element: ElementTypes;
  mainBarSize: string;
  totalBars: number;
  totalLengthM: number;
  totalWeightKg: number;
  pricePerKg: number;
  totalPrice: number;
  bindingWireWeightKg: number;
  bindingWirePrice: number;
  breakdown: CalcBreakdown;
  number: string;
  rate: number;
  category: Category;
  weightBreakdownKg: WeightBreakdownKg;
  requiredSteelAreaMm2?: number;
  providedSteelAreaMm2?: number;
  reinforcementRatio?: number;
  barSchedule: BarScheduleItem[];
  efficiency: EfficiencyMetrics;
  compliance: {
    isValid: boolean;
    warnings: string[];
    errors: string[];
    score: number;
  };
  wasteOptimization: {
    actualWastePercentage: number;
    optimizedWastePercentage: number;
    cuttingPatterns: CuttingPattern[];
    savedMaterialKg: number;
  };
  // New mesh reinforcement fields
  reinforcementType: ReinforcementType;
  meshResult?: MeshReinforcementResult;
  meshPricePerSqm?: number;
  meshTotalPrice?: number;
  // Strip footing specific fields
  footingType?: FootingType;
}

const mmToM = (mm: number) => (isNaN(mm) ? 0 : mm / 1000);
const withWaste = (quantity: number, wastePct: number) =>
  isNaN(quantity) || isNaN(wastePct) ? 0 : quantity * (1 + wastePct / 100);
const safeParseFloat = (
  value: string | undefined,
  defaultValue: number = 0
): number => {
  if (!value || value.trim() === "") return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};
const safeParseInt = (
  value: string | undefined,
  defaultValue: number = 0
): number => {
  if (!value || value.trim() === "") return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

function optimizeCuttingPatterns(
  requiredLengths: number[],
  availableLengths: number[],
  allowMultipleLengths: boolean = false
): CuttingPattern[] {
  const patterns: CuttingPattern[] = [];
  const sortedLengths = [...requiredLengths].sort((a, b) => b - a);
  const remainingLengths = [...sortedLengths];
  while (remainingLengths.length > 0) {
    let bestPattern: CuttingPattern | null = null;
    let bestEfficiency = 0;
    for (const standardLength of availableLengths) {
      const cuts: Array<{
        requiredLength: number;
        waste: number;
        position: number;
      }> = [];
      let currentPosition = 0;
      let remainingStandard = standardLength;
      for (let i = 0; i < remainingLengths.length; i++) {
        const length = remainingLengths[i];
        if (length <= remainingStandard) {
          const waste = remainingStandard - length;
          cuts.push({
            requiredLength: length,
            waste,
            position: currentPosition,
          });
          currentPosition += length;
          remainingStandard -= length;
        }
      }
      const totalWaste = cuts.reduce((sum, cut) => sum + cut.waste, 0);
      const efficiency = (standardLength - totalWaste) / standardLength;
      if (efficiency > bestEfficiency && cuts.length > 0) {
        bestPattern = {
          standardLength,
          requiredLengths: cuts.map((c) => c.requiredLength),
          cuts,
          totalWaste,
          efficiency,
        };
        bestEfficiency = efficiency;
      }
    }
    if (bestPattern) {
      patterns.push(bestPattern);
      bestPattern.requiredLengths.forEach((usedLength) => {
        const index = remainingLengths.indexOf(usedLength);
        if (index > -1) {
          remainingLengths.splice(index, 1);
        }
      });
    } else {
      break;
    }
    if (!allowMultipleLengths) break;
  }
  return patterns;
}

function calculateActualWaste(
  requiredLengths: number[],
  standardLength: number,
  settings: RebarQSSettings
): {
  actualWastePercentage: number;
  optimizedWastePercentage: number;
  patterns: CuttingPattern[];
} {
  const availableLengths = settings.allowMultipleStandardLengths
    ? REBAR_PROPERTIES.Y12.standardLengths
    : [settings.standardBarLength];
  const patterns = optimizeCuttingPatterns(
    requiredLengths,
    availableLengths,
    settings.allowMultipleStandardLengths
  );
  const totalRequiredLength = requiredLengths.reduce(
    (sum, len) => sum + len,
    0
  );
  const totalUsedLength = patterns.reduce(
    (sum, pattern) =>
      sum + pattern.standardLength * Math.ceil(pattern.requiredLengths.length),
    0
  );
  const actualWastePercentage =
    totalUsedLength > 0
      ? ((totalUsedLength - totalRequiredLength) / totalUsedLength) * 100
      : settings.wastagePercent;
  const optimizedWastePercentage = Math.max(
    2,
    Math.min(actualWastePercentage, 15)
  );
  return {
    actualWastePercentage,
    optimizedWastePercentage,
    patterns,
  };
}

function generateBarSchedule(
  element: ElementTypes,
  breakdown: CalcBreakdown,
  weightBreakdown: WeightBreakdownKg,
  mainBarSize: RebarSize,
  distributionBarSize: RebarSize,
  stirrupSize: RebarSize,
  tieSize: RebarSize,
  footingType?: FootingType
): BarScheduleItem[] {
  const schedule: BarScheduleItem[] = [];
  let markCounter = 1;
  const createMark = (type: string) =>
    `${element.charAt(0).toUpperCase()}${type}${markCounter++}`;

  if (footingType) {
    // Strip footing bar schedule
    if (breakdown.mainBarsCount && breakdown.mainBarsCount > 0) {
      schedule.push({
        barMark: createMark("LB"),
        diameter: REBAR_PROPERTIES[mainBarSize]?.diameterMm,
        shape: "Straight",
        cuttingLength:
          (breakdown?.mainBarsLength || 0) / (breakdown?.mainBarsCount || 1),
        numberRequired: breakdown?.mainBarsCount,
        totalLength: breakdown?.mainBarsLength || 0,
        weight: weightBreakdown?.mainBars || 0,
        bendingInstructions: "Longitudinal bars - straight",
      });
    }
    if (
      breakdown.distributionBarsCount &&
      breakdown.distributionBarsCount > 0
    ) {
      schedule.push({
        barMark: createMark("TB"),
        diameter: REBAR_PROPERTIES[distributionBarSize]?.diameterMm,
        shape: "Straight",
        cuttingLength:
          (breakdown?.distributionBarsLength || 0) /
          (breakdown?.distributionBarsCount || 1),
        numberRequired: breakdown?.distributionBarsCount,
        totalLength: breakdown?.distributionBarsLength || 0,
        weight: weightBreakdown?.distributionBars || 0,
        bendingInstructions: "Transverse bars - straight",
      });
    }
  } else {
    // Original bar schedule for other elements
    if (breakdown.mainBarsCount && breakdown.mainBarsCount > 0) {
      schedule.push({
        barMark: createMark("MB"),
        diameter: REBAR_PROPERTIES[mainBarSize]?.diameterMm,
        shape: "Straight",
        cuttingLength:
          (breakdown?.mainBarsLength || 0) / (breakdown?.mainBarsCount || 1),
        numberRequired: breakdown?.mainBarsCount,
        totalLength: breakdown?.mainBarsLength || 0,
        weight: weightBreakdown?.mainBars || 0,
        bendingInstructions: "Straight bar - no bending required",
      });
    }
    if (
      breakdown.distributionBarsCount &&
      breakdown.distributionBarsCount > 0
    ) {
      schedule.push({
        barMark: createMark("DB"),
        diameter: REBAR_PROPERTIES[distributionBarSize]?.diameterMm,
        shape: "Straight",
        cuttingLength:
          (breakdown?.distributionBarsLength || 0) /
          (breakdown?.distributionBarsCount || 1),
        numberRequired: breakdown?.distributionBarsCount,
        totalLength: breakdown?.distributionBarsLength || 0,
        weight: weightBreakdown?.distributionBars || 0,
        bendingInstructions: "Straight bar - no bending required",
      });
    }
    if (breakdown.stirrupsCount && breakdown.stirrupsCount > 0) {
      schedule.push({
        barMark: createMark("ST"),
        diameter: REBAR_PROPERTIES[stirrupSize]?.diameterMm,
        shape: "U-shaped",
        cuttingLength:
          (breakdown?.stirrupsLength || 0) / (breakdown?.stirrupsCount || 1),
        numberRequired: breakdown?.stirrupsCount,
        totalLength: breakdown?.stirrupsLength || 0,
        weight: weightBreakdown?.stirrups || 0,
        bendingInstructions: "Bend to U-shape with 135\u00B0 hooks at ends",
        bendingDiagram: "U-shape with dimensions",
      });
    }
    if (breakdown.tiesCount && breakdown.tiesCount > 0) {
      schedule.push({
        barMark: createMark("TI"),
        diameter: REBAR_PROPERTIES[tieSize]?.diameterMm,
        shape: "Rectangular",
        cuttingLength:
          (breakdown?.tiesLength || 0) / (breakdown?.tiesCount || 1),
        numberRequired: breakdown?.tiesCount,
        totalLength: breakdown?.tiesLength || 0,
        weight: weightBreakdown?.ties || 0,
        bendingInstructions: "Bend to rectangular shape with 135\u00B0 hooks",
        bendingDiagram: "Rectangle with dimensions",
      });
    }
  }
  return schedule;
}

function validateCodeCompliance(
  input: CalcInput,
  settings: RebarQSSettings,
  providedSteelAreaMm2?: number,
  reinforcementRatio?: number
): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  score: number;
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  let complianceScore = 100;
  const limits = settings.complianceLimits;
  const L = safeParseFloat(input.length, 0);
  const W = safeParseFloat(input.width, 0);
  const D = safeParseFloat(input.depth, 0);

  if (reinforcementRatio !== undefined) {
    let minRatio = 0;
    let maxRatio = 0;
    switch (input.element) {
      case "slab":
        minRatio = limits.minSlabReinforcement;
        maxRatio = limits.maxSlabReinforcement;
        break;
      case "beam":
        minRatio = limits.minBeamReinforcement;
        maxRatio = limits.maxBeamReinforcement;
        break;
      case "column":
        minRatio = limits.minColumnReinforcement;
        maxRatio = limits.maxColumnReinforcement;
        break;
      case "strip_footing":
        minRatio = limits.minStripFootingReinforcement;
        maxRatio = limits.maxStripFootingReinforcement;
        break;
    }
    if (reinforcementRatio < minRatio) {
      errors.push(
        `Under-reinforced: ${(reinforcementRatio * 100).toFixed(
          2
        )}% < minimum ${(minRatio * 100).toFixed(2)}%`
      );
      complianceScore -= 30;
    } else if (reinforcementRatio > maxRatio) {
      errors.push(
        `Over-reinforced: ${(reinforcementRatio * 100).toFixed(
          2
        )}% > maximum ${(maxRatio * 100).toFixed(2)}%`
      );
      complianceScore -= 30;
    }
  }

  const mainSpacing = safeParseFloat(input.mainBarSpacing, 200);
  if (mainSpacing < limits.minBarSpacing) {
    warnings.push(
      `Main bar spacing (${mainSpacing}mm) is less than minimum (${limits.minBarSpacing}mm)`
    );
    complianceScore -= 10;
  }
  if (mainSpacing > limits.maxBarSpacing) {
    warnings.push(
      `Main bar spacing (${mainSpacing}mm) exceeds maximum (${limits.maxBarSpacing}mm)`
    );
    complianceScore -= 10;
  }

  const currentCover =
    input.element === "slab"
      ? settings.slabCover * 1000
      : input.element === "beam"
      ? settings.beamCover * 1000
      : input.element === "column"
      ? settings.columnCover * 1000
      : settings.foundationCover * 1000;
  const minCover =
    input.element === "slab"
      ? limits.minSlabCover
      : input.element === "beam"
      ? limits.minBeamCover
      : input.element === "column"
      ? limits.minColumnCover
      : limits.minFoundationCover;
  if (currentCover < minCover) {
    warnings.push(
      `Concrete cover (${currentCover}mm) is less than minimum (${minCover}mm)`
    );
    complianceScore -= 15;
  }

  const barDiameter = REBAR_PROPERTIES[input.mainBarSize]?.diameterMm;
  const requiredDevLength = barDiameter * settings.developmentLengthFactor;
  const availableDevLength = (Math.min(L, W, D) * 1000) / 2;
  if (requiredDevLength > availableDevLength) {
    warnings.push(
      `Development length (${requiredDevLength.toFixed(
        0
      )}mm) may exceed available space`
    );
    complianceScore -= 10;
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    score: Math.max(0, complianceScore),
  };
}

function calculateEfficiencyMetrics(
  totalWeightKg: number,
  theoreticalWeightKg: number,
  wasteOptimization: any,
  complianceScore: number
): EfficiencyMetrics {
  const materialUtilization =
    theoreticalWeightKg > 0 ? (totalWeightKg / theoreticalWeightKg) * 100 : 95;
  const standardBarUtilization =
    wasteOptimization.patterns.length > 0
      ? (wasteOptimization.patterns.reduce(
          (sum: number, pattern: CuttingPattern) => sum + pattern.efficiency,
          0
        ) /
          wasteOptimization.patterns.length) *
        100
      : 85;
  const wastePercentage = wasteOptimization.optimizedWastePercentage;
  const cuttingEfficiency = 100 - wastePercentage;
  return {
    materialUtilization: Math.min(100, materialUtilization),
    standardBarUtilization: Math.min(100, standardBarUtilization),
    wastePercentage,
    cuttingEfficiency,
    complianceScore,
  };
}

function calculateHookLength(barSize: RebarSize): number {
  const diaM = REBAR_PROPERTIES[barSize]?.diameterMm / 1000 || 0.012;
  return Math.max(0.075, 10 * diaM);
}

function calculateBendDeduction(barSize: RebarSize, bends: number = 2): number {
  const diaM = REBAR_PROPERTIES[barSize]?.diameterMm / 1000 || 0.012;
  return bends * diaM;
}

function calculateDevelopmentLength(
  factor: number,
  barSize: RebarSize
): number {
  const diaM = REBAR_PROPERTIES[barSize]?.diameterMm / 1000 || 0.012;
  return (isNaN(factor) ? 40 : factor) * diaM;
}

function calculateLapLength(lapFactor: number, barSize: RebarSize): number {
  const diaM = REBAR_PROPERTIES[barSize]?.diameterMm / 1000 || 0.012;
  return (isNaN(lapFactor) ? 50 : lapFactor) * diaM;
}

function calculateOptimizedBars(
  requiredLength: number,
  standardBarLength: number,
  lapLength: number
): {
  barsNeeded: number;
  totalLength: number;
} {
  const req = Math.max(0, requiredLength);
  const std = Math.max(0.1, standardBarLength);
  const lap = Math.max(0, lapLength);
  if (req === 0) return { barsNeeded: 0, totalLength: 0 };
  if (req <= std) return { barsNeeded: 1, totalLength: std };
  const effectiveLength = std - lap;
  const barsNeeded = Math.ceil(req / effectiveLength);
  const totalLength = barsNeeded * std;
  return { barsNeeded, totalLength };
}

function calculateBarCountsByRatio(
  element: "beam" | "column" | "strip_footing",
  crossSectionM2: number,
  barSize: RebarSize,
  ratio: number,
  minBars: number
): {
  barCount: number;
  requiredArea: number;
  providedArea: number;
  actualRatio: number;
} {
  const requiredArea = crossSectionM2 * ratio * 1000000;
  const singleBarArea = REBAR_PROPERTIES[barSize]?.areaMm2 || 113.1;
  const calcCount = Math.ceil(requiredArea / singleBarArea);
  const barCount = Math.max(minBars, calcCount);
  const providedArea = barCount * singleBarArea;
  const actualRatio = providedArea / (crossSectionM2 * 1000000);
  return { barCount, requiredArea, providedArea, actualRatio };
}

function createEmptyResult(
  input: CalcInput,
  rebarPrices: Record<RebarSize, number>,
  bindingWirePrice: number
): CalcResult {
  return {
    id: input.id,
    name: input.name,
    element: input.element,
    category: input.category,
    number: input.number,
    mainBarSize: input.mainBarSize,
    totalBars: 0,
    totalLengthM: 0,
    totalWeightKg: 0,
    pricePerKg: rebarPrices[input.mainBarSize] || 0,
    totalPrice: 0,
    bindingWireWeightKg: 0,
    bindingWirePrice: 0,
    rate: rebarPrices[input.mainBarSize] || 0,
    breakdown: {},
    weightBreakdownKg: {},
    barSchedule: [],
    efficiency: {
      materialUtilization: 0,
      standardBarUtilization: 0,
      wastePercentage: 0,
      cuttingEfficiency: 0,
      complianceScore: 0,
    },
    compliance: {
      isValid: true,
      warnings: [],
      errors: [],
      score: 100,
    },
    wasteOptimization: {
      actualWastePercentage: 0,
      optimizedWastePercentage: 0,
      cuttingPatterns: [],
      savedMaterialKg: 0,
    },
    reinforcementType: input.reinforcementType || "individual_bars",
    footingType: input.footingType,
  };
}

function createEmptyMeshResult(
  input: CalcInput,
  meshPrices: Record<string, number>
): CalcResult {
  return {
    ...createEmptyResult(input, {} as Record<RebarSize, number>, 0),
    reinforcementType: "mesh",
    meshResult: {
      totalSheets: 0,
      totalArea: 0,
      totalWeight: 0,
      lapArea: 0,
      netArea: 0,
      wastePercentage: 0,
    },
    meshPricePerSqm: meshPrices[input.meshGrade || "A142"] || 0,
    meshTotalPrice: 0,
  };
}

function calculateStripFootingReinforcement(
  input: CalcInput,
  settings: RebarQSSettings,
  cover: number
): {
  mainBarsLength: number;
  distributionBarsLength: number;
  mainBarsCount: number;
  distributionBarsCount: number;
  requiredSteelAreaMm2: number;
  providedSteelAreaMm2: number;
  reinforcementRatio: number;
} {
  const L = safeParseFloat(input.length, 0);
  const W = safeParseFloat(input.width, 0);
  const D = safeParseFloat(input.depth, 0);
  const count = safeParseInt(input.number, 1);

  const mainSpacing = mmToM(safeParseFloat(input.mainBarSpacing, 150));
  const distSpacing = mmToM(safeParseFloat(input.distributionBarSpacing, 200));

  const devLengthMain = calculateDevelopmentLength(
    settings.developmentLengthFactor,
    input.mainBarSize
  );
  const devLengthDist = calculateDevelopmentLength(
    settings.developmentLengthFactor,
    input.distributionBarSize || input.mainBarSize
  );

  // Calculate bar counts - main bars run along length, distribution bars along width
  const mainBarsCount = Math.max(
    settings.minStripFootingBars,
    Math.ceil(W / Math.max(mainSpacing, 0.001)) + 1
  );
  const distributionBarsCount = Math.max(
    settings.minStripFootingBars,
    Math.ceil(L / Math.max(distSpacing, 0.001)) + 1
  );

  // Calculate bar lengths with development length
  const mainBarLength = L + 2 * devLengthMain; // Main bars run full length
  const distBarLength = W + 2 * devLengthDist; // Distribution bars run full width

  // Total lengths
  const mainBarsLength = mainBarsCount * mainBarLength * count;
  const distributionBarsLength = distributionBarsCount * distBarLength * count;

  // Steel area calculations
  const crossSectionArea = W * D;
  const mainBarArea = REBAR_PROPERTIES[input.mainBarSize]?.areaMm2 || 113.1;
  const distBarArea =
    REBAR_PROPERTIES[input.distributionBarSize || input.mainBarSize]?.areaMm2 ||
    113.1;

  const providedSteelAreaMm2 =
    mainBarsCount * mainBarArea + distributionBarsCount * distBarArea;
  const requiredSteelAreaMm2 =
    crossSectionArea * 1000000 * settings.stripFootingMainReinforcementRatio;
  const reinforcementRatio =
    providedSteelAreaMm2 / (crossSectionArea * 1000000);

  return {
    mainBarsLength,
    distributionBarsLength,
    mainBarsCount,
    distributionBarsCount,
    requiredSteelAreaMm2,
    providedSteelAreaMm2,
    reinforcementRatio,
  };
}

function calculateMeshReinforcement(
  slabLength: number,
  slabWidth: number,
  meshGrade: string,
  sheetWidth: number,
  sheetLength: number,
  lapLength: number,
  wastagePercent: number
): MeshReinforcementResult {
  const meshProps = MESH_PROPERTIES[meshGrade] || MESH_PROPERTIES["A142"];

  // Calculate number of sheets required
  const sheetsInLength = Math.ceil(slabLength / (sheetLength - lapLength));
  const sheetsInWidth = Math.ceil(slabWidth / (sheetWidth - lapLength));
  const totalSheets = sheetsInLength * sheetsInWidth;

  // Calculate areas
  const sheetArea = sheetWidth * sheetLength;
  const totalArea = totalSheets * sheetArea;
  const lapArea =
    (sheetsInLength - 1) * slabWidth * lapLength +
    (sheetsInWidth - 1) * slabLength * lapLength;
  const netArea = slabLength * slabWidth;

  // Calculate weight
  const netWeight = netArea * meshProps.weightPerSqm;
  const totalWeight = withWaste(netWeight, wastagePercent);

  return {
    totalSheets,
    totalArea,
    totalWeight: Math.round(totalWeight),
    lapArea,
    netArea,
    wastePercentage: wastagePercent,
  };
}

function generateMeshBarSchedule(
  meshResult: MeshReinforcementResult,
  meshGrade: string
): BarScheduleItem[] {
  return [
    {
      barMark: "MESH-01",
      diameter: MESH_PROPERTIES[meshGrade]?.wireDiameter || 6,
      shape: "Sheet",
      cuttingLength: 0,
      numberRequired: meshResult.totalSheets,
      totalLength: 0,
      weight: meshResult.totalWeight,
      bendingInstructions: "BRC Mesh - lay flat with specified lap length",
    },
  ];
}

function calculateMeshRebar(
  input: CalcInput,
  settings: RebarQSSettings,
  {
    meshPrices,
  }: {
    meshPrices: Record<string, number>;
  }
): CalcResult {
  const {
    id,
    name,
    element,
    length,
    width,
    category,
    number,
    meshGrade = "A142",
    meshSheetWidth = "2.4",
    meshSheetLength = "4.8",
    meshLapLength = "0.3",
  } = input;

  const L = safeParseFloat(length, 0);
  const W = safeParseFloat(width, 0);
  const count = safeParseInt(number, 1);
  const sheetWidth = safeParseFloat(meshSheetWidth, 2.4);
  const sheetLength = safeParseFloat(meshSheetLength, 4.8);
  const lapLength = safeParseFloat(meshLapLength, 0.3);

  if (L <= 0 || W <= 0) {
    return createEmptyMeshResult(input, meshPrices);
  }

  // Calculate mesh reinforcement
  const meshResult = calculateMeshReinforcement(
    L,
    W,
    meshGrade,
    sheetWidth,
    sheetLength,
    lapLength,
    settings.meshWastagePercent
  );

  const meshPricePerSqm = meshPrices[meshGrade] || 0;
  const meshTotalPrice = Math.round(meshResult.totalWeight * meshPricePerSqm);

  return {
    id,
    name,
    element,
    mainBarSize: meshGrade,
    totalBars: meshResult.totalSheets,
    totalLengthM: 0,
    totalWeightKg: meshResult.totalWeight,
    pricePerKg: meshPricePerSqm,
    totalPrice: meshTotalPrice,
    bindingWireWeightKg: 0, // No binding wire for mesh
    bindingWirePrice: 0,
    breakdown: {},
    number: input.number,
    rate: meshPricePerSqm,
    category,
    weightBreakdownKg: {},
    barSchedule: generateMeshBarSchedule(meshResult, meshGrade),
    efficiency: {
      materialUtilization: 95, // Mesh typically has high utilization
      standardBarUtilization: 0,
      wastePercentage: settings.meshWastagePercent,
      cuttingEfficiency: 100 - settings.meshWastagePercent,
      complianceScore: 100,
    },
    compliance: {
      isValid: true,
      warnings: [],
      errors: [],
      score: 100,
    },
    wasteOptimization: {
      actualWastePercentage: settings.meshWastagePercent,
      optimizedWastePercentage: settings.meshWastagePercent,
      cuttingPatterns: [],
      savedMaterialKg: 0,
    },
    reinforcementType: "mesh",
    meshResult,
    meshPricePerSqm,
    meshTotalPrice,
    footingType: input.footingType,
  };
}

export function calculateRebar(
  input: CalcInput,
  settings: RebarQSSettings,
  {
    rebarPrices,
    bindingWirePrice,
    meshPrices,
  }: {
    rebarPrices: Record<RebarSize, number>;
    bindingWirePrice: number;
    meshPrices: Record<string, number>;
  }
): CalcResult {
  const { reinforcementType = "individual_bars", meshGrade = "A142" } = input;

  // If it's mesh reinforcement, calculate mesh instead of individual bars
  if (
    reinforcementType === "mesh" &&
    (input.element === "slab" || input.element === "foundation")
  ) {
    return calculateMeshRebar(input, settings, { meshPrices });
  }

  // Original individual bar calculation code
  const {
    id,
    name,
    element,
    length,
    width,
    depth,
    columnHeight,
    mainBarSpacing = "200",
    distributionBarSpacing = "200",
    stirrupSpacing = "200",
    tieSpacing = "250",
    mainBarsCount,
    distributionBarsCount,
    slabLayers = "1",
    mainBarSize = "Y12",
    distributionBarSize = mainBarSize,
    stirrupSize = "Y8",
    tieSize = "Y8",
    category = "superstructure",
    number = "1",
    footingType,
  } = input;

  const L = safeParseFloat(length, 0);
  const W = safeParseFloat(width, 0);
  const D = safeParseFloat(depth, 0);
  const H = safeParseFloat(columnHeight || length, 0);
  const count = safeParseInt(number, 1);
  const layers = safeParseInt(slabLayers, 1);

  if (L <= 0 || W <= 0 || D <= 0 || (element === "column" && H <= 0)) {
    return createEmptyResult(input, rebarPrices, bindingWirePrice);
  }

  const mainSpacing = mmToM(safeParseFloat(mainBarSpacing, 200));
  const distSpacing = mmToM(safeParseFloat(distributionBarSpacing, 200));
  const stirrupSpacingM = mmToM(safeParseFloat(stirrupSpacing, 200));
  const tieSpacingM = mmToM(safeParseFloat(tieSpacing, 250));

  const devLengthMain = calculateDevelopmentLength(
    settings.developmentLengthFactor,
    mainBarSize
  );
  const devLengthDist = calculateDevelopmentLength(
    settings.developmentLengthFactor,
    distributionBarSize
  );
  const hookLengthStirrup = calculateHookLength(stirrupSize);
  const hookLengthTie = calculateHookLength(tieSize);
  const lapLength = calculateLapLength(settings.lapLengthFactor, mainBarSize);

  const cover =
    element === "slab"
      ? settings.slabCover
      : element === "beam"
      ? settings.beamCover
      : element === "column"
      ? settings.columnCover
      : settings.foundationCover;

  let mainBarsLength = 0;
  let distributionBarsLength = 0;
  let stirrupsLength = 0;
  let tiesLength = 0;
  let totalBars = 0;
  let mainBarsCountResult = 0;
  let distributionBarsCountResult = 0;
  let stirrupsCount = 0;
  let tiesCount = 0;
  let requiredSteelAreaMm2 = 0;
  let providedSteelAreaMm2 = 0;
  let reinforcementRatio = 0;

  if ((element === "slab" || element === "foundation") && L > 0 && W > 0) {
    const mainBarsCountRaw = Math.ceil(L / Math.max(mainSpacing, 0.001)) + 1;
    const distBarsCountRaw = Math.ceil(W / Math.max(distSpacing, 0.001)) + 1;
    mainBarsCountResult = Math.max(settings.minSlabBars, mainBarsCountRaw);
    distributionBarsCountResult = Math.max(
      settings.minSlabBars,
      distBarsCountRaw
    );
    const mainBarLength = W + 2 * devLengthMain;
    const distBarLength = L + 2 * devLengthDist;
    mainBarsLength = mainBarsCountResult * mainBarLength * layers * count;
    distributionBarsLength =
      distributionBarsCountResult * distBarLength * layers * count;
    totalBars =
      (mainBarsCountResult + distributionBarsCountResult) * layers * count;
  }

  if (element === "beam" && L > 0 && W > 0 && D > 0) {
    const crossSection = W * D;
    let mainCalc;
    const userMainCount = safeParseInt(mainBarsCount, 0);
    if (userMainCount > 0) {
      mainBarsCountResult = userMainCount;
      const area = mainBarsCountResult * REBAR_PROPERTIES[mainBarSize]?.areaMm2;
      mainCalc = {
        barCount: mainBarsCountResult,
        requiredArea: 0,
        providedArea: area,
        actualRatio: area / (crossSection * 1000000),
      };
    } else {
      mainCalc = calculateBarCountsByRatio(
        "beam",
        crossSection,
        mainBarSize,
        settings.beamMainReinforcementRatio,
        settings.minBeamMainBars
      );
      mainBarsCountResult = mainCalc.barCount;
    }
    let distCalc;
    const userDistCount = safeParseInt(distributionBarsCount, 0);
    if (userDistCount > 0) {
      distributionBarsCountResult = userDistCount;
      const area =
        distributionBarsCountResult *
        REBAR_PROPERTIES[distributionBarSize]?.areaMm2;
      distCalc = {
        barCount: distributionBarsCountResult,
        requiredArea: 0,
        providedArea: area,
        actualRatio: area / (crossSection * 1000000),
      };
    } else {
      distCalc = calculateBarCountsByRatio(
        "beam",
        crossSection,
        distributionBarSize,
        settings.beamDistributionReinforcementRatio,
        settings.minBeamDistributionBars
      );
      distributionBarsCountResult = distCalc.barCount;
    }
    requiredSteelAreaMm2 = mainCalc.requiredArea + distCalc.requiredArea;
    providedSteelAreaMm2 = mainCalc.providedArea + distCalc.providedArea;
    reinforcementRatio = providedSteelAreaMm2 / (crossSection * 1000000);
    const clearLength = Math.max(0, L - 2 * cover);
    const reqMainLength = clearLength + 2 * devLengthMain;
    const reqDistLength = clearLength + 2 * devLengthDist;
    const mainBarOpt = calculateOptimizedBars(
      reqMainLength,
      settings.standardBarLength,
      lapLength
    );
    const distBarOpt = calculateOptimizedBars(
      reqDistLength,
      settings.standardBarLength,
      lapLength
    );
    mainBarsLength = mainBarsCountResult * mainBarOpt.totalLength * count;
    distributionBarsLength =
      distributionBarsCountResult * distBarOpt.totalLength * count;
    totalBars +=
      (mainBarsCountResult * mainBarOpt.barsNeeded +
        distributionBarsCountResult * distBarOpt.barsNeeded) *
      count;
    stirrupsCount = Math.max(
      2,
      Math.floor(clearLength / Math.max(stirrupSpacingM, 0.001)) + 1
    );
    const stirrupWidth = Math.max(0, W - 2 * cover);
    const stirrupHeight = Math.max(0, D - 2 * cover);
    const stirrupPerimeter = 2 * (stirrupWidth + stirrupHeight);
    const stirrupBendDeduction = calculateBendDeduction(stirrupSize, 2);
    const stirrupLength = Math.max(
      0,
      stirrupPerimeter + 2 * hookLengthStirrup - stirrupBendDeduction
    );
    stirrupsLength = stirrupsCount * stirrupLength * count;
    totalBars += stirrupsCount * count;
  }

  if (element === "column" && H > 0 && W > 0 && D > 0) {
    const crossSection = W * D;
    let mainCalc;
    const userMainCount = safeParseInt(mainBarsCount, 0);
    if (userMainCount > 0) {
      mainBarsCountResult = userMainCount;
      const area = mainBarsCountResult * REBAR_PROPERTIES[mainBarSize]?.areaMm2;
      mainCalc = {
        barCount: mainBarsCountResult,
        requiredArea: 0,
        providedArea: area,
        actualRatio: area / (crossSection * 1000000),
      };
    } else {
      mainCalc = calculateBarCountsByRatio(
        "column",
        crossSection,
        mainBarSize,
        settings.columnReinforcementRatio,
        settings.minColumnBars
      );
      mainBarsCountResult = mainCalc.barCount;
    }
    requiredSteelAreaMm2 = mainCalc.requiredArea;
    providedSteelAreaMm2 = mainCalc.providedArea;
    reinforcementRatio = mainCalc.actualRatio;
    const clearHeight = Math.max(0, H - 2 * cover);
    const reqBarLength = clearHeight + 2 * devLengthMain;
    const mainBarOpt = calculateOptimizedBars(
      reqBarLength,
      settings.standardBarLength,
      lapLength
    );
    mainBarsLength = mainBarsCountResult * mainBarOpt.totalLength * count;
    totalBars += mainBarsCountResult * mainBarOpt.barsNeeded * count;
    tiesCount = Math.max(
      2,
      Math.floor(clearHeight / Math.max(tieSpacingM, 0.001)) + 1
    );
    const tieWidth = Math.max(0, W - 2 * cover);
    const tieDepth = Math.max(0, D - 2 * cover);
    const tiePerimeter = 2 * (tieWidth + tieDepth);
    const tieBendDeduction = calculateBendDeduction(tieSize, 2);
    const tieLength = Math.max(
      0,
      tiePerimeter + 2 * hookLengthTie - tieBendDeduction
    );
    tiesLength = tiesCount * tieLength * count;
    totalBars += tiesCount * count;
  }

  if (element === "strip_footing" && L > 0 && W > 0 && D > 0) {
    const stripFootingCalc = calculateStripFootingReinforcement(
      input,
      settings,
      cover
    );

    mainBarsLength = stripFootingCalc.mainBarsLength;
    distributionBarsLength = stripFootingCalc.distributionBarsLength;
    mainBarsCountResult = stripFootingCalc.mainBarsCount;
    distributionBarsCountResult = stripFootingCalc.distributionBarsCount;
    totalBars = (mainBarsCountResult + distributionBarsCountResult) * count;
    requiredSteelAreaMm2 = stripFootingCalc.requiredSteelAreaMm2;
    providedSteelAreaMm2 = stripFootingCalc.providedSteelAreaMm2;
    reinforcementRatio = stripFootingCalc.reinforcementRatio;
  }

  const getWeight = (length: number, size: RebarSize) =>
    length * (REBAR_PROPERTIES[size]?.weightKgPerM || 0.888);
  const mainBarsWeight = getWeight(mainBarsLength, mainBarSize);
  const distributionBarsWeight = getWeight(
    distributionBarsLength,
    distributionBarSize
  );
  const stirrupsWeight = getWeight(stirrupsLength, stirrupSize);
  const tiesWeight = getWeight(tiesLength, tieSize);
  const totalWeightKgRaw =
    mainBarsWeight + distributionBarsWeight + stirrupsWeight + tiesWeight;

  const requiredLengths: number[] = [];
  if (mainBarsLength > 0)
    requiredLengths.push(mainBarsLength / (mainBarsCountResult || 1));
  if (distributionBarsLength > 0)
    requiredLengths.push(
      distributionBarsLength / (distributionBarsCountResult || 1)
    );
  if (stirrupsLength > 0)
    requiredLengths.push(stirrupsLength / (stirrupsCount || 1));
  if (tiesLength > 0) requiredLengths.push(tiesLength / (tiesCount || 1));

  const wasteCalculation = calculateActualWaste(
    requiredLengths,
    settings.standardBarLength,
    settings
  );
  const totalWeightKg = Math.round(
    withWaste(totalWeightKgRaw, wasteCalculation.optimizedWastePercentage)
  );
  const totalLengthM = Math.round(
    mainBarsLength + distributionBarsLength + stirrupsLength + tiesLength
  );
  const bindingWireWeightKg = Math.ceil(
    totalWeightKg * (settings.bindingWirePercent / 100)
  );
  const bindingWirePriceTotal = Math.ceil(
    bindingWireWeightKg * bindingWirePrice
  );
  const pricePerKg = rebarPrices[input.mainBarSize] || 0;
  const totalPrice = Math.round(totalWeightKg * pricePerKg);

  const barSchedule = generateBarSchedule(
    input.element,
    {
      mainBarsLength: Math.round(mainBarsLength),
      distributionBarsLength: Math.round(distributionBarsLength),
      stirrupsLength: Math.round(stirrupsLength),
      tiesLength: Math.round(tiesLength),
      mainBarsCount: mainBarsCountResult,
      distributionBarsCount: distributionBarsCountResult,
      stirrupsCount,
      tiesCount,
    },
    {
      mainBars: Math.round(mainBarsWeight),
      distributionBars: Math.round(distributionBarsWeight),
      stirrups: Math.round(stirrupsWeight),
      ties: Math.round(tiesWeight),
    },
    input.mainBarSize,
    input.distributionBarSize || input.mainBarSize,
    input.stirrupSize || "Y8",
    input.tieSize || "Y8",
    input.footingType
  );

  const compliance = validateCodeCompliance(
    input,
    settings,
    providedSteelAreaMm2,
    reinforcementRatio
  );
  const theoreticalWeightKg = totalWeightKgRaw;
  const efficiency = calculateEfficiencyMetrics(
    totalWeightKg,
    theoreticalWeightKg,
    {
      patterns: wasteCalculation.patterns,
      optimizedWastePercentage: wasteCalculation.optimizedWastePercentage,
    },
    compliance.score
  );
  const savedMaterialKg = Math.round(
    ((wasteCalculation.optimizedWastePercentage - settings.wastagePercent) /
      100) *
      totalWeightKgRaw
  );

  return {
    id: input.id,
    name: input.name,
    element: input.element,
    category: input.category,
    number: input.number,
    mainBarSize: input.mainBarSize,
    totalBars: Math.max(0, totalBars),
    totalLengthM: Math.max(0, totalLengthM),
    totalWeightKg: Math.max(0, totalWeightKg),
    pricePerKg,
    totalPrice: Math.max(0, totalPrice),
    bindingWireWeightKg: Math.max(0, bindingWireWeightKg),
    bindingWirePrice: Math.max(0, bindingWirePriceTotal),
    rate: pricePerKg,
    breakdown: {
      mainBarsLength: Math.round(mainBarsLength),
      distributionBarsLength: Math.round(distributionBarsLength),
      stirrupsLength: Math.round(stirrupsLength),
      tiesLength: Math.round(tiesLength),
      mainBarsCount: mainBarsCountResult,
      distributionBarsCount: distributionBarsCountResult,
      stirrupsCount,
      tiesCount,
    },
    weightBreakdownKg: {
      mainBars: Math.round(mainBarsWeight),
      distributionBars: Math.round(distributionBarsWeight),
      stirrups: Math.round(stirrupsWeight),
      ties: Math.round(tiesWeight),
    },
    requiredSteelAreaMm2:
      input.element === "beam" ||
      input.element === "column" ||
      input.element === "strip_footing"
        ? requiredSteelAreaMm2
        : undefined,
    providedSteelAreaMm2:
      input.element === "beam" ||
      input.element === "column" ||
      input.element === "strip_footing"
        ? providedSteelAreaMm2
        : undefined,
    reinforcementRatio:
      input.element === "beam" ||
      input.element === "column" ||
      input.element === "strip_footing"
        ? reinforcementRatio
        : undefined,
    barSchedule,
    efficiency,
    compliance,
    wasteOptimization: {
      actualWastePercentage: wasteCalculation.actualWastePercentage,
      optimizedWastePercentage: wasteCalculation.optimizedWastePercentage,
      cuttingPatterns: wasteCalculation.patterns,
      savedMaterialKg: Math.max(0, savedMaterialKg),
    },
    reinforcementType: "individual_bars",
    footingType: input.footingType,
  };
}

export const defaultRebarQSSettings: RebarQSSettings = {
  wastagePercent: 5,
  bindingWirePercent: 0.8,
  standardBarLength: 12,
  lapLengthFactor: 50,
  developmentLengthFactor: 40,
  slabCover: 0.02,
  beamCover: 0.025,
  columnCover: 0.025,
  foundationCover: 0.04,
  beamMainReinforcementRatio: 0.01,
  beamDistributionReinforcementRatio: 0.005,
  columnReinforcementRatio: 0.02,
  stripFootingMainReinforcementRatio: 0.0015,
  stripFootingDistributionReinforcementRatio: 0.0012,
  minSlabBars: 1,
  minBeamMainBars: 2,
  minBeamDistributionBars: 2,
  minColumnBars: 4,
  minStripFootingBars: 4,
  complianceLimits: {
    minSlabReinforcement: 0.0024,
    maxSlabReinforcement: 0.04,
    minBeamReinforcement: 0.0013,
    maxBeamReinforcement: 0.04,
    minColumnReinforcement: 0.008,
    maxColumnReinforcement: 0.06,
    minStripFootingReinforcement: 0.0012,
    maxStripFootingReinforcement: 0.04,
    minBarSpacing: 25,
    maxBarSpacing: 300,
    minSlabCover: 20,
    minBeamCover: 25,
    minColumnCover: 25,
    minFoundationCover: 40,
    maxCrackControlSpacing: 300,
  },
  optimizeCutting: true,
  allowMultipleStandardLengths: true,
  // Mesh settings
  meshWastagePercent: 5,
  standardMeshLap: 0.3,
};

export const useRebarPrices = (region: string) => {
  const { user, profile } = useAuth() ?? {};
  const { multipliers } = useMaterialPrices() ?? { multipliers: [] };
  const [priceMap, setPriceMap] = useState<PriceMap>({} as PriceMap);
  const [bindingWirePrice, setBindingWirePrice] = useState<number>(0);
  const [meshPrices, setMeshPrices] = useState<Record<string, number>>({});
  const [materials, setMaterials] = useState<Material[]>([]);

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
          multipliers.find((r) => r.region === userRegion)?.multiplier || 1;
        const materialP = (material.price || 0) * multiplier;
        const price = userRate ? userRate.price : materialP ?? 0;
        return {
          ...material,
          price,
          source: userRate ? "user" : material.price != null ? "base" : "none",
        };
      }) || [];
    setMaterials(merged);
  }, [profile, multipliers]);

  useEffect(() => {
    if (user && profile !== null) {
      fetchMaterials();
    }
  }, [user, profile, fetchMaterials]);

  useEffect(() => {
    if (!profile?.id) return;
    const fetchAndProcessPrices = async () => {
      try {
        let prices: PriceMap = {} as PriceMap;
        let meshPriceMap: Record<string, number> = {};

        setBindingWirePrice(
          materials.find((m) => m.name?.toLowerCase() === "binding wire")
            ?.price || 0
        );

        // Fetch mesh prices
        const { data: meshBase } = await supabase
          .from("material_base_prices")
          .select("type")
          .eq("name", "BRC Mesh")
          .single();

        if (meshBase?.type) {
          meshBase.type.forEach((item: any) => {
            if (item.grade && MESH_PROPERTIES[item.grade]) {
              meshPriceMap[item.grade] = item.price_kes_per_sqm || 0;
            }
          });
        }

        const { data: base } = await supabase
          .from("material_base_prices")
          .select("type")
          .eq("name", "Rebar")
          .single();

        if (base?.type) {
          base.type.forEach((item: any) => {
            if (item.size && REBAR_PROPERTIES[item.size as RebarSize]) {
              prices[item.size as RebarSize] = item.price_kes_per_kg || 0;
            }
          });
        }

        if (user) {
          const { data: userOverride } = await supabase
            .from("user_material_prices")
            .select("type")
            .eq("user_id", user.id)
            .eq("region", region)
            .maybeSingle();

          if (userOverride?.type) {
            userOverride.type.forEach((item: any) => {
              if (item.size && REBAR_PROPERTIES[item.size as RebarSize]) {
                prices[item.size as RebarSize] = item.price_kes_per_kg || 0;
              }
              if (item.grade && MESH_PROPERTIES[item.grade]) {
                meshPriceMap[item.grade] = item.price_kes_per_sqm || 0;
              }
            });
          }
        }

        const { data: regionMult } = await supabase
          .from("regional_multipliers")
          .select("multiplier")
          .eq("region", region)
          .maybeSingle();

        if (regionMult?.multiplier) {
          Object.keys(prices).forEach((key) => {
            prices[key as RebarSize] =
              prices[key as RebarSize] * regionMult.multiplier;
          });
          Object.keys(meshPriceMap).forEach((key) => {
            meshPriceMap[key] = meshPriceMap[key] * regionMult.multiplier;
          });
        }

        setPriceMap(prices);
        setMeshPrices(meshPriceMap);
      } catch (err) {
        console.error("Error fetching rebar prices:", err);
      }
    };
    fetchAndProcessPrices();
  }, [user, profile, multipliers, materials, region]);

  return { rebarPrices: priceMap, bindingWirePrice, meshPrices };
};

export function useRebarCalculator(
  rows: CalcInput[],
  settings: RebarQSSettings,
  region: string
) {
  const [results, setResults] = useState<CalcResult[]>([]);
  const [totals, setTotals] = useState<any>({});
  const prices = useRebarPrices(region);

  useEffect(() => {
    const calculatedResults = rows.map((row) =>
      calculateRebar(row, settings, prices)
    );
    setResults(calculatedResults);
  }, [rows, settings, prices]);

  useEffect(() => {
    const newTotals = results.reduce(
      (acc, r) => {
        if (r.reinforcementType === "mesh") {
          // Mesh totals
          acc.totalWeightKg += r.totalWeightKg;
          acc.totalPrice += r.meshTotalPrice || 0;
          acc.totalSheets += r.totalBars;
          acc.meshArea += r.meshResult?.netArea || 0;
        } else {
          // Individual bar totals
          acc.totalWeightKg += r.totalWeightKg;
          acc.totalLengthM += r.totalLengthM;
          acc.totalBars += r.totalBars;
          acc.totalPrice += r.totalPrice;
          acc.bindingWireWeightKg += r.bindingWireWeightKg;
          acc.bindingWirePrice += r.bindingWirePrice;

          // Breakdown calculations
          acc.breakdown.mainBarsLength += r.breakdown.mainBarsLength || 0;
          acc.breakdown.distributionBarsLength +=
            r.breakdown.distributionBarsLength || 0;
          acc.breakdown.stirrupsLength += r.breakdown.stirrupsLength || 0;
          acc.breakdown.tiesLength += r.breakdown.tiesLength || 0;

          acc.weightBreakdown.mainBars += r.weightBreakdownKg.mainBars || 0;
          acc.weightBreakdown.distributionBars +=
            r.weightBreakdownKg.distributionBars || 0;
          acc.weightBreakdown.stirrups += r.weightBreakdownKg.stirrups || 0;
          acc.weightBreakdown.ties += r.weightBreakdownKg.ties || 0;
        }
        return acc;
      },
      {
        totalWeightKg: 0,
        totalLengthM: 0,
        totalBars: 0,
        totalSheets: 0,
        totalPrice: 0,
        bindingWireWeightKg: 0,
        bindingWirePrice: 0,
        meshArea: 0,
        breakdown: {
          mainBarsLength: 0,
          distributionBarsLength: 0,
          stirrupsLength: 0,
          tiesLength: 0,
        },
        weightBreakdown: {
          mainBars: 0,
          distributionBars: 0,
          stirrups: 0,
          ties: 0,
        },
      }
    );
    setTotals(newTotals);
  }, [results, prices]);

  return { results, totals };
}

export function useRebarCalculatorRow(
  input: CalcInput,
  settings: RebarQSSettings,
  region: string
) {
  const prices = useRebarPrices(region);
  return useMemo(
    () => calculateRebar(input, settings, prices),
    [input, settings, prices]
  );
}

export type RebarRow = CalcInput & {
  id: string;
};

export interface RebarProjectSnapshot {
  version: 1;
  createdAt: string;
  rows: RebarRow[];
  settings: RebarQSSettings;
}

export function createRebarSnapshot(
  rows: RebarRow[],
  settings: RebarQSSettings
): RebarProjectSnapshot {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    rows,
    settings,
  };
}

export function parseRebarSnapshot(json: string): {
  rows: RebarRow[];
  settings: RebarQSSettings;
} {
  const parsed = JSON.parse(json) as RebarProjectSnapshot;
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.rows)) {
    throw new Error("Invalid rebar snapshot");
  }
  return {
    rows: parsed.rows,
    settings: parsed.settings || defaultRebarQSSettings,
  };
}

export {
  REBAR_PROPERTIES as rebarProperties,
  MESH_PROPERTIES as meshProperties,
  calculateDevelopmentLength,
  calculateLapLength,
  calculateHookLength,
  calculateBendDeduction,
  calculateOptimizedBars,
};
