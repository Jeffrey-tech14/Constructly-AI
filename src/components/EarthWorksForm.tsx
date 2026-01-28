// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, Calculator } from "lucide-react";

export interface EarthworkItem {
  id: string;
  type: string;
  length: string;
  width: string;
  depth: string;
  volume: string;
  material: string;
  cost?: number; // Total cost for this item
  // Area selection fields - choose between direct area input or length x width
  areaSelectionMode?: "LENGTH_WIDTH" | "DIRECT_AREA"; // "LENGTH_WIDTH" or "DIRECT_AREA"
  area?: string; // Direct area input (m²) when using DIRECT_AREA mode
  // Foundation type fields
  foundationType?: "strip_footing" | "raft_foundation" | "general"; // For foundation excavation - type of foundation
  wallLocation?: "external" | "internal"; // For strip footing - whether it's external or internal walls
}

interface EarthworksFormProps {
  earthworks: EarthworkItem[];
  setEarthworks: (
    earthworks: EarthworkItem[] | ((prev: EarthworkItem[]) => EarthworkItem[]),
  ) => void;
  excavationRates: any;
  setQuoteData?: (data: any) => void;
  setQuote?: (updater: (prev: any) => any) => void;
  quote?;
}

const EarthworksForm: React.FC<EarthworksFormProps> = ({
  earthworks,
  setEarthworks,
  excavationRates,
  setQuoteData,
  setQuote,
  quote,
}) => {
  // Get minimum depth based on excavation type
  const getMinimumDepth = (type: string): number => {
    if (type === "topsoil-removal") {
      return 0.15; // Topsoil removal minimum 0.15m
    }
    if (type === "oversite-excavation") {
      return 0.2; // Oversite excavation standard 200mm
    }
    // Foundation excavation and others minimum 0.65m
    return 0.65;
  };

  // Calculate volume based on dimensions or area
  const calculateVolume = (
    length: string,
    width: string,
    depth: string,
    area?: string,
    areaSelectionMode?: string,
    type?: string,
  ): string => {
    let d = parseFloat(depth) || 0;
    const minDepth = getMinimumDepth(type || "foundation-excavation");

    // Enforce minimum depth
    d = Math.max(d, minDepth);

    // If area mode is selected and area is provided, use it
    if (areaSelectionMode === "DIRECT_AREA" && area) {
      const a = parseFloat(area) || 0;
      return (a * d).toFixed(3);
    }

    // Otherwise use length × width × depth
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    return (l * w * d).toFixed(3);
  };

  // Get the earthwork rate price
  const getEarthworkRate = (): number => {
    const earthworkRate = excavationRates.find((m) =>
      m.name?.toLowerCase().includes("earthwork"),
    );
    return earthworkRate?.price || earthworkRate?.rate || 0;
  };

  useEffect(() => {
    setQuoteData((prev: any) => ({
      ...prev,
      earthwork: earthworks,
    }));

    // Also save earthwork total cost to quote if setQuote is provided
    if (setQuote) {
      const totalCost = earthworks.reduce(
        (total, item) => total + calculatePrice(item),
        0,
      );
      setQuote((prev: any) => ({
        ...prev,
        earthwork_items: earthworks,
        earthwork_total: totalCost,
      }));
    }
  }, [earthworks]);

  // Auto-create foundation excavation items for strip footing on component mount or when house type changes
  useEffect(() => {
    // Only auto-create if earthworks is empty and we have quote data
    if (
      earthworks.length === 0 &&
      quote &&
      (quote.house_type.toLowerCase() === "bungalow" ||
        quote.concrete_rows?.some((f: any) => f.element === "strip-footing"))
    ) {
      // Get wall dimensions from quote
      const dims = quote.wallDimensions;
      if (dims && dims.externalWallPerimiter && dims.internalWallPerimiter) {
        // Map block type to dimensions
        const blockDimensionsMap: { [key: string]: string } = {
          "Large Block": "0.2x0.2x0.2",
          "Standard Block": "0.15x0.2x0.15",
          "Small Block": "0.1x0.2x0.1",
        };
        // Extract thickness from blockDimensions "LxHxT" format using blockType
        const getWallThickness = (wallType: string): number => {
          const wall = quote.wallSections?.find(
            (s: any) => s.type === wallType,
          );
          // Get block dimensions from blockType mapping
          const blockType = wall?.blockType || "Standard Block";
          const blockDimensions =
            blockDimensionsMap[blockType] || "0.15x0.2x0.15";
          const parts = blockDimensions
            .split("x")
            .map((p: string) => parseFloat(p.trim()));
          return parts.length >= 3 ? parts[2] : 0.1;
        };
        const internalWallThickness = getWallThickness("internal");
        const externalWallThickness = getWallThickness("external");
        const excavationDepth =
          parseFloat(quote?.foundationDetails?.[0]?.height || "0.65") || 0.65; // Use foundation details height

        // Create internal wall foundation excavation item
        const internalVolume = calculateVolume(
          dims.internalWallPerimiter.toString(),
          (internalWallThickness * 3).toString(),
          excavationDepth.toString(),
          undefined,
          "LENGTH_WIDTH",
          "foundation-excavation",
        );
        const internalItem: EarthworkItem = {
          id: `earthwork-internal-${Date.now()}`,
          type: "foundation-excavation",
          length: dims.internalWallPerimiter.toString(),
          width: (internalWallThickness * 3).toString(),
          depth: excavationDepth.toString(),
          volume: internalVolume,
          material: "soil",
          cost: parseFloat(internalVolume) * getEarthworkRate(),
          foundationType: "strip_footing",
          wallLocation: "internal",
        };

        // Create external wall foundation excavation item
        const externalVolume = calculateVolume(
          dims.externalWallPerimiter.toString(),
          (externalWallThickness * 3).toString(),
          excavationDepth.toString(),
          undefined,
          "LENGTH_WIDTH",
          "foundation-excavation",
        );
        const externalItem: EarthworkItem = {
          id: `earthwork-external-${Date.now() + 1}`,
          type: "foundation-excavation",
          length: dims.externalWallPerimiter.toString(),
          width: (externalWallThickness * 3).toString(),
          depth: excavationDepth.toString(),
          volume: externalVolume,
          material: "soil",
          cost: parseFloat(externalVolume) * getEarthworkRate(),
          foundationType: "strip_footing",
          wallLocation: "external",
        };

        // Create topsoil excavation item for total area at 200mm depth
        const topsoilVolume = calculateVolume(
          "0",
          "0",
          "0.2",
          quote.total_area?.toString(),
          "DIRECT_AREA",
          "topsoil-removal",
        );
        const topsoilItem: EarthworkItem = {
          id: `earthwork-topsoil-${Date.now() + 2}`,
          type: "topsoil-removal",
          length: "0",
          width: "0",
          depth: "0.2",
          volume: topsoilVolume,
          material: "soil",
          cost: parseFloat(topsoilVolume) * getEarthworkRate(),
          area: quote.total_area?.toString(),
          areaSelectionMode: "DIRECT_AREA",
          foundationType: "general",
        };

        setEarthworks([internalItem, externalItem, topsoilItem]);
      }
    }
  }, [
    quote?.house_type,
    quote?.total_area,
    quote?.concrete_rows,
    quote?.wallDimensions,
    quote,
  ]);

  // Update existing internal/external wall items when wall dimensions or thickness change
  useEffect(() => {
    if (
      earthworks.length > 0 &&
      quote &&
      quote.wallDimensions &&
      quote.wallDimensions.externalWallPerimiter &&
      quote.wallDimensions.internalWallPerimiter
    ) {
      const dims = quote.wallDimensions;
      // Map block type to dimensions
      const blockDimensionsMap: { [key: string]: string } = {
        "Large Block": "0.2x0.2x0.2",
        "Standard Block": "0.15x0.2x0.15",
        "Small Block": "0.1x0.2x0.1",
      };
      // Extract thickness from blockDimensions "LxHxT" format using blockType
      const getWallThickness = (wallType: string): number => {
        const wall = quote.wallSections?.find((s: any) => s.type === wallType);
        // Get block dimensions from blockType mapping
        const blockType = wall?.blockType || "Standard Block";
        const blockDimensions =
          blockDimensionsMap[blockType] || "0.15x0.2x0.15";
        const parts = blockDimensions
          .split("x")
          .map((p: string) => parseFloat(p.trim()));
        return parts.length >= 3 ? parts[2] : 0.2;
      };
      const internalWallThickness = getWallThickness("internal");
      const externalWallThickness = getWallThickness("external");
      const excavationDepth =
        parseFloat(quote?.foundationDetails?.[0]?.height || "0.65") || 0.65;

      setEarthworks((prev: EarthworkItem[]) => {
        const updated = [...prev];

        // Find and update internal wall item
        const internalIdx = updated.findIndex(
          (e) =>
            e.foundationType === "strip_footing" &&
            e.wallLocation === "internal",
        );
        if (internalIdx >= 0) {
          const internalVolume = calculateVolume(
            dims.internalWallPerimiter.toString(),
            (internalWallThickness * 3).toString(),
            excavationDepth.toString(),
            undefined,
            "LENGTH_WIDTH",
            "foundation-excavation",
          );
          updated[internalIdx] = {
            ...updated[internalIdx],
            length: dims.internalWallPerimiter.toString(),
            width: (internalWallThickness * 3).toString(),
            depth: excavationDepth.toString(),
            volume: internalVolume,
            cost: parseFloat(internalVolume) * getEarthworkRate(),
          };
        }

        // Find and update external wall item
        const externalIdx = updated.findIndex(
          (e) =>
            e.foundationType === "strip_footing" &&
            e.wallLocation === "external",
        );
        if (externalIdx >= 0) {
          const externalVolume = calculateVolume(
            dims.externalWallPerimiter.toString(),
            (externalWallThickness * 3).toString(),
            excavationDepth.toString(),
            undefined,
            "LENGTH_WIDTH",
            "foundation-excavation",
          );
          updated[externalIdx] = {
            ...updated[externalIdx],
            length: dims.externalWallPerimiter.toString(),
            width: (externalWallThickness * 3).toString(),
            depth: excavationDepth.toString(),
            volume: externalVolume,
            cost: parseFloat(externalVolume) * getEarthworkRate(),
          };
        }

        // Find and update topsoil item
        const topsoilIdx = updated.findIndex(
          (e) => e.type === "topsoil-removal",
        );
        if (topsoilIdx >= 0) {
          const topsoilVolume = calculateVolume(
            "0",
            "0",
            "0.2",
            quote.total_area?.toString(),
            "DIRECT_AREA",
            "topsoil-removal",
          );
          updated[topsoilIdx] = {
            ...updated[topsoilIdx],
            area: quote.total_area?.toString(),
            volume: topsoilVolume,
            cost: parseFloat(topsoilVolume) * getEarthworkRate(),
          };
        }

        return updated;
      });
    }
  }, [
    quote?.wallDimensions?.externalWallPerimiter,
    quote?.wallDimensions?.internalWallPerimiter,
    quote?.wallSection,
    quote?.foundationDetails?.[0]?.height,
    quote?.total_area,
  ]);

  // Calculate price for an earthwork item
  const calculatePrice = (item: EarthworkItem): number => {
    const rate = getEarthworkRate();
    const volume = parseFloat(item.volume) || 0;
    return volume * rate;
  };

  // Calculate total price for all earthworks
  const calculateTotalPrice = (): number => {
    return earthworks.reduce((total, item) => total + calculatePrice(item), 0);
  };

  // Update earthwork item
  const updateEarthwork = (
    id: string,
    field: keyof EarthworkItem,
    value: string,
  ) => {
    setEarthworks(
      earthworks.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate volume if dimensions or type change
          if (
            field === "length" ||
            field === "width" ||
            field === "depth" ||
            field === "area" ||
            field === "areaSelectionMode" ||
            field === "type" ||
            field === "foundationType" ||
            field === "wallLocation"
          ) {
            updatedItem.volume = calculateVolume(
              field === "length" ? value : item.length,
              field === "width" ? value : item.width,
              field === "depth" ? value : item.depth,
              field === "area" ? value : item.area,
              field === "areaSelectionMode" ? value : item.areaSelectionMode,
              field === "type" ? value : item.type,
            );
            // Update cost when volume changes
            updatedItem.cost =
              parseFloat(updatedItem.volume) * getEarthworkRate();
          }

          return updatedItem;
        }
        return item;
      }),
    );
  };

  // Add new earthwork item
  const addEarthwork = () => {
    const newEarthwork: EarthworkItem = {
      id: `earthwork-${Date.now()}`,
      type: "foundation-excavation",
      length: "",
      width: "",
      depth: "0.65",
      volume: "0",
      material: "soil",
      cost: 0,
      foundationType: "general",
      wallLocation: "external",
    };
    setEarthworks([...earthworks, newEarthwork]);
  };

  // Remove earthwork item
  const removeEarthwork = (id: string) => {
    setEarthworks(earthworks.filter((item) => item.id !== id));
  };

  // Earthwork types and materials
  const earthworkTypes = [
    { value: "site-clearance", label: "Site Clearance" },
    { value: "oversite-excavation", label: "Oversite Excavation (200mm)" },
    { value: "foundation-excavation", label: "Foundation Excavation" },
    { value: "trench-excavation", label: "Trench Excavation" },
    { value: "bulk-excavation", label: "Bulk Excavation" },
    { value: "topsoil-removal", label: "Topsoil Removal" },
    { value: "site-leveling", label: "Site Leveling" },
    { value: "backfilling", label: "Backfilling" },
    { value: "compaction", label: "Compaction" },
  ];

  const materials = [
    { value: "soil", label: "Soil" },
    { value: "clay", label: "Clay" },
    { value: "rock", label: "Rock" },
    { value: "sand", label: "Sand" },
    { value: "mixed", label: "Mixed Material" },
  ];

  const foundationTypes = [
    { value: "strip_footing", label: "Strip Footing" },
    { value: "raft_foundation", label: "Raft Foundation" },
    { value: "general", label: "General/Other" },
  ];

  const wallLocations = [
    { value: "external", label: "External Walls" },
    { value: "internal", label: "Internal Walls" },
  ];

  const earthworkRate = getEarthworkRate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
          <Calculator className="w-5 h-5" />
          Earthworks Calculation
        </h3>

        {/* Earthworks List */}
        <div className="space-y-4">
          {earthworks.map((earthwork, index) => (
            <Card key={earthwork.id} className="p-6">
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Earthwork Item #{index + 1}
                  </h4>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeEarthwork(earthwork.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Earthwork Type */}
                  <div className="space-y-2">
                    <Label htmlFor={`type-${earthwork.id}`}>
                      Earthwork Type
                    </Label>
                    <Select
                      value={earthwork.type}
                      onValueChange={(value) =>
                        updateEarthwork(earthwork.id, "type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {earthworkTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Material Type */}
                  <div className="space-y-2">
                    <Label htmlFor={`material-${earthwork.id}`}>Material</Label>
                    <Select
                      value={earthwork.material}
                      onValueChange={(value) =>
                        updateEarthwork(earthwork.id, "material", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material) => (
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

                  {/* Foundation Type */}
                  <div className="space-y-2">
                    <Label htmlFor={`foundation-type-${earthwork.id}`}>
                      Foundation Type
                    </Label>
                    <Select
                      value={earthwork.foundationType || "general"}
                      onValueChange={(value) =>
                        updateEarthwork(earthwork.id, "foundationType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select foundation" />
                      </SelectTrigger>
                      <SelectContent>
                        {foundationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Wall Location - only show for strip footing */}
                  {earthwork.foundationType === "strip_footing" && (
                    <div className="space-y-2">
                      <Label htmlFor={`wall-location-${earthwork.id}`}>
                        Wall Location
                      </Label>
                      <Select
                        value={earthwork.wallLocation || "external"}
                        onValueChange={(value) =>
                          updateEarthwork(earthwork.id, "wallLocation", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {wallLocations.map((location) => (
                            <SelectItem
                              key={location.value}
                              value={location.value}
                            >
                              {location.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Dimension Mode */}
                  <div className="space-y-2">
                    <Label htmlFor={`dimension-mode-${earthwork.id}`}>
                      Dimension Mode
                    </Label>
                    <Select
                      value={earthwork.areaSelectionMode || "LENGTH_WIDTH"}
                      onValueChange={(value) =>
                        updateEarthwork(
                          earthwork.id,
                          "areaSelectionMode",
                          value,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LENGTH_WIDTH">
                          Length × Width
                        </SelectItem>
                        <SelectItem value="DIRECT_AREA">Direct Area</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Conditional Dimensions Based on Mode */}
                <div className="grid mt-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {earthwork.areaSelectionMode === "DIRECT_AREA" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`area-${earthwork.id}`}>
                          Area (m²)
                        </Label>
                        <Input
                          id={`area-${earthwork.id}`}
                          type="number"
                          step="0.1"
                          min="0"
                          value={earthwork.area || ""}
                          onChange={(e) =>
                            updateEarthwork(
                              earthwork.id,
                              "area",
                              e.target.value,
                            )
                          }
                          placeholder="0.0"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Dimensions */}
                      <div className="space-y-2">
                        <Label htmlFor={`length-${earthwork.id}`}>
                          Length (m)
                        </Label>
                        <Input
                          id={`length-${earthwork.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={earthwork.length}
                          onChange={(e) =>
                            updateEarthwork(
                              earthwork.id,
                              "length",
                              e.target.value,
                            )
                          }
                          placeholder="0.0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`width-${earthwork.id}`}>
                          Width (m)
                        </Label>
                        <Input
                          id={`width-${earthwork.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={earthwork.width}
                          onChange={(e) =>
                            updateEarthwork(
                              earthwork.id,
                              "width",
                              e.target.value,
                            )
                          }
                          placeholder="0.0"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor={`depth-${earthwork.id}`}>Depth (m)</Label>
                    <Input
                      id={`depth-${earthwork.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={earthwork.depth}
                      onChange={(e) =>
                        updateEarthwork(earthwork.id, "depth", e.target.value)
                      }
                      placeholder="0.0"
                    />
                  </div>

                  {/* Calculated Values */}
                  <div className="space-y-2">
                    <Label htmlFor={`volume-${earthwork.id}`}>
                      Volume (m³)
                    </Label>
                    <Input
                      id={`volume-${earthwork.id}`}
                      type="text"
                      value={earthwork.volume}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-600 font-medium"
                    />
                  </div>
                </div>

                <div className="grid mt-3 grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price Calculation */}
                  <div className="space-y-2">
                    <Label htmlFor={`price-${earthwork.id}`}>
                      Unit Price (KES/m³)
                    </Label>
                    <Input
                      id={`price-${earthwork.id}`}
                      type="text"
                      value={earthworkRate.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`total-${earthwork.id}`}>
                      Total Cost (KES)
                    </Label>
                    <Input
                      id={`total-${earthwork.id}`}
                      type="text"
                      value={(earthwork.cost || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      readOnly
                      className="bg-gray-100 dark:bg-gray-600 font-medium text-green-600 dark:text-green-400"
                    />
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Calculation: {earthwork.volume}m³ × KES{" "}
                    {earthworkRate.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    /m³ = KES{" "}
                    {(earthwork.cost || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Earthwork Button */}
        <Button onClick={addEarthwork} className="mt-4" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Earthwork Item
        </Button>

        {/* Total Summary */}
        {earthworks.length > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Total Earthworks Cost
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {earthworks.length} item(s) • Total Volume:{" "}
                    {earthworks
                      .reduce(
                        (total, item) => total + parseFloat(item.volume),
                        0,
                      )
                      .toFixed(3)}
                    m³
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    KES{" "}
                    {earthworks
                      .reduce((total, item) => total + (item.cost || 0), 0)
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
};

export default EarthworksForm;
