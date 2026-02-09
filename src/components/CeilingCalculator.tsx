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

const CEILING_MATERIALS = [
  "Blundering 40x40mm",
  "Gypsum Board 1.2x2.4m",
  "Metal Ceiling Channel",
  "Metal Ceiling Stud",
  "Gypsum Screws",
  "Corner Tape",
  "Fiber Mesh",
  "Cornice",
  "Filler",
  "PVC",
  "Acoustic Tiles",
  "Exposed Concrete",
  "Suspended Grid",
  "Wood Panels",
  "Paint - Ceiling",
];

interface CeilingCalculatorProps {
  finishes: FinishElement[];
  materialPrices: any[];
  onFinishesUpdate?: (finishes: FinishElement[]) => void;
  readonly?: boolean;
  setQuoteData?: (data: any) => void;
  quote?: any;
}

export default function CeilingCalculator({
  finishes,
  materialPrices,
  onFinishesUpdate,
  readonly = false,
  setQuoteData,
  quote,
}: CeilingCalculatorProps) {
  // Filter only ceiling items
  const ceilingFinishes = finishes.filter((f) => f.category === "ceiling");

  const { calculations, totals, calculateAll, wastagePercentage } =
    useUniversalFinishesCalculator(
      ceilingFinishes,
      materialPrices,
      quote,
      setQuoteData,
    );

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FinishElement | null>(null);

  // STEP 6: Ceiling Finishes - Multi-floor configuration
  const [numberOfFloors, setNumberOfFloors] = useState(quote?.floors || 1);
  const [ceilingTypePerFloor, setCeilingTypePerFloor] = useState<{
    [key: number]: string;
  }>({
    1: "Gypsum Board",
  });

  /**
   * Helper function to get material price from database
   * Returns the price per unit for a given material
   */
  const getMaterialPrice = useCallback((materialName: string): number => {
    if (!materialPrices || materialPrices.length === 0) return 0;

    const ceilingCategory = materialPrices.find(
      (p: any) => p.name?.toLowerCase() === "ceiling",
    );

    if (!ceilingCategory?.type?.materials) return 0;

    const material = Object.entries(ceilingCategory.type.materials).find(
      ([name]) => name.toLowerCase() === materialName.toLowerCase(),
    );

    if (!material) return 0;
    const [, details] = material;
    return (details as any)?.price || 0;
  }, [materialPrices]);

  // Filter calculations based on search
  const filteredCalculations = calculations.filter((calc) =>
    calc.material.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Auto-manage blundering for ceiling items (STEP 6: Only on last floor)
  useEffect(() => {
    if (readonly) return;

    const nonBlunderingCeilingItems = ceilingFinishes.filter(
      (f) => !["Blundering 40x40mm", "Blundering"].includes(f.material),
    );
    const hasBlundering = ceilingFinishes.some(
      (f) =>
        ["Blundering 40x40mm", "Blundering"].includes(f.material),
    );

    // STEP 6: Only apply blundering to the last floor for multi-storey buildings
    const isLastFloor = numberOfFloors <= 1 || ceilingFinishes.some((f) => f.location?.includes("Floor " + numberOfFloors) || f.location === "" );
    const shouldHaveBlundering = isLastFloor && (ceilingTypePerFloor[numberOfFloors] === "Gypsum Board");

    // If there are ceiling items on last floor but no blundering, add it
    if (shouldHaveBlundering && nonBlunderingCeilingItems.length > 0 && !hasBlundering) {
      const totalArea = nonBlunderingCeilingItems.reduce(
        (sum, item) => sum + item.area,
        0
      );
      // Formula: 3.36 × area × 1.15 for 40×40mm at 600×600 spacing
      const blunderingMeters = Math.ceil(totalArea * 3.36 * 1.15);

      const blunderingItem: FinishElement = {
        id: `finish-blundering-${Date.now()}`,
        category: "ceiling",
        material: "Blundering",
        area: totalArea,
        unit: "m" as const,
        quantity: blunderingMeters,
        location: `Ceiling battening for support (Floor ${numberOfFloors})`,
      };
      if (onFinishesUpdate) {
        onFinishesUpdate([...finishes, blunderingItem]);
      }
    }
    // Update blundering quantity if ceiling area changes or remove if not on last floor
    else if (nonBlunderingCeilingItems.length > 0 && hasBlundering) {
      const totalArea = nonBlunderingCeilingItems.reduce(
        (sum, item) => sum + item.area,
        0
      );
      const blunderingMeters = Math.ceil(totalArea * 3.36 * 1.15);
      const blunderingItem = ceilingFinishes.find(
        (f) =>
          ["Blundering 40x40mm", "Blundering"].includes(f.material),
      );

      if (blunderingItem) {
        if (!shouldHaveBlundering) {
          // Remove blundering if not on last floor
          const updatedFinishes = finishes.filter((f) => f.id !== blunderingItem.id);
          if (onFinishesUpdate) {
            onFinishesUpdate(updatedFinishes);
          }
        } else if (
          blunderingItem.quantity !== blunderingMeters ||
          blunderingItem.area !== totalArea
        ) {
          // Update blundering quantity if area changed
          const updatedFinishes = finishes.map((f) =>
            f.id === blunderingItem.id
              ? {
                  ...f,
                  quantity: blunderingMeters,
                  area: totalArea,
                  material: "Blundering 40x40mm",
                  unit: "m" as const,
                  location: `Ceiling battening for support (Floor ${numberOfFloors})`,
                }
              : f,
          );
          if (onFinishesUpdate) {
            onFinishesUpdate(updatedFinishes);
          }
        }
      }
    }
    // If no ceiling items exist, remove blundering
    else if (nonBlunderingCeilingItems.length === 0 && hasBlundering) {
      const updatedFinishes = finishes.filter(
        (f) =>
          !(
            f.category === "ceiling" &&
            ["Blundering 40x40mm", "Blundering"].includes(f.material)
          ),
      );
      if (onFinishesUpdate) {
        onFinishesUpdate(updatedFinishes);
      }
    }
  }, [finishes, ceilingFinishes, readonly, onFinishesUpdate, numberOfFloors, ceilingTypePerFloor]);

  // Auto-manage gypsum board ceiling components
  useEffect(() => {
    if (readonly) return;

    const gypsumCeilings = ceilingFinishes.filter(
      (f) => f.material === "Gypsum Board" && f.area > 0,
    );

    if (gypsumCeilings.length === 0) {
      // Remove all gypsum-related components if no gypsum ceiling exists
      const gypsumRelatedMaterials = [
        "Metal Ceiling Channel",
        "Metal Ceiling Stud",
        "Gypsum Screws",
        "Corner Tape",
        "Fiber Mesh",
        "Cornice",
      ];
      const hasGypsumComponents = finishes.some(
        (f) =>
          f.category === "ceiling" &&
          gypsumRelatedMaterials.includes(f.material),
      );

      if (hasGypsumComponents) {
        const updatedFinishes = finishes.filter(
          (f) =>
            !(
              f.category === "ceiling" &&
              gypsumRelatedMaterials.includes(f.material)
            ),
        );
        if (onFinishesUpdate) {
          onFinishesUpdate(updatedFinishes);
        }
      }
      return;
    }

    // Calculate totals for all gypsum ceilings
    const totalArea = gypsumCeilings.reduce((sum, g) => sum + g.area, 0);
    const boardArea = 1.2 * 2.4; // 2.88 m²
    const totalBoards = Math.ceil((totalArea / boardArea) * 1.25); // 25% wastage

    // Calculate component quantities
    const channels = totalBoards * 4;
    const studs = totalBoards * 2;
    const screws = Math.ceil(totalArea * 25); // 25 pcs/m²

    // Get material prices from database
    const gypsumBoardPrice = getMaterialPrice("Gypsum Board");
    const channelPrice = getMaterialPrice("Metal Ceiling Channel");
    const studPrice = getMaterialPrice("Metal Ceiling Stud");
    const screwPrice = getMaterialPrice("Gypsum Screws");
    const cornerTapePrice = getMaterialPrice("Corner Tape");
    const fiberMeshPrice = getMaterialPrice("Fiber Mesh");

    // Calculate total cost of main components (gypsum boards, studs, channels)
    const gypsumBoardsCost = totalBoards * gypsumBoardPrice;
    const channelsCost = channels * channelPrice;
    const studsCost = studs * studPrice;
    const mainComponentsCost = gypsumBoardsCost + channelsCost + studsCost;

    // Calculate 10% of total cost for supplementary materials
    const supplementaryCost = mainComponentsCost * 0.1;

    // Distribute 10% cost to corner tape, fiber mesh, and screws based on their unit prices
    // Calculate quantities needed to meet the 10% cost budget
    const cornerTapeQuantity = cornerTapePrice > 0 
      ? Math.ceil((supplementaryCost * 0.33) / cornerTapePrice) 
      : Math.ceil(totalArea * 0.1);
    
    const fiberMeshQuantity = fiberMeshPrice > 0 
      ? Math.ceil((supplementaryCost * 0.33) / fiberMeshPrice) 
      : Math.ceil(totalArea * 0.1);
    
    const screwsQuantity = screwPrice > 0 
      ? Math.ceil((supplementaryCost * 0.33) / screwPrice) 
      : screws; // Fallback to 25 pcs/m²

    // Get perimeters from quote data
    const externalPerimeter =
      quote?.wallDimensions?.externalWallPerimiter ||
      quote?.roofingInputs?.externalPerimeterM ||
      0;
    const internalPerimeter =
      quote?.wallDimensions?.internalWallPerimiter || 0;
    const corniceLength = internalPerimeter * 2 + externalPerimeter;

    // Materials to auto-add/update
    const gypsumComponents = [
      {
        material: "Metal Ceiling Channel",
        quantity: channels,
        unit: "pcs" as const,
      },
      {
        material: "Metal Ceiling Stud",
        quantity: studs,
        unit: "pcs" as const,
      },
      {
        material: "Gypsum Screws",
        quantity: screwsQuantity,
        unit: "pcs" as const,
      },
      {
        material: "Corner Tape",
        quantity: cornerTapeQuantity,
        unit: "m" as const,
      },
      {
        material: "Fiber Mesh",
        quantity: fiberMeshQuantity,
        unit: "m²" as const,
      },
      {
        material: "Cornice",
        quantity: Math.ceil(corniceLength),
        unit: "m" as const,
      },
    ];

    let needsUpdate = false;
    let updatedFinishes = [...finishes];

    gypsumComponents.forEach((component) => {
      const existing = updatedFinishes.find(
        (f) =>
          f.category === "ceiling" && f.material === component.material,
      );

      if (!existing) {
        needsUpdate = true;
        updatedFinishes.push({
          id: `finish-gypsum-${component.material}-${Date.now()}`,
          category: "ceiling",
          material: component.material,
          area: totalArea,
          unit: component.unit,
          quantity: component.quantity,
          location: "Auto-calculated for Gypsum Ceiling",
        });
      } else if (existing.quantity !== component.quantity) {
        needsUpdate = true;
        const index = updatedFinishes.indexOf(existing);
        updatedFinishes[index] = {
          ...existing,
          quantity: component.quantity,
          unit: component.unit,
          area: totalArea,
        };
      }
    });

    if (needsUpdate && onFinishesUpdate) {
      onFinishesUpdate(updatedFinishes);
    }
  }, [finishes, ceilingFinishes, readonly, quote, onFinishesUpdate]);

  const handleAddFinish = () => {
    const newFinish: FinishElement = {
      id: `ceiling-${Date.now()}`,
      category: "ceiling",
      material: CEILING_MATERIALS[0],
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
  }

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
    link.download = "ceiling-calculations.csv";
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
      {/* STEP 6: Multi-Floor Ceiling Configuration */}
      <Card>
        <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
          <CardTitle>Ceiling Types by Floor</CardTitle>
          <CardDescription>Configure ceiling type for each floor</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="floors">Number of Floors</Label>
              <Input
                id="floors"
                type="number"
                min="1"
                max="10"
                value={numberOfFloors}
                onChange={(e) => {
                  const floors = parseInt(e.target.value) || 1;
                  setNumberOfFloors(floors);
                  // Initialize missing floors
                  const updated = { ...ceilingTypePerFloor };
                  for (let i = 1; i <= floors; i++) {
                    if (!updated[i]) {
                      updated[i] = "Gypsum Board";
                    }
                  }
                  setCeilingTypePerFloor(updated);
                }}
                className="mt-2"
              />
            </div>

            {Array.from({ length: numberOfFloors }).map((_, idx) => {
              const floorNum = idx + 1;
              const isLastFloor = floorNum === numberOfFloors;
              return (
                <div key={floorNum}>
                  <Label htmlFor={`floor-${floorNum}`} className="font-bold">
                    Floor {floorNum} {isLastFloor && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded ml-1">Top Floor</span>}
                  </Label>
                  <Select
                    value={ceilingTypePerFloor[floorNum] || "Gypsum Board"}
                    onValueChange={(value) =>
                      setCeilingTypePerFloor({
                        ...ceilingTypePerFloor,
                        [floorNum]: value,
                      })
                    }
                    disabled={readonly}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gypsum Board">Gypsum Board</SelectItem>
                      <SelectItem value="PVC">PVC Ceiling</SelectItem>
                      <SelectItem value="Acoustic Tiles">Acoustic Tiles</SelectItem>
                      <SelectItem value="Exposed Concrete">Exposed Concrete</SelectItem>
                      <SelectItem value="Suspended Grid">Suspended Grid</SelectItem>
                      <SelectItem value="Wood Panels">Wood Panels</SelectItem>
                    </SelectContent>
                  </Select>
                  {isLastFloor && ceilingTypePerFloor[floorNum] === "Gypsum Board" && (
                    <p className="text-xs text-green-600 mt-1">✓ Blundering enabled</p>
                  )}
                </div>
              );
            })}
          </div>
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

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <CardTitle>Ceiling Materials & Components</CardTitle>
              <CardDescription>
                {numberOfFloors > 1 ? `Configure ${numberOfFloors}-storey ceiling with automatic blundering on floor ${numberOfFloors}` : "Single-storey ceiling with automatic blundering"}
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center">
              {!readonly && (
                <Button onClick={handleAddFinish} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ceiling Item
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
                <CardTitle className="text-lg">Edit Ceiling Item</CardTitle>
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
                        {CEILING_MATERIALS.map((material) => (
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
                      placeholder="e.g., Living Room, Master Bedroom"
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
                      No ceiling items found.{" "}
                      {!readonly && "Add your first ceiling item to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalculations.map((calc) => {
                    const finish = ceilingFinishes.find((f) => f.id === calc.id);
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
