// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Calculator,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import useRoofingCalculator, {
  BuildingInputs,
  RoofMaterialBreakdown,
  RoofDefaults,
} from "@/hooks/useRoofingCalculator";

interface RoofingCalculatorUIProps {
  materialPrices?: any;
  onCalculationResult?: (result: RoofMaterialBreakdown) => void;
  readonly?: boolean;
  setQuoteData?: (data: any) => void;
  quote?: any;
}

const ROOF_TYPES = [
  { value: "gable", label: "Gable Roof" },
  { value: "hip", label: "Hip Roof" },
  { value: "pitched", label: "Pitched Roof" },
  { value: "flat", label: "Flat Roof" },
];

// Roofing sheet specifications (in meters)
const SHEET_EFFECTIVE_COVER_WIDTHS = [
  { value: 1.0, label: "1000mm (1.0m)" },
  { value: 1.06, label: "1060mm (1.06m)" },
];

const SHEET_TOTAL_WIDTHS = [
  { value: 1.05, label: "1050mm (1.05m)" },
  { value: 1.13, label: "1130mm (1.13m)" },
];

const SHEET_STANDARD_LENGTHS = [
  { value: 2.0, label: "2.0m" },
  { value: 2.5, label: "2.5m" },
  { value: 3.0, label: "3.0m" },
];

export default function RoofingCalculatorUI({
  materialPrices,
  onCalculationResult,
  readonly = false,
  setQuoteData,
  quote,
}: RoofingCalculatorUIProps) {
  const { calculateRoofMaterials } = useRoofingCalculator(
    [],
    materialPrices,
    quote,
    setQuoteData
  );

  // State for building inputs
  const [inputs, setInputs] = useState<BuildingInputs>({
    footprintAreaM2: 200,
    externalPerimeterM: 60,
    buildingLengthM: 15,
    buildingWidthM: 12,
    roofTrussTypeKingPost: true,
    purlinSpacingM: 1.5,
    roofingSheetEffectiveCoverWidthM: 1.0,
    roofingSheetLengthM: 3.0,
    roofType: "gable",
    pitchDegrees: 25,
    eaveWidthM: 0.8,
    rasterSpacingMm: 600,
    trussSpacingMm: 600,
  });

  // State for calculation result
  const [breakdown, setBreakdown] = useState<RoofMaterialBreakdown | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    geometry: true,
    timbers: true,
    roofing: true,
  });

  // Handle input changes
  const handleInputChange = useCallback(
    (field: keyof BuildingInputs, value: any) => {
      setInputs((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Handle calculation
  const handleCalculate = useCallback(() => {
    try {
      const result = calculateRoofMaterials(inputs);
      setBreakdown(result);
      onCalculationResult?.(result);
      setQuoteData?.((prev: any) => ({
        ...prev,
        roofing_breakdown: result,
      }));
    } catch (error) {
      console.error("Calculation error:", error);
    }
  }, [inputs, calculateRoofMaterials, onCalculationResult, setQuoteData]);

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // Format functions
  const formatNumber = (value: number, decimals = 2) => {
    return value.toFixed(decimals);
  };

  const formatArea = (area: number) => `${formatNumber(area, 2)} m²`;
  const formatLength = (length: number) => `${formatNumber(length, 2)} m`;
  const formatVolume = (volume: number) => `${formatNumber(volume, 3)} m³`;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Building Dimensions</CardTitle>
          <CardDescription>
            Enter building and roof parameters for material calculation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Building Inputs */}
          <div>
            <Label className="text-base font-semibold mb-4 block">
              Building Parameters
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="footprint-area">Footprint Area (m²)</Label>
                <Input
                  id="footprint-area"
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.footprintAreaM2}
                  onChange={(e) =>
                    handleInputChange(
                      "footprintAreaM2",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="perimeter">External Perimeter (m)</Label>
                <Input
                  id="perimeter"
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.externalPerimeterM}
                  onChange={(e) =>
                    handleInputChange(
                      "externalPerimeterM",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="length">Building Length (m)</Label>
                <Input
                  id="length"
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.buildingLengthM}
                  onChange={(e) =>
                    handleInputChange(
                      "buildingLengthM",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="width">Building Width (m)</Label>
                <Input
                  id="width"
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.buildingWidthM}
                  onChange={(e) =>
                    handleInputChange(
                      "buildingWidthM",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Roof Parameters */}
          <div>
            <Label className="text-base font-semibold mb-4 block">
              Roof Parameters
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="roof-type">Roof Type</Label>
                <Select
                  value={inputs.roofType || "gable"}
                  onValueChange={(value) => handleInputChange("roofType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOF_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pitch">Roof Pitch (degrees)</Label>
                <Input
                  id="pitch"
                  type="number"
                  min="0"
                  max="90"
                  step="1"
                  value={inputs.pitchDegrees}
                  onChange={(e) =>
                    handleInputChange(
                      "pitchDegrees",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="eave-width">Eave Width (m)</Label>
                <Input
                  id="eave-width"
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.eaveWidthM}
                  onChange={(e) =>
                    handleInputChange(
                      "eaveWidthM",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="king-post">Truss Type</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="king-post"
                    checked={inputs.roofTrussTypeKingPost}
                    onCheckedChange={(checked) =>
                      handleInputChange("roofTrussTypeKingPost", checked)
                    }
                  />
                  <Label htmlFor="king-post" className="cursor-pointer text-sm">
                    King Post
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Spacing Parameters */}
          <div>
            <Label className="text-base font-semibold mb-4 block">
              Spacing & Dimensions
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="rafter-spacing">Rafter Spacing (mm)</Label>
                <Input
                  id="rafter-spacing"
                  type="number"
                  min="100"
                  step="50"
                  value={inputs.rasterSpacingMm}
                  onChange={(e) =>
                    handleInputChange(
                      "rasterSpacingMm",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="truss-spacing">Truss Spacing (mm)</Label>
                <Input
                  id="truss-spacing"
                  type="number"
                  min="100"
                  step="50"
                  value={inputs.trussSpacingMm}
                  onChange={(e) =>
                    handleInputChange(
                      "trussSpacingMm",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="purlin-spacing">Purlin Spacing (m)</Label>
                <Input
                  id="purlin-spacing"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={inputs.purlinSpacingM}
                  onChange={(e) =>
                    handleInputChange(
                      "purlinSpacingM",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Roofing Sheet Parameters */}
          <div>
            <Label className="text-base font-semibold mb-4 block">
              Roofing Sheet Specifications
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sheet-cover-width">
                  Sheet Effective Cover Width (after overlap)
                </Label>
                <Select
                  value={inputs.roofingSheetEffectiveCoverWidthM.toString()}
                  onValueChange={(value) =>
                    handleInputChange(
                      "roofingSheetEffectiveCoverWidthM",
                      parseFloat(value)
                    )
                  }
                >
                  <SelectTrigger id="sheet-cover-width">
                    <SelectValue placeholder="Select cover width" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHEET_EFFECTIVE_COVER_WIDTHS.map((width) => (
                      <SelectItem
                        key={width.value}
                        value={width.value.toString()}
                      >
                        {width.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sheet-length">
                  Sheet Standard Length
                </Label>
                <Select
                  value={inputs.roofingSheetLengthM.toString()}
                  onValueChange={(value) =>
                    handleInputChange(
                      "roofingSheetLengthM",
                      parseFloat(value)
                    )
                  }
                >
                  <SelectTrigger id="sheet-length">
                    <SelectValue placeholder="Select sheet length" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHEET_STANDARD_LENGTHS.map((length) => (
                      <SelectItem
                        key={length.value}
                        value={length.value.toString()}
                      >
                        {length.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-400 flex items-end pb-2">
                <span>
                  Total Width Range: 1050mm - 1130mm
                  <br />
                  (automatically selected based on cover width)
                </span>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button onClick={handleCalculate} size="lg">
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Materials
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {breakdown && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Projected Roof Area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatArea(breakdown.geometry.projectedRoofAreaM2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  (with eaves)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Effective Sloped Area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatArea(breakdown.geometry.effectiveRoofAreaM2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  (accounting for pitch)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Rafter Length
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatLength(breakdown.geometry.rasterLengthM)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  (per side)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Roof Pitch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {breakdown.defaults.pitchDegrees}°
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(breakdown.geometry.pitchRadians * (180 / Math.PI)).toFixed(1)}° in radians
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Defaults Used */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Defaults Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                <div>
                  <span className="font-medium">Roof Type:</span>
                  <p className="text-muted-foreground">
                    {breakdown.defaults.roofType}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Timber Wastage:</span>
                  <p className="text-muted-foreground">
                    {breakdown.defaults.structuralTimberWastagePercent}%
                  </p>
                </div>
                <div>
                  <span className="font-medium">Sheet Wastage:</span>
                  <p className="text-muted-foreground">
                    {breakdown.defaults.roofingSheetWastagePercent}%
                  </p>
                </div>
                <div>
                  <span className="font-medium">Misc. Allowance:</span>
                  <p className="text-muted-foreground">
                    {breakdown.defaults.miscellaneousAllowancePercent}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Results */}
          <Tabs defaultValue="timbers" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timbers">Timbers</TabsTrigger>
              <TabsTrigger value="roofing">Roofing</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            {/* Timbers Tab */}
            <TabsContent value="timbers">
              <Card>
                <CardHeader>
                  <CardTitle>Structural Timber Breakdown</CardTitle>
                  <CardDescription>
                    All timbers include {breakdown.defaults.structuralTimberWastagePercent}% wastage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Wall Plates */}
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection("wallPlates")}
                        className="w-full flex items-center justify-between p-4 bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedSections["wallPlates"] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <div className="text-left">
                            <h4 className="font-semibold">
                              {breakdown.wallPlates.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {breakdown.wallPlates.sizeXxY} mm
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {formatLength(breakdown.wallPlates.totalLengthWithWastageM)}
                        </Badge>
                      </button>
                      {expandedSections["wallPlates"] && (
                        <div className="p-4 border-t space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Base Length:</span>
                              <p>
                                {formatLength(
                                  breakdown.wallPlates.totalLengthM
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">With Wastage:</span>
                              <p>
                                {formatLength(
                                  breakdown.wallPlates.totalLengthWithWastageM
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Wastage:</span>
                              <p>
                                {formatLength(breakdown.wallPlates.wasteageAllowanceM)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Unit:</span>
                              <p>{breakdown.wallPlates.unitLm}</p>
                            </div>
                          </div>
                          {breakdown.wallPlates.unitPrice !== undefined && (
                            <div className="border-t pt-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Price per Unit:</span>
                                  <p className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {formatCurrency(breakdown.wallPlates.unitPrice)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Total (Base):</span>
                                  <p className="text-green-600 dark:text-green-400 font-semibold">
                                    {formatCurrency(breakdown.wallPlates.totalPrice || 0)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Total (with Wastage):</span>
                                  <p className="text-orange-600 dark:text-orange-400 font-semibold text-lg">
                                    {formatCurrency(breakdown.wallPlates.totalPriceWithWastage || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tie Beams */}
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection("tieBeams")}
                        className="w-full flex items-center justify-between p-4 bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedSections["tieBeams"] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <div className="text-left">
                            <h4 className="font-semibold">
                              {breakdown.tieBeams.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {breakdown.tieBeams.sizeXxY} mm
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {formatLength(breakdown.tieBeams.totalLengthWithWastageM)}
                        </Badge>
                      </button>
                      {expandedSections["tieBeams"] && (
                        <div className="p-4 border-t space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Base Length:</span>
                              <p>
                                {formatLength(breakdown.tieBeams.totalLengthM)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">With Wastage:</span>
                              <p>
                                {formatLength(
                                  breakdown.tieBeams.totalLengthWithWastageM
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Wastage:</span>
                              <p>
                                {formatLength(breakdown.tieBeams.wasteageAllowanceM)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Qty:</span>
                              <p>{breakdown.tieBeams.quantityPcs} pcs</p>
                            </div>
                          </div>
                          {breakdown.tieBeams.unitPrice !== undefined && (
                            <div className="border-t pt-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Price per Unit:</span>
                                  <p className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {formatCurrency(breakdown.tieBeams.unitPrice)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Total (Base):</span>
                                  <p className="text-green-600 dark:text-green-400 font-semibold">
                                    {formatCurrency(breakdown.tieBeams.totalPrice || 0)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Total (with Wastage):</span>
                                  <p className="text-orange-600 dark:text-orange-400 font-semibold text-lg">
                                    {formatCurrency(breakdown.tieBeams.totalPriceWithWastage || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* King Posts */}
                    {breakdown.kingPosts && (
                      <div className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleSection("kingPosts")}
                          className="w-full flex items-center justify-between p-4 bg-muted hover:bg-muted/80 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {expandedSections["kingPosts"] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <div className="text-left">
                              <h4 className="font-semibold">
                                {breakdown.kingPosts.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {breakdown.kingPosts.sizeXxY} mm
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {formatLength(
                              breakdown.kingPosts.totalLengthWithWastageM
                            )}
                          </Badge>
                        </button>
                        {expandedSections["kingPosts"] && (
                          <div className="p-4 border-t space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">
                                  Length per Truss:
                                </span>
                                <p>
                                  {formatLength(
                                    breakdown.kingPosts.lengthPerPieceM
                                  )}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Base Length:</span>
                                <p>
                                  {formatLength(
                                    breakdown.kingPosts.totalLengthM
                                  )}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">With Wastage:</span>
                                <p>
                                  {formatLength(
                                    breakdown.kingPosts.totalLengthWithWastageM
                                  )}
                                </p>
                              </div>
                              <div>
                                <span className="font-medium">Wastage:</span>
                                <p>
                                  {formatLength(
                                    breakdown.kingPosts.wasteageAllowanceM
                                  )}
                                </p>
                              </div>
                            </div>
                            {breakdown.kingPosts.unitPrice !== undefined && (
                              <div className="border-t pt-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Price per Unit:</span>
                                    <p className="text-blue-600 dark:text-blue-400 font-semibold">
                                      {formatCurrency(breakdown.kingPosts.unitPrice)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Total (Base):</span>
                                    <p className="text-green-600 dark:text-green-400 font-semibold">
                                      {formatCurrency(breakdown.kingPosts.totalPrice || 0)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Total (with Wastage):</span>
                                    <p className="text-orange-600 dark:text-orange-400 font-semibold text-lg">
                                      {formatCurrency(breakdown.kingPosts.totalPriceWithWastage || 0)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rafters */}
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection("rafters")}
                        className="w-full flex items-center justify-between p-4 bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedSections["rafters"] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <div className="text-left">
                            <h4 className="font-semibold">
                              {breakdown.rafters.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {breakdown.rafters.sizeXxY} mm
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {formatLength(breakdown.rafters.totalLengthWithWastageM)}
                        </Badge>
                      </button>
                      {expandedSections["rafters"] && (
                        <div className="p-4 border-t space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Quantity:</span>
                              <p>{breakdown.rafters.quantityPcs} pcs</p>
                            </div>
                            <div>
                              <span className="font-medium">Each Length:</span>
                              <p>
                                {formatLength(
                                  breakdown.rafters.lengthPerPieceM
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Total:</span>
                              <p>
                                {formatLength(breakdown.rafters.totalLengthM)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">With Wastage:</span>
                              <p>
                                {formatLength(
                                  breakdown.rafters.totalLengthWithWastageM
                                )}
                              </p>
                            </div>
                          </div>
                          {breakdown.rafters.unitPrice !== undefined && (
                            <div className="border-t pt-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Price per Unit:</span>
                                  <p className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {formatCurrency(breakdown.rafters.unitPrice)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Total (Base):</span>
                                  <p className="text-green-600 dark:text-green-400 font-semibold">
                                    {formatCurrency(breakdown.rafters.totalPrice || 0)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Total (with Wastage):</span>
                                  <p className="text-orange-600 dark:text-orange-400 font-semibold text-lg">
                                    {formatCurrency(breakdown.rafters.totalPriceWithWastage || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Purlins */}
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection("purlins")}
                        className="w-full flex items-center justify-between p-4 bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedSections["purlins"] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <div className="text-left">
                            <h4 className="font-semibold">
                              {breakdown.purlins.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {breakdown.purlins.sizeXxY} mm
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {formatLength(breakdown.purlins.totalLengthWithWastageM)}
                        </Badge>
                      </button>
                      {expandedSections["purlins"] && (
                        <div className="p-4 border-t space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Base Length:</span>
                              <p>
                                {formatLength(breakdown.purlins.totalLengthM)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">With Wastage:</span>
                              <p>
                                {formatLength(
                                  breakdown.purlins.totalLengthWithWastageM
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Wastage:</span>
                              <p>
                                {formatLength(breakdown.purlins.wasteageAllowanceM)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Unit:</span>
                              <p>{breakdown.purlins.unitLm}</p>
                            </div>
                          </div>
                          {breakdown.purlins.unitPrice !== undefined && (
                            <div className="border-t pt-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Price per Unit:</span>
                                  <p className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {formatCurrency(breakdown.purlins.unitPrice)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Total (Base):</span>
                                  <p className="text-green-600 dark:text-green-400 font-semibold">
                                    {formatCurrency(breakdown.purlins.totalPrice || 0)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Total (with Wastage):</span>
                                  <p className="text-orange-600 dark:text-orange-400 font-semibold text-lg">
                                    {formatCurrency(breakdown.purlins.totalPriceWithWastage || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Struts */}
                    <div className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection("struts")}
                        className="w-full flex items-center justify-between p-4 bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {expandedSections["struts"] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <div className="text-left">
                            <h4 className="font-semibold">
                              {breakdown.struts.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {breakdown.struts.sizeXxY} mm
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {formatLength(breakdown.struts.totalLengthWithWastageM)}
                        </Badge>
                      </button>
                      {expandedSections["struts"] && (
                        <div className="p-4 border-t space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Quantity:</span>
                              <p>{breakdown.struts.quantityPcs} pcs</p>
                            </div>
                            <div>
                              <span className="font-medium">Each Length:</span>
                              <p>
                                {formatLength(
                                  breakdown.struts.lengthPerPieceM
                                )}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Total:</span>
                              <p>
                                {formatLength(breakdown.struts.totalLengthM)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">With Wastage:</span>
                              <p>
                                {formatLength(
                                  breakdown.struts.totalLengthWithWastageM
                                )}
                              </p>
                            </div>
                          </div>
                          {breakdown.struts.unitPrice !== undefined && (
                            <div className="border-t pt-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Price per Unit:</span>
                                  <p className="text-blue-600 dark:text-blue-400 font-semibold">
                                    {formatCurrency(breakdown.struts.unitPrice)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Total (Base):</span>
                                  <p className="text-green-600 dark:text-green-400 font-semibold">
                                    {formatCurrency(breakdown.struts.totalPrice || 0)}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Total (with Wastage):</span>
                                  <p className="text-orange-600 dark:text-orange-400 font-semibold text-lg">
                                    {formatCurrency(breakdown.struts.totalPriceWithWastage || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timber Pricing Summary */}
                  {(breakdown.wallPlates.totalPrice !== undefined || breakdown.tieBeams.totalPrice !== undefined) && (
                    <div className="mt-8 pt-8 border-t">
                      <Label className="text-lg font-semibold mb-4 block">
                        Timber Costs Summary
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Base Costs (before wastage)</h4>
                          <div className="space-y-2 text-sm">
                            {breakdown.wallPlates.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>Wall Plates:</span>
                                <span className="font-medium">{formatCurrency(breakdown.wallPlates.totalPrice)}</span>
                              </div>
                            )}
                            {breakdown.tieBeams.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>Tie Beams:</span>
                                <span className="font-medium">{formatCurrency(breakdown.tieBeams.totalPrice)}</span>
                              </div>
                            )}
                            {breakdown.kingPosts?.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>King Posts:</span>
                                <span className="font-medium">{formatCurrency(breakdown.kingPosts.totalPrice)}</span>
                              </div>
                            )}
                            {breakdown.rafters.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>Rafters:</span>
                                <span className="font-medium">{formatCurrency(breakdown.rafters.totalPrice)}</span>
                              </div>
                            )}
                            {breakdown.purlins.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>Purlins:</span>
                                <span className="font-medium">{formatCurrency(breakdown.purlins.totalPrice)}</span>
                              </div>
                            )}
                            {breakdown.struts.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>Struts:</span>
                                <span className="font-medium">{formatCurrency(breakdown.struts.totalPrice)}</span>
                              </div>
                            )}
                          </div>
                          {breakdown.wallPlates.totalPrice !== undefined && (
                            <div className="border-t pt-3 mt-3">
                              <div className="flex justify-between font-semibold">
                                <span>Subtotal:</span>
                                <span className="text-green-600 dark:text-green-400">
                                  {formatCurrency(
                                    (breakdown.wallPlates.totalPrice || 0) +
                                    (breakdown.tieBeams.totalPrice || 0) +
                                    (breakdown.kingPosts?.totalPrice || 0) +
                                    (breakdown.rafters.totalPrice || 0) +
                                    (breakdown.purlins.totalPrice || 0) +
                                    (breakdown.struts.totalPrice || 0)
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">With Wastage ({breakdown.defaults.structuralTimberWastagePercent}%)</h4>
                          <div className="space-y-2 text-sm">
                            {breakdown.wallPlates.totalPriceWithWastage !== undefined && (
                              <div className="flex justify-between">
                                <span>Wall Plates:</span>
                                <span className="font-medium">{formatCurrency(breakdown.wallPlates.totalPriceWithWastage)}</span>
                              </div>
                            )}
                            {breakdown.tieBeams.totalPriceWithWastage !== undefined && (
                              <div className="flex justify-between">
                                <span>Tie Beams:</span>
                                <span className="font-medium">{formatCurrency(breakdown.tieBeams.totalPriceWithWastage)}</span>
                              </div>
                            )}
                            {breakdown.kingPosts?.totalPriceWithWastage !== undefined && (
                              <div className="flex justify-between">
                                <span>King Posts:</span>
                                <span className="font-medium">{formatCurrency(breakdown.kingPosts.totalPriceWithWastage)}</span>
                              </div>
                            )}
                            {breakdown.rafters.totalPriceWithWastage !== undefined && (
                              <div className="flex justify-between">
                                <span>Rafters:</span>
                                <span className="font-medium">{formatCurrency(breakdown.rafters.totalPriceWithWastage)}</span>
                              </div>
                            )}
                            {breakdown.purlins.totalPriceWithWastage !== undefined && (
                              <div className="flex justify-between">
                                <span>Purlins:</span>
                                <span className="font-medium">{formatCurrency(breakdown.purlins.totalPriceWithWastage)}</span>
                              </div>
                            )}
                            {breakdown.struts.totalPriceWithWastage !== undefined && (
                              <div className="flex justify-between">
                                <span>Struts:</span>
                                <span className="font-medium">{formatCurrency(breakdown.struts.totalPriceWithWastage)}</span>
                              </div>
                            )}
                          </div>
                          {breakdown.wallPlates.totalPriceWithWastage !== undefined && (
                            <div className="border-t pt-3 mt-3 bg-orange-50 dark:bg-orange-950 p-3 rounded">
                              <div className="flex justify-between font-bold text-orange-600 dark:text-orange-400">
                                <span>Total:</span>
                                <span className="text-lg">
                                  {formatCurrency(
                                    (breakdown.wallPlates.totalPriceWithWastage || 0) +
                                    (breakdown.tieBeams.totalPriceWithWastage || 0) +
                                    (breakdown.kingPosts?.totalPriceWithWastage || 0) +
                                    (breakdown.rafters.totalPriceWithWastage || 0) +
                                    (breakdown.purlins.totalPriceWithWastage || 0) +
                                    (breakdown.struts.totalPriceWithWastage || 0)
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roofing Tab */}
            <TabsContent value="roofing">
              <Card>
                <CardHeader>
                  <CardTitle>Roofing Sheets</CardTitle>
                  <CardDescription>
                    Sheet quantities include{" "}
                    {breakdown.roofingSheets.wastageAllowancePercent}% wastage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Label className="text-base font-semibold block mb-3">
                          Sheet Specifications
                        </Label>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Cover Width:</span>
                            <p className="text-muted-foreground">
                              {formatLength(
                                breakdown.roofingSheets.sheetCoverAreaM2 /
                                  inputs.roofingSheetLengthM
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Sheet Length:</span>
                            <p className="text-muted-foreground">
                              {formatLength(inputs.roofingSheetLengthM)}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Cover Area:</span>
                            <p className="text-muted-foreground">
                              {formatArea(
                                breakdown.roofingSheets.sheetCoverAreaM2
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <Label className="text-base font-semibold block mb-3">
                          Quantity Calculation
                        </Label>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">
                              Effective Roof Area:
                            </span>
                            <p className="text-muted-foreground">
                              {formatArea(
                                breakdown.geometry.effectiveRoofAreaM2
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">
                              Base Quantity:
                            </span>
                            <p className="text-muted-foreground">
                              {breakdown.roofingSheets.quantityRequired} pcs
                            </p>
                          </div>
                          <div className="pt-2 border-t">
                            <span className="font-semibold">With Wastage:</span>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              {breakdown.roofingSheets
                                .quantityWithWastagePercent} pcs
                            </p>
                          </div>
                        </div>
                      </div>
                      {breakdown.roofingSheets.unitPrice !== undefined && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                          <Label className="text-base font-semibold block mb-3">
                            Pricing
                          </Label>
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium">Price per Sheet:</span>
                              <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                                {formatCurrency(breakdown.roofingSheets.unitPrice)}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Total (Base Quantity):</span>
                              <p className="text-green-600 dark:text-green-400 font-semibold text-lg">
                                {formatCurrency(breakdown.roofingSheets.totalPrice || 0)}
                              </p>
                            </div>
                            <div className="border-t pt-3">
                              <span className="font-semibold\">Total (with Wastage):</span>
                              <p className="text-orange-600 dark:text-orange-400 font-bold text-xl">
                                {formatCurrency(breakdown.roofingSheets.totalPriceWithWastage || 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Roofing Sheets Pricing Summary */}
                  {breakdown.roofingSheets.totalPrice !== undefined && (
                    <div className="mt-8 pt-8 border-t">
                      <Label className="text-lg font-semibold mb-4 block">
                        Roofing Sheets Cost Summary
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-semibold text-sm mb-3">Base Cost</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span className="font-medium">{breakdown.roofingSheets.quantityRequired} sheets</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price per Sheet:</span>
                              <span className="font-medium">{formatCurrency(breakdown.roofingSheets.unitPrice || 0)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between font-semibold text-blue-600 dark:text-blue-400">
                                <span>Subtotal:</span>
                                <span>
                                  {formatCurrency(breakdown.roofingSheets.totalPrice || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h4 className="font-semibold text-sm mb-3">With Wastage ({breakdown.roofingSheets.wastageAllowancePercent}%)</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span className="font-medium">{breakdown.roofingSheets.quantityWithWastagePercent} sheets</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price per Sheet:</span>
                              <span className="font-medium">{formatCurrency(breakdown.roofingSheets.unitPrice || 0)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between font-bold text-orange-600 dark:text-orange-400 text-lg">
                                <span>Total:</span>
                                <span className="">
                                  {formatCurrency(breakdown.roofingSheets.totalPriceWithWastage || 0)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Material Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Total Costs Summary */}
                    {breakdown.totalCost !== undefined && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                          <Label className="text-sm font-medium text-green-700 dark:text-green-300">
                            Total Cost (Base)
                          </Label>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                            {formatCurrency(breakdown.totalCost)}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Without wastage factor
                          </p>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                          <Label className="text-sm font-medium text-orange-700 dark:text-orange-300">
                            Total Cost (with Wastage)
                          </Label>
                          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                            {formatCurrency(breakdown.totalCostWithWastage || 0)}
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Including material wastage
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Key Inputs Summary */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        Building Inputs Used
                      </Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg text-sm">
                        <div>
                          <span className="font-medium">Footprint:</span>
                          <p>{formatArea(inputs.footprintAreaM2)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Perimeter:</span>
                          <p>{formatLength(inputs.externalPerimeterM)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Dimensions:</span>
                          <p>
                            {inputs.buildingLengthM}m × {inputs.buildingWidthM}m
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Complete Material List */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        All Materials Required
                      </Label>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Material</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead className="text-right">
                                Quantity
                              </TableHead>
                              <TableHead className="text-right">Unit</TableHead>
                              <TableHead className="text-right">Wastage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">
                                Wall Plates
                              </TableCell>
                              <TableCell>
                                {breakdown.wallPlates.sizeXxY}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.wallPlates.totalLengthM,
                                  1
                                )}
                              </TableCell>
                              <TableCell className="text-right">m</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.wallPlates.wasteageAllowanceM,
                                  2
                                )}
                                m
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Tie Beams
                              </TableCell>
                              <TableCell>
                                {breakdown.tieBeams.sizeXxY}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.tieBeams.totalLengthM,
                                  1
                                )}
                              </TableCell>
                              <TableCell className="text-right">m</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.tieBeams.wasteageAllowanceM,
                                  2
                                )}
                                m
                              </TableCell>
                            </TableRow>
                            {breakdown.kingPosts && (
                              <TableRow>
                                <TableCell className="font-medium">
                                  King Posts
                                </TableCell>
                                <TableCell>
                                  {breakdown.kingPosts.sizeXxY}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatNumber(
                                    breakdown.kingPosts.totalLengthM,
                                    1
                                  )}
                                </TableCell>
                                <TableCell className="text-right">m</TableCell>
                                <TableCell className="text-right">
                                  {formatNumber(
                                    breakdown.kingPosts.wasteageAllowanceM,
                                    2
                                  )}
                                  m
                                </TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell className="font-medium">
                                Rafters
                              </TableCell>
                              <TableCell>
                                {breakdown.rafters.sizeXxY}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.rafters.totalLengthM,
                                  1
                                )}
                              </TableCell>
                              <TableCell className="text-right">m</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.rafters.wasteageAllowanceM,
                                  2
                                )}
                                m
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Purlins
                              </TableCell>
                              <TableCell>
                                {breakdown.purlins.sizeXxY}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.purlins.totalLengthM,
                                  1
                                )}
                              </TableCell>
                              <TableCell className="text-right">m</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.purlins.wasteageAllowanceM,
                                  2
                                )}
                                m
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Struts
                              </TableCell>
                              <TableCell>
                                {breakdown.struts.sizeXxY}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.struts.totalLengthM,
                                  1
                                )}
                              </TableCell>
                              <TableCell className="text-right">m</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.struts.wasteageAllowanceM,
                                  2
                                )}
                                m
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-blue-50 dark:bg-blue-950 font-semibold">
                              <TableCell>Roofing Sheets</TableCell>
                              <TableCell>-</TableCell>
                              <TableCell className="text-right">
                                {
                                  breakdown.roofingSheets
                                    .quantityWithWastagePercent
                                }
                              </TableCell>
                              <TableCell className="text-right">pcs</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.roofingSheets
                                    .quantityWithWastagePercent -
                                    breakdown.roofingSheets.quantityRequired,
                                  0
                                )}{" "}
                                pcs
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Miscellaneous Allowance Note */}
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800 flex gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">
                          Miscellaneous Allowance
                        </p>
                        <p className="text-yellow-800 dark:text-yellow-200">
                          An additional{" "}
                          {breakdown.miscellaneousAllowancePercent}% allowance
                          has been applied to all material quantities.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}