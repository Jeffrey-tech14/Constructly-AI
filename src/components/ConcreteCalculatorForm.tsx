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

  // ---- Load regional multipliers (unchanged) --------------------------------
  useEffect(() => {
    const loadMultipliers = async () => {
      const { data } = await supabase.from("regional_multipliers").select("*");
      if (data) setRegionalMultipliers(data);
    };
    loadMultipliers();
  }, []);

  // ---- Make a new empty element row (unchanged) ------------------------------
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

  // ---- Local UI state for rows (so typing is instant) ------------------------
  const [rows, setRows] = useState<ConcreteRow[]>([]);

  // Hydrate local rows from quote.concrete_rows when it changes (e.g. load)
  useEffect(() => {
    if (Array.isArray(quote?.concrete_rows)) {
      setRows(quote.concrete_rows);
    } else {
      setRows([]);
    }
  }, [quote?.concrete_rows]);

  // ---- Debounce for persisting rows to parent/DB -----------------------------
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const DEBOUNCE_MS = 500;

  const pushRowsDebounced = useCallback(
    (nextRows: ConcreteRow[]) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setQuote((prev: any) => {
          // only update parent if changed
          const prevStr = JSON.stringify(prev?.concrete_rows ?? []);
          const nextStr = JSON.stringify(nextRows);
          if (prevStr === nextStr) return prev;
          return { ...prev, concrete_rows: nextRows };
        });
      }, DEBOUNCE_MS);
    },
    [setQuote]
  );

  // ---- Row CRUD (keep UI responsive + debounced persist) ---------------------
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
      // Add/remove: sync immediately (no debounce)
      setQuote((qPrev: any) => ({ ...qPrev, concrete_rows: next }));
      return next;
    });
  }, [makeDefaultRow, setQuote]);

  const removeRow = useCallback(
    (id: string) => {
      setRows((prev) => {
        const next = prev.filter((r) => r.id !== id);
        // Add/remove: sync immediately (no debounce)
        setQuote((qPrev: any) => ({ ...qPrev, concrete_rows: next }));
        return next;
      });
    },
    [setQuote]
  );

  // ---- Calculate results from local rows (unchanged) -------------------------
  const results: ConcreteResult[] = useMemo(
    () => rows.map((r) => calculateConcrete(r)),
    [rows]
  );

  // ---- Fetch materials with overrides + multipliers (unchanged) -------------
  const fetchMaterials = useCallback(async () => {
    if (!profile?.id) return;

    const { data: baseMaterials, error: baseError } = await supabase
      .from("material_base_prices")
      .select("*");

    const { data: overrides, error: overrideError } = await supabase
      .from("user_material_prices")
      .select("material_id, region, price")
      .eq("user_id", profile.id);

    if (baseError) console.error("Base materials error:", baseError);
    if (overrideError) console.error("Overrides error:", overrideError);

    const merged =
      baseMaterials?.map((material) => {
        const userRegion = profile?.location || "Nairobi";
        const userRate = overrides?.find(
          (o) => o.material_id === material.id && o.region === userRegion
        );
        const multiplier =
          regionalMultipliers.find((r) => r.region === userRegion)
            ?.multiplier || 1;
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

  // ---- Totals (unchanged) ---------------------------------------------------
  const totals = results.reduce(
    (acc, r) => {
      acc.volume += r.totalVolume;
      acc.cement += r.cementBags;
      acc.sand += r.sandM3;
      acc.stone += r.stoneM3;
      acc.formworkM2 += r.formworkM2;
      return acc;
    },
    { volume: 0, cement: 0, sand: 0, stone: 0, formworkM2: 0 }
  );

  const cementMat = materials.find((m) => m.name?.toLowerCase() === "cement");
  const sandMat = materials.find((m) => m.name?.toLowerCase() === "sand");
  const ballastMat = materials.find((m) => m.name?.toLowerCase() === "ballast");
  const formworkMat = materials.find(
    (m) => m.name?.toLowerCase() === "formwork"
  );

  // ---- Build line items into quote.concrete_materials (guarded to avoid loop)
  useEffect(() => {
    if (!cementMat || !sandMat || !ballastMat) return;
    if (results.length === 0) {
      // If no rows, clear materials only if currently set
      const hasItems =
        Array.isArray(quote?.concrete_materials) &&
        quote.concrete_materials.length;
      if (hasItems) {
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
        name: "Total items",
        quantity: Math.round(r.volumeM3),
        unit_price: Math.round(
          (Math.round(r.formworkM2 * (formworkMat?.price || 0)) +
            Math.round(r.stoneM3 * ballastMat.price) +
            Math.round(r.sandM3 * sandMat.price) +
            Math.round(r.cementBags * cementMat.price)) /
            r.totalVolume
        ),
        total_price:
          Math.round(r.formworkM2 * (formworkMat?.price || 0)) +
          Math.round(r.stoneM3 * ballastMat.price) +
          Math.round(r.sandM3 * sandMat.price) +
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
        name: "Grand Total",
        quantity: rows[0].number || 1,
        unit_price: Math.round(
          cementMat.price +
            sandMat.price +
            totals.stone * ballastMat.price +
            totals.formworkM2 * formworkMat.price
        ),
        total_price: Math.round(
          totals.cement * cementMat.price +
            totals.sand * sandMat.price +
            totals.stone * ballastMat.price +
            totals.formworkM2 * formworkMat.price
        ),
      },
    ];

    const nextItems = [...lineItems, ...totalsRows];

    // Only write if changed to prevent render→effect→setQuote loops
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
    totals,
    setQuote,
    quote?.concrete_materials,
  ]);

  // ---- UI (kept as-is) ------------------------------------------------------
  return (
    <div className="mt-8 space-y-4 border dark:border-white/10 border-primary/30 p-3 rounded-lg">
      <h2 className="text-xl font-bold">Concrete Calculator</h2>

      {rows.length === 0 && <p>No elements yet. Add an item below</p>}

      {rows.map((row) => {
        const result = results.find((r) => r.id === row.id);
        return (
          <div key={row.id} className="p-4 border rounded-lg space-y-2">
            <div className="flex gap-2">
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

            <div className="grid grid-cols-4 gap-2">
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
                  <b>Cement:</b> {result.cementBags.toFixed(1)} bags —{" "}
                  <b>
                    Ksh{" "}
                    {Math.round(result.cementBags * (cementMat?.price || 0))}
                  </b>
                </p>
                <p>
                  <b>Sand:</b> {result.sandM3.toFixed(2)} m³ —{" "}
                  <b>Ksh {Math.round(result.sandM3 * (sandMat?.price || 0))}</b>
                </p>
                <p>
                  <b>Ballast:</b> {result.stoneM3.toFixed(2)} m³ —{" "}
                  <b>
                    Ksh {Math.round(result.stoneM3 * (ballastMat?.price || 0))}
                  </b>
                </p>
                <p>
                  <b>Formwork:</b> {result.formworkM2.toFixed(2)} m³ —{" "}
                  <b>
                    Ksh{" "}
                    {Math.round(result.formworkM2 * (formworkMat?.price || 0))}
                  </b>
                </p>
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
