import { useMemo } from "react";

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
  length: string;        // slab/beam span; column height if no columnHeight provided
  width: string;         // plan width OR section width b
  depth: string;         // slab/foundation thickness OR section depth h
  columnHeight?: string; // explicit column height (m). If provided, used instead of length for vertical bars.

  /** Spacing (mm) */
  barSpacing?: string;       // slabs/foundations (mesh c/c, applies both directions unless overridden below)
  meshXSpacing?:string;     // optional override (mm) for slab/foundation X-direction bars
  meshYSpacing?: string;     // optional override (mm) for slab/foundation Y-direction bars
  stirrupSpacing?: string;   // beams
  tieSpacing?: string;       // columns

  /** Counts */
  longitudinalBars?: string; // beams (default 4)
  verticalBars?: string;     // columns (default 4)

  /** Slab layers */
  slabLayers?: string;       // 1 or 2 (top+bottom). Default 1.

  /** Steel sizes */
  primaryBarSize: RebarSize; // longitudinal (beam) / vertical (column) / default mesh/ties sizes
  meshXSize?: RebarSize;     // slab/foundation X-direction bars
  meshYSize?: RebarSize;     // slab/foundation Y-direction bars
  stirrupSize?: RebarSize;   // beam stirrups
  tieSize?: RebarSize;       // column ties

  /** Allowances (multiples of bar diameter d) */
  devLenFactorDLong?: string;   // development length for beam longitudinal bars (default 12d)
  devLenFactorDVert?: string;   // development length for column vertical bars (default 12d)
  hookFactorDStirrups?: string; // additional length per stirrup (e.g., 6d) (default 6d)
  hookFactorDTies?: string;     // additional length per tie (default 6d)

  /** Global wastage (%) applied to all lengths */
  wastagePercent?: number;   // default 5%
}

export interface CalcBreakdown {
  meshX?: number;     // meters
  meshY?: number;     // meters
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
}

export interface CalcResult {
  totalBars: number;
  totalLengthM: number;    // with wastage
  totalWeightKg: number;   // with wastage
  breakdown: CalcBreakdown;          // raw meters (pre-wastage)
  weightBreakdownKg: WeightBreakdownKg; // post-wastage weights
}

/** --------------------
 * Helpers
 * -------------------- */
const mmToM = (mm: number) => mm / 1000;
const withWaste = (lenM: number, wastePct: number) => lenM * (1 + wastePct / 100);

/** Compute a hook/dev length in meters from factor*d */
function lenFromFactorD(factorD: number, size: RebarSize): number {
  const d_m = SIZE_DIAM_MM[size] / 1000;
  return factorD * d_m;
}

/** --------------------
 * Core calculator (PURE)
 * -------------------- */
export function calculateRebar(input: CalcInput): CalcResult {
  const {
    element,
    length,
    width,
    depth,
    columnHeight,

    barSpacing ,
    meshXSpacing,
    meshYSpacing,
    stirrupSpacing ,
    tieSpacing ,

    longitudinalBars,
    verticalBars ,

    slabLayers,

    primaryBarSize,
    meshXSize,
    meshYSize,
    stirrupSize,
    tieSize,

    devLenFactorDLong ,   // e.g., 12d default
    devLenFactorDVert ,   // e.g., 12d default
    hookFactorDStirrups ,  // e.g., 6d default
    hookFactorDTies ,      // e.g., 6d default

    wastagePercent ,
  } = input;

  // Resolve sizes per role
  const sizeMeshX: RebarSize = meshXSize ?? (meshXSpacing || meshYSpacing ? primaryBarSize : primaryBarSize);
  const sizeMeshY: RebarSize = meshYSize ?? (meshXSpacing || meshYSpacing ? primaryBarSize : primaryBarSize);
  const sizeStirrup: RebarSize = stirrupSize ?? primaryBarSize;
  const sizeTie: RebarSize = tieSize ?? primaryBarSize;

  const kgPerMPrimary = UNIT_WEIGHT_KG_PER_M[primaryBarSize];
  const kgPerMMeshX  = UNIT_WEIGHT_KG_PER_M[sizeMeshX];
  const kgPerMMeshY  = UNIT_WEIGHT_KG_PER_M[sizeMeshY];
  const kgPerMStir   = UNIT_WEIGHT_KG_PER_M[sizeStirrup];
  const kgPerMTie    = UNIT_WEIGHT_KG_PER_M[sizeTie];

  let totalBars = 0;
  let lenMeshX = 0;
  let lenMeshY = 0;
  let lenLongitudinal = 0;
  let lenVerticals = 0;
  let lenStirrups = 0;
  let lenTies = 0;

  /** SLAB / FOUNDATION: Mesh in two directions, times slabLayers */
  if (element === "slab" || element === "foundation") {
    const sx = mmToM(parseFloat(meshXSpacing)) ?? parseFloat(barSpacing);
    const sy = mmToM(parseFloat(meshYSpacing)) ?? parseFloat(barSpacing);

    const barsX = Math.floor(parseFloat(width )/ sx) * parseFloat(depth) + 1;   // running along length
    const barsY = Math.floor(parseFloat(length) / sy) * parseFloat(depth) + 1;  // running along width

    lenMeshX = parseFloat(slabLayers) * (barsX * parseFloat(length));
    lenMeshY = parseFloat(slabLayers) * (barsY * parseFloat(width));
    totalBars += parseFloat(slabLayers) * (barsX + barsY);
  }

  /** BEAM: longitudinal + stirrups with dev/hooks */
  if (element === "beam") {
    // Longitudinal: length plus development both ends
    const devLenLong = lenFromFactorD(parseFloat(devLenFactorDLong), primaryBarSize);
    const longBarLen = length + 2 * devLenLong;
    lenLongitudinal = parseFloat(longitudinalBars) * parseFloat(longBarLen);
    totalBars += parseFloat(longitudinalBars);

    // Stirrups: 2(b+h) + hooks
    const s = mmToM(parseFloat(stirrupSpacing));
    const stirrupCount = Math.floor(parseFloat(length) / s) + 1;
    const hookLen = lenFromFactorD(parseFloat(hookFactorDStirrups), sizeStirrup);
    const stirrupPerimeter = 2 * (parseFloat(width) + parseFloat(depth) + 2 * hookLen);
    lenStirrups = stirrupCount * stirrupPerimeter;
    totalBars += stirrupCount;
  }

  /** COLUMN: verticals + ties with dev/hooks */
  if (element === "column") {
    const h = parseFloat(columnHeight) ?? parseFloat(length);

    // Verticals: height + dev both ends
    const devLenVert = lenFromFactorD(parseFloat(devLenFactorDVert), primaryBarSize);
    const vertBarLen = h + 2 * devLenVert;
    lenVerticals = parseFloat(verticalBars) * vertBarLen;
    totalBars += parseFloat(verticalBars);

    // Ties: 2(b+h) + hooks
    const s = mmToM(parseFloat(tieSpacing));
    const tieCount = Math.floor(h / s) + 1;
    const tieHook = lenFromFactorD(parseFloat(hookFactorDTies), sizeTie);
    const tiePerimeter = 2 * (parseFloat(width + depth) + 2 * tieHook);
    lenTies = tieCount * tiePerimeter;
    totalBars += tieCount;
  }

  // Totals (apply wastage per category for fairer weights)
  const meshXWithWaste  = withWaste(lenMeshX, wastagePercent);
  const meshYWithWaste  = withWaste(lenMeshY, wastagePercent);
  const longWithWaste   = withWaste(lenLongitudinal, wastagePercent);
  const vertWithWaste   = withWaste(lenVerticals, wastagePercent);
  const stirWithWaste   = withWaste(lenStirrups, wastagePercent);
  const tiesWithWaste   = withWaste(lenTies, wastagePercent);

  const wMeshX = meshXWithWaste * kgPerMMeshX;
  const wMeshY = meshYWithWaste * kgPerMMeshY;
  const wLong  = longWithWaste  * kgPerMPrimary;
  const wVert  = vertWithWaste  * kgPerMPrimary;
  const wStir  = stirWithWaste  * kgPerMStir;
  const wTie   = tiesWithWaste  * kgPerMTie;

  const totalLengthM = meshXWithWaste + meshYWithWaste + longWithWaste + vertWithWaste + stirWithWaste + tiesWithWaste;
  const totalWeightKg = wMeshX + wMeshY + wLong + wVert + wStir + wTie;

  return {
    totalBars,
    totalLengthM,
    totalWeightKg,
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
    },
  };
}

/** Optional memoized wrapper for any single row object */
export function useRebarCalculatorRow(input: CalcInput) {
  return useMemo(() => calculateRebar(input), [input]);
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

/** Create a JSON-safe snapshot of current rows */
export function createSnapshot(rows: RebarRow[]): RebarProjectSnapshot {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    rows,
  };
}

/** Parse/validate a snapshot JSON string back into rows */
export function parseSnapshot(json: string): RebarRow[] {
  const parsed = JSON.parse(json) as RebarProjectSnapshot;
  if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.rows)) {
    throw new Error("Invalid snapshot");
  }
  return parsed.rows;
}
