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
import {
  PAINT_SUBTYPES_BY_CATEGORY,
  PaintCategory,
  PaintSubtype,
} from "@/types/painting";

interface DoorWindowPaint {
  id: string;
  category: PaintCategory; // emulsion, enamel, wood-finish, metal-finish
  subtype: PaintSubtype; // vinyl-matt, vinyl-silk, antibacterial, eggshell, gloss, etc.
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
const getPaintTypeLabel = (category: PaintCategory, subtype: PaintSubtype) => {
  const categoryOptions = PAINT_SUBTYPES_BY_CATEGORY[category];
  if (!categoryOptions) return `${category} - ${subtype}`;

  const subtypeOption = categoryOptions.find((s) => s.value === subtype);
  return subtypeOption ? subtypeOption.label : `${category} - ${subtype}`;
};

/**
 * Extract individual paint prices from material data
 * Follows same pattern as extractPaintingPrices but for individual subtypes
 */
const extractPaintPrices = (
  materialPrices: any[],
): Record<string, Record<string, number>> => {
  const prices: Record<string, Record<string, number>> = {};

  // Find paint category
  const paintCategory = materialPrices.find(
    (p: any) => p.name.toLowerCase() === "paint",
  );

  if (!paintCategory?.type?.materials) {
    return prices;
  }

  // Extract individual material prices for all paint subtypes
  Object.entries(paintCategory.type.materials).forEach(([name, priceValue]) => {
    const lower = name.toLowerCase();
    const price = Number(priceValue) || 0;

    // Emulsion paints (water-based)
    if (lower.includes("vinyl matt")) {
      if (!prices.emulsion) prices.emulsion = {} as Record<string, number>;
      prices.emulsion["vinyl-matt"] = price;
    } else if (lower.includes("vinyl silk")) {
      if (!prices.emulsion) prices.emulsion = {} as Record<string, number>;
      prices.emulsion["vinyl-silk"] = price;
    } else if (lower.includes("antibacterial")) {
      if (!prices.emulsion) prices.emulsion = {} as Record<string, number>;
      prices.emulsion["antibacterial"] = price;
    }

    // Enamel paints (oil-based)
    else if (lower.includes("eggshell")) {
      if (!prices.enamel) prices.enamel = {} as Record<string, number>;
      prices.enamel["eggshell"] = price;
    } else if (lower.includes("gloss") && !lower.includes("semi")) {
      if (!prices.enamel) prices.enamel = {} as Record<string, number>;
      prices.enamel["gloss"] = price;
    }
    // Wood finishes
    else if (lower.includes("wood satin")) {
      if (!prices["wood-finish"])
        prices["wood-finish"] = {} as Record<string, number>;
      prices["wood-finish"]["satin"] = price;
    }
    // Metal finishes
    else if (lower.includes("metal semi-gloss")) {
      if (!prices["metal-finish"])
        prices["metal-finish"] = {} as Record<string, number>;
      prices["metal-finish"]["semi-gloss"] = price;
    }
  });

  return prices;
};

/**
 * Get price for a specific paint
 */
const getPaintPrice = (
  category: PaintCategory,
  subtype: PaintSubtype,
  prices: Record<string, Record<string, number>>,
): number => {
  return prices[category]?.[subtype] || 0;
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
  const paintPrices = extractPaintPrices(materialPrices);

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
    const defaultCategory: PaintCategory = "enamel";
    const defaultSubtype: PaintSubtype = "eggshell";
    const price = getPaintPrice(defaultCategory, defaultSubtype, paintPrices);

    const newPaint: DoorWindowPaint = {
      id: `paint-${Date.now()}`,
      category: defaultCategory,
      subtype: defaultSubtype,
      area: 0,
      coverage: PAINT_COVERAGE_RATE,
      unitPrice: price,
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

        // If category or subtype changed, update unit price
        if (field === "category" || field === "subtype") {
          const category = field === "category" ? value : p.category;
          const subtype = field === "subtype" ? value : p.subtype;
          const price = getPaintPrice(category, subtype, paintPrices);
          newPaint.unitPrice = price;
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
            <CardTitle>Paint Finishes</CardTitle>
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
                      <h4 className="font-medium text-foreground">
                        Item #{index + 1}:{" "}
                        {getPaintTypeLabel(paint.category, paint.subtype)}
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
                        <Label htmlFor={`category-${paint.id}`}>
                          Paint Category
                        </Label>
                        <Select
                          value={paint.category}
                          onValueChange={(value: any) =>
                            updatePaint(paint.id, "category", value)
                          }
                          disabled={readonly}
                        >
                          <SelectTrigger id={`category-${paint.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emulsion">
                              Emulsion (Water-Based)
                            </SelectItem>
                            <SelectItem value="enamel">
                              Enamel (Oil-Based)
                            </SelectItem>
                            <SelectItem value="wood-finish">
                              Wood Paint
                            </SelectItem>
                            <SelectItem value="metal-finish">
                              Metal Paint
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`subtype-${paint.id}`}>
                          Paint Type
                        </Label>
                        <Select
                          value={paint.subtype}
                          onValueChange={(value: any) =>
                            updatePaint(paint.id, "subtype", value)
                          }
                          disabled={readonly}
                        >
                          <SelectTrigger id={`subtype-${paint.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAINT_SUBTYPES_BY_CATEGORY[paint.category]?.map(
                              (option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ),
                            )}
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

                    <div className="p-4 rounded-lg border border-primary/20 dark:border-primary/30">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Area
                          </div>
                          <div className="text-lg font-semibold text-foreground">
                            {paint.area.toFixed(2)} m²
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Litres Needed
                          </div>
                          <div className="text-lg font-semibold text-foreground">
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
                    <div className="text-2xl font-bold text-foreground">
                      {totalArea.toFixed(2)} m²
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Items
                    </div>
                    <div className="text-2xl font-bold text-foreground">
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
