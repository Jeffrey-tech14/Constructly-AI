// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface DoorWindowPaint {
  id: string;
  surfaceType: "wood" | "steel"; // Wood or Steel
  paintType: "gloss" | "matt"; // Gloss or Matt
  area: number; // m²
  coverage: number; // m²/litre (default 11)
  unitPrice: number; // Price per litre
  totalCost: number;
}

interface Props {
  paints?: DoorWindowPaint[];
  onPaintsUpdate?: (paints: DoorWindowPaint[]) => void;
  materialPrices?: any[];
  readonly?: boolean;
}

// Paint coverage rate (industry standard)
const PAINT_COVERAGE_RATE = 11; // m² per litre

// Get paint type label
const getPaintTypeLabel = (
  surface: "wood" | "steel",
  type: "gloss" | "matt",
) => {
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  if (surface === "wood") {
    return `Wood - ${typeLabel}`;
  } else {
    return `Steel - ${typeLabel}`;
  }
};

// Extract paint prices for enamel (used for wood/steel)
const extractDoorWindowPaintPrices = (
  materialPrices: any[],
): { gloss?: number; matt?: number } => {
  const prices: any = {};

  const paintCategory = materialPrices.find(
    (p: any) => p.name.toLowerCase() === "paint",
  );

  if (!paintCategory?.type?.materials) {
    return prices;
  }

  // Look for enamel-based paints (gloss/semi-gloss for wood and steel)
  Object.entries(paintCategory.type.materials).forEach(([name, price]) => {
    const lower = name.toLowerCase();
    // Match gloss and high-sheen options
    if (
      lower.includes("gloss") ||
      lower.includes("high sheen") ||
      lower.includes("semi-gloss")
    ) {
      prices.gloss = price;
    }
    // Match matt options
    if (lower.includes("matt") || lower.includes("matte")) {
      prices.matt = price;
    }
  });

  return prices;
};

export default function DoorWindowPaintCalculator({
  paints = [],
  onPaintsUpdate,
  materialPrices = [],
  readonly = false,
}: Props) {
  const [paintItems, setPaintItems] = useState<DoorWindowPaint[]>(paints);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Extract paint prices from material data
  const paintPrices = extractDoorWindowPaintPrices(materialPrices);

  // Default prices if not found
  const glossPrice = paintPrices.gloss || 0;
  const mattPrice = paintPrices.matt || 0;

  // Calculate liters needed and total cost
  const calculatePaint = (paint: DoorWindowPaint): DoorWindowPaint => {
    const coverage = paint.coverage || PAINT_COVERAGE_RATE;
    const litersNeeded = paint.area / coverage;
    const roundedLiters = Math.ceil(litersNeeded); // Round up to nearest litre
    const totalCost = roundedLiters * paint.unitPrice;

    return {
      ...paint,
      totalCost,
    };
  };

  // Add new paint item
  const addPaint = () => {
    const newPaint: DoorWindowPaint = {
      id: `paint-${Date.now()}`,
      surfaceType: "wood",
      paintType: "gloss",
      area: 0,
      coverage: PAINT_COVERAGE_RATE,
      unitPrice: glossPrice,
      totalCost: 0,
    };

    const calculated = calculatePaint(newPaint);
    const updated = [...paintItems, calculated];
    setPaintItems(updated);
    onPaintsUpdate?.(updated);
  };

  // Update paint item
  const updatePaint = (id: string, field: string, value: any) => {
    const updated = paintItems.map((p) => {
      if (p.id === id) {
        let newPaint: DoorWindowPaint = { ...p, [field]: value };

        // If surface or paint type changed, update unit price
        if (field === "surfaceType" || field === "paintType") {
          if (
            value === "gloss" ||
            (field === "paintType" && value === "gloss")
          ) {
            newPaint.unitPrice = glossPrice;
          } else if (
            value === "matt" ||
            (field === "paintType" && value === "matt")
          ) {
            newPaint.unitPrice = mattPrice;
          }
        }

        // Recalculate totals
        newPaint = calculatePaint(newPaint);
        return newPaint;
      }
      return p;
    });

    setPaintItems(updated);
    onPaintsUpdate?.(updated);
  };

  // Delete paint item
  const deletePaint = (id: string) => {
    const updated = paintItems.filter((p) => p.id !== id);
    setPaintItems(updated);
    onPaintsUpdate?.(updated);
    if (editingId === id) setEditingId(null);
  };

  // Calculate total cost
  const calculateTotalCost = (): number => {
    return paintItems.reduce((sum, p) => sum + p.totalCost, 0);
  };

  // Calculate total area
  const calculateTotalArea = (): number => {
    return paintItems.reduce((sum, p) => sum + p.area, 0);
  };

  const totalCost = calculateTotalCost();
  const totalArea = calculateTotalArea();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Other Paint Finishes</CardTitle>
            {!readonly && (
              <Button onClick={addPaint} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Paint Item
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          {paintItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {readonly
                ? "No paint items specified."
                : "No paint items added yet. Click 'Add Paint Item' to begin."}
            </div>
          ) : (
            <div className="space-y-4">
              {paintItems.map((paint, index) => (
                <Card
                  key={paint.id}
                  className="bg-slate-50 dark:bg-slate-900/30"
                >
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Item #{index + 1}:{" "}
                        {getPaintTypeLabel(paint.surfaceType, paint.paintType)}
                      </h4>
                      {!readonly && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deletePaint(paint.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`surface-${paint.id}`}>
                          Surface Type
                        </Label>
                        <Select
                          value={paint.surfaceType}
                          onValueChange={(value: any) =>
                            updatePaint(paint.id, "surfaceType", value)
                          }
                          disabled={readonly}
                        >
                          <SelectTrigger id={`surface-${paint.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wood">Wood</SelectItem>
                            <SelectItem value="steel">Steel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`type-${paint.id}`}>Paint Type</Label>
                        <Select
                          value={paint.paintType}
                          onValueChange={(value: any) =>
                            updatePaint(paint.id, "paintType", value)
                          }
                          disabled={readonly}
                        >
                          <SelectTrigger id={`type-${paint.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gloss">Gloss</SelectItem>
                            <SelectItem value="matt">Matt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`area-${paint.id}`}>Area (m²)</Label>
                        <Input
                          id={`area-${paint.id}`}
                          type="number"
                          step="0.1"
                          min="0"
                          value={paint.area}
                          onChange={(e) =>
                            updatePaint(
                              paint.id,
                              "area",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          readOnly={readonly}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`price-${paint.id}`}>
                          Unit Price (KES/L)
                        </Label>
                        <Input
                          id={`price-${paint.id}`}
                          type="number"
                          step="100"
                          min="0"
                          value={paint.unitPrice}
                          onChange={(e) =>
                            updatePaint(
                              paint.id,
                              "unitPrice",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          readOnly={readonly}
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Area
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {paint.area.toFixed(2)} m²
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Litres Needed
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {Math.ceil(paint.area / paint.coverage)} L
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Total Cost
                          </div>
                          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                            KES{" "}
                            {paint.totalCost.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {paintItems.length > 0 && (
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Area
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalArea.toFixed(2)} m²
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Items
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {paintItems.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Cost
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      KES{" "}
                      {totalCost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
