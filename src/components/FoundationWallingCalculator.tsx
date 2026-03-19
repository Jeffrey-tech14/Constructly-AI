// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useMemo, useEffect } from "react";
import {
  useFoundationWallingCalculator,
  FoundationWallingRow,
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

// ----------------------------------------------------------------------
// Constants & helper functions
// ----------------------------------------------------------------------
const BLOCK_DIMENSION_OPTIONS = [
  { label: "200×200 (9×9)", value: "0.2x0.2x0.2", displayName: "Large Block" },
  {
    label: "150×200 (6×9)",
    value: "0.15x0.2x0.15",
    displayName: "Standard Block",
  },
  { label: "100×200 (4×9)", value: "0.1x0.2x0.1", displayName: "Small Block" },
];

const getBlockDimensionsByType = (blockType: string): string => {
  const map: Record<string, string> = {
    "Large Block": "0.2x0.2x0.2",
    "Standard Block": "0.15x0.2x0.15",
    "Small Block": "0.1x0.2x0.1",
  };
  return map[blockType] || "0.15x0.2x0.15";
};

const getBlockThicknessFromType = (blockType: string): number => {
  const dims = getBlockDimensionsByType(blockType).split("x").map(Number);
  return dims[2] || 0.15;
};

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
    calculateFoundationWallingArea,
  } = useFoundationWallingCalculator(quote);

  // --------------------------------------------------------------------
  // Derived data
  // --------------------------------------------------------------------
  const externalPerimeter = useMemo(
    () => parseFloat(quote?.wallDimensions?.externalWallPerimiter || "0"),
    [quote?.wallDimensions?.externalWallPerimiter],
  );
  const internalPerimeter = useMemo(
    () => parseFloat(quote?.wallDimensions?.internalWallPerimiter || "0"),
    [quote?.wallDimensions?.internalWallPerimiter],
  );

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

  const returnFillCalculations = useMemo(() => {
    const externalBlockType =
      quote?.wallSections?.find((s: any) => s.type === "external")?.blockType ||
      "Standard Block";
    const internalBlockType =
      quote?.wallSections?.find((s: any) => s.type === "internal")?.blockType ||
      "Standard Block";

    const externalThickness = getBlockThicknessFromType(externalBlockType);
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
    const blindingThickness = parseFloat(
      quote?.concrete_rows?.find((c: any) => c.element === "blinding")
        ?.height || "0.1",
    );
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

    const externalReturn = calculateReturnFillQuantities(
      externalPerimeter,
      externalThickness,
      0,
      returnFillDepth,
      elevation,
      topsoilDepth,
      slabThickness,
      blindingThickness,
    );
    const internalReturn = calculateReturnFillQuantities(
      internalPerimeter,
      internalThickness,
      0,
      returnFillDepth,
      elevation,
      topsoilDepth,
      slabThickness,
      blindingThickness,
    );

    return {
      volume: externalReturn.volume + internalReturn.volume,
      height: externalReturn.height,
      externalVolume: externalReturn.volume,
      internalVolume: internalReturn.volume,
    };
  }, [
    externalPerimeter,
    internalPerimeter,
    quote?.wallSections,
    quote?.foundationDetails,
    quote?.earthwork,
    quote?.concrete_rows,
  ]);

  // --------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------
  // 1. Auto-create foundation walls from quote perimeters (only if walls empty)
  useEffect(() => {
    if (walls.length > 0) return;
    if (externalPerimeter > 0) addWall("external");
    if (internalPerimeter > 0) addWall("internal");
  }, [walls.length, externalPerimeter, internalPerimeter, addWall]);

  // 2. Auto-update wall fields from quote data (without overwriting user edits)
  useEffect(() => {
    if (walls.length === 0) return;

    // Get foundation wall height from quote data (same formula as before)
    const concreteStructures = quote?.concrete_rows || [];
    const excavationDepth = parseFloat(
      quote?.foundationDetails?.[0]?.height || "0",
    );
    const elevation = parseFloat(
      quote?.foundationDetails?.[0]?.groundFloorElevation || "0",
    );
    const topsoilItem = quote?.earthwork?.find(
      (e: any) => e.type === "topsoil-removal",
    );
    const topsoilDepth = parseFloat(topsoilItem?.depth || "0.2");
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
      excavationDepth +
      elevation -
      groundFloorSlabThickness -
      stripFootingHeight +
      topsoilDepth;
    const foundationWallHeight =
      calculatedHeight > 0 ? calculatedHeight.toFixed(2) : "1.0";

    walls.forEach((wall) => {
      const updates: Partial<FoundationWallingRow> = {};

      // Length (only if not set or zero)
      const perimeter =
        wall.type === "external" ? externalPerimeter : internalPerimeter;
      if (perimeter > 0) {
        updates.wallLength = perimeter.toFixed(2).toString();
      }

      // Height (only if not set or zero)
      if (!wall.wallHeight || parseFloat(wall.wallHeight) === 0) {
        updates.wallHeight = foundationWallHeight;
      }

      // Backfill fields (only if empty)
      if (!wall.elevation) updates.elevation = elevation.toString();
      if (!wall.topsoilDepth) updates.topsoilDepth = topsoilDepth.toString();
      if (!wall.slabThickness)
        updates.slabThickness = groundFloorSlabThickness.toString();
      if (!wall.blindingThickness) {
        const blindingItem = concreteStructures.find(
          (c: any) => c.element === "blinding",
        );
        updates.blindingThickness = blindingItem?.height || "0.1";
      }

      if (Object.keys(updates).length > 0) {
        updateWall(wall.id, updates);
      }
    });
  }, [
    externalPerimeter,
    internalPerimeter,
    quote?.foundationDetails,
    quote?.earthwork,
    quote?.concrete_rows,
    updateWall,
  ]);

  // 3. Sync walls with parent
  useEffect(() => {
    onUpdate(walls);
  }, [walls, onUpdate]);

  // --------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl text-foreground">Foundation Wall Calculator</h3>
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
                      className="border-primary/20 dark:border-primary/30"
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
                              onValueChange={(value) =>
                                updateWall(wall.id, { blockDimensions: value })
                              }
                            >
                              <SelectTrigger
                                id={`${wall.id}-dimensions`}
                                className="mt-1"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {BLOCK_DIMENSION_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                                {["1:3", "1:4", "1:5", "1:6"].map((ratio) => (
                                  <SelectItem key={ratio} value={ratio}>
                                    {ratio}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Return Fill Section */}
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
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
                                value={wall.elevation}
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
                                value={wall.topsoilDepth}
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
                                value={wall.slabThickness}
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
                                value={wall.blindingThickness}
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
                                value={wall.returnFillDepth || ""}
                                readOnly
                                className="bg-gray-100 dark:bg-gray-600"
                                placeholder="Auto-calculated"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Calculations Summary */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-3">
                            <div className="bg-primary/10 dark:bg-primary/30 p-2 rounded">
                              <p className="text-gray-600 dark:text-gray-400 text-xs">
                                Volume
                              </p>
                              <p className="text-foreground">
                                {calculations.volume?.toFixed(2) || 0} m³
                              </p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                              <p className="text-gray-600 dark:text-gray-400 text-xs">
                                Blocks
                              </p>
                              <p className="text-foreground">
                                {calculations.blocks || 0}
                              </p>
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                              <p className="text-gray-600 dark:text-gray-400 text-xs">
                                Block Ft
                              </p>
                              <p className="text-foreground">
                                {calculations.blocksFeet?.toFixed(0) || 0}
                              </p>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                              <p className="text-gray-600 dark:text-gray-400 text-xs">
                                Cement (bags)
                              </p>
                              <p className="text-foreground">
                                {calculations.mortarCement || 0}
                              </p>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                              <p className="text-gray-600 dark:text-gray-400 text-xs">
                                Sand (m³)
                              </p>
                              <p className="text-foreground">
                                {calculations.mortarSand?.toFixed(2) || 0}
                              </p>
                            </div>
                          </div>

                          {blockPricePerFoot > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-3xl border border-amber-200 dark:border-amber-700">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Standard Natural Stone
                                  </p>
                                  <p className="text-sm font-medium text-foreground">
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
      <Card className="bg-gradient-to-r from-primary to-indigo-50 dark:from-primary/20 dark:to-indigo-900/20 border-primary/20 dark:border-primary/30">
        <CardHeader>
          <CardTitle>Total Foundation Walling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Walling Area
              </p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {calculateFoundationWallingArea().toFixed(2)} m²
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total Volume
              </p>
              <p className="text-2xl font-bold text-primary dark:text-primary">
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

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/20 dark:border-primary/30">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                External Walls
              </p>
              <p className="text-lg text-foreground">
                {blockPricePerFoot > 0
                  ? `KES ${totals.externalCost.toLocaleString()}`
                  : "No price set"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Internal Walls
              </p>
              <p className="text-lg text-foreground">
                {blockPricePerFoot > 0
                  ? `KES ${totals.internalCost.toLocaleString()}`
                  : "No price set"}
              </p>
            </div>
          </div>

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
                    {externalPerimeter.toFixed(2)} m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Internal Wall Perimeter
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    {internalPerimeter.toFixed(2)} m
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
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-primary/10 dark:bg-primary/30 p-3 rounded border border-primary/20">
                  <p className="text-xs text-primary dark:text-primary">
                    External Wall Return Fill
                  </p>
                  <p className="text-lg font-bold text-primary dark:text-primary">
                    {returnFillCalculations.externalVolume.toFixed(2)} m³
                  </p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded border border-indigo-200 dark:border-indigo-700">
                  <p className="text-xs text-indigo-900 dark:text-indigo-100">
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
