// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Edit,
  Calculator,
} from "lucide-react";
import useRoofingCalculator, {
  RoofStructure,
  RoofType,
  RoofMaterial,
  UnderlaymentType,
  InsulationType,
  GutterType,
  DownpipeType,
  FlashingType,
  FasciaType,
  SoffitType,
  TimberComponentType,
  estimateRoofArea,
} from "@/hooks/useRoofingCalculator";
import { MasonryQSSettings } from "@/hooks/useMasonryCalculatorNew";

interface RoofingCalculatorProps {
  roofStructures: RoofStructure[];
  materialPrices: any;
  onRoofStructuresUpdate?: (structures: RoofStructure[]) => void;
  readonly?: boolean;
  setQuoteData?: (data: any) => void;
  quote?: any;
}

const TIMBER_GRADES = [
  { value: "standard", label: "Standard Grade" },
  { value: "structural", label: "Structural Grade" },
  { value: "premium", label: "Premium Grade" },
];

const TIMBER_TREATMENTS = [
  { value: "untreated", label: "Untreated" },
  { value: "pressure-treated", label: "Pressure Treated" },
  { value: "fire-retardant", label: "Fire Retardant" },
];

const TIMBER_TYPES = [
  { value: "raft", label: "Raft" },
  { value: "wall-plate", label: "Wall Plate" },
  { value: "fascia-board", label: "Fascia Board" },
  { value: "purlins", label: "Purlins" },
  { value: "timber-battens", label: "Timber Battens" },
  { value: "kingpost-tiebeam", label: "Kingpost/Tie Beam" },
];

const UNDERLAYMENT_TYPES = [
  { value: "felt-30", label: "30# Felt Underlayment" },
  { value: "felt-40", label: "40# Felt Underlayment" },
  { value: "synthetic", label: "Synthetic Underlayment" },
  { value: "rubberized", label: "Rubberized Asphalt" },
  { value: "breathable", label: "Breathable Membrane" },
];

const INSULATION_TYPES = [
  { value: "glass-wool", label: "Glass Wool Batts" },
  { value: "rock-wool", label: "Rock Wool" },
  { value: "eps", label: "Expanded Polystyrene" },
  { value: "xps", label: "Extruded Polystyrene" },
  { value: "polyurethane", label: "Polyurethane Foam" },
  { value: "reflective-foil", label: "Reflective Foil" },
];

const GUTTER_TYPES = [
  { value: "PVC", label: "PVC Gutter" },
  { value: "Galvanized Steel", label: "Galvanized Steel Gutter" },
  { value: "Aluminum", label: "Aluminum Gutter" },
  { value: "Copper", label: "Copper Gutter" },
];

const DOWNPIPE_TYPES = [
  { value: "PVC", label: "PVC Downpipe" },
  { value: "Galvanized Steel", label: "Galvanized Steel Downpipe" },
  { value: "Aluminum", label: "Aluminum Downpipe" },
  { value: "Copper", label: "Copper Downpipe" },
];

const FLASHING_TYPES = [
  { value: "PVC", label: "PVC Flashing" },
  { value: "Galvanized Steel", label: "Galvanized Steel Flashing" },
  { value: "Aluminum", label: "Aluminum Flashing" },
  { value: "Copper", label: "Copper Flashing" },
];

const FASCIA_TYPES = [
  { value: "PVC", label: "PVC Fascia" },
  { value: "Painted Wood", label: "Painted Wood Fascia" },
  { value: "Aluminum", label: "Aluminum Fascia" },
  { value: "Composite", label: "Composite Fascia" },
];

const SOFFIT_TYPES = [
  { value: "PVC", label: "PVC Soffit" },
  { value: "Aluminum", label: "Aluminum Soffit" },
  { value: "Composite", label: "Composite Soffit" },
  { value: "Metal", label: "Metal Soffit" },
];

export const DEFAULT_TIMBERS: RoofStructure["timbers"] = [
  {
    id: "1",
    type: "raft",
    unitRate: 15, // kg/m² - raft timbers
    grade: "structural",
    treatment: "pressure-treated",
  },
  {
    id: "2",
    type: "wall-plate",
    unitRate: 8, // kg/m² - wall plate
    grade: "structural",
    treatment: "pressure-treated",
  },
  {
    id: "3",
    type: "fascia-board",
    unitRate: 5, // kg/m² - fascia board
    grade: "standard",
    treatment: "pressure-treated",
  },
  {
    id: "4",
    type: "purlins",
    unitRate: 12, // kg/m² - purlins
    grade: "structural",
    treatment: "pressure-treated",
  },
  {
    id: "5",
    type: "timber-battens",
    unitRate: 6, // kg/m² - timber battens
    grade: "standard",
    treatment: "pressure-treated",
  },
  {
    id: "6",
    type: "kingpost-tiebeam",
    unitRate: 10, // kg/m² - kingpost/tie beam
    grade: "structural",
    treatment: "pressure-treated",
  },
];

const ROOF_TYPES: { value: RoofType; label: string }[] = [
  { value: "flat", label: "Flat Roof" },
  { value: "pitched", label: "Pitched Roof" },
  { value: "gable", label: "Gable Roof" },
  { value: "hip", label: "Hip Roof" },
  { value: "mansard", label: "Mansard Roof" },
  { value: "butterfly", label: "Butterfly Roof" },
  { value: "skillion", label: "Skillion Roof" },
];

const ROOF_MATERIALS: { value: RoofMaterial; label: string }[] = [
  { value: "concrete-tiles", label: "Concrete Tiles" },
  { value: "clay-tiles", label: "Clay Tiles" },
  { value: "metal-sheets", label: "Metal Sheets" },
  { value: "box-profile", label: "Box Profile" },
  { value: "thatch", label: "Thatch" },
  { value: "slate", label: "Slate" },
  { value: "asphalt-shingles", label: "Asphalt Shingles" },
  { value: "green-roof", label: "Green Roof" },
  { value: "membrane", label: "Membrane" },
];

export default function RoofingCalculator({
  roofStructures,
  materialPrices,
  onRoofStructuresUpdate,
  readonly = false,
  setQuoteData,
  quote,
}: RoofingCalculatorProps) {
  const { calculations, totals, calculateAll, wastagePercentage } =
    useRoofingCalculator(roofStructures, materialPrices, quote, setQuoteData);

  const qsSettings = quote?.qsSettings as MasonryQSSettings;
  const onSettingsChange = useCallback(
    (newSettings: MasonryQSSettings) => {
      setQuoteData?.((prev: any) => ({
        ...prev,
        qsSettings: newSettings,
      }));
    },
    [setQuoteData],
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<RoofType | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<RoofStructure | null>(null);

  const filteredCalculations = useMemo(() => {
    return calculations.filter((calc) => {
      const matchesSearch =
        calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.material.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || calc.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [calculations, searchTerm, filterType]);

  const handleAddRoof = () => {
    const newRoof: RoofStructure = {
      id: `roof-${Date.now()}`,
      name: "New Roof Structure",
      type: "pitched",
      material: "concrete-tiles",
      area: 0,
      pitch: 30,
      length: 10,
      width: 8,
      grade: "structural",
      treatment: "pressure-treated",
      eavesOverhang: 0.5,
      isLumpSum: false,
      lumpSumAmount: 0,
      covering: {
        type: "concrete-tiles",
        material: "concrete-tiles",
        underlayment: "felt-30",
        insulation: {
          type: "glass-wool",
          thickness: 50,
        },
      },
      timbers: DEFAULT_TIMBERS,
      accessories: {
        gutters: 0,
        gutterType: "PVC",
        downpipes: 0,
        downpipeType: "PVC",
        flashings: 0,
        flashingType: "PVC",
        fascia: 0,
        fasciaType: "PVC",
        soffit: 0,
        soffitType: "PVC",
        ridgeCaps: 0,
        valleyTrays: 0,
      },
    };

    if (onRoofStructuresUpdate) {
      onRoofStructuresUpdate([...roofStructures, newRoof]);
    }
    setEditingId(newRoof.id);
    setEditForm(newRoof);
  };

  const handleEdit = (calc: any) => {
    const roof = roofStructures.find((r) => r.id === calc.id);
    if (roof) {
      setEditingId(calc.id);
      setEditForm({ ...roof });
    }
  };

  useEffect(() => {
    if (editForm?.length && editForm?.width && editForm?.area === 0) {
      const calculatedArea = estimateRoofArea(
        editForm.length,
        editForm.width,
        editForm.type,
        editForm.pitch,
        editForm.eavesOverhang,
      );
      setEditForm((prev) => (prev ? { ...prev, area: calculatedArea } : null));
    }
  }, [editForm]);

  const handleSaveEdit = () => {
    if (!editForm || !editingId) return;

    if (editForm.length > 0 && editForm.width > 0 && editForm.area === 0) {
      const calculatedArea = estimateRoofArea(
        editForm.length,
        editForm.width,
        editForm.type,
        editForm.pitch,
        editForm.eavesOverhang,
      );
      setEditForm((prev) => (prev ? { ...prev, area: calculatedArea } : null));
    }

    const updatedRoofs = roofStructures.map((roof) =>
      roof.id === editingId ? editForm : roof,
    );

    if (onRoofStructuresUpdate) {
      onRoofStructuresUpdate(updatedRoofs);
    }
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this roof structure?"))
      return;

    const updatedRoofs = roofStructures.filter((roof) => roof.id !== id);
    if (onRoofStructuresUpdate) {
      onRoofStructuresUpdate(updatedRoofs);
    }
  };

  // Calculate ridge height from pitch and span
  const calculateRidgeHeight = useCallback(
    (pitchDegrees: number, span: number): number => {
      const pitchRadians = (pitchDegrees * Math.PI) / 180;
      return (span / 2) * Math.tan(pitchRadians);
    },
    [],
  );

  // Calculate pitch ratio from pitch angle
  const calculatePitchRatio = useCallback((pitchDegrees: number): string => {
    const pitchRadians = (pitchDegrees * Math.PI) / 180;
    const rise = Math.round(12 * Math.tan(pitchRadians) * 100) / 100;
    return `${rise}:12`;
  }, []);

  // Calculate ridge length based on roof type
  const calculateRidgeLength = useCallback(
    (
      roofType: RoofType,
      length: number,
      width: number,
      pitch: number,
    ): number => {
      const pitchRadians = (pitch * Math.PI) / 180;

      switch (roofType) {
        case "gable":
        case "butterfly":
          return length;
        case "hip":
        case "mansard":
          return Math.max(0, length - width);
        case "skillion":
        case "flat":
          return 0;
        case "pitched":
          return length;
        default:
          return length;
      }
    },
    [],
  );

  // Calculate hip length for hip roofs
  const calculateHipLength = useCallback(
    (roofType: RoofType, width: number, pitch: number): number => {
      if (roofType !== "hip" && roofType !== "mansard") return 0;

      const pitchRadians = (pitch * Math.PI) / 180;
      const rise = (width / 2) * Math.tan(pitchRadians);

      return Math.sqrt(Math.pow(width / 2, 2) + Math.pow(rise, 2));
    },
    [],
  );

  // Calculate valley length for valley roofs
  const calculateValleyLength = useCallback(
    (roofType: RoofType, width: number, pitch: number): number => {
      if (roofType !== "butterfly") return 0;

      const pitchRadians = (pitch * Math.PI) / 180;
      const rise = (width / 2) * Math.tan(pitchRadians);

      return Math.sqrt(Math.pow(width / 2, 2) + Math.pow(rise, 2));
    },
    [],
  );

  // Auto-update calculated fields when dependencies change
  useEffect(() => {
    if (!editForm) return;

    const ridgeHeight = calculateRidgeHeight(editForm.pitch, editForm.width);
    const pitchRatio = calculatePitchRatio(editForm.pitch);
    const ridgeLength = calculateRidgeLength(
      editForm.type,
      editForm.length,
      editForm.width,
      editForm.pitch,
    );
    const hipLength = calculateHipLength(
      editForm.type,
      editForm.width,
      editForm.pitch,
    );
    const valleyLength = calculateValleyLength(
      editForm.type,
      editForm.width,
      editForm.pitch,
    );

    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            ridgeHeight,
            pitchRatio,
            ridgeLength,
            hipLength,
            valleyLength,
          }
        : null,
    );
  }, [
    editForm?.pitch,
    editForm?.width,
    editForm?.length,
    editForm?.type,
    calculateRidgeHeight,
    calculatePitchRatio,
    calculateRidgeLength,
    calculateHipLength,
    calculateValleyLength,
  ]);

  const handleEditFormChange = (field: keyof RoofStructure, value: any) => {
    if (!editForm) return;
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleTimberChange = (
    timberId: string,
    field: keyof RoofStructure["timbers"][0],
    value: any,
  ) => {
    if (!editForm) return;

    const updatedTimbers = editForm.timbers.map((timber) =>
      timber.id === timberId ? { ...timber, [field]: value } : timber,
    );

    setEditForm((prev) => (prev ? { ...prev, timbers: updatedTimbers } : null));
  };

  useEffect(() => {
    setQuoteData((prev: any) => ({
      ...prev,
      roof_structures: roofStructures,
    }));
  }, [roofStructures, setEditForm]);

  const handleCoveringChange = (
    field: keyof RoofStructure["covering"],
    value: any,
  ) => {
    if (!editForm) return;

    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            covering: {
              ...prev.covering,
              [field]: value,
            },
          }
        : null,
    );
  };

  const handleInsulationChange = (
    field: keyof { type: string; thickness: number },
    value: any,
  ) => {
    if (!editForm) return;

    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            covering: {
              ...prev.covering,
              insulation: {
                ...prev.covering.insulation,
                [field]: value,
              } as any,
            },
          }
        : null,
    );
  };

  const handleAccessoryChange = (
    field: keyof RoofStructure["accessories"],
    value: any,
  ) => {
    if (!editForm) return;

    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            accessories: {
              ...prev.accessories,
              [field]: value,
            } as any,
          }
        : null,
    );
  };

  const getTypeColor = (type: RoofType) => {
    const colors = {
      flat: "bg-gray-100 text-gray-800",
      pitched: "bg-blue-100 text-blue-800",
      gable: "bg-green-100 text-green-800",
      hip: "bg-purple-100 text-purple-800",
      mansard: "bg-orange-100 text-orange-800",
      butterfly: "bg-cyan-100 text-cyan-800",
      skillion: "bg-amber-100 text-amber-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatArea = (area: number) => {
    return `${area.toFixed(2)} m²`;
  };

  const formatVolume = (volume: number) => {
    return `${volume.toFixed(3)} m³`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Type",
      "Material",
      "Area",
      "Timber Weight (kg)",
      "Covering Area",
      "Wastage %",
      "Extra Items",
      "Material Cost",
      "Labor Cost",
      "Total Cost",
    ];
    const csvData = calculations.map((calc) => [
      calc.name,
      calc.type,
      calc.material,
      calc.area,
      calc.totalTimberWeightKg || 0,
      calc.coveringArea,
      calc.wastage.percentage * 100,
      calc.wastage.totalWastageItems,
      calc.materialCost,
      calc.totalCost,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "roofing-calculations.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const calculateAutoArea = () => {
    if (!editForm) return;

    if (editForm.length > 0 && editForm.width > 0) {
      const calculatedArea = estimateRoofArea(
        editForm.length,
        editForm.width,
        editForm.type,
        editForm.pitch,
        editForm.eavesOverhang,
      );
      setEditForm((prev) => (prev ? { ...prev, area: calculatedArea } : null));
    }
  };
  useEffect(() => {
    calculateAutoArea();
  }, [
    editForm?.length,
    editForm?.width,
    editForm?.type,
    editForm?.pitch,
    editForm?.eavesOverhang,
  ]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Roof Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatArea(totals.totalArea)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Timber Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totals.totalTimberVolume || 0).toFixed(1)} kg
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Material Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totals.totalMaterialCost)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.totalCost)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
            <div>
              <CardTitle>Roofing Calculation</CardTitle>
              <CardDescription>
                Manage and calculate roofing structures, materials, and costs
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <Label htmlFor="wastage-roofing">Wastage Allowance (%)</Label>
              <Input
                id="wastage-roofing"
                type="number"
                value={qsSettings?.wastageRoofing ?? 10}
                step="1"
                min="1"
                max="50"
                className="sm:max-w-xs max-w-none"
                onChange={(e) =>
                  onSettingsChange({
                    ...qsSettings,
                    wastageRoofing: parseFloat(e.target.value),
                  })
                }
                placeholder="10"
              />
              {!readonly && (
                <Button onClick={handleAddRoof} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Roof
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
                  placeholder="Search roofs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="w-full sm:w-48">
              <Label htmlFor="type-filter" className="sr-only">
                Filter by type
              </Label>
              <Select
                value={filterType}
                onValueChange={(value: RoofType | "all") =>
                  setFilterType(value)
                }
              >
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ROOF_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Edit Form */}
          {editingId && editForm && (
            <Card className="mb-6 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">Edit Roof Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) =>
                        handleEditFormChange("name", e.target.value)
                      }
                      placeholder="e.g., Main House Roof"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-type">Roof Type</Label>
                    <Select
                      value={editForm.type}
                      onValueChange={(value: RoofType) =>
                        handleEditFormChange("type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOF_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-material">Roof Material</Label>
                    <Select
                      value={editForm.material}
                      onValueChange={(value: RoofMaterial) =>
                        handleEditFormChange("material", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOF_MATERIALS.map((material) => (
                          <SelectItem
                            key={material.value}
                            value={material.value}
                          >
                            {material.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-length">Length (m)</Label>
                    <Input
                      id="edit-length"
                      type="number"
                      min="0"
                      step="0.1"
                      value={editForm.length}
                      onChange={(e) =>
                        handleEditFormChange(
                          "length",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-width">Width (m)</Label>
                    <Input
                      id="edit-width"
                      type="number"
                      min="0"
                      step="0.1"
                      value={editForm.width}
                      onChange={(e) =>
                        handleEditFormChange(
                          "width",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-pitch">Pitch (degrees)</Label>
                    <Input
                      id="edit-pitch"
                      type="number"
                      min="0"
                      max="90"
                      value={editForm.pitch}
                      onChange={(e) =>
                        handleEditFormChange(
                          "pitch",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-pitch-ratio">Pitch Ratio</Label>
                    <Input
                      id="edit-pitch-ratio"
                      type="text"
                      disabled
                      value={editForm.pitchRatio || "—"}
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-ridge-height">Ridge Height (m)</Label>
                    <Input
                      id="edit-ridge-height"
                      type="number"
                      disabled
                      value={(editForm.ridgeHeight || 0).toFixed(2)}
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-orientation">Roof Orientation</Label>
                    <Select
                      value={editForm.orientation || "north"}
                      onValueChange={(
                        value: "north" | "south" | "east" | "west",
                      ) => handleEditFormChange("orientation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="north">North</SelectItem>
                        <SelectItem value="south">South</SelectItem>
                        <SelectItem value="east">East</SelectItem>
                        <SelectItem value="west">West</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-ridge-length">Ridge Length (m)</Label>
                    <Input
                      id="edit-ridge-length"
                      type="number"
                      disabled
                      value={(editForm.ridgeLength || 0).toFixed(2)}
                      className="bg-gray-100 dark:bg-gray-800"
                    />
                  </div>

                  {editForm.type === "hip" || editForm.type === "mansard" ? (
                    <div>
                      <Label htmlFor="edit-hip-length">Hip Length (m)</Label>
                      <Input
                        id="edit-hip-length"
                        type="number"
                        disabled
                        value={(editForm.hipLength || 0).toFixed(2)}
                        className="bg-gray-100 dark:bg-gray-800"
                      />
                    </div>
                  ) : null}

                  {editForm.type === "butterfly" ? (
                    <div>
                      <Label htmlFor="edit-valley-length">
                        Valley Length (m)
                      </Label>
                      <Input
                        id="edit-valley-length"
                        type="number"
                        disabled
                        value={(editForm.valleyLength || 0).toFixed(2)}
                        className="bg-gray-100 dark:bg-gray-800"
                      />
                    </div>
                  ) : null}

                  <div>
                    <Label htmlFor="edit-area">Area (m²)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-area"
                        type="number"
                        min="0"
                        step="0.1"
                        value={editForm.area}
                        onChange={(e) =>
                          handleEditFormChange(
                            "area",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                      <Button
                        type="button"
                        onClick={calculateAutoArea}
                        size="sm"
                        variant="outline"
                      >
                        <Calculator className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lump-Sum Option */}
                <div className="space-y-4 p-4 border">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="edit-lump-sum"
                      checked={editForm.isLumpSum}
                      onCheckedChange={(checked) =>
                        handleEditFormChange("isLumpSum", checked)
                      }
                    />
                    <Label
                      htmlFor="edit-lump-sum"
                      className="font-medium cursor-pointer"
                    >
                      Use Lump-Sum Pricing
                    </Label>
                  </div>

                  {editForm.isLumpSum && (
                    <div>
                      <Label htmlFor="edit-lump-sum-amount">
                        Lump-Sum Amount (KSh)
                      </Label>
                      <Input
                        id="edit-lump-sum-amount"
                        type="number"
                        min="0"
                        step="100"
                        value={editForm.lumpSumAmount || 0}
                        onChange={(e) =>
                          handleEditFormChange(
                            "lumpSumAmount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="Enter fixed amount"
                      />
                    </div>
                  )}
                </div>

                {!editForm.isLumpSum && (
                  <>
                    {/* Timber Details */}
                    <div>
                      <Label className="text-lg font-semibold">
                        Timber Structure
                      </Label>
                      <div className="mt-2 space-y-3">
                        {editForm.timbers.map((timber) => (
                          <div
                            key={timber.id}
                            className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-lg"
                          >
                            <div>
                              <Label>Component Type</Label>
                              <Select
                                value={timber.type}
                                onValueChange={(value) =>
                                  handleTimberChange(timber.id, "type", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIMBER_TYPES.map((type) => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                    >
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Unit Rate (kg/m²)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={timber.unitRate}
                                onChange={(e) =>
                                  handleTimberChange(
                                    timber.id,
                                    "unitRate",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label>Grade</Label>
                              <Select
                                value={timber.grade || "structural"}
                                onValueChange={(value) =>
                                  handleTimberChange(timber.id, "grade", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIMBER_GRADES.map((grade) => (
                                    <SelectItem
                                      key={grade.value}
                                      value={grade.value}
                                    >
                                      {grade.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Treatment</Label>
                              <Select
                                value={timber.treatment || "pressure-treated"}
                                onValueChange={(value) =>
                                  handleTimberChange(
                                    timber.id,
                                    "treatment",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIMBER_TREATMENTS.map((treatment) => (
                                    <SelectItem
                                      key={treatment.value}
                                      value={treatment.value}
                                    >
                                      {treatment.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  handleEditFormChange(
                                    "timbers",
                                    editForm.timbers.filter(
                                      (t) => t.id !== timber.id,
                                    ),
                                  );
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newTimber = {
                            id: `timber-${Date.now()}`,
                            type: "raft" as TimberComponentType,
                            unitRate: 15,
                            grade: "structural",
                            treatment: "pressure-treated",
                          };
                          handleEditFormChange("timbers", [
                            ...editForm.timbers,
                            newTimber,
                          ]);
                        }}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Timber Component
                      </Button>
                    </div>

                    {/* Underlayment and Insulation Section */}
                    <div>
                      <Label className="text-lg font-semibold">
                        Roof Protection
                      </Label>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-underlayment">
                            Underlayment Type
                          </Label>
                          <Select
                            value={editForm.covering.underlayment || "felt-30"}
                            onValueChange={(value: UnderlaymentType) =>
                              handleCoveringChange("underlayment", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNDERLAYMENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="edit-insulation-type">
                            Insulation Type
                          </Label>
                          <Select
                            value={
                              editForm.covering.insulation?.type || "glass-wool"
                            }
                            onValueChange={(value: InsulationType) =>
                              handleInsulationChange("type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {INSULATION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="edit-insulation-thickness">
                            Insulation Thickness (mm)
                          </Label>
                          <Input
                            id="edit-insulation-thickness"
                            type="number"
                            min="0"
                            step="10"
                            value={
                              editForm.covering.insulation?.thickness || 50
                            }
                            onChange={(e) =>
                              handleInsulationChange(
                                "thickness",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Accessories Section */}
                    <div>
                      <Label className="text-lg font-semibold">
                        Roof Accessories
                      </Label>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-gutters">Gutters (m)</Label>
                          <div className="flex gap-2">
                            <Input
                              id="edit-gutters"
                              type="number"
                              min="0"
                              value={editForm.accessories?.gutters || 0}
                              onChange={(e) =>
                                handleAccessoryChange(
                                  "gutters",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              placeholder="Length in meters"
                            />
                            <Select
                              value={editForm.accessories?.gutterType || "PVC"}
                              onValueChange={(value: GutterType) =>
                                handleAccessoryChange("gutterType", value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {GUTTER_TYPES.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-downpipes">Downpipes</Label>
                          <div className="flex gap-2">
                            <Input
                              id="edit-downpipes"
                              type="number"
                              min="0"
                              value={editForm.accessories?.downpipes || 0}
                              onChange={(e) =>
                                handleAccessoryChange(
                                  "downpipes",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              placeholder="Number of pieces"
                            />
                            <Select
                              value={
                                editForm.accessories?.downpipeType || "PVC"
                              }
                              onValueChange={(value: DownpipeType) =>
                                handleAccessoryChange("downpipeType", value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DOWNPIPE_TYPES.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-flashings">Flashings (m)</Label>
                          <div className="flex gap-2">
                            <Input
                              id="edit-flashings"
                              type="number"
                              min="0"
                              value={editForm.accessories?.flashings || 0}
                              onChange={(e) =>
                                handleAccessoryChange(
                                  "flashings",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              placeholder="Length in meters"
                            />
                            <Select
                              value={
                                editForm.accessories?.flashingType || "PVC"
                              }
                              onValueChange={(value: FlashingType) =>
                                handleAccessoryChange("flashingType", value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FLASHING_TYPES.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-fascia">Fascia (m)</Label>
                          <div className="flex gap-2">
                            <Input
                              id="edit-fascia"
                              type="number"
                              min="0"
                              value={editForm.accessories?.fascia || 0}
                              onChange={(e) =>
                                handleAccessoryChange(
                                  "fascia",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              placeholder="Length in meters"
                            />
                            <Select
                              value={editForm.accessories?.fasciaType || "PVC"}
                              onValueChange={(value: FasciaType) =>
                                handleAccessoryChange("fasciaType", value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FASCIA_TYPES.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-soffit">Soffit (m)</Label>
                          <div className="flex gap-2">
                            <Input
                              id="edit-soffit"
                              type="number"
                              min="0"
                              value={editForm.accessories?.soffit || 0}
                              onChange={(e) =>
                                handleAccessoryChange(
                                  "soffit",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              placeholder="Length in meters"
                            />
                            <Select
                              value={editForm.accessories?.soffitType || "PVC"}
                              onValueChange={(value: SoffitType) =>
                                handleAccessoryChange("soffitType", value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SOFFIT_TYPES.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-ridge-caps">
                            Ridge Caps (m)
                          </Label>
                          <Input
                            id="edit-ridge-caps"
                            type="number"
                            min="0"
                            value={editForm.accessories?.ridgeCaps || 0}
                            onChange={(e) =>
                              handleAccessoryChange(
                                "ridgeCaps",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-valley-trays">
                            Valley Trays (m)
                          </Label>
                          <Input
                            id="edit-valley-trays"
                            type="number"
                            min="0"
                            value={editForm.accessories?.valleyTrays || 0}
                            onChange={(e) =>
                              handleAccessoryChange(
                                "valleyTrays",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

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
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Area</TableHead>
                  <TableHead className="text-right">
                    Timber Weight (kg)
                  </TableHead>
                  <TableHead className="text-right">Covering</TableHead>
                  <TableHead className="text-right">Material Cost</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  {!readonly && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={readonly ? 11 : 12}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No roof structures found.{" "}
                      {!readonly &&
                        "Add your first roof structure to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalculations.map((calc) => (
                    <TableRow key={calc.id}>
                      <TableCell className="font-medium">{calc.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getTypeColor(calc.type)}
                        >
                          {ROOF_TYPES.find((t) => t.value === calc.type)
                            ?.label || calc.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ROOF_MATERIALS.find((m) => m.value === calc.material)
                            ?.label || calc.material}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatArea(calc.area)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(calc.totalTimberWeightKg || 0).toFixed(1)} kg
                      </TableCell>
                      <TableCell className="text-right">
                        {formatArea(calc.coveringArea)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(calc.materialCost)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(calc.totalCost)}
                      </TableCell>
                      {!readonly && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(calc)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(calc.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {filteredCalculations.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Structures:</span>{" "}
                  {filteredCalculations.length}
                </div>
                <div>
                  <span className="font-medium">Total Area:</span>{" "}
                  {formatArea(totals.totalArea)}
                </div>
                <div>
                  <span className="font-medium">Total Material:</span>{" "}
                  {formatCurrency(totals.totalMaterialCost)}
                </div>
                <div className="font-semibold">
                  <span>Grand Total:</span> {formatCurrency(totals.totalCost)}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <span className="font-medium">Timber:</span>{" "}
                  {formatCurrency(totals.breakdown.timber)}
                </div>
                <div>
                  <span className="font-medium">Covering:</span>{" "}
                  {formatCurrency(totals.breakdown.covering)}
                </div>
                <div>
                  <span className="font-medium">Accessories:</span>{" "}
                  {formatCurrency(totals.breakdown.accessories)}
                </div>
                <div>
                  <span className="font-medium">Insulation:</span>{" "}
                  {formatCurrency(totals.breakdown.insulation)}
                </div>
                <div>
                  <span className="font-medium">Underlayment:</span>{" "}
                  {formatCurrency(totals.breakdown.underlayment)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
