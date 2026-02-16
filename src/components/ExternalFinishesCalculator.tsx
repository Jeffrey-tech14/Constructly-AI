// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit, Search, Download } from "lucide-react";
import useExternalFinishesCalculator from "@/hooks/useExternalFinishesCalculator";
import usePaintingCalculator from "@/hooks/usePaintingCalculator";
import PaintingLayerConfig from "@/components/PaintingLayerConfig";
import type { FinishElement } from "@/hooks/useUniversalFinishesCalculator";
import {
  PaintingSpecification,
  DEFAULT_PAINTING_CONFIG,
  DEFAULT_COVERAGE_RATES,
} from "@/types/painting";
import { Checkbox } from "./ui/checkbox";

interface Props {
  finishes: FinishElement[];
  materialPrices: any[];
  onFinishesUpdate?: (finishes: FinishElement[]) => void;
  readonly?: boolean;
  quote?: any;
  wallDimensions?: any;
}

const EXTERNAL_FINISHES_MATERIALS = [
  "Cladding",
  "Marble",
  "Limestone",
  "Marzella",
  "Wall Master",
  "Keying",
];

export default function ExternalFinishesCalculator({
  finishes,
  materialPrices,
  onFinishesUpdate,
  readonly = false,
  quote,
  wallDimensions,
}: Props) {
  const [externalFinishes, setExternalFinishes] = useState<FinishElement[]>(
    finishes.filter((f) => f.category === "external-walling")
  );
  const [externalPlasterEnabled, setExternalPlasterEnabled] = useState(false);
  const [externalPlasterThickness, setExternalPlasterThickness] = useState(25); // Default 25mm
  const [wallPointingEnabled, setWallPointingEnabled] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FinishElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");


  // Calculate external wall area (perimeter × height)
  const externalWallArea = (wallDimensions?.externalWallPerimiter || 0) *
                          (wallDimensions?.externalWallHeight || 0);

  // Hooks for calculations
  const {
    calculations: finishCalcs,
    totals: finishTotals,
  } = useExternalFinishesCalculator(
    externalFinishes,
    materialPrices,
    quote,
    externalWallArea,
  );

  const {
    paintings: paintingList,
    totals: paintingTotals,
    addPainting,
    updatePainting,
    deletePainting,
  } = usePaintingCalculator({
    initialPaintings: quote?.paintings_specifications?.filter((p: any) => p.location === "Exterior Walls") || [],
    materialPrices,
    quote,
    location: "Exterior Walls",
    surfaceArea: externalWallArea,
    autoInitialize: true,
  });

  const plasterFinish = externalFinishes.find(
    (f) => f.material?.toLowerCase().includes("plaster")
  );
  const plasterVolume = externalPlasterEnabled && externalWallArea > 0
    ? externalWallArea * (externalPlasterThickness / 1000)
    : 0;

  const handleAddFinish = () => {
    const newFinish: FinishElement = {
      id: `finish-external-manual-${Math.random().toString(36).substr(2, 9)}`, // Unique random ID for user-added items
      category: "external-walling",
      material: "Cladding",
      area: externalWallArea,
      quantity: externalWallArea,
      unit: "m²",
    };
    const updated = [...externalFinishes, newFinish];
    setExternalFinishes(updated);
    setEditingId(newFinish.id);
    setEditForm(newFinish);
    if (onFinishesUpdate) onFinishesUpdate(updated);
  };

  const handleAddPlaster = () => {
    // Get plaster ratio from QS settings
    // Expected format: "1:3" for cement:sand, or a number for default ratio
    const plasterRatio = quote?.qsSettings?.plaster_ratio || "1:3";
    const plasterDensity = quote?.qsSettings?.plasterDensity || 2400; // kg/m³
    
    // Parse ratio (e.g., "1:3" → [1, 3])
    let cementPart = 1;
    let sandPart = 3;
    
    if (typeof plasterRatio === "string" && plasterRatio.includes(":")) {
      const parts = plasterRatio.split(":").map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        cementPart = parts[0];
        sandPart = parts[1];
      }
    }
    
    const totalParts = cementPart + sandPart;
    
    // Calculate material quantities
    const cementVolume = plasterVolume * (cementPart / totalParts);
    const sandVolume = plasterVolume * (sandPart / totalParts);
    
    // Create plaster material entries
    const materialEntries: FinishElement[] = [
      {
        id: `finish-external-plaster-base`, // Stable ID for auto-generated plaster base
        category: "external-walling",
        material: "External Plaster - Base",
        area: externalWallArea,
        quantity: plasterVolume,
        unit: "m³",
        specifications: {
          thickness: externalPlasterThickness,
          ratio: plasterRatio,
          cementPart,
          sandPart,
        },
      },
    ];
    
    // Add cement component
    if (cementVolume > 0) {
      materialEntries.push({
        id: `finish-external-cement`, // Stable ID for auto-generated cement
        category: "external-walling",
        material: "Plaster - Cement Component",
        area: externalWallArea,
        quantity: cementVolume,
        unit: "m³",
        specifications: {
          part: "cement",
          ratio: `${cementPart}/${totalParts}`,
        },
      });
    }
    
    // Add sand component
    if (sandVolume > 0) {
      materialEntries.push({
        id: `finish-external-sand`, // Stable ID for auto-generated sand
        category: "external-walling",
        material: "Plaster - Sand Component",
        area: externalWallArea,
        quantity: sandVolume,
        unit: "m³",
        specifications: {
          part: "sand",
          ratio: `${sandPart}/${totalParts}`,
        },
      });
    }
    
    const updated = [...externalFinishes, ...materialEntries];
    setExternalFinishes(updated);
    setExternalPlasterEnabled(true);
    if (onFinishesUpdate) onFinishesUpdate(updated);
  };

  const handleRemoveFinish = (id: string) => {
    const updated = externalFinishes.filter((f) => f.id !== id);
    setExternalFinishes(updated);
    
    // Check if any plaster-related materials exist
    const hasPlasterMaterials = updated.some(
      (f) => f.material?.toLowerCase().includes("plaster") ||
             f.material?.toLowerCase().includes("cement component") ||
             f.material?.toLowerCase().includes("sand component")
    );
    
    if (!hasPlasterMaterials) {
      setExternalPlasterEnabled(false);
    }
    if (onFinishesUpdate) onFinishesUpdate(updated);
  };

  const handleUpdateFinish = (id: string, field: string, value: any) => {
    const updated = externalFinishes.map((f) =>
      f.id === id ? { ...f, [field]: value } : f
    );
    setExternalFinishes(updated);
    if (onFinishesUpdate) onFinishesUpdate(updated);
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
      "Unit",
      "Unit Rate",
      "Total Cost",
    ];
    const csvData = externalFinishes.map((finish) => [
      finish.material,
      finish.location || "",
      finish.quantity,
      finish.unit,
      "0", // Placeholder for unit rate
      "0", // Placeholder for total cost
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "external-finishes-calculations.csv";
    link.click();
    URL.revokeObjectURL(url);
  };


  // Filter finishes based on search
  const filteredFinishes = externalFinishes.filter((finish) =>
    finish.material.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Auto-enable wall pointing when Keying is selected
  useEffect(() => {
    const hasKeyingFinish = externalFinishes.some(
      (f) => f.material?.toLowerCase() === "keying"
    );
    
    setWallPointingEnabled(hasKeyingFinish);
  }, [externalFinishes]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <CardTitle>External Finishes Materials</CardTitle>
              <CardDescription>
                Manage external wall finishes.
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center">
              {!readonly && (
                <Button onClick={handleAddFinish} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
              {filteredFinishes.length > 0 && (
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-material">Material</Label>
                    <Select
                      value={editForm.material}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, material: value })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXTERNAL_FINISHES_MATERIALS.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
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
                        setEditForm({
                          ...editForm,
                          location: e.target.value,
                        })
                      }
                      placeholder="e.g., Front Facade, Gutter"
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
                        setEditForm({
                          ...editForm,
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => {
                      setEditingId(null);
                      setEditForm(null);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (editForm && onFinishesUpdate) {
                        const updated = externalFinishes.map((f) =>
                          f.id === editingId ? editForm : f
                        );
                        setExternalFinishes(updated);
                        onFinishesUpdate(updated);
                        setEditingId(null);
                        setEditForm(null);
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* External Finishes Table */}
          <div className="rounded-md border mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  {!readonly && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFinishes.filter((f) => !f.material?.toLowerCase().includes("plaster")).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={readonly ? 6 : 7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No items found. {!readonly && "Add your first item to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFinishes
                    .filter((f) => !f.material?.toLowerCase().includes("plaster"))
                    .map((finish) => {
                      const calc = finishCalcs.find((c) => c.id === finish.id);
                      return (
                        <TableRow key={finish.id}>
                          <TableCell className="font-medium">{finish.material}</TableCell>
                          <TableCell>{finish.location || "-"}</TableCell>
                          <TableCell className="text-right">
                            {finish.quantity.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">{finish.unit}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(calc?.unitRate || 0)}
                          </TableCell>
                          <TableCell className="text-right ">
                            {formatCurrency(calc?.totalCost || 0)}
                          </TableCell>
                          {!readonly && (
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingId(finish.id);
                                    setEditForm({ ...finish });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveFinish(finish.id)}
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted">
            <div>
              <div className="text-xs font-bold">Total Area</div>
              <div className="text-lg font-bold">
                {externalWallArea.toFixed(2)} m²
              </div>
            </div>
            <div>
              <div className="text-xs font-bold">Total Items</div>
              <div className="text-lg font-bold">
                {externalFinishes.filter((f) => !f.material?.toLowerCase().includes("plaster")).length}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold">Total Cost</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(finishTotals.totalCost)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Plaster Section */}
      <Card className={` ${wallPointingEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardHeader className="">
          <CardTitle className="flex items-center gap-2">
            External Plaster
          </CardTitle>
          <CardDescription>
            Configure plaster thickness for external walls (default: 25mm)
            {wallPointingEnabled && <span className="block mt-1 text-amber-700 dark:text-amber-300">Disabled - Wall Pointing/Keying is enabled</span>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plasterFinish && !wallPointingEnabled ? (
            <div className="space-y-4">
              {/* Thickness Input */}
              <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg">
                <Label htmlFor="plaster-thickness" className="text-sm font-medium">
                  Plaster Thickness (mm)
                </Label>
                <Input
                  id="plaster-thickness"
                  type="number"
                  min="10"
                  max="100"
                  step="1"
                  value={externalPlasterThickness}
                  onChange={(e) => setExternalPlasterThickness(parseFloat(e.target.value) || 25)}
                  className="mt-2"
                  disabled={readonly || wallPointingEnabled}
                />
                <p className="text-xs text-gray-500 mt-1">Range: 10-100mm (default: 25mm)</p>
              </div>

              {/* Calculations Display */}
              <div className="grid grid-cols-2 gap-2 text-sm bg-white dark:bg-gray-900/50 p-2 rounded">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Wall Area</p>
                  <p className="">{externalWallArea.toFixed(2)} m²</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Volume (m³)</p>
                  <p className="">{plasterVolume.toFixed(3)} m³</p>
                </div>
              </div>

              {!readonly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFinish(plasterFinish.id)}
                  className="w-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                  disabled={wallPointingEnabled}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Plaster
                </Button>
              )}
            </div>
          ) : (
            !readonly && !wallPointingEnabled && (
              <Button
                onClick={handleAddPlaster}
                className="w-full"
                disabled={wallPointingEnabled}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add External Plaster
              </Button>
            )
          )}
          {wallPointingEnabled && (
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg text-sm text-amber-800 dark:text-amber-300">
              Plaster section is disabled because Wall Pointing/Keying is enabled. Disable wall pointing to use plaster.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {externalWallArea.toFixed(2)} m²
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {externalFinishes.filter((f) => !f.material?.toLowerCase().includes("plaster")).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(finishTotals.totalCost)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* External Painting Section */}
      <Card>
        <CardHeader className="border-b rounded-t-2xl">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🎨</span> External Painting Specifications
          </CardTitle>
          <CardDescription className="text-slate-700 dark:text-slate-300">
            Multi-layer painting calculations with coverage-aware sizing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {paintingList.length > 0 &&
            paintingList.map((painting) => (
              <PaintingLayerConfig
                key={painting.id}
                painting={painting}
                onUpdate={(updates) => updatePainting(painting.id, updates)}
                onDelete={() => deletePainting(painting.id)}
                wallDimensions={wallDimensions}
              />
            ))}
          
          {!readonly && paintingList.length === 0 && (
            <Button
              onClick={() => addPainting(externalWallArea, "Exterior Walls")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white  shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Painting Surface
            </Button>
          )}

          {paintingTotals && paintingTotals.totalArea > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 p-4 rounded-lg bg-muted">
              <div className="p-3 rounded-3xl">
                <div className="text-xs font-bold">Total Area</div>
                <div className="text-lg font-bold">
                  {paintingTotals.totalArea.toFixed(2)} m²
                </div>
              </div>
              <div className="p-3 rounded-3xl">
                <div className="text-xs font-bold">Total Paint</div>
                <div className="text-lg font-bold">
                  {paintingTotals.totalLitres.toFixed(2)} L
                </div>
              </div>
              <div className="p-3 rounded-3xl">
                <div className="text-xs font-bold">Total Cost</div>
                <div className="text-lg font-bold">
                  Ksh.{paintingTotals.totalCostWithWastage.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
