import React, { useMemo, useRef, useState } from "react";
import { calculateConcrete, ConcreteRow, ConcreteResult } from "@/hooks/useConcreteCalculator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Trash } from "lucide-react";
import { Material } from "@/hooks/useQuoteCalculations";
import { useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { RegionalMultiplier } from "@/hooks/useDynamicPricing";
import { supabase } from "@/integrations/supabase/client";
import { randomUUID } from "crypto";


interface Props {
  quote: any;
  setQuote: any;
}

export default function ConcreteCalculatorForm({ quote, setQuote }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const { user, profile } = useAuth();
  const [regionalMultipliers, setRegionalMultipliers] = useState<RegionalMultiplier[]>([]);

    useEffect(() => {
    const loadMultipliers = async () => {
        const { data } = await supabase.from('regional_multipliers').select('*');
        if (data) setRegionalMultipliers(data);
    };
    loadMultipliers();
    }, []);


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
    };
  }, []);


  // Use quote.concrete_calculations instead of local state
  const rows = useMemo(() => {
    return Array.isArray(quote.concrete_calculations) ? quote.concrete_calculations : [];
    }, [quote.concrete_calculations]);

  const updateRow = <K extends keyof ConcreteRow>(id: number, key: K, value: ConcreteRow[K]) => {
    setQuote(prev => ({
      ...prev,
      concrete_calculations: (prev.concrete_calculations || []).map(r => 
        r.id === id ? { ...r, [key]: value } : r
      )
    }));
  };

  const addRow = useCallback(() => {
    setQuote(prev => ({
        ...prev,
        concrete_calculations: [
        ...(prev.concrete_calculations || []),
        makeDefaultRow()
        ]
    }));
    }, [makeDefaultRow, setQuote]);

  const removeRow = (id: number) => {
    setQuote(prev => ({
      ...prev,
      concrete_calculations: (prev.concrete_calculations || []).filter(r => r.id !== id)
    }));
  };

  const results = useMemo<ConcreteResult[]>(() => rows.map(r => calculateConcrete(r)), [rows]);

  const fetchMaterials = useCallback(async () => {
    if (!profile?.id) return;
    
    const { data: baseMaterials, error: baseError } = await supabase
      .from('material_base_prices')
      .select('*');
  
    const { data: overrides, error: overrideError } = await supabase
      .from('user_material_prices')
      .select('material_id, region, price')
      .eq('user_id', profile.id);
  
    if (baseError) console.error('Base materials error:', baseError);
    if (overrideError) console.error('Overrides error:', overrideError);
  
    const merged = baseMaterials?.map((material) => {
      const userRegion = profile?.location || 'Nairobi'; 
      const userRate = overrides?.find(
        o => o.material_id === material.id && o.region === userRegion
      );
      const multiplier = regionalMultipliers.find(r => r.region === userRegion)?.multiplier || 1;
      const materialP = material.price * multiplier;
      const price = userRate ? userRate.price : materialP ?? 0;
      
      return {
        ...material,
        price,
        source: userRate ? 'user' : (material.price != null ? 'base' : 'none')
      };
    }) || [];
  
    setMaterials(merged);
  }, [user, profile, regionalMultipliers]);

  useEffect(() => {
    if (user && profile !== null) {
      fetchMaterials();
    }
  }, [user, profile, fetchMaterials]);

  const totals = results.reduce(
    (acc, r) => {
      acc.volume += r.volumeM3;
      acc.cement += r.cementBags;
      acc.sand += r.sandM3;
      acc.stone += r.stoneM3;
      return acc;
    },
    { volume: 0, cement: 0, sand: 0, stone: 0 }
  );

  const cementMat = materials.find(m => m.name?.toLowerCase() === 'cement');
  const sandMat = materials.find(m => m.name?.toLowerCase() === 'sand');
  const ballastMat = materials.find(m => m.name?.toLowerCase() === 'ballast');

  useEffect(() => {
    if (!cementMat || !sandMat || !ballastMat) return;

    // Generate a list of items per row
    const concrete_materials = results.flatMap(r => [
      {
        rowId: r.id,
        name: `Cement (${r.name})`,
        quantity: r.cementBags,
        unit_price: cementMat.price,
        total_price: r.cementBags * cementMat.price,
      },
      {
        rowId: r.id,
        name: `Sand (${r.name})`,
        quantity: r.sandM3,
        unit_price: sandMat.price,
        total_price: r.sandM3 * sandMat.price,
      },
      {
        rowId: r.id,
        name: `Ballast (${r.name})`,
        quantity: r.stoneM3,
        unit_price: ballastMat.price,
        total_price: r.stoneM3 * ballastMat.price,
      },
    ]);

    // Update the quote with totals and line items
    setQuote(prev => ({
      ...prev,
      concrete_materials,
    }));
  }, [results, cementMat, sandMat, ballastMat, totals, setQuote]);

  return (
    <div className="mt-8 space-y-4 border dark:border-white/10 border-primary/30 mb-3 mt-6 p-3 rounded-lg">
      <h2 className="text-xl font-bold">Concrete Calculator</h2>

      {rows.length === 0 && (
        <p>No elements yet. Add an item below</p>
       )}

      {rows.map(row => {
        const result = results.find(r => r.id === row.id);
        return (
          <div key={row.id} className="p-4 border rounded-lg space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                value={row.name}
                onChange={e => updateRow(row.id, "name", e.target.value)}
                placeholder="Name (e.g. Slab 1)"
              />
              <Select
                value={row.element}
                onValueChange={(value) => updateRow(row.id, "element", value as any)}
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

              <Button onClick={() => removeRow(row.id)} variant="destructive">
                <Trash className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Input
                type="number"
                value={row.length}
                onChange={e => updateRow(row.id, "length", e.target.value)}
                placeholder="Length (m)"
              />
              <Input
                type="number"
                value={row.width}
                onChange={e => updateRow(row.id, "width", e.target.value)}
                placeholder="Width (m)"
              />
              <Input
                type="number"
                value={row.height}
                step="0.1"
                onChange={e => updateRow(row.id, "height", e.target.value)}
                placeholder="Height/Thickness (m)"
              />
            </div>

            <Input
              type="text"
              value={row.mix}
              onChange={e => updateRow(row.id, "mix", e.target.value)}
              placeholder="Mix ratio (e.g. 1:2:4)"
            />

            {/* Results */}
            {result && (
              <div className="mt-2 text-sm">
                <p><b>Volume:</b> {result.volumeM3.toFixed(2)} m³</p>
                <p><b>Cement:</b> {result.cementBags.toFixed(1)} bags . <b>Ksh {Math.round(result.cementBags * (cementMat?.price || 0))}</b></p>
                <p><b>Sand:</b> {result.sandM3.toFixed(2)} m³ . <b>Ksh {Math.round(result.sandM3 * (sandMat?.price || 0))}</b></p>
                <p><b>Ballast:</b> {result.stoneM3.toFixed(2)} m³ . <b>Ksh {Math.round(result.stoneM3 * (ballastMat?.price || 0))}</b></p>
              </div>
            )}
          </div>
        );
      })}

      <Button onClick={addRow} className="px-4 py-2 text-white">
        + Add Element
      </Button>

      {/* Totals */}
      <div className="p-4 border rounded-lg mt-4">
        <h3 className="font-bold">Totals</h3>
        <p><b>Total Volume:</b> {totals.volume.toFixed(2)} m³</p>
        <p><b>Total Cement:</b> {totals.cement.toFixed(1)} bags . <b>Ksh {Math.round(totals.cement * (cementMat?.price || 0))}</b></p>
        <p><b>Total Sand:</b> {totals.sand.toFixed(2)} m³ . <b>Ksh {Math.round(totals.sand * (sandMat?.price || 0))}</b></p>
        <p><b>Total Ballast:</b> {totals.stone.toFixed(2)} m³ . <b>Ksh {Math.round(totals.stone * (ballastMat?.price || 0))}</b></p>
      </div>
    </div>
  );
}