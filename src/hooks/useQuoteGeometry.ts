// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useMemo } from "react";
import { QuoteGeometry, DEFAULT_GEOMETRY } from "@/types/geometry";

/**
 * Custom hook to access consolidated geometry from quote
 * Provides convenient selectors for geometry values used by phase components
 *
 * Usage:
 * const geometry = useQuoteGeometry(quote);
 * const { internalWallArea, externalWallArea, roofingArea } = geometry;
 */
export function useQuoteGeometry(quoteOrGeometry: any) {
  return useMemo<QuoteGeometry>(() => {
    // Handle both full quote object and geometry object
    const geometry =
      quoteOrGeometry?.geometry || quoteOrGeometry || DEFAULT_GEOMETRY;

    return {
      externalWallPerimeterM: geometry.externalWallPerimeterM || 0,
      internalWallPerimeterM: geometry.internalWallPerimeterM || 0,
      externalWallHeightM: geometry.externalWallHeightM || 0,
      internalWallHeightM: geometry.internalWallHeightM || 0,
      buildingLengthM: geometry.buildingLengthM || 0,
      buildingWidthM: geometry.buildingWidthM || 0,
      slabFootprintAreaM2: geometry.slabFootprintAreaM2 || 0,
      externalSlabPerimeterM: geometry.externalSlabPerimeterM || 0,
      internalWallAreaM2: geometry.internalWallAreaM2 || 0,
      externalWallAreaM2: geometry.externalWallAreaM2 || 0,
      foundationWallingAreaM2: geometry.foundationWallingAreaM2 || 0,
      roofingAreaM2: geometry.roofingAreaM2 || 0,
      roofingPerimeterM: geometry.roofingPerimeterM || 0,
      roofingSyncedFromSlab: geometry.roofingSyncedFromSlab || false,
      internalFlooringAreaM2: geometry.internalFlooringAreaM2 || 0,
      externalFlooringAreaM2: geometry.externalFlooringAreaM2 || 0,
      lastUpdated: geometry.lastUpdated,
    };
  }, [quoteOrGeometry]);
}

/**
 * Get simplified geometry selectors for common use cases
 */
export function useQuoteGeometrySelectors(quoteOrGeometry: any) {
  const geometry = useQuoteGeometry(quoteOrGeometry);

  return useMemo(
    () => ({
      // Wall areas
      internalWallAreaM2: geometry.internalWallAreaM2,
      externalWallAreaM2: geometry.externalWallAreaM2,

      // Flooring areas
      internalFlooringAreaM2: geometry.internalFlooringAreaM2,
      externalFlooringAreaM2: geometry.externalFlooringAreaM2,

      // Roofing
      roofingAreaM2: geometry.roofingAreaM2,
      roofingPerimeterM: geometry.roofingPerimeterM,
      roofingSyncedFromSlab: geometry.roofingSyncedFromSlab,

      // Foundation
      foundationWallingAreaM2: geometry.foundationWallingAreaM2,
      slabFootprintAreaM2: geometry.slabFootprintAreaM2,

      // Raw dimensions
      externalWallPerimeterM: geometry.externalWallPerimeterM,
      internalWallPerimeterM: geometry.internalWallPerimeterM,
      externalWallHeightM: geometry.externalWallHeightM,
      internalWallHeightM: geometry.internalWallHeightM,
    }),
    [geometry]
  );
}

/**
 * Check if geometry has valid data for calculations
 */
export function useIsGeometryValid(quoteOrGeometry: any): boolean {
  const geometry = useQuoteGeometry(quoteOrGeometry);

  return useMemo(() => {
    return (
      geometry.externalWallPerimeterM > 0 ||
      geometry.internalWallPerimeterM > 0 ||
      geometry.slabFootprintAreaM2 > 0
    );
  }, [
    geometry.externalWallPerimeterM,
    geometry.internalWallPerimeterM,
    geometry.slabFootprintAreaM2,
  ]);
}
