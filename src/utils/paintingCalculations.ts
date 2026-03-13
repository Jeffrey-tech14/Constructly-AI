// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

/**
 * Core painting calculation engine
 * Implements multi-layer painting workflow with coverage-based calculations
 */

import {
  PaintingSpecification,
  LayerCalculation,
  PaintingTotals,
  PaintingValidationResult,
  PaintingValidationError,
  DEFAULT_COVERAGE_RATES,
  CoverageRates,
} from "@/types/painting";

/**
 * Validate a painting specification
 */
export function validatePaintingSpec(
  spec: PaintingSpecification,
): PaintingValidationResult {
  const errors: PaintingValidationError[] = [];

  if (!spec.surfaceArea || spec.surfaceArea <= 0) {
    errors.push({
      field: "surfaceArea",
      message: "Surface area must be greater than 0",
      severity: "error",
    });
  }

  if (spec.surfaceArea > 5000) {
    errors.push({
      field: "surfaceArea",
      message: "Surface area seems unusually large (>5000 m²)",
      severity: "warning",
    });
  }

  // Validate skimming coats
  if (spec.skimming.enabled) {
    if (spec.skimming.coats < 1 || spec.skimming.coats > 5) {
      errors.push({
        field: "skimming.coats",
        message: "Skimming coats should be between 1 and 5",
        severity: "warning",
      });
    }
  }

  // Validate finishing coats
  if (spec.finishingPaint.coats < 1 || spec.finishingPaint.coats > 4) {
    errors.push({
      field: "finishingPaint.coats",
      message: "Finishing paint coats should be between 1 and 4",
      severity: "warning",
    });
  }

  // Enamel requires preparation
  if (
    spec.finishingPaint.category === "enamel" &&
    !spec.skimming.enabled &&
    !spec.undercoat.enabled
  ) {
    errors.push({
      field: "finishingPaint",
      message:
        "Enamel paint requires preparation layer (skimming or undercoat)",
      severity: "error",
    });
  }

  // Validate subtype for category
  const subtypeMap: Record<string, string[]> = {
    emulsion: ["vinyl-matt", "vinyl-silk", "antibacterial"],
    enamel: ["eggshell", "gloss"],
  };

  if (
    !subtypeMap[spec.finishingPaint.category]?.includes(
      spec.finishingPaint.subtype,
    )
  ) {
    errors.push({
      field: "finishingPaint.subtype",
      message: `Invalid subtype "${spec.finishingPaint.subtype}" for category "${spec.finishingPaint.category}"`,
      severity: "error",
    });
  }

  return {
    valid: errors.filter((e) => e.severity === "error").length === 0,
    errors,
  };
}

/**
 * Calculate quantity required for a layer
 * Returns: { rawQuantity, roundedQuantity }
 */
function calculateLayerQuantity(
  surfaceArea: number,
  coats: number,
  coverage: number,
  unit: "bags" | "litres",
): { raw: number; rounded: number } {
  const raw = (surfaceArea / coverage) * coats;

  // Round up to purchasable units
  // For bags: always round up to whole number
  // For litres: round up to nearest 0.5 litre (common purchase size)
  const rounded = unit === "bags" ? Math.ceil(raw) : Math.ceil(raw * 2) / 2; // Round up to nearest 0.5L

  return { raw, rounded };
}

/**
 * Calculate a single layer
 */
export function calculateLayer(
  surfaceArea: number,
  layerType: "skimming" | "undercoat" | "finishing",
  config: any, // SkimmingConfig | UndercoatConfig | FinishingPaintConfig
  coverageRates: CoverageRates,
  materialPrice: number,
  wastagePercentage: number = 0.1,
): LayerCalculation | null {
  if (!config.enabled && layerType !== "finishing") {
    return null;
  }

  let material = "";
  let coats = 1;
  let coverage = 0;
  let unit: "bags" | "litres" = "litres";

  if (layerType === "skimming") {
    material = "Skimming Filler";
    coats = config.coats;
    coverage = coverageRates.skimming;
    unit = "bags";
  } else if (layerType === "undercoat") {
    material = "Undercoat / Covermat";
    coats = 1; // Fixed at 1 coat
    coverage = coverageRates.undercoat;
    unit = "litres";
  } else if (layerType === "finishing") {
    material = `${config.category} - ${config.subtype}`;
    coats = config.coats;
    coverage = coverageRates.finishPaint;
    unit = "litres";
  }

  const { raw, rounded } = calculateLayerQuantity(
    surfaceArea,
    coats,
    coverage,
    unit,
  );

  // Apply wastage to gross quantity for pricing
  const adjustedQuantity = rounded * (1 + wastagePercentage);
  const grossQuantity =
    unit === "bags"
      ? Math.ceil(adjustedQuantity)
      : Math.ceil(adjustedQuantity * 2) / 2;

  const totalCost = raw * materialPrice;
  const totalCostWithWastage = grossQuantity * materialPrice;

  return {
    layerType,
    material,
    enabled: true,
    coats,
    coverage,
    quantity: raw,
    roundedQuantity: rounded,
    grossQuantity,
    unit,
    unitRate: materialPrice,
    totalCost,
    totalCostWithWastage,
  };
}

/**
 * Calculate all layers for a painting specification
 */
export function calculatePaintingLayers(
  spec: PaintingSpecification,
  coverageRates: CoverageRates = DEFAULT_COVERAGE_RATES,
  materialPrices: {
    skimming?: number;
    undercoat?: number;
    finishing?: number;
  } = {},
  wastagePercentage: number = 0.1,
): PaintingSpecification {
  // Default prices (per unit)
  const prices = {
    skimming: materialPrices.skimming || 0, // per 25kg bag
    undercoat: materialPrices.undercoat || 0, // per litre
    finishing: materialPrices.finishing || 0, // per litre
  };

  const skimmingCalc =
    spec.skimming.enabled && spec.surfaceArea > 0
      ? calculateLayer(
          spec.surfaceArea,
          "skimming",
          spec.skimming,
          coverageRates,
          prices.skimming,
          wastagePercentage,
        )
      : null;

  const undercoatCalc =
    spec.undercoat.enabled && spec.surfaceArea > 0
      ? calculateLayer(
          spec.surfaceArea,
          "undercoat",
          spec.undercoat,
          coverageRates,
          prices.undercoat,
          wastagePercentage,
        )
      : null;

  const finishingCalc =
    spec.surfaceArea > 0
      ? calculateLayer(
          spec.surfaceArea,
          "finishing",
          spec.finishingPaint,
          coverageRates,

          prices.finishing,
          wastagePercentage,
        )
      : null;
  return {
    ...spec,
    calculations: {
      skimming: skimmingCalc,
      undercoat: undercoatCalc,
      finishing: finishingCalc,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate totals across all painting surfaces
 */
export function calculatePaintingTotals(
  specifications: PaintingSpecification[],
): PaintingTotals {
  const totals: PaintingTotals = {
    totalArea: 0,
    skimmingBags: 0,
    skimmingCost: 0,
    undercoatLitres: 0,
    undercoatCost: 0,
    finishingLitres: 0,
    finishingCost: 0,
    totalLitres: 0,
    totalBags: 0,
    totalCost: 0,
    totalCostWithWastage: 0,
  };

  specifications.forEach((spec) => {
    totals.totalArea += spec.surfaceArea;

    if (spec.calculations.skimming) {
      totals.skimmingBags += spec.calculations.skimming.roundedQuantity;
      totals.skimmingCost += spec.calculations.skimming.totalCostWithWastage;
    }

    if (spec.calculations.undercoat) {
      totals.undercoatLitres += spec.calculations.undercoat.roundedQuantity;
      totals.undercoatCost += spec.calculations.undercoat.totalCostWithWastage;
    }

    if (spec.calculations.finishing) {
      totals.finishingLitres += spec.calculations.finishing.roundedQuantity;
      totals.finishingCost += spec.calculations.finishing.totalCostWithWastage;
    }
  });

  totals.totalLitres = totals.undercoatLitres + totals.finishingLitres;
  totals.totalBags = totals.skimmingBags;
  totals.totalCost =
    totals.skimmingCost + totals.undercoatCost + totals.finishingCost;
  totals.totalCostWithWastage = totals.totalCost; // Already includes wastage in layer calc

  return totals;
}

/**
 * Get material prices from finishes prices data
 */
export function extractPaintingPrices(materialPrices: any[]): {
  skimming?: number;
  undercoat?: number;
  finishing?: number;
} {
  const prices: any = {};

  // Find paint category
  const paintCategory = materialPrices.find(
    (p: any) => p.name.toLowerCase() === "paint",
  );

  if (!paintCategory?.type?.materials) {
    return prices;
  }

  // Extract individual material prices
  Object.entries(paintCategory.type.materials).forEach(([name, price]) => {
    const lower = name.toLowerCase();
    if (lower.includes("skimming")) {
      prices.skimming = price;
    } else if (lower.includes("undercoat")) {
      prices.undercoat = price;
    } else if (lower.includes("emulsion") || lower.includes("enamel")) {
      prices.finishing = price;
    }
  });

  return prices;
}

/**
 * Migrate legacy painting data to new system (backward compatibility)
 */
export function migrateLegacyPainting(
  legacyPaintFinish: any,
  coverageRates: CoverageRates = DEFAULT_COVERAGE_RATES,
): PaintingSpecification {
  const now = new Date().toISOString();

  const spec: PaintingSpecification = {
    id: legacyPaintFinish.id || `painting-${Date.now()}`,
    surfaceArea: legacyPaintFinish.quantity || 0,
    location: legacyPaintFinish.location || "Legacy Paint Area",
    skimming: {
      enabled: false, // Legacy system doesn't have skimming
      coats: 0,
      coverage: coverageRates.skimming,
    },
    undercoat: {
      enabled: false, // Legacy system doesn't have undercoat
      coverage: coverageRates.undercoat,
    },
    finishingPaint: {
      category: legacyPaintFinish.material?.toLowerCase().includes("emulsion")
        ? "emulsion"
        : "enamel",
      subtype: "vinyl-matt", // Default subtype for legacy
      coats: 1, // Conservative default
      coverage: coverageRates.finishPaint,
    },
    calculations: {
      skimming: null,
      undercoat: null,
      finishing: null,
    },
    createdAt: now,
    updatedAt: now,
    legacyPaintingData: legacyPaintFinish,
  };

  return spec;
}
