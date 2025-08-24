"use client";
import { PrelimItem, QuoteModel } from "@/lib/boq";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  quote: QuoteModel;
  onUpdatePrelim: (key: "general_preliminaries" | "particular_preliminaries", id: string, patch: Partial<PrelimItem>) => void;
  onUpdateQuote: (patch: Partial<QuoteModel>) => void;
}

export default function PreliminariesForm({ quote, onUpdatePrelim, onUpdateQuote }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-lg">General Preliminaries (GP/1 – GP/13)</h3>
          {quote.general_preliminaries.map((p) => (
            <div key={p.id} className="border rounded-xl p-3 mb-2">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <Label>Code</Label>
                  <Input value={p.code} onChange={(e) => onUpdatePrelim("general_preliminaries", p.id, { code: e.target.value })} />
                </div>
                <div className="col-span-5">
                  <Label>Title</Label>
                  <Input value={p.title} onChange={(e) => onUpdatePrelim("general_preliminaries", p.id, { title: e.target.value })} />
                </div>
                <div className="col-span-4">
                  <Label>Amount (Ksh)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={p.amount}
                    onChange={(e) => onUpdatePrelim("general_preliminaries", p.id, { amount: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-12">
                  <Label>Description</Label>
                  <Textarea
                    value={p.description}
                    onChange={(e) => onUpdatePrelim("general_preliminaries", p.id, { description: e.target.value })}
                    placeholder="Details, scope, standards, insurances, H&S, etc."
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-lg">Particular Preliminaries (PP/1 – PP/6)</h3>
          {quote.particular_preliminaries.map((p) => (
            <div key={p.id} className="border rounded-xl p-3 mb-2">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <Label>Code</Label>
                  <Input value={p.code} onChange={(e) => onUpdatePrelim("particular_preliminaries", p.id, { code: e.target.value })} />
                </div>
                <div className="col-span-5">
                  <Label>Title</Label>
                  <Input value={p.title} onChange={(e) => onUpdatePrelim("particular_preliminaries", p.id, { title: e.target.value })} />
                </div>
                <div className="col-span-4">
                  <Label>Amount (Ksh)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={p.amount}
                    onChange={(e) => onUpdatePrelim("particular_preliminaries", p.id, { amount: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-12">
                  <Label>Description</Label>
                  <Textarea
                    value={p.description}
                    onChange={(e) => onUpdatePrelim("particular_preliminaries", p.id, { description: e.target.value })}
                    placeholder="Names, responsibilities, working hours, program, security, DLP, etc."
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Site Visit Required</Label>
            <select
              className="w-full border rounded-md h-9 px-2"
              value={quote.site_visit_required ? "yes" : "no"}
              onChange={(e) => onUpdateQuote({ site_visit_required: e.target.value === "yes" })}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <div>
            <Label>Defects Liability (Months)</Label>
            <Input
              type="number"
              min={0}
              value={quote.defects_liability_months ?? 0}
              onChange={(e) => onUpdateQuote({ defects_liability_months: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Contract Conditions</Label>
            <Input
              value={quote.contract_conditions || ""}
              onChange={(e) => onUpdateQuote({ contract_conditions: e.target.value })}
              placeholder="e.g., FIDIC, JBC, bespoke"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
