// ConcreteCalculatorForm.tsx
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
  QSSettings,
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
import { Trash } from "lucide-react";
import { Material } from "@/hooks/useQuoteCalculations";
import { useAuth } from "@/contexts/AuthContext";
import { RegionalMultiplier } from "@/hooks/useDynamicPricing";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import useMasonryCalculator from "@/hooks/useMasonryCalculator";
import { Card } from "./ui/card";

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
  const { qsSettings, updateQsSettings } = useMasonryCalculator({
    setQuote,
    quote,
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    userRegion,
    getEffectiveMaterialPrice,
  });

  // ---- Load regional multipliers --------------------------------------------
  useEffect(() => {
    const loadMultipliers = async () => {
      const { data } = await supabase.from("regional_multipliers").select("*");
      if (data) setRegionalMultipliers(data);
    };
    loadMultipliers();
  }, []);

  // ---- Make a new empty element row -----------------------------------------
  const makeDefaultRow = useCallback((): ConcreteRow => {
    const id = Math.random().toString(36).substr(2, 9);
    return {
      id,
      name: `Element ${id}`,
      element: "slab",
      length: "",
      width: "",
      height: "",
      mix: "1:2:4",
      category: "substructure",
      number: "1",
      hasMasonryWall: false,
      masonryBlockType: "Standard Block",
      masonryBlockDimensions: "0.4x0.2x0.2",
      masonryWallThickness: "0.200",
      masonryWallHeight: "1.000",
    };
  }, []);

  // ---- Local UI state for rows ----------------------------------------------
  const [rows, setRows] = useState<ConcreteRow[]>([]);

  useEffect(() => {
    if (Array.isArray(quote?.concrete_rows)) {
      setRows(quote.concrete_rows);
    } else {
      setRows([]);
    }
  }, [quote?.concrete_rows]);

  // ---- Debounce for persisting rows -----------------------------------------
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
    [setQuote]
  );

  const updateRow = useCallback(
    <K extends keyof ConcreteRow>(
      id: string,
      key: K,
      value: ConcreteRow[K]
    ) => {
      setRows((prev) => {
        const next = prev.map((r) =>
          r.id === id ? { ...r, [key]: value } : r
        );
        pushRowsDebounced(next);
        return next;
      });
    },
    [pushRowsDebounced]
  );

  const addRow = useCallback(() => {
    const newRow = makeDefaultRow();
    setRows((prev) => {
      const next = [...prev, newRow];
      setQuote((qPrev: any) => ({ ...qPrev, concrete_rows: next }));
      return next;
    });
  }, [makeDefaultRow, setQuote]);

  const removeRow = useCallback(
    (id: string) => {
      setRows((prev) => {
        const next = prev.filter((r) => r.id !== id);
        setQuote((qPrev: any) => ({ ...qPrev, concrete_rows: next }));
        return next;
      });
    },
    [setQuote]
  );

  // ---- Fetch materials with overrides + multipliers -------------------------
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
          (o) => o.material_id === material.id && o.region === userRegion
        );
        const materialP = (material.price || 0) * multiplier;
        const price = userRate ? userRate.price : materialP ?? 0;

        return {
          ...material,
          price,
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

  // ---- Use the new hook for calculations ------------------------------------
  const { results, totals, calculateConcreteRateForRow } =
    useConcreteCalculator(rows, materials, qsSettings);

  // Get material prices for display
  const cementMat = materials.find((m) => m.name?.toLowerCase() === "cement");
  const sandMat = materials.find((m) => m.name?.toLowerCase() === "sand");
  const ballastMat = materials.find((m) => m.name?.toLowerCase() === "ballast");
  const aggregateMat = materials.find(
    (m) => m.name?.toLowerCase() === "aggregate"
  );
  const formworkMat = materials.find(
    (m) => m.name?.toLowerCase() === "formwork"
  );
  const waterMat = materials.find((m) => m.name?.toLowerCase() === "water");

  // NEW: Get the price for the specific foundation masonry material used in the rows
  const foundationMasonryType =
    rows.find((r) => r.masonryBlockType?.toLocaleLowerCase())
      ?.masonryBlockType || "Standard Block";
  const foundationBlockPrice = useMasonryCalculator({
    setQuote,
    quote,
    materialBasePrices,
    userMaterialPrices,
    regionalMultipliers,
    userRegion,
    getEffectiveMaterialPrice,
  });
  const foundationBlockMat = foundationBlockPrice.getMaterialPrice(
    "Bricks",
    foundationMasonryType
  );

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

    const masonryPrice = foundationBlockMat;

    const lineItems = results.flatMap((r) => {
      const rowItems: any[] = [
        {
          rowId: r.id,
          name: `Cement (${r.name})`,
          quantity: r.grossCementBags,
          unit_price: 0, // Included in concrete rate
          total_price: 0,
        },
        {
          rowId: r.id,
          name: `Sand (${r.name})`,
          quantity: r.grossSandM3,
          unit_price: 0, // Included in concrete rate
          total_price: 0,
        },
        {
          rowId: r.id,
          name: `Ballast (${r.name})`,
          quantity: r.grossStoneM3,
          unit_price: 0, // Included in concrete rate
          total_price: 0,
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
          quantity: r.aggregateVolume,
          unit_price: aggregateMat?.price || 0,
          total_price: Math.round(
            r.aggregateVolume * (aggregateMat?.price || 0)
          ),
        },
      ];

      if (!qsSettings.clientProvidesWater) {
        rowItems.push({
          rowId: r.id,
          name: `Water (${r.name})`,
          quantity: r.grossWaterRequiredL,
          unit_price: 0, // Included in concrete rate
          total_price: 0,
        });
      }

      if (r.grossMortarCementBags > 0) {
        rowItems.push({
          rowId: r.id,
          name: `${r.name} - Mortar Cement`,
          quantity: r.grossMortarCementBags,
          unit_price: cementMat.price,
          total_price: Math.round(r.grossMortarCementBags * cementMat.price),
        });
        rowItems.push({
          rowId: r.id,
          name: `${r.name} - Mortar Sand`,
          quantity: r.grossMortarSandM3,
          unit_price: sandMat.price,
          total_price: Math.round(r.grossMortarSandM3 * sandMat.price),
        });
      }

      // Total rows
      rowItems.push({
        rowId: r.id,
        name: `Concrete Total`,
        rate: r.unitRate,
        quantity: Math.round(r.totalVolume),
        total_price: r.totalConcreteCost,
      });

      if (r.bedVolume > 0) {
        rowItems.push({
          rowId: r.id,
          name: `Bed Total`,
          rate: r.unitRate,
          quantity: Math.round(r.bedVolume),
          total_price: r.totalConcreteCost,
        });
      }

      const totalRowCost =
        r.totalConcreteCost +
        (r.grossTotalBlocks > 0
          ? Math.round(r.grossTotalBlocks * masonryPrice)
          : 0);

      rowItems.push({
        rowId: r.id,
        name: "Total items",
        quantity: Math.round(r.totalVolume),
        total_price: totalRowCost,
      });

      return rowItems;
    });

    // Totals Rows for the quote footer/summary
    const totalsRows = [
      {
        rowId: "totals",
        name: "Total Cement (Concrete + Mortar)",
        quantity: totals.cement + totals.mortarCementBags,
        unit_price: cementMat.price,
        total_price: Math.round(
          (totals.cement + totals.mortarCementBags) * cementMat.price
        ),
      },
      {
        rowId: "totals",
        name: "Total Sand (Concrete + Mortar)",
        quantity: totals.sand + totals.mortarSandM3,
        unit_price: sandMat.price,
        total_price: Math.round(
          (totals.sand + totals.mortarSandM3) * sandMat.price
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
        quantity: totals.aggregateVolume,
        unit_price: aggregateMat?.price || 0,
        total_price: Math.round(
          totals.aggregateVolume * (aggregateMat?.price || 0)
        ),
      },
      // NEW: Water totals
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
      ...(!masonryPrice
        ? [
            {
              rowId: "totals",
              name: `Total ${foundationMasonryType}`,
              quantity: totals.totalBlocks,
              unit_price: masonryPrice,
              total_price: Math.round(totals.totalBlocks * masonryPrice),
            },
          ]
        : []),
      {
        rowId: "totals",
        name: "Concrete Rate (Avg.)",
        quantity: 1,
        unit_price: Math.round(
          (totals.materialCost + totals.transportCost) / (totals.volume || 1)
        ),
        total_price: Math.round(
          (totals.materialCost + totals.transportCost) / (totals.volume || 1)
        ),
      },
      {
        rowId: "totals",
        name: "Concrete Total Cost",
        quantity: Math.round(totals.volume),
        unit_price: 0,
        total_price: Math.round(totals.materialCost + totals.transportCost),
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
    totals,
    setQuote,
    quote?.concrete_materials,
    rows,
    qsSettings,
    foundationBlockMat,
  ]);

  useEffect(() => {
    setQuote((prev: any) => ({ ...prev, qsSettings: qsSettings }));
  }, [user, qsSettings]);

  // Handler functions for qsSettings
  const handleQsSettingChange = (key: keyof QSSettings, value: any) => {
    updateQsSettings({
      ...qsSettings,
      [key]: value,
    });
  };

  const handleNumericQsSettingChange = (
    key: keyof QSSettings,
    value: string
  ) => {
    handleQsSettingChange(key, parseFloat(value) || 0);
  };

  const handleIntegerQsSettingChange = (
    key: keyof QSSettings,
    value: string
  ) => {
    handleQsSettingChange(key, parseInt(value) || 0);
  };

  // ---- UI -------------------------------------------------------------------
  return (
    <div className="mt-8 space-y-4 border dark:border-white/10 border-primary/30 p-3 rounded-lg">
      <h2 className="text-xl font-bold">Concrete & Foundation Calculator</h2>

      {/* Updated QS Settings section - now connected to quote */}
      <Card className="flex-1 gap-4 p-4 rounded-lg">
        <div className="space-y-2">
          <h2 className="font-semibold text-sm">Wastage Percentages</h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="wastage-cement">Cement (%)</Label>
              <Input
                id="wastage-cement"
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={qsSettings.wastageCementPercent}
                onChange={(e) =>
                  handleNumericQsSettingChange(
                    "wastageCementPercent",
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="wastage-sand">Sand (%)</Label>
              <Input
                id="wastage-sand"
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={qsSettings.wastageSandPercent}
                onChange={(e) =>
                  handleNumericQsSettingChange(
                    "wastageSandPercent",
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="wastage-stone">Ballast (%)</Label>
              <Input
                id="wastage-stone"
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={qsSettings.wastageStonePercent}
                onChange={(e) =>
                  handleNumericQsSettingChange(
                    "wastageStonePercent",
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="wastage-blocks">Blocks (%)</Label>
              <Input
                id="wastage-blocks"
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={qsSettings.wastageBlocksPercent}
                onChange={(e) =>
                  handleNumericQsSettingChange(
                    "wastageBlocksPercent",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-5">
          <h2 className="font-semibold text-sm">Water Settings</h2>
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Checkbox
                checked={qsSettings.clientProvidesWater}
                onCheckedChange={(checked) =>
                  handleQsSettingChange("clientProvidesWater", checked === true)
                }
              />
              <span>Client provides water</span>
            </Label>

            <div>
              <Label htmlFor="water-cement-ratio">Water-Cement Ratio</Label>
              <Input
                id="water-cement-ratio"
                type="number"
                step="0.05"
                min="0.4"
                max="0.6"
                value={qsSettings.cementWaterRatio}
                onChange={(e) =>
                  handleQsSettingChange("cementWaterRatio", e.target.value)
                }
              />
              <span className="text-xs text-gray-500">
                {qsSettings.cementWaterRatio}:1 (water:cement) - Typical:
                0.4-0.6
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="moisture-content">Aggregate Moisture (%)</Label>
                <Input
                  id="moisture-content"
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={qsSettings.aggregateMoistureContentPercent}
                  onChange={(e) =>
                    handleNumericQsSettingChange(
                      "aggregateMoistureContentPercent",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="absorption">Aggregate Absorption (%)</Label>
                <Input
                  id="absorption"
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={qsSettings.aggregateAbsorptionPercent}
                  onChange={(e) =>
                    handleNumericQsSettingChange(
                      "aggregateAbsorptionPercent",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="curing-rate">Curing Rate (L/m²/day)</Label>
                <Input
                  id="curing-rate"
                  type="number"
                  step="0.5"
                  min="0"
                  value={qsSettings.curingWaterRateLM2PerDay}
                  onChange={(e) =>
                    handleNumericQsSettingChange(
                      "curingWaterRateLM2PerDay",
                      e.target.value
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="curing-days">Curing Days</Label>
                <Input
                  id="curing-days"
                  type="number"
                  step="1"
                  min="0"
                  max="14"
                  value={qsSettings.curingDays}
                  onChange={(e) =>
                    handleIntegerQsSettingChange("curingDays", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="other-water">Other Water (L/m³)</Label>
              <Input
                id="other-water"
                type="number"
                step="1"
                min="0"
                value={qsSettings.otherSiteWaterAllowanceLM3}
                onChange={(e) =>
                  handleNumericQsSettingChange(
                    "otherSiteWaterAllowanceLM3",
                    e.target.value
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Masonry Settings */}
        <div className="space-y-2 mt-5">
          <h2 className="font-semibold text-sm">Masonry Settings</h2>
          <div>
            <Label htmlFor="joint-thickness">Mortar Joint Thickness (m)</Label>
            <Input
              id="joint-thickness"
              type="number"
              step="0.001"
              min="0.005"
              max="0.02"
              value={qsSettings.mortarJointThicknessM}
              onChange={(e) =>
                handleNumericQsSettingChange(
                  "mortarJointThicknessM",
                  e.target.value
                )
              }
            />
            <span className="text-xs text-gray-500">Typical: 0.01m (10mm)</span>
          </div>
        </div>
      </Card>

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
      {/* Show water price info even when contractor provides water */}
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
            {/* top row */}
            <div className="grid sm:grid-cols-4 gap-2">
              <Input
                type="text"
                value={row.name}
                onChange={(e) => updateRow(row.id, "name", e.target.value)}
                placeholder="Name (e.g. Slab 1)"
              />
              <Select
                value={row.element}
                onValueChange={(value) =>
                  updateRow(row.id, "element", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select element" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slab">Slab</SelectItem>
                  <SelectItem value="beam">Beam</SelectItem>
                  <SelectItem value="column">Column</SelectItem>
                  <SelectItem value="foundation">Foundation</SelectItem>
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

              <Button onClick={() => removeRow(row.id)} variant="destructive">
                <Trash className="w-4 h-4" />
              </Button>
            </div>

            {/* dimensions */}
            <div className="grid sm:grid-cols-4 gap-2">
              <Input
                type="number"
                value={row.length}
                onChange={(e) => updateRow(row.id, "length", e.target.value)}
                placeholder={
                  row.element === "foundation"
                    ? "Total Perimeter (m)"
                    : "Length (m)"
                }
              />
              <Input
                type="number"
                value={row.width}
                onChange={(e) => updateRow(row.id, "width", e.target.value)}
                placeholder={
                  row.element === "foundation"
                    ? "Footing Width (m)"
                    : "Width (m)"
                }
              />
              <Input
                type="number"
                value={row.height}
                step="0.1"
                onChange={(e) => updateRow(row.id, "height", e.target.value)}
                placeholder={
                  row.element === "foundation"
                    ? "Footing Height (m)"
                    : "Height/Thickness (m)"
                }
              />
              <Input
                type="number"
                value={row.number}
                step="1"
                min="1"
                defaultValue="1"
                onChange={(e) => updateRow(row.id, "number", e.target.value)}
                placeholder="Number of items"
              />
            </div>

            {row.element === "foundation" && (
              <div className="space-y-4">
                {/* Concrete Bed */}
                <div className="grid sm:grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`bed-${row.id}`}
                      checked={row.hasConcreteBed || false}
                      onCheckedChange={(checked) =>
                        updateRow(row.id, "hasConcreteBed", checked === true)
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`bed-${row.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Include Concrete Bed (Blinding)
                    </Label>
                  </div>

                  {row.hasConcreteBed && (
                    <Input
                      type="number"
                      value={row.bedDepth || ""}
                      onChange={(e) =>
                        updateRow(row.id, "bedDepth", e.target.value)
                      }
                      placeholder="Concrete bed depth (m)"
                      step="0.05"
                      min="0.05"
                      max="0.3"
                    />
                  )}
                </div>

                {/* Aggregate Bed */}
                <div className="grid sm:grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`aggregate-${row.id}`}
                      checked={row.hasAggregateBed || false}
                      onCheckedChange={(checked) =>
                        updateRow(row.id, "hasAggregateBed", checked === true)
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`aggregate-${row.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Include Aggregate Bed
                    </Label>
                  </div>

                  {row.hasAggregateBed && (
                    <Input
                      type="number"
                      value={row.aggregateDepth || ""}
                      onChange={(e) =>
                        updateRow(row.id, "aggregateDepth", e.target.value)
                      }
                      placeholder="Aggregate depth (m)"
                      step="0.05"
                      min="0.05"
                      max="0.3"
                    />
                  )}
                </div>

                {/* Masonry Wall Section */}
                <div className="grid sm:grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`masonry-${row.id}`}
                      checked={row.hasMasonryWall || false}
                      onCheckedChange={(checked) =>
                        updateRow(row.id, "hasMasonryWall", checked === true)
                      }
                      className="w-4 h-4"
                    />
                    <Label
                      htmlFor={`masonry-${row.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      Include Masonry Wall (Blocks/Stone)
                    </Label>
                  </div>

                  {row.hasMasonryWall && (
                    <>
                      <Select
                        value={row.masonryBlockType}
                        onValueChange={(value) =>
                          updateRow(row.id, "masonryBlockType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Block/Stone Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard Block">
                            Standard Block
                          </SelectItem>
                          <SelectItem value="Rubble Stone">
                            Rubble Stone
                          </SelectItem>
                          <SelectItem value="Dressed Stone">
                            Dressed Stone
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="text"
                        value={row.masonryBlockDimensions || "0.4x0.2x0.2"}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "masonryBlockDimensions",
                            e.target.value
                          )
                        }
                        placeholder="Block Dimensions (LxWxH in m)"
                      />
                      <Input
                        type="number"
                        value={row.masonryWallThickness || ""}
                        onChange={(e) =>
                          updateRow(
                            row.id,
                            "masonryWallThickness",
                            e.target.value
                          )
                        }
                        placeholder="Wall Thickness (m, e.g., 0.2)"
                        step="0.05"
                        min="0.1"
                      />
                      <Input
                        type="number"
                        value={row.masonryWallHeight || ""}
                        onChange={(e) =>
                          updateRow(row.id, "masonryWallHeight", e.target.value)
                        }
                        placeholder="Wall Height (m, e.g., 1.0)"
                        step="0.1"
                        min="0.1"
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            <Input
              type="text"
              value={row.mix}
              onChange={(e) => updateRow(row.id, "mix", e.target.value)}
              placeholder="Concrete Mix ratio (e.g. 1:2:4)"
            />

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

                {/* Foundation Workings */}
                {result.element === "foundation" && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <h4 className="font-semibold mb-2">Foundation Workings:</h4>

                    {result.bedVolume > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold">
                          Concrete Bed Workings:
                        </h4>
                        <p>
                          <b>Bed Area:</b> {result.bedArea?.toFixed(2)} m²
                        </p>
                        <p>
                          <b>Bed Volume:</b> {result.bedVolume?.toFixed(2)} m³
                        </p>
                        <p>
                          <b>Bed Cost:</b> Ksh{" "}
                          {Math.round(
                            result.bedVolume * calculateConcreteRateForRow(row)
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {result.aggregateVolume > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold">
                          Aggregate Bed Workings:
                        </h4>
                        <p>
                          <b>Aggregate Area:</b>{" "}
                          {result.aggregateArea?.toFixed(2)} m²
                        </p>
                        <p>
                          <b>Aggregate Volume:</b>{" "}
                          {result.aggregateVolume?.toFixed(2)} m³
                        </p>
                        <p>
                          <b>Aggregate Cost:</b> Ksh{" "}
                          {Math.round(
                            result.aggregateVolume * (aggregateMat?.price || 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* Masonry Wall Workings */}
                    {result.grossTotalBlocks > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold">
                          Masonry Wall Workings:
                        </h4>
                        <p>
                          <b>Blocks/Stones:</b>{" "}
                          {Math.ceil(result.grossTotalBlocks).toLocaleString()}{" "}
                          units
                        </p>
                        <p>
                          <b>Mortar Cement:</b>{" "}
                          {result.grossMortarCementBags?.toFixed(1)} bags
                        </p>
                        <p>
                          <b>Mortar Sand:</b>{" "}
                          {result.grossMortarSandM3?.toFixed(2)} m³
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Material Breakdown */}
                <div className="mt-2">
                  <h4 className="font-semibold">Material Breakdown:</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                    (Cement, sand, ballast, water, formwork, aggregate are
                    included in the concrete rate)
                  </p>
                  <p>
                    <b>Cement:</b> {result.netCementBags.toFixed(1)} bags (net)
                    → {result.grossCementBags.toFixed(1)} bags (gross) —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.grossCementBags * (cementMat?.price || 0)
                      ).toLocaleString()}
                    </b>
                  </p>
                  <p>
                    <b>Sand:</b> {result.netSandM3.toFixed(2)} m³ (net) →{" "}
                    {result.grossSandM3.toFixed(2)} m³ (gross) —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.grossSandM3 * (sandMat?.price || 0)
                      ).toLocaleString()}
                    </b>
                  </p>
                  <p>
                    <b>Ballast:</b> {result.netStoneM3.toFixed(2)} m³ (net) →{" "}
                    {result.grossStoneM3.toFixed(2)} m³ (gross) —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.grossStoneM3 * (ballastMat?.price || 0)
                      ).toLocaleString()}
                    </b>
                  </p>
                  <p>
                    <b>Formwork:</b> {result.formworkM2.toFixed(2)} m² —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.formworkM2 * (formworkMat?.price || 0)
                      ).toLocaleString()}
                    </b>
                  </p>

                  {/* NEW: Water breakdown */}
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

                  {/* Water breakdown details */}
                  <div className="ml-4 mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
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

                  {/* Masonry Breakdown */}
                  {result.grossTotalBlocks > 0 && (
                    <>
                      <p>
                        <b>{row.masonryBlockType || "Blocks"}:</b>{" "}
                        {Math.ceil(result.netTotalBlocks || 0).toLocaleString()}{" "}
                        units (net) →{" "}
                        {Math.ceil(
                          result.grossTotalBlocks || 0
                        ).toLocaleString()}{" "}
                        units (gross) —{" "}
                        <b>
                          Ksh{" "}
                          {Math.round(
                            result.grossTotalBlocks * (foundationBlockMat || 0)
                          ).toLocaleString()}
                        </b>
                      </p>
                      <p>
                        <b>Mortar Cement:</b>{" "}
                        {result.netMortarCementBags?.toFixed(1)} bags (net) →{" "}
                        {result.grossMortarCementBags?.toFixed(1)} bags (gross)
                        —{" "}
                        <b>
                          Ksh{" "}
                          {Math.round(
                            result.grossMortarCementBags *
                              (cementMat?.price || 0)
                          ).toLocaleString()}
                        </b>
                      </p>
                      <p>
                        <b>Mortar Sand:</b> {result.netMortarSandM3?.toFixed(2)}{" "}
                        m³ (net) → {result.grossMortarSandM3?.toFixed(2)} m³
                        (gross) —{" "}
                        <b>
                          Ksh{" "}
                          {Math.round(
                            result.grossMortarSandM3 * (sandMat?.price || 0)
                          ).toLocaleString()}
                        </b>
                      </p>
                    </>
                  )}

                  {/* Cost breakdown */}
                  <div className="ml-4 mt-1 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                    <p>
                      <b>Cost Breakdown:</b>
                    </p>
                    <p>
                      • Material Cost: Ksh{" "}
                      {Math.round(result.materialCost || 0).toLocaleString()}
                    </p>
                    <p>
                      • Total Cost: Ksh{" "}
                      {Math.round(
                        result.totalConcreteCost || 0
                      ).toLocaleString()}
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
              totals?.cement * (cementMat?.price || 0)
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
              totals.stone * (ballastMat?.price || 0)
            ).toLocaleString()}
          </b>
        </p>
        <p>
          <b>Total Formwork:</b> {totals.formworkM2?.toFixed(2)} m² —{" "}
          <b>
            Ksh{" "}
            {Math.round(
              totals.formworkM2 * (formworkMat?.price || 0)
            ).toLocaleString()}
          </b>
        </p>

        {/* NEW: Water in totals */}
        {!qsSettings.clientProvidesWater && totals.waterCost > 0 && (
          <p>
            <b>Total Water:</b> {totals.waterRequired?.toFixed(0)} liters —{" "}
            <b>Ksh {Math.round(totals.waterCost || 0).toLocaleString()}</b>
          </p>
        )}

        {/* Masonry Totals */}
        {totals.totalBlocks > 0 && (
          <>
            <p>
              <b>Total {foundationMasonryType}:</b>{" "}
              {Math.ceil(totals.totalBlocks).toLocaleString()} units —{" "}
              <b>
                Ksh{" "}
                {Math.round(
                  totals.totalBlocks * (foundationBlockMat || 0)
                ).toLocaleString()}
              </b>
            </p>
            <p>
              <b>Total Mortar Cement:</b> {totals.mortarCementBags.toFixed(1)}{" "}
              bags —{" "}
              <b>
                Ksh{" "}
                {Math.round(
                  totals.mortarCementBags * (cementMat?.price || 0)
                ).toLocaleString()}
              </b>
            </p>
            <p>
              <b>Total Mortar Sand:</b> {totals.mortarSandM3.toFixed(2)} m³ —{" "}
              <b>
                Ksh{" "}
                {Math.round(
                  totals.mortarSandM3 * (sandMat?.price || 0)
                ).toLocaleString()}
              </b>
            </p>
          </>
        )}

        {/* Cost breakdown in totals */}
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
