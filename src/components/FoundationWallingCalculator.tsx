// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useMemo, useEffect, useRef } from "react";
import {
  useFoundationWallingCalculator,
  FoundationWallingRow,
  calculateFoundationWallingQuantities,
} from "@/hooks/useFoundationWallingCalculator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  quote: any;
  onUpdate: (walls: FoundationWallingRow[]) => void;
  materials?: any[];
}

export default function FoundationWallingCalculator({
  quote,
  onUpdate,
  materials = [],
}: Props) {
  const {
    walls,
    addWall,
    updateWall,
    removeWall,
    calculateWallQuantities,
    getTotalQuantities,
  } = useFoundationWallingCalculator(quote);

  const hasInitializedRef = useRef(false);

  // Auto-create foundation walls from quote data on component mount
  useEffect(() => {
    // Return if already initialized to prevent infinite loops
    if (hasInitializedRef.current) return;

    // Skip if foundation walls already exist in quote
    if (quote?.foundationWalling && quote.foundationWalling.length > 0) {
      hasInitializedRef.current = true;
      return;
    }

    const wallDimensions = quote?.wallDimensions;
    if (!wallDimensions) return;

    const externalPerimeter = parseFloat(
      wallDimensions.externalWallPerimiter || "0",
    );
    const internalPerimeter = parseFloat(
      wallDimensions.internalWallPerimiter || "0",
    );

    // Skip if no perimeters
    if (externalPerimeter <= 0 && internalPerimeter <= 0) {
      return;
    }

    // Create external wall with actual data
    if (externalPerimeter > 0) {
      addWall("external");
    }

    // Create internal wall with actual data
    if (internalPerimeter > 0) {
      addWall("internal");
    }

    // Mark as initialized only after creating walls
    hasInitializedRef.current = true;
  }, []);

  // Update walls with calculated data after they're created
  useEffect(() => {
    if (walls.length === 0) return;

    const wallDimensions = quote?.wallDimensions;
    if (!wallDimensions) return;

    const externalPerimeter = parseFloat(
      wallDimensions.externalWallPerimiter || "0",
    );
    const internalPerimeter = parseFloat(
      wallDimensions.internalWallPerimiter || "0",
    );

    // Get wall thickness from wallSection data
    const internalWallThickness =
      quote.wallSections?.find((s: any) => s.type === "internal")?.thickness ||
      0.15;
    const externalWallThickness =
      quote.wallSections?.find((s: any) => s.type === "external")?.thickness ||
      0.2;

    // Calculate wall height
    const concreteStructures = quote?.concrete_rows || [];
    const excavationDepth =
      parseFloat(quote?.foundationDetails?.[0]?.height || "0") || 100;
    const stripFooting = concreteStructures.find(
      (c: any) => c.element?.toLowerCase() === "strip-footing",
    );
    const stripFootingHeight = stripFooting
      ? parseFloat(stripFooting.height || "0")
      : 0;
    const groundFloorSlab = concreteStructures.find(
      (c: any) =>
        c.name?.toLowerCase().includes("ground floor") &&
        c.name?.toLowerCase().includes("slab"),
    );
    const groundFloorSlabThickness = groundFloorSlab
      ? parseFloat(groundFloorSlab.height || "0.15")
      : 0.15;

    const calculatedHeight =
      excavationDepth - stripFootingHeight - groundFloorSlabThickness;
    const foundationWallHeight =
      calculatedHeight > 0 ? calculatedHeight.toFixed(2) : "1.0";

    // Update external wall
    const externalWall = walls.find((w) => w.type === "external");
    if (externalWall && externalPerimeter > 0) {
      updateWall(externalWall.id, {
        wallLength: externalPerimeter.toFixed(2).toString(),
        wallHeight: foundationWallHeight,
      });
    }

    // Update internal wall
    const internalWall = walls.find((w) => w.type === "internal");
    if (internalWall && internalPerimeter > 0) {
      updateWall(internalWall.id, {
        wallLength: internalPerimeter.toFixed(2).toString(),
        wallHeight: foundationWallHeight,
      });
    }
  }, [walls.length]);

  // Get Standard Natural Stone price per foot
  const blockMaterial = materials?.find(
    (m) =>
      m.name?.toLowerCase().includes("block") ||
      m.name?.toLowerCase().includes("brick"),
  );

  const standardNaturalBlockType = blockMaterial?.type?.find((t: any) =>
    t.name?.toLowerCase().includes("standard natural block"),
  );
  const blockPricePerFoot = standardNaturalBlockType?.price_kes || 0;

  // Sync updates with parent
  React.useEffect(() => {
    onUpdate(walls);
  }, [walls, onUpdate]);

  const totals = useMemo(
    () => getTotalQuantities(blockPricePerFoot),
    [getTotalQuantities, walls, blockPricePerFoot],
  );

  const blockDimensionOptions = [
    {
      label: "200×200 (9×9)",
      value: "0.2x0.2x0.2",
      displayName: "Large Block",
    },
    {
      label: "150×200 (6×9)",
      value: "0.15x0.2x0.15",
      displayName: "Standard Block",
    },
    {
      label: "100×200 (4×9)",
      value: "0.1x0.2x0.1",
      displayName: "Small Block",
    },
  ];

  // Helper function to get block dimensions based on block type
  const getBlockDimensionsByType = (blockType: string): string => {
    const typeMapping: { [key: string]: string } = {
      "Large Block": "0.2x0.2x0.2",
      "Standard Block": "0.15x0.2x0.15",
      "Small Block": "0.1x0.2x0.1",
    };
    return typeMapping[blockType] || "0.15x0.2x0.15"; // Default to Standard Block
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Foundation Wall Calculator
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Configure external and internal foundation walls with different block
          thicknesses
        </p>
      </div>

      <Tabs defaultValue="external" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="external">External Walls</TabsTrigger>
          <TabsTrigger value="internal">Internal Walls</TabsTrigger>
        </TabsList>

        {(["external", "internal"] as const).map((wallType) => (
          <TabsContent key={wallType} value={wallType} className="space-y-4">
            <div className="space-y-4">
              {walls
                .filter((wall) => wall.type === wallType)
                .map((wall, index) => {
                  const calculations = calculateWallQuantities(
                    wall,
                    blockPricePerFoot,
                  );

                  return (
                    <Card
                      key={wall.id}
                      className="border-blue-200 dark:border-blue-700"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {wallType === "external"
                                ? "External"
                                : "Internal"}{" "}
                              Wall {index + 1}
                            </CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {calculations.volume?.toFixed(2) || 0} m³
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWall(wall.id)}
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`${wall.id}-length`}>
                              Wall Length (m)
                            </Label>
                            <Input
                              id={`${wall.id}-length`}
                              type="number"
                              min="0"
                              step="0.1"
                              value={wall.wallLength}
                              onChange={(e) =>
                                updateWall(wall.id, {
                                  wallLength: e.target.value,
                                })
                              }
                              className="mt-1"
                              placeholder="e.g., 10"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`${wall.id}-height`}>
                              Wall Height (m)
                            </Label>
                            <Input
                              id={`${wall.id}-height`}
                              type="number"
                              min="0"
                              step="0.1"
                              value={wall.wallHeight}
                              onChange={(e) =>
                                updateWall(wall.id, {
                                  wallHeight: e.target.value,
                                })
                              }
                              className="mt-1"
                              placeholder="e.g., 2.0"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`${wall.id}-dimensions`}>
                              Block Dimensions
                            </Label>
                            <Select
                              value={wall.blockDimensions}
                              onValueChange={(value) => {
                                updateWall(wall.id, { blockDimensions: value });
                              }}
                            >
                              <SelectTrigger
                                id={`${wall.id}-dimensions`}
                                className="mt-1"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {blockDimensionOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`${wall.id}-number`}>
                              Number of Walls
                            </Label>
                            <Input
                              id={`${wall.id}-number`}
                              type="number"
                              min="1"
                              step="1"
                              value={wall.numberOfWalls}
                              onChange={(e) =>
                                updateWall(wall.id, {
                                  numberOfWalls: e.target.value,
                                })
                              }
                              className="mt-1"
                              placeholder="e.g., 1"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`${wall.id}-mortar`}>
                              Mortar Ratio
                            </Label>
                            <Select
                              value={wall.mortarRatio}
                              onValueChange={(value) =>
                                updateWall(wall.id, { mortarRatio: value })
                              }
                            >
                              <SelectTrigger
                                id={`${wall.id}-mortar`}
                                className="mt-1"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1:3">1:3</SelectItem>
                                <SelectItem value="1:4">1:4</SelectItem>
                                <SelectItem value="1:5">1:5</SelectItem>
                                <SelectItem value="1:6">1:6</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Calculations Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-3">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                              <p className="text-gray-600 dark:text-gray-400 text-xs">
                                Volume
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {calculations.volume?.toFixed(2) || 0} m³
                              </p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                              <p className="text-gray-600 dark:text-gray-400 text-xs">
                                Blocks
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {calculations.blocks || 0}
                              </p>
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                              <p className="text-gray-600 dark:text-gray-400 text-xs">
                                Block Ft
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {calculations.blocksFeet?.toFixed(0) || 0}
                              </p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                              <p className="text-gray-600 dark:text-gray-400 text-xs">
                                Cement (bags)
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {calculations.mortarCement || 0}
                              </p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                              <p className="text-gray-600 dark:text-gray-400 text-xs">
                                Sand (m³)
                              </p>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {calculations.mortarSand?.toFixed(2) || 0}
                              </p>
                            </div>
                          </div>

                          {/* Cost Display */}
                          {blockPricePerFoot > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-3xl border border-amber-200 dark:border-amber-700">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Standard Natural Stone
                                  </p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {calculations.blocksFeet?.toFixed(0) || 0}{" "}
                                    ft × KES{" "}
                                    {blockPricePerFoot.toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Total Cost
                                  </p>
                                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                    KES{" "}
                                    {(
                                      calculations.totalCost || 0
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            <Button
              onClick={() => addWall(wallType)}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {wallType === "external" ? "External" : "Internal"} Wall
            </Button>
          </TabsContent>
        ))}
      </Tabs>

      {/* Total Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle>Total Foundation Walling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Volume
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totals.totalVolume.toFixed(2)} m³
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Blocks
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totals.totalBlocks}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Block Ft
              </p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {totals.totalBlocksFeet?.toFixed(0) || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Cement (bags)
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {totals.totalMortarCement}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Sand (m³)
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {totals.totalMortarSand.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Cost Display */}
          {blockPricePerFoot > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-3xl border border-amber-200 dark:border-amber-700 mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Standard Natural Stone Cost
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                {totals.totalBlocksFeet?.toFixed(0) || 0} ft × KES{" "}
                {blockPricePerFoot.toLocaleString()}/ft
              </p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                KES {totals.totalCost.toLocaleString()}
              </p>
            </div>
          )}

          {/* Wall Type Breakdown */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200 dark:border-blue-700">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                External Walls
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {blockPricePerFoot > 0
                  ? `KES ${totals.externalCost.toLocaleString()}`
                  : "No price set"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Internal Walls
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {blockPricePerFoot > 0
                  ? `KES ${totals.internalCost.toLocaleString()}`
                  : "No price set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
