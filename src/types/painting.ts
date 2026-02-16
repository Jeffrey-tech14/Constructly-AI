// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

/**
 * Multi-layer painting system with surface prep, undercoat, and finishing coats
 * All calculations based on m² → litres/bags with coverage rates per coat
 */

export type PaintCategory = "emulsion" | "enamel" | "wood-finish" | "metal-finish" | "finish-type";

export type EmulsionSubtype = "vinyl-matt" | "vinyl-silk" | "antibacterial";
export type EnamelSubtype = "eggshell" | "gloss";
export type WoodFinishSubtype = "eggshell" | "gloss" | "satin";
export type MetalFinishSubtype = "gloss" | "semi-gloss" | "satin";
export type FinishLevelSubtype = "eggshell" | "gloss";
export type PaintSubtype = EmulsionSubtype | EnamelSubtype | WoodFinishSubtype | MetalFinishSubtype | FinishLevelSubtype;

/**
 * STEP 7: Surface material types for paint type recommendation
 */
export type SurfaceMaterial = "walls" | "wood" | "metal" | "ceiling" | "custom";

/**
 * STEP 7: Surface preparation options
 */
export type SurfacePrep = "rough-tough" | "light-skimming" | "none";

/**
 * Coverage rates (industry standard QS practice)
 */
export interface CoverageRates {
  skimming: number; // m² per 25kg bag per coat
  undercoat: number; // m² per litre
  finishPaint: number; // m² per litre per coat
}

export const DEFAULT_COVERAGE_RATES: CoverageRates = {
  skimming: 11, // 10-12 m² per 25kg bag (11 is industry average)
  undercoat: 11, // 10-12 m² per litre (11 is industry average)
  finishPaint: 11, // 10-12 m² per litre per coat (11 is industry average)
};

/**
 * Individual layer calculation result
 */
export interface LayerCalculation {
  layerType: "skimming" | "undercoat" | "finishing";
  material: string;
  enabled: boolean;
  coats: number;
  coverage: number;
  quantity: number; // raw calculated quantity
  roundedQuantity: number; // rounded to purchasable units (net)
  grossQuantity: number; // rounded quantity adjusted for wastage (what to purchase)
  unit: "bags" | "litres";
  unitRate: number;
  totalCost: number;
  totalCostWithWastage: number;
}

/**
 * Surface preparation layer configuration
 */
export interface SkimmingConfig {
  enabled: boolean;
  coats: number; // default 2
  coverage: number; // m² per 25kg bag per coat
}

/**
 * Paint undercoat/preparation layer configuration
 */
export interface UndercoatConfig {
  enabled: boolean; // typically always true unless explicitly disabled
  coverage: number; // m² per litre (fixed 1 coat)
}

/**
 * Finishing paint layer configuration
 */
export interface FinishingPaintConfig {
  category: PaintCategory;
  subtype: PaintSubtype;
  coats: number; // default 2
  coverage: number; // m² per litre per coat
  finishType?: string; // For finish-level category, e.g., "eggshell" or "gloss"
}

/**
 * Complete painting specification for a surface/wall section
 */
export interface PaintingSpecification {
  id: string;
  surfaceArea: number; // m²
  location?: string; // e.g., "Living Room - East Wall", "All Interior Walls"

  // STEP 7: Surface material and preparation
  surfaceMaterial?: SurfaceMaterial; // walls, wood, metal, ceiling, custom
  surfacePrep?: SurfacePrep; // rough-tough, light-skimming, none

  // Layer configurations
  skimming: SkimmingConfig;
  undercoat: UndercoatConfig;
  finishingPaint: FinishingPaintConfig;
  finishType?: string; // For finish-level category, e.g., "eggshell" or "gloss"

  // Calculation snapshots (for reproducibility)
  calculations: {
    skimming: LayerCalculation | null;
    undercoat: LayerCalculation | null;
    finishing: LayerCalculation | null;
  };

  // Metadata
  createdAt: string;
  updatedAt: string;
  legacyPaintingData?: any; // For backward compatibility with old system
}

/**
 * Summary totals across all painting surfaces
 */
export interface PaintingTotals {
  totalArea: number; // m²

  // Skimming totals
  skimmingBags: number;
  skimmingCost: number;

  // Undercoat totals
  undercoatLitres: number;
  undercoatCost: number;

  // Finishing paint totals
  finishingLitres: number;
  finishingCost: number;

  // Grand totals
  totalLitres: number; // undercoat + finishing
  totalBags: number; // skimming only
  totalCost: number;
  totalCostWithWastage: number;
}

/**
 * Paint subtype options by category
 */
export const PAINT_SUBTYPES_BY_CATEGORY: Record<
  PaintCategory,
  { value: PaintSubtype; label: string }[]
> = {
  emulsion: [
    { value: "vinyl-matt", label: "Vinyl Matt" },
    { value: "vinyl-silk", label: "Vinyl Silk" },
    { value: "antibacterial", label: "Antibacterial (Hospital-grade)" },
  ],
  enamel: [
    { value: "eggshell", label: "Eggshell (Low Sheen)" },
    { value: "gloss", label: "Gloss (High Sheen)" },
  ],
  "wood-finish": [
    { value: "eggshell", label: "Eggshell (Low Sheen)" },
    { value: "satin", label: "Satin (Semi-Gloss)" },
    { value: "gloss", label: "Gloss (High Sheen)" },
  ],
  "metal-finish": [
    { value: "gloss", label: "Gloss (High Sheen)" },
    { value: "semi-gloss", label: "Semi-Gloss" },
    { value: "satin", label: "Satin (Semi-Gloss)" },
  ],
  "finish-type": [
    { value: "eggshell", label: "Eggshell Paint" },
    { value: "gloss", label: "Gloss" },
  ],
};

/**
 * STEP 7: Surface material to paint type mapping
 */
export const PAINT_TYPE_BY_SURFACE_MATERIAL: Record<
  SurfaceMaterial,
  { category: PaintCategory; subtype: PaintSubtype; finishType?: string; label: string }
> = {
  walls: {
    category: "emulsion",
    subtype: "vinyl-matt",
    label: "Wall Paint (Emulsion - Matt)",
  },
  wood: {
    category: "wood-finish",
    subtype: "eggshell",
    label: "Wood Paint (Eggshell)",
  },
  metal: {
    category: "metal-finish",
    subtype: "gloss",
    label: "Metal Paint (Gloss)",
  },
  ceiling: {
    category: "emulsion",
    subtype: "vinyl-matt",
    label: "Ceiling Paint (Emulsion - Matt)",
  },
  custom: {
    category: "emulsion",
    subtype: "vinyl-matt",
    label: "Custom Paint",
  },
};

/**
 * STEP 7: Surface preparation descriptions
 */
export const SURFACE_PREP_OPTIONS: Record<
  SurfacePrep,
  { label: string; description: string; estimatedHours?: number }
> = {
  "rough-tough": {
    label: "Rough & Tough Prep",
    description:
      "Heavy-duty surface preparation - sanding, patching, and priming for challenging surfaces",
    estimatedHours: 4,
  },
  "light-skimming": {
    label: "Light Skimming",
    description:
      "Minor surface preparation - light sanding and spot patching for good condition surfaces",
    estimatedHours: 1,
  },
  none: {
    label: "No Preparation",
    description: "Direct application to clean, prepared surfaces",
  },
};

/**
 * Validation rules for painting specifications
 */
export interface PaintingValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface PaintingValidationResult {
  valid: boolean;
  errors: PaintingValidationError[];
}

/**
 * Default configurations following QS best practice
 */
export const DEFAULT_PAINTING_CONFIG = {
  skimming: {
    enabled: true, // default to enabled for internal walls
    coats: 2,
  },
  undercoat: {
    enabled: true, // always enabled unless explicitly disabled
  },
  finishingPaint: {
    category: "emulsion" as PaintCategory,
    subtype: "vinyl-matt" as PaintSubtype,
    coats: 2,
  finishType: "eggshell",
  }, // default finish type for finish-level category
};
