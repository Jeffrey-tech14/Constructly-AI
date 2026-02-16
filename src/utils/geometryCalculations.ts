// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

/**
 * Geometry calculation utilities for consolidated quote estimation
 * Used by Phase 8 reactive calculation engine
 */

/**
 * Calculate internal wall surface area
 * Internal walls appear on both sides of the footprint
 * Area = internal_perimeter × height × 2
 */
export function calculateInternalWallArea(
  internalPerimeterM: number,
  internalHeightM: number
): number {
  if (internalPerimeterM <= 0 || internalHeightM <= 0) return 0;
  return internalPerimeterM * internalHeightM * 2;
}

/**
 * Calculate external wall surface area
 * External walls form the outer perimeter
 * Area = external_perimeter × height
 */
export function calculateExternalWallArea(
  externalPerimeterM: number,
  externalHeightM: number
): number {
  if (externalPerimeterM <= 0 || externalHeightM <= 0) return 0;
  return externalPerimeterM * externalHeightM;
}

/**
 * Extract slab footprint area from concrete_rows array
 * Looks for ground slab first, falls back to first slab
 */
export function extractSlabFootprintArea(
  concreteRows: Array<{ element?: string; name?: string; slabArea?: number }>
): number {
  if (!concreteRows || concreteRows.length === 0) return 0;

  // Try to find ground slab by name
  const groundSlab = concreteRows.find(
    (row) =>
      row.element === "slab" && row.name?.toLowerCase().includes("ground")
  );

  if (groundSlab?.slabArea) return groundSlab.slabArea;

  // Fall back to first slab
  const firstSlab = concreteRows.find((row) => row.element === "slab");
  return firstSlab?.slabArea || 0;
}

/**
 * Copy wall dimensions from wallDimensions object to geometry
 * Handles mapping from source structure to geometry structure
 */
export function mapWallDimensionsToGeometry(
  wallDimensions: any
): {
  externalWallPerimeterM: number;
  internalWallPerimeterM: number;
  externalWallHeightM: number;
  internalWallHeightM: number;
  buildingLengthM: number;
  buildingWidthM: number;
} {
  return {
    externalWallPerimeterM: wallDimensions?.externalWallPerimiter || 0,
    internalWallPerimeterM: wallDimensions?.internalWallPerimiter || 0,
    externalWallHeightM: wallDimensions?.externalWallHeight || 0,
    internalWallHeightM: wallDimensions?.internalWallHeight || 0,
    buildingLengthM: wallDimensions?.length || 0,
    buildingWidthM: wallDimensions?.width || 0,
  };
}

/**
 * Calculate flooring areas based on wall dimensions and slab
 * Internal flooring = slab footprint area
 * External flooring = area outside internal dimensions
 */
export function calculateFlooringAreas(
  slabFootprintM2: number,
  externalPerimeterM: number,
  externalHeightM: number
): {
  internalFlooringAreaM2: number;
  externalFlooringAreaM2: number;
} {
  // Internal flooring = slab footprint
  const internalArea = slabFootprintM2;

  // External flooring (verandah/patio) calculation
  // Rough estimate: 10% of building perimeter × default patio depth (1.5m typically)
  const externalArea = externalPerimeterM > 0 ? externalPerimeterM * 1.5 : 0;

  return {
    internalFlooringAreaM2: internalArea,
    externalFlooringAreaM2: externalArea,
  };
}

/**
 * Sync roofing area and perimeter from slab geometry
 * Roofing area = slab footprint area
 * Roofing perimeter = external wall perimeter
 */
export function syncRoofingFromSlab(
  slabFootprintM2: number,
  externalPerimeterM: number
): {
  roofingAreaM2: number;
  roofingPerimeterM: number;
  roofingSyncedFromSlab: boolean;
} {
  return {
    roofingAreaM2: slabFootprintM2,
    roofingPerimeterM: externalPerimeterM,
    roofingSyncedFromSlab: slabFootprintM2 > 0 && externalPerimeterM > 0,
  };
}

/**
 * Validate geometry values for consistency
 * Returns errors array if any issues found
 */
export function validateGeometry(geometry: any): string[] {
  const errors: string[] = [];

  if (geometry.externalWallPerimeterM < 0)
    errors.push("External wall perimeter cannot be negative");
  if (geometry.internalWallPerimeterM < 0)
    errors.push("Internal wall perimeter cannot be negative");
  if (geometry.externalWallHeightM < 0)
    errors.push("External wall height cannot be negative");
  if (geometry.internalWallHeightM < 0)
    errors.push("Internal wall height cannot be negative");

  if (
    geometry.externalWallPerimeterM === 0 &&
    geometry.internalWallPerimeterM === 0
  ) {
    errors.push("At least one wall dimension must be set");
  }

  return errors;
}
