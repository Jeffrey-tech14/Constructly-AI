// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useCallback, useEffect, useMemo } from "react";
import { FinishElement } from "@/hooks/useUniversalFinishesCalculator";

export interface FlooringCalculation {
  id: string;
  material: string;
  quantity: number;
  adjustedQuantity: number;
  unit: string;
  unitRate: number;
  materialCost: number;
  materialCostWithWastage: number;
  totalCost: number;
  totalCostWithWastage: number;
  wastage: {
    percentage: number;
    wastageQuantity: number;
    totalWastageCost: number;
  };
}

export interface FlooringTotals {
  totalArea: number;
  totalQuantity: number;
  totalAdjustedQuantity: number;
  totalMaterialCost: number;
  totalMaterialCostWithWastage: number;
  totalCost: number;
  totalCostWithWastage: number;
  wastage: {
    percentage: number;
    totalWastageQuantity: number;
    totalWastageCost: number;
  };
}

// PHASE 2: Skirting Calculation Types
export interface SkirtingConfig {
  enabled: boolean;
  type: "tile-skirting" | "hardwood-skirting" | null;
  height: number; // mm
}

export interface TileSkirtingCalculation {
  skirtingLength: number;        // Linear meters
  skirtingArea: number;          // m²
  tileSize: { width: number; height: number }; // 400×400mm
  piecesPerTile: number;         // 4
  totalPiecesNeeded: number;
  tilesRequired: number;         // Rounded up
  pricePerTile: number;
  totalCost: number;
  wastagePercentage: number;
}

/**
 * Get floor finish unit rate from materialPrices
 * Searches in flooring > flooringMaterials array
 */
function getFlooringRate(finish: FinishElement, prices: any[]): number {
  if (!finish || !prices?.length) return 0;

  // Find the Flooring category in materialPrices
  const flooringCategory = prices.find((p: any) =>
    p.name?.toLowerCase() === "flooring"
  );
  
  if (!flooringCategory) return 0;

  // Get flooring materials array
  const flooringMaterials = flooringCategory.type?.flooringMaterials;
  if (!Array.isArray(flooringMaterials)) return 0;

  // Find material by name
  let material = flooringMaterials.find((m: any) =>
    m.name?.toLowerCase() === finish.material.toLowerCase()
  );

  // If not found, try partial match
  if (!material) {
    material = flooringMaterials.find((m: any) =>
      m.name?.toLowerCase().includes(finish.material.toLowerCase())
    );
  }

  if (!material || !Array.isArray(material.type)) return 0;

  const firstType = material.type[0];
  return firstType?.price_kes || 0;
}

// ===== PHASE 2: Skirting Calculation Functions =====

/**
 * Calculate skirting length from external perimeter and internal wall length
 * Formula: Skirting Length = EL + (2 × IL)
 * @param externalPerimeter External wall perimeter (m)
 * @param internalWallLength Total internal wall length (m)
 * @returns Skirting length in meters
 */
export function calculateSkirtingLength(
  externalPerimeter: number,
  internalWallLength: number
): number {
  return externalPerimeter + 2 * internalWallLength;
}

/**
 * Calculate skirting area from length and height
 * @param skirtingLength Length in meters
 * @param skirtingHeight Height in meters (default 0.1m = 100mm)
 * @returns Area in m²
 */
export function calculateSkirtingArea(
  skirtingLength: number,
  skirtingHeight: number = 0.1
): number {
  return skirtingLength * skirtingHeight;
}

/**
 * Get skirting configuration based on floor type
 * Rule: Niro disables skirting automatically
 */
export function getSkirtingConfig(floorType: string): SkirtingConfig {
  const config: Record<string, SkirtingConfig> = {
    "tile": { enabled: true, type: "tile-skirting", height: 100 },
    "ceramic tiles": { enabled: true, type: "tile-skirting", height: 100 },
    "granite tiles": { enabled: true, type: "tile-skirting", height: 100 },
    "granite": { enabled: true, type: "tile-skirting", height: 100 },
    "hardwood wooden panels": { enabled: true, type: "hardwood-skirting", height: 100 },
    "pvc vinyl flooring": { enabled: true, type: "tile-skirting", height: 100 },
    "pvc": { enabled: true, type: "tile-skirting", height: 100 },
    "epoxy flooring": { enabled: true, type: "tile-skirting", height: 100 },
    "epoxy": { enabled: true, type: "tile-skirting", height: 100 },
    "terrazzo": { enabled: true, type: "tile-skirting", height: 100 },
    "spc flooring": { enabled: true, type: "tile-skirting", height: 100 },
  };

  const normalized = floorType.toLowerCase().trim();
  return config[normalized] || { enabled: false, type: "tile-skirting", height: 0 };
}

/**
 * Determine if cement/adhesive/grout should be included in flooring
 * Rule: Only for tile floors
 */
export function shouldIncludeCementAdhesive(floorType: string): {
  cement: boolean;
  adhesive: boolean;
  grout: boolean;
} {
  const normalized = floorType.toLowerCase().trim();
  const isTile = ["tile", "ceramic tiles", "granite tiles", "granite"].includes(
    normalized
  );

  return {
    cement: isTile,
    adhesive: isTile,
    grout: isTile,
  };
}

/**
 * Calculate tile skirting requirements
 * Rule: Each 400×400mm tile produces 4 pieces of 100mm skirting
 * Pricing is per full tile, NOT per piece
 */
export function calculateTileSkirtingRequired(
  skirtingLength: number,
  tileSize: { width: number; height: number } = { width: 400, height: 400 },
  piecesPerTile: number = 4
): Omit<TileSkirtingCalculation, "pricePerTile" | "totalCost" | "wastagePercentage"> {
  // Convert length to mm
  const lengthMm = skirtingLength * 1000;

  // Pieces needed (each piece is tileSize.width mm long = 400mm)
  const piecesNeeded = Math.ceil(lengthMm / tileSize.width);

  // Full tiles needed (round up)
  const tilesRequired = Math.ceil(piecesNeeded / piecesPerTile);

  return {
    skirtingLength,
    skirtingArea: calculateSkirtingArea(skirtingLength),
    tileSize,
    piecesPerTile,
    totalPiecesNeeded: piecesNeeded,
    tilesRequired,
  };
}

/**
 * Get skirting tile price from material prices
 */
function getSkirtingTilePrice(prices: any[]): number {
  if (!Array.isArray(prices)) return 0;

  const flooringCategory = prices.find((p: any) =>
    p.name?.toLowerCase() === "flooring"
  );

  if (!flooringCategory) return 0;

  // Look for skirting accessories
  const accessories = flooringCategory.type?.skirtingAccessories;
  if (!Array.isArray(accessories)) return 0;

  // Find "Skirting tiles" or similar
  const skirtingMaterial = accessories.find(
    (m: any) =>
      m.name?.toLowerCase().includes("skirting") ||
      m.name?.toLowerCase().includes("tile skirting")
  );

  if (!skirtingMaterial || !Array.isArray(skirtingMaterial.type))
    return 0;

  const firstType = skirtingMaterial.type[0];
  return firstType?.price_kes || 0;
}

export default function useFlooringCalculator(
  finishes: FinishElement[],
  materialPrices: any[],
  quote: any,
  onFinishesUpdate: any,
) {
  const [calculations, setCalculations] = useState<FlooringCalculation[]>([]);
  const [totals, setTotals] = useState<FlooringTotals>({
    totalArea: 0,
    totalQuantity: 0,
    totalAdjustedQuantity: 0,
    totalMaterialCost: 0,
    totalMaterialCostWithWastage: 0,
    totalCost: 0,
    totalCostWithWastage: 0,
    wastage: {
      percentage: 0,
      totalWastageQuantity: 0,
      totalWastageCost: 0,
    },
  });

  // PHASE 2: Skirting state
  const [skirtingCalculation, setSkirtingCalculation] = useState<TileSkirtingCalculation | null>(null);

  // Get wastage percentage from quote settings with fallback
  const getWastagePercentage = useCallback((): number => {
    const wastageSetting = quote?.qsSettings?.wastageFinishes;

    if (typeof wastageSetting === "number") {
      return wastageSetting / 100;
    }

    if (typeof wastageSetting === "string") {
      const parsed = parseFloat(wastageSetting);
      return isNaN(parsed) ? 0.1 : parsed / 100;
    }

    return 0.1; // Default to 10% wastage
  }, [quote]);

  // Apply wastage to quantity and round up
  const applyWastageToQuantity = useCallback(
    (quantity: number, wastagePercentage: number): number => {
      const adjustedQuantity = quantity * (1 + wastagePercentage);
      return Math.ceil(adjustedQuantity * 100) / 100; // Round to 2 decimal places
    },
    [],
  );

  const calculateFinish = useCallback(
    (finish: FinishElement): FlooringCalculation => {
      const wastagePercentage = getWastagePercentage();
      const unitRate = getFlooringRate(finish, materialPrices);

      // Apply wastage to quantity
      const adjustedQuantity = applyWastageToQuantity(
        finish.quantity,
        wastagePercentage,
      );
      const wastageQuantity = adjustedQuantity - finish.quantity;

      // Calculate costs
      const materialCost = finish.quantity * unitRate;
      const materialCostWithWastage = adjustedQuantity * unitRate;
      const totalWastageCost = wastageQuantity * unitRate;

      const totalCost = materialCost;
      const totalCostWithWastage = materialCostWithWastage;

      return {
        id: finish.id,
        material: finish.material,
        quantity: finish.quantity,
        adjustedQuantity,
        unit: finish.unit,
        unitRate,
        materialCost,
        materialCostWithWastage,
        totalCost,
        totalCostWithWastage,
        wastage: {
          percentage: wastagePercentage,
          wastageQuantity,
          totalWastageCost,
        },
      };
    },
    [materialPrices, getWastagePercentage, applyWastageToQuantity],
  );

  // PHASE 2: Calculate skirting based on floor type and wall dimensions
  const calculateSkirting = useCallback(() => {
    // Get floor type from first floor finish or from quote
    const floorType = finishes.find(f => f.category === "flooring")?.material || "tile";
    const config = getSkirtingConfig(floorType);

    // If skirting disabled (e.g., Niro), return null
    if (!config.enabled) {
      setSkirtingCalculation(null);
      return;
    }

    // Get wall dimensions
    const externalPerimeter = quote?.wallDimensions?.externalWallPerimiter || 0;
    const internalWallLength = quote?.wallDimensions?.internalWallPerimiter || 0;

    if (externalPerimeter === 0 && internalWallLength === 0) {
      setSkirtingCalculation(null);
      return;
    }

    // Calculate skirting length: EL + (2 × IL)
    const length = calculateSkirtingLength(externalPerimeter, internalWallLength);

    // For tile skirting, calculate required tiles
    if (config.type === "tile-skirting") {
      const tileCalc = calculateTileSkirtingRequired(length);
      const pricePerTile = getSkirtingTilePrice(materialPrices);
      const wastagePercentage = getWastagePercentage();
      const tilesWithWastage = Math.ceil(tileCalc.tilesRequired * (1 + wastagePercentage));

      setSkirtingCalculation({
        ...tileCalc,
        pricePerTile,
        totalCost: tilesWithWastage * pricePerTile,
        wastagePercentage,
      });
    } else if (config.type === "hardwood-skirting") {
      // Hardwood skirting: priced by linear meter
      const pricePerMeter = getFlooringRate(
        { material: "Hardwood skirting", quantity: length, unit: "m" } as FinishElement,
        materialPrices
      );
      
      setSkirtingCalculation({
        skirtingLength: length,
        skirtingArea: calculateSkirtingArea(length),
        tileSize: { width: 0, height: 0 },
        piecesPerTile: 0,
        totalPiecesNeeded: 0,
        tilesRequired: 0,
        pricePerTile: pricePerMeter,
        totalCost: length * pricePerMeter,
        wastagePercentage: getWastagePercentage(),
      });
    }
  }, [finishes, quote, materialPrices, getWastagePercentage]);

  const calculateAll = useCallback(() => {
    const calculated = finishes.map(calculateFinish);
    setCalculations(calculated);

    const wastagePercentage = getWastagePercentage();

    const newTotals = calculated.reduce(
      (acc, curr) => ({
        totalArea: acc.totalArea + (curr.unit === "m²" ? curr.quantity : 0),
        totalQuantity: acc.totalQuantity + curr.quantity,
        totalAdjustedQuantity:
          acc.totalAdjustedQuantity + curr.adjustedQuantity,
        totalMaterialCost: acc.totalMaterialCost + curr.materialCost,
        totalMaterialCostWithWastage:
          acc.totalMaterialCostWithWastage + curr.materialCostWithWastage,
        totalCost: acc.totalCost + curr.totalCost,
        totalCostWithWastage:
          acc.totalCostWithWastage + curr.totalCostWithWastage,
        wastage: {
          percentage: wastagePercentage,
          totalWastageQuantity:
            acc.wastage.totalWastageQuantity + curr.wastage.wastageQuantity,
          totalWastageCost:
            acc.wastage.totalWastageCost + curr.wastage.totalWastageCost,
        },
      }),
      {
        totalArea: 0,
        totalQuantity: 0,
        totalAdjustedQuantity: 0,
        totalMaterialCost: 0,
        totalMaterialCostWithWastage: 0,
        totalCost: 0,
        totalCostWithWastage: 0,
        wastage: {
          percentage: wastagePercentage,
          totalWastageQuantity: 0,
          totalWastageCost: 0,
        },
      },
    );

    setTotals(newTotals);
  }, [finishes, calculateFinish, getWastagePercentage]);

  useEffect(() => {
    if (finishes?.length > 0) {
      calculateAll();
    } else {
      // Reset to empty when no finishes
      setCalculations([]);
      setTotals({
        totalArea: 0,
        totalQuantity: 0,
        totalAdjustedQuantity: 0,
        totalMaterialCost: 0,
        totalMaterialCostWithWastage: 0,
        totalCost: 0,
        totalCostWithWastage: 0,
        wastage: {
          percentage: getWastagePercentage(),
          totalWastageQuantity: 0,
          totalWastageCost: 0,
        },
      });
    }
  }, [finishes, calculateAll, getWastagePercentage]);

  // PHASE 2: Calculate skirting when floor type or wall dimensions change
  useEffect(() => {
    calculateSkirting();
  }, [calculateSkirting, quote?.wallDimensions, finishes]);

  const combined = useMemo(() => ({ ...totals, calculations, skirting: skirtingCalculation }), [totals, calculations, skirtingCalculation]);
onFinishesUpdate && onFinishesUpdate(combined);
  return {
    calculations,
    totals,
    calculateAll,
    wastagePercentage: getWastagePercentage(),
    skirting: skirtingCalculation,
    skirtingConfig: finishes.length > 0 ? getSkirtingConfig(finishes[0]?.material || "tile") : null,
  };
}
