"use client";
import { QuoteModel } from "@/lib/boq";
import { Card, CardContent } from "@/components/ui/card";

export default function SummaryCard({ quote }: { quote: QuoteModel }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-3">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div>A Substructure: <b>{quote.element_a_total.toLocaleString()}</b></div>
          <div>B Superstructure: <b>{quote.element_b_total.toLocaleString()}</b></div>
          <div>C Walling: <b>{quote.element_c_total.toLocaleString()}</b></div>
          <div>D Windows: <b>{quote.element_d_total.toLocaleString()}</b></div>
          <div>E Doors: <b>{quote.element_e_total.toLocaleString()}</b></div>
          <div>F Wall Finishes: <b>{quote.element_f_total.toLocaleString()}</b></div>
          <div>G Roofing: <b>{quote.element_g_total.toLocaleString()}</b></div>
          <div>H Floor Finishes: <b>{quote.element_h_total.toLocaleString()}</b></div>
          <div>J Ceiling Finishes: <b>{quote.element_j_total.toLocaleString()}</b></div>
          <div>PC + Provisional: <b>{quote.pc_and_provisional_total.toLocaleString()}</b></div>
          <div>Gen Prelim: <b>{quote.general_prelim_total.toLocaleString()}</b></div>
          <div>Part Prelim: <b>{quote.particular_prelim_total.toLocaleString()}</b></div>
          <div>Professional Fees: <b>{(quote.professional_fees || 0).toLocaleString()}</b></div>
        </div>
        <div className="mt-3 text-base">
          Total Amount: <b className="text-xl">{quote.total_amount.toLocaleString()}</b>
        </div>
      </CardContent>
    </Card>
  );
}
