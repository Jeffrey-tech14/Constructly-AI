import React, { useEffect, useMemo, useState } from "react";
import {
  calculateRebar,
  CalcInput,
  ElementTypes,
  RebarSize,
  RebarRow,
  createSnapshot,
  useRebarPrices,
} from "@/hooks/useRebarCalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  quote: any;
  setQuote: any;
  onExport?: (snapshotJson: string) => void;
  initialRows?: RebarRow[];
}
const sizeOptions: RebarSize[] = ["Y8", "Y10", "Y12", "Y16", "Y20", "Y25"];

const makeDefaultRow = (): RebarRow => ({
  id: Date.now(),
  element: "slab",
  length: undefined,
  width: undefined,
  depth: undefined,
  columnHeight: undefined,

  barSpacing: undefined,
  meshXSpacing: undefined,
  meshYSpacing: undefined,
  stirrupSpacing: undefined,
  tieSpacing: undefined,

  longitudinalBars: undefined,
  verticalBars: undefined,

  slabLayers: undefined,

  primaryBarSize: undefined,
  meshXSize: undefined,
  meshYSize: undefined,
  stirrupSize: undefined,
  tieSize: undefined,

  devLenFactorDLong: undefined,
  devLenFactorDVert: undefined,
  hookFactorDStirrups: undefined,
  hookFactorDTies: undefined,

  wastagePercent: undefined,
});

function validateRow(row: RebarRow): string[] {
  const errs: string[] = [];
  if (!row.length  || parseFloat(row.length) <= 0) errs.push("Length must be > 0");
  if (!row.width  || parseFloat(row.width) <= 0) errs.push("Width must be > 0");
  if (!row.depth || parseFloat(row.depth) <= 0) errs.push("Thickness/Depth must be > 0");
  if ((row.element === "column" ? (parseFloat(row.columnHeight) ?? parseFloat(row.length)) : parseFloat(row.length)) <= 0) {
    errs.push("Primary dimension must be > 0");
  }
  const isPosInt = (v?: number) => v !== undefined && Number.isFinite(v) && v > 0;
  if ((row.element === "slab" || row.element === "foundation")) {
    if (!isPosInt(parseFloat(row.barSpacing))) errs.push("Bar spacing must be a positive number (mm)");
    if (row.slabLayers && (parseFloat(row.slabLayers) < 1 || parseFloat(row.slabLayers) > 4)) errs.push("Slab layers must be between 1 and 4");
  }
  if (row.element === "beam") {
    if (!isPosInt(parseFloat(row.stirrupSpacing))) errs.push("Stirrup spacing must be positive (mm)");
    if (!isPosInt(parseFloat(row.longitudinalBars))) errs.push("Longitudinal bars must be positive");
  }
  if (row.element === "column") {
    if (!isPosInt(parseFloat(row.tieSpacing))) errs.push("Tie spacing must be positive (mm)");
    if (!isPosInt(parseFloat(row.verticalBars))) errs.push("Vertical bars must be positive");
  }
  if (row.wastagePercent !== undefined && row.wastagePercent < 0) errs.push("Wastage cannot be negative");
  return errs;
}

export default function RebarCalculatorForm({ 
  quote, 
  setQuote, 
  onExport, 
}: Props) {
  const rows = quote?.rebar_rows || ([]);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const { profile } = useAuth();

  const update = <K extends keyof RebarRow>(id: number, key: K, value: RebarRow[K]) =>
    setQuote(prev => ({
        ...prev,
        rebar_rows: prev.rebar_rows.map(r => 
        r.id === id ? { ...r, [key]: value } : r
        )
  }));

    const addRow = () => 
      setQuote(prev => ({
        ...prev,
        rebar_rows: [
        ...(prev.rebar_rows || []),
        makeDefaultRow()
        ]
    }));

    const removeRow = (id: number) =>
      setQuote(prev => ({
        ...prev,
        rebar_rows: prev.rebar_rows.filter(r => r.id !== id)
    }));

  const prices = useRebarPrices(profile.location)

  const results = useMemo(() => rows.map(r => ({ id: r.id, result: calculateRebar(r, prices), errors: validateRow(r) })), [rows, prices]);

  useEffect(() => {
  if (!results) return;

  // Strip down to only result
  const onlyResults = results.map(r => r.result);

  setQuote(prev => ({
    ...prev,
    rebar_calculations: onlyResults,
  }));
}, [results, setQuote]);


  const grand = useMemo(() => {
  return results.reduce(
    (acc, { result, errors }) => {
      if (errors.length === 0) {
        acc.length += result.totalLengthM;
        acc.weight += result.totalWeightKg;
        acc.price += result.totalPrice;   // ✅ sum, not overwrite
      }
      return acc;
    },
    { length: 0, weight: 0, price: 0 }   // ✅ also init price = 0
  );
}, [results]);


  const exportJSON = () => {
    const snapshot = createSnapshot(rows);
    const json = JSON.stringify(snapshot, null, 2);
    if (onExport) onExport(json);
    else console.log("Rebar Project Snapshot:", json);

    console.log(JSON.stringify(results))
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center gap-3">
        <Button className="text-white" onClick={addRow}>➕ Add New</Button>
        <Button variant="secondary" className="text-white" onClick={() => setShowAdvanced(v => !v)}>
          {showAdvanced ? "Hide Advanced" : "Show Advanced"}
        </Button>
        {/* <Button variant="outline" onClick={exportJSON}>Export JSON</Button> */}
        <div className="ml-auto text-right">
          <div className="font-semibold">Grand Total</div>
          <div>Length: {grand.length.toFixed(2)} m</div>
          <div>Weight: {grand.weight.toFixed(2)} kg</div>
          <div>Total: Ksh {Math.round(grand.price)}</div>
        </div>
      </div>

      {/* Rows */}

      {rows.length === 0 && (
        <p>No elements yet. Add an item below</p>
       )}

      {rows.map((row, i) => {
        const { result, errors } = results[i];

        return (
          <div key={row.id} className="p-4 border rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Calculation #{i + 1}</h3>
              <Button variant="destructive" size="sm" onClick={() => removeRow(row.id)}>Remove</Button>
            </div>

            {/* Element */}
            <Label className="block">
              Element
              <Select value={row.element} onValueChange={(v) => update(row.id, "element", v as ElementTypes)}>
                <SelectTrigger><SelectValue placeholder="Element" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="slab">Slab</SelectItem>
                  <SelectItem value="beam">Beam</SelectItem>
                  <SelectItem value="column">Column</SelectItem>
                  <SelectItem value="foundation">Foundation</SelectItem>
                </SelectContent>
              </Select>
            </Label>

            {/* Geometry */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Label>
                {row.element === "column" ? "Column Height (m)" :
                 row.element === "beam"   ? "Beam Length / Span (m)" : "Length (m)"}
                <Input type="number" min="0.01" step="0.01" value={row.length} placeholder="eg 10"
                  onChange={(e) => update(row.id, "length", e.target.value )} />
              </Label>

              <Label>
                {row.element === "slab" || row.element === "foundation" ? "Width (m)" : "Section Width b (m)"}
                <Input type="number" min="0.01" step="0.01" value={row.width} placeholder="eg 10"
                  onChange={(e) => update(row.id, "width", e.target.value )} />
              </Label>

              <Label>
                {row.element === "slab" || row.element === "foundation" ? "Thickness (m)" : "Section Depth h (m)"}
                <Input type="number" min="0.01" step="0.01" value={row.depth} placeholder="eg 10"
                  onChange={(e) => update(row.id, "depth", e.target.value)} />
              </Label>

              <Label>
                Wastage (%)
                <Input type="number" min="0" step="0.5" value={row.wastagePercent || 0}
                  onChange={(e) => update(row.id, "wastagePercent", parseInt(e.target.value))} />
              </Label>
            </div>

            {/* Spacing & Counts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(row.element === "slab" || row.element === "foundation") && (
                <>
                  <Label>
                    Bar Spacing (mm)
                    <Input type="number" min="0.01" step="0.01" value={row.barSpacing } placeholder="eg 100"
                      onChange={(e) => update(row.id, "barSpacing", e.target.value )} />
                  </Label>
                  <Label>
                    Layers
                    <Input type="number" min="0.01" value={row.slabLayers ?? 1}
                      onChange={(e) => update(row.id, "slabLayers", Math.max(1, Math.min(4, parseFloat(e.target.value))).toString())} />
                  </Label>
                </>
              )}

              {row.element === "beam" && (
                <>
                  <Label>
                    Longitudinal Bars (qty)
                    <Input type="number" min="0.01" value={row.longitudinalBars }
                      onChange={(e) => update(row.id, "longitudinalBars", Math.max(1, parseFloat(e.target.value)).toString())} />
                  </Label>
                  <Label>
                    Stirrup Spacing (mm)
                    <Input type="number" min="0.01" value={row.stirrupSpacing } placeholder="eg 10"
                      onChange={(e) => update(row.id, "stirrupSpacing", Math.max(1, parseFloat(e.target.value)).toString())} />
                  </Label>
                </>
              )}

              {row.element === "column" && (
                <>
                  <Label>
                    Vertical Bars (qty)
                    <Input type="number" min="0.01" value={row.verticalBars }
                      onChange={(e) => update(row.id, "verticalBars", Math.max(1, parseFloat(e.target.value)).toString())} />
                  </Label>
                  <Label>
                    Tie Spacing (mm)
                    <Input type="number" min="0.01" value={row.tieSpacing }
                      onChange={(e) => update(row.id, "tieSpacing", Math.max(1, parseFloat(e.target.value)).toString())} />
                  </Label>
                  <Label>
                    (Optional) Column Height (m)
                    <Input type="number" min="0.01" step="0.01" value={row.columnHeight ?? row.length}
                      onChange={(e) => update(row.id, "columnHeight", e.target.value)} />
                  </Label>
                </>
              )}
            </div>

            {/* Steel Sizes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Label className="block">
                Primary Bar Size
                <Select value={row.primaryBarSize} onValueChange={(v) => update(row.id, "primaryBarSize", v as RebarSize)}>
                  <SelectTrigger><SelectValue placeholder="Primary size" /></SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Label>

              {(row.element === "slab" || row.element === "foundation") && (
                <>
                  <Label className="block">
                    Mesh X Size (optional)
                    <Select value={row.meshXSize ?? row.primaryBarSize}
                      onValueChange={(v) => update(row.id, "meshXSize", v as RebarSize)}>
                      <SelectTrigger><SelectValue placeholder="Mesh X size" /></SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Label>
                  <Label className="block">
                    Mesh Y Size (optional)
                    <Select value={row.meshYSize ?? row.primaryBarSize}
                      onValueChange={(v) => update(row.id, "meshYSize", v as RebarSize)}>
                      <SelectTrigger><SelectValue placeholder="Mesh Y size" /></SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Label>
                </>
              )}

              {row.element === "beam" && (
                <Label className="block">
                  Stirrup Size
                  <Select value={row.stirrupSize ?? row.primaryBarSize}
                    onValueChange={(v) => update(row.id, "stirrupSize", v as RebarSize)}>
                    <SelectTrigger><SelectValue placeholder="Stirrup size" /></SelectTrigger>
                    <SelectContent>
                      {sizeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Label>
              )}

              {row.element === "column" && (
                <Label className="block">
                  Tie Size
                  <Select value={row.tieSize ?? row.primaryBarSize}
                    onValueChange={(v) => update(row.id, "tieSize", v as RebarSize)}>
                    <SelectTrigger><SelectValue placeholder="Tie size" /></SelectTrigger>
                    <SelectContent>
                      {sizeOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Label>
              )}
            </div>

            {/* Advanced allowances */}
            {showAdvanced && (
              <Accordion type="single" collapsible defaultValue="allowances">
                <AccordionItem value="allowances">
                  <AccordionTrigger>Advanced: Development & Hook Allowances (×d)</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid pl-1 pr-1 grid-cols-1 md:grid-cols-4 gap-4">
                      <Label>
                        Dev. Longitudinal (×d)
                        <Input type="number" value={row.devLenFactorDLong ?? 12}
                          onChange={(e) => update(row.id, "devLenFactorDLong", Math.max(0, parseFloat(e.target.value) || 0).toString())} />
                      </Label>
                      <Label>
                        Dev. Vertical (×d)
                        <Input type="number" value={row.devLenFactorDVert ?? 12}
                          onChange={(e) => update(row.id, "devLenFactorDVert", Math.max(0, parseFloat(e.target.value) || 0).toString())} />
                      </Label>
                      <Label>
                        Stirrup Hooks (×d)
                        <Input type="number" value={row.hookFactorDStirrups ?? 6}
                          onChange={(e) => update(row.id, "hookFactorDStirrups", Math.max(0, parseFloat(e.target.value) || 0).toString())} />
                      </Label>
                      <Label>
                        Tie Hooks (×d)
                        <Input type="number" value={row.hookFactorDTies ?? 6}
                          onChange={(e) => update(row.id, "hookFactorDTies", Math.max(0, parseFloat(e.target.value) || 0).toString())} />
                      </Label>
                    </div>

                    {(row.element === "slab" || row.element === "foundation") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Label>
                          Mesh X Spacing Override (mm)
                          <Input type="number" value={row.meshXSpacing ?? (row.barSpacing ?? 200)}
                            onChange={(e) => update(row.id, "meshXSpacing", Math.max(1, parseInt(e.target.value) || 1).toString())} />
                        </Label>
                        <Label>
                          Mesh Y Spacing Override (mm)
                          <Input type="number" value={row.meshYSpacing ?? (row.barSpacing ?? 200)}
                            onChange={(e) => update(row.id, "meshYSpacing", Math.max(1, parseInt(e.target.value) || 1).toString())} />
                        </Label>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="rounded-md border dark:border-red-300 dark:bg-red-900 border-red-950 bg-red-500 p-3 text-sm">
                <div className="font-medium mb-1 text-white">Please fix:</div>
                <ul className="list-disc list-inside text-white">
                  {errors.map((e, idx) => <li key={idx}>{e}</li>)}
                </ul>
              </div>
            )}

            {/* Result */}
            <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
              <div>Total bars: <b>{result.totalBars}</b></div>
              <div>Total length (with wastage): <b>{result.totalLengthM.toFixed(2)} m</b></div>
              <div>Total weight (with wastage): <b>{result.totalWeightKg.toFixed(2)} kg</b></div>

              {/* Weight breakdown */}
              <div className="mt-2 opacity-80">Breakdown:</div>
              <ul className="text-xs grid grid-cols-2 gap-x-4">
                {result.weightBreakdownKg.meshX !== undefined && (
                  <li>Mesh X: {result.weightBreakdownKg.meshX.toFixed(2)} kg</li>
                )}
                {result.weightBreakdownKg.meshY !== undefined && (
                  <li>Mesh Y: {result.weightBreakdownKg.meshY.toFixed(2)} kg</li>
                )}
                {result.weightBreakdownKg.longitudinal !== undefined && (
                  <li>Longitudinal: {result.weightBreakdownKg.longitudinal.toFixed(2)} kg</li>
                )}
                {result.weightBreakdownKg.verticals !== undefined && (
                  <li>Verticals: {result.weightBreakdownKg.verticals.toFixed(2)} kg</li>
                )}
                {result.weightBreakdownKg.stirrups !== undefined && (
                  <li>Stirrups: {result.weightBreakdownKg.stirrups.toFixed(2)} kg</li>
                )}
                {result.weightBreakdownKg.ties !== undefined && (
                  <li>Ties: {result.weightBreakdownKg.ties.toFixed(2)} kg</li>
                )}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
