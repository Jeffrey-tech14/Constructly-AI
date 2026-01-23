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
  const [showDefaultPrompt, setShowDefaultPrompt] = useState(false);
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

  // Show prompt for new paintings with valid wall dimensions
  useEffect(() => {
    if (
      !painting.location &&
      wallDimensions?.internalWallPerimiter &&
      wallDimensions?.internalWallHeight
    ) {
      const internalPerimeter =
        parseFloat(wallDimensions.internalWallPerimiter) || 0;
      const internalHeight = parseFloat(wallDimensions.internalWallHeight) || 0;

      if (internalPerimeter > 0 && internalHeight > 0) {
        setShowDefaultPrompt(true);
      }
    }
  }, [painting.location, wallDimensions]);

  // Handle default painting creation from walls
  const handleCreateDefault = () => {
    const defaultPainting =
      createDefaultPaintingFromInternalWalls(wallDimensions);
    if (defaultPainting) {
      onUpdate({
        surfaceArea: defaultPainting.surfaceArea,
        location: defaultPainting.location,
      });
    }
    setShowDefaultPrompt(false);
  };

  const internalPerimeter =
    parseFloat(wallDimensions?.internalWallPerimiter) || 0;
  const internalHeight = parseFloat(wallDimensions?.internalWallHeight) || 0;
  const internalArea = internalPerimeter * internalHeight * 2;

  // Check step completion
  const isLocationComplete = !!(painting.location && painting.surfaceArea > 0);
  const isFinishingComplete = !!(
    painting.finishingPaint.category && painting.finishingPaint.subtype
  );

  return (
    <div className="space-y-4">
      {/* Default Creation Prompt */}
      {showDefaultPrompt && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">
              Create default painting from internal walls?
            </div>
            <div className="text-sm mb-4">
              Internal wall surface area:{" "}
              <strong>
                {(
                  (parseFloat(wallDimensions?.internalWallPerimiter) || 0) *
                  (parseFloat(wallDimensions?.internalWallHeight) || 0) *
                  2
                ).toFixed(2)}{" "}
                m²
              </strong>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateDefault}>
                Yes, Create Default
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDefaultPrompt(false)}
              >
                Skip for Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Card 1: Location & Area - Collapsible */}
      <Card>
        <div
          onClick={() => toggleSection("location")}
          className="p-6 cursor-pointer hover:bg-white/10 rounded-3xl transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              {isLocationComplete ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
              Location & Area
            </h3>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                expandedSections.location ? "" : "-rotate-90"
              }`}
            />
          </div>
        </div>

        {expandedSections.location && (
          <CardContent className="pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </CardContent>
        )}
      </Card>

      {/* Card 3: Optional Layers - Collapsible */}
      <Card>
        <div
          onClick={() => toggleSection("preparations")}
          className="p-6 cursor-pointer hover:bg-white/10 rounded-3xl  transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <CircleCheck className="w-5 h-5" />
              Preparations
            </h3>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                expandedSections.preparations ? "" : "-rotate-90"
              }`}
            />
          </div>
        </div>

        {expandedSections.preparations && (
          <CardContent className="pb-6">
            <div className="space-y-6">
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
                <div className="ml-6 mt-4 p-3 rounded border space-y-3">
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
                <div className="ml-6 mt-4 p-3 rounded border">
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
          </CardContent>
        )}
      </Card>

      {/* Card 2: Finishing Paint - Collapsible */}
      <Card>
        <div
          onClick={() => toggleSection("finishing")}
          className="p-6 cursor-pointer hover:bg-white/10 rounded-3xl transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              {isFinishingComplete ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
              Finishing Paint
            </h3>
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                expandedSections.finishing ? "" : "-rotate-90"
              }`}
            />
          </div>
        </div>

        {expandedSections.finishing && (
          <CardContent className="pb-6">
            <div className="space-y-4">
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
          </CardContent>
        )}
      </Card>

      {/* Summary Section */}
      {painting.calculations && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {painting.calculations.skimming && (
                <div className="p-3 rounded border">
                  <div className="text-xs font-semibold">Skimming</div>
                  <div className="font-bold text-lg">
                    {painting.calculations.skimming.quantity.toFixed(2)} bags
                  </div>
                  <div className="text-xs mt-1">
                    Ksh
                    {painting.calculations.skimming.totalCostWithWastage.toFixed(
                      2,
                    )}
                  </div>
                </div>
              )}

              {painting.calculations.undercoat && (
                <div className="p-3 rounded border">
                  <div className="text-xs font-semibold">Undercoat</div>
                  <div className="font-bold text-lg">
                    {painting.calculations.undercoat.quantity.toFixed(2)} L
                  </div>
                  <div className="text-xs mt-1">
                    Ksh
                    {painting.calculations.undercoat.totalCostWithWastage.toFixed(
                      2,
                    )}
                  </div>
                </div>
              )}

              {painting.calculations.finishing && (
                <div className="p-3 rounded border">
                  <div className="text-xs font-semibold">Finishing Paint</div>
                  <div className="font-bold text-lg">
                    {painting.calculations.finishing.quantity.toFixed(2)} L
                  </div>
                  <div className="text-xs mt-1">
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
                <div className="p-3 rounded border ">
                  <div className="text-xs font-semibold">Total Layer Cost</div>
                  <div className="font-bold text-lg">
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
          </CardContent>
        </Card>
      )}

      {/* Header Card with Title and Delete */}
      {onDelete && (
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">
                {painting.location || "New Painting Surface"}
              </h3>
              {painting.surfaceArea > 0 && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {painting.surfaceArea.toFixed(2)} m²
                  {painting.calculations?.finishing && (
                    <span className="ml-3">
                      Ksh
                      {(
                        painting.calculations.finishing.totalCostWithWastage ||
                        0
                      ).toFixed(2)}
                    </span>
                  )}
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 p-0"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PaintingLayerConfig;
