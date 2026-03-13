// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

/**
 * Consolidated geometry fields for quote estimation
 * Aggregates all geometric calculations from Phases 2-7
 */
export interface QuoteGeometry {
  // Wall dimensions (base inputs from wallDimensions object)
  externalWallPerimeterM: number;
  internalWallPerimeterM: number;
  externalWallHeightM: number;
  internalWallHeightM: number;
  buildingLengthM: number;
  buildingWidthM: number;

  // Slab/Foundation geometry
  slabFootprintAreaM2: number;
  externalSlabPerimeterM: number;

  // Calculated wall areas
  internalWallAreaM2: number; // IL × height × 2 (both sides)
  externalWallAreaM2: number; // EL × height

  // Foundation details
  foundationWallingAreaM2: number;

  // Roofing geometry
  roofingAreaM2: number;
  roofingPerimeterM: number;
  roofingSyncedFromSlab: boolean; // Flag indicating roofing synced from slab

  // Flooring areas (derived)
  internalFlooringAreaM2: number;
  externalFlooringAreaM2: number;

  // Timestamp for last update
  lastUpdated?: number;
}

/**
 * Default/empty geometry state
 */
export const DEFAULT_GEOMETRY: QuoteGeometry = {
  externalWallPerimeterM: 0,
  internalWallPerimeterM: 0,
  externalWallHeightM: 0,
  internalWallHeightM: 0,
  buildingLengthM: 0,
  buildingWidthM: 0,
  slabFootprintAreaM2: 0,
  externalSlabPerimeterM: 0,
  internalWallAreaM2: 0,
  externalWallAreaM2: 0,
  foundationWallingAreaM2: 0,
  roofingAreaM2: 0,
  roofingPerimeterM: 0,
  roofingSyncedFromSlab: false,
  internalFlooringAreaM2: 0,
  externalFlooringAreaM2: 0,
};

/**
 * Geometry update payload for partial updates
 */
export type QuoteGeometryUpdate = Partial<QuoteGeometry>;
