// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  Layers,
  Wrench,
  Droplet,
  Shield,
  Package,
} from "lucide-react";
import useMasonryCalculatorNew, {
  MasonryQSSettings,
  Dimensions,
  WallProperties,
} from "@/hooks/useMasonryCalculatorNew";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { RebarSize } from "@/hooks/useRebarCalculator";

const blockTypes = [
  {
    id: 1,
    displayName: "200×200/9×9",
    name: "Large Block",
    size: { length: 0.2, height: 0.2, thickness: 0.2 },
  },
  {
    id: 2,
    displayName: "150×200/6×9",
    name: "Standard Block",
    size: { length: 0.15, height: 0.2, thickness: 0.15 },
  },
  {
    id: 3,
    displayName: "100×200/4×9",
    name: "Small Block",
    size: { length: 0.1, height: 0.2, thickness: 0.1 },
  },
  { id: 4, displayName: "Custom", name: "Custom", size: null },
];
const plasterOptions = ["None", "One Side", "Both Sides"];

// Helper function to get block type from thickness
const getBlockTypeFromThickness = (thickness?: number): string => {
  if (!thickness) return "Standard Block";
  if (thickness >= 0.19 && thickness <= 0.21) return "Large Block";
  if (thickness >= 0.14 && thickness <= 0.16) return "Standard Block";
  if (thickness >= 0.09 && thickness <= 0.11) return "Small Block";
  return "Standard Block"; // Default fallback
};

// Helper function to get thickness from block type
const getThicknessFromBlockType = (blockType: string): number => {
  switch (blockType) {
    case "Large Block":
      return 0.2;
    case "Standard Block":
      return 0.15;
    case "Small Block":
      return 0.1;
    default:
      return 0.15;
  }
};

interface MasonryCalculatorFormProps {
  quote: any;
  setQuote: (quote: any) => void;
  materialBasePrices: any[];
  userMaterialPrices: any[];
  regionalMultipliers: any[];
  userRegion: string;
  getEffectiveMaterialPrice: (
    materialId: string,
    userRegion: string,
    userOverride: any,
    materialBasePrices: any[],
    regionalMultipliers: any[],
  ) => any;
}

export default function MasonryCalculatorForm({
  quote,
  setQuote,
  materialBasePrices,
  userMaterialPrices,
  regionalMultipliers,
  userRegion,
  getEffectiveMaterialPrice,
}: MasonryCalculatorFormProps) {
  const {
    wallDimensions,
    wallProperties,
    updateWallDimensions,
    updateWallProperties,
    calculateMasonry,
    results,
    qsSettings,
    waterPrice,
  } = useMasonryCalculatorNew({
    setQuote,
    quote,
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    userRegion,
    getEffectiveMaterialPrice,
  });

  const onSettingsChange = useCallback(
    (newSettings: MasonryQSSettings) => {
      setQuote((prev) => ({
        ...prev,
        qsSettings: newSettings,
      }));
    },
    [setQuote],
  );

  const handleMortarRatioChange = (value: string) => {
    setQuote((prev: any) => ({
      ...prev,
      mortarRatio: value,
    }));
  };
  const handleJointThicknessChange = (value: string) => {
    const numValue = parseFloat(value);
    setQuote((prev: any) => ({
      ...prev,
      jointThickness: isNaN(numValue) ? 0.01 : numValue,
    }));
  };

  return (
    <div className="space-y-6">
      {/* ========== TOTAL COST SUMMARY ========== */}
      <Card className="border bg-gradient-to-br from-primary/5 to-transparent">
        <div className="p-4">
          <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Masonry Cost Summary
          </h3>
          <div className="mt-2 text-3xl font-bold text-primary">
            Ksh {results.grossTotalCost?.toLocaleString() || 0}
          </div>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Blocks:</span>{" "}
              <span className="font-medium">
                {results.grossBlocks?.toFixed(0) || 0} pcs
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Mortar:</span>{" "}
              <span className="font-medium">
                {results.grossMortar?.toFixed(3) || 0} m³
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Water:</span>{" "}
              <span className="font-medium">
                {results.grossWater?.toFixed(0) || 0} L
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Lintels:</span>{" "}
              <span className="font-medium">
                {results.grossLintelsCost
                  ? `Ksh ${results.grossLintelsCost.toLocaleString()}`
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ========== WALL DIMENSIONS ========== */}
      <Card className="border">
        <div className="p-4 border-b bg-muted/20">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Wall Dimensions
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ext-perimeter">
                External Wall Length/Perimeter (m)
              </Label>
              <Input
                id="ext-perimeter"
                type="number"
                min="0"
                step="0.1"
                value={wallDimensions?.externalWallPerimiter || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateWallDimensions({
                    ...wallDimensions,
                    externalWallPerimiter: value,
                  });
                  calculateMasonry();
                }}
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <Label htmlFor="int-perimeter">
                Internal Wall Length/Perimeter (m)
              </Label>
              <Input
                id="int-perimeter"
                type="number"
                min="0"
                step="0.1"
                value={wallDimensions?.internalWallPerimiter || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateWallDimensions({
                    ...wallDimensions,
                    internalWallPerimiter: value,
                  });
                  calculateMasonry();
                }}
                placeholder="e.g., 50"
              />
            </div>
            <div>
              <Label htmlFor="ext-height">External Wall Height (m)</Label>
              <Input
                id="ext-height"
                type="number"
                min="0"
                step="0.1"
                value={wallDimensions?.externalWallHeight || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateWallDimensions({
                    ...wallDimensions,
                    externalWallHeight: value,
                  });
                  calculateMasonry();
                }}
                placeholder="e.g., 3.0"
              />
            </div>
            <div>
              <Label htmlFor="int-height">Internal Wall Height (m)</Label>
              <Input
                id="int-height"
                type="number"
                min="0"
                step="0.1"
                value={wallDimensions?.internalWallHeight || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateWallDimensions({
                    ...wallDimensions,
                    internalWallHeight: value,
                  });
                  calculateMasonry();
                }}
                placeholder="e.g., 2.8"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ========== LINTELS & RING BEAMS SETTINGS ========== */}
      <Card className="border">
        <div className="p-4 border-b bg-muted/20">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Lintels & Ring Beams
          </h3>
        </div>
        <div className="p-4 space-y-6">
          {/* Lintels Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-lintels"
                checked={qsSettings.includesLintels || false}
                onCheckedChange={(checked) =>
                  onSettingsChange({
                    ...qsSettings,
                    includesLintels: checked === true,
                  })
                }
              />
              <Label
                htmlFor="includes-lintels"
                className="font-medium cursor-pointer"
              >
                Include Lintels
              </Label>
            </div>

            {qsSettings.includesLintels && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pl-6">
                <div>
                  <Label htmlFor="lintel-width">Lintel Width (m)</Label>
                  <Input
                    id="lintel-width"
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="0.3"
                    value={qsSettings.lintelWidth || 0.2}
                    onChange={(e) =>
                      onSettingsChange({
                        ...qsSettings,
                        lintelWidth: parseFloat(e.target.value) || 0.2,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lintel-depth">Lintel Depth (m)</Label>
                  <Input
                    id="lintel-depth"
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="0.3"
                    value={qsSettings.lintelDepth || 0.15}
                    onChange={(e) =>
                      onSettingsChange({
                        ...qsSettings,
                        lintelDepth: parseFloat(e.target.value) || 0.15,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lintel-rebar-size">Rebar Size</Label>
                  <Select
                    value={qsSettings.lintelRebarSize || "D12"}
                    onValueChange={(value: RebarSize) =>
                      onSettingsChange({
                        ...qsSettings,
                        lintelRebarSize: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="D8">D8 (8mm)</SelectItem>
                      <SelectItem value="D10">D10 (10mm)</SelectItem>
                      <SelectItem value="D12">D12 (12mm)</SelectItem>
                      <SelectItem value="D16">D16 (16mm)</SelectItem>
                      <SelectItem value="D20">D20 (20mm)</SelectItem>
                      <SelectItem value="D25">D25 (25mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Ring Beams Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includes-ring-beams"
                checked={qsSettings.includesRingBeams || false}
                onCheckedChange={(checked) =>
                  onSettingsChange({
                    ...qsSettings,
                    includesRingBeams: checked === true,
                  })
                }
              />
              <Label
                htmlFor="includes-ring-beams"
                className="font-medium cursor-pointer"
              >
                Include Ring Beams
              </Label>
            </div>

            {qsSettings.includesRingBeams && (
              <div className="space-y-4 pl-6">
                {/* Ring Beam Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ring-beam-width">Ring Beam Width (m)</Label>
                    <Input
                      id="ring-beam-width"
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="0.3"
                      value={qsSettings.ringBeamWidth || 0.15}
                      onChange={(e) =>
                        onSettingsChange({
                          ...qsSettings,
                          ringBeamWidth: parseFloat(e.target.value) || 0.15,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="ring-beam-depth">Ring Beam Depth (m)</Label>
                    <Input
                      id="ring-beam-depth"
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="0.3"
                      value={qsSettings.ringBeamDepth || 0.2}
                      onChange={(e) =>
                        onSettingsChange({
                          ...qsSettings,
                          ringBeamDepth: parseFloat(e.target.value) || 0.2,
                        })
                      }
                    />
                  </div>
                </div>

                <h4 className="text-sm font-medium">Ring Beam Reinforcement</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="ring-beam-main-bars">Main Bars Count</Label>
                    <Input
                      id="ring-beam-main-bars"
                      type="number"
                      min="4"
                      step="1"
                      value={qsSettings.ringBeamMainBarsCount || 8}
                      onChange={(e) =>
                        onSettingsChange({
                          ...qsSettings,
                          ringBeamMainBarsCount:
                            parseFloat(e.target.value) || 8,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="ring-beam-rebar-size">Main Bar Size</Label>
                    <Select
                      value={qsSettings.ringBeamRebarSize || "D12"}
                      onValueChange={(value: RebarSize) =>
                        onSettingsChange({
                          ...qsSettings,
                          ringBeamRebarSize: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "D6",
                          "D8",
                          "D10",
                          "D12",
                          "D14",
                          "D16",
                          "D18",
                          "D20",
                          "D22",
                          "D25",
                        ].map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ring-beam-stirrup-size">Stirrup Size</Label>
                    <Select
                      value={qsSettings.ringBeamStirrupSize || "D8"}
                      onValueChange={(value: RebarSize) =>
                        onSettingsChange({
                          ...qsSettings,
                          ringBeamStirrupSize: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["D6", "D8", "D10", "D12", "D14", "D16"].map(
                          (size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ring-beam-stirrup-spacing">
                      Stirrup Spacing (mm)
                    </Label>
                    <Input
                      id="ring-beam-stirrup-spacing"
                      type="number"
                      min="50"
                      step="10"
                      value={qsSettings.ringBeamStirrupSpacing || 200}
                      onChange={(e) =>
                        onSettingsChange({
                          ...qsSettings,
                          ringBeamStirrupSpacing:
                            parseFloat(e.target.value) || 200,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Development and Lap Length Factors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dev-length-factor">
                      Development Length Factor (× bar diameter)
                    </Label>
                    <Input
                      id="dev-length-factor"
                      type="number"
                      min="20"
                      step="1"
                      value={qsSettings.developmentLengthFactor ?? 40}
                      onChange={(e) =>
                        onSettingsChange({
                          ...qsSettings,
                          developmentLengthFactor:
                            parseFloat(e.target.value) || 40,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Default: 40 (min: 20)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="lap-length-factor">
                      Lap Length Factor (× bar diameter)
                    </Label>
                    <Input
                      id="lap-length-factor"
                      type="number"
                      min="30"
                      step="1"
                      value={qsSettings.lapLengthFactor ?? 50}
                      onChange={(e) =>
                        onSettingsChange({
                          ...qsSettings,
                          lapLengthFactor: parseFloat(e.target.value) || 50,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Default: 50 (min: 30)
                    </p>
                  </div>
                </div>

                {/* Vertical Reinforcement Spacing */}
                <div className="max-w-xs">
                  <Label htmlFor="vertical-reinforcement-spacing">
                    Vertical Rebar Spacing (m)
                  </Label>
                  <Input
                    id="vertical-reinforcement-spacing"
                    type="number"
                    step="0.1"
                    min="0.6"
                    max="2.0"
                    value={qsSettings.verticalReinforcementSpacing || 1.2}
                    onChange={(e) =>
                      onSettingsChange({
                        ...qsSettings,
                        verticalReinforcementSpacing:
                          parseFloat(e.target.value) || 1.2,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lintel Beam Results */}
          {qsSettings.includesLintels &&
            (results.netLintelsCost > 0 || results.grossLintelsCost > 0) && (
              <div className="border-t pt-6 mt-6">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-4">
                  Lintel Beam Results
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rebar (kg):</span>
                      <span className="font-medium">
                        {results.netLintelRebar?.toFixed(1) || 0} net →{" "}
                        {results.grossLintelRebar?.toFixed(1) || 0} gross
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Concrete (m³):
                      </span>
                      <span className="font-medium">
                        {results.netLintelConcrete?.toFixed(3) || 0} net →{" "}
                        {results.grossLintelConcrete?.toFixed(3) || 0} gross
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rebar Cost:</span>
                      <span className="font-medium">
                        Ksh {results.netLintelRebarCost?.toLocaleString() || 0}{" "}
                        → {results.grossLintelRebarCost?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Material Cost:
                      </span>
                      <span className="font-medium">
                        Ksh {results.netLintelsCost?.toLocaleString() || 0} →{" "}
                        {results.grossLintelsCost?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Ring Beam Results */}
          {qsSettings.includesRingBeams &&
            (results.netRingBeamsCost > 0 ||
              results.grossRingBeamsCost > 0) && (
              <div className="border-t pt-6 mt-6">
                <h4 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-4">
                  Ring Beam Results
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rebar (kg):</span>
                      <span className="font-medium">
                        {results.netRingBeamRebar?.toFixed(1) || 0} net →{" "}
                        {results.grossRingBeamRebar?.toFixed(1) || 0} gross
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Concrete (m³):
                      </span>
                      <span className="font-medium">
                        {results.netRingBeamConcrete?.toFixed(3) || 0} net →{" "}
                        {results.grossRingBeamConcrete?.toFixed(3) || 0} gross
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rebar Cost:</span>
                      <span className="font-medium">
                        Ksh{" "}
                        {results.netRingBeamRebarCost?.toLocaleString() || 0} →{" "}
                        {results.grossRingBeamRebarCost?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Material Cost:
                      </span>
                      <span className="font-medium">
                        Ksh {results.netRingBeamsCost?.toLocaleString() || 0} →{" "}
                        {results.grossRingBeamsCost?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </Card>

      {/* ========== WASTE & MISCELLANEOUS ========== */}
      <Card className="border">
        <div className="p-4 border-b bg-muted/20">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Waste & Miscellaneous
          </h3>
        </div>
        <div className="p-4">
          <div className="max-w-xs">
            <Label htmlFor="wastage">Wastage (%)</Label>
            <Input
              id="wastage"
              type="number"
              value={qsSettings.wastageMasonry || 5}
              onChange={(e) =>
                onSettingsChange({
                  ...qsSettings,
                  wastageMasonry: parseFloat(e.target.value),
                })
              }
              placeholder="e.g., 5"
            />
          </div>
        </div>
      </Card>

      {/* ========== HOOP IRON ========== */}
      <Card className="border">
        <div className="p-4 border-b bg-gradient-to-r rounded-t-3xl from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-red-800 dark:text-red-100">
            <Wrench className="w-5 h-5" />
            Hoop Iron
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Roll weight selector */}
          <div className="max-w-xs">
            <Label htmlFor="hoop-iron-roll">Roll Weight</Label>
            <Select
              value={quote.hoopIronRollWeight || "20kg"}
              onValueChange={(value) => {
                setQuote((prev) => ({
                  ...prev,
                  hoopIronRollWeight: value,
                }));
                calculateMasonry();
              }}
            >
              <SelectTrigger id="hoop-iron-roll">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20kg">20kg Roll (65m per roll)</SelectItem>
                <SelectItem value="25kg">25kg Roll (80m per roll)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select roll weight for hoop iron calculations
            </p>
          </div>

          {/* Results */}
          {results.hoopIronLength > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-muted/20 rounded-lg">
              <div>
                <span className="text-sm text-muted-foreground">
                  Total Length
                </span>
                <div className="text-lg font-semibold">
                  {results.hoopIronLength?.toFixed(1) || 0} m
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Number of Rolls
                </span>
                <div className="text-lg font-semibold">
                  {results.hoopIronCoils || 0}
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Total Cost
                </span>
                <div className="text-lg font-semibold">
                  Ksh{" "}
                  {quote?.hoop_iron?.results?.totalCost?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ========== DAMP PROOF COURSE (DPC) ========== */}
      <Card className="border">
        <div className="p-4 border-b bg-muted/20">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Damp Proof Course (DPC)
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-dpc"
              checked={quote.includeDPC !== false}
              onCheckedChange={(checked) =>
                setQuote((prev) => ({
                  ...prev,
                  includeDPC: checked,
                }))
              }
            />
            <Label htmlFor="include-dpc" className="cursor-pointer font-medium">
              Include DPC in calculations
            </Label>
          </div>

          {quote.includeDPC !== false && (
            <div className="max-w-xs">
              <Label htmlFor="dpc-type">DPC Type</Label>
              <Select
                value={quote.dpcType || "Polyethylene"}
                onValueChange={(value) =>
                  setQuote((prev) => ({
                    ...prev,
                    dpcType: value,
                  }))
                }
              >
                <SelectTrigger id="dpc-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Polyethylene">Polyethylene</SelectItem>
                  <SelectItem value="Bituminous Felt">
                    Bituminous Felt
                  </SelectItem>
                  <SelectItem value="PVC DPC Roll">PVC DPC Roll</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* ========== WATER REQUIREMENT ========== */}
      {qsSettings.clientProvidesWater ? (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
          <Droplet className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              Water will be provided by client
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              {results.grossWater?.toFixed(0)} liters required
            </p>
          </div>
        </div>
      ) : results.grossWaterCost > 0 ? (
        <Card className="border">
          <div className="p-4 border-b bg-muted/20">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Droplet className="w-5 h-5" />
              Water Cost Breakdown
            </h3>
          </div>
          <div className="p-4 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Required Water:</span>
              <span className="font-medium">
                {results.grossWater?.toFixed(0)} liters
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Water‑Cement Ratio:</span>
              <span className="font-medium">
                {qsSettings.cementWaterRatio}:1
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Water Price:</span>
              <span className="font-medium">
                Ksh {waterPrice?.toLocaleString() || 0} / m³
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t mt-2">
              <span className="font-medium">Total Water Cost:</span>
              <span className="font-bold">
                Ksh {results.grossWaterCost?.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      ) : null}

      {/* ========== COMPONENT BREAKDOWNS ========== */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold px-1">Detailed Breakdowns</h3>

        {/* Doors & Windows */}
        {(results.netDoorsCost > 0 || results.netWindowsCost > 0) && (
          <Card className="border">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-b rounded-t-lg">
              <h4 className="text-green-900 dark:text-green-100 font-semibold">
                Doors & Windows
              </h4>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                {results.netDoorsCost > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Door Leaves (pcs):
                      </span>
                      <span className="font-medium">
                        {results.netDoors || 0} net → {results.grossDoors || 0}{" "}
                        gross
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Door Leaves Cost:
                      </span>
                      <span className="font-medium">
                        Ksh {results.netDoorsCost?.toLocaleString() || 0} →{" "}
                        {results.grossDoorsCost?.toLocaleString() || 0}
                      </span>
                    </div>
                  </>
                )}
                {results.netDoorFramesCost > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Door Frames (pcs):
                      </span>
                      <span className="font-medium">
                        {results.netDoorFrames || 0} net →{" "}
                        {results.grossDoorFrames || 0} gross
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Door Frames Cost:
                      </span>
                      <span className="font-medium">
                        Ksh {results.netDoorFramesCost?.toLocaleString() || 0} →{" "}
                        {results.grossDoorFramesCost?.toLocaleString() || 0}
                      </span>
                    </div>
                  </>
                )}
                {results.netDoorArchitraveCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Door Architrave Cost:
                    </span>
                    <span className="font-medium">
                      Ksh {results.netDoorArchitraveCost?.toLocaleString() || 0}{" "}
                      → {results.grossDoorArchitraveCost?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
                {results.netDoorQuarterRoundCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Door Quarter Round Cost:
                    </span>
                    <span className="font-medium">
                      Ksh{" "}
                      {results.netDoorQuarterRoundCost?.toLocaleString() || 0} →{" "}
                      {results.grossDoorQuarterRoundCost?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
                {results.netDoorIronmongCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Door Ironmongery Cost:
                    </span>
                    <span className="font-medium">
                      Ksh {results.netDoorIronmongCost?.toLocaleString() || 0} →{" "}
                      {results.grossDoorIronmongCost?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
                {results.netDoorTransomCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Door Transom Cost:
                    </span>
                    <span className="font-medium">
                      Ksh {results.netDoorTransomCost?.toLocaleString() || 0} →{" "}
                      {results.grossDoorTransomCost?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {results.netWindowsCost > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Window Leaves (pcs):
                      </span>
                      <span className="font-medium">
                        {results.netWindows || 0} net →{" "}
                        {results.grossWindows || 0} gross
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Window Leaves Cost:
                      </span>
                      <span className="font-medium">
                        Ksh {results.netWindowsCost?.toLocaleString() || 0} →{" "}
                        {results.grossWindowsCost?.toLocaleString() || 0}
                      </span>
                    </div>
                  </>
                )}
                {results.netWindowFramesCost > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Window Frames (pcs):
                      </span>
                      <span className="font-medium">
                        {results.netWindowFrames || 0} net →{" "}
                        {results.grossWindowFrames || 0} gross
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Window Frames Cost:
                      </span>
                      <span className="font-medium">
                        Ksh {results.netWindowFramesCost?.toLocaleString() || 0}{" "}
                        → {results.grossWindowFramesCost?.toLocaleString() || 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
