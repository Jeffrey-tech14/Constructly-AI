// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useCallback, useMemo, useEffect } from "react";
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
  Ruler,
  Home,
  HardDrive,
} from "lucide-react";
import useRoofingCalculator, {
  BuildingInputs,
  RoofMaterialBreakdown,
  RoofDefaults,
  syncRoofingFromSlabGeometry,
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
    setQuoteData,
  );

  // State for building inputs
  const [inputs, setInputs] = useState<BuildingInputs>({
    footprintAreaM2: 0,
    externalPerimeterM: 0,
    roofTrussTypeKingPost: true,
    purlinSpacingM: 1.2,
    roofingSheetEffectiveCoverWidthM: 1.0,
    roofingSheetLengthM: 3.0,
    roofType: "gable",
    pitchDegrees: 25,
    eaveWidthM: 0.8,
    rasterSpacingMm: 600,
    trussSpacingMm: 600,
  });

  const [breakdown, setBreakdown] = useState<RoofMaterialBreakdown | null>(
    null,
  );
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    geometry: true,
    timbers: true,
    roofing: true,
  });

  const [isSynced, setIsSynced] = useState(false);
  const [syncedFromSlab, setSyncedFromSlab] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Auto-sync roofing geometry from slab
  useEffect(() => {
    if (quote?.concrete_rows && quote?.wallDimensions) {
      const slabRow = quote.concrete_rows.find(
        (r: any) =>
          r.element === "slab" && r.name?.toLowerCase().includes("ground"),
      );
      const slabArea =
        slabRow?.slabArea || quote.concrete_rows[0]?.slabArea || 0;
      const externalPerimeter =
        quote.wallDimensions?.externalWallPerimiter || 0;

      if (slabArea > 0 && externalPerimeter > 0) {
        const synced = syncRoofingFromSlabGeometry(slabArea, externalPerimeter);
        setInputs((prev) => ({
          ...prev,
          footprintAreaM2: synced.roofingAreaM2,
          externalPerimeterM: synced.roofingPerimeterM,
        }));
        setIsSynced(true);
        setSyncedFromSlab(true);
      }
    }
  }, [quote?.concrete_rows, quote?.wallDimensions]);

  const handleInputChange = useCallback(
    (field: keyof BuildingInputs, value: any) => {
      setInputs((prev) => ({ ...prev, [field]: value }));
      setValidationErrors([]);
    },
    [],
  );

  const validateInputs = useCallback((): boolean => {
    const errors: string[] = [];
    if (inputs.footprintAreaM2 <= 0)
      errors.push("Footprint Area must be greater than 0");
    if (inputs.externalPerimeterM <= 0)
      errors.push("External Perimeter must be greater than 0");
    if (inputs.pitchDegrees <= 0)
      errors.push("Roof Pitch must be greater than 0");
    if (inputs.eaveWidthM <= 0)
      errors.push("Eave Width must be greater than 0");
    if (inputs.rasterSpacingMm <= 0)
      errors.push("Rafter Spacing must be greater than 0");
    if (inputs.trussSpacingMm <= 0)
      errors.push("Truss Spacing must be greater than 0");
    if (inputs.purlinSpacingM <= 0)
      errors.push("Purlin Spacing must be greater than 0");
    if (inputs.roofingSheetEffectiveCoverWidthM <= 0)
      errors.push("Sheet Effective Cover Width must be greater than 0");
    if (inputs.roofingSheetLengthM <= 0)
      errors.push("Sheet Standard Length must be greater than 0");
    if (!inputs.roofType || inputs.roofType.trim() === "")
      errors.push("Roof Type must be selected");
    setValidationErrors(errors);
    return errors.length === 0;
  }, [inputs]);

  const handleCalculate = useCallback(() => {
    if (!validateInputs()) return;
    try {
      const result = calculateRoofMaterials(inputs);
      setBreakdown(result);
      onCalculationResult?.(result);
      setQuoteData?.((prev: any) => ({
        ...prev,
        roof_structures: result,
      }));
    } catch (error) {
      console.error("Calculation error:", error);
      setValidationErrors([
        "An error occurred during calculation. Please check your inputs.",
      ]);
    }
  }, [
    inputs,
    calculateRoofMaterials,
    onCalculationResult,
    setQuoteData,
    validateInputs,
  ]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const formatNumber = (value: number, decimals = 2) => value.toFixed(decimals);
  const formatArea = (area: number) => `${formatNumber(area, 2)} m²`;
  const formatLength = (length: number) => `${formatNumber(length, 2)} m`;
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
      <Card className="border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Home className="h-5 w-5 text-primary" />
            Building Dimensions
          </CardTitle>
          <CardDescription>
            Enter building and roof parameters for material calculation
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-6">
          {/* Building Parameters */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Building Parameters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="footprint-area">Footprint Area (m²)</Label>
                <Input
                  id="footprint-area"
                  type="number"
                  min="0"
                  step="0.1"
                  value={inputs.footprintAreaM2}
                  onChange={(e) =>
                    !isSynced &&
                    handleInputChange(
                      "footprintAreaM2",
                      parseFloat(e.target.value) || 0,
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
                    !isSynced &&
                    handleInputChange(
                      "externalPerimeterM",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Roof Parameters */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Roof Parameters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="roof-type">Roof Type</Label>
                <Select
                  value={inputs.roofType || "gable"}
                  onValueChange={(value) =>
                    handleInputChange("roofType", value)
                  }
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
                      parseFloat(e.target.value) || 0,
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
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Checkbox
                  id="king-post"
                  checked={inputs.roofTrussTypeKingPost}
                  onCheckedChange={(checked) =>
                    handleInputChange("roofTrussTypeKingPost", checked)
                  }
                />
                <Label htmlFor="king-post" className="cursor-pointer text-sm">
                  King Post Truss
                </Label>
              </div>
            </div>
          </div>

          {/* Spacing & Dimensions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Spacing & Dimensions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      parseInt(e.target.value) || 0,
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
                      parseInt(e.target.value) || 0,
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
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* Roofing Sheet Specifications */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Roofing Sheet Specifications
            </h4>
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
                      parseFloat(value),
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
                <Label htmlFor="sheet-length">Sheet Standard Length</Label>
                <Select
                  value={inputs.roofingSheetLengthM.toString()}
                  onValueChange={(value) =>
                    handleInputChange("roofingSheetLengthM", parseFloat(value))
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
              <div className="text-xs text-muted-foreground flex items-end pb-2">
                <span>
                  Total Width Range: 1050mm - 1130mm
                  <br />
                  (automatically selected based on cover width)
                </span>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20 flex gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-2">
                  Please correct the following errors:
                </p>
                <ul className="list-disc list-inside text-destructive space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Calculate Button */}
          <div className="flex justify-end pt-4 border-t border-border">
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
            {[
              {
                label: "Projected Roof Area",
                value: formatArea(breakdown.geometry.projectedRoofAreaM2),
                sub: "(with eaves)",
              },
              {
                label: "Effective Sloped Area",
                value: formatArea(breakdown.geometry.effectiveRoofAreaM2),
                sub: "(accounting for pitch)",
              },
              {
                label: "Rafter Length",
                value: formatLength(breakdown.geometry.rasterLengthM),
                sub: "(per side)",
              },
              {
                label: "Roof Pitch",
                value: `${breakdown.defaults.pitchDegrees}°`,
                sub: `${(breakdown.geometry.pitchRadians * (180 / Math.PI)).toFixed(1)}° in radians`,
              },
            ].map((item, idx) => (
              <Card key={idx} className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {item.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {item.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.sub}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Defaults Used */}
          <Card className="border-border">
            <CardHeader className="border-b border-border bg-muted/30">
              <CardTitle className="text-sm font-medium text-foreground">
                Defaults Applied
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Structural Timber Breakdown</CardTitle>
                  <CardDescription>
                    All timbers include{" "}
                    {breakdown.defaults.structuralTimberWastagePercent}% wastage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Wall Plates */}
                  <TimberSection
                    title={breakdown.wallPlates.name}
                    size={breakdown.wallPlates.sizeXxY}
                    data={breakdown.wallPlates}
                    unitLabel="length"
                    formatValue={formatLength}
                    expanded={expandedSections["wallPlates"]}
                    onToggle={() => toggleSection("wallPlates")}
                    formatCurrency={formatCurrency}
                  />
                  {/* Tie Beams */}
                  <TimberSection
                    title={breakdown.tieBeams.name}
                    size={breakdown.tieBeams.sizeXxY}
                    data={breakdown.tieBeams}
                    unitLabel="length"
                    formatValue={formatLength}
                    expanded={expandedSections["tieBeams"]}
                    onToggle={() => toggleSection("tieBeams")}
                    formatCurrency={formatCurrency}
                  />
                  {/* King Posts */}
                  {breakdown.kingPosts && (
                    <TimberSection
                      title={breakdown.kingPosts.name}
                      size={breakdown.kingPosts.sizeXxY}
                      data={breakdown.kingPosts}
                      unitLabel="length"
                      formatValue={formatLength}
                      expanded={expandedSections["kingPosts"]}
                      onToggle={() => toggleSection("kingPosts")}
                      formatCurrency={formatCurrency}
                    />
                  )}
                  {/* Rafters */}
                  <TimberSection
                    title={breakdown.rafters.name}
                    size={breakdown.rafters.sizeXxY}
                    data={breakdown.rafters}
                    unitLabel="length"
                    formatValue={formatLength}
                    expanded={expandedSections["rafters"]}
                    onToggle={() => toggleSection("rafters")}
                    formatCurrency={formatCurrency}
                  />
                  {/* Purlins */}
                  <TimberSection
                    title={breakdown.purlins.name}
                    size={breakdown.purlins.sizeXxY}
                    data={breakdown.purlins}
                    unitLabel="length"
                    formatValue={formatLength}
                    expanded={expandedSections["purlins"]}
                    onToggle={() => toggleSection("purlins")}
                    formatCurrency={formatCurrency}
                  />
                  {/* Struts */}
                  <TimberSection
                    title={breakdown.struts.name}
                    size={breakdown.struts.sizeXxY}
                    data={breakdown.struts}
                    unitLabel="length"
                    formatValue={formatLength}
                    expanded={expandedSections["struts"]}
                    onToggle={() => toggleSection("struts")}
                    formatCurrency={formatCurrency}
                  />

                  {/* Timber Pricing Summary */}
                  {(breakdown.wallPlates.totalPrice !== undefined ||
                    breakdown.tieBeams.totalPrice !== undefined) && (
                    <div className="mt-8 pt-8 border-t border-border">
                      <h4 className="text-sm font-medium mb-4">
                        Timber Costs Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h5 className="text-xs font-medium text-muted-foreground">
                            Base Costs (before wastage)
                          </h5>
                          <div className="space-y-2 text-sm">
                            {breakdown.wallPlates.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>Wall Plates:</span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    breakdown.wallPlates.totalPrice,
                                  )}
                                </span>
                              </div>
                            )}
                            {breakdown.tieBeams.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>Tie Beams:</span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    breakdown.tieBeams.totalPrice,
                                  )}
                                </span>
                              </div>
                            )}
                            {breakdown.kingPosts?.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>King Posts:</span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    breakdown.kingPosts.totalPrice,
                                  )}
                                </span>
                              </div>
                            )}
                            {breakdown.rafters.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>Rafters:</span>
                                <span className="font-medium">
                                  {formatCurrency(breakdown.rafters.totalPrice)}
                                </span>
                              </div>
                            )}
                            {breakdown.purlins.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>Purlins:</span>
                                <span className="font-medium">
                                  {formatCurrency(breakdown.purlins.totalPrice)}
                                </span>
                              </div>
                            )}
                            {breakdown.struts.totalPrice !== undefined && (
                              <div className="flex justify-between">
                                <span>Struts:</span>
                                <span className="font-medium">
                                  {formatCurrency(breakdown.struts.totalPrice)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-border pt-2 mt-2">
                            <div className="flex justify-between font-medium">
                              <span>Subtotal:</span>
                              <span className="text-primary">
                                {formatCurrency(
                                  (breakdown.wallPlates.totalPrice || 0) +
                                    (breakdown.tieBeams.totalPrice || 0) +
                                    (breakdown.kingPosts?.totalPrice || 0) +
                                    (breakdown.rafters.totalPrice || 0) +
                                    (breakdown.purlins.totalPrice || 0) +
                                    (breakdown.struts.totalPrice || 0),
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h5 className="text-xs font-medium text-muted-foreground">
                            With Wastage (
                            {breakdown.defaults.structuralTimberWastagePercent}
                            %)
                          </h5>
                          <div className="space-y-2 text-sm">
                            {breakdown.wallPlates.totalPriceWithWastage !==
                              undefined && (
                              <div className="flex justify-between">
                                <span>Wall Plates:</span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    breakdown.wallPlates.totalPriceWithWastage,
                                  )}
                                </span>
                              </div>
                            )}
                            {breakdown.tieBeams.totalPriceWithWastage !==
                              undefined && (
                              <div className="flex justify-between">
                                <span>Tie Beams:</span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    breakdown.tieBeams.totalPriceWithWastage,
                                  )}
                                </span>
                              </div>
                            )}
                            {breakdown.kingPosts?.totalPriceWithWastage !==
                              undefined && (
                              <div className="flex justify-between">
                                <span>King Posts:</span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    breakdown.kingPosts.totalPriceWithWastage,
                                  )}
                                </span>
                              </div>
                            )}
                            {breakdown.rafters.totalPriceWithWastage !==
                              undefined && (
                              <div className="flex justify-between">
                                <span>Rafters:</span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    breakdown.rafters.totalPriceWithWastage,
                                  )}
                                </span>
                              </div>
                            )}
                            {breakdown.purlins.totalPriceWithWastage !==
                              undefined && (
                              <div className="flex justify-between">
                                <span>Purlins:</span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    breakdown.purlins.totalPriceWithWastage,
                                  )}
                                </span>
                              </div>
                            )}
                            {breakdown.struts.totalPriceWithWastage !==
                              undefined && (
                              <div className="flex justify-between">
                                <span>Struts:</span>
                                <span className="font-medium">
                                  {formatCurrency(
                                    breakdown.struts.totalPriceWithWastage,
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="border-t border-border pt-2 mt-2 bg-muted/30 p-3 rounded">
                            <div className="flex justify-between font-bold text-foreground">
                              <span>Total:</span>
                              <span className="text-primary text-lg">
                                {formatCurrency(
                                  (breakdown.wallPlates.totalPriceWithWastage ||
                                    0) +
                                    (breakdown.tieBeams.totalPriceWithWastage ||
                                      0) +
                                    (breakdown.kingPosts
                                      ?.totalPriceWithWastage || 0) +
                                    (breakdown.rafters.totalPriceWithWastage ||
                                      0) +
                                    (breakdown.purlins.totalPriceWithWastage ||
                                      0) +
                                    (breakdown.struts.totalPriceWithWastage ||
                                      0),
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roofing Tab */}
            <TabsContent value="roofing">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Roofing Sheets</CardTitle>
                  <CardDescription>
                    Sheet quantities include{" "}
                    {breakdown.roofingSheets.wastageAllowancePercent}% wastage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Specifications */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <h4 className="text-sm font-medium mb-3">
                        Sheet Specifications
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Cover Width:</span>
                          <p className="text-muted-foreground">
                            {formatLength(
                              breakdown.roofingSheets.sheetCoverAreaM2 /
                                inputs.roofingSheetLengthM,
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
                              breakdown.roofingSheets.sheetCoverAreaM2,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Calculation */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <h4 className="text-sm font-medium mb-3">
                        Quantity Calculation
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">
                            Effective Roof Area:
                          </span>
                          <p className="text-muted-foreground">
                            {formatArea(breakdown.geometry.effectiveRoofAreaM2)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Base Quantity:</span>
                          <p className="text-muted-foreground">
                            {breakdown.roofingSheets.quantityRequired} pcs
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <span className="font-medium">With Wastage:</span>
                          <p className="text-primary font-medium">
                            {breakdown.roofingSheets.quantityWithWastagePercent}{" "}
                            pcs
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    {breakdown.roofingSheets.unitPrice !== undefined && (
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <h4 className="text-sm font-medium mb-3">Pricing</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-medium">
                              Price per Sheet:
                            </span>
                            <p className="text-primary font-medium">
                              {formatCurrency(
                                breakdown.roofingSheets.unitPrice,
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">
                              Total (Base Quantity):
                            </span>
                            <p className="text-primary font-medium">
                              {formatCurrency(
                                breakdown.roofingSheets.totalPrice || 0,
                              )}
                            </p>
                          </div>
                          <div className="border-t border-border pt-2">
                            <span className="font-medium">
                              Total (with Wastage):
                            </span>
                            <p className="text-primary font-bold text-lg">
                              {formatCurrency(
                                breakdown.roofingSheets.totalPriceWithWastage ||
                                  0,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Roofing Sheets Cost Summary */}
                  {breakdown.roofingSheets.totalPrice !== undefined && (
                    <div className="mt-8 pt-8 border-t border-border">
                      <h4 className="text-sm font-medium mb-4">
                        Roofing Sheets Cost Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                          <h5 className="text-xs font-medium text-muted-foreground mb-3">
                            Base Cost
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span className="font-medium">
                                {breakdown.roofingSheets.quantityRequired}{" "}
                                sheets
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price per Sheet:</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  breakdown.roofingSheets.unitPrice || 0,
                                )}
                              </span>
                            </div>
                            <div className="border-t border-border pt-2 mt-2">
                              <div className="flex justify-between font-medium">
                                <span>Subtotal:</span>
                                <span className="text-primary">
                                  {formatCurrency(
                                    breakdown.roofingSheets.totalPrice || 0,
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                          <h5 className="text-xs font-medium text-muted-foreground mb-3">
                            With Wastage (
                            {breakdown.roofingSheets.wastageAllowancePercent}%)
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span className="font-medium">
                                {
                                  breakdown.roofingSheets
                                    .quantityWithWastagePercent
                                }{" "}
                                sheets
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price per Sheet:</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  breakdown.roofingSheets.unitPrice || 0,
                                )}
                              </span>
                            </div>
                            <div className="border-t border-border pt-2 mt-2">
                              <div className="flex justify-between font-bold">
                                <span>Total:</span>
                                <span className="text-primary">
                                  {formatCurrency(
                                    breakdown.roofingSheets
                                      .totalPriceWithWastage || 0,
                                  )}
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
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Complete Material Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Total Costs Summary */}
                    {breakdown.totalCost !== undefined && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                          <p className="text-sm font-medium text-muted-foreground">
                            Total Cost (Base)
                          </p>
                          <p className="text-3xl font-bold text-primary mt-2">
                            {formatCurrency(breakdown.totalCost)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Without wastage factor
                          </p>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                          <p className="text-sm font-medium text-muted-foreground">
                            Total Cost (with Wastage)
                          </p>
                          <p className="text-3xl font-bold text-primary mt-2">
                            {formatCurrency(
                              breakdown.totalCostWithWastage || 0,
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Including material wastage
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Key Inputs Summary */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">
                        Building Inputs Used
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg text-sm">
                        <div>
                          <span className="font-medium">Footprint:</span>
                          <p>{formatArea(inputs.footprintAreaM2)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Perimeter:</span>
                          <p>{formatLength(inputs.externalPerimeterM)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Complete Material List */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">
                        All Materials Required
                      </h4>
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/30">
                            <TableRow>
                              <TableHead>Material</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead className="text-right">
                                Quantity
                              </TableHead>
                              <TableHead className="text-right">Unit</TableHead>
                              <TableHead className="text-right">
                                Wastage
                              </TableHead>
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
                                  1,
                                )}
                              </TableCell>
                              <TableCell className="text-right">m</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.wallPlates.wasteageAllowanceM,
                                  2,
                                )}{" "}
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
                                  1,
                                )}
                              </TableCell>
                              <TableCell className="text-right">m</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.tieBeams.wasteageAllowanceM,
                                  2,
                                )}{" "}
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
                                    1,
                                  )}
                                </TableCell>
                                <TableCell className="text-right">m</TableCell>
                                <TableCell className="text-right">
                                  {formatNumber(
                                    breakdown.kingPosts.wasteageAllowanceM,
                                    2,
                                  )}{" "}
                                  m
                                </TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell className="font-medium">
                                Rafters
                              </TableCell>
                              <TableCell>{breakdown.rafters.sizeXxY}</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.rafters.totalLengthM,
                                  1,
                                )}
                              </TableCell>
                              <TableCell className="text-right">m</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.rafters.wasteageAllowanceM,
                                  2,
                                )}{" "}
                                m
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Purlins
                              </TableCell>
                              <TableCell>{breakdown.purlins.sizeXxY}</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.purlins.totalLengthM,
                                  1,
                                )}
                              </TableCell>
                              <TableCell className="text-right">m</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.purlins.wasteageAllowanceM,
                                  2,
                                )}{" "}
                                m
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">
                                Struts
                              </TableCell>
                              <TableCell>{breakdown.struts.sizeXxY}</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(breakdown.struts.totalLengthM, 1)}
                              </TableCell>
                              <TableCell className="text-right">m</TableCell>
                              <TableCell className="text-right">
                                {formatNumber(
                                  breakdown.struts.wasteageAllowanceM,
                                  2,
                                )}{" "}
                                m
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-muted/10">
                              <TableCell className="font-medium">
                                Roofing Sheets
                              </TableCell>
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
                                  0,
                                )}{" "}
                                pcs
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Miscellaneous Allowance Note */}
                    <div className="p-4 bg-muted/30 rounded-lg border border-border flex gap-3">
                      <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Miscellaneous Allowance</p>
                        <p className="text-muted-foreground">
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

// Helper component for collapsible timber sections
function TimberSection({
  title,
  size,
  data,
  unitLabel,
  formatValue,
  expanded,
  onToggle,
  formatCurrency,
}: {
  title: string;
  size: string;
  data: any;
  unitLabel: string;
  formatValue: (value: number) => string;
  expanded: boolean;
  onToggle: () => void;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <div className="text-left">
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-muted-foreground">{size} mm</p>
          </div>
        </div>
        <Badge variant="secondary">
          {formatValue(data.totalLengthWithWastageM)}
        </Badge>
      </button>
      {expanded && (
        <div className="p-4 border-t space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Base Length:</span>
              <p>{formatValue(data.totalLengthM)}</p>
            </div>
            <div>
              <span className="font-medium">With Wastage:</span>
              <p>{formatValue(data.totalLengthWithWastageM)}</p>
            </div>
            <div>
              <span className="font-medium">Wastage:</span>
              <p>{formatValue(data.wasteageAllowanceM)}</p>
            </div>
            <div>
              <span className="font-medium">Unit:</span>
              <p>{data.unitLm}</p>
            </div>
          </div>
          {data.unitPrice !== undefined && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Price per Unit:</span>
                  <p className="text-primary">
                    {formatCurrency(data.unitPrice)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Total (Base):</span>
                  <p className="text-primary">
                    {formatCurrency(data.totalPrice || 0)}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Total (with Wastage):</span>
                  <p className="text-primary font-bold">
                    {formatCurrency(data.totalPriceWithWastage || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
