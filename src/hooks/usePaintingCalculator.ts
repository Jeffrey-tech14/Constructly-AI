// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

/**
 * React hook for managing multi-layer painting specifications
 * Handles calculations, validation, and persistence
 */

import { useState, useCallback, useEffect } from "react";
import {
  PaintingSpecification,
  PaintingTotals,
  DEFAULT_PAINTING_CONFIG,
  DEFAULT_COVERAGE_RATES,
} from "@/types/painting";
import {
  calculatePaintingLayers,
  calculatePaintingTotals,
  extractPaintingPrices,
} from "@/utils/paintingCalculations";

export interface UsePaintingCalculatorProps {
  initialPaintings?: PaintingSpecification[];
  materialPrices?: any[];
  quote?: any;
  onPaintingsChange?: (paintings: PaintingSpecification[]) => void;
  location?: "Interior Walls" | "Exterior Walls";
  surfaceArea?: number;
  autoInitialize?: boolean;
}

/**
 * Get finishes wastage percentage from quote settings
 */
function getFinishesWastagePercentage(quote: any): number {
  const wastageSetting = quote?.qsSettings?.wastageFinishes;

  if (typeof wastageSetting === "number") {
    return wastageSetting / 100;
  }

  if (typeof wastageSetting === "string") {
    const parsed = parseFloat(wastageSetting);
    return isNaN(parsed) ? 0.1 : parsed / 100;
  }

  return 0.1;
}

/**
 * Create a default painting specification from internal walls
 * Returns null if internal wall dimensions are missing or invalid
 */
export function createDefaultPaintingFromInternalWalls(
  wallDimensions: any,
): PaintingSpecification | null {
  if (
    !wallDimensions ||
    !wallDimensions.internalWallPerimiter ||
    !wallDimensions.internalWallHeight
  ) {
    return null;
  }

  const internalPerimeter =
    parseFloat(wallDimensions.internalWallPerimiter) || 0;
  const internalHeight = parseFloat(wallDimensions.internalWallHeight) || 0;

  if (internalPerimeter <= 0 || internalHeight <= 0) {
    return null;
  }

  // Calculate surface area: perimeter × height
  const surfaceArea = internalPerimeter * internalHeight * 2;

  const defaultPainting: PaintingSpecification = {
    id: `painting-internal-walls-${Date.now()}`,
    surfaceArea,
    location: "Internal Walls",
    skimming: {
      enabled: DEFAULT_PAINTING_CONFIG.skimming.enabled,
      coats: DEFAULT_PAINTING_CONFIG.skimming.coats,
      coverage: DEFAULT_COVERAGE_RATES.skimming,
    },
    undercoat: {
      enabled: DEFAULT_PAINTING_CONFIG.undercoat.enabled,
      coverage: DEFAULT_COVERAGE_RATES.undercoat,
    },
    finishingPaint: {
      category: DEFAULT_PAINTING_CONFIG.finishingPaint.category,
      subtype: DEFAULT_PAINTING_CONFIG.finishingPaint.subtype,
      coats: DEFAULT_PAINTING_CONFIG.finishingPaint.coats,
      coverage: DEFAULT_COVERAGE_RATES.finishPaint,
    },
    calculations: {
      skimming: null,
      undercoat: null,
      finishing: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return defaultPainting;
}

export default function usePaintingCalculator({
  initialPaintings = [],
  materialPrices = [],
  quote,
  onPaintingsChange,
  location,
  surfaceArea,
  autoInitialize = true,
}: UsePaintingCalculatorProps) {
  const [paintings, setPaintings] =
    useState<PaintingSpecification[]>(initialPaintings);
  const [totals, setTotals] = useState<PaintingTotals>({
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
  });

  const paintingPrices = extractPaintingPrices(materialPrices);
  const finishesWastage = getFinishesWastagePercentage(quote);

  // Calculate and update all paintings (no onPaintingsChange in deps to avoid circular updates)
  const calculateAll = useCallback(() => {
    const calculated = paintings.map((painting) =>
      calculatePaintingLayers(
        painting,
        DEFAULT_COVERAGE_RATES,
        paintingPrices,
        finishesWastage,
      ),
    );

    setPaintings(calculated);
    const newTotals = calculatePaintingTotals(calculated);
    setTotals(newTotals);

    return { paintings: calculated, totals: newTotals };
  }, [paintings, paintingPrices, finishesWastage]);

  // Auto-recalculate when material prices or wastage change
  useEffect(() => {
    if (paintings.length > 0) {
      const calculated = paintings.map((painting) =>
        calculatePaintingLayers(
          painting,
          DEFAULT_COVERAGE_RATES,
          paintingPrices,
          finishesWastage,
        ),
      );
      setPaintings(calculated);
      const newTotals = calculatePaintingTotals(calculated);
      setTotals(newTotals);
    }
  }, [paintingPrices, finishesWastage]);

  // Sync paintings to parent via callback (separate from calculations)
  useEffect(() => {
    if (onPaintingsChange && paintings.length > 0) {
      onPaintingsChange(paintings);
    }
  }, [paintings, onPaintingsChange]);

  // Auto-initialize painting when location and surfaceArea are provided
  useEffect(() => {
    if (
      autoInitialize &&
      location &&
      surfaceArea &&
      surfaceArea > 0 &&
      paintings.length === 0
    ) {
      const newPainting: PaintingSpecification = {
        id: `painting-${location.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        surfaceArea,
        location,
        skimming: {
          enabled: DEFAULT_PAINTING_CONFIG.skimming.enabled,
          coats: DEFAULT_PAINTING_CONFIG.skimming.coats,
          coverage: DEFAULT_COVERAGE_RATES.skimming,
        },
        undercoat: {
          enabled: DEFAULT_PAINTING_CONFIG.undercoat.enabled,
          coverage: DEFAULT_COVERAGE_RATES.undercoat,
        },
        finishingPaint: {
          category: DEFAULT_PAINTING_CONFIG.finishingPaint.category,
          subtype: DEFAULT_PAINTING_CONFIG.finishingPaint.subtype,
          coats: DEFAULT_PAINTING_CONFIG.finishingPaint.coats,
          coverage: DEFAULT_COVERAGE_RATES.finishPaint,
        },
        calculations: {
          skimming: null,
          undercoat: null,
          finishing: null,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const calculated = calculatePaintingLayers(
        newPainting,
        DEFAULT_COVERAGE_RATES,
        paintingPrices,
        finishesWastage,
      );

      setPaintings([calculated]);
      const newTotals = calculatePaintingTotals([calculated]);
      setTotals(newTotals);

      if (onPaintingsChange) {
        onPaintingsChange([calculated]);
      }
    }
  }, [location, surfaceArea, autoInitialize, paintings.length, paintingPrices, finishesWastage, onPaintingsChange]);

  /**
   * Create a new painting specification
   */
  const addPainting = useCallback(
    (surfaceArea: number, location?: string): PaintingSpecification => {
      const newPainting: PaintingSpecification = {
        id: `painting-${Date.now()}`,
        surfaceArea,
        location,
        skimming: {
          enabled: DEFAULT_PAINTING_CONFIG.skimming.enabled,
          coats: DEFAULT_PAINTING_CONFIG.skimming.coats,
          coverage: DEFAULT_COVERAGE_RATES.skimming,
        },
        undercoat: {
          enabled: DEFAULT_PAINTING_CONFIG.undercoat.enabled,
          coverage: DEFAULT_COVERAGE_RATES.undercoat,
        },
        finishingPaint: {
          category: DEFAULT_PAINTING_CONFIG.finishingPaint.category,
          subtype: DEFAULT_PAINTING_CONFIG.finishingPaint.subtype,
          coats: DEFAULT_PAINTING_CONFIG.finishingPaint.coats,
          coverage: DEFAULT_COVERAGE_RATES.finishPaint,
        },
        calculations: {
          skimming: null,
          undercoat: null,
          finishing: null,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const calculated = calculatePaintingLayers(
        newPainting,
        DEFAULT_COVERAGE_RATES,
        paintingPrices,
        finishesWastage,
      );

      const updated = [...paintings, calculated];
      setPaintings(updated);

      if (onPaintingsChange) {
        onPaintingsChange(updated);
      }

      return calculated;
    },
    [paintings, paintingPrices, finishesWastage, onPaintingsChange],
  );

  /**
   * Create multiple painting specifications at once
   */
  const addMultiplePaintings = useCallback(
    (paintingsToAdd: Array<{ surfaceArea: number; location?: string }>) => {
      const newPaintings = paintingsToAdd.map((config) => {
        const newPainting: PaintingSpecification = {
          id: `painting-${Date.now()}-${Math.random()}`,
          surfaceArea: config.surfaceArea,
          location: config.location,
          skimming: {
            enabled: DEFAULT_PAINTING_CONFIG.skimming.enabled,
            coats: DEFAULT_PAINTING_CONFIG.skimming.coats,
            coverage: DEFAULT_COVERAGE_RATES.skimming,
          },
          undercoat: {
            enabled: DEFAULT_PAINTING_CONFIG.undercoat.enabled,
            coverage: DEFAULT_COVERAGE_RATES.undercoat,
          },
          finishingPaint: {
            category: DEFAULT_PAINTING_CONFIG.finishingPaint.category,
            subtype: DEFAULT_PAINTING_CONFIG.finishingPaint.subtype,
            coats: DEFAULT_PAINTING_CONFIG.finishingPaint.coats,
            coverage: DEFAULT_COVERAGE_RATES.finishPaint,
          },
          calculations: {
            skimming: null,
            undercoat: null,
            finishing: null,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return calculatePaintingLayers(
          newPainting,
          DEFAULT_COVERAGE_RATES,
          paintingPrices,
          finishesWastage,
        );
      });

      const updated = [...paintings, ...newPaintings];
      setPaintings(updated);
      const newTotals = calculatePaintingTotals(updated);
      setTotals(newTotals);

      if (onPaintingsChange) {
        onPaintingsChange(updated);
      }

      return newPaintings;
    },
    [paintings, paintingPrices, finishesWastage, onPaintingsChange],
  );

  /**
   * Update a painting specification
   */
  const updatePainting = useCallback(
    (id: string, updates: Partial<PaintingSpecification>) => {
      const updated = paintings.map((p) => {
        if (p.id !== id) return p;

        const merged: PaintingSpecification = {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        return calculatePaintingLayers(
          merged,
          DEFAULT_COVERAGE_RATES,
          paintingPrices,
          finishesWastage,
        );
      });

      setPaintings(updated);
      const newTotals = calculatePaintingTotals(updated);
      setTotals(newTotals);

      if (onPaintingsChange) {
        onPaintingsChange(updated);
      }
    },
    [paintings, paintingPrices, finishesWastage, onPaintingsChange],
  );

  /**
   * Delete a painting specification
   */
  const deletePainting = useCallback(
    (id: string) => {
      const updated = paintings.filter((p) => p.id !== id);
      setPaintings(updated);
      const newTotals = calculatePaintingTotals(updated);
      setTotals(newTotals);

      if (onPaintingsChange) {
        onPaintingsChange(updated);
      }
    },
    [paintings, onPaintingsChange],
  );

  /**
   * Update skimming configuration
   */
  const updateSkimming = useCallback(
    (id: string, enabled: boolean, coats: number) => {
      updatePainting(id, {
        skimming: { enabled, coats, coverage: DEFAULT_COVERAGE_RATES.skimming },
      });
    },
    [updatePainting],
  );

  /**
   * Update undercoat configuration
   */
  const updateUndercoat = useCallback(
    (id: string, enabled: boolean) => {
      updatePainting(id, {
        undercoat: { enabled, coverage: DEFAULT_COVERAGE_RATES.undercoat },
      });
    },
    [updatePainting],
  );

  /**
   * Update finishing paint configuration
   */
  const updateFinishingPaint = useCallback(
    (id: string, category: string, subtype: string, coats: number) => {
      updatePainting(id, {
        finishingPaint: {
          category: category as any,
          subtype: subtype as any,
          coats,
          coverage: DEFAULT_COVERAGE_RATES.finishPaint,
        },
      });
    },
    [updatePainting],
  );

  /**
   * Get a single painting by ID
   */
  const getPainting = useCallback(
    (id: string): PaintingSpecification | undefined => {
      return paintings.find((p) => p.id === id);
    },
    [paintings],
  );

  return {
    paintings,
    totals,
    addPainting,
    addMultiplePaintings,
    updatePainting,
    updateSkimming,
    updateUndercoat,
    updateFinishingPaint,
    deletePainting,
    calculateAll,
    getPainting,
  };
}
