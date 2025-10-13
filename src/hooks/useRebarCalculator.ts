// hooks/useRebarCalculator.ts
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useEffect, useState, useCallback } from "react";
import { Category } from "./useConcreteCalculator";
import { Material } from "./useQuoteCalculations";
import { useMaterialPrices } from "./useMaterialPrices";

/** --------------------
 * Types & Constants - PROFESSIONAL QS STANDARDS
 * -------------------- */
export type ElementTypes = "slab" | "beam" | "column" | "foundation";
export type RebarSize = "Y8" | "Y10" | "Y12" | "Y16" | "Y20" | "Y25";

/** Diameter (mm), unit weight (kg/m), and area (mm²) - STANDARD VALUES (BS 4449 / ISO 6935) */
const REBAR_PROPERTIES: Record<
  RebarSize,
  { diameterMm: number; weightKgPerM: number; areaMm2: number }
> = {
  Y8: { diameterMm: 8, weightKgPerM: 0.395, areaMm2: 50.27 },
  Y10: { diameterMm: 10, weightKgPerM: 0.617, areaMm2: 78.54 },
  Y12: { diameterMm: 12, weightKgPerM: 0.888, areaMm2: 113.1 },
  Y16: { diameterMm: 16, weightKgPerM: 1.58, areaMm2: 201.06 },
  Y20: { diameterMm: 20, weightKgPerM: 2.47, areaMm2: 314.16 },
  Y25: { diameterMm: 25, weightKgPerM: 3.85, areaMm2: 490.87 },
};

/** Professional QS Settings */
export interface RebarQSSettings {
  wastagePercent: number;
  bindingWirePercent: number; // Industry avg: 0.8% of rebar weight
  standardBarLength: number; // meters (e.g., 12m)
  lapLengthFactor: number; // e.g., 50 (for 50×φ lap)
  developmentLengthFactor: number; // e.g., 40 (for 40×φ development)

  // Element-specific concrete cover (meters)
  slabCover: number;
  beamCover: number;
  columnCover: number;
  foundationCover: number;

  // Structural reinforcement ratios (% of concrete area) — for beams/columns only
  beamMainReinforcementRatio: number;
  beamDistributionReinforcementRatio: number;
  columnReinforcementRatio: number;

  // Minimum bar requirements
  minSlabBars: number;
  minBeamMainBars: number;
  minBeamDistributionBars: number;
  minColumnBars: number;
}

export interface CalcInput {
  id: string;
  element: ElementTypes;
  name: string;

  /** Geometry (m) */
  length: string;
  width: string;
  depth: string;
  columnHeight?: string;

  /** Spacing (mm) - For slabs/foundations */
  mainBarSpacing?: string;
  distributionBarSpacing?: string;

  /** Bar counts - For beams/columns (optional; if missing, calculated from ratios) */
  mainBarsCount?: string;
  distributionBarsCount?: string;

  /** Reinforcement layers - For slabs/foundations */
  slabLayers?: string;

  /** Steel sizes */
  mainBarSize: RebarSize;
  distributionBarSize?: RebarSize;
  stirrupSize?: RebarSize;
  tieSize?: RebarSize;

  /** Spacing for shear reinforcement (mm) */
  stirrupSpacing?: string;
  tieSpacing?: string;

  category: Category;
  number: string;
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

  // Structural info (for beams/columns only)
  requiredSteelAreaMm2?: number;
  providedSteelAreaMm2?: number;
  reinforcementRatio?: number;
}

/** --------------------
 * PROFESSIONAL QS HELPER FUNCTIONS
 * -------------------- */
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

/** Hook length per BS 8666: max(75mm, 10 × bar diameter) */
function calculateHookLength(barSize: RebarSize): number {
  const diaM = REBAR_PROPERTIES[barSize]?.diameterMm / 1000 || 0.012;
  return Math.max(0.075, 10 * diaM);
}

/** Bend deduction: 1 × bar diameter per 90° bend (simplified) */
function calculateBendDeduction(barSize: RebarSize, bends: number = 2): number {
  const diaM = REBAR_PROPERTIES[barSize]?.diameterMm / 1000 || 0.012;
  return bends * diaM;
}

/** Calculate development length = factor × bar diameter */
function calculateDevelopmentLength(
  factor: number,
  barSize: RebarSize
): number {
  const diaM = REBAR_PROPERTIES[barSize]?.diameterMm / 1000 || 0.012;
  return (isNaN(factor) ? 40 : factor) * diaM;
}

/** Calculate lap length = lapFactor × bar diameter */
function calculateLapLength(lapFactor: number, barSize: RebarSize): number {
  const diaM = REBAR_PROPERTIES[barSize]?.diameterMm / 1000 || 0.012;
  return (isNaN(lapFactor) ? 50 : lapFactor) * diaM;
}

/** Optimized bar usage with laps */
function calculateOptimizedBars(
  requiredLength: number,
  standardBarLength: number,
  lapLength: number
): { barsNeeded: number; totalLength: number } {
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

/** Calculate bar counts from structural ratios (beams/columns only) */
function calculateBarCountsByRatio(
  element: "beam" | "column",
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
  const requiredArea = crossSectionM2 * ratio * 1_000_000; // mm²
  const singleBarArea = REBAR_PROPERTIES[barSize]?.areaMm2 || 113.1;
  const calcCount = Math.ceil(requiredArea / singleBarArea);
  const barCount = Math.max(minBars, calcCount);
  const providedArea = barCount * singleBarArea;
  const actualRatio = providedArea / (crossSectionM2 * 1_000_000);
  return { barCount, requiredArea, providedArea, actualRatio };
}

/** --------------------
 * PROFESSIONAL QS CORE CALCULATOR
 * -------------------- */
export function calculateRebar(
  input: CalcInput,
  settings: RebarQSSettings,
  {
    rebarPrices,
    bindingWirePrice,
  }: { rebarPrices: Record<RebarSize, number>; bindingWirePrice: number }
): CalcResult {
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
  } = input;

  // Parse inputs
  const L = safeParseFloat(length, 0);
  const W = safeParseFloat(width, 0);
  const D = safeParseFloat(depth, 0);
  const H = safeParseFloat(columnHeight || length, 0);
  const count = safeParseInt(number, 1);
  const layers = safeParseInt(slabLayers, 1);

  if (L <= 0 || W <= 0 || D <= 0 || (element === "column" && H <= 0)) {
    return createEmptyResult(input, rebarPrices, bindingWirePrice);
  }

  // Spacing (m)
  const mainSpacing = mmToM(safeParseFloat(mainBarSpacing, 200));
  const distSpacing = mmToM(safeParseFloat(distributionBarSpacing, 200));
  const stirrupSpacingM = mmToM(safeParseFloat(stirrupSpacing, 200));
  const tieSpacingM = mmToM(safeParseFloat(tieSpacing, 250));

  // Development & lap lengths
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

  // Concrete cover per element
  const cover =
    element === "slab"
      ? settings.slabCover
      : element === "beam"
      ? settings.beamCover
      : element === "column"
      ? settings.columnCover
      : settings.foundationCover;

  // Initialize
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

  /** SLAB / FOUNDATION: spacing-based only */
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

  /** BEAM */
  if (element === "beam" && L > 0 && W > 0 && D > 0) {
    const crossSection = W * D;

    // Main bars
    let mainCalc;
    const userMainCount = safeParseInt(mainBarsCount, 0);
    if (userMainCount > 0) {
      mainBarsCountResult = userMainCount;
      const area = mainBarsCountResult * REBAR_PROPERTIES[mainBarSize].areaMm2;
      mainCalc = {
        barCount: mainBarsCountResult,
        requiredArea: 0,
        providedArea: area,
        actualRatio: area / (crossSection * 1e6),
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

    // Distribution bars
    let distCalc;
    const userDistCount = safeParseInt(distributionBarsCount, 0);
    if (userDistCount > 0) {
      distributionBarsCountResult = userDistCount;
      const area =
        distributionBarsCountResult *
        REBAR_PROPERTIES[distributionBarSize].areaMm2;
      distCalc = {
        barCount: distributionBarsCountResult,
        requiredArea: 0,
        providedArea: area,
        actualRatio: area / (crossSection * 1e6),
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
    reinforcementRatio = providedSteelAreaMm2 / (crossSection * 1e6);

    // Bar lengths with laps
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

    // Stirrups
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

  /** COLUMN */
  if (element === "column" && H > 0 && W > 0 && D > 0) {
    const crossSection = W * D;
    let mainCalc;
    const userMainCount = safeParseInt(mainBarsCount, 0);
    if (userMainCount > 0) {
      mainBarsCountResult = userMainCount;
      const area = mainBarsCountResult * REBAR_PROPERTIES[mainBarSize].areaMm2;
      mainCalc = {
        barCount: mainBarsCountResult,
        requiredArea: 0,
        providedArea: area,
        actualRatio: area / (crossSection * 1e6),
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

    // Ties
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

  // --- Weight Calculations (NO WASTAGE YET) ---
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
  const totalWeightKg = Math.round(
    withWaste(totalWeightKgRaw, settings.wastagePercent)
  );

  const totalLengthM = Math.round(
    mainBarsLength + distributionBarsLength + stirrupsLength + tiesLength
  );

  // Binding wire: 0.8% of rebar weight (industry standard)
  const bindingWireWeightKg = Math.ceil(
    totalWeightKg * (settings.bindingWirePercent / 100)
  );
  const bindingWirePriceTotal = Math.ceil(
    bindingWireWeightKg * bindingWirePrice
  );

  const pricePerKg = rebarPrices[mainBarSize] || 0;
  const totalPrice = Math.round(totalWeightKg * pricePerKg);

  return {
    id,
    name,
    element,
    category,
    number,
    mainBarSize,
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
      element === "beam" || element === "column"
        ? requiredSteelAreaMm2
        : undefined,
    providedSteelAreaMm2:
      element === "beam" || element === "column"
        ? providedSteelAreaMm2
        : undefined,
    reinforcementRatio:
      element === "beam" || element === "column"
        ? reinforcementRatio
        : undefined,
  };
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
  };
}

/** --------------------
 * PROFESSIONAL QS SETTINGS
 * -------------------- */
export const defaultRebarQSSettings: RebarQSSettings = {
  wastagePercent: 5,
  bindingWirePercent: 0.8, // Industry standard: 0.8% of rebar weight
  standardBarLength: 12,
  lapLengthFactor: 50, // 50×φ for laps
  developmentLengthFactor: 40, // 40×φ for development

  // Element-specific concrete cover (meters)
  slabCover: 0.02, // 20mm
  beamCover: 0.025, // 25mm
  columnCover: 0.025, // 25mm
  foundationCover: 0.04, // 40mm

  // Structural ratios (beams/columns only)
  beamMainReinforcementRatio: 0.01, // 1.0%
  beamDistributionReinforcementRatio: 0.005, // 0.5%
  columnReinforcementRatio: 0.02, // 2.0%

  // Minimum bars
  minSlabBars: 1,
  minBeamMainBars: 2,
  minBeamDistributionBars: 2,
  minColumnBars: 4,
};

// ... [Rest of the file: useRebarPrices, useRebarCalculator, useRebarCalculatorRow, snapshots]
// (These remain largely unchanged — only the calculation logic was fixed)

export const useRebarPrices = (region: string) => {
  const { user, profile } = useAuth() ?? {};
  const { multipliers } = useMaterialPrices() ?? { multipliers: [] };
  const [priceMap, setPriceMap] = useState<PriceMap>({} as PriceMap);
  const [bindingWirePrice, setBindingWirePrice] = useState<number>(0);
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

        const bindingWireMaterial = materials.find(
          (m) => m.name?.toLowerCase() === "binding wire"
        );
        setBindingWirePrice(bindingWireMaterial?.price || 0);

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
        }

        setPriceMap(prices);
      } catch (err) {
        console.error("Error fetching rebar prices:", err);
      }
    };

    fetchAndProcessPrices();
  }, [user, profile, multipliers, materials, region]);

  return { rebarPrices: priceMap, bindingWirePrice };
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
        acc.totalWeightKg += r.totalWeightKg;
        acc.totalLengthM += r.totalLengthM;
        acc.totalBars += r.totalBars;
        acc.totalPrice += r.totalPrice;
        acc.bindingWireWeightKg += r.bindingWireWeightKg;
        acc.bindingWirePrice += r.bindingWirePrice;

        acc.breakdown = {
          mainBarsLength:
            (acc.breakdown?.mainBarsLength || 0) +
            (r.breakdown.mainBarsLength || 0),
          distributionBarsLength:
            (acc.breakdown?.distributionBarsLength || 0) +
            (r.breakdown.distributionBarsLength || 0),
          stirrupsLength:
            (acc.breakdown?.stirrupsLength || 0) +
            (r.breakdown.stirrupsLength || 0),
          tiesLength:
            (acc.breakdown?.tiesLength || 0) + (r.breakdown.tiesLength || 0),
        };

        acc.weightBreakdown = {
          mainBars:
            (acc.weightBreakdown?.mainBars || 0) +
            (r.weightBreakdownKg.mainBars || 0),
          distributionBars:
            (acc.weightBreakdown?.distributionBars || 0) +
            (r.weightBreakdownKg.distributionBars || 0),
          stirrups:
            (acc.weightBreakdown?.stirrups || 0) +
            (r.weightBreakdownKg.stirrups || 0),
          ties:
            (acc.weightBreakdown?.ties || 0) + (r.weightBreakdownKg.ties || 0),
        };

        return acc;
      },
      {
        totalWeightKg: 0,
        totalLengthM: 0,
        totalBars: 0,
        totalPrice: 0,
        bindingWireWeightKg: 0,
        bindingWirePrice: 0,
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
  }, [results]);

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

/** --------------------
 * Snapshots (Export/Import)
 * -------------------- */
export type RebarRow = CalcInput & { id: string };
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

/** --------------------
 * Export helper functions
 * -------------------- */
export {
  REBAR_PROPERTIES as rebarProperties,
  calculateDevelopmentLength,
  calculateLapLength,
  calculateHookLength,
  calculateBendDeduction,
  calculateOptimizedBars,
};
