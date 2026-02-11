// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Trash,
  CheckCircle2,
  Circle,
  CircleCheck,
  ChevronDown,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PaintingSpecification,
  PAINT_SUBTYPES_BY_CATEGORY,
  PaintCategory,
  PAINT_TYPE_BY_SURFACE_MATERIAL,
  SURFACE_PREP_OPTIONS,
  SurfaceMaterial,
  SurfacePrep,
} from "@/types/painting";
import { createDefaultPaintingFromInternalWalls } from "@/hooks/usePaintingCalculator";

interface PaintingLayerConfigProps {
  painting: PaintingSpecification;
  onUpdate: (updates: Partial<PaintingSpecification>) => void;
  onDelete?: () => void;
  wallDimensions?: any;
}

const PaintingLayerConfig: React.FC<PaintingLayerConfigProps> = ({
  painting,
  onUpdate,
  onDelete,
  wallDimensions,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    preparations: false,
    finishing: false,
  });

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Check step completion
  const isLocationComplete = !!(painting.location && painting.surfaceArea > 0);
  const isFinishingComplete = !!(
    painting.finishingPaint.category && painting.finishingPaint.subtype
  );

  return (
    <Card>
      {/* Header with Title and Delete Button */}
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {painting.location || "New Painting Surface"}
          </h3>
          {painting.surfaceArea > 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {painting.surfaceArea.toFixed(2)} m²
              {painting.calculations?.finishing && (
                <span className="ml-3 font-semibold">
                  Ksh
                  {(
                    painting.calculations.finishing.totalCostWithWastage || 0
                  ).toFixed(2)}
                </span>
              )}
            </p>
          )}
        </div>
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-8 w-8 p-0"
          >
            <Trash className="w-4 h-4" />
          </Button>
        )}
      </div>

      <CardContent className="space-y-4 pt-6">
        {/* Section 1: Location & Area */}
        <div>
          <div
            onClick={() => toggleSection("location")}
            className="cursor-pointer rounded-lg transition-colors mb-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                {isLocationComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
                Location & Area
              </h4>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  expandedSections.location ? "" : "-rotate-90"
                }`}
              />
            </div>
          </div>

          {expandedSections.location && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-3">
              <div>
                <Label
                  htmlFor={`location-${painting.id}`}
                  className="text-xs font-semibold"
                >
                  Location Name
                </Label>
                <Input
                  id={`location-${painting.id}`}
                  type="text"
                  value={painting.location}
                  onChange={(e) => onUpdate({ location: e.target.value })}
                  placeholder="Enter location"
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor={`area-${painting.id}`}
                  className="text-xs font-semibold"
                >
                  Surface Area (m²)
                </Label>
                <Input
                  id={`area-${painting.id}`}
                  type="number"
                  value={painting.surfaceArea}
                  onChange={(e) =>
                    onUpdate({ surfaceArea: parseFloat(e.target.value) || 0 })
                  }
                  step={0.1}
                  placeholder="Enter area"
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Section 2: Preparations */}
        <div>
          <div
            onClick={() => toggleSection("preparations")}
            className="cursor-pointer rounded-lg transition-colors mb-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-green-600" />
                Preparations
              </h4>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  expandedSections.preparations ? "" : "-rotate-90"
                }`}
              />
            </div>
          </div>

          {expandedSections.preparations && (
            <div className="space-y-6 pl-3">
              {/* Skimming */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`skimming-${painting.id}`}
                  checked={painting.skimming.enabled}
                  onCheckedChange={(checked) =>
                    onUpdate({
                      skimming: {
                        ...painting.skimming,
                        enabled: checked === true,
                      },
                    })
                  }
                />
                <label
                  htmlFor={`skimming-${painting.id}`}
                  className="text-sm font-semibold cursor-pointer"
                >
                  Skimming / Filler
                </label>
              </div>

              {painting.skimming.enabled && (
                <div className="ml-6 p-3 rounded border space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor={`skim-coats-${painting.id}`}
                        className="text-xs font-semibold"
                      >
                        Coats
                      </Label>
                      <Select
                        value={painting.skimming.coats.toString()}
                        onValueChange={(value) =>
                          onUpdate({
                            skimming: {
                              ...painting.skimming,
                              coats: parseInt(value),
                            },
                          })
                        }
                      >
                        <SelectTrigger
                          id={`skim-coats-${painting.id}`}
                          className="mt-2"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} Coat{num > 1 ? "s" : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor={`skim-coverage-${painting.id}`}
                        className="text-xs font-semibold"
                      >
                        Coverage (m²/bag)
                      </Label>
                      <Input
                        id={`skim-coverage-${painting.id}`}
                        type="number"
                        value={painting.skimming.coverage}
                        onChange={(e) =>
                          onUpdate({
                            skimming: {
                              ...painting.skimming,
                              coverage: parseFloat(e.target.value) || 10,
                            },
                          })
                        }
                        step={0.1}
                        placeholder="10"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Undercoat */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`undercoat-${painting.id}`}
                  checked={painting.undercoat.enabled}
                  onCheckedChange={(checked) =>
                    onUpdate({
                      undercoat: {
                        ...painting.undercoat,
                        enabled: checked === true,
                      },
                    })
                  }
                />
                <label
                  htmlFor={`undercoat-${painting.id}`}
                  className="text-sm font-semibold cursor-pointer"
                >
                  Undercoat / Primer
                </label>
              </div>

              {painting.undercoat.enabled && (
                <div className="ml-6 p-3 rounded border">
                  <Label
                    htmlFor={`undercoat-coverage-${painting.id}`}
                    className="text-xs font-semibold"
                  >
                    Coverage (m²/L)
                  </Label>
                  <Input
                    id={`undercoat-coverage-${painting.id}`}
                    type="number"
                    value={painting.undercoat.coverage}
                    onChange={(e) =>
                      onUpdate({
                        undercoat: {
                          ...painting.undercoat,
                          coverage: parseFloat(e.target.value) || 10,
                        },
                      })
                    }
                    step={0.1}
                    placeholder="10"
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Section 3: Finishing Paint */}
        <div>
          <div
            onClick={() => toggleSection("finishing")}
            className="cursor-pointer rounded-lg transition-colors mb-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                {isFinishingComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
                Finishing Paint
              </h4>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${
                  expandedSections.finishing ? "" : "-rotate-90"
                }`}
              />
            </div>
          </div>

          {expandedSections.finishing && (
            <div className="space-y-4 pl-3">
              {/* STEP 7: Surface Material & Prep */}
              <div className="">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor={`surface-material-${painting.id}`}
                      className="text-xs font-semibold"
                    >
                      Surface Material
                    </Label>
                    <Select
                      value={painting.surfaceMaterial || "walls"}
                      onValueChange={(value) => {
                        const newMaterial = value as SurfaceMaterial;
                        const recommendation =
                          PAINT_TYPE_BY_SURFACE_MATERIAL[newMaterial];
                        onUpdate({
                          surfaceMaterial: newMaterial,
                          surfacePrep: painting.surfacePrep || "light-skimming",
                          finishingPaint: {
                            ...painting.finishingPaint,
                            category: recommendation.category,
                            subtype: recommendation.subtype,
                          },
                        });
                      }}
                    >
                      <SelectTrigger
                        id={`surface-material-${painting.id}`}
                        className="mt-2"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walls">Walls</SelectItem>
                        <SelectItem value="wood">Wood</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="ceiling">Ceiling</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor={`surface-prep-${painting.id}`}
                      className="text-xs font-semibold"
                    >
                      Surface Preparation
                    </Label>
                    <Select
                      value={painting.surfacePrep || "light-skimming"}
                      onValueChange={(value) => {
                        onUpdate({
                          surfacePrep: value as SurfacePrep,
                        });
                      }}
                    >
                      <SelectTrigger
                        id={`surface-prep-${painting.id}`}
                        className="mt-2"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rough-tough">
                          Rough & Tough Prep
                        </SelectItem>
                        <SelectItem value="light-skimming">
                          Light Skimming
                        </SelectItem>
                        <SelectItem value="none">No Preparation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {painting.surfacePrep && SURFACE_PREP_OPTIONS[painting.surfacePrep] && (
                  <div className="mt-3 p-2 bg-white dark:bg-slate-900 rounded border border-blue-100 dark:border-blue-900">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {SURFACE_PREP_OPTIONS[painting.surfacePrep].label}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {SURFACE_PREP_OPTIONS[painting.surfacePrep].description}
                    </p>
                    {SURFACE_PREP_OPTIONS[painting.surfacePrep]
                      .estimatedHours && (
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
                        Est. Hours: ~
                        {SURFACE_PREP_OPTIONS[painting.surfacePrep]
                          .estimatedHours}{" "}
                        hrs
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor={`category-${painting.id}`}
                    className="text-xs font-semibold"
                  >
                    Paint Type
                  </Label>
                  <Select
                    value={painting.finishingPaint.category}
                    onValueChange={(value) => {
                      const newCategory = value as PaintCategory;
                      const newSubtype =
                        PAINT_SUBTYPES_BY_CATEGORY[newCategory][0].value;
                      onUpdate({
                        finishingPaint: {
                          ...painting.finishingPaint,
                          category: newCategory,
                          subtype: newSubtype,
                        },
                      });
                    }}
                  >
                    <SelectTrigger
                      id={`category-${painting.id}`}
                      className="mt-2"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emulsion">
                        Emulsion (Water-Based)
                      </SelectItem>
                      <SelectItem value="enamel">Enamel (Oil-Based)</SelectItem>
                      <SelectItem value="wood-finish">Wood Paint</SelectItem>
                      <SelectItem value="metal-finish">Metal Paint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor={`subtype-${painting.id}`}
                    className="text-xs font-semibold"
                  >
                    Finish Level
                  </Label>
                  <Select
                    value={painting.finishingPaint.subtype}
                    onValueChange={(value) =>
                      onUpdate({
                        finishingPaint: {
                          ...painting.finishingPaint,
                          subtype: value as any,
                        },
                      })
                    }
                  >
                    <SelectTrigger
                      id={`subtype-${painting.id}`}
                      className="mt-2"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAINT_SUBTYPES_BY_CATEGORY[
                        painting.finishingPaint.category
                      ].map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                  <div>
                    <Label
                      htmlFor={`finish-level-subtype-${painting.id}`}
                      className="text-xs font-semibold"
                    >
                      Finish Type
                    </Label>
                    <Select
                      value={painting.finishingPaint.finishType}
                      onValueChange={(value) =>
                        onUpdate({
                          finishingPaint: {
                            ...painting.finishingPaint,
                            finishType: value as any,
                          },
                        })
                      }
                    >
                      <SelectTrigger
                        id={`finish-level-subtype-${painting.id}`}
                        className="mt-2"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eggshell">Eggshell Paint</SelectItem>
                        <SelectItem value="gloss">Gloss</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor={`coats-${painting.id}`}
                    className="text-xs font-semibold"
                  >
                    Number of Coats
                  </Label>
                  <Select
                    value={painting.finishingPaint.coats.toString()}
                    onValueChange={(value) =>
                      onUpdate({
                        finishingPaint: {
                          ...painting.finishingPaint,
                          coats: parseInt(value),
                        },
                      })
                    }
                  >
                    <SelectTrigger id={`coats-${painting.id}`} className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Coat{num > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor={`coverage-${painting.id}`}
                    className="text-xs font-semibold"
                  >
                    Coverage (m²/L)
                  </Label>
                  <Input
                    id={`coverage-${painting.id}`}
                    type="number"
                    value={painting.finishingPaint.coverage}
                    onChange={(e) =>
                      onUpdate({
                        finishingPaint: {
                          ...painting.finishingPaint,
                          coverage: parseFloat(e.target.value) || 10,
                        },
                      })
                    }
                    step={0.1}
                    placeholder="10"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        {painting.calculations && <div className="border-t" />}

        {/* Summary Section */}
        {painting.calculations && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Calculations Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {painting.calculations.skimming && (
                <div className="p-3 rounded-3xl border bg-slate-50 dark:bg-slate-900/30">
                  <div className="text-xs font-semibold">Skimming</div>
                  <div className="font-bold text-lg">
                    {painting.calculations.skimming.quantity.toFixed(2)} bags
                  </div>
                  <div className="text-xs mt-1 font-semibold">
                    Ksh
                    {painting.calculations.skimming.totalCostWithWastage.toFixed(
                      2,
                    )}
                  </div>
                </div>
              )}

              {painting.calculations.undercoat && (
                <div className="p-3 rounded-3xl border bg-slate-50 dark:bg-slate-900/30">
                  <div className="text-xs font-semibold">Undercoat</div>
                  <div className="font-bold text-lg">
                    {painting.calculations.undercoat.quantity.toFixed(2)} L
                  </div>
                  <div className="text-xs mt-1 font-semibold">
                    Ksh
                    {painting.calculations.undercoat.totalCostWithWastage.toFixed(
                      2,
                    )}
                  </div>
                </div>
              )}

              {painting.calculations.finishing && (
                <div className="p-3 rounded-3xl border bg-slate-50 dark:bg-slate-900/30">
                  <div className="text-xs font-semibold">Finishing Paint</div>
                  <div className="font-bold text-lg">
                    {painting.calculations.finishing.quantity.toFixed(2)} L
                  </div>
                  <div className="text-xs mt-1 font-semibold">
                    Ksh
                    {painting.calculations.finishing.totalCostWithWastage.toFixed(
                      2,
                    )}
                  </div>
                </div>
              )}

              {(painting.calculations.skimming ||
                painting.calculations.undercoat ||
                painting.calculations.finishing) && (
                <div className="p-3 rounded-3xl border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                  <div className="text-xs font-semibold">Total Layer Cost</div>
                  <div className="font-bold text-lg text-blue-700 dark:text-blue-300">
                    Ksh
                    {(
                      (painting.calculations.skimming?.totalCostWithWastage ||
                        0) +
                      (painting.calculations.undercoat?.totalCostWithWastage ||
                        0) +
                      (painting.calculations.finishing?.totalCostWithWastage ||
                        0)
                    ).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaintingLayerConfig;
