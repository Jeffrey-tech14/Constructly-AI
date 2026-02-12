// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useCallback, useEffect } from "react";

/**
 * Deterministic Roof Material Calculation System
 * For single-storey bungalows in Kenya
 * All calculations are geometry-driven using only specified defaults and formulas
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type RoofType = "gable" | "hip" | "pitched" | "flat";
export type RoofMaterial =
  | "concrete-tiles"
  | "clay-tiles"
  | "metal-sheets"
  | "box-profile"
  | "thatch"
  | "slate"
  | "asphalt-shingles";

/**
 * Global defaults for roof calculations
 * These can be overridden by user input
 */
export interface RoofDefaults {
  roofType: RoofType;
  pitchDegrees: number;
  eaveWidthM: number;
  rasterSpacingMm: number;
  trussSpacingMm: number;
  structuralTimberWastagePercent: number;
  roofingSheetWastagePercent: number;
  miscellaneousAllowancePercent: number;
}

/**
 * Required building inputs for calculation
 */
export interface BuildingInputs {
  footprintAreaM2: number; // A (m²)
  externalPerimeterM: number; // P (m)
  internalPerimeterM?: number; // Optional internal perimeter for wall plates
  buildingLengthM: number; // L (m)
  buildingWidthM: number; // W (m)
  roofTrussTypeKingPost: boolean;
  purlinSpacingM: number;
  roofingSheetEffectiveCoverWidthM: number;
  roofingSheetLengthM: number;
  // Optional overrides
  roofType?: RoofType;
  pitchDegrees?: number;
  eaveWidthM?: number;
  rasterSpacingMm?: number;
  trussSpacingMm?: number;
  structuralTimberWastagePercent?: number;
  roofingSheetWastagePercent?: number;
  miscellaneousAllowancePercent?: number;
}

/**
 * Calculated roof geometry values
 */
export interface RoofGeometry {
  projectedRoofAreaM2: number;
  effectiveRoofAreaM2: number;
  halfSpanM: number;
  rasterLengthM: number;
  pitchRadians: number;
}

/**
 * Detailed timber calculations
 */
export interface TimberCalculation {
  name: string;
  sizeXxY: string; // e.g., "100x50"
  quantityPcs: number;
  quantityWithWastagePercent: number;
  lengthPerPieceM: number;
  totalLengthM: number;
  totalLengthWithWastageM: number;
  wasteageAllowanceM: number;
  unitLm: string; // "m"
  unitPrice?: number; // Price per unit (per meter)
  totalPrice?: number; // Total price before wastage
  totalPriceWithWastage?: number; // Total price with wastage
}

/**
 * Detailed roofing sheet calculations
 */
export interface RoofingSheetCalculation {
  sheetCoverAreaM2: number;
  quantityRequired: number;
  quantityWithWastagePercent: number;
  wastageAllowancePercent: number;
  unitPcs: string; // "pcs"
  unitPrice?: number; // Price per sheet
  totalPrice?: number; // Total price before wastage
  totalPriceWithWastage?: number; // Total price with wastage
}

/**
 * Complete material breakdown with all calculations
 */
export interface RoofMaterialBreakdown {
  defaults: RoofDefaults;
  buildingInputs: BuildingInputs;
  geometry: RoofGeometry;

  // Structural timber (all in meters, then converted to quantity)
  wallPlates: TimberCalculation;
  tieBeams: TimberCalculation;
  kingPosts?: TimberCalculation;
  rafters: TimberCalculation;
  purlins: TimberCalculation;
  struts: TimberCalculation;

  // Roofing sheets
  roofingSheets: RoofingSheetCalculation;

  // Gutters and Fascia
  gutters: TimberCalculation;
  fascia: TimberCalculation;

  // Miscellaneous allowance (5% applied last)
  miscellaneousAllowancePercent: number;

  // Pricing totals
  totalCost?: number; // Total cost before wastage allowance
  totalCostWithWastage?: number; // Total cost with wastage allowance
}

export interface RoofStructure {
  id: string;
  name: string;
  type: RoofType;
  material: RoofMaterial;
  area: number; // m² (footprintAreaM2)
  pitch: number; // degrees (pitchDegrees)
  length: number; // meters (buildingLengthM)
  width: number; // meters (buildingWidthM)
  eavesOverhang: number; // meters (eaveWidthM)
  externalPerimeterM: number; // P (m) - REQUIRED for calculations
  internalPerimeterM?: number; // Optional internal perimeter for wall plates
  roofTrussTypeKingPost: boolean; // REQUIRED - whether to include king posts
  purlinSpacingM: number; // REQUIRED - spacing between purlins
  roofingSheetEffectiveCoverWidthM: number; // REQUIRED - effective cover width of sheets
  roofingSheetLengthM: number; // REQUIRED - length of roofing sheets
  ridgeLength?: number; // meters
  covering: any;
  grade?: string;
  treatment?: string;
  timbers: any[];
  accessories?: any;
  isLumpSum?: boolean;
  lumpSumAmount?: number;
  // Optional overrides for defaults
  rasterSpacingMm?: number;
  trussSpacingMm?: number;
  structuralTimberWastagePercent?: number;
  roofingSheetWastagePercent?: number;
  miscellaneousAllowancePercent?: number;
}

export interface RoofingCalculation {
  id: string;
  name: string;
  type: RoofType;
  material: RoofMaterial;
  area: number;
  totalTimberVolume: number;
  coveringArea: number;
  materialCost: number;
  materialCostWithWastage: number;
  totalCost: number;
  totalCostWithWastage: number;
  breakdown: any;
  breakdownWithWastage: any;
  efficiency: any;
  wastage: any;
}

export interface RoofingTotals {
  totalArea: number;
  totalTimberVolume: number;
  totalCoveringArea: number;
  totalMaterialCost: number;
  totalMaterialCostWithWastage: number;
  totalCost: number;
  totalCostWithWastage: number;
  breakdown: any;
  breakdownWithWastage: any;
  wastage: any;
}

// ============================================================================
// CONSTANTS - GLOBAL DEFAULTS
// ============================================================================

const GLOBAL_DEFAULTS: RoofDefaults = {
  roofType: "gable",
  pitchDegrees: 25,
  eaveWidthM: 0.8,
  rasterSpacingMm: 600,
  trussSpacingMm: 600,
  structuralTimberWastagePercent: 15,
  roofingSheetWastagePercent: 15,
  miscellaneousAllowancePercent: 5,
};

// ============================================================================
// CALCULATION HELPER FUNCTIONS
// ============================================================================

/**
 * Section 2: Pitch conversion and trigonometric calculations
 */
function degreeToRadian(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Section 3.1: Projected Roof Plan Area
 * projected_roof_area = A + (P × eave_width)
 */
function calculateProjectedRoofArea(
  footprintAreaM2: number,
  externalPerimeterM: number,
  eaveWidthM: number
): number {
  return footprintAreaM2 + externalPerimeterM * eaveWidthM;
}

/**
 * Section 3.2: Effective (Sloped) Roof Area
 * effective_roof_area = projected_roof_area / cos(pitch)
 */
function calculateEffectiveRoofArea(
  projectedAreaM2: number,
  pitchDegrees: number
): number {
  const pitchRad = degreeToRadian(pitchDegrees);
  return projectedAreaM2 / Math.cos(pitchRad);
}

/**
 * Section 4.1: Raster Slope Length
 * raster_length = (half_span + eave_width) / cos(pitch)
 */
function calculateRasterLength(
  halfSpanM: number,
  eaveWidthM: number,
  pitchDegrees: number
): number {
  const pitchRad = degreeToRadian(pitchDegrees);
  return (halfSpanM + eaveWidthM) / Math.cos(pitchRad);
}

/**
 * Section 5: Wall Plates
 * wall_plate_length = P × (1 + 0.10 wastage)
 * 100 × 50 mm timber
 */
function calculateWallPlates(
  externalPerimeterM: number,
  internalPerimeterM: number = 0,
  defaults: RoofDefaults
): TimberCalculation {
  const wastageRatio = 0.1; // 10% wastage for wall plates
  const perimeterBeforeWastage = externalPerimeterM + internalPerimeterM;
  const totalLengthM = perimeterBeforeWastage * (1 + wastageRatio);

  return {
    name: "Wall Plates",
    sizeXxY: "100x50",
    quantityPcs: 0, // Wall plates are measured in linear meters
    quantityWithWastagePercent: 0,
    lengthPerPieceM: perimeterBeforeWastage,
    totalLengthM: perimeterBeforeWastage,
    totalLengthWithWastageM: totalLengthM,
    wasteageAllowanceM: perimeterBeforeWastage * wastageRatio,
    unitLm: "m",
  };
}

/**
 * Section 6: Number of Trusses
 * truss_count = ceil(L / truss_spacing)
 */
function calculateTrussCount(
  buildingLengthM: number,
  trussSpacingMm: number
): number {
  const trussSpacingM = trussSpacingMm / 1000;
  return Math.ceil(buildingLengthM / trussSpacingM);
}

/**
 * Section 7: Tie Beams
 * total_tie_beam_length = truss_count × tie_beam_length_per_truss × (1 + 0.15 wastage)
 * Tie beams are 100 × 50 mm horizontal members
 */
function calculateTieBeams(
  trussCount: number,
  buildingWidthM: number,
  defaults: RoofDefaults
): TimberCalculation {
  const wastageRatio = defaults.structuralTimberWastagePercent / 100;
  const totalLengthBeforeWastage = trussCount * buildingWidthM;
  const totalLengthM = totalLengthBeforeWastage * (1 + wastageRatio);
  const wastageM = totalLengthM - totalLengthBeforeWastage;

  return {
    name: "Tie Beams",
    sizeXxY: "100x50",
    quantityPcs: 0,
    quantityWithWastagePercent: 0,
    lengthPerPieceM: buildingWidthM,
    totalLengthM: totalLengthBeforeWastage,
    totalLengthWithWastageM: totalLengthM,
    wasteageAllowanceM: wastageM,
    unitLm: "m",
  };
}

/**
 * Section 8: King Posts
 * Only if king_post = true
 * king_post_length = half_span × tan(pitch)
 * total_king_post_length = truss_count × king_post_length × (1 + 0.15 wastage)
 * 100 × 50 mm timber
 */
function calculateKingPosts(
  trussCount: number,
  halfSpanM: number,
  pitchDegrees: number,
  defaults: RoofDefaults
): TimberCalculation | undefined {
  if (!defaults || pitchDegrees === undefined) {
    return undefined;
  }

  const pitchRad = degreeToRadian(pitchDegrees);
  const kingPostLengthPerTruss = halfSpanM * Math.tan(pitchRad);
  const wastageRatio = defaults.structuralTimberWastagePercent / 100;
  const totalLengthBeforeWastage = trussCount * kingPostLengthPerTruss;
  const totalLengthM = totalLengthBeforeWastage * (1 + wastageRatio);
  const wastageM = totalLengthM - totalLengthBeforeWastage;

  return {
    name: "King Posts",
    sizeXxY: "100x50",
    quantityPcs: 0,
    quantityWithWastagePercent: 0,
    lengthPerPieceM: kingPostLengthPerTruss,
    totalLengthM: totalLengthBeforeWastage,
    totalLengthWithWastageM: totalLengthM,
    wasteageAllowanceM: wastageM,
    unitLm: "m",
  };
}

/**
 * Section 9: Rafters
 * 75 × 50 mm timber
 * Formula: effective_roof_area × 1.68 × (1 + 0.15 wastage)
 * Where 1.68 is the meters of rafter per m² of roof area
 */
function calculateRafters(
  effectiveRoofAreaM2: number,
  defaults: RoofDefaults
): TimberCalculation {
  const raftermeterPerM2 = 1.68; // Constant for rafter length per m² of roof
  const wastageRatio = defaults.structuralTimberWastagePercent / 100;
  const totalLengthBeforeWastage = effectiveRoofAreaM2 * raftermeterPerM2;
  const totalLengthM = totalLengthBeforeWastage * (1 + wastageRatio);
  const wastageM = totalLengthM - totalLengthBeforeWastage;

  return {
    name: "Rafters",
    sizeXxY: "75x50",
    quantityPcs: 0, // Calculated based on continuous length
    quantityWithWastagePercent: 0,
    lengthPerPieceM: raftermeterPerM2,
    totalLengthM: totalLengthBeforeWastage,
    totalLengthWithWastageM: totalLengthM,
    wasteageAllowanceM: wastageM,
    unitLm: "m",
  };
}

/**
 * Section 10: Purlins
 * 50 × 50 mm timber
 * purlin_rows = ceil(raster_length / purlin_spacing)
 * total_purlin_length = purlin_rows × L × 2 × (1 + 0.15 wastage)
 */
function calculatePurlins(
  rasterLengthM: number,
  buildingLengthM: number,
  purlinSpacingM: number,
  defaults: RoofDefaults
): TimberCalculation {
  const purlinRows = Math.ceil(rasterLengthM / purlinSpacingM);
  const wastageRatio = defaults.structuralTimberWastagePercent / 100;
  const totalLengthBeforeWastage = purlinRows * buildingLengthM * 2;
  const totalLengthM = totalLengthBeforeWastage * (1 + wastageRatio);
  const wastageM = totalLengthM - totalLengthBeforeWastage;

  return {
    name: "Purlins",
    sizeXxY: "50x50",
    quantityPcs: 0,
    quantityWithWastagePercent: 0,
    lengthPerPieceM: buildingLengthM * 2,
    totalLengthM: totalLengthBeforeWastage,
    totalLengthWithWastageM: totalLengthM,
    wasteageAllowanceM: wastageM,
    unitLm: "m",
  };
}

/**
 * Section 11: Struts
 * 50 × 50 mm timber
 * Approximately 2 struts per truss
 * strut_length ≈ raster_length / 2
 * total_strut_length = truss_count × 2 × strut_length × (1 + 0.15 wastage)
 */
function calculateStruts(
  trussCount: number,
  rasterLengthM: number,
  defaults: RoofDefaults
): TimberCalculation {
  const strutLength = rasterLengthM / 2;
  const wastageRatio = defaults.structuralTimberWastagePercent / 100;
  const totalLengthBeforeWastage = trussCount * 2 * strutLength;
  const totalLengthM = totalLengthBeforeWastage * (1 + wastageRatio);
  const wastageM = totalLengthM - totalLengthBeforeWastage;

  return {
    name: "Struts",
    sizeXxY: "50x50",
    quantityPcs: trussCount * 2,
    quantityWithWastagePercent: 0,
    lengthPerPieceM: strutLength,
    totalLengthM: totalLengthBeforeWastage,
    totalLengthWithWastageM: totalLengthM,
    wasteageAllowanceM: wastageM,
    unitLm: "m",
  };
}

/**
 * Section 12: Gutters
 * Gutters run along the perimeter of the building
 * Linear calculation based on external perimeter
 */
function calculateGutters(
  externalPerimeterM: number
): TimberCalculation {
  // Gutters are typically measured in linear meters
  // No wastage for gutters as they are pre-fabricated sections
  return {
    name: "Gutters",
    sizeXxY: "Gutter Section",
    quantityPcs: 0,
    quantityWithWastagePercent: 0,
    lengthPerPieceM: externalPerimeterM,
    totalLengthM: externalPerimeterM,
    totalLengthWithWastageM: externalPerimeterM,
    wasteageAllowanceM: 0,
    unitLm: "m",
  };
}

/**
 * Section 13: Fascia
 * Fascia boards run along the perimeter of the building
 * Linear calculation based on external perimeter
 */
function calculateFascia(
  externalPerimeterM: number
): TimberCalculation {
  // Fascia is typically 1x6 or similar trim board
  // No wastage as it's pre-cut to specification
  return {
    name: "Fascia",
    sizeXxY: "Fascia Board",
    quantityPcs: 0,
    quantityWithWastagePercent: 0,
    lengthPerPieceM: externalPerimeterM,
    totalLengthM: externalPerimeterM,
    totalLengthWithWastageM: externalPerimeterM,
    wasteageAllowanceM: 0,
    unitLm: "m",
  };
}

/**
 * Section 14: Roofing Sheets
 * sheet_cover_area = effective_cover_width × sheet_length
 * sheet_quantity = effective_roof_area / sheet_cover_area
 * Apply wastage: sheet_count × (1 + 0.15)
 */
function calculateRoofingSheets(
  effectiveRoofAreaM2: number,
  sheetEffectiveCoverWidthM: number,
  sheetLengthM: number,
  defaults: RoofDefaults
): RoofingSheetCalculation {
  const sheetCoverAreaM2 = sheetEffectiveCoverWidthM * sheetLengthM;
  const quantityRequired = effectiveRoofAreaM2 / sheetCoverAreaM2;
  const wastageRatio = defaults.roofingSheetWastagePercent / 100;
  const quantityWithWastage = quantityRequired * (1 + wastageRatio);

  return {
    sheetCoverAreaM2,
    quantityRequired: Math.ceil(quantityRequired),
    quantityWithWastagePercent: Math.ceil(quantityWithWastage),
    wastageAllowancePercent: defaults.roofingSheetWastagePercent,
    unitPcs: "pcs",
  };
}

// ============================================================================
// PRICING HELPER FUNCTIONS
// ============================================================================

/**
 * Get timber price per meter from materialPrices
 */
function getTimberPrice(
  materialPrices: any,
  timberSize: string
): number {
  if (!Array.isArray(materialPrices)) return 0;

  const roofingMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "roof-covering"
  );

  if (!roofingMaterial || !Array.isArray(roofingMaterial.type)) {
    return 0;
  }

  // Find the object in type array that contains structuralTimber
  const structuralTimberObj = roofingMaterial.type.find((item: any) =>
    Array.isArray(item.structuralTimber)
  );

  if (!structuralTimberObj || !Array.isArray(structuralTimberObj.structuralTimber)) {
    return 0;
  }

  const timber = structuralTimberObj.structuralTimber.find((t: any) =>
    t.size?.toLowerCase() === timberSize.toLowerCase()
  );

  return timber?.price_kes || 0;
}

/**
 * Get roofing sheet price per piece from materialPrices
 */
function getRoofingSheetPrice(
  materialPrices: any,
  sheetType: string = "metal-sheet"
): number {
  if (!Array.isArray(materialPrices)) return 0;

  const roofingMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "roof-covering"
  );

  if (!roofingMaterial || !Array.isArray(roofingMaterial.type)) {
    return 0;
  }

  // Find the object in type array that contains roofingSheets
  const roofingSheetsObj = roofingMaterial.type.find((item: any) =>
    Array.isArray(item.roofingSheets)
  );

  if (!roofingSheetsObj || !Array.isArray(roofingSheetsObj.roofingSheets)) {
    return 0;
  }

  const sheet = roofingSheetsObj.roofingSheets.find((s: any) =>
    s.type?.toLowerCase() === sheetType.toLowerCase()
  );

  return sheet?.price_kes || 0;
}

/**
 * Get gutter/fascia price per meter from materialPrices
 */
function getFinishingPrice(
  materialPrices: any,
  finishType: string,
  itemType: string
): number {
  if (!Array.isArray(materialPrices)) return 0;

  const roofingMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "roof-covering"
  );

  if (!roofingMaterial || !Array.isArray(roofingMaterial.type)) {
    return 0;
  }

  // Find the object in type array that contains roofingFinishing
  const roofingFinishingObj = roofingMaterial.type.find((item: any) =>
    Array.isArray(item.roofingFinishing)
  );

  if (!roofingFinishingObj || !Array.isArray(roofingFinishingObj.roofingFinishing)) {
    return 0;
  }

  const finishing = roofingFinishingObj.roofingFinishing;
  const category = finishing.find((f: any) =>
    f.name?.toLowerCase() === finishType.toLowerCase()
  );

  if (!category || !Array.isArray(category.types)) return 0;

  const item = category.types.find((t: any) =>
    t.name?.toLowerCase() === itemType.toLowerCase()
  );

  return item?.price_kes || 0;
}

/**
 * Apply prices to timber calculation
 */
function applyTimberPricing(
  timber: TimberCalculation,
  materialPrices: any
): TimberCalculation {
  const unitPrice = getTimberPrice(materialPrices, timber.sizeXxY);
  const totalPrice = timber.totalLengthM * unitPrice;
  const totalPriceWithWastage = timber.totalLengthWithWastageM * unitPrice;

  return {
    ...timber,
    unitPrice,
    totalPrice,
    totalPriceWithWastage,
  };
}

/**
 * Apply prices to roofing sheet calculation
 */
function applyRoofingSheetPricing(
  sheets: RoofingSheetCalculation,
  materialPrices: any
): RoofingSheetCalculation {
  const unitPrice = getRoofingSheetPrice(materialPrices, "metal-sheet");
  const totalPrice = sheets.quantityRequired * unitPrice;
  const totalPriceWithWastage = sheets.quantityWithWastagePercent * unitPrice;

  return {
    ...sheets,
    unitPrice,
    totalPrice,
    totalPriceWithWastage,
  };
}

/**
 * Apply prices to gutter calculation
 */
function applyGutterPricing(
  gutter: TimberCalculation,
  materialPrices: any
): TimberCalculation {
  const unitPrice = getFinishingPrice(materialPrices, "Gutters", "steel-gutter");
  const totalPrice = gutter.totalLengthM * unitPrice;
  const totalPriceWithWastage = gutter.totalLengthWithWastageM * unitPrice;

  return {
    ...gutter,
    unitPrice,
    totalPrice,
    totalPriceWithWastage,
  };
}

/**
 * Apply prices to fascia calculation
 */
function applyFasciaPricing(
  fascia: TimberCalculation,
  materialPrices: any
): TimberCalculation {
  const unitPrice = getFinishingPrice(materialPrices, "Fascia", "timber-fascia");
  const totalPrice = fascia.totalLengthM * unitPrice;
  const totalPriceWithWastage = fascia.totalLengthWithWastageM * unitPrice;

  return {
    ...fascia,
    unitPrice,
    totalPrice,
    totalPriceWithWastage,
  };
}

export default function useRoofingCalculator(
  roofStructures: RoofStructure[],
  materialPrices: any,
  quote: any,
  setQuoteData
) {
  const [calculations, setCalculations] = useState<RoofingCalculation[]>([]);
  const [totals, setTotals] = useState<RoofingTotals>({
    totalArea: 0,
    totalTimberVolume: 0,
    totalCoveringArea: 0,
    totalMaterialCost: 0,
    totalMaterialCostWithWastage: 0,
    totalCost: 0,
    totalCostWithWastage: 0,
    breakdown: {
      timber: 0,
      covering: 0,
      accessories: 0,
      insulation: 0,
      underlayment: 0,
    },
    breakdownWithWastage: {
      timber: 0,
      covering: 0,
      accessories: 0,
      insulation: 0,
      underlayment: 0,
    },
    wastage: {
      percentage: 0,
      totalAdjustedItems: 0,
      totalWastageItems: 0,
    },
  });

  /**
   * Merge user inputs with global defaults
   */
  const resolveDefaults = useCallback(
    (inputs: BuildingInputs): RoofDefaults => {
      return {
        roofType: inputs.roofType || GLOBAL_DEFAULTS.roofType,
        pitchDegrees: inputs.pitchDegrees ?? GLOBAL_DEFAULTS.pitchDegrees,
        eaveWidthM: inputs.eaveWidthM ?? GLOBAL_DEFAULTS.eaveWidthM,
        rasterSpacingMm:
          inputs.rasterSpacingMm ?? GLOBAL_DEFAULTS.rasterSpacingMm,
        trussSpacingMm: inputs.trussSpacingMm ?? GLOBAL_DEFAULTS.trussSpacingMm,
        structuralTimberWastagePercent:
          inputs.structuralTimberWastagePercent ??
          GLOBAL_DEFAULTS.structuralTimberWastagePercent,
        roofingSheetWastagePercent:
          inputs.roofingSheetWastagePercent ??
          GLOBAL_DEFAULTS.roofingSheetWastagePercent,
        miscellaneousAllowancePercent:
          inputs.miscellaneousAllowancePercent ??
          GLOBAL_DEFAULTS.miscellaneousAllowancePercent,
      };
    },
    []
  );

  /**
   * Main calculation function that performs all roof material calculations
   * based on deterministic formulas and geometry
   */
  const calculateRoofMaterials = useCallback(
    (inputs: BuildingInputs): RoofMaterialBreakdown => {
      // Resolve all defaults
      const defaults = resolveDefaults(inputs);

      // ===== SECTION 3: BASE ROOF GEOMETRY =====
      const projectedRoofArea = calculateProjectedRoofArea(
        inputs.footprintAreaM2,
        inputs.externalPerimeterM,
        defaults.eaveWidthM
      );

      const effectiveRoofArea = calculateEffectiveRoofArea(
        projectedRoofArea,
        defaults.pitchDegrees
      );

      const halfSpan = inputs.buildingWidthM / 2;

      const rasterLength = calculateRasterLength(
        halfSpan,
        defaults.eaveWidthM,
        defaults.pitchDegrees
      );

      const geometry: RoofGeometry = {
        projectedRoofAreaM2: projectedRoofArea,
        effectiveRoofAreaM2: effectiveRoofArea,
        halfSpanM: halfSpan,
        rasterLengthM: rasterLength,
        pitchRadians: degreeToRadian(defaults.pitchDegrees),
      };

      // ===== SECTION 5: WALL PLATES =====
      const wallPlates = applyTimberPricing(
        calculateWallPlates(
          inputs.externalPerimeterM,
          inputs.internalPerimeterM || 0,
          defaults
        ),
        materialPrices
      );

      // ===== SECTION 6: TRUSSES =====
      const trussCount = calculateTrussCount(
        inputs.buildingLengthM,
        defaults.trussSpacingMm
      );

      // ===== SECTION 7: TIE BEAMS =====
      const tieBeams = applyTimberPricing(
        calculateTieBeams(
          trussCount,
          inputs.buildingWidthM,
          defaults
        ),
        materialPrices
      );

      // ===== SECTION 8: KING POSTS =====
      const kingPosts = inputs.roofTrussTypeKingPost
        ? applyTimberPricing(
            calculateKingPosts(
              trussCount,
              halfSpan,
              defaults.pitchDegrees,
              defaults
            ) as TimberCalculation,
            materialPrices
          )
        : undefined;

      // ===== SECTION 9: RAFTERS =====
      const rafters = applyTimberPricing(
        calculateRafters(
          effectiveRoofArea,
          defaults
        ),
        materialPrices
      );

      // ===== SECTION 10: PURLINS =====
      const purlins = applyTimberPricing(
        calculatePurlins(
          rasterLength,
          inputs.buildingLengthM,
          inputs.purlinSpacingM,
          defaults
        ),
        materialPrices
      );

      // ===== SECTION 11: STRUTS =====
      const struts = applyTimberPricing(
        calculateStruts(trussCount, rasterLength, defaults),
        materialPrices
      );

      // ===== SECTION 12: GUTTERS =====
      const gutters = applyGutterPricing(
        calculateGutters(inputs.externalPerimeterM),
        materialPrices
      );

      // ===== SECTION 13: FASCIA =====
      const fascia = applyFasciaPricing(
        calculateFascia(inputs.externalPerimeterM),
        materialPrices
      );

      // ===== SECTION 14: ROOFING SHEETS =====
      const roofingSheets = applyRoofingSheetPricing(
        calculateRoofingSheets(
          effectiveRoofArea,
          inputs.roofingSheetEffectiveCoverWidthM,
          inputs.roofingSheetLengthM,
          defaults
        ),
        materialPrices
      );

      // ===== CALCULATE TOTAL COSTS =====
      const timberItems = [wallPlates, tieBeams, kingPosts, rafters, purlins, struts, gutters, fascia].filter(Boolean);
      const totalTimberCost = timberItems.reduce((sum, item) => sum + (item?.totalPrice || 0), 0);
      const totalTimberCostWithWastage = timberItems.reduce((sum, item) => sum + (item?.totalPriceWithWastage || 0), 0);

      const totalSheetsCost = roofingSheets.totalPrice || 0;
      const totalSheetsCostWithWastage = roofingSheets.totalPriceWithWastage || 0;

      const totalCost = totalTimberCost + totalSheetsCost;
      const totalCostWithWastage = totalTimberCostWithWastage + totalSheetsCostWithWastage;

      return {
        defaults,
        buildingInputs: inputs,
        geometry,
        wallPlates,
        tieBeams,
        kingPosts,
        rafters,
        purlins,
        struts,
        gutters,
        fascia,
        roofingSheets,
        miscellaneousAllowancePercent:
          defaults.miscellaneousAllowancePercent,
        totalCost,
        totalCostWithWastage,
      };
    },
    [resolveDefaults, materialPrices]
  );

  /**
   * Calculate all roof structures
   */
  const calculateAll = useCallback(() => {
    const calculatedResults = roofStructures.map((roof) => {
      // Map RoofStructure fields to BuildingInputs
      const buildingInputs: BuildingInputs = {
        footprintAreaM2: roof.area,
        externalPerimeterM: roof.externalPerimeterM,
        internalPerimeterM: roof.internalPerimeterM,
        buildingLengthM: roof.length,
        buildingWidthM: roof.width,
        roofTrussTypeKingPost: roof.roofTrussTypeKingPost,
        purlinSpacingM: roof.purlinSpacingM,
        roofingSheetEffectiveCoverWidthM: roof.roofingSheetEffectiveCoverWidthM,
        roofingSheetLengthM: roof.roofingSheetLengthM,
        roofType: roof.type,
        pitchDegrees: roof.pitch,
        eaveWidthM: roof.eavesOverhang,
        rasterSpacingMm: roof.rasterSpacingMm,
        trussSpacingMm: roof.trussSpacingMm,
        structuralTimberWastagePercent: roof.structuralTimberWastagePercent,
        roofingSheetWastagePercent: roof.roofingSheetWastagePercent,
        miscellaneousAllowancePercent: roof.miscellaneousAllowancePercent,
      };

      // Calculate roof materials using the deterministic calculation system
      const materialBreakdown = calculateRoofMaterials(buildingInputs);

      // Aggregate all timber costs
      const timberItems = [
        materialBreakdown.wallPlates,
        materialBreakdown.tieBeams,
        materialBreakdown.kingPosts,
        materialBreakdown.rafters,
        materialBreakdown.purlins,
        materialBreakdown.struts,
        materialBreakdown.gutters,
        materialBreakdown.fascia,
      ].filter(Boolean);

      const totalTimberCost = timberItems.reduce((sum, item) => sum + (item?.totalPrice || 0), 0);
      const totalTimberCostWithWastage = timberItems.reduce((sum, item) => sum + (item?.totalPriceWithWastage || 0), 0);

      const totalSheetsCost = materialBreakdown.roofingSheets.totalPrice || 0;
      const totalSheetsCostWithWastage = materialBreakdown.roofingSheets.totalPriceWithWastage || 0;

      return {
        id: roof.id,
        name: roof.name,
        type: roof.type,
        material: roof.material,
        area: roof.area,
        totalTimberVolume: 0,
        coveringArea: materialBreakdown.geometry.effectiveRoofAreaM2,
        materialCost: totalTimberCost + totalSheetsCost,
        materialCostWithWastage: totalTimberCostWithWastage + totalSheetsCostWithWastage,
        totalCost: totalTimberCost + totalSheetsCost,
        totalCostWithWastage: totalTimberCostWithWastage + totalSheetsCostWithWastage,
        breakdown: {
          timber: totalTimberCost,
          covering: totalSheetsCost,
          wallPlates: materialBreakdown.wallPlates.totalPrice || 0,
          tieBeams: materialBreakdown.tieBeams.totalPrice || 0,
          kingPosts: materialBreakdown.kingPosts?.totalPrice || 0,
          rafters: materialBreakdown.rafters.totalPrice || 0,
          purlins: materialBreakdown.purlins.totalPrice || 0,
          struts: materialBreakdown.struts.totalPrice || 0,
          gutters: materialBreakdown.gutters.totalPrice || 0,
          fascia: materialBreakdown.fascia.totalPrice || 0,
          roofingSheets: totalSheetsCost,
        },
        breakdownWithWastage: {
          timber: totalTimberCostWithWastage,
          covering: totalSheetsCostWithWastage,
          wallPlates: materialBreakdown.wallPlates.totalPriceWithWastage || 0,
          tieBeams: materialBreakdown.tieBeams.totalPriceWithWastage || 0,
          kingPosts: materialBreakdown.kingPosts?.totalPriceWithWastage || 0,
          rafters: materialBreakdown.rafters.totalPriceWithWastage || 0,
          purlins: materialBreakdown.purlins.totalPriceWithWastage || 0,
          struts: materialBreakdown.struts.totalPriceWithWastage || 0,
          gutters: materialBreakdown.gutters.totalPriceWithWastage || 0,
          fascia: materialBreakdown.fascia.totalPriceWithWastage || 0,
          roofingSheets: totalSheetsCostWithWastage,
        },
        efficiency: {},
        wastage: {
          percentage: materialBreakdown.miscellaneousAllowancePercent,
        },
        // Include full material breakdown for reference
        materialBreakdown,
      };
    });
    
    setCalculations(calculatedResults);

    // Calculate totals across all roof structures
    const totalCost = calculatedResults.reduce((sum, r) => sum + r.totalCost, 0);
    const totalCostWithWastage = calculatedResults.reduce((sum, r) => sum + r.totalCostWithWastage, 0);

    setTotals({
      totalArea: roofStructures.reduce((sum, r) => sum + r.area, 0),
      totalTimberVolume: 0,
      totalCoveringArea: calculatedResults.reduce((sum, r) => sum + r.coveringArea, 0),
      totalMaterialCost: totalCost,
      totalMaterialCostWithWastage: totalCostWithWastage,
      totalCost: totalCost,
      totalCostWithWastage: totalCostWithWastage,
      breakdown: {
        timber: calculatedResults.reduce((sum, r) => sum + (r.breakdown?.timber || 0), 0),
        covering: calculatedResults.reduce((sum, r) => sum + (r.breakdown?.covering || 0), 0),
        accessories: 0,
        insulation: 0,
        underlayment: 0,
      },
      breakdownWithWastage: {
        timber: calculatedResults.reduce((sum, r) => sum + (r.breakdownWithWastage?.timber || 0), 0),
        covering: calculatedResults.reduce((sum, r) => sum + (r.breakdownWithWastage?.covering || 0), 0),
        accessories: 0,
        insulation: 0,
        underlayment: 0,
      },
      wastage: {
        percentage: 5,
        totalAdjustedItems: 0,
        totalWastageItems: 0,
      },
    });
  }, [roofStructures, calculateRoofMaterials]);
  useEffect(() => {
    if (roofStructures?.length > 0) {
      calculateAll();
    } else {
      setCalculations([]);
      setTotals({
        totalArea: 0,
        totalTimberVolume: 0,
        totalCoveringArea: 0,
        totalMaterialCost: 0,
        totalMaterialCostWithWastage: 0,
        totalCost: 0,
        totalCostWithWastage: 0,
        breakdown: {
          timber: 0,
          covering: 0,
          accessories: 0,
          insulation: 0,
          underlayment: 0,
        },
        breakdownWithWastage: {
          timber: 0,
          covering: 0,
          accessories: 0,
          insulation: 0,
          underlayment: 0,
        },
        wastage: {
          percentage: 0,
          totalAdjustedItems: 0,
          totalWastageItems: 0,
        },
      });
    }
  }, [roofStructures, calculateAll]);

  const combined = { ...totals, calculations };

  useEffect(() => {
    if (setQuoteData && combined) {
      setQuoteData((prev: any) => ({
        ...prev,
        roofing_calculations: combined,
        roofingInputs: roofStructures,
      }));
    }
  }, [combined, roofStructures, setQuoteData]);

  return {
    calculations,
    totals,
    calculateAll,
    calculateRoofMaterials,
  };
}