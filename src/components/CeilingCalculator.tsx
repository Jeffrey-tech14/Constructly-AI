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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Download, Plus, Trash2, Edit } from "lucide-react";
import useUniversalFinishesCalculator, {
  FinishElement,
  FinishCalculation,
} from "@/hooks/useUniversalFinishesCalculator";

const CEILING_MATERIALS = [
  "Gypsum Board 1.2x2.4m",
  "PVC",
  "Acoustic Tiles",
  "Exposed Concrete",
  "Suspended Grid",
  "Wood Panels",
];

const CEILING_SUPPLEMENTARY_MATERIALS = [
  "Paint - Ceiling",
  "Blundering 40x40mm",
  "Metal Ceiling Channel",
  "Metal Ceiling Stud",
  "Gypsum Screws",
  "Corner Tape",
  "Fiber Mesh",
  "Cornice",
  "Filler",
];

interface CeilingCalculatorProps {
  finishes: FinishElement[];
  materialPrices: any[];
  onFinishesUpdate?: (finishes: FinishElement[]) => void;
  readonly?: boolean;
  quote?: any;
}

export default function CeilingCalculator({
  finishes,
  materialPrices,
  onFinishesUpdate,
  readonly = false,
  quote,
}: CeilingCalculatorProps) {
  // Filter only ceiling items
  const ceilingFinishes = finishes.filter((f) => f.category === "ceiling");

  const { calculations, totals, calculateAll, wastagePercentage } =
    useUniversalFinishesCalculator(ceilingFinishes, materialPrices, quote);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FinishElement | null>(null);

  /**
   * Auto-create a default gypsum board ceiling if none exists
   */
  useEffect(() => {
    if (readonly || ceilingFinishes.length > 0) return;

    const groundFloorSlab = quote?.concrete_rows?.find(
      (f: any) =>
        f.element === "slab" && f.name?.toLowerCase().includes("ground"),
    );
    const slabArea = parseFloat(groundFloorSlab?.slabArea) || 0;

    // Only auto-create if we have a valid slab area
    if (slabArea > 0) {
      const defaultCeiling: FinishElement = {
        id: `ceiling-gypsum-default-${Date.now()}`,
        category: "ceiling",
        material: "Gypsum Board 1.2x2.4m",
        area: slabArea,
        quantity: slabArea,
        unit: "m²",
        location: "All Rooms",
      };

      if (onFinishesUpdate) {
        onFinishesUpdate([defaultCeiling]);
      }
    }
  }, [
    readonly,
    ceilingFinishes.length,
    quote?.concrete_rows?.length,
    onFinishesUpdate,
  ]);

  /**
   * Helper function to get ceiling material price from materialsPrice (Supabase nested structure)
   * Follows same pattern as Flooring Calculator
   */
  const getCeilingMaterialPrice = useCallback(
    (materialName: string): number => {
      if (!Array.isArray(materialPrices)) return 0;

      // Find the Ceiling category in materialPrices
      const ceilingMaterial = materialPrices.find(
        (m: any) => m.name?.toLowerCase() === "ceiling",
      );

      if (!ceilingMaterial) return 0;

      // For ceiling, materials are stored in type.materials object (flat structure)
      const materials = ceilingMaterial.type?.materials;
      if (!materials || typeof materials !== "object") return 0;

      // Look up the material by name in the flat materials object
      const material = materials[materialName];
      if (!material) {
        // Fallback: try case-insensitive search
        const key = Object.keys(materials).find(
          (k) => k.toLowerCase() === materialName.toLowerCase(),
        );
        if (key) {
          return materials[key]?.price || 0;
        }
        return 0;
      }

      return material?.price || 0;
    },
    [materialPrices],
  );
  const handleAddFinish = () => {
    const groundFloorSlab = quote.concrete_rows?.find(
      (f: any) =>
        f.element === "slab" && f.name?.toLowerCase().includes("ground"),
    );
    const slabArea = parseFloat(groundFloorSlab?.slabArea) || 0;
    const newFinish: FinishElement = {
      id: `ceiling-${Date.now()}`,
      category: "ceiling",
      material: CEILING_MATERIALS[0],
      area: slabArea,
      quantity: slabArea,
      unit: "m²",
      location: "All Rooms",
    };

    const updatedFinishes = [...ceilingFinishes, newFinish];

    if (onFinishesUpdate) {
      onFinishesUpdate(updatedFinishes);
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
      const updatedFinishes = ceilingFinishes.map((f) =>
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
    const updatedFinishes = ceilingFinishes.filter((f) => f.id !== id);

    if (onFinishesUpdate) {
      onFinishesUpdate(updatedFinishes);
    }
  };

  const handleEditFinish = (finish: FinishElement) => {
    setEditingId(finish.id);
    setEditForm({ ...finish });
  };

  // Filter calculations based on search
  const filteredCalculations = calculations.filter((calc) =>
    calc.material.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Track stable references to prevent infinite loops
  const hasNonExposedConcrete = React.useMemo(() => {
    // Only check main ceiling materials, not supplementary ones
    const mainMaterials = CEILING_MATERIALS.filter(
      (m) => m !== "Exposed Concrete",
    );
    return ceilingFinishes.some((f) => mainMaterials.includes(f.material));
  }, [ceilingFinishes]);

  const gypsumItemsCount = React.useMemo(() => {
    return ceilingFinishes.filter((f) => f.material === "Gypsum Board 1.2x2.4m")
      .length;
  }, [ceilingFinishes]);

  const gypsumItemsArea = React.useMemo(() => {
    return ceilingFinishes
      .filter((f) => f.material === "Gypsum Board 1.2x2.4m")
      .reduce((sum, f) => sum + (f.area || 0), 0);
  }, [ceilingFinishes]);
  const blunderingExists = React.useMemo(() => {
    return ceilingFinishes.some((f) =>
      ["Blundering 40x40mm"].includes(f.material),
    );
  }, [ceilingFinishes]);

  const nonBlunderingCount = React.useMemo(() => {
    return ceilingFinishes.filter(
      (f) => !["Blundering 40x40mm"].includes(f.material),
    ).length;
  }, [ceilingFinishes]);

  // Stable slab area calculation
  const slabArea = React.useMemo(() => {
    const groundFloorSlab = quote?.concrete_rows?.find(
      (f: any) =>
        f.element === "slab" && f.name?.toLowerCase().includes("ground"),
    );
    return parseFloat(groundFloorSlab?.slabArea) || 0;
  }, [quote?.concrete_rows?.length, quote?.concrete_rows?.[0]?.slabArea]);

  // Stable perimeter calculations
  const perimeters = React.useMemo(() => {
    const externalPerimeter =
      quote?.wallDimensions?.externalWallPerimiter ||
      quote?.roof_structures?.externalPerimeterM ||
      0;
    const internalPerimeter = quote?.wallDimensions?.internalWallPerimiter || 0;
    const corniceLength = internalPerimeter * 2 + externalPerimeter;

    return { externalPerimeter, internalPerimeter, corniceLength };
  }, [
    quote?.wallDimensions?.externalWallPerimiter,
    quote?.roof_structures?.externalPerimeterM,
    quote?.wallDimensions?.internalWallPerimiter,
  ]);

  // Auto-manage blundering for ceiling items (STEP 6: Only on last floor)
  useEffect(() => {
    if (readonly) return;

    // STEP 6: Only apply blundering to the last floor for multi-storey buildings
    // Blundering should exist for all ceiling types except Exposed Concrete
    const shouldHaveBlundering = hasNonExposedConcrete;

    const totalArea = slabArea;
    const blunderingMeters = Math.ceil(totalArea * 3.36 * 1.15);

    // First priority: Remove blundering if only Exposed Concrete exists
    if (!shouldHaveBlundering && blunderingExists) {
      const updatedFinishes = ceilingFinishes.filter(
        (f) =>
          !(
            f.category === "ceiling" &&
            ["Blundering 40x40mm"].includes(f.material)
          ),
      );
      if (onFinishesUpdate) {
        onFinishesUpdate(updatedFinishes);
      }
      return;
    }

    // Check if we need to add blundering
    if (shouldHaveBlundering && !blunderingExists) {
      const blunderingItem: FinishElement = {
        id: `finish-ceiling-blundering`, // Stable ID - not timestamp-based
        category: "ceiling",
        material: "Blundering 40x40mm",
        area: totalArea,
        unit: "m" as const,
        quantity: blunderingMeters,
        location: `Ceiling battening for support`,
      };
      if (onFinishesUpdate) {
        const updatedFinishes = [...ceilingFinishes, blunderingItem];
        onFinishesUpdate(updatedFinishes);
      }
    }
    // Check if we need to update existing blundering
    else if (blunderingExists && shouldHaveBlundering) {
      const blunderingItem = ceilingFinishes.find((f) =>
        ["Blundering 40x40mm"].includes(f.material),
      );

      if (
        blunderingItem &&
        (blunderingItem.quantity !== blunderingMeters ||
          blunderingItem.area !== totalArea)
      ) {
        // Only update if quantity or area actually changed
        const updatedFinishes = ceilingFinishes.map((f) =>
          f.id === blunderingItem.id
            ? {
                ...f,
                quantity: blunderingMeters,
                area: totalArea,
                material: "Blundering 40x40mm",
                unit: "m" as const,
                location: `Ceiling battening for support`,
              }
            : f,
        );
        if (onFinishesUpdate) {
          onFinishesUpdate(updatedFinishes);
        }
      }
    }
  }, [hasNonExposedConcrete, readonly, blunderingExists, slabArea]);

  // Auto-manage gypsum board ceiling components
  useEffect(() => {
    if (readonly) return;

    // Only trigger if gypsum items exist and changed
    if (gypsumItemsCount === 0) {
      // Remove all gypsum components if no gypsum ceiling exists
      const gypsumRelatedMaterials = [
        "Metal Ceiling Channel",
        "Metal Ceiling Stud",
        "Gypsum Screws",
        "Corner Tape",
        "Fiber Mesh",
        "Filler",
        "Cornice",
      ];
      const hasGypsumComponents = ceilingFinishes.some(
        (f) =>
          f.category === "ceiling" &&
          gypsumRelatedMaterials.includes(f.material),
      );

      if (hasGypsumComponents) {
        const updatedFinishes = ceilingFinishes.filter(
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
    const totalArea = gypsumItemsArea;
    const boardArea = 1.2 * 2.4; // 2.88 m²
    const totalBoards = Math.ceil((totalArea / boardArea) * 1.25); // 25% wastage

    // Calculate component quantities
    const channels = totalBoards * 4;
    const studs = totalBoards * 2;
    const screws = Math.ceil(totalArea * 25); // 25 pcs/m²

    // Get material prices from database (Supabase materialPrices structure)
    const gypsumBoardPrice = getCeilingMaterialPrice("Gypsum Board 1.2x2.4m");
    const channelPrice = getCeilingMaterialPrice("Metal Ceiling Channel");
    const studPrice = getCeilingMaterialPrice("Metal Ceiling Stud");
    const screwPrice = getCeilingMaterialPrice("Gypsum Screws");
    const cornerTapePrice = getCeilingMaterialPrice("Corner Tape");
    const fiberMeshPrice = getCeilingMaterialPrice("Fiber Mesh");

    // Calculate total cost of main components (gypsum boards, studs, channels)
    const gypsumBoardsCost = totalBoards * gypsumBoardPrice;
    const channelsCost = channels * channelPrice;
    const studsCost = studs * studPrice;
    const mainComponentsCost = gypsumBoardsCost + channelsCost + studsCost;

    // Calculate 10% of total cost for supplementary materials
    const supplementaryCost = mainComponentsCost * 0.1;

    // Distribute 10% cost to corner tape, fiber mesh, and screws based on their unit prices
    const cornerTapeQuantity =
      cornerTapePrice > 0
        ? Math.ceil((supplementaryCost * 0.33) / cornerTapePrice)
        : Math.ceil(totalArea * 0.1);

    const fiberMeshQuantity =
      fiberMeshPrice > 0
        ? Math.ceil((supplementaryCost * 0.33) / fiberMeshPrice)
        : Math.ceil(totalArea * 0.1);

    const screwsQuantity =
      screwPrice > 0
        ? Math.ceil((supplementaryCost * 0.33) / screwPrice)
        : screws; // Fallback to 25 pcs/m²

    // Calculate filler in 25kg bags: total area / 10 / 3
    const fillerQuantity = Math.ceil(totalArea / 10 / 3);

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
        material: "Filler",
        quantity: fillerQuantity,
        unit: "bag" as const,
      },
      {
        material: "Cornice",
        quantity: Math.ceil(perimeters.corniceLength),
        unit: "m" as const,
      },
    ];

    let needsUpdate = false;
    let updatedFinishes = [...ceilingFinishes];

    gypsumComponents.forEach((component) => {
      const existing = updatedFinishes.find(
        (f) => f.category === "ceiling" && f.material === component.material,
      );

      if (!existing) {
        needsUpdate = true;
        updatedFinishes.push({
          id: `finish-ceiling-gypsum-${component.material.replace(/\s+/g, "-").toLowerCase()}`, // Stable ID based on material name
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
  }, [
    gypsumItemsCount,
    gypsumItemsArea,
    readonly,
    perimeters,
    onFinishesUpdate,
  ]);

  // Stable exposed concrete tracking
  const exposedConcreteItemsCount = React.useMemo(() => {
    return ceilingFinishes.filter((f) => f.material === "Exposed Concrete")
      .length;
  }, [ceilingFinishes]);

  const exposedConcreteItemsArea = React.useMemo(() => {
    return ceilingFinishes
      .filter((f) => f.material === "Exposed Concrete")
      .reduce((sum, f) => sum + (f.area || 0), 0);
  }, [ceilingFinishes]);

  const paintExists = React.useMemo(() => {
    return finishes.some(
      (f) => f.category === "ceiling" && f.material === "Paint - Ceiling",
    );
  }, [finishes]);

  // Auto-manage paint for exposed concrete ceilings
  useEffect(() => {
    if (readonly) return;

    // If no exposed concrete, remove paint
    if (exposedConcreteItemsCount === 0) {
      if (paintExists) {
        const updatedFinishes = ceilingFinishes.filter(
          (f) =>
            !(f.category === "ceiling" && f.material === "Paint - Ceiling"),
        );
        if (onFinishesUpdate) {
          onFinishesUpdate(updatedFinishes);
        }
      }
      return;
    }

    // Check if paint exists
    const existingPaint = finishes.find(
      (f) => f.category === "ceiling" && f.material === "Paint - Ceiling",
    );

    // If exposed concrete exists but paint doesn't, add it
    if (!existingPaint) {
      const paintItem: FinishElement = {
        id: `finish-ceiling-paint-exposed-concrete`, // Stable ID - not timestamp-based
        category: "ceiling",
        material: "Paint - Ceiling",
        area: exposedConcreteItemsArea,
        unit: "m²" as const,
        quantity: exposedConcreteItemsArea,
        location: "Auto-calculated for Exposed Concrete Ceiling",
      };

      const updatedFinishes = [...ceilingFinishes, paintItem];
      if (onFinishesUpdate) {
        onFinishesUpdate(updatedFinishes);
      }
    }
    // If paint exists but area changed, update it
    else if (existingPaint.area !== exposedConcreteItemsArea) {
      const updatedFinishes = ceilingFinishes.map((f) =>
        f.id === existingPaint.id
          ? {
              ...f,
              area: exposedConcreteItemsArea,
              quantity: exposedConcreteItemsArea,
            }
          : f,
      );
      if (onFinishesUpdate) {
        onFinishesUpdate(updatedFinishes);
      }
    }
  }, [
    exposedConcreteItemsCount,
    exposedConcreteItemsArea,
    paintExists,
    readonly,
  ]);

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
    link.download = "ceiling-calculations.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl ">{totals.totalArea.toFixed(2)} m²</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Material Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl ">
              {formatCurrency(totals.totalMaterialCostWithWastage)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl  text-green-600">
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
                Configure ceiling with automatic blundering on ceiling items
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
                        <SelectGroup>
                          <SelectLabel className="font-semibold bg-gray-100 dark:bg-primary rounded-3xl">
                            Main Materials
                          </SelectLabel>
                          {CEILING_MATERIALS.map((material) => (
                            <SelectItem key={material} value={material}>
                              {material}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="font-semibold bg-gray-100 dark:bg-primary rounded-3xl">
                            Supplementary Materials
                          </SelectLabel>
                          {CEILING_SUPPLEMENTARY_MATERIALS.map((material) => (
                            <SelectItem key={material} value={material}>
                              {material}
                            </SelectItem>
                          ))}
                        </SelectGroup>
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
                    <Label htmlFor="edit-quantity">Quantity</Label>
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

                  <div>
                    <Label htmlFor="edit-unit">Unit</Label>
                    <Select
                      value={editForm.unit}
                      onValueChange={(value) =>
                        handleEditFormChange("unit", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m²">m² (Square Meters)</SelectItem>
                        <SelectItem value="m">m (Linear Meters)</SelectItem>
                        <SelectItem value="m³">m³ (Cubic Meters)</SelectItem>
                        <SelectItem value="pcs">pcs (Pieces)</SelectItem>
                        <SelectItem value="kg">kg (Kilograms)</SelectItem>
                        <SelectItem value="bag">bag (Bags)</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <TableHead className="text-right">
                    Total (w/ Wastage)
                  </TableHead>
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
                      No ceiling items found.{" "}
                      {!readonly &&
                        "Add your first ceiling item to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalculations.map((calc) => {
                    const finish = ceilingFinishes.find(
                      (f) => f.id === calc.id,
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
                        <TableCell className="text-right ">
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
              <div className="text-xs ">Total Quantity</div>
              <div className="text-lg ">{totals.totalArea.toFixed(2)} m²</div>
            </div>
            <div>
              <div className="text-xs ">Base Cost</div>
              <div className="text-lg ">
                {formatCurrency(totals.totalMaterialCost)}
              </div>
            </div>
            <div>
              <div className="text-xs ">Wastage ({wastagePercentage}%)</div>
              <div className="text-lg ">
                {formatCurrency(
                  totals.totalMaterialCostWithWastage -
                    totals.totalMaterialCost,
                )}
              </div>
            </div>
            <div>
              <div className="text-xs ">Total with Wastage</div>
              <div className="text-lg  text-green-600">
                {formatCurrency(totals.totalMaterialCostWithWastage)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
