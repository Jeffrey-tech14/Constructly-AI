// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Trash2, Plus } from "lucide-react";

export interface WardrobeItem {
  id: string;
  name: string;
  quotationType: "lump-sum" | "detailed"; // Lump-sum or detailed breakdown
  // Lump-sum fields
  lumpSumAmount?: number;
  // Detailed fields
  numBoards?: string;
  numHinges?: string;
  numLocks?: string;
  numDrawerRails?: string;
  hasGlass?: boolean;
  glassArea?: string; // m²
  notes?: string;
  // Common fields
  quantity: string;
  unitPrice?: string;
  totalPrice?: number;
}

interface WardrobesCalculatorProps {
  wardrobes: WardrobeItem[];
  setWardrobes: (wardrobes: WardrobeItem[]) => void;
  setQuoteData?: (data: any) => void;
  quote?: any;
}

const WardrobesCalculator: React.FC<WardrobesCalculatorProps> = ({
  wardrobes,
  setWardrobes,
  setQuoteData,
  quote,
}) => {
  useEffect(() => {
    setQuoteData?.((prev: any) => ({
      ...prev,
      wardrobes_cabinets: wardrobes,
    }));
  }, [wardrobes, setQuoteData]);

  const addWardrobe = () => {
    const newWardrobe: WardrobeItem = {
      id: `wardrobe-${Date.now()}`,
      name: "New Wardrobe",
      quotationType: "lump-sum",
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
    value: any
  ) => {
    setWardrobes(
      wardrobes.map((w) => {
        if (w.id === id) {
          const updated = { ...w, [field]: value };

          // Calculate total price
          if (field === "quotationType") {
            if (value === "lump-sum") {
              updated.totalPrice = updated.lumpSumAmount || 0;
            } else {
              // For detailed, base on quantity and unit price
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
      })
    );
  };

  const calculateTotalCost = (): number => {
    return wardrobes.reduce((total, w) => total + (w.totalPrice || 0), 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Wardrobes & Cabinets
        </h3>

        <div className="space-y-4">
          {wardrobes.map((wardrobe, index) => (
            <Card key={wardrobe.id} className="p-6">
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Item #{index + 1}: {wardrobe.name}
                  </h4>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeWardrobe(wardrobe.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Name */}
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
                    />
                  </div>

                  {/* Quote Type */}
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
                          value as "lump-sum" | "detailed"
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lump-sum">
                          Lump-Sum Amount
                        </SelectItem>
                        <SelectItem value="detailed">Detailed Quote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity (for detailed breakdown pricing) */}
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
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                </div>

                {/* Conditional Content Based on Quote Type */}
                {wardrobe.quotationType === "lump-sum" ? (
                  // LUMP-SUM SECTION
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
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
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="Enter total cost"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // DETAILED QUOTE SECTION
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
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
                              e.target.value
                            )
                          }
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
                              e.target.value
                            )
                          }
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
                              e.target.value
                            )
                          }
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
                              e.target.value
                            )
                          }
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
                              e.target.value
                            )
                          }
                          disabled={!wardrobe.hasGlass}
                        />
                      </div>
                    </div>

                    {/* Glass Checkbox */}
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id={`has-glass-${wardrobe.id}`}
                        checked={wardrobe.hasGlass || false}
                        onCheckedChange={(checked) =>
                          updateWardrobe(wardrobe.id, "hasGlass", checked)
                        }
                      />
                      <Label
                        htmlFor={`has-glass-${wardrobe.id}`}
                        className="font-normal"
                      >
                        Include Glass Doors/Panels
                      </Label>
                    </div>

                    {/* Unit Price for Detailed */}
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
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
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
                  />
                </div>

                {/* Total Price Display */}
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">
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

        {/* Add New Button */}
        <Button onClick={addWardrobe} className="mt-4" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Wardrobe Item
        </Button>

        {/* Total Summary */}
        {wardrobes.length > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Total Wardrobes & Cabinets Cost
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {wardrobes.length} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    KES{" "}
                    {calculateTotalCost().toLocaleString(undefined, {
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

export default WardrobesCalculator;
