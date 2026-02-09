// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useCallback, useEffect } from "react";
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
import { Search, Download, Plus, Trash2, Edit } from "lucide-react";
import useUniversalFinishesCalculator, {
  FinishElement,
  FinishCalculation,
} from "@/hooks/useUniversalFinishesCalculator";

const FLOORING_MATERIALS = [
  "Ceramic tiles",
  "Granite",
  "Wooden panels (hardwood)",
  "Cement paste (Niro finish)",
  "PVC vinyl flooring",
  "Epoxy flooring",
  "Terrazzo",
  "SPC flooring",
];

const EDGE_TRIM_TYPES = ["Aluminum", "PVC"];
const CORNER_STRIP_TYPES = ["Aluminum", "PVC"];

const TILE_SIZE_FACTORS: Record<
  string,
  { label: string; groutKgPerM2: number }
> = {
  "150x150": { label: "150x150mm", groutKgPerM2: 0.8 },
  "200x200": { label: "200x200mm", groutKgPerM2: 0.7 },
  "300x300": { label: "300x300mm", groutKgPerM2: 0.55 },
  "400x400": { label: "400x400mm", groutKgPerM2: 0.45 },
  "450x450": { label: "450x450mm", groutKgPerM2: 0.4 },
  "300x600": { label: "300x600mm", groutKgPerM2: 0.35 },
  "600x600": { label: "600x600mm", groutKgPerM2: 0.3 },
  "600x900": { label: "600x900mm", groutKgPerM2: 0.28 },
  "800x800": { label: "800x800mm", groutKgPerM2: 0.25 },
  "900x900": { label: "900x900mm", groutKgPerM2: 0.22 },
  "1200x600": { label: "1200x600mm", groutKgPerM2: 0.24 },
};

// STEP 3: Floor Finishes - Screeding Base Components
interface ScreeningBase {
  area: number; // m²
  thickness: number; // mm
  cementBags: number; // auto-calculated
  screedVolume: number; // m³ auto-calculated
  adhesiveKg: number; // auto-calculated
  groutKg: number; // auto-calculated
}

interface SkirtingCalculation {
  externalWallLength: number; // m
  internalWallLength: number; // m
  totalSkirtingLength: number; // m (auto-calculated)
}

interface FlooringCalculatorProps {
  finishes: FinishElement[];
  materialPrices: any[];
  onFinishesUpdate?: (finishes: FinishElement[]) => void;
  readonly?: boolean;
  setQuoteData?: (data: any) => void;
  quote?: any;
}

export default function FlooringCalculator({
  finishes,
  materialPrices,
  onFinishesUpdate,
  readonly = false,
  setQuoteData,
  quote,
}: FlooringCalculatorProps) {
  // Filter only flooring items
  const flooringFinishes = finishes.filter((f) => f.category === "flooring");

  const { calculations, totals, calculateAll, wastagePercentage } =
    useUniversalFinishesCalculator(
      flooringFinishes,
      materialPrices,
      quote,
      setQuoteData,
    );

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FinishElement | null>(null);

  // STEP 3: Floor Finishes - Screeding Base and Skirting
  const [screeningBase, setScreeningBase] = useState<ScreeningBase>({
    area: 0,
    thickness: 50, // mm (default 50mm)
    cementBags: 0,
    screedVolume: 0,
    adhesiveKg: 0,
    groutKg: 0,
  });

  const [tileSize, setTileSize] = useState<keyof typeof TILE_SIZE_FACTORS>(
    "300x300",
  );

  const [skirtingTileHeightM, setSkirtingTileHeightM] = useState(0.12);
  const [skirtingTileSize, setSkirtingTileSize] = useState<
    keyof typeof TILE_SIZE_FACTORS
  >("300x300");
  const [skirtingTileUnitPrice, setSkirtingTileUnitPrice] = useState(0);

  const [accessories, setAccessories] = useState({
    cornerStripsLength: 0,
    edgeTrimsLength: 0,
    cornerStripType: "Aluminum",
    edgeTrimType: "Aluminum",
    cornerStripUnitPrice: 0,
    edgeTrimUnitPrice: 0,
  });

  const [skirting, setSkirting] = useState<SkirtingCalculation>({
    externalWallLength: 0,
    internalWallLength: 0,
    totalSkirtingLength: 0,
  });

  // Filter calculations based on search
  const filteredCalculations = calculations.filter((calc) =>
    calc.material.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddFinish = () => {
    const newFinish: FinishElement = {
      id: `flooring-${Date.now()}`,
      category: "flooring",
      material: FLOORING_MATERIALS[0],
      area: 0,
      quantity: 0,
      unit: "m²",
      location: "",
    };

    if (onFinishesUpdate) {
      onFinishesUpdate([...finishes, newFinish]);
    }
    setEditingId(newFinish.id);
    setEditForm(newFinish);
  };

  const handleEditFormChange = (field: string, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  const handleSaveEdit = () => {
    if (editForm && onFinishesUpdate) {
      const updatedFinishes = finishes.map((f) =>
        f.id === editingId ? editForm : f,
      );
      onFinishesUpdate(updatedFinishes);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDeleteFinish = (id: string) => {
    if (onFinishesUpdate) {
      onFinishesUpdate(finishes.filter((f) => f.id !== id));
    }
  };

  const handleEditFinish = (finish: FinishElement) => {
    setEditingId(finish.id);
    setEditForm({ ...finish });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // STEP 3: Calculate screeding base materials
  // Ratio: Cement : Adhesive : Grout = 2 : 2 : 1 (by weight)
  const calculateScreeningBase = (area: number, thicknessMm: number) => {
    const volume = (area * thicknessMm) / 1000000; // m³
    const cementDensity = 1440; // kg/m³
    const cementKg = volume * cementDensity * 0.5;
    const cementBags = cementKg / 50;

    // Cement : Adhesive : Grout = 2 : 2 : 1
    const adhesiveKg = cementKg; // Adhesive (2 parts) = Cement (2 parts)
    const groutKg = cementKg / 2; // Grout (1 part) = Cement (2 parts) / 2

    return {
      volume,
      cementBags: Math.ceil(cementBags),
      screedVolume: volume.toFixed(3),
      adhesiveKg: adhesiveKg.toFixed(2),
      groutKg: groutKg.toFixed(2),
    };
  };

  // STEP 3: Calculate skirting length
  const calculateSkirtingLength = (externalLength: number, internalLength: number) => {
    // Formula: (external walls × 2) + (internal walls × 100)
    return ((externalLength + (internalLength*2)));
  };

  const parseTileSizeToMeters = (sizeKey: string) => {
    const [w, h] = sizeKey.split("x").map((v) => parseFloat(v) / 1000);
    return { widthM: w || 0, heightM: h || 0 };
  };

  const handleScreeningBaseChange = (field: keyof ScreeningBase, value: number) => {
    const updated = { ...screeningBase, [field]: value };
    if (field === "area" || field === "thickness") {
      const calculations = calculateScreeningBase(updated.area, updated.thickness);
      setScreeningBase({
        ...updated,
        cementBags: calculations.cementBags,
        screedVolume: parseFloat(calculations.screedVolume as any),
        adhesiveKg: parseFloat(calculations.adhesiveKg as any),
        groutKg: parseFloat(calculations.groutKg as any),
      });
    } else {
      setScreeningBase(updated);
    }
  };

  useEffect(() => {
    if (setQuoteData) {
      setQuoteData((prev: any) => ({
        ...prev,
        finishes: finishes,
      }));
    }
  }, [finishes, setQuoteData]);
  useEffect(() => {
    if (screeningBase.area === 0 && quote?.concrete_rows) {
      const groundFloorSlab = quote.concrete_rows?.find(
        (f: any) =>
          f.element === "slab" && f.name?.toLowerCase().includes("ground"),
      );
      const slabArea = parseFloat(groundFloorSlab?.slabArea) || 0;

      if (slabArea > 0) {
        const calculations = calculateScreeningBase(slabArea, screeningBase.thickness);
        setScreeningBase((prev) => ({
          ...prev,
          area: slabArea,
          cementBags: calculations.cementBags,
          screedVolume: parseFloat(calculations.screedVolume as any),
          adhesiveKg: parseFloat(calculations.adhesiveKg as any),
          groutKg: parseFloat(calculations.groutKg as any),
        }));
      }
    }
  }, [quote?.concrete_rows]);

  const handleSkirtingChange = (field: keyof SkirtingCalculation, value: number) => {
    const updated = { ...skirting, [field]: value };
    if (field === "externalWallLength" || field === "internalWallLength") {
      updated.totalSkirtingLength = calculateSkirtingLength(
        updated.externalWallLength,
        updated.internalWallLength,
      );
      setAccessories((prev) => ({
        ...prev,
        cornerStripsLength: prev.cornerStripsLength || updated.totalSkirtingLength,
        edgeTrimsLength: prev.edgeTrimsLength || updated.totalSkirtingLength,
      }));
    }
    setSkirting(updated);
  };

  useEffect(() => {
    const external = quote?.wallDimensions?.externalWallPerimiter || 0;
    const internal = quote?.wallDimensions?.internalWallPerimiter || 0;
    if ((external > 0 || internal > 0) && skirting.externalWallLength === 0 && skirting.internalWallLength === 0) {
      const totalSkirtingLength = calculateSkirtingLength(external, internal);
      setSkirting({
        externalWallLength: external,
        internalWallLength: internal,
        totalSkirtingLength,
      });
      setAccessories((prev) => ({
        ...prev,
        cornerStripsLength: totalSkirtingLength,
        edgeTrimsLength: totalSkirtingLength,
      }));
    }
  }, [quote, skirting.externalWallLength, skirting.internalWallLength]);

  const exportToCSV = () => {
    const headers = [
      "Material",
      "Location",
      "Quantity",
      "Adjusted Quantity",
      "Unit",
      "Unit Rate",
      "Material Cost",
      "Material Cost (with Wastage)",
      "Total Cost",
      "Total Cost (with Wastage)",
      "Wastage %",
      "Wastage Quantity",
      "Wastage Cost",
    ];
    const csvData = calculations.map((calc) => [
      calc.material,
      finishes.find((f) => f.id === calc.id)?.location || "",
      calc.quantity,
      calc.adjustedQuantity,
      calc.unit,
      calc.unitRate,
      calc.materialCost,
      calc.materialCostWithWastage,
      calc.totalCost,
      calc.totalCostWithWastage,
      calc.wastage.percentage * 100,
      calc.wastage.wastageQuantity,
      calc.wastage.totalWastageCost,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flooring-calculations.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (setQuoteData) {
      setQuoteData((prev: any) => ({
        ...prev,
        finishes: finishes,
      }));
    }
  }, [finishes, setQuoteData]);

  const skirtingTileArea = skirting.totalSkirtingLength * skirtingTileHeightM;
  const skirtingTileSizeM = parseTileSizeToMeters(skirtingTileSize);
  const skirtingTileUnitArea =
    skirtingTileSizeM.widthM * skirtingTileSizeM.heightM;
  const skirtingTileCount = skirtingTileUnitArea > 0
    ? Math.ceil(skirtingTileArea / skirtingTileUnitArea)
    : 0;
  const skirtingTileTotalCost = skirtingTileArea * skirtingTileUnitPrice;
  const cornerStripTotalCost =
    accessories.cornerStripsLength * accessories.cornerStripUnitPrice;
  const edgeTrimTotalCost =
    accessories.edgeTrimsLength * accessories.edgeTrimUnitPrice;

  return (
    <div className="space-y-6">
      {/* Section 1: Screeding Base */}
      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
          <CardTitle>Screeding Base (Cement:Adhesive 1:1)</CardTitle>
          <CardDescription>Calculate screeding materials for tiled floor preparation</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="screed-area">Screeding Area (m²)</Label>
              <Input
                id="screed-area"
                type="number"
                min="0"
                step="0.01"
                value={screeningBase.area}
                onChange={(e) =>
                  handleScreeningBaseChange("area", parseFloat(e.target.value) || 0)
                }
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {quote?.concrete_rows?.find(
                  (f: any) => f.element === "slab" && f.name?.toLowerCase().includes("ground")
                )?.slabArea
                  ? "Auto-filled from ground floor slab (editable)"
                  : "Enter ground floor area"}
              </p>
            </div>

            <div>
              <Label htmlFor="screed-thickness">Thickness (mm)</Label>
              <Input
                id="screed-thickness"
                type="number"
                min="10"
                max="200"
                step="10"
                value={screeningBase.thickness}
                onChange={(e) =>
                  handleScreeningBaseChange("thickness", parseFloat(e.target.value) || 50)
                }
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 50mm</p>
            </div>

            <div>
              <Label htmlFor="tile-size">Tile Size</Label>
              <Select
                value={tileSize}
                onValueChange={(value) =>
                  setTileSize(value as keyof typeof TILE_SIZE_FACTORS)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TILE_SIZE_FACTORS).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Grout adjusts by tile size; adhesive stays at 1:1 with cement.
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded border border-green-200">
              <Label className="text-xs font-bold text-green-900 dark:text-green-100">
                Cement Bags (50kg)
              </Label>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-2">
                {screeningBase.cementBags}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200">
              <Label className="text-xs font-bold text-amber-900 dark:text-amber-100">
                Screed Volume (m³)
              </Label>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-2">
                {screeningBase.screedVolume}
              </div>
            </div>
          </div>

          {/* Adhesive and Grout Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded border border-purple-200">
              <Label className="text-xs font-bold text-purple-900 dark:text-purple-100">
                Adhesive/Bonding (kg)
              </Label>
              <div className="text-xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                {screeningBase.adhesiveKg}
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded border border-indigo-200">
              <Label className="text-xs font-bold text-indigo-900 dark:text-indigo-100">
                Grout (kg)
              </Label>
              <div className="text-xl font-bold text-indigo-700 dark:text-indigo-300 mt-2">
                {screeningBase.groutKg}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Skirting Calculation */}
      <Card>
        <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
          <CardTitle>Skirting Calculation</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ext-wall">External Wall Length (m)</Label>
              <Input
                id="ext-wall"
                type="number"
                min="0"
                step="0.1"
                value={skirting.externalWallLength}
                onChange={(e) =>
                  handleSkirtingChange("externalWallLength", parseFloat(e.target.value) || 0)
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="int-wall">Internal Wall Length (m)</Label>
              <Input
                id="int-wall"
                type="number"
                min="0"
                step="0.1"
                value={skirting.internalWallLength}
                onChange={(e) =>
                  handleSkirtingChange("internalWallLength", parseFloat(e.target.value) || 0)
                }
                className="mt-2"
              />
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded border border-orange-200 flex flex-col justify-end">
              <Label className="text-xs font-bold text-orange-900 dark:text-orange-100">
                Total Skirting Length
              </Label>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-2">
                {skirting.totalSkirtingLength.toFixed(2)} m
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                ({skirting.externalWallLength * 2} + {skirting.internalWallLength * 100})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2a: Skirting Tiles */}
      <Card>
        <CardHeader className="bg-slate-50 dark:bg-slate-900/30">
          <CardTitle>Skirting Tiles</CardTitle>
          <CardDescription>Auto-calculated from skirting length</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="skirting-height">Skirting Height (m)</Label>
              <Input
                id="skirting-height"
                type="number"
                min="0.1"
                max="0.15"
                step="0.01"
                value={skirtingTileHeightM}
                onChange={(e) =>
                  setSkirtingTileHeightM(parseFloat(e.target.value) || 0.12)
                }
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Typical: 0.10-0.15m</p>
            </div>
            <div>
              <Label htmlFor="skirting-tile-size">Skirting Tile Size</Label>
              <Select
                value={skirtingTileSize}
                onValueChange={(value) =>
                  setSkirtingTileSize(value as keyof typeof TILE_SIZE_FACTORS)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TILE_SIZE_FACTORS).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skirting-tile-unit">Skirting Tile Unit Price (Ksh/m²)</Label>
              <Input
                id="skirting-tile-unit"
                type="number"
                min="0"
                step="1"
                value={skirtingTileUnitPrice}
                onChange={(e) =>
                  setSkirtingTileUnitPrice(parseFloat(e.target.value) || 0)
                }
                className="mt-2"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200">
              <Label className="text-xs font-bold text-blue-900 dark:text-blue-100">
                Skirting Tile Area (m²)
              </Label>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                {skirtingTileArea.toFixed(2)}
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                Est. tiles: {skirtingTileCount}
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded border border-emerald-200">
              <Label className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                Skirting Length (m)
              </Label>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">
                {skirting.totalSkirtingLength.toFixed(2)}
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200">
              <Label className="text-xs font-bold text-amber-900 dark:text-amber-100">
                Skirting Tile Total (Ksh)
              </Label>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-2">
                {formatCurrency(skirtingTileTotalCost)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2b: Skirting Accessories */}
      <Card>
        <CardHeader className="bg-slate-50 dark:bg-slate-900/30">
          <CardTitle>Skirting Accessories</CardTitle>
          <CardDescription>Corner strips and edge trims for finished floors</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="corner-strips">Corner Strips Length (m)</Label>
              <Input
                id="corner-strips"
                type="number"
                min="0"
                step="0.1"
                value={accessories.cornerStripsLength}
                onChange={(e) =>
                  setAccessories((prev) => ({
                    ...prev,
                    cornerStripsLength: parseFloat(e.target.value) || 0,
                  }))
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edge-trims">Edge Trims Length (m)</Label>
              <Input
                id="edge-trims"
                type="number"
                min="0"
                step="0.1"
                value={accessories.edgeTrimsLength}
                onChange={(e) =>
                  setAccessories((prev) => ({
                    ...prev,
                    edgeTrimsLength: parseFloat(e.target.value) || 0,
                  }))
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="corner-strip-type">Corner Strip Type</Label>
              <Select
                value={accessories.cornerStripType}
                onValueChange={(value) =>
                  setAccessories((prev) => ({
                    ...prev,
                    cornerStripType: value,
                  }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORNER_STRIP_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edge-trim-type">Edge Trim Type</Label>
              <Select
                value={accessories.edgeTrimType}
                onValueChange={(value) =>
                  setAccessories((prev) => ({
                    ...prev,
                    edgeTrimType: value,
                  }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EDGE_TRIM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="corner-strip-unit">Corner Strip Unit Price (Ksh/m)</Label>
              <Input
                id="corner-strip-unit"
                type="number"
                min="0"
                step="1"
                value={accessories.cornerStripUnitPrice}
                onChange={(e) =>
                  setAccessories((prev) => ({
                    ...prev,
                    cornerStripUnitPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edge-trim-unit">Edge Trim Unit Price (Ksh/m)</Label>
              <Input
                id="edge-trim-unit"
                type="number"
                min="0"
                step="1"
                value={accessories.edgeTrimUnitPrice}
                onChange={(e) =>
                  setAccessories((prev) => ({
                    ...prev,
                    edgeTrimUnitPrice: parseFloat(e.target.value) || 0,
                  }))
                }
                className="mt-2"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200">
              <Label className="text-xs font-bold text-blue-900 dark:text-blue-100">
                Corner Strip Total (Ksh)
              </Label>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                {formatCurrency(cornerStripTotalCost)}
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded border border-emerald-200">
              <Label className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                Edge Trim Total (Ksh)
              </Label>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">
                {formatCurrency(edgeTrimTotalCost)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.totalArea.toFixed(2)} m²
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Material Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.totalMaterialCostWithWastage)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.totalCostWithWastage)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Floor Finishes Materials */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <CardTitle>Floor Finishes</CardTitle>
              <CardDescription>
                Ceramic tiles, Granite, Hardwood, Niro finish, PVC vinyl, Epoxy, Terrazzo, SPC
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center">
              {!readonly && (
                <Button onClick={handleAddFinish} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Flooring
                </Button>
              )}
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {editingId && editForm && (
            <Card className="mb-6 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">Edit Flooring Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-material">Material</Label>
                    <Select
                      value={editForm.material}
                      onValueChange={(value) =>
                        handleEditFormChange("material", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FLOORING_MATERIALS.map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-location">Location (Optional)</Label>
                    <Input
                      id="edit-location"
                      value={editForm.location || ""}
                      onChange={(e) =>
                        handleEditFormChange("location", e.target.value)
                      }
                      placeholder="e.g., Living Room, Kitchen"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-quantity">Quantity (m²)</Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.quantity}
                      onChange={(e) =>
                        handleEditFormChange(
                          "quantity",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button onClick={handleCancelEdit} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Calculations Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Rate</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Total (w/ Wastage)</TableHead>
                  {!readonly && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={readonly ? 6 : 7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No flooring items found.{" "}
                      {!readonly && "Add your first flooring item to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalculations.map((calc) => {
                    const finish = flooringFinishes.find((f) => f.id === calc.id);
                    return (
                      <TableRow key={calc.id}>
                        <TableCell className="font-medium">
                          {calc.material}
                        </TableCell>
                        <TableCell>{finish?.location || "-"}</TableCell>
                        <TableCell className="text-right">
                          {calc.quantity.toFixed(2)} m²
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(calc.unitRate)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(calc.totalCost)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(calc.totalCostWithWastage)}
                        </TableCell>
                        {!readonly && (
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => finish && handleEditFinish(finish)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteFinish(calc.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Totals Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 rounded-lg bg-muted">
            <div>
              <div className="text-xs font-bold">Total Quantity</div>
              <div className="text-lg font-bold">
                {totals.totalArea.toFixed(2)} m²
              </div>
            </div>
            <div>
              <div className="text-xs font-bold">Base Cost</div>
              <div className="text-lg font-bold">
                {formatCurrency(totals.totalMaterialCost)}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold">Wastage ({wastagePercentage}%)</div>
              <div className="text-lg font-bold">
                {formatCurrency(
                  totals.totalMaterialCostWithWastage - totals.totalMaterialCost,
                )}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold">Total with Wastage</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(totals.totalMaterialCostWithWastage)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
