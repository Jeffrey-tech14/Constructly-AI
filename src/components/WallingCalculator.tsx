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
import { Checkbox } from "@/components/ui/checkbox";
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
  FinishCategory,
} from "@/hooks/useUniversalFinishesCalculator";

const INTERNAL_WALLING_MATERIALS = [
  "Stone Cladding",
  "Tile Cladding",
  "Wood Paneling",
  "Smooth Stucco",
  "Gypsum Board",
];

const EXTERNAL_WALLING_MATERIALS = [
  // Gutters
  "PVC Gutter",
  "Galvanized Steel Gutter",
  "Aluminum Gutter",
  "Copper Gutter",
  // Fascia
  "PVC Fascia",
  "Painted Wood Fascia",
  "Aluminum Fascia",
  "Composite Fascia",
  // Soffit
  "PVC Soffit",
  "Aluminum Soffit",
  // Downpipes
  "PVC Downpipe",
  "Galvanized Steel Downpipe",
  // STEP 4: External Finish Options
  "Render",
  "Cladding",
  "Marble",
  "Marzella",
  "Wall Master",
  "Keying Coat",
];

const TILE_SIZE_FACTORS: Record<
  string,
  { label: string; adhesiveKgPerM2: number; groutKgPerM2: number }
> = {
  "150x150": { label: "150x150mm", adhesiveKgPerM2: 5.5, groutKgPerM2: 0.8 },
  "200x200": { label: "200x200mm", adhesiveKgPerM2: 5.0, groutKgPerM2: 0.7 },
  "300x300": { label: "300x300mm", adhesiveKgPerM2: 4.5, groutKgPerM2: 0.55 },
  "400x400": { label: "400x400mm", adhesiveKgPerM2: 4.2, groutKgPerM2: 0.45 },
  "450x450": { label: "450x450mm", adhesiveKgPerM2: 4.0, groutKgPerM2: 0.42 },
  "300x600": { label: "300x600mm", adhesiveKgPerM2: 4.2, groutKgPerM2: 0.4 },
  "600x600": { label: "600x600mm", adhesiveKgPerM2: 3.8, groutKgPerM2: 0.3 },
  "600x900": { label: "600x900mm", adhesiveKgPerM2: 3.6, groutKgPerM2: 0.28 },
  "800x800": { label: "800x800mm", adhesiveKgPerM2: 3.4, groutKgPerM2: 0.26 },
  "900x900": { label: "900x900mm", adhesiveKgPerM2: 3.2, groutKgPerM2: 0.24 },
  "1200x600": { label: "1200x600mm", adhesiveKgPerM2: 3.3, groutKgPerM2: 0.25 },
};

interface WallingCalculatorProps {
  finishes: FinishElement[];
  materialPrices: any[];
  onFinishesUpdate?: (finishes: FinishElement[]) => void;
  readonly?: boolean;
  setQuoteData?: (data: any) => void;
  quote?: any;
  wallDimensions?: any;
}

export default function WallingCalculator({
  finishes,
  materialPrices,
  onFinishesUpdate,
  readonly = false,
  setQuoteData,
  quote,
  wallDimensions,
}: WallingCalculatorProps) {
  const [wallingType, setWallingType] = useState<"internal" | "external">(
    "internal"
  );
  const [hasInitializedPaintings, setHasInitializedPaintings] = useState(false);

  // Filter finishes based on selected walling type
  const filteredFinishes = finishes.filter((f) =>
    wallingType === "internal"
      ? f.category === "internal-walling"
      : f.category === "external-walling"
  );

  const { calculations, totals, calculateAll, wastagePercentage } =
    useUniversalFinishesCalculator(
      filteredFinishes,
      materialPrices,
      quote,
      setQuoteData
    );

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FinishElement | null>(null);

  // STEP 4: Wall Finishes - Wet Area Detection
  const [wetAreaSettings, setWetAreaSettings] = useState({
    hasKitchen: false,
    hasBathroom: false,
    bathrooomTileHeight: 1.8, // 1.8m default
    kitchenTileHeight: 1.8, // 1.8m default
    kitchenTileSize: "300x300",
    bathroomTileSize: "300x300",
  });

  // Auto-add tiling for wet areas
  const getTilingForWetAreas = useCallback(() => {
    if (!wallDimensions) return [];
    
    const newWallTiles: FinishElement[] = [];
    
    if (wetAreaSettings.hasKitchen) {
      // Kitchen tiling: height × perimeter
      const kitchenArea = wallDimensions.internalWallPerimiter * wetAreaSettings.kitchenTileHeight;
      if (kitchenArea > 0) {
        const kitchenFactors = TILE_SIZE_FACTORS[wetAreaSettings.kitchenTileSize];
        const cornerStripsLength = wetAreaSettings.kitchenTileHeight * 4;
        newWallTiles.push({
          id: "kitchen-tiles",
          category: "internal-walling",
          material: "Tile Cladding",
          area: kitchenArea,
          quantity: kitchenArea,
          unit: "m²",
          location: "Kitchen Walls (1.8m height)",
        });
        newWallTiles.push({
          id: "kitchen-tiles-adhesive",
          category: "internal-walling",
          material: "Tile Adhesive",
          area: kitchenArea,
          quantity: kitchenArea * kitchenFactors.adhesiveKgPerM2,
          unit: "kg",
          location: "Kitchen Wall Tile Adhesive",
        });
        newWallTiles.push({
          id: "kitchen-tiles-grout",
          category: "internal-walling",
          material: "Tile Grout",
          area: kitchenArea,
          quantity: kitchenArea * kitchenFactors.groutKgPerM2,
          unit: "kg",
          location: "Kitchen Wall Tile Grout",
        });
        newWallTiles.push({
          id: "kitchen-tiles-corner",
          category: "internal-walling",
          material: "Corner Strips",
          area: kitchenArea,
          quantity: cornerStripsLength,
          unit: "m",
          location: "Kitchen Wall Tile Corners",
        });
      }
    }
    
    if (wetAreaSettings.hasBathroom) {
      // Bathroom tiling: height × perimeter
      const bathroomArea = wallDimensions.internalWallPerimiter * wetAreaSettings.bathrooomTileHeight;
      if (bathroomArea > 0) {
        const bathroomFactors = TILE_SIZE_FACTORS[wetAreaSettings.bathroomTileSize];
        const cornerStripsLength = wetAreaSettings.bathrooomTileHeight * 4;
        newWallTiles.push({
          id: "bathroom-tiles",
          category: "internal-walling",
          material: "Tile Cladding",
          area: bathroomArea,
          quantity: bathroomArea,
          unit: "m²",
          location: "Bathroom Walls (1.8m height)",
        });
        newWallTiles.push({
          id: "bathroom-tiles-adhesive",
          category: "internal-walling",
          material: "Tile Adhesive",
          area: bathroomArea,
          quantity: bathroomArea * bathroomFactors.adhesiveKgPerM2,
          unit: "kg",
          location: "Bathroom Tile Adhesive",
        });
        newWallTiles.push({
          id: "bathroom-tiles-grout",
          category: "internal-walling",
          material: "Tile Grout",
          area: bathroomArea,
          quantity: bathroomArea * bathroomFactors.groutKgPerM2,
          unit: "kg",
          location: "Bathroom Tile Grout",
        });
        newWallTiles.push({
          id: "bathroom-tiles-corner",
          category: "internal-walling",
          material: "Corner Strips",
          area: bathroomArea,
          quantity: cornerStripsLength,
          unit: "m",
          location: "Bathroom Tile Corners",
        });
      }
    }
    
    return newWallTiles;
  }, [wallDimensions, wetAreaSettings]);

  useEffect(() => {
    if (readonly) return;
    if (!onFinishesUpdate) return;

    const newTiles = getTilingForWetAreas();
    const hasWetAreas = wetAreaSettings.hasKitchen || wetAreaSettings.hasBathroom;
    const otherFinishes = finishes.filter(
      (f) => !f.location?.includes("Kitchen") && !f.location?.includes("Bathroom")
    );
    if (hasWetAreas) {
      onFinishesUpdate([...otherFinishes, ...newTiles]);
    } else if (otherFinishes.length !== finishes.length) {
      onFinishesUpdate(otherFinishes);
    }
  }, [finishes, getTilingForWetAreas, onFinishesUpdate, readonly, wetAreaSettings]);

  // Filter calculations based on search
  const filteredCalculations = calculations.filter((calc) =>
    calc.material.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const materialOptions =
    wallingType === "internal"
      ? INTERNAL_WALLING_MATERIALS
      : EXTERNAL_WALLING_MATERIALS;

  const handleAddFinish = () => {
    const category: FinishCategory =
      wallingType === "internal" ? "internal-walling" : "external-walling";
    const newFinish: FinishElement = {
      id: `${wallingType}-walling-${Date.now()}`,
      category,
      material: materialOptions[0],
      area: 0,
      quantity: 0,
      unit: wallingType === "external" ? "m" : "m²",
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
      // Ensure the category matches the current walling type
      const updatedForm = {
        ...editForm,
        category: (wallingType === "internal" ? "internal-walling" : "external-walling") as FinishCategory,
      };
      const updatedFinishes = finishes.map((f) =>
        f.id === editingId ? updatedForm : f
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
    link.download = `${wallingType}-walling-calculations.csv`;
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

  return (
    <div className="space-y-6">

      {/* STEP 4.1: Wet Area Detection */}
      <Card>
        <CardHeader className="bg-green-50 dark:bg-green-950/20">
          <CardTitle>Wet Area Detection & Auto-Tiling</CardTitle>
          <CardDescription>Automatically add tiling for kitchen and bathroom areas</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Kitchen Toggle */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-bold">Kitchen</Label>
                <Checkbox
                  checked={wetAreaSettings.hasKitchen}
                  onCheckedChange={(checked) =>
                    setWetAreaSettings({
                      ...wetAreaSettings,
                      hasKitchen: checked === true,
                    })
                  }
                  disabled={readonly}
                />
              </div>
              {wetAreaSettings.hasKitchen && (
                <div>
                  <Label className="text-xs">Tiling Height (m)</Label>
                  <Input
                    type="number"
                    min="1.2"
                    max="2.4"
                    step="0.1"
                    value={wetAreaSettings.kitchenTileHeight}
                    onChange={(e) =>
                      setWetAreaSettings({
                        ...wetAreaSettings,
                        kitchenTileHeight: parseFloat(e.target.value) || 1.8,
                      })
                    }
                    disabled={readonly}
                    className="mt-2 text-xs"
                  />
                  <Label className="text-xs mt-3">Tile Size</Label>
                  <Select
                    value={wetAreaSettings.kitchenTileSize}
                    onValueChange={(value) =>
                      setWetAreaSettings({
                        ...wetAreaSettings,
                        kitchenTileSize: value,
                      })
                    }
                    disabled={readonly}
                  >
                    <SelectTrigger className="mt-2 text-xs">
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
              )}
            </div>

            {/* Bathroom Toggle */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <Label className="font-bold">Bathroom</Label>
                <Checkbox
                  checked={wetAreaSettings.hasBathroom}
                  onCheckedChange={(checked) =>
                    setWetAreaSettings({
                      ...wetAreaSettings,
                      hasBathroom: checked === true,
                    })
                  }
                  disabled={readonly}
                />
              </div>
              {wetAreaSettings.hasBathroom && (
                <div>
                  <Label className="text-xs">Tiling Height (m)</Label>
                  <Input
                    type="number"
                    min="1.2"
                    max="2.4"
                    step="0.1"
                    value={wetAreaSettings.bathrooomTileHeight}
                    onChange={(e) =>
                      setWetAreaSettings({
                        ...wetAreaSettings,
                        bathrooomTileHeight: parseFloat(e.target.value) || 1.8,
                      })
                    }
                    disabled={readonly}
                    className="mt-2 text-xs"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 1.8m</p>
                  <Label className="text-xs mt-3">Tile Size</Label>
                  <Select
                    value={wetAreaSettings.bathroomTileSize}
                    onValueChange={(value) =>
                      setWetAreaSettings({
                        ...wetAreaSettings,
                        bathroomTileSize: value,
                      })
                    }
                    disabled={readonly}
                  >
                    <SelectTrigger className="mt-2 text-xs">
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
              )}
            </div>

            {/* Kitchen Area Preview */}
            {wetAreaSettings.hasKitchen && wallDimensions?.internalWallPerimiter && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200">
                <Label className="text-xs font-bold text-blue-900 dark:text-blue-100">
                  Kitchen Tile Area
                </Label>
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                  {(wallDimensions.internalWallPerimiter * wetAreaSettings.kitchenTileHeight).toFixed(2)} m²
                </div>
              </div>
            )}

            {/* Bathroom Area Preview */}
            {wetAreaSettings.hasBathroom && wallDimensions?.internalWallPerimiter && (
              <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded border border-purple-200">
                <Label className="text-xs font-bold text-purple-900 dark:text-purple-100">
                  Bathroom Tile Area
                </Label>
                <div className="text-xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                  {(wallDimensions.internalWallPerimiter * wetAreaSettings.bathrooomTileHeight).toFixed(2)} m²
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-4">
            Wet area tiling updates automatically when kitchen/bathroom settings change.
          </p>
        </CardContent>
      </Card>
        
              {/* Masonry Plaster Results */}
              {quote?.masonry_materials?.netPlaster > 0 && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">🧱</span> Plaster Finishes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Plaster Area */}
                      <Card className="">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium ">
                            Plaster Area
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-blue-600">
                            {(quote.masonry_materials.grossPlaster || 0).toFixed(2)}
                          </div>
                          <p className="text-xs mt-1">m²</p>
                        </CardContent>
                      </Card>
        
                      {/* Plaster Cost */}
                      <Card className="">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium ">
                            Plaster Materials Cost
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(
                              quote.masonry_materials.grossPlasterCost || 0,
                            )}
                          </div>
                          <p className="text-xs mt-1">Gross Cost</p>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}
        
      {/* Walling Type Toggle */}
      <div className="flex gap-2 border-b mb-6">
        <button
          onClick={() => {
            setWallingType("internal");
            setEditingId(null);
            setEditForm(null);
            setSearchTerm("");
          }}
          className={`px-4 py-2 font-medium text-sm ${
            wallingType === "internal"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          Internal Walling
        </button>
        <button
          onClick={() => {
            setWallingType("external");
            setEditingId(null);
            setEditForm(null);
            setSearchTerm("");
          }}
          className={`px-4 py-2 font-medium text-sm ${
            wallingType === "external"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          External Walling
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.totalArea.toFixed(2)}{" "}
              {wallingType === "external" ? "m" : "m²"}
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

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <CardTitle>
                {wallingType === "internal"
                  ? "Internal Walling"
                  : "External Walling"}{" "}
                Materials
              </CardTitle>
              <CardDescription>
                {wallingType === "internal"
                  ? "Manage internal wall finishes (cladding, paneling, tiling, etc.)"
                  : "Manage external components (gutters, fascia, soffit, downpipes, and STEP 4 finishes: marble, marzella, wall master, keying coat)"}
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center">
              {!readonly && (
                <Button onClick={handleAddFinish} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
              {filteredCalculations.length > 0 && (
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
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
                <CardTitle className="text-lg">Edit Item</CardTitle>
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
                        {materialOptions.map((material) => (
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
                      placeholder={
                        wallingType === "internal"
                          ? "e.g., Bedroom, Hallway"
                          : "e.g., Front Facade, Gutter"
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-quantity">
                      Quantity ({wallingType === "external" ? "m" : "m²"})
                    </Label>
                    <Input
                      id="edit-quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.quantity}
                      onChange={(e) =>
                        handleEditFormChange(
                          "quantity",
                          parseFloat(e.target.value) || 0
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
                  {!readonly && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={readonly ? 6 : 7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No items found.{" "}
                      {!readonly && "Add your first item to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalculations.map((calc) => {
                    const finish = filteredFinishes.find(
                      (f) => f.id === calc.id
                    );
                    return (
                      <TableRow key={calc.id}>
                        <TableCell className="font-medium">
                          {calc.material}
                        </TableCell>
                        <TableCell>{finish?.location || "-"}</TableCell>
                        <TableCell className="text-right">
                          {calc.quantity.toFixed(2)} {calc.unit}
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
                                onClick={() =>
                                  finish && handleEditFinish(finish)
                                }
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
                {totals.totalArea.toFixed(2)}{" "}
                {wallingType === "external" ? "m" : "m²"}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold">Base Cost</div>
              <div className="text-lg font-bold">
                {formatCurrency(totals.totalMaterialCost)}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold">
                Wastage ({wastagePercentage}%)
              </div>
              <div className="text-lg font-bold">
                {formatCurrency(
                  totals.totalMaterialCostWithWastage -
                    totals.totalMaterialCost
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
