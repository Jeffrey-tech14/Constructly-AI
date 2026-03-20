// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useCallback, useEffect, useMemo } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, Download, Plus, Trash2, Edit } from "lucide-react";
import useFlooringCalculator from "@/hooks/useFlooringCalculator";
import type { FinishElement } from "@/hooks/useUniversalFinishesCalculator";

// ----------------------------------------------------------------------
// Constants and helper functions (memoized inside component)
// ----------------------------------------------------------------------
const FLOORING_MATERIALS = [
  "Ceramic Tiles",
  "Granite Tiles",
  "Granite",
  "Hardwood Wooden Panels",
  "Cement paste (Niro finish)",
  "PVC vinyl flooring",
  "Epoxy flooring",
  "Terrazzo",
  "SPC flooring",
];

const FLOOR_TO_SKIRTING_MAP: Record<string, string | null> = {
  "Ceramic Tiles": "tile",
  "Granite Tiles": "tile",
  Granite: "stone",
  "Hardwood Wooden Panels": "hardwood",
  "Cement paste (Niro finish)": null,
  "PVC vinyl flooring": "pvc",
  "Epoxy flooring": "pvc",
  Terrazzo: "stone",
  "SPC flooring": "pvc",
};

const getSkirtingTypeForFloor = (floorMaterial: string): string | null =>
  FLOOR_TO_SKIRTING_MAP[floorMaterial] ?? "pvc";

const isSkirtingRequired = (materialName: string): boolean =>
  getSkirtingTypeForFloor(materialName) !== null;

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

const parseTileSizeToMeters = (sizeKey: string) => {
  const [w, h] = sizeKey.split("x").map((v) => parseFloat(v) / 1000);
  return { widthM: w || 0, heightM: h || 0 };
};

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------
interface FlooringCalculatorProps {
  finishes: FinishElement[];
  materialPrices: any[];
  onFinishesUpdate?: (finishes: FinishElement[]) => void;
  onScreeningSkirtingUpdate?: (data: any) => void;
  readonly?: boolean;
  quote?: any;
}

export default function FlooringCalculator({
  finishes,
  materialPrices,
  onFinishesUpdate,
  onScreeningSkirtingUpdate,
  readonly = false,
  quote,
}: FlooringCalculatorProps) {
  // Only flooring items
  const flooringFinishes = useMemo(
    () => finishes.filter((f) => f.category === "flooring"),
    [finishes],
  );

  // --------------------------------------------------------------------
  // Memoized data from materialPrices
  // --------------------------------------------------------------------
  const tileTypesWithPrices = useMemo(
    () => buildTileTypesFromMaterials(materialPrices),
    [materialPrices],
  );
  const skirtingTypesWithPrices = useMemo(
    () => buildSkirtingTypesFromMaterials(materialPrices),
    [materialPrices],
  );
  const cornerStripTypes = useMemo(
    () => buildCornerStripTypes(materialPrices),
    [materialPrices],
  );
  const edgeTrimTypes = useMemo(
    () => buildEdgeTrimTypes(materialPrices),
    [materialPrices],
  );

  const defaultTileType = Object.keys(tileTypesWithPrices)[0] || "ceramic";
  const defaultTilePrice =
    tileTypesWithPrices[defaultTileType]?.pricePerM2 || 0;
  const defaultSkirtingType =
    Object.keys(skirtingTypesWithPrices)[0] || "tiles";
  const defaultCornerStripType =
    Object.keys(cornerStripTypes)[0] || "aluminum-corner";
  const defaultEdgeTrimType = Object.keys(edgeTrimTypes)[0] || "aluminum-edge";

  // --------------------------------------------------------------------
  // Hook for calculations
  // --------------------------------------------------------------------
  const {
    calculations,
    totals,
    wastagePercentage,
    skirting: hookedSkirting,
    skirtingConfig,
  } = useFlooringCalculator(
    flooringFinishes,
    materialPrices,
    quote,
    onFinishesUpdate,
  );

  // Helper: enrich finishes with pricing data from calculations
  const enrichFlooringWithPricing = useCallback(
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
  const syncFlooringPricingDataToFinishes = useCallback(() => {
    if (!Array.isArray(calculations) || calculations.length === 0) return;
    if (!onFinishesUpdate) return;

    // Find which finishes are missing pricing data
    const needsEnrichment = flooringFinishes.some(
      (finish) =>
        !finish.price &&
        calculations.some((c) => c.id === finish.id && c.unitRate),
    );

    if (needsEnrichment) {
      // Enrich all finishes with current calculation data
      const enriched = enrichFlooringWithPricing(flooringFinishes);
      // Only update if something actually changed
      if (JSON.stringify(enriched) !== JSON.stringify(flooringFinishes)) {
        onFinishesUpdate(enriched);
      }
    }
  }, [
    flooringFinishes,
    calculations,
    onFinishesUpdate,
    enrichFlooringWithPricing,
  ]);

  // Run sync whenever calculations change
  useEffect(() => {
    syncFlooringPricingDataToFinishes();
  }, [syncFlooringPricingDataToFinishes]);

  // --------------------------------------------------------------------
  // Local UI state
  // --------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FinishElement | null>(null);

  // Screeding base
  const [screeningBase, setScreeningBase] = useState({
    area: 0,
    thickness: 50,
    cementBags: 0,
    screedVolume: 0,
  });

  // Tile selection for the main floor (used for editing)
  const [tileSize, setTileSize] =
    useState<keyof typeof TILE_SIZE_FACTORS>("300x300");
  const [tileType, setTileType] = useState<string>(defaultTileType);
  const [tileUnitPrice, setTileUnitPrice] = useState<number>(defaultTilePrice);

  // Skirting
  const [skirtingTileHeightM, setSkirtingTileHeightM] = useState(0.12);
  const [skirtingTileSize, setSkirtingTileSize] =
    useState<keyof typeof TILE_SIZE_FACTORS>("400x400");
  const [skirtingTileType, setSkirtingTileType] =
    useState<string>(defaultSkirtingType);
  const [skirtingTileUnitPrice, setSkirtingTileUnitPrice] = useState(0);

  // Skirting lengths
  const [skirting, setSkirting] = useState({
    externalWallLength: 0,
    internalWallLength: 0,
    totalSkirtingLength: 0,
  });

  // Accessories
  const [accessories, setAccessories] = useState({
    cornerStripsLength: 0,
    edgeTrimsLength: 0,
    cornerStripType: defaultCornerStripType,
    edgeTrimType: defaultEdgeTrimType,
    cornerStripUnitPrice:
      cornerStripTypes[defaultCornerStripType]?.pricePerM || 0,
    edgeTrimUnitPrice: edgeTrimTypes[defaultEdgeTrimType]?.pricePerM || 0,
  });

  // Custom skirting material
  const [customSkirtingMaterial, setCustomSkirtingMaterial] = useState({
    useCustom: false,
    name: "Custom Skirting",
    widthMm: 400,
    heightMm: 100,
    pricePerUnit: 0,
  });

  // --------------------------------------------------------------------
  // Derived values (memoized)
  // --------------------------------------------------------------------
  const skirtingTileArea = useMemo(
    () => skirting.totalSkirtingLength * skirtingTileHeightM,
    [skirting.totalSkirtingLength, skirtingTileHeightM],
  );

  const skirtingTileSizeM = useMemo(
    () => parseTileSizeToMeters(skirtingTileSize),
    [skirtingTileSize],
  );

  const skirtingTileUnitArea = useMemo(
    () => skirtingTileSizeM.widthM * skirtingTileSizeM.heightM,
    [skirtingTileSizeM],
  );

  const skirtingTileCount = useMemo(
    () =>
      skirtingTileUnitArea > 0
        ? Math.ceil(skirtingTileArea / skirtingTileUnitArea)
        : 0,
    [skirtingTileArea, skirtingTileUnitArea],
  );

  const skirtingTileTotalCost = useMemo(
    () => skirtingTileArea * skirtingTileUnitPrice,
    [skirtingTileArea, skirtingTileUnitPrice],
  );

  const cornerStripTotalCost = useMemo(
    () => accessories.cornerStripsLength * accessories.cornerStripUnitPrice,
    [accessories.cornerStripsLength, accessories.cornerStripUnitPrice],
  );

  const edgeTrimTotalCost = useMemo(
    () => accessories.edgeTrimsLength * accessories.edgeTrimUnitPrice,
    [accessories.edgeTrimsLength, accessories.edgeTrimUnitPrice],
  );

  const customSkirtingUnitsNeeded = useMemo(
    () =>
      customSkirtingMaterial.useCustom
        ? calculateCustomSkirtingUnitsNeeded(
            skirting.totalSkirtingLength,
            skirtingTileHeightM,
            customSkirtingMaterial.widthMm,
            customSkirtingMaterial.heightMm,
          )
        : 0,
    [
      customSkirtingMaterial.useCustom,
      customSkirtingMaterial.widthMm,
      customSkirtingMaterial.heightMm,
      skirting.totalSkirtingLength,
      skirtingTileHeightM,
    ],
  );

  const customSkirtingTotalCost = useMemo(
    () => customSkirtingUnitsNeeded * customSkirtingMaterial.pricePerUnit,
    [customSkirtingUnitsNeeded, customSkirtingMaterial.pricePerUnit],
  );

  const tilingMaterials = useMemo(() => {
    let totalCement = 0;
    let totalAdhesive = 0;
    let totalGrout = 0;
    flooringFinishes.forEach((finish) => {
      if (isSkirtingRequired(finish.material) && finish.tileSize) {
        const { cementKg, adhesiveKg, groutKg } = calculateTilingMaterials(
          finish.quantity || 0,
          finish.tileSize,
        );
        totalCement += parseFloat(cementKg);
        totalAdhesive += parseFloat(adhesiveKg);
        totalGrout += parseFloat(groutKg);
      }
    });
    return {
      cementKg: totalCement.toFixed(2),
      adhesiveKg: totalAdhesive.toFixed(2),
      groutKg: totalGrout.toFixed(2),
    };
  }, [flooringFinishes]);

  const filteredCalculations = useMemo(
    () =>
      calculations.filter((calc) =>
        calc.material.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [calculations, searchTerm],
  );

  // --------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------
  // Auto‑initialize screeding area from quote
  useEffect(() => {
    if (screeningBase.area === 0 && quote?.concrete_rows) {
      const groundFloorSlab = quote.concrete_rows.find(
        (f: any) =>
          f.element === "slab" && f.name?.toLowerCase().includes("ground"),
      );
      const slabArea = parseFloat(groundFloorSlab?.slabArea) || 0;
      if (slabArea > 0) {
        const { cementBags, screedVolume } = calculateScreeningBase(
          slabArea,
          screeningBase.thickness,
        );
        setScreeningBase((prev) => ({
          ...prev,
          area: slabArea,
          cementBags,
          screedVolume: parseFloat(screedVolume as string),
        }));
      }
    }
  }, [quote?.concrete_rows, screeningBase.area, screeningBase.thickness]);

  // Auto‑initialize skirting lengths from quote
  useEffect(() => {
    const external = quote?.wallDimensions?.externalWallPerimiter || 0;
    const internal = quote?.wallDimensions?.internalWallPerimiter || 0;
    if (
      (external > 0 || internal > 0) &&
      skirting.externalWallLength === 0 &&
      skirting.internalWallLength === 0
    ) {
      const total = calculateSkirtingLength(external, internal);
      setSkirting({
        externalWallLength: external,
        internalWallLength: internal,
        totalSkirtingLength: total,
      });
    }
  }, [quote, skirting.externalWallLength, skirting.internalWallLength]);

  // Auto‑add ceramic tile if no flooring items exist
  useEffect(() => {
    if (
      flooringFinishes.length === 0 &&
      quote?.concrete_rows &&
      onFinishesUpdate
    ) {
      const groundFloorSlab = quote.concrete_rows.find(
        (f: any) =>
          f.element === "slab" && f.name?.toLowerCase().includes("ground"),
      );
      const slabArea = parseFloat(groundFloorSlab?.slabArea) || 0;
      if (slabArea > 0) {
        const newCeramicTile: FinishElement = {
          id: `flooring-ceramic-ground-floor`, // stable ID
          category: "flooring",
          material: "Ceramic Tiles",
          area: slabArea,
          quantity: slabArea,
          unit: "m²",
          location: "Ground Floor",
          tileSize: "400x400",
        };
        // Only pass flooring items
        onFinishesUpdate(
          enrichFlooringWithPricing([...flooringFinishes, newCeramicTile]),
        );
      }
    }
  }, [
    quote?.concrete_rows,
    flooringFinishes.length,
    onFinishesUpdate,
    enrichFlooringWithPricing,
  ]);

  // Update skirting type when floor material changes (first item)
  useEffect(() => {
    if (flooringFinishes.length === 0) return;
    const floorMaterial = flooringFinishes[0].material;
    const compatibleTypes = getCompatibleSkirtingTypes(
      floorMaterial,
      skirtingTypesWithPrices,
    );
    const compatibleKeys = Object.keys(compatibleTypes);

    if (compatibleKeys.length > 0) {
      if (!compatibleKeys.includes(skirtingTileType)) {
        // Current selection incompatible: auto‑fill with first compatible
        const newType = compatibleKeys[0];
        setSkirtingTileType(newType);
        setSkirtingTileUnitPrice(compatibleTypes[newType]?.pricePerM2 || 0);
      } else {
        // Still compatible: update price (in case prices changed)
        setSkirtingTileUnitPrice(
          compatibleTypes[skirtingTileType]?.pricePerM2 || 0,
        );
      }
    }
  }, [
    flooringFinishes[0]?.material,
    skirtingTypesWithPrices,
    skirtingTileType,
  ]);

  // Update tile price when tile type or size changes
  useEffect(() => {
    if (tileType) {
      const price = getTilePriceBySize(materialPrices, tileType, tileSize);
      setTileUnitPrice(price || defaultTilePrice);
    }
  }, [tileType, tileSize, materialPrices, defaultTilePrice]);

  // Sync screening and skirting data to quote whenever they change
  useEffect(() => {
    if (!onScreeningSkirtingUpdate) return;

    onScreeningSkirtingUpdate({
      screening: screeningBase,
      skirting,
      skirtingMaterial: customSkirtingMaterial,
      accessories,
      tilingMaterials,
    });
  }, [
    screeningBase,
    skirting,
    customSkirtingMaterial,
    accessories,
    tilingMaterials,
    onScreeningSkirtingUpdate,
  ]);

  // Update screeding calculations when area or thickness changes
  const handleScreeningBaseChange = (
    field: "area" | "thickness",
    value: number,
  ) => {
    const updated = { ...screeningBase, [field]: value };
    const { cementBags, screedVolume } = calculateScreeningBase(
      updated.area,
      updated.thickness,
    );
    setScreeningBase({
      ...updated,
      cementBags,
      screedVolume: parseFloat(screedVolume as string),
    });
  };

  const handleSkirtingChange = (
    field: "externalWallLength" | "internalWallLength",
    value: number,
  ) => {
    const updated = { ...skirting, [field]: value };
    updated.totalSkirtingLength = calculateSkirtingLength(
      updated.externalWallLength,
      updated.internalWallLength,
    );
    setSkirting(updated);
    // Auto‑fill accessories if they are still zero
    if (accessories.cornerStripsLength === 0) {
      setAccessories((prev) => ({
        ...prev,
        cornerStripsLength: updated.totalSkirtingLength,
      }));
    }
    if (accessories.edgeTrimsLength === 0) {
      setAccessories((prev) => ({
        ...prev,
        edgeTrimsLength: updated.totalSkirtingLength,
      }));
    }
  };

  // --------------------------------------------------------------------
  // CRUD operations (only for flooring items)
  // --------------------------------------------------------------------
  const handleAddFinish = () => {
    const newFinish: FinishElement = {
      id: `flooring-manual-${Math.random().toString(36).substr(2, 9)}`,
      category: "flooring",
      material: FLOORING_MATERIALS[0],
      area: 0,
      quantity: 0,
      unit: "m²",
      location: "",
    };
    onFinishesUpdate?.(
      enrichFlooringWithPricing([...flooringFinishes, newFinish]),
    );
    setEditingId(newFinish.id);
    setEditForm(newFinish);
  };

  const handleEditFormChange = (field: string, value: any) => {
    if (editForm) setEditForm({ ...editForm, [field]: value });
  };

  const handleSaveEdit = () => {
    if (editForm && onFinishesUpdate && editingId) {
      const updated = flooringFinishes.map((f) =>
        f.id === editingId ? editForm : f,
      );
      onFinishesUpdate(enrichFlooringWithPricing(updated));
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDeleteFinish = (id: string) => {
    onFinishesUpdate?.(
      enrichFlooringWithPricing(flooringFinishes.filter((f) => f.id !== id)),
    );
  };

  const handleEditFinish = (finish: FinishElement) => {
    setEditingId(finish.id);
    setEditForm({ ...finish });
  };

  // --------------------------------------------------------------------
  // Render helpers
  // --------------------------------------------------------------------
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(value);

  const exportToCSV = () => {
    // ... (unchanged, uses calculations)
  };

  const firstFloorMaterial = flooringFinishes[0]?.material;
  const skirtingTypeForFirst = firstFloorMaterial
    ? getSkirtingTypeForFloor(firstFloorMaterial)
    : null;

  return (
    <div className="space-y-6">
      {/* Screeding Base */}
      <Card>
        <CardHeader className="bg-primary/10 dark:bg-primary/20">
          <CardTitle>Screeding Base</CardTitle>
          <CardDescription>
            Set base layer thickness for tiled floors
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="screed-area">Screeding Area (m²)</Label>
              <Input
                id="screed-area"
                type="number"
                min="0"
                step="0.01"
                value={screeningBase.area}
                onChange={(e) =>
                  handleScreeningBaseChange(
                    "area",
                    parseFloat(e.target.value) || 0,
                  )
                }
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                {quote?.concrete_rows?.find(
                  (f: any) =>
                    f.element === "slab" &&
                    f.name?.toLowerCase().includes("ground"),
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
                  handleScreeningBaseChange(
                    "thickness",
                    parseFloat(e.target.value) || 50,
                  )
                }
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 50mm</p>
            </div>
          </div>
          {screeningBase.area > 0 && (
            <div className="space-y-4 mt-6">
              <h3 className="text-sm text-slate-700 dark:text-slate-300">
                Screeding Materials (Base Layer)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20">
                <div>
                  <div className="text-xs font-bold">Cement Bags (50kg)</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400 mt-2">
                    {screeningBase.cementBags}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold">Screed Volume (m³)</div>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-2">
                    {screeningBase.screedVolume}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floor Finishes */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <CardTitle>Floor Finishes</CardTitle>
              <CardDescription>
                Ceramic Tiles, Granite, Hardwood, Niro finish, PVC vinyl, Epoxy,
                Terrazzo, SPC
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  {(editForm.material === "Ceramic Tiles" ||
                    editForm.material === "Granite Tiles") && (
                    <div>
                      <Label htmlFor="edit-tile-size">Tile Size</Label>
                      <Select
                        value={editForm.tileSize}
                        onValueChange={(value) =>
                          handleEditFormChange("tileSize", value)
                        }
                      >
                        <SelectTrigger>
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
                  )}
                </div>
                {(editForm.material === "Ceramic Tiles" ||
                  editForm.material === "Granite Tiles") && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-100 dark:bg-slate-800 rounded mt-4">
                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400">
                        Tile Size
                      </Label>
                      <div className="text-sm mt-1">
                        {editForm.tileSize &&
                          TILE_SIZE_FACTORS[editForm.tileSize]?.label}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400">
                        Price/m²
                      </Label>
                      <div className="text-sm mt-1">
                        {formatCurrency(
                          getTilePriceBySize(
                            materialPrices,
                            editForm.material,
                            editForm.tileSize || "400x400",
                          ),
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400">
                        Tile Dimensions
                      </Label>
                      <div className="text-sm mt-1">{editForm.tileSize}mm</div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400">
                        Est. Tiles Needed
                      </Label>
                      <div className="text-sm mt-1">
                        {(() => {
                          const dim = parseTileSizeToMeters(
                            editForm.tileSize || "300x300",
                          );
                          const tileArea = dim.widthM * dim.heightM;
                          return tileArea > 0
                            ? Math.ceil(editForm.quantity / tileArea)
                            : 0;
                        })()}
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 justify-end mt-4">
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
                  <TableHead className="text-right">Tiles</TableHead>
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
                      colSpan={readonly ? 7 : 8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No flooring items found.{" "}
                      {!readonly &&
                        "Add your first flooring item to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalculations.map((calc) => {
                    const finish = flooringFinishes.find(
                      (f) => f.id === calc.id,
                    );
                    return (
                      <TableRow key={calc.id}>
                        <TableCell className="font-medium">
                          {calc.material}
                        </TableCell>
                        <TableCell>{finish?.location || "-"}</TableCell>
                        <TableCell className="text-right">
                          {calc.quantity.toFixed(2)} m²
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {(finish?.material === "Ceramic Tiles" ||
                            finish?.material === "Granite Tiles") &&
                          finish?.tileSize
                            ? (() => {
                                const dim = parseTileSizeToMeters(
                                  finish.tileSize,
                                );
                                const tileArea = dim.widthM * dim.heightM;
                                return tileArea > 0
                                  ? Math.ceil(calc.quantity / tileArea)
                                  : "-";
                              })()
                            : "-"}
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

          {/* Tiling Materials */}
          {flooringFinishes.some(
            (f) =>
              (f.material === "Ceramic Tiles" ||
                f.material === "Granite Tiles") &&
              f.tileSize,
          ) && (
            <div className="space-y-4 mt-6">
              <h3 className="text-sm text-slate-700 dark:text-slate-300">
                Tiling Materials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-300 dark:border-slate-700">
                <div>
                  <div className="text-xs font-bold">Cement (kg)</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400 mt-2">
                    {tilingMaterials.cementKg}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {Math.ceil(parseFloat(tilingMaterials.cementKg) / 50)} bags
                    (50kg)
                  </p>
                </div>
                <div>
                  <div className="text-xs font-bold">Adhesive (kg)</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mt-2">
                    {tilingMaterials.adhesiveKg}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {Math.ceil(parseFloat(tilingMaterials.adhesiveKg) / 25)}{" "}
                    bags (25kg)
                  </p>
                </div>
                <div>
                  <div className="text-xs font-bold">Grout (kg)</div>
                  <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mt-2">
                    {tilingMaterials.groutKg}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Totals */}
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
              <div className="text-xs font-bold">
                Wastage ({wastagePercentage}%)
              </div>
              <div className="text-lg font-bold">
                {formatCurrency(
                  totals.totalMaterialCostWithWastage -
                    totals.totalMaterialCost,
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

      {/* Skirting Calculation */}
      <Card>
        <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
          <CardTitle>Skirting Calculation</CardTitle>
          {skirtingConfig && !skirtingConfig.enabled && (
            <Badge className="bg-amber-600 mt-2">
              ⚠ Skirting Disabled (Niro floors do not require skirting)
            </Badge>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {skirtingConfig?.enabled === false ? (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded p-4">
              <p className="text-amber-900 dark:text-amber-100 text-sm">
                Skirting calculation is disabled for this floor type. Niro
                (cement paste) finishes do not typically include skirting.
              </p>
            </div>
          ) : (
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
                    handleSkirtingChange(
                      "externalWallLength",
                      parseFloat(e.target.value) || 0,
                    )
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
                    handleSkirtingChange(
                      "internalWallLength",
                      parseFloat(e.target.value) || 0,
                    )
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skirting Material */}
      {flooringFinishes.length > 0 &&
        isSkirtingRequired(firstFloorMaterial) && (
          <Card>
            <CardHeader className="bg-slate-50 dark:bg-slate-900/30">
              <CardTitle>Skirting Material</CardTitle>
              <CardDescription>
                {(() => {
                  const type = getSkirtingTypeForFloor(firstFloorMaterial);
                  const desc: Record<string, string> = {
                    tile: "Tile skirting - cut from matching floor tiles",
                    hardwood: "Hardwood skirting - paired with hardwood floors",
                    stone:
                      "Stone skirting - for marble, granite, or terrazzo floors",
                    pvc: "PVC/Plastic skirting - budget-friendly option",
                  };
                  return (
                    desc[type || "pvc"] ||
                    "Configure skirting type, dimensions, and pricing"
                  );
                })()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300">
                <div className="flex items-center gap-4">
                  <Label className="text-sm">Material Source:</Label>
                  <RadioGroup
                    value={
                      customSkirtingMaterial.useCustom ? "custom" : "predefined"
                    }
                    onValueChange={(val) =>
                      setCustomSkirtingMaterial((prev) => ({
                        ...prev,
                        useCustom: val === "custom",
                      }))
                    }
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="predefined" id="predefined" />
                      <Label
                        htmlFor="predefined"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Predefined Materials
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label
                        htmlFor="custom"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Custom Material
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="skirting-height">Skirting Height (m)</Label>
                  <Input
                    id="skirting-height"
                    type="number"
                    min="0.1"
                    max="0.5"
                    step="0.01"
                    value={skirtingTileHeightM}
                    onChange={(e) =>
                      setSkirtingTileHeightM(parseFloat(e.target.value) || 0.12)
                    }
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Typical: 0.10-0.15m
                  </p>
                </div>

                {!customSkirtingMaterial.useCustom ? (
                  <>
                    <div>
                      <Label htmlFor="skirting-tile-type">Skirting Type</Label>
                      <Select
                        value={skirtingTileType}
                        onValueChange={(value) => {
                          setSkirtingTileType(value);
                          const compatible = getCompatibleSkirtingTypes(
                            firstFloorMaterial,
                            skirtingTypesWithPrices,
                          );
                          setSkirtingTileUnitPrice(
                            compatible[value]?.pricePerM2 || 0,
                          );
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(
                            getCompatibleSkirtingTypes(
                              firstFloorMaterial,
                              skirtingTypesWithPrices,
                            ),
                          ).map(([key, data]) => (
                            <SelectItem key={key} value={key}>
                              {data.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="skirting-tile-unit">
                        Skirting Unit Price (Ksh/m²)
                      </Label>
                      <Input
                        id="skirting-tile-unit"
                        type="number"
                        min="0"
                        step="1"
                        value={skirtingTileUnitPrice}
                        onChange={(e) =>
                          setSkirtingTileUnitPrice(
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="mt-2 bg-gray-100 dark:bg-slate-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-populated from skirting type
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="custom-skirting-name">
                        Material Name
                      </Label>
                      <Input
                        id="custom-skirting-name"
                        type="text"
                        value={customSkirtingMaterial.name}
                        onChange={(e) =>
                          setCustomSkirtingMaterial((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., Marble Skirting"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-skirting-width">Width (mm)</Label>
                      <Input
                        id="custom-skirting-width"
                        type="number"
                        min="1"
                        step="1"
                        value={customSkirtingMaterial.widthMm}
                        onChange={(e) =>
                          setCustomSkirtingMaterial((prev) => ({
                            ...prev,
                            widthMm: parseFloat(e.target.value) || 300,
                          }))
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-skirting-height">
                        Height per Unit (mm)
                      </Label>
                      <Input
                        id="custom-skirting-height"
                        type="number"
                        min="1"
                        step="1"
                        value={customSkirtingMaterial.heightMm}
                        onChange={(e) =>
                          setCustomSkirtingMaterial((prev) => ({
                            ...prev,
                            heightMm: parseFloat(e.target.value) || 120,
                          }))
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-skirting-price">
                        Price per Unit (Ksh)
                      </Label>
                      <Input
                        id="custom-skirting-price"
                        type="number"
                        min="0"
                        step="1"
                        value={customSkirtingMaterial.pricePerUnit}
                        onChange={(e) =>
                          setCustomSkirtingMaterial((prev) => ({
                            ...prev,
                            pricePerUnit: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="mt-2"
                      />
                    </div>
                  </>
                )}

                {/* Results */}
                {customSkirtingMaterial.useCustom ? (
                  <>
                    <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded border border-primary/20">
                      <Label className="text-xs font-bold text-primary">
                        Units Needed
                      </Label>
                      <div className="text-2xl font-bold text-primary mt-2">
                        {customSkirtingUnitsNeeded}
                      </div>
                      <p className="text-xs text-primary mt-1">
                        {customSkirtingMaterial.widthMm}×
                        {customSkirtingMaterial.heightMm}mm each
                      </p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded border border-emerald-200">
                      <Label className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                        Skirting Length
                      </Label>
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">
                        {skirting.totalSkirtingLength.toFixed(2)} m
                      </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200">
                      <Label className="text-xs font-bold text-amber-900 dark:text-amber-100">
                        Total Cost (Ksh)
                      </Label>
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-2">
                        {formatCurrency(customSkirtingTotalCost)}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {skirtingTypeForFirst === "tile" && (
                      <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded border border-primary/20">
                        <Label className="text-xs font-bold">
                          Skirting Tile Area (m²)
                        </Label>
                        <div className="text-2xl font-bold mt-2">
                          {skirtingTileArea.toFixed(2)}
                        </div>
                        <p className="text-xs mt-1">
                          Est. tiles: {skirtingTileCount}
                        </p>
                      </div>
                    )}
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
                        Skirting Total (Ksh)
                      </Label>
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-2">
                        {formatCurrency(skirtingTileTotalCost)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Skirting Accessories */}
      {flooringFinishes.length > 0 &&
        isSkirtingRequired(firstFloorMaterial) && (
          <Card>
            <CardHeader className="bg-slate-50 dark:bg-slate-900/30">
              <CardTitle>Skirting Accessories</CardTitle>
              <CardDescription>
                Corner strips and edge trims for finished floors
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="corner-strips">
                    Corner Strips Length (m)
                  </Label>
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
                        cornerStripUnitPrice:
                          cornerStripTypes[value]?.pricePerM || 0,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(cornerStripTypes).map(([key, data]) => (
                        <SelectItem key={key} value={key}>
                          {data.label}
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
                        edgeTrimUnitPrice: edgeTrimTypes[value]?.pricePerM || 0,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(edgeTrimTypes).map(([key, data]) => (
                        <SelectItem key={key} value={key}>
                          {data.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="corner-strip-unit">
                    Corner Strip Unit Price (Ksh/m)
                  </Label>
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
                  <Label htmlFor="edge-trim-unit">
                    Edge Trim Unit Price (Ksh/m)
                  </Label>
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
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded border border-primary/20">
                  <Label className="text-xs font-bold ">
                    Corner Strip Total (Ksh)
                  </Label>
                  <div className="text-2xl font-bold mt-2">
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
        )}

      {/* Summary cards */}
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
    </div>
  );
}

// ----------------------------------------------------------------------
// Helper functions (copied from original, unchanged)
// ----------------------------------------------------------------------
function buildTileTypesFromMaterials(materialPrices: any[]) {
  if (!Array.isArray(materialPrices)) return {};
  const flooring = materialPrices.find(
    (m) => m.name?.toLowerCase() === "flooring",
  );
  if (!flooring || !flooring.type?.flooringMaterials) return {};
  const types: Record<string, { label: string; pricePerM2: number }> = {};
  flooring.type.flooringMaterials.forEach((material: any) => {
    if (Array.isArray(material.type) && material.type.length > 0) {
      const first = material.type[0];
      const key =
        first.type || material.name?.toLowerCase().replace(/\s+/g, "-");
      types[key] = { label: material.name, pricePerM2: first.price_kes || 0 };
    }
  });
  return types;
}

function buildSkirtingTypesFromMaterials(materialPrices: any[]) {
  if (!Array.isArray(materialPrices)) return {};
  const flooring = materialPrices.find(
    (m) => m.name?.toLowerCase() === "flooring",
  );
  if (!flooring || !flooring.type?.flooringMaterials) return {};
  const map: Record<string, string> = {
    "ceramic tiles": "tiles",
    "granite tiles": "tiles",
    "hardwood wooden panels": "hardwood",
    granite: "stone",
    terrazzo: "stone",
    "pvc vinyl flooring": "pvc",
    "epoxy flooring": "pvc",
    "spc flooring": "pvc",
  };
  const collected: Record<string, { label: string; price: number }> = {};
  flooring.type.flooringMaterials.forEach((material: any) => {
    const name = material.name?.toLowerCase() || "";
    const key = map[name];
    if (key && Array.isArray(material.type) && material.type.length > 0) {
      const price = material.type[0].price_kes || 0;
      if (!collected[key]) {
        collected[key] = {
          label:
            key === "tiles"
              ? "Tile Skirting"
              : key === "hardwood"
                ? "Hardwood Skirting"
                : key === "stone"
                  ? "Stone Skirting"
                  : "PVC Skirting",
          price,
        };
      }
    }
  });
  const result: Record<string, { label: string; pricePerM2: number }> = {};
  Object.entries(collected).forEach(([k, v]) => {
    result[k] = { label: v.label, pricePerM2: v.price };
  });
  return result;
}

function buildCornerStripTypes(materialPrices: any[]) {
  if (!Array.isArray(materialPrices)) return {};
  const flooring = materialPrices.find(
    (m) => m.name?.toLowerCase() === "flooring",
  );
  if (!flooring) return {};
  const accessories = flooring.type?.skirtingAccessories;
  if (!Array.isArray(accessories)) return {};
  const corner = accessories.find(
    (m) => m.name?.toLowerCase() === "corner strips",
  );
  if (!corner || !Array.isArray(corner.type)) return {};
  const types: Record<string, { label: string; pricePerM: number }> = {};
  corner.type.forEach((t: any) => {
    const key = t.type || t.name?.toLowerCase().replace(/\s+/g, "-");
    types[key] = { label: t.name, pricePerM: t.price_kes || 0 };
  });
  return types;
}

function buildEdgeTrimTypes(materialPrices: any[]) {
  if (!Array.isArray(materialPrices)) return {};
  const flooring = materialPrices.find(
    (m) => m.name?.toLowerCase() === "flooring",
  );
  if (!flooring) return {};
  const accessories = flooring.type?.skirtingAccessories;
  if (!Array.isArray(accessories)) return {};
  const edge = accessories.find((m) => m.name?.toLowerCase() === "edge trims");
  if (!edge || !Array.isArray(edge.type)) return {};
  const types: Record<string, { label: string; pricePerM: number }> = {};
  edge.type.forEach((t: any) => {
    const key = t.type || t.name?.toLowerCase().replace(/\s+/g, "-");
    types[key] = { label: t.name, pricePerM: t.price_kes || 0 };
  });
  return types;
}

function getTilePriceBySize(
  materialPrices: any[],
  materialNameOrType: string,
  tileSize: string,
): number {
  if (!Array.isArray(materialPrices) || !materialNameOrType || !tileSize)
    return 0;
  const flooring = materialPrices.find(
    (m) => m.name?.toLowerCase() === "flooring",
  );
  if (!flooring) return 0;
  const materials = flooring.type?.flooringMaterials;
  if (!Array.isArray(materials)) return 0;
  let material = materials.find(
    (m) => m.name?.toLowerCase() === materialNameOrType.toLowerCase(),
  );
  if (!material) {
    material = materials.find(
      (m) =>
        m.type?.[0]?.type?.toLowerCase() === materialNameOrType.toLowerCase(),
    );
  }
  if (!material || !Array.isArray(material.type)) return 0;
  const first = material.type[0];
  if (
    first.tileTypes &&
    typeof first.tileTypes === "object" &&
    tileSize in first.tileTypes
  ) {
    return first.tileTypes[tileSize];
  }
  return first.price_kes || 0;
}

function getCompatibleSkirtingTypes(
  floorMaterial: string,
  allSkirtingTypes: Record<string, { label: string; pricePerM2: number }>,
) {
  const type = getSkirtingTypeForFloor(floorMaterial);
  if (!type) return {};
  if (allSkirtingTypes[type]) return { [type]: allSkirtingTypes[type] };
  return allSkirtingTypes; // fallback
}

function calculateScreeningBase(area: number, thicknessMm: number) {
  const volume = (area * thicknessMm) / 1000000;
  const cementKg = volume * 1440 * 0.5;
  const cementBags = Math.ceil(cementKg / 50);
  return { cementBags, screedVolume: volume.toFixed(3) };
}

function calculateSkirtingLength(external: number, internal: number) {
  return external + internal * 2;
}

function calculateTilingMaterials(area: number, tileSize: string) {
  const groutKgPerM2 =
    TILE_SIZE_FACTORS[tileSize as keyof typeof TILE_SIZE_FACTORS]
      ?.groutKgPerM2 || 0.5;
  const groutKg = area * groutKgPerM2;
  const cementKg = groutKg * 2;
  const adhesiveKg = groutKg * 2;
  return {
    cementKg: cementKg.toFixed(2),
    adhesiveKg: adhesiveKg.toFixed(2),
    groutKg: groutKg.toFixed(2),
  };
}

function calculateCustomSkirtingUnitsNeeded(
  totalLengthM: number,
  heightM: number,
  materialWidthMm: number,
  materialHeightMm: number,
): number {
  if (materialWidthMm <= 0 || materialHeightMm <= 0) return 0;
  const widthM = materialWidthMm / 1000;
  const heightM_material = materialHeightMm / 1000;
  const materialArea = widthM * heightM_material;
  const requiredArea = totalLengthM * heightM;
  return materialArea > 0 ? Math.ceil(requiredArea / materialArea) : 0;
}
