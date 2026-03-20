// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useUniversalFinishesCalculator, {
  FinishElement,
} from "@/hooks/useUniversalFinishesCalculator";
import usePaintingCalculator from "@/hooks/usePaintingCalculator";
import PaintingLayerConfig from "@/components/PaintingLayerConfig";

// Material lists
const GYPSUM_MATERIALS = ["Gypsum Board 1.2x2.4m"];
const OTHER_CEILING_MATERIALS = [
  "PVC",
  "Acoustic Tiles",
  "Suspended Grid",
  "Blundering 40x40mm",
  "Wood Panels",
  "Exposed Concrete",
];
const GYPSUM_SUPPLEMENTARY_MATERIALS = [
  "Blundering 40x40mm",
  "Metal Ceiling Channel",
  "Metal Ceiling Stud",
  "Gypsum Screws",
  "Corner Tape",
  "Fiber Mesh",
  "Filler",
  "Cornice",
];
const PAINTING_SUPPLEMENTARY_MATERIALS = ["Cornice"];

interface CeilingCalculatorProps {
  finishes: FinishElement[];
  materialPrices: any[];
  onFinishesUpdate?: (finishes: FinishElement[]) => void;
  onCeilingTypeChange?: (type: "gypsum" | "painting" | "other") => void;
  readonly?: boolean;
  quote?: any;
}

export default function CeilingCalculator({
  finishes,
  materialPrices,
  onFinishesUpdate,
  onCeilingTypeChange,
  readonly = false,
  quote,
}: CeilingCalculatorProps) {
  // Ceiling type state
  const [ceilingType, setCeilingType] = useState<
    "gypsum" | "painting" | "other"
  >(quote?.finishes_calculations?.ceiling?.type || "gypsum");

  // Derived data
  const slabArea = useMemo(() => {
    const groundFloorSlab = quote?.concrete_rows?.find(
      (f: any) =>
        f.element === "slab" && f.name?.toLowerCase().includes("ground"),
    );
    return parseFloat(groundFloorSlab?.slabArea) || 0;
  }, [quote?.concrete_rows]);

  const perimeters = useMemo(() => {
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

  // Filter ceiling items
  const ceilingFinishes = useMemo(
    () => finishes.filter((f) => f.category === "ceiling"),
    [finishes],
  );

  // Calculator hook
  const { calculations, totals, wastagePercentage } =
    useUniversalFinishesCalculator(ceilingFinishes, materialPrices, quote);

  // Painting calculator
  const {
    paintings: paintingList,
    totals: paintingTotals,
    addPainting,
    updatePainting,
    deletePainting,
  } = usePaintingCalculator({
    initialPaintings:
      quote?.paintings_specifications?.filter(
        (p: any) => p.location === "Ceiling",
      ) || [],
    materialPrices,
    quote,
    location: "Ceiling",
    surfaceArea: slabArea,
    autoInitialize: false,
  });

  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FinishElement | null>(null);

  // Helper: get material price
  const getCeilingMaterialPrice = useCallback(
    (materialName: string): number => {
      if (!Array.isArray(materialPrices)) return 0;
      const ceilingMaterial = materialPrices.find(
        (m: any) => m.name?.toLowerCase() === "ceiling",
      );
      if (!ceilingMaterial) return 0;
      const materials = ceilingMaterial.type?.materials;
      if (!materials || typeof materials !== "object") return 0;
      const material = materials[materialName];
      if (material) return material.price || 0;
      // fallback case-insensitive
      const key = Object.keys(materials).find(
        (k) => k.toLowerCase() === materialName.toLowerCase(),
      );
      return key ? materials[key]?.price || 0 : 0;
    },
    [materialPrices],
  );

  // Helper: enrich finishes with pricing data from calculations
  const enrichFinishesWithPricing = useCallback(
    (finishesToEnrich: FinishElement[]): FinishElement[] => {
      if (!Array.isArray(calculations) || calculations.length === 0) {
        return finishesToEnrich;
      }

      return finishesToEnrich.map((finish) => {
        const calculation = calculations.find((c) => c.id === finish.id);
        if (calculation) {
          return {
            ...finish,
            price: calculation.unitRate, // Store unit rate as price
            metadata: {
              ...finish.metadata,
              unitRate: calculation.unitRate,
              totalCost: calculation.totalCost,
              totalCostWithWastage: calculation.totalCostWithWastage,
              materialCost: calculation.materialCost,
              materialCostWithWastage: calculation.materialCostWithWastage,
              adjustedQuantity: calculation.adjustedQuantity,
              wastage: calculation.wastage,
            },
          };
        }
        return finish;
      });
    },
    [calculations],
  );

  // Sync pricing data whenever calculations update
  const syncPricingDataToFinishes = useCallback(() => {
    if (!Array.isArray(calculations) || calculations.length === 0) return;
    if (!onFinishesUpdate) return;

    // Find which finishes are missing pricing data
    const needsEnrichment = ceilingFinishes.some(
      (finish) =>
        !finish.price &&
        calculations.some((c) => c.id === finish.id && c.unitRate),
    );

    if (needsEnrichment) {
      // Enrich all finishes with current calculation data
      const enriched = enrichFinishesWithPricing(ceilingFinishes);
      // Only update if something actually changed
      if (JSON.stringify(enriched) !== JSON.stringify(ceilingFinishes)) {
        onFinishesUpdate(enriched);
      }
    }
  }, [
    ceilingFinishes,
    calculations,
    onFinishesUpdate,
    enrichFinishesWithPricing,
  ]);

  // Run sync whenever calculations change
  useEffect(() => {
    syncPricingDataToFinishes();
  }, [syncPricingDataToFinishes]);

  // ---------- AUTO-MANAGEMENT LOGIC (runs on mount and when ceiling type changes) ----------
  const isInitializedRef = useRef(false);
  const prevCeilingTypeRef = useRef(ceilingType);

  useEffect(() => {
    if (readonly) return;

    const hasTypeChanged = prevCeilingTypeRef.current !== ceilingType;
    const isFirstRun = !isInitializedRef.current;

    // Only run on mount or when ceiling type changes
    if (!isFirstRun && !hasTypeChanged) return;

    prevCeilingTypeRef.current = ceilingType;
    isInitializedRef.current = true;

    // Compute desired ceiling finishes based on current type and data
    const desiredCeilingFinishes: FinishElement[] = [];

    // 1. Add type-specific default items
    if (ceilingType === "gypsum" && slabArea > 0) {
      // Gypsum board - reuse existing ID if it exists
      const existingGypsum = ceilingFinishes.find(
        (f) => f.material === "Gypsum Board 1.2x2.4m",
      );
      desiredCeilingFinishes.push({
        id: existingGypsum?.id || "ceiling-gypsum-board",
        category: "ceiling",
        material: "Gypsum Board 1.2x2.4m",
        area: slabArea,
        quantity: slabArea,
        unit: "m²",
        location: "All Rooms",
      });
    } else if (ceilingType === "painting") {
      // Cornice (if perimeter available)
      const corniceLength = Math.ceil(perimeters.corniceLength);
      if (corniceLength > 0) {
        const existingCornice = ceilingFinishes.find(
          (f) => f.material === "Cornice",
        );
        desiredCeilingFinishes.push({
          id: existingCornice?.id || "ceiling-cornice",
          category: "ceiling",
          material: "Cornice",
          area: corniceLength,
          quantity: corniceLength,
          unit: "m",
          location: "All Rooms",
        });
      }
    } else if (ceilingType === "other" && slabArea > 0) {
      // Default PVC
      const existingPVC = ceilingFinishes.find((f) => f.material === "PVC");
      desiredCeilingFinishes.push({
        id: existingPVC?.id || "ceiling-pvc-other",
        category: "ceiling",
        material: "PVC",
        area: slabArea,
        quantity: slabArea,
        unit: "m²",
        location: "All Rooms",
      });
    }

    // 2. Blundering (for all except painting)
    if (ceilingType !== "painting" && slabArea > 0) {
      const blunderingMeters = Math.ceil(slabArea * 3.36 * 1.15);
      const existingBlundering = ceilingFinishes.find(
        (f) => f.material === "Blundering 40x40mm",
      );
      desiredCeilingFinishes.push({
        id: existingBlundering?.id || "ceiling-blundering",
        category: "ceiling",
        material: "Blundering 40x40mm",
        area: slabArea,
        unit: "m",
        quantity: blunderingMeters,
        location: "Ceiling battening for support",
      });
    }

    // 3. Gypsum supplementary components (only if gypsum board exists in desired list)
    const gypsumBoardInDesired = desiredCeilingFinishes.some(
      (f) => f.material === "Gypsum Board 1.2x2.4m",
    );
    if (gypsumBoardInDesired) {
      const gypsumBoardItems = desiredCeilingFinishes.filter(
        (f) => f.material === "Gypsum Board 1.2x2.4m",
      );
      const totalArea = gypsumBoardItems.reduce(
        (sum, f) => sum + (f.area || 0),
        0,
      );
      const boardArea = 1.2 * 2.4;
      const totalBoards = Math.ceil((totalArea / boardArea) * 1.25); // 25% waste

      // Base quantities
      const channels = totalBoards * 4;
      const studs = totalBoards * 2;
      const screwsBase = Math.ceil(totalArea * 25);

      // Get prices
      const gypsumBoardPrice = getCeilingMaterialPrice("Gypsum Board 1.2x2.4m");
      const channelPrice = getCeilingMaterialPrice("Metal Ceiling Channel");
      const studPrice = getCeilingMaterialPrice("Metal Ceiling Stud");
      const screwPrice = getCeilingMaterialPrice("Gypsum Screws");
      const cornerTapePrice = getCeilingMaterialPrice("Corner Tape");
      const fiberMeshPrice = getCeilingMaterialPrice("Fiber Mesh");

      // Cost-based distribution for some items
      const mainCost =
        totalBoards * gypsumBoardPrice +
        channels * channelPrice +
        studs * studPrice;
      const supplementaryCost = mainCost * 0.1;

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
          : screwsBase;

      const fillerQuantity = Math.ceil(totalArea / 10 / 3); // 25kg bags

      const components = [
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
        { material: "Filler", quantity: fillerQuantity, unit: "bag" as const },
        {
          material: "Cornice",
          quantity: Math.ceil(perimeters.corniceLength),
          unit: "m" as const,
        },
      ];

      components.forEach((comp) => {
        // Reuse existing ID if this material already exists in desired finishes
        const existingItem = desiredCeilingFinishes.find(
          (f) => f.material === comp.material,
        );
        // Also check current finishes for truly persistent IDs across sessions
        const persistentItem = ceilingFinishes.find(
          (f) => f.material === comp.material,
        );
        desiredCeilingFinishes.push({
          id:
            existingItem?.id ||
            persistentItem?.id ||
            `finish-ceiling-gypsum-${comp.material.replace(/\s+/g, "-").toLowerCase()}`,
          category: "ceiling",
          material: comp.material,
          area: totalArea,
          unit: comp.unit,
          quantity: comp.quantity,
          location: "Auto-calculated",
        });
      });
    }

    // Always update when type changes or on first run
    onFinishesUpdate?.(enrichFinishesWithPricing(desiredCeilingFinishes));
  }, [
    ceilingType,
    slabArea,
    perimeters,
    ceilingFinishes,
    onFinishesUpdate,
    readonly,
    enrichFinishesWithPricing,
    getCeilingMaterialPrice,
  ]);

  // ---------- PAINTING INITIALIZATION (separate, as it uses its own hook) ----------
  useEffect(() => {
    if (
      ceilingType !== "painting" ||
      slabArea <= 0 ||
      paintingList.length > 0 ||
      readonly
    ) {
      return;
    }

    // Add default painting
    addPainting(slabArea, "Ceiling");
  }, [ceilingType, slabArea, paintingList.length, readonly, addPainting]);

  // Simplify painting specs (1 coat each)
  useEffect(() => {
    if (paintingList.length === 0) return;
    const needsUpdate = paintingList.some(
      (p) =>
        p.location === "Ceiling" &&
        (p.skimming.coats !== 1 ||
          p.undercoat.enabled !== false ||
          p.finishingPaint.coats !== 1),
    );
    if (needsUpdate) {
      paintingList.forEach((painting) => {
        if (painting.location === "Ceiling") {
          updatePainting(painting.id, {
            ...painting,
            skimming: { ...painting.skimming, coats: 1 },
            undercoat: { ...painting.undercoat, enabled: false },
            finishingPaint: { ...painting.finishingPaint, coats: 1 },
          });
        }
      });
    }
  }, [paintingList, updatePainting]);

  // ---------- UI HANDLERS ----------
  const handleCeilingTypeChange = (
    newType: "gypsum" | "painting" | "other",
  ) => {
    setCeilingType(newType);
    onCeilingTypeChange?.(newType);
    // Auto effect will handle finishes update
  };

  const handleAddFinish = () => {
    if (!quote?.concrete_rows) return;
    const defaultMaterial =
      ceilingType === "painting"
        ? "Paint - Ceiling"
        : ceilingType === "other"
          ? "PVC"
          : "Gypsum Board 1.2x2.4m";

    // Check if item with same material already exists
    const existingItem = ceilingFinishes.find(
      (f) => f.material === defaultMaterial,
    );

    // Generate unique ID only if this is a truly new material addition
    const newFinish: FinishElement = {
      id:
        existingItem?.id ||
        `ceiling-custom-${defaultMaterial.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`,
      category: "ceiling",
      material: defaultMaterial,
      area: slabArea,
      quantity: slabArea,
      unit: "m²",
      location: "All Rooms",
    };

    // Only add if it's a new material type
    if (!existingItem) {
      // Only pass ceiling finishes to onFinishesUpdate
      const updatedCeilingFinishes = [...ceilingFinishes, newFinish];
      onFinishesUpdate?.(enrichFinishesWithPricing(updatedCeilingFinishes));
    }

    setEditingId(newFinish.id);
    setEditForm(newFinish);
  };

  const handleDeleteFinish = (id: string) => {
    // Only update ceiling finishes
    const updatedCeilingFinishes = ceilingFinishes.filter((f) => f.id !== id);
    if (
      JSON.stringify(ceilingFinishes) !== JSON.stringify(updatedCeilingFinishes)
    ) {
      onFinishesUpdate?.(enrichFinishesWithPricing(updatedCeilingFinishes));
    }
  };

  const handleEditFinish = (finish: FinishElement) => {
    setEditingId(finish.id);
    setEditForm({ ...finish });
  };

  const handleEditFormChange = (field: string, value: any) => {
    if (editForm) setEditForm({ ...editForm, [field]: value });
  };

  const handleSaveEdit = () => {
    if (editForm && onFinishesUpdate) {
      // Only update ceiling finishes
      const updatedCeilingFinishes = ceilingFinishes.map((f) =>
        f.id === editingId ? editForm : f,
      );
      onFinishesUpdate(enrichFinishesWithPricing(updatedCeilingFinishes));
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(value);

  const filteredCalculations = calculations.filter((calc) =>
    calc.material.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Ceiling Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Ceiling Type</CardTitle>
          <CardDescription>
            Select the type of ceiling configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={ceilingType}
            onValueChange={(value) =>
              handleCeilingTypeChange(value as "gypsum" | "painting" | "other")
            }
          >
            <div className="flex items-center space-x-2 mb-4">
              <RadioGroupItem value="gypsum" id="gypsum" />
              <Label htmlFor="gypsum" className="cursor-pointer font-medium">
                Gypsum Ceiling
              </Label>
              <span className="text-sm text-gray-500">
                (With automatic support components)
              </span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <RadioGroupItem value="painting" id="painting" />
              <Label htmlFor="painting" className="cursor-pointer font-medium">
                Painting Ceiling
              </Label>
              <span className="text-sm text-gray-500">
                (Paint, skimming, optional cornice)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="cursor-pointer font-medium">
                Other Ceiling Types
              </Label>
              <span className="text-sm text-gray-500">
                (PVC, Acoustic Tiles, etc.)
              </span>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totals.totalArea.toFixed(2)} m²</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Material Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {formatCurrency(totals.totalMaterialCostWithWastage)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">
              {formatCurrency(totals.totalCostWithWastage)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <CardTitle>
                {ceilingType === "gypsum" &&
                  "Gypsum Ceiling Materials & Components"}
                {ceilingType === "painting" && "Painting Ceiling Configuration"}
                {ceilingType === "other" && "Ceiling Types & Materials"}
              </CardTitle>
              <CardDescription>
                {ceilingType === "gypsum" &&
                  "Configure gypsum ceiling with automatic support components (blundering, channels, studs, etc.)"}
                {ceilingType === "painting" &&
                  "Configure ceiling with paint, light skimming, covermat, and optional cornice"}
                {ceilingType === "other" &&
                  "Select from alternative ceiling types (PVC, Acoustic, Concrete, etc.)"}
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
                        {ceilingType === "gypsum" && (
                          <>
                            <SelectGroup>
                              <SelectLabel className="font-semibold bg-gray-100 dark:bg-primary rounded-3xl">
                                Main Materials
                              </SelectLabel>
                              {GYPSUM_MATERIALS.map((material) => (
                                <SelectItem key={material} value={material}>
                                  {material}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel className="font-semibold bg-gray-100 dark:bg-primary rounded-3xl">
                                Supplementary Materials
                              </SelectLabel>
                              {GYPSUM_SUPPLEMENTARY_MATERIALS.map(
                                (material) => (
                                  <SelectItem key={material} value={material}>
                                    {material}
                                  </SelectItem>
                                ),
                              )}
                            </SelectGroup>
                          </>
                        )}
                        {ceilingType === "painting" && (
                          <SelectGroup>
                            <SelectLabel className="font-semibold bg-gray-100 dark:bg-primary rounded-3xl">
                              Supplementary Materials
                            </SelectLabel>
                            {PAINTING_SUPPLEMENTARY_MATERIALS.map(
                              (material) => (
                                <SelectItem key={material} value={material}>
                                  {material}
                                </SelectItem>
                              ),
                            )}
                          </SelectGroup>
                        )}
                        {ceilingType === "other" && (
                          <SelectGroup>
                            <SelectLabel className="font-semibold bg-gray-100 dark:bg-primary rounded-3xl">
                              Ceiling Types
                            </SelectLabel>
                            {OTHER_CEILING_MATERIALS.map((material) => (
                              <SelectItem key={material} value={material}>
                                {material}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )}
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

          {/* Table */}
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
                        <TableCell className="text-right">
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
              <div className="text-xs">Total Quantity</div>
              <div className="text-lg">{totals.totalArea.toFixed(2)} m²</div>
            </div>
            <div>
              <div className="text-xs">Base Cost</div>
              <div className="text-lg">
                {formatCurrency(totals.totalMaterialCost)}
              </div>
            </div>
            <div>
              <div className="text-xs">Wastage ({wastagePercentage}%)</div>
              <div className="text-lg">
                {formatCurrency(
                  totals.totalMaterialCostWithWastage -
                    totals.totalMaterialCost,
                )}
              </div>
            </div>
            <div>
              <div className="text-xs">Total with Wastage</div>
              <div className="text-lg text-green-600">
                {formatCurrency(totals.totalMaterialCostWithWastage)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Painting Layers */}
      {ceilingType === "painting" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Ceiling Painting Specifications
            </CardTitle>
            <CardDescription className="text-slate-700 dark:text-slate-300">
              Simplified painting with skimming and emulsion paint (1 coat each)
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
                  wallDimensions={{
                    internalWallPerimiter: 0,
                    internalWallHeight: 0,
                  }}
                />
              ))}
            {!readonly && paintingList.length === 0 && (
              <Button
                onClick={() => addPainting(slabArea, "Ceiling")}
                className="w-full bg-primary hover:bg-primary/30 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Ceiling Painting
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
                  <div className="text-xs font-bold">Skimming Bags</div>
                  <div className="text-lg font-bold">
                    {paintingTotals.skimmingBags}
                  </div>
                </div>
                <div className="p-3 rounded-3xl">
                  <div className="text-xs font-bold">Emulsion Paint</div>
                  <div className="text-lg font-bold">
                    {paintingTotals.finishingLitres.toFixed(1)} L
                  </div>
                </div>
                <div className="p-3 rounded-3xl">
                  <div className="text-xs font-bold">Skimming Cost</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(paintingTotals.skimmingCost)}
                  </div>
                </div>
                <div className="p-3 rounded-3xl">
                  <div className="text-xs font-bold">Paint Cost</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(paintingTotals.finishingCost)}
                  </div>
                </div>
                <div className="p-3 rounded-3xl">
                  <div className="text-xs font-bold">Total Paint Cost</div>
                  <div className="text-lg font-bold text-green-700">
                    {formatCurrency(
                      paintingTotals.skimmingCost +
                        paintingTotals.finishingCost,
                    )}
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
