// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import { FinishElement } from "@/hooks/useUniversalFinishesCalculator";

interface OtherFinishesCalculatorProps {
  otherFinishes: FinishElement[];
  materialPrices: any[];
  onOtherFinishesUpdate?: (otherFinishes: FinishElement[]) => void;
  readonly?: boolean;
  quote?: any;
  wallDimensions?: any;
}

const CUSTOM_UNITS = ["m²", "m", "pcs", "kg", "l", "set", "unit"] as const;

interface CustomManualItem {
  id: string;
  name: string;
  location: string;
  unitPrice: number;
  unit: typeof CUSTOM_UNITS[number];
  quantity: number;
}

interface CustomItemCalculation {
  id: string;
  name: string;
  location: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
}

export default function OtherFinishesCalculator({
  otherFinishes,
  materialPrices,
  onOtherFinishesUpdate,
  readonly = false,
  quote,
  wallDimensions,
}: OtherFinishesCalculatorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CustomManualItem | null>(null);
  
  // Custom manual item form state
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFormData, setCustomFormData] = useState<Partial<CustomManualItem>>({
    name: "",
    location: "",
    unitPrice: 0,
    unit: "m²",
    quantity: 0,
  });

  // Calculate items directly from user input
  const calculations = useMemo(() => {
    return otherFinishes
      .filter((finish) => finish.category === "joinery")
      .map((finish) => {
        const unitPrice = finish.price || 0;
        const totalCost = unitPrice * finish.quantity;
        
        return {
          id: finish.id,
          name: finish.material,
          location: finish.location || "",
          quantity: finish.quantity,
          unit: finish.unit,
          unitPrice: unitPrice,
          totalCost: totalCost,
        };
      });
  }, [otherFinishes]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      totalItems: calculations.length,
      totalQuantity: calculations.reduce((sum, calc) => sum + calc.quantity, 0),
      totalCost: calculations.reduce((sum, calc) => sum + calc.totalCost, 0),
    };
  }, [calculations]);

  const filteredCalculations = useMemo(() => {
    return calculations.filter((calc) => {
      const matchesSearch =
        calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [calculations, searchTerm]);

  const handleAddCustomItem = () => {
    if (!customFormData.name || customFormData.unitPrice === undefined || customFormData.quantity === undefined) {
      alert("Please fill in all required fields");
      return;
    }

    const newCustomItem: FinishElement = {
      id: `custom-item-${Date.now()}`,
      category: "joinery",
      material: customFormData.name || "Custom Item",
      location: customFormData.location || "",
      area: 0,
      unit: (customFormData.unit || "m²") as "m²" | "m" | "pcs",
      quantity: customFormData.quantity || 0,
      price: customFormData.unitPrice || 0,
    };

    if (onOtherFinishesUpdate) {
      onOtherFinishesUpdate([...otherFinishes, newCustomItem]);
    }

    // Reset form
    setCustomFormData({
      name: "",
      location: "",
      unitPrice: 0,
      unit: "m²",
      quantity: 0,
    });
    setShowCustomForm(false);
  };

  const handleEdit = (calc: CustomItemCalculation) => {
    const finish = otherFinishes.find((f) => f.id === calc.id);
    if (finish) {
      setEditingId(calc.id);
      setEditForm({
        id: finish.id,
        name: finish.material,
        location: finish.location || "",
        quantity: finish.quantity,
        unit: (finish.unit || "m²") as typeof CUSTOM_UNITS[number],
        unitPrice: finish.price || 0,
      });
    }
  };

  const handleSaveEdit = () => {
    if (!editForm || !editingId) return;

    const updatedOtherFinishes = otherFinishes.map((finish) =>
      finish.id === editingId
        ? {
            ...finish,
            material: editForm.name,
            location: editForm.location,
            quantity: editForm.quantity,
            unit: editForm.unit as "m²" | "m" | "pcs",
            unitPrice: editForm.unitPrice,
          }
        : finish,
    );

    if (onOtherFinishesUpdate) {
      onOtherFinishesUpdate(updatedOtherFinishes);
    }
    setEditingId(null);
    setEditForm(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const updatedOtherFinishes = otherFinishes.filter((finish) => finish.id !== id);

    if (onOtherFinishesUpdate) {
      onOtherFinishesUpdate(updatedOtherFinishes);
    }
  };

  const handleEditFormChange = (field: keyof CustomManualItem, value: any) => {
    if (!editForm) return;

    setEditForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatQuantity = (quantity: number, unit: string) => {
    if (unit === "pcs") {
      return Math.round(quantity).toString();
    }
    return quantity.toFixed(2);
  };

  const exportToCSV = () => {
    const headers = [
      "Item Name",
      "Location",
      "Quantity",
      "Unit",
      "Unit Price",
      "Total Cost",
    ];
    const csvData = calculations.map((calc) => [
      calc.name,
      calc.location,
      calc.quantity,
      calc.unit,
      calc.unitPrice,
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
    link.download = "custom-items.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.totalItems}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals?.totalQuantity?.toFixed(2)}
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
              <CardTitle>Custom Finish Items</CardTitle>
              <CardDescription>
                Add custom finish items with manual pricing
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center">
              {!readonly && (
                <Button 
                  onClick={() => setShowCustomForm(!showCustomForm)} 
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Item
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

          {/* Custom Manual Item Form */}
          {showCustomForm && !readonly && (
            <Card className="mb-6 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-lg">Add Custom Item</CardTitle>
                <CardDescription>
                  Manually input item details including custom pricing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="custom-name">Item Name *</Label>
                    <Input
                      id="custom-name"
                      placeholder="e.g., Wooden Door Frame, Cabinet"
                      value={customFormData.name || ""}
                      onChange={(e) =>
                        setCustomFormData({
                          ...customFormData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom-location">Location</Label>
                    <Input
                      id="custom-location"
                      placeholder="e.g., Master Bedroom, Kitchen"
                      value={customFormData.location || ""}
                      onChange={(e) =>
                        setCustomFormData({
                          ...customFormData,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom-unit-price">Unit Price (KSH) *</Label>
                    <Input
                      id="custom-unit-price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={customFormData.unitPrice || ""}
                      onChange={(e) =>
                        setCustomFormData({
                          ...customFormData,
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom-unit">Unit *</Label>
                    <Select
                      value={customFormData.unit || "m²"}
                      onValueChange={(value: any) =>
                        setCustomFormData({
                          ...customFormData,
                          unit: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m²">Square Meters (m²)</SelectItem>
                        <SelectItem value="m">Meters (m)</SelectItem>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="l">Liters (l)</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="unit">Unit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="custom-quantity">Quantity</Label>
                    <Input
                      id="custom-quantity"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={customFormData.quantity || ""}
                      onChange={(e) =>
                        setCustomFormData({
                          ...customFormData,
                          quantity: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => setShowCustomForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddCustomItem}>
                    Add Custom Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Form */}
          {editingId && editForm && (
            <Card className="mb-6 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-lg">
                  Edit Custom Item
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Item Name</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) =>
                        handleEditFormChange("name", e.target.value)
                      }
                      placeholder="e.g., Paint on Doors, Custom Feature"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={editForm.location}
                      onChange={(e) =>
                        handleEditFormChange("location", e.target.value)
                      }
                      placeholder="e.g., All Doors, Entrance"
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
                      onValueChange={(value: any) =>
                        handleEditFormChange("unit", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m²">Square Meters (m²)</SelectItem>
                        <SelectItem value="m">Meters (m)</SelectItem>
                        <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                        <SelectItem value="kg">Kilograms (kg)</SelectItem>
                        <SelectItem value="l">Liters (l)</SelectItem>
                        <SelectItem value="set">Set</SelectItem>
                        <SelectItem value="unit">Unit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-unit-price">Unit Price (KSH)</Label>
                    <Input
                      id="edit-unit-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.unitPrice}
                      onChange={(e) =>
                        handleEditFormChange(
                          "unitPrice",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
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
                  <TableHead>Item Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
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
                      colSpan={readonly ? 6 : 7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No custom items found.{" "}
                      {!readonly &&
                        "Add custom items to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCalculations.map((calc) => (
                    <TableRow key={calc.id}>
                      <TableCell className="font-medium">
                        {calc.name}
                      </TableCell>
                      <TableCell>{calc.location || "-"}</TableCell>
                      <TableCell className="text-right">
                        {formatQuantity(calc.quantity, calc.unit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {calc.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(calc.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right ">
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Items:</span>{" "}
                  {filteredCalculations.length}
                </div>
                <div>
                  <span className="font-medium">Total Quantity:</span>{" "}
                  {filteredCalculations.reduce((sum, calc) => sum + calc.quantity, 0).toFixed(2)}
                </div>
                <div className="">
                  <span>Grand Total:</span>{" "}
                  {formatCurrency(totals.totalCost)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
