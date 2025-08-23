import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useEffect, useState } from "react";

/** --------------------
 * Types & Constants
 * -------------------- */
export type ElementTypes = "slab" | "beam" | "column" | "foundation";
export type RebarSize = "Y8" | "Y10" | "Y12" | "Y16" | "Y20" | "Y25";

/** Diameter (mm) and unit weight (kg/m) */
const SIZE_DIAM_MM: Record<RebarSize, number> = {
  Y8: 8,
  Y10: 10,
  Y12: 12,
  Y16: 16,
  Y20: 20,
  Y25: 25,
};

const UNIT_WEIGHT_KG_PER_M: Record<RebarSize, number> = {
  Y8: 0.395,
  Y10: 0.617,
  Y12: 0.888,
  Y16: 1.58,
  Y20: 2.47,
  Y25: 3.85,
};

export interface CalcInput {
  element: ElementTypes;

  /** Geometry (m) */
  length: string;
  width: string;
  depth: string;
  columnHeight?: string;

  /** Spacing (mm) */
  barSpacing?: string;
  meshXSpacing?: string;
  meshYSpacing?: string;
  stirrupSpacing?: string;
  tieSpacing?: string;

  /** Counts */
  longitudinalBars?: string;
  verticalBars?: string;

  /** Slab layers */
  slabLayers?: string;

  /** Steel sizes */
  primaryBarSize: RebarSize;
  meshXSize?: RebarSize;
  meshYSize?: RebarSize;
  stirrupSize?: RebarSize;
  tieSize?: RebarSize;

  /** Allowances (multiples of bar diameter d) */
  devLenFactorDLong?: string;
  devLenFactorDVert?: string;
  hookFactorDStirrups?: string;
  hookFactorDTies?: string;

  /** Global wastage (%) applied to all lengths */
  wastagePercent?: number;
}

export interface CalcBreakdown {
  meshX?: number;
  meshY?: number;
  longitudinal?: number;
  verticals?: number;
  stirrups?: number;
  ties?: number;
}

export interface WeightBreakdownKg {
  meshX?: number;
  meshY?: number;
  longitudinal?: number;
  verticals?: number;
  stirrups?: number;
  ties?: number;
  totalPricePerItem: number;
}

export interface CalcResult {
  primaryBarSize: string;
  totalBars: number;
  totalLengthM: number;
  totalWeightKg: number;
  pricePerM: number;
  totalPrice: number;
  breakdown: CalcBreakdown;
  weightBreakdownKg: WeightBreakdownKg;
}

/** --------------------
 * Helpers
 * -------------------- */
const mmToM = (mm: number) => mm / 1000;
const withWaste = (lenM: number, wastePct: number) => lenM * (1 + (wastePct || 0) / 100);

/** Compute a hook/dev length in meters from factor*d */
function lenFromFactorD(factorD: number, size: RebarSize): number {
  const d_m = SIZE_DIAM_MM[size] / 1000;
  return factorD * d_m;
}

/** --------------------
 * Pricing hook
 * -------------------- */
type PriceMap = Record<string, number>; // { Y8: 40, Y10: 70, ... }

export const useRebarPrices = (region: string) => {
  const { user } = useAuth();
  const [priceMap, setPriceMap] = useState<PriceMap>({});

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        let prices: PriceMap = {};

        // 1. Base prices
        const { data: base } = await supabase
          .from("material_base_prices")
          .select("type")
          .eq("name", "Rebar") 
          .single();

        if (base?.type) {
          base.type.forEach((item: any) => {
            prices[item.size] = item.price_kes_per_m;
          });
        }

        // 2. User overrides
        if (user) {
          const { data: userOverride } = await supabase
            .from("user_material_prices")
            .select("type")
            .eq("user_id", user.id)
            .eq("region", region)
            .maybeSingle();

          if (userOverride?.type) {
            userOverride.type.forEach((item: any) => {
              prices[item.size] = item.price_kes_per_m; // override
            });
          }
        }

        // 3. Regional multiplier
        const { data: regionMult } = await supabase
          .from("regional_multipliers")
          .select("multiplier")
          .eq("region", region)
          .maybeSingle();

        if (regionMult?.multiplier) {
          Object.keys(prices).forEach((key) => {
            prices[key] = prices[key] * regionMult.multiplier;
          });
        }

        setPriceMap(prices);
      } catch (err) {
        console.error("Error fetching rebar prices:", err);
      }
    };

    fetchPrices();
  }, [user, region]);

  return priceMap;
};

const getPriceForSize = (size: RebarSize, priceMap: PriceMap): number => {
  return priceMap[size] ?? 0;
};

/** --------------------
 * Core calculator (PURE)
 * -------------------- */
export function calculateRebar(input: CalcInput, priceMap: PriceMap): CalcResult {
  const {
    element,
    length,
    width,
    depth,
    columnHeight,

    barSpacing,
    meshXSpacing,
    meshYSpacing,
    stirrupSpacing,
    tieSpacing,

    longitudinalBars,
    verticalBars,

    slabLayers,

    primaryBarSize,
    meshXSize,
    meshYSize,
    stirrupSize,
    tieSize,

    devLenFactorDLong,
    devLenFactorDVert,
    hookFactorDStirrups,
    hookFactorDTies,

    wastagePercent = 5,
  } = input;

  // Resolve sizes
  const sizeMeshX: RebarSize = meshXSize ?? primaryBarSize;
  const sizeMeshY: RebarSize = meshYSize ?? primaryBarSize;
  const sizeStirrup: RebarSize = stirrupSize ?? primaryBarSize;
  const sizeTie: RebarSize = tieSize ?? primaryBarSize;

  const kgPerMPrimary = UNIT_WEIGHT_KG_PER_M[primaryBarSize];
  const kgPerMMeshX = UNIT_WEIGHT_KG_PER_M[sizeMeshX];
  const kgPerMMeshY = UNIT_WEIGHT_KG_PER_M[sizeMeshY];
  const kgPerMStir = UNIT_WEIGHT_KG_PER_M[sizeStirrup];
  const kgPerMTie = UNIT_WEIGHT_KG_PER_M[sizeTie];

  let totalBars = 0;
  let lenMeshX = 0;
  let lenMeshY = 0;
  let lenLongitudinal = 0;
  let lenVerticals = 0;
  let lenStirrups = 0;
  let lenTies = 0;
  let totalPriceperitem;

  /** SLAB / FOUNDATION */
  if (element === "slab" || element === "foundation") {
    const sx = meshXSpacing ? mmToM(parseFloat(meshXSpacing)) : mmToM(parseFloat(barSpacing || "0"));
    const sy = meshYSpacing ? mmToM(parseFloat(meshYSpacing)) : mmToM(parseFloat(barSpacing || "0"));

    const barsX = Math.floor(parseFloat(width) / sx) + 1;
    const barsY = Math.floor(parseFloat(length) / sy) + 1;

    lenMeshX = parseFloat(slabLayers || "1") * (barsX * parseFloat(length)) * parseFloat(depth);
    lenMeshY = parseFloat(slabLayers || "1") * (barsY * parseFloat(width)) * parseFloat(depth);
    totalBars += parseFloat(slabLayers || "1") * (barsX + barsY);
    const totalLengthM = totalBars * 12;
    const pricePerM = getPriceForSize(primaryBarSize, priceMap);
    totalPriceperitem = totalLengthM * pricePerM;
  }

  /** BEAM */
  if (element === "beam") {
    const devLenLong = lenFromFactorD(parseFloat(devLenFactorDLong || "0"), primaryBarSize);
    const longBarLen = parseFloat(length) + 2 * devLenLong;
    lenLongitudinal = parseFloat(longitudinalBars || "0") * longBarLen;
    totalBars += parseFloat(longitudinalBars || "0");

    const s = mmToM(parseFloat(stirrupSpacing || "0"));
    const stirrupCount = Math.floor(parseFloat(length) / s) + 1;
    const hookLen = lenFromFactorD(parseFloat(hookFactorDStirrups || "0"), sizeStirrup);
    const stirrupPerimeter = 2 * (parseFloat(width) + parseFloat(depth)) + 2 * hookLen;
    lenStirrups = stirrupCount * stirrupPerimeter;
    totalBars += stirrupCount;
    const totalLengthM = totalBars * 12;
    const pricePerM = getPriceForSize(primaryBarSize, priceMap);
    totalPriceperitem = totalLengthM * pricePerM;
  }

  /** COLUMN */
  if (element === "column") {
    const h = parseFloat(columnHeight || length);

    const devLenVert = lenFromFactorD(parseFloat(devLenFactorDVert || "12"), primaryBarSize);
    const vertBarLen = h + 2 * devLenVert;
    lenVerticals = parseFloat(verticalBars || "0") * vertBarLen;
    totalBars += parseFloat(verticalBars || "0");

    const s = mmToM(parseFloat(tieSpacing || "0"));
    const tieCount = Math.floor(h / s) + 1;
    const tieHook = lenFromFactorD(parseFloat(hookFactorDTies || "0"), sizeTie);
    const tiePerimeter = 2 * (parseFloat(width) + parseFloat(depth)) + 2 * tieHook;
    lenTies = tieCount * tiePerimeter;
    totalBars += tieCount;
    const totalLengthM = totalBars * 12;
    const pricePerM = getPriceForSize(primaryBarSize, priceMap);
    totalPriceperitem = totalLengthM * pricePerM;
  }

  // Totals with wastage
  const meshXWithWaste = withWaste(lenMeshX, wastagePercent);
  const meshYWithWaste = withWaste(lenMeshY, wastagePercent);
  const longWithWaste = withWaste(lenLongitudinal, wastagePercent);
  const vertWithWaste = withWaste(lenVerticals, wastagePercent);
  const stirWithWaste = withWaste(lenStirrups, wastagePercent);
  const tiesWithWaste = withWaste(lenTies, wastagePercent);

  const wMeshX = meshXWithWaste * kgPerMMeshX;
  const wMeshY = meshYWithWaste * kgPerMMeshY;
  const wLong = longWithWaste * kgPerMPrimary;
  const wVert = vertWithWaste * kgPerMPrimary;
  const wStir = stirWithWaste * kgPerMStir;
  const wTie = tiesWithWaste * kgPerMTie;

  const totalLengthM =
    (meshXWithWaste + meshYWithWaste + longWithWaste + vertWithWaste + stirWithWaste + tiesWithWaste);
  const totalWeightKg = wMeshX + wMeshY + wLong + wVert + wStir + wTie;

  // Pricing
  const pricePerM = getPriceForSize(primaryBarSize, priceMap);
  const totalPrice = Math.round(totalLengthM * pricePerM);

  return {
    primaryBarSize,
    totalBars,
    totalLengthM,
    totalWeightKg,
    pricePerM,
    totalPrice,
    breakdown: {
      meshX: lenMeshX,
      meshY: lenMeshY,
      longitudinal: lenLongitudinal,
      verticals: lenVerticals,
      stirrups: lenStirrups,
      ties: lenTies,
    },
    weightBreakdownKg: {
      meshX: lenMeshX ? wMeshX : undefined,
      meshY: lenMeshY ? wMeshY : undefined,
      longitudinal: lenLongitudinal ? wLong : undefined,
      verticals: lenVerticals ? wVert : undefined,
      stirrups: lenStirrups ? wStir : undefined,
      ties: lenTies ? wTie : undefined,
      totalPricePerItem: totalPriceperitem
    },
  };
}

/** Optional memoized wrapper */
export function useRebarCalculatorRow(input: CalcInput, region: string) {
  const priceMap = useRebarPrices(region);
  return useMemo(() => calculateRebar(input, priceMap), [input, priceMap]);
}

/** --------------------
 * Snapshots (Export/Import)
 * -------------------- */
export type RebarRow = CalcInput & { id: number };
export interface RebarProjectSnapshot {
  version: 1;
  createdAt: string;
  rows: RebarRow[];
}

export function createSnapshot(rows: RebarRow[]): RebarProjectSnapshot {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    rows,
  };
}

export function parseSnapshot(json: string): RebarRow[] {
  const parsed = JSON.parse(json) as RebarProjectSnapshot;
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.rows)) {
    throw new Error("Invalid snapshot");
  }
  return parsed.rows;
}
