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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  "Painting",
];

export default function ExternalFinishesCalculator({
  finishes,
  materialPrices,
  onFinishesUpdate,
  readonly = false,
  quote,
  wallDimensions,
}: Props) {
  const [externalFinishType, setExternalFinishType] = useState<
    "keying" | "plaster"
  >("plaster");
  const [externalFinishes, setExternalFinishes] = useState<FinishElement[]>(
    finishes.filter((f) => f.category === "external-walling"),
  );
  const [externalPlasterEnabled, setExternalPlasterEnabled] = useState(false);
  const [externalPlasterThickness, setExternalPlasterThickness] = useState(25); // Default 25mm
  const [wallPointingEnabled, setWallPointingEnabled] = useState(false);
  const [externalPaintingEnabled, setExternalPaintingEnabled] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FinishElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [plasterCalculations, setPlasterCalculations] = useState<any>(null);
  const [wallPointingCalculations, setWallPointingCalculations] =
    useState<any>(null);

  // Constants
  const CEMENT_BAG_KG = 50;
  const CEMENT_VOLUME_PER_BAG = 0.035; // m³
  const WALL_POINTING_THICKNESS_MM = 5; // 5mm for wall pointing
  const PLASTER_THICKNESS_MM = externalPlasterThickness || 25; // Default 25mm

  // Calculate external wall area (perimeter × height)
  const externalWallArea =
    (wallDimensions?.externalWallPerimiter || 0) *
    (wallDimensions?.externalWallHeight || 0);

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

  // Calculate net external wall area
  const netExternalWallArea = calculateNetWallArea("external");

  // Helper function to get material price
  const getMaterialPrice = (materialName: string): number => {
    if (!materialPrices || materialPrices.length === 0) return 0;

    // Try to find material in masonry materials category
    const masonryMaterials = materialPrices.find(
      (p: any) => p.name?.toLowerCase() === materialName.toLowerCase(),
    );

    return masonryMaterials ? masonryMaterials.price || 0 : 0;
  };

  // Helper function to calculate plaster/pointing volumes and costs
  const calculatePlasterComponents = (
    wallArea: number,
    thicknessMm: number,
    includeInCalculations: boolean = false,
  ) => {
    if (!includeInCalculations || wallArea <= 0 || thicknessMm <= 0) {
      return null;
    }

    const plasterRatio = quote?.qsSettings?.plaster_ratio || "1:3";
    let cementPart = 1;
    let sandPart = 3;

    if (typeof plasterRatio === "string" && plasterRatio.includes(":")) {
      const parts = plasterRatio.split(":").map((p) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        cementPart = parts[0];
        sandPart = parts[1];
      }
    }

    const totalParts = cementPart + sandPart;
    const plasterVolume = wallArea * (thicknessMm / 1000);
    const cementVolume = (cementPart / totalParts) * plasterVolume;
    const sandVolume = (sandPart / totalParts) * plasterVolume;

    // Convert cement volume to bags
    const cementBags = cementVolume / CEMENT_VOLUME_PER_BAG;
    const cementKg = cementBags * CEMENT_BAG_KG;

    // Get prices
    const cementPrice = getMaterialPrice("Cement");
    const sandPrice = getMaterialPrice("Sand");

    // Calculate costs
    const cementCost = cementBags * cementPrice;
    const sandCost = sandVolume * sandPrice;
    const totalCost = cementCost + sandCost;

    return {
      volume: plasterVolume,
      cementVolume,
      cementBags,
      cementKg,
      cementPrice,
      cementCost,
      sandVolume,
      sandPrice,
      sandCost,
      totalCost,
      ratio: plasterRatio,
      cementPart,
      sandPart,
      totalParts,
      thicknessMm,
    };
  };

  // Hooks for calculations
  const { calculations: finishCalcs, totals: finishTotals } =
    useExternalFinishesCalculator(
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
    initialPaintings:
      quote?.paintings_specifications?.filter(
        (p: any) => p.location === "Exterior Walls",
      ) || [],
    materialPrices,
    quote,
    location: "Exterior Walls",
    surfaceArea: externalWallArea,
    autoInitialize: true,
  });

  const plasterFinish = externalFinishes.find((f) =>
    f.material?.toLowerCase().includes("plaster"),
  );
  const plasterVolume =
    externalPlasterEnabled && netExternalWallArea > 0
      ? netExternalWallArea * (externalPlasterThickness / 1000)
      : 0;

  const handleAddFinish = () => {
    // Don't allow adding finishes if keying is selected
    if (externalFinishType === "keying") return;

    const newFinish: FinishElement = {
      id: `finish-external-manual-${Math.random().toString(36).substr(2, 9)}`,
      category: "external-walling",
      material: "Cladding",
      area: netExternalWallArea,
      quantity: netExternalWallArea,
      unit: "m²",
    };
    const updated = [...externalFinishes, newFinish];
    setExternalFinishes(updated);
    setEditingId(newFinish.id);
    setEditForm(newFinish);
    if (onFinishesUpdate) onFinishesUpdate(updated);
  };

  const handleAddPlaster = () => {
    // Calculate plaster components with pricing
    const plasterCalcs = calculatePlasterComponents(
      netExternalWallArea,
      PLASTER_THICKNESS_MM,
      true,
    );

    if (!plasterCalcs) return;

    setPlasterCalculations(plasterCalcs);

    // Get plaster ratio from QS settings
    const plasterRatio = quote?.qsSettings?.plaster_ratio || "1:3";

    // Parse ratio (e.g., "1:3" → [1, 3])
    let cementPart = 1;
    let sandPart = 3;

    if (typeof plasterRatio === "string" && plasterRatio.includes(":")) {
      const parts = plasterRatio.split(":").map((p) => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        cementPart = parts[0];
        sandPart = parts[1];
      }
    }

    const totalParts = cementPart + sandPart;
    const plasterVolume = plasterCalcs.volume;
    const cementVolume = plasterCalcs.cementVolume;
    const sandVolume = plasterCalcs.sandVolume;

    // Create plaster material entries
    const materialEntries: FinishElement[] = [
      {
        id: `finish-external-plaster-base`, // Stable ID for auto-generated plaster base
        category: "external-walling",
        material: "External Plaster - Base",
        area: netExternalWallArea,
        quantity: plasterVolume,
        unit: "m³",
        specifications: {
          thickness: PLASTER_THICKNESS_MM,
          ratio: plasterRatio,
          cementPart,
          sandPart,
          cementBags: plasterCalcs.cementBags,
          cementCost: plasterCalcs.cementCost,
          sandCost: plasterCalcs.sandCost,
          totalCost: plasterCalcs.totalCost,
        },
      },
    ];

    // Add cement component
    if (cementVolume > 0) {
      materialEntries.push({
        id: `finish-external-cement`, // Stable ID for auto-generated cement
        category: "external-walling",
        material: "Plaster - Cement Component",
        area: netExternalWallArea,
        quantity: plasterCalcs.cementBags,
        unit: "bag",
        specifications: {
          part: "cement",
          ratio: `${cementPart}/${totalParts}`,
          volume: cementVolume,
          price: plasterCalcs.cementPrice,
          cost: plasterCalcs.cementCost,
        },
      });
    }

    // Add sand component
    if (sandVolume > 0) {
      materialEntries.push({
        id: `finish-external-sand`, // Stable ID for auto-generated sand
        category: "external-walling",
        material: "Plaster - Sand Component",
        area: netExternalWallArea,
        quantity: sandVolume,
        unit: "m³",
        specifications: {
          part: "sand",
          ratio: `${sandPart}/${totalParts}`,
          price: plasterCalcs.sandPrice,
          cost: plasterCalcs.sandCost,
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
      (f) =>
        f.material?.toLowerCase().includes("plaster") ||
        f.material?.toLowerCase().includes("cement component") ||
        f.material?.toLowerCase().includes("sand component"),
    );

    if (!hasPlasterMaterials) {
      setExternalPlasterEnabled(false);
    }
    if (onFinishesUpdate) onFinishesUpdate(updated);
  };

  const handleUpdateFinish = (id: string, field: string, value: any) => {
    const updated = externalFinishes.map((f) =>
      f.id === id ? { ...f, [field]: value } : f,
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
    finish.material.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Auto-add plaster when user selects "plaster" mode
  useEffect(() => {
    if (externalFinishType === "plaster") {
      // Check if plaster already exists
      const hasPlasterMaterials = externalFinishes.some(
        (f) =>
          f.material?.toLowerCase().includes("plaster") ||
          f.id === "finish-external-plaster-base",
      );

      // If no plaster exists, add it automatically
      if (!hasPlasterMaterials && externalFinishes.length === 0) {
        handleAddPlaster();
      }
    }
  }, [externalFinishType]);

  // Auto-add wall pointing when user selects "keying" mode
  useEffect(() => {
    if (externalFinishType === "keying" && !wallPointingCalculations) {
      const pointingCalcs = calculatePlasterComponents(
        netExternalWallArea,
        WALL_POINTING_THICKNESS_MM,
        true,
      );
      setWallPointingCalculations(pointingCalcs);
    }
  }, [externalFinishType]);

  // Auto-enable painting when plaster is selected AND painting finish exists
  useEffect(() => {
    const hasPaintingFinish = externalFinishes.some(
      (f) => f.material === "Painting",
    );
    if (externalFinishType === "plaster" && hasPaintingFinish) {
      setExternalPaintingEnabled(true);
    } else if (externalFinishType !== "plaster" || !hasPaintingFinish) {
      setExternalPaintingEnabled(false);
    }
  }, [externalFinishType, externalFinishes]);

  return (
    <div className="space-y-6">
      {/* External Finish Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>External Finish Type</CardTitle>
          <CardDescription>
            Select the primary external finish method for the walls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={externalFinishType}
            onValueChange={(value) => {
              setExternalFinishType(value as "keying" | "plaster");
              // Clear finishes when switching to keying
              if (value === "keying") {
                setExternalFinishes([]);
                if (onFinishesUpdate) onFinishesUpdate([]);
              }
            }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <RadioGroupItem value="keying" id="keying" />
              <Label htmlFor="keying" className="cursor-pointer font-medium">
                Keying / Wall Pointing Only
              </Label>
              <span className="text-sm text-gray-500">
                (No additional finishes)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="plaster" id="plaster" />
              <Label htmlFor="plaster" className="cursor-pointer font-medium">
                Plaster with Additional Finishes
              </Label>
              <span className="text-sm text-gray-500">
                (Cladding, Marble, Painting, etc.)
              </span>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Wall Pointing Section - Only in Keying Mode */}
      {externalFinishType === "keying" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Wall Pointing / Keying
            </CardTitle>
            <CardDescription>
              Configure wall pointing requirements for external walls (5mm
              thickness)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wallPointingCalculations ? (
              <div className="space-y-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pointing material requirements (5mm thickness):
                </p>

                {/* Cement */}
                <div className="grid grid-cols-3 gap-2 text-sm p-2 bg-white dark:bg-gray-800 rounded">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Cement
                    </p>
                    <p className="font-medium">
                      {wallPointingCalculations.cementBags.toFixed(2)} bags
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Unit Price
                    </p>
                    <p className="font-medium">
                      {formatCurrency(wallPointingCalculations.cementPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Cost
                    </p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(wallPointingCalculations.cementCost)}
                    </p>
                  </div>
                </div>

                {/* Sand */}
                <div className="grid grid-cols-3 gap-2 text-sm p-2 bg-white dark:bg-gray-800 rounded">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Sand
                    </p>
                    <p className="font-medium">
                      {wallPointingCalculations.sandVolume.toFixed(3)} m³
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Unit Price
                    </p>
                    <p className="font-medium">
                      {formatCurrency(wallPointingCalculations.sandPrice)}/m³
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Cost
                    </p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(wallPointingCalculations.sandCost)}
                    </p>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border border-amber-300 dark:border-amber-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Wall Pointing Cost
                  </p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(wallPointingCalculations.totalCost)}
                  </p>
                </div>

                {!readonly && (
                  <Button
                    onClick={() => setWallPointingCalculations(null)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Wall Pointing
                  </Button>
                )}
              </div>
            ) : (
              !readonly && (
                <Button
                  onClick={() => {
                    const pointingCalcs = calculatePlasterComponents(
                      netExternalWallArea,
                      WALL_POINTING_THICKNESS_MM,
                      true,
                    );
                    setWallPointingCalculations(pointingCalcs);
                  }}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Wall Pointing
                </Button>
              )
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* External Plaster Section */}
      {externalFinishType === "plaster" ? (
        <Card className="">
          <CardHeader className="">
            <CardTitle className="flex items-center gap-2">
              External Plaster
            </CardTitle>
            <CardDescription>
              Configure plaster thickness for external walls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plasterFinish ? (
              <div className="space-y-4">
                {/* Thickness Input */}
                <div className="bg-white dark:bg-gray-900/50 p-3 rounded-lg">
                  <Label
                    htmlFor="plaster-thickness"
                    className="text-sm font-medium"
                  >
                    Plaster Thickness (mm)
                  </Label>
                  <Input
                    id="plaster-thickness"
                    type="number"
                    min="10"
                    max="100"
                    step="1"
                    value={externalPlasterThickness}
                    onChange={(e) =>
                      setExternalPlasterThickness(
                        parseFloat(e.target.value) || 25,
                      )
                    }
                    className="mt-2"
                    disabled={readonly}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Range: 10-100mm (default: 25mm)
                  </p>
                </div>

                {/* Calculations Display */}
                <div className="grid grid-cols-2 gap-2 text-sm bg-white dark:bg-gray-900/50 p-2 rounded">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Wall Area
                    </p>
                    <p className="">{externalWallArea.toFixed(2)} m²</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Volume (m³)
                    </p>
                    <p className="">{plasterVolume.toFixed(3)} m³</p>
                  </div>
                </div>

                {/* Cement & Sand Breakdown */}
                {plasterCalculations && (
                  <div className="space-y-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm">Material Breakdown</h4>

                    {/* Cement */}
                    <div className="grid grid-cols-3 gap-2 text-sm p-2 bg-white dark:bg-gray-800 rounded">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Cement
                        </p>
                        <p className="font-medium">
                          {plasterCalculations.cementBags.toFixed(2)} bags
                        </p>
                        <p className="text-xs text-gray-500">
                          {plasterCalculations.cementKg.toFixed(1)} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Unit Price
                        </p>
                        <p className="font-medium">
                          {formatCurrency(plasterCalculations.cementPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Total Cost
                        </p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(plasterCalculations.cementCost)}
                        </p>
                      </div>
                    </div>

                    {/* Sand */}
                    <div className="grid grid-cols-3 gap-2 text-sm p-2 bg-white dark:bg-gray-800 rounded">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Sand
                        </p>
                        <p className="font-medium">
                          {plasterCalculations.sandVolume.toFixed(3)} m³
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Unit Price
                        </p>
                        <p className="font-medium">
                          {formatCurrency(plasterCalculations.sandPrice)}/m³
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Total Cost
                        </p>
                        <p className="font-medium text-green-600">
                          {formatCurrency(plasterCalculations.sandCost)}
                        </p>
                      </div>
                    </div>

                    {/* Ratio & Total */}
                    <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border border-blue-300 dark:border-blue-700">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Ratio (C:S)
                        </p>
                        <p className="font-medium">
                          {plasterCalculations.ratio}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Total Material Cost
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(plasterCalculations.totalCost)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!readonly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFinish(plasterFinish.id)}
                    className="w-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Plaster
                  </Button>
                )}
              </div>
            ) : (
              !readonly && (
                <Button onClick={handleAddPlaster} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add External Plaster
                </Button>
              )
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <CardTitle>External Finishes Materials</CardTitle>
              <CardDescription>Manage external wall finishes.</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center">
              {!readonly && externalFinishType === "plaster" && (
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
          {externalFinishType === "keying" && (
            <div className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Keying/Wall Pointing Mode:</strong> External finishes
                are not available in this mode. Only wall preparation with
                keying and pointing is applied.
              </p>
            </div>
          )}

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
                          f.id === editingId ? editForm : f,
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
          {externalFinishType === "plaster" ? (
            <>
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
                    {filteredFinishes.filter(
                      (f) => !f.material?.toLowerCase().includes("plaster"),
                    ).length === 0 ? (
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
                      filteredFinishes
                        .filter(
                          (f) => !f.material?.toLowerCase().includes("plaster"),
                        )
                        .map((finish) => {
                          const calc = finishCalcs.find(
                            (c) => c.id === finish.id,
                          );
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
                                      onClick={() =>
                                        handleRemoveFinish(finish.id)
                                      }
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
                    {
                      externalFinishes.filter(
                        (f) => !f.material?.toLowerCase().includes("plaster"),
                      ).length
                    }
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold">Total Cost</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(finishTotals.totalCost)}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-center text-gray-500 py-8">
                No additional finishes in Keying/Wall Pointing mode. External
                walls will be prepared with keying and wall pointing only.
              </p>
            </>
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
              {
                externalFinishes.filter(
                  (f) => !f.material?.toLowerCase().includes("plaster"),
                ).length
              }
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
      {externalFinishType === "plaster" &&
        externalPaintingEnabled &&
        externalFinishes.some(
          (f) => f.material.toLowerCase() === "painting",
        ) && (
          <Card>
            <CardHeader className="border-b rounded-t-2xl">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-2xl">🎨</span> External Painting
                Specifications
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
                    addPainting(externalWallArea, "Exterior Walls")
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
        )}
    </div>
  );
}
