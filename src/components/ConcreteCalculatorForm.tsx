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
  ConcreteResult,
  calculateConcreteRate,
  getConcreteUnitBreakdown,
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

interface Props {
  quote: any;
  setQuote: (updater: (prev: any) => any) => void | ((next: any) => void);
}

export default function ConcreteCalculatorForm({ quote, setQuote }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const { user, profile } = useAuth();
  const [regionalMultipliers, setRegionalMultipliers] = useState<
    RegionalMultiplier[]
  >([]);

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

  // ---- Calculate results ----------------------------------------------------
  const cementMat = materials.find((m) => m.name?.toLowerCase() === "cement");
  const sandMat = materials.find((m) => m.name?.toLowerCase() === "sand");
  const ballastMat = materials.find((m) => m.name?.toLowerCase() === "ballast");
  const aggregateMat = materials.find(
    (m) => m.name?.toLowerCase() === "aggregate"
  );
  const formworkMat = materials.find(
    (m) => m.name?.toLowerCase() === "formwork"
  );

  const calculateConcreteRateForRow = (row: ConcreteRow): number => {
    if (!cementMat || !sandMat || !ballastMat) return 0;

    return calculateConcreteRate(
      row.mix,
      cementMat.price,
      sandMat.price,
      ballastMat.price
    );
  };

  const results: ConcreteResult[] = useMemo(() => {
    if (!cementMat || !sandMat || !ballastMat)
      return rows.map((r) => calculateConcrete(r));

    return rows.map((row) => {
      const result = calculateConcrete(row);

      // add concrete unit rate + total cost
      const unit = getConcreteUnitBreakdown(row.mix);
      const ratePerM3 = calculateConcreteRateForRow(row);

      return {
        ...result,
        unitRate: ratePerM3,
        totalConcreteCost: Math.round(ratePerM3 * result.volumeM3),
      };
    });
  }, [rows, cementMat, sandMat, ballastMat]);

  // ---- Totals ---------------------------------------------------------------
  const totals = results.reduce(
    (acc, r) => {
      acc.volume += r.totalVolume;
      acc.cement += r.cementBags;
      acc.sand += r.sandM3;
      acc.stone += r.stoneM3;
      acc.formworkM2 += r.formworkM2;
      acc.bedVolume += r.bedVolume || 0;
      acc.bedArea += r.bedArea || 0;
      acc.aggregateVolume += r.aggregateVolume || 0;
      acc.aggregateArea += r.aggregateArea || 0;
      return acc;
    },
    {
      volume: 0,
      cement: 0,
      sand: 0,
      stone: 0,
      formworkM2: 0,
      bedVolume: 0,
      bedArea: 0,
      aggregateVolume: 0,
      aggregateArea: 0,
    }
  );

  // ---- Build line items into quote.concrete_materials -----------------------
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

    const lineItems = results.flatMap((r) => [
      {
        rowId: r.id,
        name: `Cement (${r.name})`,
        quantity: r.cementBags,
        unit_price: cementMat.price,
        total_price: Math.round(r.cementBags * cementMat.price),
      },
      {
        rowId: r.id,
        name: `Sand (${r.name})`,
        quantity: r.sandM3,
        unit_price: sandMat.price,
        total_price: Math.round(r.sandM3 * sandMat.price),
      },
      {
        rowId: r.id,
        name: `Ballast (${r.name})`,
        quantity: r.stoneM3,
        unit_price: ballastMat.price,
        total_price: Math.round(r.stoneM3 * ballastMat.price),
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
        total_price: Math.round(r.aggregateVolume * (aggregateMat?.price || 0)),
      },
      {
        rowId: r.id,
        name: `Concrete Total`,
        rate: r.unitRate,
        quantity: Math.round(r.volumeM3),
        total_price: r.totalConcreteCost,
      },
      {
        rowId: r.id,
        name: "Total items",
        quantity: Math.round(r.volumeM3),
        total_price:
          Math.round(r.formworkM2 * (formworkMat?.price || 0)) +
          Math.round(r.stoneM3 * ballastMat.price) +
          Math.round(r.sandM3 * sandMat.price) +
          Math.round(r.aggregateVolume * (aggregateMat?.price || 0)) +
          Math.round(r.cementBags * cementMat.price),
      },
    ]);

    const totalsRows = [
      {
        rowId: "totals",
        name: "Total Cement",
        quantity: totals.cement,
        unit_price: cementMat.price,
        total_price: Math.round(totals.cement * cementMat.price),
      },
      {
        rowId: "totals",
        name: "Total Sand",
        quantity: totals.sand,
        unit_price: sandMat.price,
        total_price: Math.round(totals.sand * sandMat.price),
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
      {
        rowId: "totals",
        name: "Concrete Rate",
        quantity: 1,
        unit_price: Math.round(
          (totals.cement * cementMat.price +
            totals.sand * sandMat.price +
            totals.stone * ballastMat.price) /
            (totals.volume || 1)
        ),
        total_price: Math.round(
          (totals.cement * cementMat.price +
            totals.sand * sandMat.price +
            totals.stone * ballastMat.price) /
            (totals.volume || 1)
        ),
      },
      {
        rowId: "totals",
        name: "Concrete Total",
        quantity: Math.round(totals.volume),
        unit_price: 0,
        total_price: Math.round(
          totals.cement * cementMat.price +
            totals.sand * sandMat.price +
            totals.stone * ballastMat.price
        ),
      },
      {
        rowId: "totals",
        name: "Grand Total",
        quantity: rows[0]?.number || 1,
        total_price: Math.round(
          totals.cement * cementMat.price +
            totals.sand * sandMat.price +
            totals.stone * ballastMat.price +
            totals.aggregateVolume * (aggregateMat?.price || 0) +
            totals.formworkM2 * (formworkMat?.price || 0)
        ),
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
    totals,
    setQuote,
    quote?.concrete_materials,
    rows,
  ]);

  // ---- UI -------------------------------------------------------------------
  return (
    <div className="mt-8 space-y-4 border dark:border-white/10 border-primary/30 p-3 rounded-lg">
      <h2 className="text-xl font-bold">Concrete Calculator</h2>

      {rows.length === 0 && <p>No elements yet. Add an item below</p>}

      {rows.map((row) => {
        const result = results.find((r) => r.id === row.id);
        return (
          <div
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
                placeholder="Length (m)"
              />
              <Input
                type="number"
                value={row.width}
                onChange={(e) => updateRow(row.id, "width", e.target.value)}
                placeholder="Width (m)"
              />
              <Input
                type="number"
                value={row.height}
                step="0.1"
                onChange={(e) => updateRow(row.id, "height", e.target.value)}
                placeholder="Height/Thickness (m)"
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
              <div className="grid sm:grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                {/* Concrete Bed */}
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
                    Include Concrete Bed
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

                {/* Aggregate Bed */}
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
            )}

            <Input
              type="text"
              value={row.mix}
              onChange={(e) => updateRow(row.id, "mix", e.target.value)}
              placeholder="Mix ratio (e.g. 1:2:4)"
            />

            {result && (
              <div className="mt-2 text-sm">
                <p>
                  <b>Volume:</b> {result.totalVolume.toFixed(2)} m³
                </p>
                <p>
                  <b>Concrete Rate:</b> Ksh{" "}
                  {calculateConcreteRateForRow(row).toLocaleString()}/m³
                </p>
                <p>
                  <b>Concrete Cost:</b> Ksh{" "}
                  {Math.round(
                    result.totalVolume * calculateConcreteRateForRow(row)
                  ).toLocaleString()}
                </p>

                {/* Foundation Workings */}
                {result.element === "foundation" && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <h4 className="font-semibold mb-2">Foundation Workings:</h4>
                    <p>
                      <b>Main Volume:</b> {result.volumeM3.toFixed(2)} m³
                    </p>
                    <p>
                      <b>Main Cost:</b> Ksh{" "}
                      {Math.round(
                        result.volumeM3 * calculateConcreteRateForRow(row)
                      ).toLocaleString()}
                    </p>

                    {result.bedVolume > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold">
                          Concrete Bed Workings:
                        </h4>
                        <p>
                          <b>Bed Area:</b> {result.bedArea.toFixed(2)} m²
                        </p>
                        <p>
                          <b>Bed Volume:</b> {result.bedVolume.toFixed(2)} m³
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
                          {result.aggregateArea.toFixed(2)} m²
                        </p>
                        <p>
                          <b>Aggregate Volume:</b>{" "}
                          {result.aggregateVolume.toFixed(2)} m³
                        </p>
                        <p>
                          <b>Aggregate Cost:</b> Ksh{" "}
                          {Math.round(
                            result.aggregateVolume * (aggregateMat?.price || 0)
                          ).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Material Breakdown */}
                <div className="mt-2">
                  <h4 className="font-semibold">Material Breakdown:</h4>
                  <p>
                    <b>Cement:</b> {result.cementBags.toFixed(1)} bags —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(result.cementBags * (cementMat?.price || 0))}
                    </b>
                  </p>
                  <p>
                    <b>Sand:</b> {result.sandM3.toFixed(2)} m³ —{" "}
                    <b>
                      Ksh {Math.round(result.sandM3 * (sandMat?.price || 0))}
                    </b>
                  </p>
                  <p>
                    <b>Ballast:</b> {result.stoneM3.toFixed(2)} m³ —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(result.stoneM3 * (ballastMat?.price || 0))}
                    </b>
                  </p>
                  <p>
                    <b>Formwork:</b> {result.formworkM2.toFixed(2)} m² —{" "}
                    <b>
                      Ksh{" "}
                      {Math.round(
                        result.formworkM2 * (formworkMat?.price || 0)
                      )}
                    </b>
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button onClick={addRow} className="px-4 py-2 text-white">
        + Add Element
      </Button>

      <div className="p-4 border rounded-lg mt-4">
        <h3 className="font-bold">Totals</h3>
        <p>
          <b>Total Volume:</b> {totals.volume.toFixed(2)} m³
        </p>
        <p>
          <b>Total Cement:</b> {totals.cement.toFixed(1)} bags —{" "}
          <b>Ksh {Math.round(totals.cement * (cementMat?.price || 0))}</b>
        </p>
        <p>
          <b>Total Sand:</b> {totals.sand.toFixed(2)} m³ —{" "}
          <b>Ksh {Math.round(totals.sand * (sandMat?.price || 0))}</b>
        </p>
        <p>
          <b>Total Ballast:</b> {totals.stone.toFixed(2)} m³ —{" "}
          <b>Ksh {Math.round(totals.stone * (ballastMat?.price || 0))}</b>
        </p>
        <p>
          <b>Total Formwork:</b> {totals.formworkM2.toFixed(2)} m³ —{" "}
          <b>Ksh {Math.round(totals.formworkM2 * (formworkMat?.price || 0))}</b>
        </p>
      </div>
    </div>
  );
}
