// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Edit } from "lucide-react";

// ============================================
// WARDROBE EXPORTS & TYPES
// ============================================
export interface WardrobeItem {
  id: string;
  name: string;
  quotationType: "lump-sum" | "detailed";
  usesLumpSum: boolean;
  lumpSumAmount?: number;
  numBoards?: string;
  numHinges?: string;
  numLocks?: string;
  numDrawerRails?: string;
  hasGlass?: boolean;
  glassArea?: string;
  notes?: string;
  quantity: string;
  unitPrice?: string;
  totalPrice?: number;
}

// ============================================
// KITCHEN CABINET EXPORTS & TYPES
// ============================================
export interface KitchenCabinet {
  id: string;
  name: string;
  quotationType: "lump-sum" | "detailed";
  usesLumpSum: boolean;
  lumpSumAmount?: number;
  numCupboards?: string;
  numDrawers?: string;
  numDoors?: string;
  notes?: string;
  quantity: string;
  unitPrice?: string;
  totalPrice?: number;
}

// ============================================
// COUNTERTOP EXPORTS & TYPES
// ============================================
export interface Countertop {
  id: string;
  type: "granite" | "tiled";
  length: number;
  width: number;
  area: number;
  material: string;
  graniteSize?: string; // Standard size ID for granite
  cornerStrips: boolean;
  cornerStripLength: number;
  unitPrice: number;
  totalCost: number;
}

const COUNTERTOP_MATERIALS = {
  granite: [
    "Granite Polished",
    "Granite Honed",
    "Granite Flamed",
    "Granite Bush Hammered",
  ],
  tiled: ["Ceramic Tiles", "Porcelain Tiles", "Stone Tiles", "Mosaic Tiles"],
};

// Granite countertop standard sizes: Length × Width × Depth (mm)
const GRANITE_SIZES = [
  { id: "1200x600x20", label: "1200 × 600 × 20 mm", length: 1.2, width: 0.6 },
  {
    id: "1500x600x20",
    label: "1500 × 600 × 20 mm",
    length: 1.5,
    width: 0.6,
    isDefault: true,
  },
  { id: "2000x600x20", label: "2000 × 600 × 20 mm", length: 2.0, width: 0.6 },
  { id: "2400x600x20", label: "2400 × 600 × 20 mm", length: 2.4, width: 0.6 },
  { id: "3000x600x20", label: "3000 × 600 × 20 mm", length: 3.0, width: 0.6 },
];

// ============================================
// COMPONENT PROPS
// ============================================
interface KitchenAndWardrobesCalculatorProps {
  wardrobes: WardrobeItem[];
  setWardrobes: (wardrobes: WardrobeItem[]) => void;
  quote?: any;
  materialPrices?: any[];
  readonly?: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================
export const KitchenAndWardrobesCalculator: React.FC<
  KitchenAndWardrobesCalculatorProps
> = ({
  wardrobes,
  setWardrobes,
  quote,
  materialPrices = [],
  readonly = false,
}) => {
  const [countertops, setCountertops] = useState<Countertop[]>([]);
  const [kitchenCabinets, setKitchenCabinets] = useState<KitchenCabinet[]>([]);
  const [editingCountertopId, setEditingCountertopId] = useState<string | null>(
    null,
  );
  const [editCountertopForm, setEditCountertopForm] =
    useState<Countertop | null>(null);
  const [editingCabinetId, setEditingCabinetId] = useState<string | null>(null);
  const [editCabinetForm, setEditCabinetForm] = useState<KitchenCabinet | null>(
    null,
  );

  // Helper function to get material price from materialPrices
  const getMaterialPrice = (materialName: string): number => {
    if (!Array.isArray(materialPrices)) return 0;

    // Look for Countertops or Kitchen Countertops category
    const countertopmaterial = materialPrices.find(
      (m: any) =>
        m.name?.toLowerCase().includes("countertop") ||
        m.name?.toLowerCase().includes("kitchen"),
    );

    if (!countertopmaterial) return 0;

    // Check if materials are in type.materials object
    if (countertopmaterial.type?.materials) {
      const materials = countertopmaterial.type.materials;
      return (
        materials[materialName] || materials[materialName.toLowerCase()] || 0
      );
    }

    // Check if type is an array with materials
    if (Array.isArray(countertopmaterial.type)) {
      const material = countertopmaterial.type.find(
        (t: any) =>
          t.material?.toLowerCase() === materialName.toLowerCase() ||
          t.name?.toLowerCase() === materialName.toLowerCase(),
      );
      return material?.price_kes_per_m2 || material?.price || 0;
    }

    // Direct price lookup
    return countertopmaterial.price || 0;
  };

  // ============================================
  // WARDROBE HANDLERS
  // ============================================
  const addWardrobe = () => {
    const newWardrobe: WardrobeItem = {
      id: `wardrobe-${Date.now()}`,
      name: "New Wardrobe",
      quotationType: "lump-sum",
      usesLumpSum: true,
      lumpSumAmount: 0,
      numBoards: "0",
      numHinges: "0",
      numLocks: "0",
      numDrawerRails: "0",
      hasGlass: false,
      glassArea: "0",
      quantity: "1",
      unitPrice: "0",
    };
    setWardrobes([...wardrobes, newWardrobe]);
  };

  const removeWardrobe = (id: string) => {
    setWardrobes(wardrobes.filter((w) => w.id !== id));
  };

  const updateWardrobe = (
    id: string,
    field: keyof WardrobeItem,
    value: any,
  ) => {
    setWardrobes(
      wardrobes.map((w) => {
        if (w.id === id) {
          const updated = { ...w, [field]: value };

          if (field === "quotationType") {
            updated.usesLumpSum = value === "lump-sum";
            if (value === "lump-sum") {
              updated.totalPrice = updated.lumpSumAmount || 0;
            } else {
              const qty = parseFloat(updated.quantity) || 0;
              const price = parseFloat(updated.unitPrice || "0") || 0;
              updated.totalPrice = qty * price;
            }
          } else if (
            field === "lumpSumAmount" ||
            field === "quantity" ||
            field === "unitPrice"
          ) {
            if (w.quotationType === "lump-sum") {
              updated.totalPrice = updated.lumpSumAmount || 0;
            } else {
              const qty = parseFloat(updated.quantity) || 0;
              const price = parseFloat(updated.unitPrice || "0") || 0;
              updated.totalPrice = qty * price;
            }
          }

          return updated;
        }
        return w;
      }),
    );
  };

  const calculateWardrobesTotalCost = (): number => {
    return wardrobes.reduce((total, w) => total + (w.totalPrice || 0), 0);
  };

  // ============================================
  // COUNTERTOP HANDLERS
  // ============================================
  const calculateCornerStripLength = (
    length: number,
    width: number,
  ): number => {
    return (length + width) * 2 * 0.25;
  };

  const handleAddCountertop = () => {
    const defaultGraniteSize = GRANITE_SIZES.find((s) => s.isDefault);
    const newCountertop: Countertop = {
      id: `countertop-${Date.now()}`,
      type: "granite",
      length: defaultGraniteSize?.length || 1.5,
      width: defaultGraniteSize?.width || 0.6,
      area: 0,
      material: "Granite Polished",
      graniteSize: defaultGraniteSize?.id || "1500x600x20",
      cornerStrips: true,
      cornerStripLength: 0,
      unitPrice: 0,
      totalCost: 0,
    };
    setCountertops([...countertops, newCountertop]);
    setEditingCountertopId(newCountertop.id);
    setEditCountertopForm(newCountertop);
  };

  const handleEditCountertop = (countertop: Countertop) => {
    setEditingCountertopId(countertop.id);
    setEditCountertopForm({ ...countertop });
  };

  const handleSaveEdit = () => {
    if (editCountertopForm && editingCountertopId) {
      const area = editCountertopForm.length * editCountertopForm.width;
      const cornerStripLength = calculateCornerStripLength(
        editCountertopForm.length,
        editCountertopForm.width,
      );
      const totalCost = area * editCountertopForm.unitPrice;

      const updatedCountertop: Countertop = {
        ...editCountertopForm,
        cornerStrips: true,
        area,
        cornerStripLength,
        totalCost,
      };

      const updatedCountertops = countertops.map((c) =>
        c.id === editingCountertopId ? updatedCountertop : c,
      );
      setCountertops(updatedCountertops);
      setEditingCountertopId(null);
      setEditCountertopForm(null);
    }
  };

  const handleDeleteCountertop = (id: string) => {
    const updated = countertops.filter((c) => c.id !== id);
    setCountertops(updated);
  };

  const totalCountertopArea = countertops.reduce((sum, c) => sum + c.area, 0);
  const totalCountertopCost = countertops.reduce(
    (sum, c) => sum + c.totalCost,
    0,
  );
  const totalCornerStripLength = countertops.reduce(
    (sum, c) => sum + c.cornerStripLength,
    0,
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // ============================================
  // KITCHEN CABINET HANDLERS
  // ============================================
  const addKitchenCabinet = () => {
    const newCabinet: KitchenCabinet = {
      id: `cabinet-${Date.now()}`,
      name: "New Kitchen Cabinet",
      quotationType: "lump-sum",
      usesLumpSum: true,
      lumpSumAmount: 0,
      numCupboards: "0",
      numDrawers: "0",
      numDoors: "0",
      quantity: "1",
      unitPrice: "0",
      totalPrice: 0,
    };
    setKitchenCabinets([...kitchenCabinets, newCabinet]);
    setEditingCabinetId(newCabinet.id);
    setEditCabinetForm(newCabinet);
  };

  const removeKitchenCabinet = (id: string) => {
    setKitchenCabinets(kitchenCabinets.filter((c) => c.id !== id));
    if (editingCabinetId === id) {
      setEditingCabinetId(null);
      setEditCabinetForm(null);
    }
  };

  const updateKitchenCabinet = (
    id: string,
    field: string,
    value: string | boolean | number,
  ) => {
    setKitchenCabinets(
      kitchenCabinets.map((c) => {
        if (c.id === id) {
          const updated = { ...c, [field]: value };
          if (field === "quotationType") {
            updated.usesLumpSum = value === "lump-sum";
            if (updated.usesLumpSum) {
              updated.totalPrice = updated.lumpSumAmount || 0;
            } else {
              const qty = parseFloat(updated.quantity) || 0;
              const price = parseFloat(updated.unitPrice || "0") || 0;
              updated.totalPrice = qty * price;
            }
          } else if (
            field === "lumpSumAmount" ||
            field === "quantity" ||
            field === "unitPrice"
          ) {
            if (updated.quotationType === "lump-sum") {
              updated.totalPrice = updated.lumpSumAmount || 0;
            } else {
              const qty = parseFloat(updated.quantity) || 0;
              const price = parseFloat(updated.unitPrice || "0") || 0;
              updated.totalPrice = qty * price;
            }
          }
          if (editingCabinetId === id) {
            setEditCabinetForm(updated);
          }
          return updated;
        }
        return c;
      }),
    );
  };

  const calculateKitchenCabinetsTotalCost = (): number => {
    return kitchenCabinets.reduce((total, c) => total + (c.totalPrice || 0), 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-6">
        {/* ============================================ */}
        {/* WARDROBES & KITCHEN CABINETS COMBINED */}
        {/* ============================================ */}
        <div className="space-y-4">
          <h3 className="text-xl mb-4 text-gray-900 dark:text-white">
            Wardrobes
          </h3>

          <div className="space-y-4">
            {wardrobes.map((wardrobe, index) => (
              <Card key={wardrobe.id} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Item #{index + 1}: {wardrobe.name}
                    </h4>
                    {!readonly && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeWardrobe(wardrobe.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${wardrobe.id}`}>Item Name</Label>
                      <Input
                        id={`name-${wardrobe.id}`}
                        type="text"
                        value={wardrobe.name}
                        onChange={(e) =>
                          updateWardrobe(wardrobe.id, "name", e.target.value)
                        }
                        placeholder="e.g., Master Bedroom Wardrobe"
                        readOnly={readonly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`quote-type-${wardrobe.id}`}>
                        Quote Type
                      </Label>
                      <Select
                        value={wardrobe.quotationType}
                        onValueChange={(value) =>
                          updateWardrobe(
                            wardrobe.id,
                            "quotationType",
                            value as "lump-sum" | "detailed",
                          )
                        }
                        disabled={readonly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lump-sum">
                            Lump-Sum Amount
                          </SelectItem>
                          <SelectItem value="detailed">
                            Detailed Quote
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {wardrobe.quotationType === "detailed" && (
                      <div className="space-y-2">
                        <Label htmlFor={`qty-${wardrobe.id}`}>Quantity</Label>
                        <Input
                          id={`qty-${wardrobe.id}`}
                          type="number"
                          step="1"
                          min="0"
                          value={wardrobe.quantity}
                          onChange={(e) =>
                            updateWardrobe(
                              wardrobe.id,
                              "quantity",
                              e.target.value,
                            )
                          }
                          readOnly={readonly}
                        />
                      </div>
                    )}
                  </div>

                  {wardrobe.quotationType === "lump-sum" ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                      <h5 className="text-gray-900 dark:text-white mb-4">
                        Lump-Sum Pricing
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`lump-sum-${wardrobe.id}`}>
                            Total Amount (KES)
                          </Label>
                          <Input
                            id={`lump-sum-${wardrobe.id}`}
                            type="number"
                            step="100"
                            min="0"
                            value={wardrobe.lumpSumAmount || 0}
                            onChange={(e) =>
                              updateWardrobe(
                                wardrobe.id,
                                "lumpSumAmount",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            placeholder="Enter total cost"
                            readOnly={readonly}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                      <h5 className="text-gray-900 dark:text-white mb-4">
                        Detailed Components
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor={`boards-${wardrobe.id}`}>
                            Number of Boards
                          </Label>
                          <Input
                            id={`boards-${wardrobe.id}`}
                            type="number"
                            step="1"
                            min="0"
                            value={wardrobe.numBoards || "0"}
                            onChange={(e) =>
                              updateWardrobe(
                                wardrobe.id,
                                "numBoards",
                                e.target.value,
                              )
                            }
                            readOnly={readonly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`hinges-${wardrobe.id}`}>
                            Number of Hinges
                          </Label>
                          <Input
                            id={`hinges-${wardrobe.id}`}
                            type="number"
                            step="1"
                            min="0"
                            value={wardrobe.numHinges || "0"}
                            onChange={(e) =>
                              updateWardrobe(
                                wardrobe.id,
                                "numHinges",
                                e.target.value,
                              )
                            }
                            readOnly={readonly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`locks-${wardrobe.id}`}>
                            Number of Locks
                          </Label>
                          <Input
                            id={`locks-${wardrobe.id}`}
                            type="number"
                            step="1"
                            min="0"
                            value={wardrobe.numLocks || "0"}
                            onChange={(e) =>
                              updateWardrobe(
                                wardrobe.id,
                                "numLocks",
                                e.target.value,
                              )
                            }
                            readOnly={readonly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`rails-${wardrobe.id}`}>
                            Number of Drawer Rails
                          </Label>
                          <Input
                            id={`rails-${wardrobe.id}`}
                            type="number"
                            step="1"
                            min="0"
                            value={wardrobe.numDrawerRails || "0"}
                            onChange={(e) =>
                              updateWardrobe(
                                wardrobe.id,
                                "numDrawerRails",
                                e.target.value,
                              )
                            }
                            readOnly={readonly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`glass-area-${wardrobe.id}`}>
                            Glass Area (m²)
                          </Label>
                          <Input
                            id={`glass-area-${wardrobe.id}`}
                            type="number"
                            step="0.1"
                            min="0"
                            value={wardrobe.glassArea || "0"}
                            onChange={(e) =>
                              updateWardrobe(
                                wardrobe.id,
                                "glassArea",
                                e.target.value,
                              )
                            }
                            disabled={!wardrobe.hasGlass || readonly}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox
                          id={`has-glass-${wardrobe.id}`}
                          checked={wardrobe.hasGlass || false}
                          onCheckedChange={(checked) =>
                            updateWardrobe(wardrobe.id, "hasGlass", checked)
                          }
                          disabled={readonly}
                        />
                        <Label
                          htmlFor={`has-glass-${wardrobe.id}`}
                          className="font-normal"
                        >
                          Include Glass Doors/Panels
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`unit-price-${wardrobe.id}`}>
                          Unit Price (KES)
                        </Label>
                        <Input
                          id={`unit-price-${wardrobe.id}`}
                          type="number"
                          step="100"
                          min="0"
                          value={wardrobe.unitPrice || "0"}
                          onChange={(e) =>
                            updateWardrobe(
                              wardrobe.id,
                              "unitPrice",
                              e.target.value,
                            )
                          }
                          readOnly={readonly}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <Label htmlFor={`notes-${wardrobe.id}`}>Notes</Label>
                    <Input
                      id={`notes-${wardrobe.id}`}
                      type="text"
                      value={wardrobe.notes || ""}
                      onChange={(e) =>
                        updateWardrobe(wardrobe.id, "notes", e.target.value)
                      }
                      placeholder="Additional notes or specifications"
                      readOnly={readonly}
                    />
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white">
                        Total Cost:
                      </span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        KES{" "}
                        {(wardrobe.totalPrice || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!readonly && (
            <Button onClick={addWardrobe} className="mt-4" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Wardrobe Item
            </Button>
          )}

          {wardrobes.length > 0 && (
            <Card className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-gray-900 dark:text-white">
                      Total Wardrobes Cost
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {wardrobes.length} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      KES{" "}
                      {calculateWardrobesTotalCost().toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KITCHEN CABINETS SECTION */}
          <h3 className="text-xl  mt-8 mb-4 text-gray-900 dark:text-white">
            Kitchen Cabinets
          </h3>

          <div className="space-y-4">
            {kitchenCabinets.map((cabinet, index) => (
              <Card key={cabinet.id} className="p-6">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Item #{index + 1}: {cabinet.name}
                    </h4>
                    {!readonly && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeKitchenCabinet(cabinet.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor={`cab-name-${cabinet.id}`}>
                        Item Name
                      </Label>
                      <Input
                        id={`cab-name-${cabinet.id}`}
                        type="text"
                        value={cabinet.name}
                        onChange={(e) =>
                          updateKitchenCabinet(
                            cabinet.id,
                            "name",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., Base Kitchen Cabinets"
                        readOnly={readonly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`cab-quote-type-${cabinet.id}`}>
                        Quote Type
                      </Label>
                      <Select
                        value={cabinet.quotationType}
                        onValueChange={(value) =>
                          updateKitchenCabinet(
                            cabinet.id,
                            "quotationType",
                            value as "lump-sum" | "detailed",
                          )
                        }
                        disabled={readonly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lump-sum">
                            Lump-Sum Amount
                          </SelectItem>
                          <SelectItem value="detailed">
                            Detailed Quote
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`cab-quantity-${cabinet.id}`}>
                        Quantity
                      </Label>
                      <Input
                        id={`cab-quantity-${cabinet.id}`}
                        type="number"
                        step="1"
                        min="0"
                        value={cabinet.quantity}
                        onChange={(e) =>
                          updateKitchenCabinet(
                            cabinet.id,
                            "quantity",
                            e.target.value,
                          )
                        }
                        readOnly={readonly}
                      />
                    </div>
                  </div>

                  {cabinet.quotationType === "lump-sum" ? (
                    <div className="space-y-2 mb-4">
                      <Label htmlFor={`cab-lump-sum-${cabinet.id}`}>
                        Lump Sum Amount (KES)
                      </Label>
                      <Input
                        id={`cab-lump-sum-${cabinet.id}`}
                        type="number"
                        step="100"
                        min="0"
                        value={cabinet.lumpSumAmount || "0"}
                        onChange={(e) =>
                          updateKitchenCabinet(
                            cabinet.id,
                            "lumpSumAmount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="Enter total cost"
                        readOnly={readonly}
                      />
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                      <h5 className="text-gray-900 dark:text-white mb-4">
                        Detailed Components
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor={`cab-cupboards-${cabinet.id}`}>
                            Number of Cupboards
                          </Label>
                          <Input
                            id={`cab-cupboards-${cabinet.id}`}
                            type="number"
                            step="1"
                            min="0"
                            value={cabinet.numCupboards || "0"}
                            onChange={(e) =>
                              updateKitchenCabinet(
                                cabinet.id,
                                "numCupboards",
                                e.target.value,
                              )
                            }
                            readOnly={readonly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`cab-drawers-${cabinet.id}`}>
                            Number of Drawers
                          </Label>
                          <Input
                            id={`cab-drawers-${cabinet.id}`}
                            type="number"
                            step="1"
                            min="0"
                            value={cabinet.numDrawers || "0"}
                            onChange={(e) =>
                              updateKitchenCabinet(
                                cabinet.id,
                                "numDrawers",
                                e.target.value,
                              )
                            }
                            readOnly={readonly}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`cab-doors-${cabinet.id}`}>
                            Number of Doors
                          </Label>
                          <Input
                            id={`cab-doors-${cabinet.id}`}
                            type="number"
                            step="1"
                            min="0"
                            value={cabinet.numDoors || "0"}
                            onChange={(e) =>
                              updateKitchenCabinet(
                                cabinet.id,
                                "numDoors",
                                e.target.value,
                              )
                            }
                            readOnly={readonly}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`cab-unit-price-${cabinet.id}`}>
                          Unit Price (KES)
                        </Label>
                        <Input
                          id={`cab-unit-price-${cabinet.id}`}
                          type="number"
                          step="100"
                          min="0"
                          value={cabinet.unitPrice || "0"}
                          onChange={(e) =>
                            updateKitchenCabinet(
                              cabinet.id,
                              "unitPrice",
                              e.target.value,
                            )
                          }
                          readOnly={readonly}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <Label htmlFor={`cab-notes-${cabinet.id}`}>Notes</Label>
                    <Input
                      id={`cab-notes-${cabinet.id}`}
                      type="text"
                      value={cabinet.notes || ""}
                      onChange={(e) =>
                        updateKitchenCabinet(
                          cabinet.id,
                          "notes",
                          e.target.value,
                        )
                      }
                      placeholder="Additional notes or specifications"
                      readOnly={readonly}
                    />
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white">
                        Total Cost:
                      </span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        KES{" "}
                        {(cabinet.totalPrice || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!readonly && (
            <Button
              onClick={addKitchenCabinet}
              className="mt-4"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Kitchen Cabinet Item
            </Button>
          )}

          {kitchenCabinets.length > 0 && (
            <Card className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-gray-900 dark:text-white">
                      Total Kitchen Cabinets Cost
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {kitchenCabinets.length} item(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      KES{" "}
                      {calculateKitchenCabinetsTotalCost().toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KITCHEN COUNTERTOPS SECTION */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Area
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">
                    {totalCountertopArea.toFixed(2)} m²
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Corner Strips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">
                    {totalCornerStripLength.toFixed(2)} m
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-green-600">
                    {formatCurrency(totalCountertopCost)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Kitchen Countertops</CardTitle>
                    <CardDescription>
                      Add granite or tiled countertops with corner strip details
                    </CardDescription>
                  </div>
                  {!readonly && (
                    <Button onClick={handleAddCountertop} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Countertop
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {editingCountertopId && editCountertopForm && (
                  <Card className="border-l-4 border-l-amber-500">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {countertops.some((c) => c.id === editingCountertopId)
                          ? "Edit Countertop"
                          : "New Countertop"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="mb-3 block">Material Type</Label>
                        <RadioGroup
                          value={editCountertopForm.type}
                          onValueChange={(value) =>
                            setEditCountertopForm({
                              ...editCountertopForm,
                              type: value as "granite" | "tiled",
                              material:
                                value === "granite"
                                  ? "Granite Polished"
                                  : "Ceramic Tiles",
                            })
                          }
                          disabled={readonly}
                        >
                          <div className="flex items-center space-x-2 mb-3">
                            <RadioGroupItem value="granite" id="granite" />
                            <Label htmlFor="granite" className="cursor-pointer">
                              Granite
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="tiled" id="tiled" />
                            <Label htmlFor="tiled" className="cursor-pointer">
                              Tiled
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {editCountertopForm.type === "granite" && (
                        <div>
                          <Label htmlFor="granite-size">
                            Granite Size (LxWxH)
                          </Label>
                          <Select
                            value={editCountertopForm.graniteSize}
                            onValueChange={(value) => {
                              const selectedSize = GRANITE_SIZES.find(
                                (s) => s.id === value,
                              );
                              const materialPrice = getMaterialPrice(
                                editCountertopForm.material,
                              );
                              setEditCountertopForm({
                                ...editCountertopForm,
                                graniteSize: value,
                                length: selectedSize?.length || 1.5,
                                width: selectedSize?.width || 0.6,
                                unitPrice:
                                  materialPrice || editCountertopForm.unitPrice,
                              });
                            }}
                            disabled={readonly}
                          >
                            <SelectTrigger id="granite-size">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {GRANITE_SIZES.map((size) => (
                                <SelectItem key={size.id} value={size.id}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            Selected: {editCountertopForm.length.toFixed(2)}m ×{" "}
                            {editCountertopForm.width.toFixed(2)}m
                          </p>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="material">Material Options</Label>
                        <Select
                          value={editCountertopForm.material}
                          onValueChange={(value) => {
                            const materialPrice = getMaterialPrice(value);
                            setEditCountertopForm({
                              ...editCountertopForm,
                              material: value,
                              unitPrice:
                                materialPrice || editCountertopForm.unitPrice,
                            });
                          }}
                          disabled={readonly}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              COUNTERTOP_MATERIALS[
                                editCountertopForm.type as keyof typeof COUNTERTOP_MATERIALS
                              ] || []
                            ).map((material) => (
                              <SelectItem key={material} value={material}>
                                {material}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-length">Length (m)</Label>
                          <Input
                            id="edit-length"
                            type="number"
                            min="0"
                            step="0.1"
                            value={editCountertopForm.length}
                            onChange={(e) =>
                              setEditCountertopForm({
                                ...editCountertopForm,
                                length: parseFloat(e.target.value) || 0,
                              })
                            }
                            readOnly={
                              readonly || editCountertopForm.type === "granite"
                            }
                            className={
                              editCountertopForm.type === "granite"
                                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                : ""
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
                            value={editCountertopForm.width}
                            onChange={(e) =>
                              setEditCountertopForm({
                                ...editCountertopForm,
                                width: parseFloat(e.target.value) || 0,
                              })
                            }
                            readOnly={
                              readonly || editCountertopForm.type === "granite"
                            }
                            className={
                              editCountertopForm.type === "granite"
                                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                                : ""
                            }
                          />
                        </div>
                      </div>

                      <div className="border p-3 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <Label>Corner Strips</Label>
                          <input
                            type="checkbox"
                            checked={true}
                            disabled={true}
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Corner strips: ~
                          {calculateCornerStripLength(
                            editCountertopForm.length,
                            editCountertopForm.width,
                          ).toFixed(2)}{" "}
                          meters
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="edit-price">Unit Price (Ksh/m²)</Label>
                        <Input
                          id="edit-price"
                          type="number"
                          min="0"
                          step="100"
                          value={editCountertopForm.unitPrice}
                          onChange={(e) =>
                            setEditCountertopForm({
                              ...editCountertopForm,
                              unitPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          readOnly={readonly}
                        />
                      </div>

                      {editCountertopForm.length > 0 &&
                        editCountertopForm.width > 0 && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span>Area:</span>{" "}
                                {(
                                  editCountertopForm.length *
                                  editCountertopForm.width
                                ).toFixed(2)}{" "}
                                m²
                              </div>
                              <div>
                                <span>Cost:</span>{" "}
                                {formatCurrency(
                                  editCountertopForm.length *
                                    editCountertopForm.width *
                                    editCountertopForm.unitPrice,
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {!readonly && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => {
                              setEditingCountertopId(null);
                              setEditCountertopForm(null);
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleSaveEdit}>
                            Save Countertop
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {countertops.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[25%] text-left">
                            Material
                          </TableHead>
                          <TableHead className="w-[18%] text-left">
                            Dimensions
                          </TableHead>
                          <TableHead className="w-[12%] text-right">
                            Area (m²)
                          </TableHead>
                          <TableHead className="w-[18%] text-center">
                            Corner Strips
                          </TableHead>
                          <TableHead className="w-[15%] text-right">
                            Unit Price
                          </TableHead>
                          <TableHead className="w-[12%] text-right">
                            Total Cost
                          </TableHead>
                          {!readonly && (
                            <TableHead className="w-[12%] text-right">
                              Actions
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {countertops.map((countertop) => (
                          <TableRow
                            key={countertop.id}
                            className="hover:bg-muted/30"
                          >
                            <TableCell className="font-medium w-[25%]">
                              <div>
                                <div className="text-sm">
                                  {countertop.material}
                                </div>
                                {countertop.type === "granite" &&
                                  countertop.graniteSize && (
                                    <div className="text-xs text-gray-500">
                                      {GRANITE_SIZES.find(
                                        (s) => s.id === countertop.graniteSize,
                                      )?.label || countertop.graniteSize}
                                    </div>
                                  )}
                                <div className="text-xs text-gray-500">
                                  ({countertop.type})
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="w-[18%] text-sm">
                              {countertop.length.toFixed(2)}m ×{" "}
                              {countertop.width.toFixed(2)}m
                            </TableCell>
                            <TableCell className="text-right w-[12%] text-sm">
                              {countertop.area.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center w-[18%]">
                              {countertop.cornerStrips ? (
                                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs whitespace-nowrap">
                                  {countertop.cornerStripLength.toFixed(2)}m
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right w-[15%] text-sm">
                              {formatCurrency(countertop.unitPrice)}/m²
                            </TableCell>
                            <TableCell className="text-right text-green-600 w-[12%] text-sm">
                              {formatCurrency(countertop.totalCost)}
                            </TableCell>
                            {!readonly && (
                              <TableCell className="text-right w-[12%]">
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      handleEditCountertop(countertop)
                                    }
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() =>
                                      handleDeleteCountertop(countertop.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {readonly
                      ? "No countertops specified."
                      : "No countertops added yet. Click 'Add Countertop' to begin."}
                  </div>
                )}

                {countertops.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted">
                    <div>
                      <div className="text-xs">Total Area</div>
                      <div className="text-lg">
                        {totalCountertopArea.toFixed(2)} m²
                      </div>
                    </div>
                    <div>
                      <div className="text-xs">Total Corner Strips</div>
                      <div className="text-lg">
                        {totalCornerStripLength.toFixed(2)} m
                      </div>
                    </div>
                    <div>
                      <div className="text-xs">Total Cost</div>
                      <div className="text-lg text-green-600">
                        {formatCurrency(totalCountertopCost)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {(wardrobes.length > 0 ||
        kitchenCabinets.length > 0 ||
        countertops.length > 0) && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-gray-900 dark:text-white font-semibold">
                  Total Wardrobes, Cabinets & Countertops Cost
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {wardrobes.length +
                    kitchenCabinets.length +
                    countertops.length}{" "}
                  item(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  KES{" "}
                  {(
                    calculateWardrobesTotalCost() +
                    calculateKitchenCabinetsTotalCost() +
                    totalCountertopCost
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default KitchenAndWardrobesCalculator;
