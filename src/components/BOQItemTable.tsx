"use client";
import { BOQItem, BOQSubItem, Unit } from "@/lib/boq";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const UNITS: Unit[] = ["No", "m", "m²", "m³", "kg", "bag", "lot", "pc", "day", "week", "sum"];

interface Props {
  title: string;
  items: BOQItem[];
  onAddItem: () => void;
  onUpdateItem: (id: string, patch: Partial<BOQItem>) => void;
  onRemoveItem: (id: string) => void;
  onAddSubItem: (parentId: string, sub: Omit<BOQSubItem, "id" | "total">) => void;
  onUpdateSubItem: (parentId: string, subId: string, patch: Partial<BOQSubItem>) => void;
  onRemoveSubItem: (parentId: string, subId: string) => void;
}

export default function BOQItemTable({
  title,
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onAddSubItem,
  onUpdateSubItem,
  onRemoveSubItem,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button onClick={onAddItem} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-2 font-medium mb-2">
          <div className="col-span-5">Description</div>
          <div className="col-span-1">Unit</div>
          <div className="col-span-1">Qty</div>
          <div className="col-span-2">Rate (Ksh)</div>
          <div className="col-span-2">Total (Ksh)</div>
          <div className="col-span-1" />
        </div>

        {items.map((item) => {
          const isOpen = expanded[item.id];
          return (
            <div key={item.id} className="border rounded-xl p-2 mb-2">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    value={item.description}
                    onChange={(e) => onUpdateItem(item.id, { description: e.target.value })}
                    placeholder="Description (e.g., Double leaf mahogany door, 4 hinges, 900x2100mm)"
                  />
                </div>
                <div className="col-span-1">
                  <select
                    className="w-full border rounded-md h-9 px-2"
                    value={item.unit}
                    onChange={(e) => onUpdateItem(item.id, { unit: e.target.value as any })}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <Input
                    type="number"
                    min={0}
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(item.id, { quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min={0}
                    value={item.rate}
                    onChange={(e) => onUpdateItem(item.id, { rate: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <div className="h-9 rounded-md border px-3 flex items-center bg-muted/30">
                    {item.total.toLocaleString()}
                  </div>
                </div>
                <div className="col-span-1 flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpanded((s) => ({ ...s, [item.id]: !isOpen }))}>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => onRemoveItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 rounded-lg border p-3 bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-semibold">Specifications / Sub-Items</Label>
                    <AddSubItemInline
                      onAdd={(sub) =>
                        onAddSubItem(item.id, {
                          description: sub.description,
                          unit: sub.unit as any,
                          quantity: Number(sub.quantity),
                          rate: Number(sub.rate),
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2 font-medium text-sm mb-2">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2">Unit</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Total (Ksh)</div>
                  </div>

                  {(item.subItems || []).map((s) => (
                    <div key={s.id} className="grid grid-cols-12 gap-2 items-center mb-1">
                      <div className="col-span-6">
                        <Input
                          value={s.description}
                          onChange={(e) => onUpdateSubItem(item.id, s.id, { description: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          className="w-full border rounded-md h-9 px-2"
                          value={s.unit}
                          onChange={(e) => onUpdateSubItem(item.id, s.id, { unit: e.target.value as any })}
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min={0}
                          value={s.quantity}
                          onChange={(e) => {
                            const qty = Number(e.target.value);
                            onUpdateSubItem(item.id, s.id, { quantity: qty });
                          }}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between gap-2">
                        <div className="h-9 rounded-md border px-3 flex items-center bg-muted/30 grow">
                          {s.total.toLocaleString()}
                        </div>
                        <Button variant="destructive" size="icon" onClick={() => onRemoveSubItem(item.id, s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function AddSubItemInline({
  onAdd,
}: {
  onAdd: (sub: { description: string; unit: Unit; quantity: number; rate: number }) => void;
}) {
  const [description, setDesc] = useState("");
  const [unit, setUnit] = useState<Unit>("pc");
  const [quantity, setQty] = useState<number>(1);
  const [rate, setRate] = useState<number>(0);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="w-64">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDesc(e.target.value)} placeholder="(e.g., 4x Hinges, SS, 100mm)" />
      </div>
      <div className="w-28">
        <Label>Unit</Label>
        <select className="w-full border rounded-md h-9 px-2" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
          {["No","m","m²","m³","kg","bag","lot","pc","day","week","sum"].map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>
      <div className="w-24">
        <Label>Qty</Label>
        <Input type="number" min={0} value={quantity} onChange={(e) => setQty(Number(e.target.value))} />
      </div>
      <div className="w-28">
        <Label>Rate</Label>
        <Input type="number" min={0} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
      </div>
      <Button
        className="mt-6"
        onClick={() => {
          if (!description.trim()) return;
          onAdd({ description, unit, quantity, rate });
          setDesc("");
          setQty(1);
          setRate(0);
        }}
        variant="secondary"
        size="sm"
      >
        <Plus className="w-4 h-4 mr-1" /> Add Spec
      </Button>
    </div>
  );
}
