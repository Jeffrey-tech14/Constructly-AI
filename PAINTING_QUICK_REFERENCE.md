# 🎨 Painting System - Quick Reference Card

## 📦 Install & Import

```typescript
// Core types
import type {
  PaintingSpecification,
  LayerCalculation,
  PaintCategory,
  PaintSubtype,
  PaintingTotals,
} from "@/types/painting";

// Calculations
import {
  calculatePaintingLayers,
  calculatePaintingTotals,
  validatePaintingSpec,
} from "@/utils/paintingCalculations";

// React hook
import usePaintingCalculator from "@/hooks/usePaintingCalculator";

// UI component
import PaintingLayerConfig from "@/components/PaintingLayerConfig";

// Quote integration
import {
  extractPaintingsFromQuote,
  updateQuoteWithPaintings,
  generatePaintingReport,
} from "@/utils/quoteIntegration";
```

## 🎯 Common Patterns

### Create New Painting

```typescript
const painting = addPainting(150, "Living Room - All Walls");
// Returns: PaintingSpecification with calculations
```

### Load from Quote

```typescript
const { paintings } = extractPaintingsFromQuote(quote);
// Auto-migrates legacy paint finishes if needed
```

### Update Paint Type

```typescript
updateFinishingPaint(paintingId, "enamel", "gloss", 2);
// category: "emulsion" | "enamel"
// subtype: "vinyl-matt" | "vinyl-silk" | "antibacterial" | "eggshell" | "gloss"
// coats: 1-4
```

### Get Totals

```typescript
const totals = calculatePaintingTotals(paintings);
// {
//   totalArea: 150,
//   skimmingBags: 28,
//   undercoatLitres: 14,
//   finishingLitres: 27.5,
//   totalCost: 22900,
//   ...
// }
```

### Save to Quote

```typescript
const updated = updateQuoteWithPaintings(quote, paintings);
setQuote(updated);
```

## 🔧 Layer Configuration

### Skimming

- Material: Skimming Filler
- Unit: 25kg bags
- Coverage: 11 m² per bag per coat
- Coats: 1-5 (typical: 2)
- Optional but default enabled

```typescript
updateSkimming(paintingId, enabled: boolean, coats: number)
```

### Undercoat

- Material: Undercoat/Covermat
- Unit: Litres
- Coverage: 11 m² per litre
- Coats: Fixed at 1
- Usually enabled (disable for primer coatings)

```typescript
updateUndercoat(paintingId, enabled: boolean)
```

### Finishing Paint

- Materials: Emulsion or Enamel
- Subtypes: Depends on category
- Unit: Litres
- Coverage: 11 m² per litre per coat
- Coats: 1-4 (typical: 2)

```typescript
updateFinishingPaint(
  paintingId,
  category: "emulsion" | "enamel",
  subtype: PaintSubtype,
  coats: 1-4
)
```

## 📊 Paint Categories

### Emulsion (Water-based)

```
✓ Vinyl Matt        - Flat finish, low sheen
✓ Vinyl Silk        - Satin-like, medium sheen
✓ Antibacterial     - Hospital-grade, premium
```

### Enamel (Oil-based)

```
✓ Eggshell          - Low sheen, durable
✓ Gloss             - High sheen, premium finish
```

## ✅ Validation

### Auto-Enforced Rules

```
❌ Finishing paint without undercoat/skimming
❌ Enamel without preparation layer
❌ Invalid paint subtype for category
❌ Surface area ≤ 0
```

### Warnings

```
⚠️ Coat count unusual (< 1 or > bounds)
⚠️ Surface area very large (> 5000 m²)
```

Check with:

```typescript
const { valid, errors } = validatePaintingSpec(painting);
errors.forEach((e) => console.log(e.message));
```

## 📐 Calculation Formula

```typescript
// For each layer:
quantity_raw = (surface_area_m²) / (coverage_m²_per_unit) × coats

// Rounding:
quantity_rounded =
  unit === "bags"
    ? Math.ceil(quantity_raw)                  // Whole numbers
    : Math.ceil(quantity_raw * 2) / 2         // Nearest 0.5L

// Cost:
total_cost = quantity_rounded × unit_price
```

## 💰 Example Pricing Setup

```typescript
const materialPrices = [
  {
    name: "paint",
    type: {
      materials: {
        "Skimming Filler": 250, // Per 25kg bag
        "Undercoat / Covermat": 350, // Per litre
        "Emulsion - Vinyl Matt": 400, // Per litre
        "Emulsion - Vinyl Silk": 420,
        "Emulsion - Antibacterial": 500,
        "Enamel - Eggshell": 430,
        "Enamel - Gloss": 450,
      },
    },
  },
];
```

## 🚀 Full Workflow Example

```typescript
// 1. Initialize hook
const { paintings, totals, addPainting, updateFinishingPaint, deletePainting } =
  usePaintingCalculator({
    materialPrices: myPrices,
    quote: myQuote,
  });

// 2. Add a surface
const painting = addPainting(100, "Living Room");

// 3. Change paint type
updateFinishingPaint(painting.id, "enamel", "gloss", 2);

// 4. Get calculations
console.log(painting.calculations);
// {
//   skimming: { roundedQuantity: 19, totalCostWithWastage: 4750 },
//   undercoat: { roundedQuantity: 9.5, totalCostWithWastage: 3325 },
//   finishing: { roundedQuantity: 18.5, totalCostWithWastage: 7400 }
// }

// 5. Check totals
console.log(totals.totalCostWithWastage); // 22,900

// 6. Save to quote
const updated = updateQuoteWithPaintings(myQuote, paintings);
await saveQuote(updated);
```

## 📋 Component Usage

```tsx
<FinishesCalculator
  finishes={quote.finishes}
  materialPrices={quote.materialPrices}
  paintings={paintings} // New!
  onPaintingsUpdate={handlePaintingsChange} // New!
  quote={quote}
  setQuoteData={setQuote}
  readonly={false}
/>
```

## 🔄 Migration from Legacy

```typescript
// Automatic on quote load
const { paintings, legacyPaintFinishes } = extractPaintingsFromQuote(quote);

// paintings will contain migrated specs if legacy paint found
// legacyPaintFinishes will have original data

// Update quote (removes legacy if keepLegacy=false)
const updated = updateQuoteWithPaintings(
  quote,
  paintings,
  (keepLegacy = false)
);
```

## 📤 Export & Reporting

```typescript
// CSV export
const csv = exportPaintingsToCsv(paintings);
downloadFile(csv, "paintings.csv");

// Text report
const report = generatePaintingReport(paintings);
console.log(report);
// ╔════════════════════════════════╗
// ║ PAINTING SPECIFICATIONS REPORT ║
// │ Surface 1: Living Room         │
// │ Area: 100 m²                   │
// │ Skimming: 19 bags - KES 4,750  │
// │ Undercoat: 9.5L - KES 3,325    │
// │ Paint: 18.5L - KES 7,400       │
// │ Total: KES 15,475              │
// │                                │
// │ ...                            │
// ╚════════════════════════════════╝
```

## 🧮 Quick Mental Math

For rough estimates without code:

```
Area / 11 × coats = litres needed
Round up to nearest 0.5L for purchase

Example: 100 m² × 2 coats
= (100 / 11) × 2 = 18.2 L → buy 18.5L

Cost: 18.5L × 400 KES/L = 7,400 KES
```

## 🐛 Debugging

```typescript
// Check if painting has errors
const validation = validatePaintingSpec(painting);
if (!validation.valid) {
  validation.errors.forEach((e) => {
    console.log(`${e.severity}: ${e.message}`);
  });
}

// View calculation details
const calc = painting.calculations.finishing;
console.log(`Raw: ${calc?.quantity}`);
console.log(`Rounded: ${calc?.roundedQuantity}`);
console.log(`Cost: ${calc?.totalCostWithWastage}`);

// Check if using new system
import { hasNewPaintingSystem } from "@/utils/quoteIntegration";
if (hasNewPaintingSystem(quote)) {
  console.log("Using advanced painting system");
}
```

## 📱 UI Components Map

```
FinishesCalculator (Main)
├── Masonry Plaster Results     (existing)
├── Summary Cards               (existing)
├── Finishes Controls           (existing)
└── Advanced Painting System    (NEW)
    ├── Add Painting Form       (NEW)
    └── For each Painting:
        └── PaintingLayerConfig
            ├── Surface Prep    (Skimming)
            ├── Undercoat       (Covermat)
            └── Finishing Paint
```

## 🎓 Documentation

| File                                     | Purpose            |
| ---------------------------------------- | ------------------ |
| `src/types/painting.ts`                  | Type definitions   |
| `src/utils/paintingCalculations.ts`      | Calculation logic  |
| `src/hooks/usePaintingCalculator.ts`     | State management   |
| `src/components/PaintingLayerConfig.tsx` | Layer UI           |
| `src/utils/quoteIntegration.ts`          | Quote persistence  |
| `src/utils/paintingExamples.ts`          | Working examples   |
| `PAINTING_SYSTEM_DOCS.md`                | Full documentation |

## ✨ Pro Tips

1. **Always validate** before saving
2. **Use defaults** for standard projects (2 coats, skimming enabled)
3. **Group surfaces** by paint type for efficiency
4. **Check totals** match cost breakdown
5. **Generate reports** for client approval
6. **Test migrations** with existing quotes first

---

**Need Help?** → See PAINTING_SYSTEM_DOCS.md for full reference
