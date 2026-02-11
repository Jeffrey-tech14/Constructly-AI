// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useMemo, useEffect, useRef } from "react";
import {
  useFoundationWallingCalculator,
  FoundationWallingRow,
  calculateFoundationWallingQuantities,
  calculateReturnFillQuantities,
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
import { Checkbox } from "@/components/ui/checkbox";
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

    // Skip if walls already exist
    if (walls.length > 0) {
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
  }, [walls.length, addWall, quote?.wallDimensions]);

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
        c.name?.toLowerCase().includes("ground") &&
        c.name?.toLowerCase().includes("slab"),
    );
    const groundFloorSlabThickness = groundFloorSlab
      ? parseFloat(groundFloorSlab.height || "0.15")
      : 0.15;
    const calculatedHeight =
      excavationDepth - stripFootingHeight - groundFloorSlabThickness;
    const foundationWallHeight =
      calculatedHeight > 0 && calculatedHeight !== 0 ? calculatedHeight.toFixed(2) : "1.0";
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

  // Autofill backfill values from quote data
  useEffect(() => {
    if (walls.length === 0) return;

    const elevation = quote?.foundationDetails?.[0]?.groundFloorElevation;
    const topsoilItem = quote?.earthwork?.find(
      (e: any) => e.type === "topsoil-removal",
    );
    const topsoilDepth = topsoilItem?.depth || "0.2";
    const groundFloorSlab = quote?.concrete_rows?.find(
      (c: any) =>
        c.element === "slab" && c.name?.toLowerCase().includes("ground"),
    );
    const slabThickness = groundFloorSlab?.height || "0.15";
    const blindingItem = quote?.concrete_rows?.find(
      (c: any) => c.element === "blinding",
    );
    const blindingThickness = blindingItem?.height || "0.1";
    const slabArea = groundFloorSlab?.length;

    // Update each wall with autofilled values
    walls.forEach((wall) => {
      const updates: any = {
        elevation: elevation?.toString() || wall.elevation,
        topsoilDepth: topsoilDepth?.toString() || wall.topsoilDepth,
        slabThickness: slabThickness?.toString() || wall.slabThickness,
        blindingThickness:
          blindingThickness?.toString() || wall.blindingThickness,
      };

      updateWall(wall.id, updates);
    });
  }, [
    quote?.foundationDetails?.[0]?.groundFloorElevation,
    quote?.earthwork,
    quote?.concrete_rows,
  ]);

  // Sync updates with parent
  React.useEffect(() => {
    onUpdate(walls);
  }, [walls, onUpdate]);

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

  // Helper function to get block thickness from blockType
  const getBlockThicknessFromType = (blockType: string): number => {
    const dimensionsStr = getBlockDimensionsByType(blockType);
    const parts = dimensionsStr.split("x").map((p) => parseFloat(p.trim()));
    return parts.length >= 3 ? parts[2] : 0.15; // Return thickness (third dimension)
  };

  // Calculate return fill quantities from quote data
  const returnFillCalculations = useMemo(() => {
    // Get external wall blockType and calculate thickness from it
    const externalPerimeter = parseFloat(
      quote?.wallDimensions?.externalWallPerimiter || "0",
    );
    const externalBlockType =
      quote?.wallSections?.find((s: any) => s.type === "external")?.blockType ||
      "Standard Block";
    const externalThickness = getBlockThicknessFromType(externalBlockType);

    // Get internal wall blockType and calculate thickness from it
    const internalPerimeter = parseFloat(
      quote?.wallDimensions?.internalWallPerimiter || "0",
    );
    const internalBlockType =
      quote?.wallSections?.find((s: any) => s.type === "internal")?.blockType ||
      "Standard Block";
    const internalThickness = getBlockThicknessFromType(internalBlockType);

    const elevation = parseFloat(
      quote?.foundationDetails?.[0]?.groundFloorElevation || "0",
    );
    const topsoilItem = quote?.earthwork?.find(
      (e: any) => e.type === "topsoil-removal",
    );
    const topsoilDepth = parseFloat(topsoilItem?.depth || "0.2");
    const slabThickness = parseFloat(
      quote?.concrete_rows?.find(
        (c: any) =>
          c.element === "slab" && c.name?.toLowerCase().includes("ground"),
      )?.height || "0.15",
    );
    const blindingItem = quote?.concrete_rows?.find(
      (c: any) => c.element === "blinding",
    );
    const blindingThickness = parseFloat(blindingItem?.height || "0.1");
    const returnFillDepth = parseFloat(
      quote?.foundationDetails?.[0]?.returnFillDepth || "0.5",
    );

    if (
      (externalPerimeter <= 0 && internalPerimeter <= 0) ||
      elevation <= 0 ||
      topsoilDepth <= 0 ||
      slabThickness <= 0 ||
      blindingThickness <= 0 ||
      returnFillDepth <= 0
    ) {
      return { volume: 0, height: 0, externalVolume: 0, internalVolume: 0 };
    }

    // Calculate external wall return fill
    const externalReturnFill = calculateReturnFillQuantities(
      externalPerimeter,
      externalThickness,
      0, // wallHeight not used in calculation
      returnFillDepth,
      elevation,
      topsoilDepth,
      slabThickness,
      blindingThickness,
    );

    // Calculate internal wall return fill
    const internalReturnFill = calculateReturnFillQuantities(
      internalPerimeter,
      internalThickness,
      0, // wallHeight not used in calculation
      returnFillDepth,
      elevation,
      topsoilDepth,
      slabThickness,
      blindingThickness,
    );

    return {
      volume: externalReturnFill.volume + internalReturnFill.volume,
      height: externalReturnFill.height, // Same height for both
      externalVolume: externalReturnFill.volume,
      internalVolume: internalReturnFill.volume,
    };
  }, [
    quote?.wallDimensions,
    quote?.wallSections,
    quote?.foundationDetails,
    quote?.earthwork,
    quote?.concrete_rows,
  ]);
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

                        {/* Return Fill Section */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                          <h2>Return Fill</h2>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <Label htmlFor={`${wall.id}-elevation`}>
                                Elevation (m)
                              </Label>
                              <Input
                                id={`${wall.id}-elevation`}
                                type="number"
                                step="0.05"
                                value={
                                  wall.elevation ||
                                  quote?.foundationDetails?.[0]
                                    ?.groundFloorElevation ||
                                  ""
                                }
                                onChange={(e) =>
                                  updateWall(wall.id, {
                                    elevation: e.target.value,
                                  })
                                }
                                placeholder={
                                  quote?.foundationDetails?.[0]
                                    ?.groundFloorElevation || "0"
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${wall.id}-topsoil`}>
                                Topsoil Depth (m)
                              </Label>
                              <Input
                                id={`${wall.id}-topsoil`}
                                type="number"
                                step="0.05"
                                value={
                                  wall.topsoilDepth ||
                                  quote?.earthwork?.find(
                                    (e: any) => e.type === "topsoil-removal",
                                  )?.depth ||
                                  ""
                                }
                                onChange={(e) =>
                                  updateWall(wall.id, {
                                    topsoilDepth: e.target.value,
                                  })
                                }
                                placeholder={
                                  quote?.earthwork?.find(
                                    (e: any) => e.type === "topsoil-removal",
                                  )?.depth || "0.2"
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${wall.id}-slab`}>
                                Slab Thickness (m)
                              </Label>
                              <Input
                                id={`${wall.id}-slab`}
                                type="number"
                                step="0.05"
                                value={
                                  wall.slabThickness ||
                                  quote?.concrete_rows?.find(
                                    (c: any) =>
                                      c.element === "slab" &&
                                      c.name?.toLowerCase().includes("ground"),
                                  )?.height ||
                                  ""
                                }
                                onChange={(e) =>
                                  updateWall(wall.id, {
                                    slabThickness: e.target.value,
                                  })
                                }
                                placeholder={
                                  quote?.concrete_rows?.find(
                                    (c: any) =>
                                      c.element === "slab" &&
                                      c.name?.toLowerCase().includes("ground"),
                                  )?.height || "0.15"
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${wall.id}-blinding`}>
                                Blinding Thickness (m)
                              </Label>
                              <Input
                                id={`${wall.id}-blinding`}
                                type="number"
                                step="0.05"
                                value={
                                  wall.blindingThickness ||
                                  quote?.concrete_rows?.find(
                                    (c: any) => c.element === "blinding",
                                  )?.height ||
                                  ""
                                }
                                onChange={(e) =>
                                  updateWall(wall.id, {
                                    blindingThickness: e.target.value,
                                  })
                                }
                                placeholder={
                                  quote?.concrete_rows?.find(
                                    (c: any) => c.element === "blinding",
                                  )?.height || "0.1"
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`${wall.id}-fillDepth`}>
                                Return Fill Depth (m)
                              </Label>
                              <Input
                                id={`${wall.id}-fillDepth`}
                                type="number"
                                step="0.05"
                                min="0.05"
                                max="1"
                                value={
                                  wall.returnFillDepth ||
                                  (() => {
                                    const elev = parseFloat(
                                      wall.elevation ||
                                        quote?.foundationDetails?.[0]
                                          ?.groundFloorElevation ||
                                        "0",
                                    );
                                    const topsoil = parseFloat(
                                      wall.topsoilDepth ||
                                        quote?.earthwork?.find(
                                          (e: any) =>
                                            e.type === "topsoil-removal",
                                        )?.depth ||
                                        "0.2",
                                    );
                                    const slab = parseFloat(
                                      wall.slabThickness ||
                                        quote?.concrete_rows?.find(
                                          (c: any) =>
                                            c.element === "slab" &&
                                            c.name
                                              ?.toLowerCase()
                                              .includes("ground"),
                                        )?.height ||
                                        "0.15",
                                    );
                                    const blinding = parseFloat(
                                      wall.blindingThickness ||
                                        quote?.concrete_rows?.find(
                                          (c: any) => c.element === "blinding",
                                        )?.height ||
                                        "0.1",
                                    );
                                    const calculated = Math.max(
                                      0,
                                      elev + topsoil - slab - blinding,
                                    );
                                    return calculated.toFixed(2);
                                  })()
                                }
                                readOnly
                                className="bg-gray-100 dark:bg-gray-600"
                                placeholder="Auto-calculated"
                              />
                            </div>
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
          {/* Return Fill Summary */}
          {returnFillCalculations.volume > 0 && (
            <>
              <h3 className="mt-4">Return Fill Summary</h3>
              <div className="grid mt-2 grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Return Fill Height
                  </p>
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {returnFillCalculations.height.toFixed(2)} m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    External Wall Perimeter
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {quote?.wallDimensions?.externalWallPerimiter || 0} m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Internal Wall Perimeter
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {quote?.wallDimensions?.internalWallPerimiter || 0} m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Volume
                  </p>
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {returnFillCalculations.volume.toFixed(2)} m³
                  </p>
                </div>
              </div>
              {/* Breakdown by wall type */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-700">
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                    External Wall Return Fill
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {returnFillCalculations.externalVolume.toFixed(2)} m³
                  </p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded border border-indigo-200 dark:border-indigo-700">
                  <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-100">
                    Internal Wall Return Fill
                  </p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {returnFillCalculations.internalVolume.toFixed(2)} m³
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
