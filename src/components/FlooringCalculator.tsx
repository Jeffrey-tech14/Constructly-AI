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
import useFlooringCalculator from "@/hooks/useFlooringCalculator";
import type { FinishElement } from "@/hooks/useUniversalFinishesCalculator";

const FLOORING_MATERIALS = [
  "Ceramic tiles",
  "Granite tiles",
  "Granite",
  "Hardwood panels",
  "Cement paste (Niro finish)",
  "PVC vinyl flooring",
  "Epoxy flooring",
  "Terrazzo",
  "SPC flooring",
];

// Helper function to build tile types with prices from materialPrices
const buildTileTypesFromMaterials = (materialPrices: any[]): Record<string, { label: string; pricePerM2: number }> => {
  if (!Array.isArray(materialPrices)) return {};
  
  const tileTypes: Record<string, { label: string; pricePerM2: number }> = {};
  
  // Find the Flooring material
  const flooringMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "flooring"
  );
  
  if (!flooringMaterial || !flooringMaterial.type?.flooringMaterials) {
    return {};
  }
  
  const flooringMaterials = flooringMaterial.type.flooringMaterials;
  
  // Build tileTypes from flooringMaterials array
  flooringMaterials.forEach((material: any) => {
    if (Array.isArray(material.type) && material.type.length > 0) {
      const firstType = material.type[0];
      const price = firstType.price_kes || 0;
      const key = firstType.type || material.name?.toLowerCase().replace(/\s+/g, '-');
      tileTypes[key] = {
        label: material.name,
        pricePerM2: price,
      };
    }
  });
  
  return tileTypes;
};

// Helper function to get accessory price from materialPrices
const getAccessoryPrice = (materialPrices: any[], category: string, type: string): number => {
  if (!Array.isArray(materialPrices)) return 0;
  
  // Find the Flooring material
  const flooringMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "flooring"
  );
  
  if (!flooringMaterial) return 0;
  
  // For accessories, look in type.skirtingAccessories
  const accessories = flooringMaterial.type?.skirtingAccessories;
  if (!Array.isArray(accessories)) return 0;
  
  const material = accessories.find((m: any) =>
    m.name?.toLowerCase() === category.toLowerCase()
  );
  
  if (!material || !Array.isArray(material.type)) return 0;
  
  const typeMatch = material.type.find((t: any) =>
    t.name?.toLowerCase().includes(type.toLowerCase())
  );
  
  return typeMatch?.price_kes || 0;
};

// Helper function to get screening base material price (cement, adhesive, grout)
const getScreeningBaseMaterialPrice = (materialPrices: any[], materialName: string): number => {
  if (!Array.isArray(materialPrices)) return 0;
  
  const flooringMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "flooring"
  );
  
  if (!flooringMaterial) return 0;
  
  const screeningMaterials = flooringMaterial.type?.screeningBaseMaterials;
  if (!Array.isArray(screeningMaterials)) return 0;
  
  const material = screeningMaterials.find((m: any) =>
    m.name?.toLowerCase() === materialName.toLowerCase()
  );
  
  if (!material || !Array.isArray(material.type)) return 0;
  
  const firstType = material.type[0];
  return firstType?.price_kes || 0;
};

// Helper function to get skirting material price
const getSkirtingMaterialPrice = (materialPrices: any[], skirtingType: string): number => {
  if (!Array.isArray(materialPrices)) return 0;
  
  const flooringMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "flooring"
  );
  
  if (!flooringMaterial) return 0;
  
  const skirtingMaterials = flooringMaterial.type?.skirtingMaterials;
  if (!Array.isArray(skirtingMaterials)) return 0;
  
  // Find material with matching type
  const material = skirtingMaterials.find((m: any) =>
    m.type?.[0]?.type?.toLowerCase() === skirtingType.toLowerCase()
  );
  
  if (!material || !Array.isArray(material.type)) return 0;
  
  const firstType = material.type[0];
  return firstType?.price_kes || 0;
};

// Helper function to build corner strip types with prices from materialPrices
const buildCornerStripTypes = (materialPrices: any[]): Record<string, { label: string; pricePerM: number }> => {
  if (!Array.isArray(materialPrices)) return {};
  
  const cornerStripTypes: Record<string, { label: string; pricePerM: number }> = {};
  
  const flooringMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "flooring"
  );
  
  if (!flooringMaterial) return {};
  
  const accessories = flooringMaterial.type?.skirtingAccessories;
  if (!Array.isArray(accessories)) return {};
  
  const cornerStrips = accessories.find((m: any) =>
    m.name?.toLowerCase() === "corner strips"
  );
  
  if (cornerStrips && Array.isArray(cornerStrips.type)) {
    cornerStrips.type.forEach((type: any) => {
      const key = type.type || type.name?.toLowerCase().replace(/\s+/g, '-');
      cornerStripTypes[key] = {
        label: type.name,
        pricePerM: type.price_kes || 0,
      };
    });
  }
  
  return cornerStripTypes;
};

// Helper function to build edge trim types with prices from materialPrices
const buildEdgeTrimTypes = (materialPrices: any[]): Record<string, { label: string; pricePerM: number }> => {
  if (!Array.isArray(materialPrices)) return {};
  
  const edgeTrimTypes: Record<string, { label: string; pricePerM: number }> = {};
  
  const flooringMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "flooring"
  );
  
  if (!flooringMaterial) return {};
  
  const accessories = flooringMaterial.type?.skirtingAccessories;
  if (!Array.isArray(accessories)) return {};
  
  const edgeTrims = accessories.find((m: any) =>
    m.name?.toLowerCase() === "edge trims"
  );
  
  if (edgeTrims && Array.isArray(edgeTrims.type)) {
    edgeTrims.type.forEach((type: any) => {
      const key = type.type || type.name?.toLowerCase().replace(/\s+/g, '-');
      edgeTrimTypes[key] = {
        label: type.name,
        pricePerM: type.price_kes || 0,
      };
    });
  }
  
  return edgeTrimTypes;
};

// Helper function to get tile price by material name or type and tile size
const getTilePriceBySize = (materialPrices: any[], materialNameOrType: string, tileSize: string): number => {
  if (!Array.isArray(materialPrices) || !materialNameOrType || !tileSize) return 0;
  
  const flooringMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "flooring"
  );
  
  if (!flooringMaterial) return 0;
  
  const flooringMaterials = flooringMaterial.type?.flooringMaterials;
  if (!Array.isArray(flooringMaterials)) return 0;
  
  // Try to find material by exact name match first
  let material = flooringMaterials.find((m: any) =>
    m.name?.toLowerCase() === materialNameOrType.toLowerCase()
  );
  
  // If not found by name, try to find by type
  if (!material) {
    material = flooringMaterials.find((m: any) =>
      m.type?.[0]?.type?.toLowerCase() === materialNameOrType.toLowerCase()
    );
  }
  
  if (!material || !Array.isArray(material.type)) return 0;
  
  const firstType = material.type[0];
  if (!firstType) return 0;
  
  // Check if tileTypes map exists and has the size
  const tileTypesMap = firstType.tileTypes;
  if (tileTypesMap && typeof tileTypesMap === "object" && tileSize in tileTypesMap) {
    const price = tileTypesMap[tileSize];
    return price || firstType.price_kes || 0;
  }
  
  // Fallback to base price_kes if size not found
  return firstType.price_kes || 0;
};

// Helper function to get available tile sizes for a material type
const getAvailableTileSizes = (materialPrices: any[], materialType: string): Record<string, number> => {
  if (!Array.isArray(materialPrices)) return {};
  
  const flooringMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "flooring"
  );
  
  if (!flooringMaterial) return {};
  
  const flooringMaterials = flooringMaterial.type?.flooringMaterials;
  if (!Array.isArray(flooringMaterials)) return {};
  
  // Find material by type
  const material = flooringMaterials.find((m: any) =>
    m.type?.[0]?.type?.toLowerCase() === materialType.toLowerCase()
  );
  
  if (!material || !Array.isArray(material.type)) return {};
  
  const firstType = material.type[0];
  return firstType.tileTypes || {};
};

// Helper function to get material type key from material name
const getMaterialTypeByName = (materialPrices: any[], materialName: string): string => {
  if (!Array.isArray(materialPrices)) return "";
  
  const flooringMaterial = materialPrices.find((m: any) =>
    m.name?.toLowerCase() === "flooring"
  );
  
  if (!flooringMaterial) return "";
  
  const flooringMaterials = flooringMaterial.type?.flooringMaterials;
  if (!Array.isArray(flooringMaterials)) return "";
  
  const material = flooringMaterials.find((m: any) =>
    m.name?.toLowerCase() === materialName.toLowerCase()
  );
  
  if (!material || !Array.isArray(material.type)) return "";
  
  return material.type[0]?.type || "";
};

// Helper function to parse tile size string and get dimensions in meters
const getTileDimensions = (tileSizeKey: string): { widthM: number; heightM: number } => {
  const [w, h] = tileSizeKey.split("x").map((v) => parseFloat(v) / 1000);
  return { widthM: w || 0, heightM: h || 0 };
};

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

  // Build tile types dynamically from materialPrices
  const tileTypesWithPrices = buildTileTypesFromMaterials(materialPrices);
  const defaultTileType = Object.keys(tileTypesWithPrices)[0] || "ceramic";
  const defaultTilePrice = tileTypesWithPrices[defaultTileType]?.pricePerM2 || 0;
  
  // Build accessory types dynamically from materialPrices
  const cornerStripTypes = buildCornerStripTypes(materialPrices);
  const edgeTrimTypes = buildEdgeTrimTypes(materialPrices);
  const defaultCornerStripType = Object.keys(cornerStripTypes)[0] || "aluminum-corner";
  const defaultCornerStripPrice = cornerStripTypes[defaultCornerStripType]?.pricePerM || 0;
  const defaultEdgeTrimType = Object.keys(edgeTrimTypes)[0] || "aluminum-edge";
  const defaultEdgeTrimPrice = edgeTrimTypes[defaultEdgeTrimType]?.pricePerM || 0;

  const { calculations, totals, calculateAll, wastagePercentage } =
    useFlooringCalculator(
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

  const [tileType, setTileType] = useState<string>(defaultTileType);
  const [tileUnitPrice, setTileUnitPrice] = useState<number>(defaultTilePrice);

  const [skirtingTileHeightM, setSkirtingTileHeightM] = useState(0.12);
  const [skirtingTileSize, setSkirtingTileSize] = useState<
    keyof typeof TILE_SIZE_FACTORS
  >("300x300");
  const [skirtingTileType, setSkirtingTileType] = useState<string>(defaultTileType);
  const [skirtingTileUnitPrice, setSkirtingTileUnitPrice] = useState(defaultTilePrice);

  const [accessories, setAccessories] = useState({
    cornerStripsLength: 0,
    edgeTrimsLength: 0,
    cornerStripType: defaultCornerStripType,
    edgeTrimType: defaultEdgeTrimType,
    cornerStripUnitPrice: defaultCornerStripPrice,
    edgeTrimUnitPrice: defaultEdgeTrimPrice,
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
      const updated = { ...editForm, [field]: value };
      setEditForm(updated);
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
    // Formula: (external walls) + (internal walls x 2)
    return ((externalLength + (internalLength * 2)));
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

  // Auto-add ceramic tiles if no floor items exist
  useEffect(() => {
    if (flooringFinishes.length === 0 && quote?.concrete_rows) {
      const groundFloorSlab = quote.concrete_rows?.find(
        (f: any) =>
          f.element === "slab" && f.name?.toLowerCase().includes("ground"),
      );
      const slabArea = parseFloat(groundFloorSlab?.slabArea) || 0;

      if (slabArea > 0 && onFinishesUpdate) {
        const newCeramicTile: FinishElement = {
          id: `flooring-ceramic-${Date.now()}`,
          category: "flooring",
          material: "Ceramic tiles",
          area: slabArea,
          quantity: slabArea,
          unit: "m²",
          location: "Ground Floor",
          tileSize: "300x300mm", // Default tile size
        };

        onFinishesUpdate([...finishes, newCeramicTile]);
      }
    }
  }, [quote?.concrete_rows, flooringFinishes.length, finishes, onFinishesUpdate]);

  // Update tile price when tile type or size changes
  useEffect(() => {
    if (tileType) {
      // tileType stores the material name like "Ceramic tiles"
      const price = getTilePriceBySize(materialPrices, tileType, tileSize);
      setTileUnitPrice(price || defaultTilePrice);
    }
  }, [tileType, tileSize, materialPrices, defaultTilePrice]);

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
          <CardTitle>Screeding Base</CardTitle>
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
                Adhesive(25kg)
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
              <Label htmlFor="skirting-tile-type">Skirting Tile Type</Label>
              <Select
                value={skirtingTileType}
                onValueChange={(value) => {
                  setSkirtingTileType(value);
                  setSkirtingTileUnitPrice(tileTypesWithPrices[value]?.pricePerM2 || 0);
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tileTypesWithPrices).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.label} (Ksh {data.pricePerM2}/m²)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                className="mt-2 bg-gray-100 dark:bg-slate-700"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-populated from tile type</p>
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
                    cornerStripUnitPrice: cornerStripTypes[value]?.pricePerM || 0,
                  }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(cornerStripTypes).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.label} (Ksh {data.pricePerM}/m)
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
                      {data.label} (Ksh {data.pricePerM}/m)
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

                  {(editForm.material === "Ceramic tiles" || editForm.material === "Granite tiles") && (
                    <div>
                      <Label htmlFor="edit-tile-size">Tile Size</Label>
                      <Select
                        value={editForm?.tileSize || "300x300"}
                        onValueChange={(value) =>
                          handleEditFormChange("tileSize", value)
                        }
                      >
                        <SelectTrigger>
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

                {(editForm.material === "Ceramic tiles" || editForm.material === "Granite tiles") && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-100 dark:bg-slate-800 rounded mt-4">
                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Tile Size</Label>
                      <div className="text-sm font-semibold mt-1">
                        {editForm?.tileSize && TILE_SIZE_FACTORS[editForm.tileSize]?.label}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Price/m²</Label>
                      <div className="text-sm font-semibold mt-1">
                        {formatCurrency(
                          getTilePriceBySize(
                            materialPrices,
                            editForm?.material || "",
                            editForm?.tileSize || "400x400mm"
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Tile Dimensions</Label>
                      <div className="text-sm font-semibold mt-1">
                        {editForm?.tileSize}mm
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400">Est. Tiles Needed</Label>
                      <div className="text-sm font-semibold mt-1">
                        {(() => {
                          const tileDim = getTileDimensions(editForm?.tileSize || "300x300");
                          const tileArea = tileDim.widthM * tileDim.heightM;
                          return tileArea > 0 ? Math.ceil(editForm.quantity / tileArea) : 0;
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

          {/* Calculations Table */}
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
                  <TableHead className="text-right">Total (w/ Wastage)</TableHead>
                  {!readonly && <TableHead className="text-right">Actions</TableHead>}
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
                        <TableCell className="text-right text-sm">
                          {(finish?.material === "Ceramic tiles" || finish?.material === "Granite tiles") && finish?.tileSize
                            ? (() => {
                                const tileDim = getTileDimensions(finish.tileSize);
                                const tileArea = tileDim.widthM * tileDim.heightM;
                                return tileArea > 0 ? Math.ceil(calc.quantity / tileArea) : "-";
                              })()
                            : "-"}
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
