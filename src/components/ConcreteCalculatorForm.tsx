// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  calculateConcrete,
  ConcreteRow,
  useConcreteCalculator,
  ElementType,
  FoundationStep,
  WaterproofingDetails,
  SepticTankDetails,
  UndergroundTankDetails,
  SoakPitDetails,
  SoakawayDetails,
} from "@/hooks/useConcreteCalculator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Trash, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RegionalMultiplier } from "@/hooks/useDynamicPricing";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import useMasonryCalculatorNew, {
  MasonryQSSettings,
} from "@/hooks/useMasonryCalculatorNew";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Material } from "@/hooks/useQuoteCalculations";

interface Props {
  quote: any;
  setQuote: (updater: (prev: any) => any) => void | ((next: any) => void);
  materialBasePrices;
  userMaterialPrices;
  getEffectiveMaterialPrice;
}

export default function ConcreteCalculatorForm({
  quote,
  setQuote,
  materialBasePrices,
  userMaterialPrices,
  getEffectiveMaterialPrice,
}: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const { user, profile } = useAuth();
  const [regionalMultipliers, setRegionalMultipliers] = useState<
    RegionalMultiplier[]
  >([]);
  const userRegion = profile?.location;

  const qsSettings = quote.qsSettings as MasonryQSSettings;

  const onSettingsChange = useCallback(
    (newSettings: MasonryQSSettings) => {
      setQuote((prev) => ({
        ...prev,
        qsSettings: newSettings,
      }));
    },
    [setQuote],
  );

  useEffect(() => {
    const loadMultipliers = async () => {
      const { data } = await supabase.from("regional_multipliers").select("*");
      if (data) setRegionalMultipliers(data);
    };
    loadMultipliers();
  }, []);

  const makeFoundationRow = useCallback((): ConcreteRow => {
    const id = Math.random().toString(36).substr(2, 9);
    return {
      id,
      name: `Element ${id}`,
      element: "raft-foundation",
      length: quote.foundationDetails?.[0].length || "",
      width: quote.foundationDetails?.[0].width || "",
      height: quote.foundationDetails?.[0].height || "",
      mix: "",
      category: "substructure",
      number: "1",
      foundationType: quote.foundationDetails?.[0].foundationType,
      isSteppedFoundation: false,
      foundationSteps: [],
      waterproofing: {
        includesDPC: false,
        includesPolythene: false,
        includesWaterproofing: false,
      },
    };
  }, [quote.foundationDetails]);

  const makeDefaultRow = useCallback((): ConcreteRow => {
    const id = Math.random().toString(36).substr(2, 9);
    return {
      id,
      name: `Element ${id}`,
      element: "slab",
      length: "",
      width: "",
      height: "",
      mix: "",
      category: "superstructure",
      number: "1",
      foundationType: "",
      isSteppedFoundation: false,
      foundationSteps: [],
      waterproofing: {
        includesDPC: false,
        includesPolythene: false,
        includesWaterproofing: false,
      },
      slabArea: "",
      verandahArea: "",
    };
  }, []);

  const [rows, setRows] = useState<ConcreteRow[]>([]);

  // Load existing concrete rows from quote on mount or when quote changes
  useEffect(() => {
    if (
      quote?.concrete_rows &&
      Array.isArray(quote.concrete_rows) &&
      quote.concrete_rows.length > 0
    ) {
      setRows(quote.concrete_rows);
    }
  }, [quote?.concrete_rows]);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DEBOUNCE_MS = 500;

  const pushRowsDebounced = useCallback(
    (nextRows: ConcreteRow[]) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setQuote((prev: any) => {
          const prevStr = JSON.stringify(prev?.concrete_rows ?? []);
          const nextStr = JSON.stringify(nextRows);
          if (prevStr === nextStr) return prev;
          return { ...prev, concrete_rows: nextRows };
        });
      }, DEBOUNCE_MS);
    },
    [setQuote],
  );

  /**
   * Auto-fill aggregate bed and masonry wall height when foundation depth changes
   */
  useEffect(() => {
    setRows((prevRows) => {
      let updated = false;
      const newRows = prevRows.map((row) => {
        let rowUpdated = false;
        let updatedRow = { ...row };

        const foundationHeight = parseFloat(row.height || "0");

        // Auto-fill aggregate bed depth from foundation height
        if (row.hasAggregateBed && !row.aggregateDepth) {
          updatedRow.aggregateDepth = foundationHeight.toString();
          rowUpdated = true;
        }

        if (rowUpdated) {
          updated = true;
        }

        return updatedRow;
      });

      if (updated) {
        pushRowsDebounced(newRows);
      }

      return newRows;
    });
  }, [rows]);

  /**
   * Sync aggregate bed and masonry wall heights with foundation height when it changes
   */
  const syncHeightFields = useCallback(
    (rowId: string, newHeight: string) => {
      setRows((prev) => {
        const next = prev.map((r) => {
          if (r.id === rowId) {
            const updated = { ...r, height: newHeight };

            // If aggregate bed is enabled, sync its height
            if (r.hasAggregateBed) {
              updated.aggregateDepth = newHeight;
            }

            return updated;
          }
          return r;
        });
        pushRowsDebounced(next);
        return next;
      });
    },
    [pushRowsDebounced],
  );

  const updateRow = useCallback(
    <K extends keyof ConcreteRow>(
      id: string,
      key: K,
      value: ConcreteRow[K],
    ) => {
      setRows((prev) => {
        const next = prev.map((r) =>
          r.id === id ? { ...r, [key]: value } : r,
        );
        pushRowsDebounced(next);
        return next;
      });
    },
    [pushRowsDebounced],
  );

  const addRow = useCallback(() => {
    const newRow = makeDefaultRow();
    setRows((prev) => {
      const next = [...prev, newRow];
      setQuote((qPrev: any) => ({ ...qPrev, concrete_rows: next }));
      return next;
    });
  }, [makeDefaultRow, setQuote]);

  const addFoundationRow = useCallback(() => {
    const newRow = makeFoundationRow();
    setRows((prev) => {
      const next = [...prev, newRow];
      setQuote((qPrev: any) => ({ ...qPrev, concrete_rows: next }));
      return next;
    });
  }, [makeFoundationRow, setQuote]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasFoundationRow = quote.concrete_rows?.some(
        (row: ConcreteRow) => row.element === "raft-foundation",
      );
      const hasFoundationDetails = quote.foundationDetails?.[0].totalPerimeter;

      if (hasFoundationDetails && !hasFoundationRow) {
        addFoundationRow();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [quote.concrete_rows, quote.foundationDetails, addFoundationRow]);

  const removeRow = useCallback(
    (id: string) => {
      setRows((prev) => {
        const next = prev.filter((r) => r.id !== id);
        setQuote((qPrev: any) => ({ ...qPrev, concrete_rows: next }));
        return next;
      });
    },
    [setQuote],
  );

  const fetchMaterials = useCallback(async () => {
    if (!profile?.id) return;

    const { data: baseMaterials } = await supabase
      .from("material_base_prices")
      .select("*");

    const { data: overrides } = await supabase
      .from("user_material_prices")
      .select("material_id, region, price")
      .eq("user_id", profile.id);

    const userRegion = profile?.location || "Nairobi";
    const multiplier =
      regionalMultipliers.find((r) => r.region === userRegion)?.multiplier || 1;

    const merged =
      baseMaterials?.map((material) => {
        const userRate = overrides?.find(
          (o) => o.material_id === material.id && o.region === userRegion,
        );
        const materialP = (material.price || 0) * multiplier;
        const price = userRate ? userRate.price : (materialP ?? 0);
        return {
          ...material,
          price,
          region: userRegion,
          source: userRate ? "user" : material.price != null ? "base" : "none",
        };
      }) || [];

    setMaterials(merged);
  }, [profile, regionalMultipliers]);

  useEffect(() => {
    if (user && profile !== null) {
      fetchMaterials();
    }
  }, [user, profile, fetchMaterials]);

  /**
   * Auto-update strip footing widths based on block type
   * Width = 3x the block thickness extracted from the blockType mapping
   */
  useEffect(() => {
    setRows((prevRows) => {
      let updated = false;
      const blockDimensionsMap: { [key: string]: string } = {
        "Large Block": "0.2x0.2x0.2",
        "Standard Block": "0.15x0.2x0.15",
        "Small Block": "0.1x0.2x0.1",
      };

      const newRows = prevRows.map((row) => {
        if (row.element === "strip-footing") {
          // Determine wall type from row name (should contain "internal" or "external")
          const nameLower = row.name.toLowerCase();
          const isInternal = nameLower.includes("internal");
          const isExternal = nameLower.includes("external");
          const wallType = isInternal
            ? "internal"
            : isExternal
              ? "external"
              : row.wallType;

          if (wallType && quote?.wallSections) {
            // Find the wall section matching this type
            const wallSection = quote.wallSections.find(
              (w: any) => w.type === wallType,
            );
            if (wallSection) {
              // Get block dimensions from blockType mapping
              const blockType = wallSection.blockType || "Standard Block";
              const blockDimensions =
                blockDimensionsMap[blockType] || "0.15x0.2x0.15";

              // Extract thickness (third value) from blockDimensions
              const dims = blockDimensions
                .split("x")
                .map((d: string) => parseFloat(d.trim()));
              if (dims.length >= 3 && dims[2] > 0) {
                const calculatedWidth = (dims[2] * 3).toString();
                if (row.width !== calculatedWidth) {
                  updated = true;
                  return {
                    ...row,
                    width: calculatedWidth,
                    wallType,
                  };
                }
              }
            }
          }
        }
        return row;
      });

      if (updated) {
        pushRowsDebounced(newRows);
      }

      return newRows;
    });
  }, [quote?.wallSections, pushRowsDebounced]);

  /**
   * Auto-calculate hardcore backfill depth for strip footings
   * Formula: Finished Floor Level - slab thickness - maram blinding - concrete blinding - (excavation depth - footing thickness)
   */
  useEffect(() => {
    setRows((prevRows) => {
      let updated = false;
      const blockDimensionsMap: { [key: string]: string } = {
        "Large Block": "0.2x0.2x0.2",
        "Standard Block": "0.15x0.2x0.15",
        "Small Block": "0.1x0.2x0.1",
      };

      const newRows = prevRows.map((row) => {
        // Only apply to strip footings that have hasBackFill enabled
        if (row.element === "strip-footing" && row.hasBackFill) {
          const slabThickness = parseFloat(row.height || "0") || 0; // Using height as slab thickness
          const maramBlindingDepth = row.hasMaramBlinding
            ? parseFloat(row.maramBlindingDepth || "0") || 0
            : 0;
          const concreteBlindingDepth = row.hasBlinding
            ? parseFloat(row.blindingDepth || "0") || 0
            : 0;

          // Get excavation depth and footing thickness
          const excavationDepth =
            parseFloat(quote?.foundationDetails?.[0]?.height || "0.65") || 0.65;

          // Get footing thickness from block type mapping
          const nameLower = row.name.toLowerCase();
          const isInternal = nameLower.includes("internal");
          const isExternal = nameLower.includes("external");
          const wallType = isInternal
            ? "internal"
            : isExternal
              ? "external"
              : row.wallType;

          let footingThickness = 0;
          if (wallType && quote?.wallSections) {
            const wallSection = quote.wallSections.find(
              (w: any) => w.type === wallType,
            );
            if (wallSection) {
              const blockType = wallSection.blockType || "Standard Block";
              const blockDimensions =
                blockDimensionsMap[blockType] || "0.15x0.2x0.15";
              const dims = blockDimensions
                .split("x")
                .map((d: string) => parseFloat(d.trim()));
              footingThickness = dims.length >= 3 ? dims[2] : 0.15;
            }
          }

          // Calculate hardcore depth
          const topOfFootingLevel = excavationDepth - footingThickness;
          const hardcoreDepth =
            topOfFootingLevel -
            slabThickness -
            maramBlindingDepth -
            concreteBlindingDepth;
          const calculatedDepth = Math.max(0, hardcoreDepth).toString();

          if (row.backFillDepth !== calculatedDepth) {
            updated = true;
            return {
              ...row,
              backFillDepth: calculatedDepth,
            };
          }
        }
        return row;
      });

      if (updated) {
        pushRowsDebounced(newRows);
      }

      return newRows;
    });
  }, [quote, rows, pushRowsDebounced]);

  const { results, totals, calculateConcreteRateForRow } =
    useConcreteCalculator(rows, materials, qsSettings, quote);

  const cementMat = materials.find((m) => m.name?.toLowerCase() === "cement");
  const sandMat = materials.find((m) => m.name?.toLowerCase() === "sand");
  const ballastMat = materials.find((m) => m.name?.toLowerCase() === "ballast");
  const aggregateMat = materials.find(
    (m) => m.name?.toLowerCase() === "aggregate",
  );
  const formworkMat = materials.find(
    (m) => m.name?.toLowerCase() === "formwork",
  );
  const waterMat = materials.find((m) => m.name?.toLowerCase() === "water");
  const dpcMat = materials.find(
    (m) =>
      m.name?.toLowerCase().includes("dpc") ||
      m.name?.toLowerCase().includes("damp"),
  );
  const polytheneMat = materials.find(
    (m) =>
      m.name?.toLowerCase().includes("polythene") ||
      m.name?.toLowerCase().includes("dpm"),
  );
  const waterproofingMat = materials.find(
    (m) =>
      m.name?.toLowerCase().includes("waterproof") ||
      m.name?.toLowerCase().includes("bituminous"),
  );
  const gravelMat = materials.find((m) =>
    m.name?.toLowerCase().includes("gravel"),
  );
  const maramMat = materials.find(
    (m) =>
      m.name?.toLowerCase().includes("maram") ||
      m.name?.toLowerCase().includes("binding"),
  );
  const compactionMat = materials.find((m) =>
    m.name?.toLowerCase().includes("compaction"),
  );
  const backfillMat = materials.find((m) =>
    m.name?.toLowerCase().includes("backfill"),
  );

  const addFoundationStep = useCallback(
    (rowId: string) => {
      const newStep: FoundationStep = {
        id: Math.random().toString(36).substr(2, 9),
        length: "",
        width: "",
        depth: "",
        offset: "",
      };
      setRows((prev) => {
        const next = prev.map((row) => {
          if (row.id === rowId) {
            const currentSteps = row.foundationSteps || [];
            return {
              ...row,
              foundationSteps: [...currentSteps, newStep],
            };
          }
          return row;
        });
        pushRowsDebounced(next);
        return next;
      });
    },
    [pushRowsDebounced],
  );

  const updateFoundationStep = useCallback(
    (
      rowId: string,
      stepId: string,
      field: keyof FoundationStep,
      value: string,
    ) => {
      setRows((prev) => {
        const next = prev.map((row) => {
          if (row.id === rowId) {
            const updatedSteps = row.foundationSteps?.map((step) =>
              step.id === stepId ? { ...step, [field]: value } : step,
            );
            return { ...row, foundationSteps: updatedSteps };
          }
          return row;
        });
        pushRowsDebounced(next);
        return next;
      });
    },
    [pushRowsDebounced],
  );

  const removeFoundationStep = useCallback(
    (rowId: string, stepId: string) => {
      setRows((prev) => {
        const next = prev.map((row) => {
          if (row.id === rowId) {
            const filteredSteps = row.foundationSteps?.filter(
              (step) => step.id !== stepId,
            );
            return { ...row, foundationSteps: filteredSteps };
          }
          return row;
        });
        pushRowsDebounced(next);
        return next;
      });
    },
    [pushRowsDebounced],
  );

  const handleElementChange = useCallback(
    (id: string, element: ElementType) => {
      updateRow(id, "element", element);

      if (element !== "staircase") {
        updateRow(id, "staircaseDetails", undefined);
      }
      if (
        !["septic-tank", "underground-tank", "water-tank"].includes(element)
      ) {
        updateRow(id, "tankDetails", undefined);
        updateRow(id, "septicTankDetails", undefined);
        updateRow(id, "undergroundTankDetails", undefined);
      }
      if (element !== "raft-foundation" && element !== "strip-footing") {
        updateRow(id, "hasConcreteBed", false);
        updateRow(id, "hasAggregateBed", false);
        updateRow(id, "isSteppedFoundation", false);
        updateRow(id, "foundationSteps", []);
      }
      if (!["soak-pit", "soakaway"].includes(element)) {
        updateRow(id, "soakPitDetails", undefined);
        updateRow(id, "soakawayDetails", undefined);
      }
    },
    [updateRow],
  );

  const initializeSpecializedDetails = useCallback(
    (row: ConcreteRow) => {
      if (row.element === "septic-tank" && !row.septicTankDetails) {
        updateRow(row.id, "septicTankDetails", {
          capacity: "10",
          numberOfChambers: 2,
          wallThickness: "0.2",
          baseThickness: "0.25",
          coverType: "slab",
          includesBaffles: true,
          includesManhole: true,
          manholeSize: "0.6",
          depth: "1.5",
        });
      }
      if (row.element === "underground-tank" && !row.undergroundTankDetails) {
        updateRow(row.id, "undergroundTankDetails", {
          capacity: "5",
          wallThickness: "0.2",
          baseThickness: "0.25",
          coverType: "slab",
          includesManhole: true,
          manholeSize: "0.6",
          waterProofingRequired: true,
        });
      }
      if (row.element === "soak-pit" && !row.soakPitDetails) {
        updateRow(row.id, "soakPitDetails", {
          diameter: "1.2",
          depth: "2.5",
          wallThickness: "0.15",
          baseThickness: "0.2",
          liningType: "brick",
          includesGravel: true,
          gravelDepth: "0.3",
          includesGeotextile: true,
        });
      }
      if (row.element === "soakaway" && !row.soakawayDetails) {
        updateRow(row.id, "soakawayDetails", {
          length: "2.0",
          width: "1.5",
          depth: "2.0",
          wallThickness: "0.15",
          baseThickness: "0.2",
          includesGravel: true,
          gravelDepth: "0.3",
          includesPerforatedPipes: true,
        });
      }
    },
    [updateRow],
  );

  const renderSpecializedFields = (row: ConcreteRow) => {
    switch (row.element) {
      case "staircase":
        return (
          <div className="grid sm:grid-cols-3 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <Input
              type="number"
              value={row.staircaseDetails?.riserHeight || ""}
              onChange={(e) =>
                updateRow(row.id, "staircaseDetails", {
                  ...row.staircaseDetails,
                  riserHeight: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Riser Height (m)"
              step="0.01"
            />
            <Input
              type="number"
              value={row.staircaseDetails?.treadWidth || ""}
              onChange={(e) =>
                updateRow(row.id, "staircaseDetails", {
                  ...row.staircaseDetails,
                  treadWidth: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="Tread Width (m)"
              step="0.01"
            />
            <Input
              type="number"
              value={row.staircaseDetails?.numberOfSteps || ""}
              onChange={(e) =>
                updateRow(row.id, "staircaseDetails", {
                  ...row.staircaseDetails,
                  numberOfSteps: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Number of Steps"
              min="1"
            />
          </div>
        );

      case "septic-tank":
        initializeSpecializedDetails(row);
        return (
          <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-md">
            <h4 className="font-semibold text-orange-800 dark:text-orange-200">
              Septic Tank Details
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Capacity (m³)</Label>
                <Input
                  type="number"
                  value={row.septicTankDetails?.capacity || ""}
                  onChange={(e) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      capacity: e.target.value,
                    })
                  }
                  placeholder="10"
                  step="1"
                  min="5"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Number of Chambers
                </Label>
                <Select
                  value={
                    row.septicTankDetails?.numberOfChambers?.toString() || "2"
                  }
                  onValueChange={(value) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      numberOfChambers: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Chamber</SelectItem>
                    <SelectItem value="2">2 Chambers</SelectItem>
                    <SelectItem value="3">3 Chambers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Wall Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.septicTankDetails?.wallThickness || ""}
                  onChange={(e) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      wallThickness: e.target.value,
                    })
                  }
                  placeholder="0.2"
                  step="0.05"
                  min="0.15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Base Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.septicTankDetails?.baseThickness || ""}
                  onChange={(e) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      baseThickness: e.target.value,
                    })
                  }
                  placeholder="0.25"
                  step="0.05"
                  min="0.2"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.septicTankDetails?.includesBaffles || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      includesBaffles: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Baffles</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.septicTankDetails?.includesManhole || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "septicTankDetails", {
                      ...row.septicTankDetails,
                      includesManhole: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Manhole</Label>
              </div>
            </div>
          </div>
        );

      case "underground-tank":
        initializeSpecializedDetails(row);
        return (
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200">
              Underground Tank Details
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Capacity (m³)</Label>
                <Input
                  type="number"
                  value={row.undergroundTankDetails?.capacity || ""}
                  onChange={(e) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      capacity: e.target.value,
                    })
                  }
                  placeholder="5"
                  step="1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Wall Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.undergroundTankDetails?.wallThickness || ""}
                  onChange={(e) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      wallThickness: e.target.value,
                    })
                  }
                  placeholder="0.2"
                  step="0.05"
                  min="0.15"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Base Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.undergroundTankDetails?.baseThickness || ""}
                  onChange={(e) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      baseThickness: e.target.value,
                    })
                  }
                  placeholder="0.25"
                  step="0.05"
                  min="0.2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cover Type</Label>
                <Select
                  value={row.undergroundTankDetails?.coverType || "slab"}
                  onValueChange={(value) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      coverType: value as "slab" | "precast" | "none",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slab">Concrete Slab</SelectItem>
                    <SelectItem value="precast">Precast</SelectItem>
                    <SelectItem value="none">No Cover</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.undergroundTankDetails?.includesManhole || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      includesManhole: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Manhole</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={
                    row.undergroundTankDetails?.waterProofingRequired || false
                  }
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "undergroundTankDetails", {
                      ...row.undergroundTankDetails,
                      waterProofingRequired: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Waterproofing Required</Label>
              </div>
            </div>
          </div>
        );

      case "soak-pit":
        initializeSpecializedDetails(row);
        return (
          <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200">
              Soak Pit Details
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Diameter (m)</Label>
                <Input
                  type="number"
                  value={row.soakPitDetails?.diameter || ""}
                  onChange={(e) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      diameter: e.target.value,
                    })
                  }
                  placeholder="1.2"
                  step="0.1"
                  min="0.5"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Depth (m)</Label>
                <Input
                  type="number"
                  value={row.soakPitDetails?.depth || ""}
                  onChange={(e) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      depth: e.target.value,
                    })
                  }
                  placeholder="2.5"
                  step="0.1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Wall Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.soakPitDetails?.wallThickness || "0.15"}
                  onChange={(e) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      wallThickness: e.target.value,
                    })
                  }
                  placeholder="0.15"
                  step="0.05"
                  min="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Base Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.soakPitDetails?.baseThickness || "0.2"}
                  onChange={(e) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      baseThickness: e.target.value,
                    })
                  }
                  placeholder="0.2"
                  step="0.05"
                  min="0.15"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Lining Type</Label>
                <Select
                  value={row.soakPitDetails?.liningType || "brick"}
                  onValueChange={(value) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      liningType: value as "brick" | "concrete" | "precast",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brick">Brick Lining</SelectItem>
                    <SelectItem value="concrete">Concrete Lining</SelectItem>
                    <SelectItem value="precast">Precast Rings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.soakPitDetails?.includesGravel || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      includesGravel: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Gravel Backfill</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.soakPitDetails?.includesGeotextile || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      includesGeotextile: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Geotextile</Label>
              </div>
            </div>
            {row.soakPitDetails?.includesGravel && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gravel Depth (m)</Label>
                <Input
                  type="number"
                  value={row.soakPitDetails?.gravelDepth || "0.3"}
                  onChange={(e) =>
                    updateRow(row.id, "soakPitDetails", {
                      ...row.soakPitDetails,
                      gravelDepth: e.target.value,
                    })
                  }
                  placeholder="0.3"
                  step="0.1"
                  min="0.1"
                />
              </div>
            )}
          </div>
        );

      case "soakaway":
        initializeSpecializedDetails(row);
        return (
          <div className="space-y-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-md">
            <h4 className="font-semibold text-teal-800 dark:text-teal-200">
              Soakaway Details
            </h4>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Length (m)</Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.length || ""}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      length: e.target.value,
                    })
                  }
                  placeholder="2.0"
                  step="0.1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Width (m)</Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.width || ""}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      width: e.target.value,
                    })
                  }
                  placeholder="1.5"
                  step="0.1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Depth (m)</Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.depth || ""}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      depth: e.target.value,
                    })
                  }
                  placeholder="2.0"
                  step="0.1"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Wall Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.wallThickness || "0.15"}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      wallThickness: e.target.value,
                    })
                  }
                  placeholder="0.15"
                  step="0.05"
                  min="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Base Thickness (m)
                </Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.baseThickness || "0.2"}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      baseThickness: e.target.value,
                    })
                  }
                  placeholder="0.2"
                  step="0.05"
                  min="0.15"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={row.soakawayDetails?.includesGravel || false}
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      includesGravel: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Gravel Backfill</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={
                    row.soakawayDetails?.includesPerforatedPipes || false
                  }
                  onCheckedChange={(checked) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      includesPerforatedPipes: checked === true,
                    })
                  }
                />
                <Label className="text-sm">Include Perforated Pipes</Label>
              </div>
            </div>
            {row.soakawayDetails?.includesGravel && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gravel Depth (m)</Label>
                <Input
                  type="number"
                  value={row.soakawayDetails?.gravelDepth || "0.3"}
                  onChange={(e) =>
                    updateRow(row.id, "soakawayDetails", {
                      ...row.soakawayDetails,
                      gravelDepth: e.target.value,
                    })
                  }
                  placeholder="0.3"
                  step="0.1"
                  min="0.1"
                />
              </div>
            )}
          </div>
        );

      case "water-tank":
        return (
          <div className="grid sm:grid-cols-3 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <Input
              type="number"
              value={row.tankDetails?.capacity || ""}
              onChange={(e) =>
                updateRow(row.id, "tankDetails", {
                  ...row.tankDetails,
                  capacity: e.target.value,
                })
              }
              placeholder="Capacity (m³)"
              step="0.1"
            />
            <Input
              type="number"
              value={row.tankDetails?.wallThickness || ""}
              onChange={(e) =>
                updateRow(row.id, "tankDetails", {
                  ...row.tankDetails,
                  wallThickness: e.target.value,
                })
              }
              placeholder="Wall Thickness (m)"
              step="0.01"
            />
            <Select
              value={row.tankDetails?.coverType || "slab"}
              onValueChange={(value) =>
                updateRow(row.id, "tankDetails", {
                  ...row.tankDetails,
                  coverType: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Cover Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slab">Concrete Slab</SelectItem>
                <SelectItem value="precast">Precast</SelectItem>
                <SelectItem value="none">No Cover</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case "retaining-wall":
        return (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
            <Label className="text-sm font-medium">
              Retaining Wall Configuration
            </Label>
            <div className="grid sm:grid-cols-2 gap-2 mt-2">
              <Input
                type="number"
                value={row.reinforcement?.mainBarSpacing || ""}
                onChange={(e) =>
                  updateRow(row.id, "reinforcement", {
                    ...row.reinforcement,
                    mainBarSpacing: e.target.value,
                  })
                }
                placeholder="Main Bar Spacing (mm)"
              />
              <Input
                type="number"
                value={row.reinforcement?.distributionBarSpacing || ""}
                onChange={(e) =>
                  updateRow(row.id, "reinforcement", {
                    ...row.reinforcement,
                    distributionBarSpacing: e.target.value,
                  })
                }
                placeholder="Distribution Bar Spacing (mm)"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSteppedFoundation = (row: ConcreteRow) => {
    if (!row.isSteppedFoundation) return null;

    return (
      <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-purple-800 dark:text-purple-200">
            Stepped Foundation Details
          </h4>
          <Button
            type="button"
            onClick={() => addFoundationStep(row.id)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Step
          </Button>
        </div>

        {row.foundationSteps?.map((step, index) => (
          <div
            key={step.id}
            className="grid sm:grid-cols-5 gap-2 p-3 bg-white dark:bg-gray-800 rounded-2xl border"
          >
            <div className="flex items-center">
              <Badge
                variant="outline"
                className="bg-purple-100 text-purple-800"
              >
                Step {index + 1}
              </Badge>
            </div>
            <Input
              type="number"
              value={step.length}
              onChange={(e) =>
                updateFoundationStep(row.id, step.id, "length", e.target.value)
              }
              placeholder="Length (m)"
              step="0.1"
            />
            <Input
              type="number"
              value={step.width}
              onChange={(e) =>
                updateFoundationStep(row.id, step.id, "width", e.target.value)
              }
              placeholder="Width (m)"
              step="0.1"
            />
            <Input
              type="number"
              value={step.depth}
              onChange={(e) =>
                updateFoundationStep(row.id, step.id, "depth", e.target.value)
              }
              placeholder="Depth (m)"
              step="0.05"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                value={step.offset}
                onChange={(e) =>
                  updateFoundationStep(
                    row.id,
                    step.id,
                    "offset",
                    e.target.value,
                  )
                }
                placeholder="Offset (m)"
                step="0.1"
              />
              <Button
                type="button"
                onClick={() => removeFoundationStep(row.id, step.id)}
                variant="destructive"
                size="sm"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {(!row.foundationSteps || row.foundationSteps.length === 0) && (
          <p className="text-sm text-gray-500 text-center py-4">
            No steps added yet. Click "Add Step" to create stepped foundation.
          </p>
        )}
      </div>
    );
  };

  const renderWaterproofing = (row: ConcreteRow) => {
    // Conditional logic: DPC for foundations, Polythene for slabs
    const shouldShowDPC =
      row.element === "raft-foundation" || row.element === "strip-footing";
    const shouldShowPolythene = row.element === "slab";

    return (
      <div className="space-y-7 p-3">
        {shouldShowDPC && (
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Checkbox
                checked={row.waterproofing?.includesDPC || false}
                onCheckedChange={(checked) =>
                  updateRow(row.id, "waterproofing", {
                    ...row.waterproofing,
                    includesDPC: checked === true,
                  })
                }
              />
              <span className="ml-2">Include DPM</span>
            </Label>
          </div>
        )}

        {row.waterproofing?.includesDPC && shouldShowDPC && (
          <div className="grid sm:grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">DPC Type</Label>
              <Select
                value={row.waterproofing?.dpcMaterial || "Polyethylene"}
                onValueChange={(value) =>
                  updateRow(row.id, "waterproofing", {
                    ...row.waterproofing,
                    dpcMaterial: value,
                    dpcSize: undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Polyethylene">Polyethylene</SelectItem>
                  <SelectItem value="Bituminous Felt">
                    Bituminous Felt
                  </SelectItem>
                  <SelectItem value="PVC DPC Roll">PVC DPC Roll</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {shouldShowPolythene && (
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Checkbox
                checked={row.waterproofing?.includesPolythene || false}
                onCheckedChange={(checked) =>
                  updateRow(row.id, "waterproofing", {
                    ...row.waterproofing,
                    includesPolythene: checked === true,
                  })
                }
              />
              <span className="ml-2">Include Polythene Sheet</span>
            </Label>
          </div>
        )}
        {row.waterproofing?.includesPolythene && shouldShowPolythene && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Polythene Gauge</Label>
            <Select
              value={row.waterproofing?.polytheneGauge || "1000g"}
              onValueChange={(value) =>
                updateRow(row.id, "waterproofing", {
                  ...row.waterproofing,
                  polytheneGauge: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500g">500 Gauge (DPM)</SelectItem>
                <SelectItem value="1000g">1000 Gauge</SelectItem>
                <SelectItem value="1200g">1200 Gauge</SelectItem>
                <SelectItem value="1500g">1500 Gauge</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <Checkbox
              checked={row.waterproofing?.includesWaterproofing || false}
              onCheckedChange={(checked) =>
                updateRow(row.id, "waterproofing", {
                  ...row.waterproofing,
                  includesWaterproofing: checked === true,
                })
              }
            />
            <span className="ml-2">Include Waterproofing</span>
          </Label>
        </div>

        {row.waterproofing?.includesWaterproofing && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Waterproofing Type</Label>
            <Select
              value={row.waterproofing?.waterproofingType || "bituminous"}
              onValueChange={(value) =>
                updateRow(row.id, "waterproofing", {
                  ...row.waterproofing,
                  waterproofingType: value as
                    | "bituminous"
                    | "crystalline"
                    | "membrane",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bituminous">Bituminous Coating</SelectItem>
                <SelectItem value="crystalline">
                  Crystalline Waterproofing
                </SelectItem>
                <SelectItem value="membrane">Waterproof Membrane</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (!cementMat || !sandMat || !ballastMat) return;

    if (results.length === 0) {
      if (
        Array.isArray(quote?.concrete_materials) &&
        quote.concrete_materials.length
      ) {
        setQuote((prev: any) => ({ ...prev, concrete_materials: [] }));
      }
      return;
    }

    const lineItems = results.flatMap((r) => {
      const rowItems: any[] = [
        {
          rowId: r.id,
          name: `Cement (${r.name})`,
          quantity: r.grossCementBags,
          unit_price: cementMat.price,
          total_price: r.grossCementBags * cementMat.price,
        },
        {
          rowId: r.id,
          name: `Sand (${r.name})`,
          quantity: r.grossSandM3,
          unit_price: sandMat.price,
          total_price: r.grossSandM3 * sandMat.price,
        },
        {
          rowId: r.id,
          name: `Ballast (${r.name})`,
          quantity: r.grossStoneM3,
          unit_price: ballastMat.price,
          total_price: r.grossStoneM3 * ballastMat.price,
        },
        {
          rowId: r.id,
          name: `Formwork (${r.name})`,
          quantity: r.formworkM2,
          unit_price: formworkMat?.price || 0,
          total_price: Math.round(r.formworkM2 * (formworkMat?.price || 0)),
        },
        {
          rowId: r.id,
          name: `Aggregate (${r.name})`,
          quantity: r.aggregateVolume || 0,
          unit_price: aggregateMat?.price || 0,
          total_price: Math.round(
            (r.aggregateVolume || 0) * (aggregateMat?.price || 0),
          ),
        },
      ];

      if (r.dpcCost && r.dpcCost > 0) {
        rowItems.push({
          rowId: r.id,
          name: `DPC (${r.name})`,
          quantity: r.dpcArea || 0,
          unit_price: dpcMat?.price || 50,
          total_price: Math.round(r.dpcCost),
        });
      }

      if (r.polytheneCost && r.polytheneCost > 0) {
        rowItems.push({
          rowId: r.id,
          name: `Polythene Sheet (${r.name})`,
          quantity: r.polytheneArea || 0,
          unit_price: polytheneMat?.price || 30,
          total_price: Math.round(r.polytheneCost),
        });
      }

      if (r.waterproofingCost && r.waterproofingCost > 0) {
        rowItems.push({
          rowId: r.id,
          name: `Waterproofing (${r.name})`,
          quantity: r.waterproofingArea || 0,
          unit_price: waterproofingMat?.price || 80,
          total_price: Math.round(r.waterproofingCost),
        });
      }

      if (r.gravelCost && r.gravelCost > 0) {
        rowItems.push({
          rowId: r.id,
          name: `Gravel (${r.name})`,
          quantity: r.gravelVolume || 0,
          unit_price: gravelMat?.price || 0,
          total_price: Math.round(r.gravelCost),
        });
      }

      if (r.blindingCost && r.blindingCost > 0) {
        rowItems.push({
          rowId: r.id,
          name: `Concrete Blinding 1:4:8 (${r.name})`,
          quantity: r.blindingVolume || 0,
          unit_price: r.blindingVolume ? r.blindingCost / r.blindingVolume : 0,
          total_price: Math.round(r.blindingCost),
        });
      }

      if (r.maramBlindingCost && r.maramBlindingCost > 0) {
        const maramMaterial = materials.find((m) =>
          m.name?.toLowerCase().includes("maram"),
        );
        rowItems.push({
          rowId: r.id,
          name: `Murram Blinding (${r.name})`,
          quantity: r.maramBlindingVolume || 0,
          unit_price: maramMaterial?.price || 0,
          total_price: Math.round(r.maramBlindingCost),
        });
      }

      if (r.compactionCost && r.compactionCost > 0) {
        const compactionMaterial = materials.find((m) =>
          m.name?.toLowerCase().includes("compaction"),
        );
        rowItems.push({
          rowId: r.id,
          name: `Compaction (${r.name})`,
          quantity: r.compactionArea || 0,
          unit_price: compactionMaterial?.price || 0,
          total_price: Math.round(r.compactionCost),
        });
      }

      if (r.backFillCost && r.backFillCost > 0) {
        const fillMaterial = materials.find((m) =>
          m.name?.toLowerCase().includes("backfill"),
        );
        rowItems.push({
          rowId: r.id,
          name: `Back Fill (${r.name})`,
          quantity: r.backFillVolume || 0,
          unit_price: fillMaterial?.price || 0,
          total_price: Math.round(r.backFillCost),
        });
      }

      if (!qsSettings.clientProvidesWater) {
        rowItems.push({
          rowId: r.id,
          name: `Water (${r.name})`,
          quantity: r.grossWaterRequiredL,
          unit_price: waterMat?.price || 0,
          total_price: (r.grossWaterRequiredL / 1000) * (waterMat?.price || 0),
        });
      }

      rowItems.push({
        rowId: r.id,
        name: `Concrete Total`,
        rate: r.unitRate,
        quantity: Math.round(r.totalVolume),
        total_price: r.totalConcreteCost,
      });

      if (r.bedVolume && r.bedVolume > 0) {
        rowItems.push({
          rowId: r.id,
          name: `Bed Total`,
          rate: r.unitRate,
          quantity: Math.round(r.bedVolume),
          total_price: r.bedVolume * r.unitRate,
        });
      }

      const totalRowCost = r.totalConcreteCost;

      rowItems.push({
        rowId: r.id,
        name: "Total items",
        quantity: Math.round(r.totalVolume),
        total_price: totalRowCost,
      });

      return rowItems;
    });

    const totalsRows = [
      {
        rowId: "totals",
        name: "Total Cement (Concrete + Mortar)",
        quantity: totals.cement + (totals.mortarCementBags || 0),
        unit_price: cementMat.price,
        total_price: Math.round(
          (totals.cement + (totals.mortarCementBags || 0)) * cementMat.price,
        ),
      },
      {
        rowId: "totals",
        name: "Total Sand (Concrete + Mortar)",
        quantity: totals.sand + (totals.mortarSandM3 || 0),
        unit_price: sandMat.price,
        total_price: Math.round(
          (totals.sand + (totals.mortarSandM3 || 0)) * sandMat.price,
        ),
      },
      {
        rowId: "totals",
        name: "Total Ballast",
        quantity: totals.stone,
        unit_price: ballastMat.price,
        total_price: Math.round(totals.stone * ballastMat.price),
      },
      {
        rowId: "totals",
        name: "Total Formwork",
        quantity: totals.formworkM2,
        unit_price: formworkMat?.price || 0,
        total_price: Math.round(totals.formworkM2 * (formworkMat?.price || 0)),
      },
      {
        rowId: "totals",
        name: "Total Aggregate",
        quantity: totals.aggregateVolume || 0,
        unit_price: aggregateMat?.price || 0,
        total_price: Math.round(
          (totals.aggregateVolume || 0) * (aggregateMat?.price || 0),
        ),
      },
      ...(!qsSettings.clientProvidesWater
        ? [
            {
              rowId: "totals",
              name: "Total Water",
              quantity: totals.waterRequired,
              unit_price: waterMat?.price || 0,
              total_price: Math.round(totals.waterCost),
            },
          ]
        : []),
      ...(totals.dpcCost > 0
        ? [
            {
              rowId: "totals",
              name: "Total DPC",
              quantity: totals.dpcArea,
              unit_price: dpcMat?.price || 50,
              total_price: Math.round(totals.dpcCost),
            },
          ]
        : []),
      ...(totals.polytheneCost > 0
        ? [
            {
              rowId: "totals",
              name: "Total Polythene Sheet",
              quantity: totals.polytheneArea,
              unit_price: polytheneMat?.price || 30,
              total_price: Math.round(totals.polytheneCost),
            },
          ]
        : []),
      ...(totals.waterproofingCost > 0
        ? [
            {
              rowId: "totals",
              name: "Total Waterproofing",
              quantity: totals.waterproofingArea,
              unit_price: waterproofingMat?.price || 80,
              total_price: Math.round(totals.waterproofingCost),
            },
          ]
        : []),
      ...(totals.gravelCost > 0
        ? [
            {
              rowId: "totals",
              name: "Total Gravel",
              quantity: totals.gravelVolume,
              unit_price: gravelMat?.price || 0,
              total_price: Math.round(totals.gravelCost),
            },
          ]
        : []),
      {
        rowId: "totals",
        name: "Concrete Rate (Avg.)",
        quantity: 1,
        unit_price: Math.round(totals.materialCost / (totals.volume || 1)),
        total_price: Math.round(totals.materialCost / (totals.volume || 1)),
      },
      {
        rowId: "totals",
        name: "Concrete Total Cost",
        quantity: Math.round(totals.volume),
        unit_price: 0,
        total_price: Math.round(totals.materialCost),
      },
      {
        rowId: "totals",
        name: "Grand Total (All Materials)",
        quantity: rows[0]?.number || 1,
        total_price: Math.round(totals.totalCost),
      },
    ];

    const nextItems = [...lineItems, ...totalsRows];
    const currItems = Array.isArray(quote?.concrete_materials)
      ? quote.concrete_materials
      : [];
    const same = JSON.stringify(currItems) === JSON.stringify(nextItems);

    if (!same) {
      setQuote((prev: any) => ({ ...prev, concrete_materials: nextItems }));
    }
  }, [
    results,
    cementMat,
    sandMat,
    ballastMat,
    aggregateMat,
    formworkMat,
    waterMat,
    dpcMat,
    polytheneMat,
    waterproofingMat,
    gravelMat,
    totals,
    setQuote,
    quote?.concrete_materials,
    rows,
    qsSettings,
  ]);

  useEffect(() => {
    setQuote((prev: any) => ({ ...prev, qsSettings: qsSettings }));
  }, [qsSettings, setQuote]);

  return (
    <div className="space-y-4 p-1 rounded-lg">
      <h2 className="text-xl font-bold">Concrete & Foundation Calculator</h2>
      <Label className="mt-5 items-center space-x-2">
        {" "}
        Wastage Allowance (%)
        <Input
          type="number"
          value={qsSettings.wastageConcrete ?? 1}
          step="1"
          min="1"
          className="max-w-xs"
          onChange={(e) =>
            onSettingsChange({
              ...qsSettings,
              wastageConcrete: parseFloat(e.target.value),
            })
          }
          placeholder="Concrete wastage (%)"
        />
      </Label>

      {!qsSettings.clientProvidesWater && totals.waterRequired > 0 && (
        <div className="mb-3 p-3 bg-green-50 border border-blue-200 dark:bg-green-500/30 dark:border-green-500/50 rounded-lg">
          <p className="text-sm text-green-800 dark:text-white font-medium">
            💧 Water Cost Calculation:
          </p>
          <div className="text-sm text-green-700 dark:text-white mt-1 space-y-1">
            <div>
              • Water Required: {totals.waterRequired?.toFixed(0)} liters
            </div>
            <div>• Water-Cement Ratio: {qsSettings.cementWaterRatio}:1</div>
            <div>
              • Water Price: Ksh {(waterMat?.price || 0).toLocaleString()} per
              m³
            </div>
            <div className="font-semibold mt-1">
              • Total Water Cost: Ksh {(totals.waterCost || 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {qsSettings.clientProvidesWater && totals.waterRequired > 0 && (
        <div className="mb-3 p-2 bg-green-50 border border-blue-200 dark:bg-green-500/30 dark:border-green-500/50 rounded-lg">
          <p className="text-sm">
            💧 Water required: {totals.waterRequired?.toFixed(0)} liters (Client
            provided - no cost included)
          </p>
        </div>
      )}

      {rows.length === 0 && <p>No elements yet. Add an item below</p>}

      {rows.map((row) => {
        const result = results.find((r) => r.id === row.id);
        return (
          <Card
            key={row.id}
            className="p-4 border dark:border-white/20 border-primary/40 rounded-lg space-y-2"
          >
            <Input
              type="text"
              value={row.name}
              onChange={(e) => updateRow(row.id, "name", e.target.value)}
              placeholder="Name (e.g. Slab 1)"
              className="font-semibold text-lg mb-2"
            />
            <div className="grid sm:grid-cols-4 gap-2">
              <Select
                value={row.element}
                onValueChange={(value) =>
                  handleElementChange(row.id, value as ElementType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select element" />
                </SelectTrigger>
                <SelectContent>
                  {/* Basic Elements */}
                  <SelectItem value="slab">Slab</SelectItem>
                  <SelectItem value="beam">Beam</SelectItem>
                  <SelectItem value="column">Column</SelectItem>
                  <SelectItem value="staircase">Staircase</SelectItem>
                  <SelectItem value="ramp">Ramp</SelectItem>
                  <SelectItem value="paving">Paving</SelectItem>
                  <SelectItem value="kerb">Kerb</SelectItem>

                  {/* Foundation Elements */}
                  <SelectItem value="strip-footing">Strip Footing</SelectItem>
                  <SelectItem value="raft-foundation">
                    Raft Foundation
                  </SelectItem>
                  <SelectItem value="pile-cap">Pile Cap</SelectItem>

                  {/* Underground Systems */}
                  <SelectItem value="soak-pit">Soak Pit</SelectItem>
                  <SelectItem value="soakaway">Soakaway</SelectItem>
                  <SelectItem value="septic-tank">Septic Tank</SelectItem>
                  <SelectItem value="underground-tank">
                    Underground Tank
                  </SelectItem>
                  <SelectItem value="water-tank">Water Tank</SelectItem>

                  {/* Wall Elements */}
                  <SelectItem value="retaining-wall">Retaining Wall</SelectItem>

                  {/* Civil Works */}
                  <SelectItem value="culvert">Culvert</SelectItem>
                  <SelectItem value="drainage-channel">
                    Drainage Channel
                  </SelectItem>
                  <SelectItem value="manhole">Manhole</SelectItem>
                  <SelectItem value="inspection-chamber">
                    Inspection Chamber
                  </SelectItem>
                  <SelectItem value="swimming-pool">Swimming Pool</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={row.category}
                onValueChange={(value) =>
                  updateRow(row.id, "category", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent defaultValue={"substructure"}>
                  <SelectItem value="substructure">Substructure</SelectItem>
                  <SelectItem value="superstructure">Superstructure</SelectItem>
                </SelectContent>
              </Select>

              {row.element !== "slab" && (
                <div className="grid gap-2 mb-2">
                  <Select
                    value={row.areaSelectionMode || "LENGTH_WIDTH"}
                    onValueChange={(value) =>
                      updateRow(
                        row.id,
                        "areaSelectionMode",
                        value as "LENGTH_WIDTH" | "DIRECT_AREA",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Dimension mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LENGTH_WIDTH">
                        Length × Width
                      </SelectItem>
                      <SelectItem value="DIRECT_AREA">Direct Area</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={() => removeRow(row.id)} variant="destructive">
                <Trash className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-4 gap-2">
              {row.element === "slab" ? (
                <>
                  <Input
                    type="number"
                    value={row.slabArea || ""}
                    onChange={(e) =>
                      updateRow(row.id, "slabArea", e.target.value)
                    }
                    placeholder="Slab Area (m²)"
                    step="0.1"
                    min="0"
                  />
                  <Input
                    type="number"
                    value={row.height}
                    step="0.1"
                    onChange={(e) =>
                      updateRow(row.id, "height", e.target.value)
                    }
                    placeholder={"Thickness (m)"}
                  />
                  <Input
                    type="number"
                    value={row.number}
                    step="1"
                    min="1"
                    defaultValue="1"
                    onChange={(e) =>
                      updateRow(row.id, "number", e.target.value)
                    }
                    placeholder="Number of items"
                  />
                  <Input
                    type="number"
                    value={row.verandahArea || ""}
                    onChange={(e) =>
                      updateRow(row.id, "verandahArea", e.target.value)
                    }
                    placeholder="Additional area"
                    step="0.1"
                  />
                </>
              ) : row.areaSelectionMode === "DIRECT_AREA" ? (
                <>
                  <Input
                    type="number"
                    value={row.area}
                    onChange={(e) => updateRow(row.id, "area", e.target.value)}
                    placeholder="Area (m²)"
                    step="0.1"
                    min="0"
                  />
                  <Input
                    type="number"
                    value={row.height}
                    step="0.1"
                    onChange={(e) =>
                      updateRow(row.id, "height", e.target.value)
                    }
                    placeholder={"Height/Thickness (m)"}
                  />
                  <Input
                    type="number"
                    value={row.number}
                    step="1"
                    min="1"
                    defaultValue="1"
                    onChange={(e) =>
                      updateRow(row.id, "number", e.target.value)
                    }
                    placeholder="Number of items"
                  />
                  <div></div>
                </>
              ) : (
                <>
                  <Input
                    type="number"
                    value={row.length}
                    onChange={(e) =>
                      updateRow(row.id, "length", e.target.value)
                    }
                    placeholder={"Length (m)"}
                  />
                  <Input
                    type="number"
                    value={row.width}
                    onChange={(e) => updateRow(row.id, "width", e.target.value)}
                    placeholder={"Width (m)"}
                  />
                  <Input
                    type="number"
                    value={row.height}
                    step="0.1"
                    onChange={(e) => syncHeightFields(row.id, e.target.value)}
                    placeholder={"Height/Thickness (m)"}
                  />
                  <Input
                    type="number"
                    value={row.number}
                    step="1"
                    min="1"
                    defaultValue="1"
                    onChange={(e) =>
                      updateRow(row.id, "number", e.target.value)
                    }
                    placeholder="Number of items"
                  />
                </>
              )}
            </div>

            {renderSpecializedFields(row)}

            {renderWaterproofing(row)}

            {/* Blinding, Maram & Backfill - Only for Slabs */}
            {(row.element === "strip-footing" ||
              row.element === "raft-foundation") && (
              <div className="space-y-4">
                {/* Back Fill */}
                <div className="space-y-2 p-3 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`backfill-${row.id}`}
                      checked={row.hasBackFill}
                      onCheckedChange={(checked) =>
                        updateRow(row.id, "hasBackFill", checked === true)
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`backfill-${row.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Hardcore Backfill
                    </Label>
                  </div>

                  {row.hasBackFill && (
                    <Input
                      type="number"
                      value={row.backFillDepth || ""}
                      onChange={(e) =>
                        updateRow(row.id, "backFillDepth", e.target.value)
                      }
                      placeholder="Back fill depth (m)"
                      step="0.05"
                      min="0.05"
                      max="1"
                    />
                  )}
                </div>
                {/* Blinding Section */}
                <div className="space-y-2 p-3 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`blinding-${row.id}`}
                      checked={row.hasBlinding || false}
                      onCheckedChange={(checked) =>
                        updateRow(row.id, "hasBlinding", checked === true)
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`blinding-${row.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Concrete Blinding (1:4:8)
                    </Label>
                  </div>

                  {row.hasBlinding && (
                    <div className="grid sm:grid-cols-3 gap-2 ml-6">
                      <Input
                        type="number"
                        value={row.blindingDepth || "0.05"}
                        onChange={(e) =>
                          updateRow(row.id, "blindingDepth", e.target.value)
                        }
                        placeholder="Depth (m)"
                        step="0.01"
                        min="0.01"
                        max="0.5"
                      />
                      <Select
                        value={row.blindingMix || "1:4:8"}
                        onValueChange={(value) =>
                          updateRow(row.id, "blindingMix", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1:3:6">1:3:6</SelectItem>
                          <SelectItem value="1:4:8">1:4:8</SelectItem>
                          <SelectItem value="1:2:4">1:2:4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )}
            {row.element === "slab" && (
              <div>
                {/* Murram Blinding */}
                <div className="space-y-2 p-3 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`maram-${row.id}`}
                      checked={row.hasMaramBlinding || false}
                      onCheckedChange={(checked) =>
                        updateRow(row.id, "hasMaramBlinding", checked === true)
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`maram-${row.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Murram Blinding
                    </Label>
                  </div>

                  {row.hasMaramBlinding && (
                    <div className="grid sm:grid-cols-1 gap-2 ml-6">
                      <Input
                        type="number"
                        value={row.maramBlindingDepth || "0.05"}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "maramBlindingDepth",
                            e.target.value,
                          )
                        }
                        placeholder="Maram depth (m)"
                        step="0.01"
                        min="0.01"
                        max="0.5"
                      />
                    </div>
                  )}
                </div>

                {/* Anti-termite Treatment */}
                <div className="flex items-center space-x-2 p-2 rounded-md">
                  <Checkbox
                    id={`termite-${row.id}`}
                    checked={row.hasAntiTermiteTreatment}
                    onCheckedChange={(checked) =>
                      updateRow(
                        row.id,
                        "hasAntiTermiteTreatment",
                        checked === true,
                      )
                    }
                    className="w-4 h-4"
                  />
                  <Label
                    htmlFor={`termite-${row.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Anti-termite Treatment
                  </Label>
                </div>
              </div>
            )}

            {(row.element === "raft-foundation" ||
              row.element === "strip-footing") && (
              <div className="space-y-4">
                {/* <div className="grid sm:grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`stepped-${row.id}`}
                      checked={row.isSteppedFoundation || false}
                      onCheckedChange={(checked) =>
                        updateRow(
                          row.id,
                          "isSteppedFoundation",
                          checked === true,
                        )
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`stepped-${row.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Stepped Foundation
                    </Label>
                  </div>
                </div> */}

                {renderSteppedFoundation(row)}
              </div>
            )}

            {result && (
              <div className="mt-2 text-sm">
                <p>
                  <b>Total Concrete Volume:</b> {result.totalVolume.toFixed(2)}{" "}
                  m³
                </p>
                <p>
                  <b>Concrete Rate:</b> Ksh {result.unitRate.toFixed(0)}/m³
                </p>
                <p>
                  <b>Concrete Cost:</b> Ksh{" "}
                  {Math.round(result.totalConcreteCost).toLocaleString()}
                </p>

                {(result.dpcCost ||
                  result.polytheneCost ||
                  result.waterproofingCost) > 0 && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <h4 className="font-semibold mb-2">Waterproofing Costs:</h4>
                    {result.dpcCost > 0 && (
                      <p>
                        <b>DPC:</b> {result.dpcArea?.toFixed(2)} m² — Ksh{" "}
                        {Math.round(result.dpcCost).toLocaleString()}
                      </p>
                    )}
                    {result.polytheneCost > 0 && (
                      <p>
                        <b>Polythene:</b> {result.polytheneArea?.toFixed(2)} m²
                        — Ksh{" "}
                        {Math.round(result.polytheneCost).toLocaleString()}
                      </p>
                    )}
                    {result.waterproofingCost > 0 && (
                      <p>
                        <b>Waterproofing:</b>{" "}
                        {result.waterproofingArea?.toFixed(2)} m² — Ksh{" "}
                        {Math.round(result.waterproofingCost).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {result.gravelVolume > 0 && (
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                    <h4 className="font-semibold mb-2">Gravel Backfill:</h4>
                    <p>
                      <b>Gravel Volume:</b> {result.gravelVolume.toFixed(2)} m³
                      — Ksh{" "}
                      {Math.round(result.gravelCost || 0).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="mt-2">
                  <h4 className="font-semibold">Material Breakdown:</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                    (Cement, sand, ballast, water, aggregate are included in the
                    concrete rate)
                  </p>
                  <p>
                    <b>Cement:</b> {result.netCementBags.toFixed(1)} bags (net)
                    → {result.grossCementBags.toFixed(1)} bags (gross) —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.grossCementBags * (cementMat?.price || 0),
                      ).toLocaleString()}
                    </b>
                  </p>
                  <p>
                    <b>Sand:</b> {result.netSandM3.toFixed(2)} m³ (net) →{" "}
                    {result.grossSandM3.toFixed(2)} m³ (gross) —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.grossSandM3 * (sandMat?.price || 0),
                      ).toLocaleString()}
                    </b>
                  </p>
                  <p>
                    <b>Ballast:</b> {result.netStoneM3.toFixed(2)} m³ (net) →{" "}
                    {result.grossStoneM3.toFixed(2)} m³ (gross) —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.grossStoneM3 * (ballastMat?.price || 0),
                      ).toLocaleString()}
                    </b>
                  </p>
                  <p>
                    <b>Formwork:</b> {result.formworkM2.toFixed(2)} m² —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.formworkM2 * (formworkMat?.price || 0),
                      ).toLocaleString()}
                    </b>
                  </p>

                  {!qsSettings.clientProvidesWater && (
                    <p>
                      <b>Water:</b> {result.netWaterRequiredL?.toFixed(0)} L
                      (net) → {result.grossWaterRequiredL?.toFixed(0)} L (gross)
                      —{" "}
                      <b>
                        Ksh {Math.round(result.waterCost || 0).toLocaleString()}
                      </b>
                    </p>
                  )}

                  <div className="ml-4 mt-1 p-2 bg-card dark:bg-primary/20 rounded-lg text-xs">
                    <p>
                      <b>Water Breakdown:</b>
                    </p>
                    <p>• Mixing: {result.waterMixingL?.toFixed(0)} L</p>
                    <p>• Curing: {result.waterCuringL?.toFixed(0)} L</p>
                    <p>• Other uses: {result.waterOtherL?.toFixed(0)} L</p>
                    <p>
                      • Aggregate adjustment:{" "}
                      {result.waterAggregateAdjustmentL?.toFixed(0)} L
                    </p>
                  </div>

                  {result.gravelVolume > 0 && (
                    <p>
                      <b>Gravel:</b> {result.gravelVolume.toFixed(2)} m³ —{" "}
                      <b>
                        Ksh{" "}
                        {Math.round(result.gravelCost || 0).toLocaleString()}
                      </b>
                    </p>
                  )}

                  <div className="ml-4 mt-1 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-xs">
                    <p>
                      <b>Cost Breakdown:</b>
                    </p>
                    <p>
                      • Total Cost: Ksh{" "}
                      {Math.round(result.materialCost || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        );
      })}

      <Button onClick={addRow} className="px-4 py-2 text-white">
        + Add Element
      </Button>

      <Card className="p-4 border rounded-lg mt-4">
        <h3 className="font-bold">Totals</h3>
        <p>
          <b>Total Concrete Volume:</b> {totals?.volume?.toFixed(2)} m³
        </p>
        <p>
          <b>Total Cement (Concrete):</b> {totals?.cement?.toFixed(1)} bags —{" "}
          <b>
            Ksh{" "}
            {Math.round(
              totals?.cement * (cementMat?.price || 0),
            ).toLocaleString()}
          </b>
        </p>
        <p>
          <b>Total Sand (Concrete):</b> {totals.sand?.toFixed(2)} m³ —{" "}
          <b>
            Ksh{" "}
            {Math.round(totals.sand * (sandMat?.price || 0)).toLocaleString()}
          </b>
        </p>
        <p>
          <b>Total Ballast:</b> {totals.stone?.toFixed(2)} m³ —{" "}
          <b>
            Ksh{" "}
            {Math.round(
              totals.stone * (ballastMat?.price || 0),
            ).toLocaleString()}
          </b>
        </p>
        <p>
          <b>Total Formwork:</b> {totals.formworkM2?.toFixed(2)} m² —{" "}
          <b>
            Ksh{" "}
            {Math.round(
              totals.formworkM2 * (formworkMat?.price || 0),
            ).toLocaleString()}
          </b>
        </p>

        {!qsSettings.clientProvidesWater && totals.waterCost > 0 && (
          <p>
            <b>Total Water:</b> {totals.waterRequired?.toFixed(0)} liters —{" "}
            <b>Ksh {Math.round(totals.waterCost || 0).toLocaleString()}</b>
          </p>
        )}

        {totals.dpcCost > 0 && (
          <p>
            <b>Total DPC:</b> {totals.dpcArea?.toFixed(2)} m² —{" "}
            <b>Ksh {Math.round(totals.dpcCost).toLocaleString()}</b>
          </p>
        )}

        {totals.polytheneCost > 0 && (
          <p>
            <b>Total Polythene Sheet:</b> {totals.polytheneArea?.toFixed(2)} m²
            — <b>Ksh {Math.round(totals.polytheneCost).toLocaleString()}</b>
          </p>
        )}

        {totals.waterproofingCost > 0 && (
          <p>
            <b>Total Waterproofing:</b> {totals.waterproofingArea?.toFixed(2)}{" "}
            m² —{" "}
            <b>Ksh {Math.round(totals.waterproofingCost).toLocaleString()}</b>
          </p>
        )}

        {totals.gravelCost > 0 && (
          <p>
            <b>Total Gravel:</b> {totals.gravelVolume?.toFixed(2)} m³ —{" "}
            <b>Ksh {Math.round(totals.gravelCost).toLocaleString()}</b>
          </p>
        )}

        {totals.blindingCost > 0 && (
          <p>
            <b>Total Blinding (1:4:8):</b> {totals.blindingVolume?.toFixed(3)}{" "}
            m³ — <b>Ksh {Math.round(totals.blindingCost).toLocaleString()}</b>
          </p>
        )}

        {totals.maramBlindingCost > 0 && (
          <p>
            <b>Total Murram Blinding:</b>{" "}
            {totals.maramBlindingVolume?.toFixed(3)} m³ —{" "}
            <b>Ksh {Math.round(totals.maramBlindingCost).toLocaleString()}</b>
          </p>
        )}

        {totals.compactionCost > 0 && (
          <p>
            <b>Total Compaction:</b> {totals.compactionArea?.toFixed(2)} m² —{" "}
            <b>Ksh {Math.round(totals.compactionCost).toLocaleString()}</b>
          </p>
        )}

        {totals.backFillCost > 0 && (
          <p>
            <b>Total Hardcore Backfill:</b> {totals.backFillVolume?.toFixed(3)}{" "}
            m³ — <b>Ksh {Math.round(totals.backFillCost).toLocaleString()}</b>
          </p>
        )}

        {totals.blocksCost > 0 && (
          <p>
            <b>Total Blocks (by foot):</b> {totals.blocksFeet?.toFixed(2)} ft —{" "}
            <b>Ksh {Math.round(totals.blocksCost).toLocaleString()}</b>
          </p>
        )}

        <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
          <p>
            <b>Cost Breakdown:</b>
          </p>
          <p>
            • Total Material Cost: Ksh{" "}
            {Math.round(totals.totalCost || 0).toLocaleString()}
          </p>
        </div>

        <p className="mt-2 font-bold text-lg">
          Grand Total (All Materials): Ksh{" "}
          {Math.round(totals.totalCost || 0).toLocaleString()}
        </p>
      </Card>
    </div>
  );
}
