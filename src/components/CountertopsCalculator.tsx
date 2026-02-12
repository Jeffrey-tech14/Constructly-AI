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
import { Plus, Trash2, Edit } from "lucide-react";

// STEP 5: Countertop Finishes Interface
interface Countertop {
  id: string;
  type: "granite" | "tiled";
  length: number; // meters
  width: number; // meters
  area: number; // auto-calculated m²
  material: string; // "Granite Polished", "Ceramic Tiles", "Granite Honed", etc.
  cornerStrips: boolean;
  cornerStripLength: number; // meters (auto-calculated)
  unitPrice: number;
  totalCost: number; // auto-calculated
}

const COUNTERTOP_MATERIALS = {
  granite: [
    "Granite Polished",
    "Granite Honed",
    "Granite Flamed",
    "Granite Bush Hammered",
  ],
  tiled: [
    "Ceramic Tiles",
    "Porcelain Tiles",
    "Stone Tiles",
    "Mosaic Tiles",
  ],
};

interface CountertopsCalculatorProps {
  quote?: any;
  setQuoteData?: (data: any) => void;
  materialPrices?: any[];
  readonly?: boolean;
}

export default function CountertopsCalculator({
  quote,
  setQuoteData,
  materialPrices = [],
  readonly = false,
}: CountertopsCalculatorProps) {
  const [countertops, setCountertops] = useState<Countertop[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Countertop | null>(null);

  // Calculate corner strip length (perimeter for corners)
  const calculateCornerStripLength = (length: number, width: number): number => {
    // For a rectangular countertop, corner strips go on the corners
    // Typically: 4 corners × strip length (usually 200-300mm per corner)
    // Simplified: count as 0.5m per corner (2m total * 2 sides)
    return (length + width) * 2 * 0.25; // 25% of perimeter for corner joints
  };

  const handleAddCountertop = () => {
    const newCountertop: Countertop = {
      id: `countertop-${Date.now()}`,
      type: "granite",
      length: 0,
      width: 0,
      area: 0,
      material: "Granite Polished",
      cornerStrips: true,
      cornerStripLength: 0,
      unitPrice: 0,
      totalCost: 0,
    };
    setCountertops([...countertops, newCountertop]);
    setEditingId(newCountertop.id);
    setEditForm(newCountertop);
  };

  const handleEditCountertop = (countertop: Countertop) => {
    setEditingId(countertop.id);
    setEditForm({ ...countertop });
  };

  const handleSaveEdit = () => {
    if (editForm && editingId) {
      // Calculate area
      const area = editForm.length * editForm.width;

      // Calculate corner strip length
      const cornerStripLength = calculateCornerStripLength(
        editForm.length,
        editForm.width,
      );

      // Calculate total cost (area * unitPrice)
      const totalCost = area * editForm.unitPrice;

      const updatedCountertop: Countertop = {
        ...editForm,
        cornerStrips: true,
        area,
        cornerStripLength,
        totalCost,
      };

      const updatedCountertops = countertops.map((c) =>
        c.id === editingId ? updatedCountertop : c
      );
      setCountertops(updatedCountertops);
      setEditingId(null);
      setEditForm(null);

      if (setQuoteData) {
        setQuoteData((prev: any) => ({
          ...prev,
          countertops: updatedCountertops,
        }));
      }
    }
  };

  const handleDeleteCountertop = (id: string) => {
    const updated = countertops.filter((c) => c.id !== id);
    setCountertops(updated);
    if (setQuoteData) {
      setQuoteData((prev: any) => ({
        ...prev,
        countertops: updated,
      }));
    }
  };

  const totalArea = countertops.reduce((sum, c) => sum + c.area, 0);
  const totalCost = countertops.reduce((sum, c) => sum + c.totalCost, 0);
  const totalCornerStripLength = countertops.reduce(
    (sum, c) => sum + c.cornerStripLength,
    0
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(value);
  };

  useEffect(() => {
    if (setQuoteData) {
      setQuoteData((prev: any) => ({
        ...prev,
        countertops: countertops,
      }));
    }
  }, [countertops, setQuoteData]);

  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArea.toFixed(2)} m²</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Corner Strips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCornerStripLength.toFixed(2)} m
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCost)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Countertops Card */}
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
          {/* Edit Form */}
          {editingId && editForm && (
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle className="text-lg">
                  {countertops.some((c) => c.id === editingId)
                    ? "Edit Countertop"
                    : "New Countertop"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type Selection */}
                <div>
                  <Label className="mb-3 block font-bold">Material Type</Label>
                  <RadioGroup
                    value={editForm.type}
                    onValueChange={(value) =>
                      setEditForm({
                        ...editForm,
                        type: value as "granite" | "tiled",
                        material:
                          value === "granite"
                            ? "Granite Polished"
                            : "Ceramic Tiles",
                      })
                    }
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

                {/* Material Selection */}
                <div>
                  <Label htmlFor="material">Material Options</Label>
                  <Select
                    value={editForm.material}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, material: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        COUNTERTOP_MATERIALS[
                          editForm.type as keyof typeof COUNTERTOP_MATERIALS
                        ] || []
                      ).map((material) => (
                        <SelectItem key={material} value={material}>
                          {material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-length">Length (m)</Label>
                    <Input
                      id="edit-length"
                      type="number"
                      min="0"
                      step="0.1"
                      value={editForm.length}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          length: parseFloat(e.target.value) || 0,
                        })
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
                        setEditForm({
                          ...editForm,
                          width: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Corner Strips */}
                <div className="border p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-bold">Corner Strips</Label>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      className="w-4 h-4"
                    />
                  </div>
                  {(
                    true
                  ) && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Corner strips: ~
                      {calculateCornerStripLength(
                        editForm.length,
                        editForm.width
                      ).toFixed(2)}{" "}
                      meters
                    </div>
                  )}
                </div>

                {/* Unit Price */}
                <div>
                  <Label htmlFor="edit-price">Unit Price (Ksh/m²)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="100"
                    value={editForm.unitPrice}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        unitPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                {/* Preview */}
                {editForm.length > 0 && editForm.width > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded border border-amber-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-bold">Area:</span>{" "}
                        {(editForm.length * editForm.width).toFixed(2)} m²
                      </div>
                      <div>
                        <span className="font-bold">Cost:</span>{" "}
                        {formatCurrency(
                          editForm.length *
                            editForm.width *
                            editForm.unitPrice
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
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
                  <Button onClick={handleSaveEdit}>Save Countertop</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* List Table */}
          {countertops.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[25%] text-left">Material</TableHead>
                    <TableHead className="w-[18%] text-left">Dimensions</TableHead>
                    <TableHead className="w-[12%] text-right">Area (m²)</TableHead>
                    <TableHead className="w-[18%] text-center">Corner Strips</TableHead>
                    <TableHead className="w-[15%] text-right">Unit Price</TableHead>
                    <TableHead className="w-[12%] text-right">Total Cost</TableHead>
                    {!readonly && <TableHead className="w-[12%] text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countertops.map((countertop) => (
                    <TableRow key={countertop.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium w-[25%]">
                        <div>
                          <div className="font-bold text-sm">
                            {countertop.material}
                          </div>
                          <div className="text-xs text-gray-500">
                            ({countertop.type})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-[18%] text-sm">
                        {countertop.length.toFixed(2)}m ×{" "}
                        {countertop.width.toFixed(2)}m
                      </TableCell>
                      <TableCell className="text-right font-bold w-[12%] text-sm">
                        {countertop.area.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center w-[18%]">
                        {countertop.cornerStrips ? (
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                            {countertop.cornerStripLength.toFixed(2)}m
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right w-[15%] text-sm">
                        {formatCurrency(countertop.unitPrice)}/m²
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600 w-[12%] text-sm">
                        {formatCurrency(countertop.totalCost)}
                      </TableCell>
                      {!readonly && (
                        <TableCell className="text-right w-[12%]">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditCountertop(countertop)}
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

          {/* Summary */}
          {countertops.length > 0 && (
            <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted">
              <div>
                <div className="text-xs font-bold">Total Area</div>
                <div className="text-lg font-bold">{totalArea.toFixed(2)} m²</div>
              </div>
              <div>
                <div className="text-xs font-bold">Total Corner Strips</div>
                <div className="text-lg font-bold">
                  {totalCornerStripLength.toFixed(2)} m
                </div>
              </div>
              <div>
                <div className="text-xs font-bold">Total Cost</div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(totalCost)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
