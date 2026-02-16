// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useCallback, useEffect, useMemo } from "react";
import { FinishElement } from "@/hooks/useUniversalFinishesCalculator";

export interface InternalFinishCalculation {
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

export interface InternalFinishTotals {
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

/**
 * Get walling material unit rate from materialPrices for internal finishes
 */
function getWallingRate(finish: FinishElement, prices: any[]): number {
  if (!finish || !prices?.length) return 0;

  const wallingCategory = prices.find((p: any) =>
    p.name?.toLowerCase() === "wall-finishes"
  );

  if (!wallingCategory) return 0;

  const allMaterials = [
    ...(wallingCategory.type?.internalWallingMaterials || []),
    ...(wallingCategory.type?.tilingMaterials || []),
  ];

  let material = allMaterials.find((m: any) =>
    m.name?.toLowerCase() === finish.material.toLowerCase()
  );

  if (!material) {
    material = allMaterials.find((m: any) =>
      m.name?.toLowerCase().includes(finish.material.toLowerCase())
    );
  }

  if (!material || !Array.isArray(material.type)) return 0;

  const firstType = material.type[0];
  return firstType?.price_kes || 0;
}

export default function useInternalFinishesCalculator(
  finishes: FinishElement[],
  materialPrices: any[],
  quote: any,
) {
  const [calculations, setCalculations] = useState<InternalFinishCalculation[]>([]);
  const [totals, setTotals] = useState<InternalFinishTotals>({
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
    (finish: FinishElement): InternalFinishCalculation => {
      const wastagePercentage = getWastagePercentage();
      const unitRate = getWallingRate(finish, materialPrices);

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

  const calculateAll = useCallback(() => {
    const calculated = finishes.map(calculateFinish);
    setCalculations(calculated);

    const wastagePercentage = getWastagePercentage();

    const newTotals = calculated.reduce(
      (acc, curr) => ({
        totalArea: acc.totalArea + (curr.unit === "m²" || curr.unit === "m" ? curr.quantity : 0),
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

  return {
    calculations,
    totals,
    calculateAll,
    wastagePercentage: getWastagePercentage(),
  };
}
