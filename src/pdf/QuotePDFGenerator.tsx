"use client";
import { QuoteModel, BOQItem, PrelimItem } from "@/lib/boq";
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, fontFamily: "Helvetica" },
  h1: { fontSize: 18, marginBottom: 6, fontWeight: 700 },
  h2: { fontSize: 14, marginVertical: 8, fontWeight: 700 },
  h3: { fontSize: 12, marginTop: 6, marginBottom: 2, fontWeight: 700 },
  row: { flexDirection: "row", borderBottom: 1, borderColor: "#ddd" },
  cell: { padding: 4 },
  th: { fontWeight: 700, backgroundColor: "#f2f2f2" },
  colDesc: { width: "55%" },
  colUnit: { width: "10%", textAlign: "right" },
  colQty: { width: "10%", textAlign: "right" },
  colRate: { width: "12.5%", textAlign: "right" },
  colAmt: { width: "12.5%", textAlign: "right" },
  section: { marginTop: 10, marginBottom: 8 },
  small: { fontSize: 9 },
  italic: { fontStyle: "italic" },
});

function SectionTable({ title, items, subtotal }: { title: string; items: BOQItem[]; subtotal: number }) {
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>{title}</Text>
      <View style={[styles.row, styles.th]}>
        <Text style={[styles.cell, styles.colDesc]}>Description</Text>
        <Text style={[styles.cell, styles.colUnit]}>Unit</Text>
        <Text style={[styles.cell, styles.colQty]}>Qty</Text>
        <Text style={[styles.cell, styles.colRate]}>Rate</Text>
        <Text style={[styles.cell, styles.colAmt]}>Amount</Text>
      </View>
      {items.map((i) => (
        <View key={i.id} style={styles.row}>
          <Text style={[styles.cell, styles.colDesc]}>
            {i.description}
            {i.subItems?.length ? `  (Specs: ${i.subItems.map((s) => `${s.description} ${s.quantity}${s.unit}`).join(", ")})` : ""}
          </Text>
          <Text style={[styles.cell, styles.colUnit]}>{i.unit}</Text>
          <Text style={[styles.cell, styles.colQty]}>{i.quantity.toLocaleString()}</Text>
          <Text style={[styles.cell, styles.colRate]}>{i.rate.toLocaleString()}</Text>
          <Text style={[styles.cell, styles.colAmt]}>{i.total.toLocaleString()}</Text>
        </View>
      ))}
      <View style={[styles.row]}>
        <Text style={[styles.cell, styles.colDesc, styles.th]}>Carried to Section Total</Text>
        <Text style={[styles.cell, styles.colUnit]} />
        <Text style={[styles.cell, styles.colQty]} />
        <Text style={[styles.cell, styles.colRate]} />
        <Text style={[styles.cell, styles.colAmt, styles.th]}>{subtotal.toLocaleString()}</Text>
      </View>
    </View>
  );
}

function PrelimTable({ title, items, subtotal }: { title: string; items: PrelimItem[]; subtotal: number }) {
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>{title}</Text>
      <View style={[styles.row, styles.th]}>
        <Text style={[styles.cell, { width: "15%" }]}>Code</Text>
        <Text style={[styles.cell, { width: "55%" }]}>Description</Text>
        <Text style={[styles.cell, { width: "30%", textAlign: "right" }]}>Amount</Text>
      </View>
      {items.map((p) => (
        <View key={p.id} style={styles.row}>
          <Text style={[styles.cell, { width: "15%" }]}>{p.code}</Text>
          <Text style={[styles.cell, { width: "55%" }]}>{p.title}: {p.description}</Text>
          <Text style={[styles.cell, { width: "30%", textAlign: "right" }]}>{p.amount.toLocaleString()}</Text>
        </View>
      ))}
      <View style={[styles.row]}>
        <Text style={[styles.cell, { width: "70%" }, styles.th]}>Carried to Preliminaries Total</Text>
        <Text style={[styles.cell, { width: "30%", textAlign: "right" }, styles.th]}>{subtotal.toLocaleString()}</Text>
      </View>
    </View>
  );
}

export function QuotePDF({ quote }: { quote: QuoteModel }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{quote.title || "Bill of Quantities"}</Text>
        <Text style={styles.small}>
          Client: {quote.client_name}   |   Email: {quote.client_email}
        </Text>
        <Text style={styles.small}>
          Location: {quote.location}   |   Region: {quote.region}   |   Project: {quote.project_type} ({quote.house_type})   |   Floors: {quote.floors}
        </Text>
        <Text style={[styles.small, styles.italic]}>
          Contract: {quote.contract_type || "full_contract"}   |   Status: {quote.status}
        </Text>

        <PrelimTable title="Bill No. 1 — General Preliminaries" items={quote.general_preliminaries} subtotal={quote.general_prelim_total} />
        <PrelimTable title="Bill No. 2 — Particular Preliminaries" items={quote.particular_preliminaries} subtotal={quote.particular_prelim_total} />

        <SectionTable title="A — Sub-Structure" items={quote.element_a} subtotal={quote.element_a_total} />
        <SectionTable title="B — Super-Structure" items={quote.element_b} subtotal={quote.element_b_total} />
        <SectionTable title="C — Walling" items={quote.element_c} subtotal={quote.element_c_total} />
        <SectionTable title="D — Windows" items={quote.element_d} subtotal={quote.element_d_total} />
        <SectionTable title="E — Doors" items={quote.element_e} subtotal={quote.element_e_total} />
        <SectionTable title="F — Wall Finishes" items={quote.element_f} subtotal={quote.element_f_total} />
        <SectionTable title="G — Roofing" items={quote.element_g} subtotal={quote.element_g_total} />
        <SectionTable title="H — Floor Finishes" items={quote.element_h} subtotal={quote.element_h_total} />
        <SectionTable title="J — Ceiling Finishes" items={quote.element_j} subtotal={quote.element_j_total} />

        <SectionTable title="Prime Cost Sums" items={quote.pc_sums} subtotal={quote.pc_and_provisional_total} />
        <SectionTable title="Provisional Sums" items={quote.provisional_sums} subtotal={0} />

        <View style={{ marginTop: 10 }}>
          <Text style={styles.h2}>Summary and Grand Total</Text>
          <Text style={styles.small}>Professional Fees: { (quote.professional_fees || 0).toLocaleString() }</Text>
          <Text style={[styles.h3, { textAlign: "right" }]}>Grand Total: {quote.total_amount.toLocaleString()} Ksh</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.h2}>Signature</Text>
          <Text>Employer: ________________________________   Date: _____________</Text>
          <Text>Contractor: _______________________________   Date: _____________</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function QuotePDFGenerator({ quote }: { quote: QuoteModel }) {
  return (
    <PDFDownloadLink document={<QuotePDF quote={quote} />} fileName={`${quote.title || "boq"}.pdf`}>
      {({ loading }) => (
        <Button variant="default" size="sm" disabled={loading}>
          {loading ? "Preparing PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
