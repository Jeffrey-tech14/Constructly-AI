// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useEffect, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit, Search, Download } from "lucide-react";
import useInternalFinishesCalculator from "@/hooks/useInternalFinishesCalculator";
import usePaintingCalculator from "@/hooks/usePaintingCalculator";
import PaintingLayerConfig from "@/components/PaintingLayerConfig";
import type {
  FinishElement,
  FinishCategory,
} from "@/hooks/useUniversalFinishesCalculator";
import {
  PaintingSpecification,
  DEFAULT_PAINTING_CONFIG,
  DEFAULT_COVERAGE_RATES,
} from "@/types/painting";

interface Props {
  finishes: FinishElement[];
  materialPrices: any[];
  onFinishesUpdate?: (finishes: FinishElement[]) => void;
  readonly?: boolean;
  quote?: any;
  wallDimensions?: any;
}

const INTERNAL_FINISHES_MATERIALS = [
  "Stone Cladding",
  "Tile Cladding",
  "Wood Paneling",
  "Smooth Stucco",
  "Gypsum Board",
  "Fluted panels", // INTERNAL ONLY
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

export default function InternalFinishesCalculator({
  finishes,
  materialPrices,
  onFinishesUpdate,
  readonly = false,
  quote,
  wallDimensions,
}: Props) {
  const [internalFinishes, setInternalFinishes] = useState<FinishElement[]>(
    finishes.filter((f) => f.category === "internal-walling"),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FinishElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [includePaint, setIncludePaint] = useState<boolean>(
    (
      quote?.paintings_specifications?.filter(
        (p: any) => p.location === "Interior Walls",
      ) || []
    ).length > 0,
  );

  // State for dynamic tile pricing
  const [kitchenTileUnitPrice, setKitchenTileUnitPrice] = useState(0);
  const [bathroomTileUnitPrice, setBathroomTileUnitPrice] = useState(0);

  // Wet Area Settings
  const [wetAreaSettings, setWetAreaSettings] = useState({
    hasKitchen: false,
    hasBathroom: false,
    bathrooomTileHeight: 1.8,
    kitchenTileHeight: 1.8,
    kitchenTileSize: "300x300",
    bathroomTileSize: "300x300",
    kitchenTileType: "Ceramic Tiles",
    bathroomTileType: "Ceramic Tiles",
    kitchenPerimeter: 0,
    bathroomPerimeter: 0,
  });

  // Initialize wet area settings from finishes
  useEffect(() => {
    const kitchenFinish = finishes.find((f) => f.id === "kitchen-tiles");
    const bathroomFinish = finishes.find((f) => f.id === "bathroom-tiles");

    const newSettings = { ...wetAreaSettings };

    if (kitchenFinish && kitchenFinish.metadata) {
      newSettings.hasKitchen = kitchenFinish.metadata.hasKitchen ?? false;
      newSettings.kitchenPerimeter =
        kitchenFinish.metadata.kitchenPerimeter ?? 0;
      newSettings.kitchenTileHeight =
        kitchenFinish.metadata.kitchenTileHeight ?? 1.8;
      newSettings.kitchenTileSize =
        kitchenFinish.metadata.kitchenTileSize ?? "300x300";
      newSettings.kitchenTileType =
        kitchenFinish.metadata.kitchenTileType ?? "Ceramic Tiles";
    }

    if (bathroomFinish && bathroomFinish.metadata) {
      newSettings.hasBathroom = bathroomFinish.metadata.hasBathroom ?? false;
      newSettings.bathroomPerimeter =
        bathroomFinish.metadata.bathroomPerimeter ?? 0;
      newSettings.bathrooomTileHeight =
        bathroomFinish.metadata.bathrooomTileHeight ?? 1.8;
      newSettings.bathroomTileSize =
        bathroomFinish.metadata.bathroomTileSize ?? "300x300";
      newSettings.bathroomTileType =
        bathroomFinish.metadata.bathroomTileType ?? "Ceramic Tiles";
    }

    setWetAreaSettings(newSettings);
  }, [finishes]);

  // Hooks for calculations
  const { calculations: finishCalcs, totals: finishTotals } =
    useInternalFinishesCalculator(internalFinishes, materialPrices, quote);

  // Calculate internal wall area (perimeter × height × 2 for walls all around)
  const internalWallArea =
    (wallDimensions?.internalWallPerimiter || 0) *
    (wallDimensions?.internalWallHeight || 0) *
    2;

  // Helper function to calculate net wall area (deducting doors and windows)
  const calculateNetWallArea = (wallType: "external" | "internal"): number => {
    if (!quote?.wallSections || !wallDimensions) return 0;

    let grossArea = 0;
    let openingsArea = 0;

    // Get dimensions based on wall type
    if (wallType === "external") {
      grossArea =
        (wallDimensions.externalWallPerimiter || 0) *
        (wallDimensions.externalWallHeight || 0);
    } else {
      grossArea =
        (wallDimensions.internalWallPerimiter || 0) *
        (wallDimensions.internalWallHeight || 0) *
        2;
    }
    // Calculate openings area
    const sections = quote.wallSections || [];
    const filteredSections = sections.filter((s: any) => s.type === wallType);

    filteredSections.forEach((section: any) => {
      // Add door areas
      if (section.doors && Array.isArray(section.doors)) {
        section.doors.forEach((door: any) => {
          let doorArea = 0;
          if (door.sizeType === "standard" && door.standardSize) {
            const parts = door.standardSize.split("x");
            if (parts.length === 2) {
              const h = parseFloat(parts[0]);
              const w = parseFloat(parts[1]);
              doorArea = isNaN(h) || isNaN(w) ? 0 : h * w;
            }
          } else if (door.custom) {
            const h = parseFloat(door.custom.height || 0);
            const w = parseFloat(door.custom.width || 0);
            doorArea = isNaN(h) || isNaN(w) ? 0 : h * w;
          }
          openingsArea += (doorArea || 0) * (door.count || 1);
        });
      }

      // Add window areas
      if (section.windows && Array.isArray(section.windows)) {
        section.windows.forEach((window: any) => {
          let windowArea = 0;
          if (window.sizeType === "standard" && window.standardSize) {
            const parts = window.standardSize.split("x");
            if (parts.length === 2) {
              const h = parseFloat(parts[0]);
              const w = parseFloat(parts[1]);
              windowArea = isNaN(h) || isNaN(w) ? 0 : h * w;
            }
          } else if (window.custom) {
            const h = parseFloat(window.custom.height || 0);
            const w = parseFloat(window.custom.width || 0);
            windowArea = isNaN(h) || isNaN(w) ? 0 : h * w;
          }
          openingsArea += (windowArea || 0) * (window.count || 1);
        });
      }
    });

    // Return net area (ensure it doesn't go negative)
    return Math.max(0, grossArea - openingsArea);
  };

  // Calculate net internal wall area
  const netInternalWallArea = calculateNetWallArea("internal");

  const {
    paintings: paintingList,
    totals: paintingTotals,
    addPainting,
    updatePainting,
    deletePainting,
  } = usePaintingCalculator({
    initialPaintings:
      quote?.paintings_specifications?.filter(
        (p: any) => p.location === "Interior Walls",
      ) || [],
    materialPrices,
    quote,
    location: "Interior Walls",
    surfaceArea: netInternalWallArea,
    autoInitialize: true,
  });

  // Helper function to get tile price by size
  const getTilePriceBySize = useCallback(
    (tileTypeName: string, tileSize: string): number => {
      if (!Array.isArray(materialPrices)) return 0;

      const wallingMaterial = materialPrices.find(
        (m: any) => m.name?.toLowerCase() === "wall-finishes",
      );

      if (!wallingMaterial) return 0;

      const internalMaterials =
        wallingMaterial.type?.internalWallingMaterials || [];
      let material = internalMaterials.find(
        (m: any) => m.name?.toLowerCase() === tileTypeName.toLowerCase(),
      );

      if (!material) {
        const tileCladding = internalMaterials.find(
          (m: any) => m.name?.toLowerCase() === "tile cladding",
        );

        if (tileCladding && Array.isArray(tileCladding.type)) {
          const typeMatch = tileCladding.type.find(
            (t: any) => t.name?.toLowerCase() === tileTypeName.toLowerCase(),
          );
          if (typeMatch) {
            const tileTypesMap = typeMatch.tileTypes;
            if (tileTypesMap && typeof tileTypesMap === "object") {
              if (tileSize in tileTypesMap) {
                return tileTypesMap[tileSize];
              }
            }
            return typeMatch.price_kes || 0;
          }
        }
        return 0;
      }

      if (!Array.isArray(material.type)) return 0;

      const firstType = material.type[0];
      const tileTypesMap = firstType?.tileTypes;

      if (!tileTypesMap || typeof tileTypesMap !== "object") {
        return firstType?.price_kes || 0;
      }

      if (tileSize in tileTypesMap) {
        return tileTypesMap[tileSize];
      }

      return firstType?.price_kes || 0;
    },
    [materialPrices],
  );

  // Get walling material price
  const getWallingMaterialPrice = useCallback(
    (materialName: string): number => {
      if (!Array.isArray(materialPrices)) return 0;

      const wallingMaterial = materialPrices.find(
        (m: any) => m.name?.toLowerCase() === "wall-finishes",
      );

      if (!wallingMaterial) return 0;

      const allMaterials = [
        ...(wallingMaterial.type?.internalWallingMaterials || []),
        ...(wallingMaterial.type?.tilingMaterials || []),
      ];

      const material = allMaterials.find(
        (m: any) => m.name?.toLowerCase() === materialName.toLowerCase(),
      );

      if (!material || !Array.isArray(material.type)) return 0;

      const firstType = material.type[0];
      return firstType?.price_kes || 0;
    },
    [materialPrices],
  );

  // Get tiling for wet areas
  const getTilingForWetAreas = useCallback(() => {
    const newWallTiles: FinishElement[] = [];

    if (wetAreaSettings.hasKitchen && wetAreaSettings.kitchenPerimeter > 0) {
      const kitchenArea =
        wetAreaSettings.kitchenPerimeter * wetAreaSettings.kitchenTileHeight;
      if (kitchenArea > 0) {
        const kitchenFactors =
          TILE_SIZE_FACTORS[wetAreaSettings.kitchenTileSize];
        const cornerStripsLength = wetAreaSettings.kitchenTileHeight * 4;
        newWallTiles.push({
          id: "kitchen-tiles",
          category: "internal-walling",
          material: "Tile Cladding",
          area: kitchenArea,
          quantity: kitchenArea,
          unit: "m²",
          location: `Kitchen Walls - ${wetAreaSettings.kitchenTileType} (${TILE_SIZE_FACTORS[wetAreaSettings.kitchenTileSize].label})`,
          metadata: {
            hasKitchen: true,
            kitchenPerimeter: wetAreaSettings.kitchenPerimeter,
            kitchenTileHeight: wetAreaSettings.kitchenTileHeight,
            kitchenTileSize: wetAreaSettings.kitchenTileSize,
            kitchenTileType: wetAreaSettings.kitchenTileType,
          },
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

    if (wetAreaSettings.hasBathroom && wetAreaSettings.bathroomPerimeter > 0) {
      const bathroomArea =
        wetAreaSettings.bathroomPerimeter * wetAreaSettings.bathrooomTileHeight;
      if (bathroomArea > 0) {
        const bathroomFactors =
          TILE_SIZE_FACTORS[wetAreaSettings.bathroomTileSize];
        const cornerStripsLength = wetAreaSettings.bathrooomTileHeight * 4;
        newWallTiles.push({
          id: "bathroom-tiles",
          category: "internal-walling",
          material: "Tile Cladding",
          area: bathroomArea,
          quantity: bathroomArea,
          unit: "m²",
          location: `Bathroom Walls - ${wetAreaSettings.bathroomTileType} (${TILE_SIZE_FACTORS[wetAreaSettings.bathroomTileSize].label})`,
          metadata: {
            hasBathroom: true,
            bathroomPerimeter: wetAreaSettings.bathroomPerimeter,
            bathrooomTileHeight: wetAreaSettings.bathrooomTileHeight,
            bathroomTileSize: wetAreaSettings.bathroomTileSize,
            bathroomTileType: wetAreaSettings.bathroomTileType,
          },
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
  }, [wetAreaSettings]);

  // Update kitchen tile price
  useEffect(() => {
    if (wetAreaSettings.hasKitchen) {
      const kitchenPrice = getTilePriceBySize(
        wetAreaSettings.kitchenTileType,
        wetAreaSettings.kitchenTileSize,
      );
      setKitchenTileUnitPrice(kitchenPrice);
    }
  }, [
    wetAreaSettings.kitchenTileSize,
    wetAreaSettings.kitchenTileType,
    wetAreaSettings.hasKitchen,
    getTilePriceBySize,
  ]);

  // Update bathroom tile price
  useEffect(() => {
    if (wetAreaSettings.hasBathroom) {
      const bathroomPrice = getTilePriceBySize(
        wetAreaSettings.bathroomTileType,
        wetAreaSettings.bathroomTileSize,
      );
      setBathroomTileUnitPrice(bathroomPrice);
    }
  }, [
    wetAreaSettings.bathroomTileSize,
    wetAreaSettings.bathroomTileType,
    wetAreaSettings.hasBathroom,
    getTilePriceBySize,
  ]);

  // Auto-add tiling for wet areas - only when wet area settings change
  useEffect(() => {
    if (readonly) return;
    if (!onFinishesUpdate) return;

    const newTiles = getTilingForWetAreas();
    const hasWetAreas =
      wetAreaSettings.hasKitchen || wetAreaSettings.hasBathroom;

    // Filter out old wet area tiles first
    const otherFinishes = internalFinishes.filter(
      (f) =>
        !f.id?.includes("kitchen-tiles") && !f.id?.includes("bathroom-tiles"),
    );

    if (hasWetAreas && newTiles.length > 0) {
      // Only update if tiles actually changed
      const combinedFinishes = [...otherFinishes, ...newTiles];
      setInternalFinishes(combinedFinishes);
      onFinishesUpdate(combinedFinishes);
    } else if (
      !hasWetAreas &&
      otherFinishes.length !== internalFinishes.length
    ) {
      // Remove all wet area tiles if toggled off
      setInternalFinishes(otherFinishes);
      onFinishesUpdate(otherFinishes);
    }
  }, [
    wetAreaSettings.hasKitchen,
    wetAreaSettings.hasBathroom,
    wetAreaSettings.kitchenPerimeter,
    wetAreaSettings.kitchenTileHeight,
    wetAreaSettings.kitchenTileSize,
    wetAreaSettings.kitchenTileType,
    wetAreaSettings.bathroomPerimeter,
    wetAreaSettings.bathrooomTileHeight,
    wetAreaSettings.bathroomTileSize,
    wetAreaSettings.bathroomTileType,
    getTilingForWetAreas,
    onFinishesUpdate,
    readonly,
  ]);

  const handleAddFinish = () => {
    const newFinish: FinishElement = {
      id: `finish-internal-manual-${Math.random().toString(36).substr(2, 9)}`, // Unique random ID for user-added items
      category: "internal-walling",
      material: "Stone Cladding",
      area: netInternalWallArea,
      quantity: netInternalWallArea,
      unit: "m²",
    };
    const updated = [...internalFinishes, newFinish];
    setInternalFinishes(updated);
    setEditForm(newFinish);
    setEditingId(newFinish.id);
    if (onFinishesUpdate) onFinishesUpdate(updated);
  };

  const handleRemoveFinish = (id: string) => {
    const updated = internalFinishes.filter((f) => f.id !== id);
    setInternalFinishes(updated);
    if (onFinishesUpdate) onFinishesUpdate(updated);
  };

  const handleUpdateFinish = (id: string, field: string, value: any) => {
    const updated = internalFinishes.map((f) =>
      f.id === id ? { ...f, [field]: value } : f,
    );
    setInternalFinishes(updated);
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
    const csvData = internalFinishes.map((finish) => [
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
    link.download = "internal-finishes-calculations.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter finishes based on search
  const filteredFinishes = internalFinishes.filter((finish) =>
    finish.material.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Other Finishes Section - always visible */}
      <>
        {/* Masonry Plaster Results */}
        {quote?.masonry_materials?.netPlaster > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Plaster Finishes
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
                    <div className="text-xl font-bold ">
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
        {/* Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
              <div>
                <CardTitle>Internal Finishes Materials</CardTitle>
                <CardDescription>Manage internal wall finishes</CardDescription>
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
                        <SelectTrigger className="w-full mt-1 text-sm">
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>

                        <SelectContent>
                          {INTERNAL_FINISHES_MATERIALS.map((m) => (
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
                        placeholder="e.g., Bedroom, Hallway"
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
                          const updated = internalFinishes.map((f) =>
                            f.id === editingId ? editForm : f,
                          );
                          setInternalFinishes(updated);
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

            {/* Finishes Table */}
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
                    {!readonly && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFinishes.length === 0 ? (
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
                    filteredFinishes.map((finish) => {
                      const calc = finishCalcs.find((c) => c.id === finish.id);
                      return (
                        <TableRow key={finish.id}>
                          <TableCell className="font-medium">
                            {finish.material}
                          </TableCell>
                          <TableCell>{finish.location || "-"}</TableCell>
                          <TableCell className="text-right">
                            {finish.quantity.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {finish.unit}
                          </TableCell>
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
          </CardContent>
        </Card>
      </>
      {/* Paint Option */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Internal Paint Finishes</CardTitle>
              <CardDescription>
                Optional: Add paint finishing to interior walls
              </CardDescription>
            </div>
            <Checkbox
              id="include-paint"
              checked={includePaint}
              onCheckedChange={(checked) => setIncludePaint(!!checked)}
              disabled={readonly}
            />
          </div>
        </CardHeader>
      </Card>
      {/* Paint Finishes Section - visible when checkbox is checked */}
      {includePaint && (
        <>
          {/* Internal Painting Section */}
          <Card>
            <CardHeader className="border-b rounded-t-2xl">
              <CardTitle className="text-lg flex items-center gap-2">
                Internal Painting Specifications
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
                  onClick={() =>
                    addPainting(internalWallArea, "Interior Walls")
                  }
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
        </>
      )}{" "}
      {/* Wet Area Tiling Section */}
      <Card>
        <CardHeader className="bg-green-50 dark:bg-green-950/20">
          <CardTitle>Wet Area Tiling</CardTitle>
          <CardDescription>
            Add tiling for kitchen and bathroom areas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Wall Perimeter (m)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={wetAreaSettings.kitchenPerimeter}
                      onChange={(e) =>
                        setWetAreaSettings({
                          ...wetAreaSettings,
                          kitchenPerimeter: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={readonly}
                      className="mt-2 text-xs"
                      placeholder="e.g., 8.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tile Type</Label>
                    <Select
                      value={wetAreaSettings.kitchenTileType}
                      onValueChange={(value) =>
                        setWetAreaSettings({
                          ...wetAreaSettings,
                          kitchenTileType: value,
                        })
                      }
                      disabled={readonly}
                    >
                      <SelectTrigger className="mt-2 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ceramic Tiles">
                          Ceramic Tiles
                        </SelectItem>
                        <SelectItem value="Granite Tiles">
                          Granite Tiles
                        </SelectItem>
                        <SelectItem value="Porcelain Tiles">
                          Porcelain Tiles
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  </div>
                  <div>
                    <Label className="text-xs">Tile Size</Label>
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
                        {Object.entries(TILE_SIZE_FACTORS).map(
                          ([key, data]) => (
                            <SelectItem key={key} value={key}>
                              {data.label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
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
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Wall Perimeter (m)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={wetAreaSettings.bathroomPerimeter}
                      onChange={(e) =>
                        setWetAreaSettings({
                          ...wetAreaSettings,
                          bathroomPerimeter: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={readonly}
                      className="mt-2 text-xs"
                      placeholder="e.g., 6.5"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tile Type</Label>
                    <Select
                      value={wetAreaSettings.bathroomTileType}
                      onValueChange={(value) =>
                        setWetAreaSettings({
                          ...wetAreaSettings,
                          bathroomTileType: value,
                        })
                      }
                      disabled={readonly}
                    >
                      <SelectTrigger className="mt-2 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ceramic Tiles">
                          Ceramic Tiles
                        </SelectItem>
                        <SelectItem value="Granite Tiles">
                          Granite Tiles
                        </SelectItem>
                        <SelectItem value="Porcelain Tiles">
                          Porcelain Tiles
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                          bathrooomTileHeight:
                            parseFloat(e.target.value) || 1.8,
                        })
                      }
                      disabled={readonly}
                      className="mt-2 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tile Size</Label>
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
                        {Object.entries(TILE_SIZE_FACTORS).map(
                          ([key, data]) => (
                            <SelectItem key={key} value={key}>
                              {data.label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Kitchen Area Preview */}
            {wetAreaSettings.hasKitchen &&
              wetAreaSettings.kitchenPerimeter > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200">
                  <Label className="text-xs font-bold text-blue-900 dark:text-blue-100">
                    Kitchen Tile Area
                  </Label>
                  <div className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                    {(
                      wetAreaSettings.kitchenPerimeter *
                      wetAreaSettings.kitchenTileHeight
                    ).toFixed(2)}{" "}
                    m²
                  </div>
                </div>
              )}

            {/* Bathroom Area Preview */}
            {wetAreaSettings.hasBathroom &&
              wetAreaSettings.bathroomPerimeter > 0 && (
                <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded border border-purple-200">
                  <Label className="text-xs font-bold text-purple-900 dark:text-purple-100">
                    Bathroom Tile Area
                  </Label>
                  <div className="text-xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                    {(
                      wetAreaSettings.bathroomPerimeter *
                      wetAreaSettings.bathrooomTileHeight
                    ).toFixed(2)}{" "}
                    m²
                  </div>
                </div>
              )}
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
              {internalWallArea.toFixed(2)} m²
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internalFinishes.length}</div>
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
    </div>
  );
}
