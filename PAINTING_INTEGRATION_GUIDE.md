# Advanced Painting System - Integration & Implementation Guide

## 📋 Quick Checklist

- ✅ [x] Data types and validation (`src/types/painting.ts`)
- ✅ [x] Calculation engine (`src/utils/paintingCalculations.ts`)
- ✅ [x] React hook (`src/hooks/usePaintingCalculator.ts`)
- ✅ [x] UI component (`src/components/PaintingLayerConfig.tsx`)
- ✅ [x] Quote integration utilities (`src/utils/quoteIntegration.ts`)
- ✅ [x] Documentation & examples
- ✅ [x] Backward compatibility logic
- ⏳ [ ] Component integration in Dashboard/Quote pages

## 🚀 Getting Started

### 1. Basic Usage in Your Quote Component

```tsx
import { FinishesCalculator } from "@/components/FinishesCalculator";
import {
  extractPaintingsFromQuote,
  updateQuoteWithPaintings,
} from "@/utils/quoteIntegration";

function QuoteEditorPage() {
  const [quote, setQuote] = useState<any>(initialQuote);

  // Extract paintings from quote (handles legacy migration)
  const { paintings } = extractPaintingsFromQuote(quote);

  const handlePaintingsChange = (updatedPaintings: PaintingSpecification[]) => {
    const newQuote = updateQuoteWithPaintings(quote, updatedPaintings);
    setQuote(newQuote);
  };

  return (
    <FinishesCalculator
      finishes={quote.finishes}
      materialPrices={quote.materialPrices}
      paintings={paintings}
      onPaintingsUpdate={handlePaintingsChange}
      quote={quote}
      setQuoteData={setQuote}
    />
  );
}
```

### 2. Direct Hook Usage

```tsx
import usePaintingCalculator from "@/hooks/usePaintingCalculator";
import PaintingLayerConfig from "@/components/PaintingLayerConfig";

function PaintingEditor() {
  const {
    paintings,
    totals,
    addPainting,
    updateSkimming,
    updateUndercoat,
    updateFinishingPaint,
    deletePainting,
  } = usePaintingCalculator({
    materialPrices: myMaterialPrices,
    quote: myQuote,
  });

  return (
    <div>
      <button onClick={() => addPainting(100, "Living Room")}>
        Add Surface
      </button>

      {paintings.map((painting) => (
        <PaintingLayerConfig
          key={painting.id}
          painting={painting}
          onSkimmingChange={(enabled, coats) =>
            updateSkimming(painting.id, enabled, coats)
          }
          onUndercoatChange={(enabled) => updateUndercoat(painting.id, enabled)}
          onFinishingChange={(category, subtype, coats) =>
            updateFinishingPaint(painting.id, category, subtype, coats)
          }
          onUpdate={(updates) => updatePainting(painting.id, updates)}
        />
      ))}

      <h3>Total Cost: KES {totals.totalCostWithWastage}</h3>
    </div>
  );
}
```

## 📁 File Structure

```
src/
├── types/
│   └── painting.ts                 # Type definitions & interfaces
├── utils/
│   ├── paintingCalculations.ts      # Core calculation logic
│   ├── paintingExamples.ts          # Usage examples
│   └── quoteIntegration.ts          # Quote persistence & migration
├── hooks/
│   └── usePaintingCalculator.ts     # React state management
├── components/
│   ├── PaintingLayerConfig.tsx      # Layer configuration UI
│   └── FinishesCalculator.tsx       # Main finishes component (updated)
└── PAINTING_SYSTEM_DOCS.md          # Full documentation
```

## 🔄 Backward Compatibility

### Legacy Paint Finishes → New System

When a quote has old-style paint finishes:

```typescript
// OLD (Legacy)
{
  id: "finish-paint-1",
  category: "paint",
  material: "Emulsion",
  quantity: 100,  // m²
  unit: "m²"
}

// AUTOMATICALLY CONVERTS TO (New System)
{
  id: "painting-1",
  surfaceArea: 100,
  location: "Legacy Paint Area",
  skimming: { enabled: false, coats: 0, coverage: 11 },
  undercoat: { enabled: false, coverage: 11 },
  finishingPaint: {
    category: "emulsion",
    subtype: "vinyl-matt",
    coats: 1,
    coverage: 11
  },
  calculations: { ... },
  legacyPaintingData: { /* original data */ }
}
```

### Extracting from Quote

```typescript
const { paintings, legacyPaintFinishes } = extractPaintingsFromQuote(quote);

// paintings: PaintingSpecification[]  - New system specs
// legacyPaintFinishes: FinishElement[] - Old paint finishes
```

### Updating Quote

```typescript
// Option 1: Keep legacy data (safest for editing)
const updated = updateQuoteWithPaintings(quote, paintings, (keepLegacy = true));

// Option 2: Remove legacy (clean, new system only)
const updated = updateQuoteWithPaintings(
  quote,
  paintings,
  (keepLegacy = false)
);
```

## 💡 Material Price Configuration

The system reads painting material prices from your existing `materialPrices` array:

```typescript
const materialPrices = [
  {
    name: "paint", // Must match this name
    type: {
      materials: {
        "Skimming Filler": 250, // Per 25kg bag
        "Undercoat / Covermat": 350, // Per litre
        "Emulsion - Vinyl Matt": 400, // Per litre
        "Emulsion - Vinyl Silk": 420, // Per litre
        "Emulsion - Antibacterial": 500, // Per litre
        "Enamel - Eggshell": 430, // Per litre
        "Enamel - Gloss": 450, // Per litre
      },
    },
  },
];
```

If prices don't exist, calculations use 0 (won't break).

## 🧪 Testing

### Run Examples

```typescript
import { runAllExamples } from "@/utils/paintingExamples";

// In browser console or test file
runAllExamples();
```

### Manual Testing Workflow

1. **Create a quote** with legacy paint finishes
2. **Open FinishesCalculator** component
3. **Verify migration**: Check that painting surfaces appear
4. **Modify layers**: Try enabling/disabling skimming, changing paint type
5. **Check totals**: Verify calculations are correct
6. **Save quote**: Ensure data persists correctly

## 📊 Calculation Examples

### Example 1: 100m² Living Room

```
Configuration:
- Area: 100 m²
- Skimming: Yes, 2 coats @ 11 m²/bag
- Undercoat: Yes, 1 coat @ 11 m²/L
- Paint: Emulsion-Vinyl Matt, 2 coats @ 11 m²/L
- Prices: Skim=250, Undercoat=350, Paint=400

Calculations:
Skimming:  (100/11) × 2 = 18.18 bags → round up to 19 bags → 19 × 250 = KES 4,750
Undercoat: (100/11) × 1 = 9.09 L → round up to 9.5 L → 9.5 × 350 = KES 3,325
Paint:     (100/11) × 2 = 18.18 L → round up to 18.5 L → 18.5 × 400 = KES 7,400
Total:     KES 15,475
```

### Example 2: 50m² Kitchen (Enamel Gloss)

```
Configuration:
- Area: 50 m²
- Skimming: Yes, 1 coat @ 11 m²/bag
- Undercoat: Yes, 1 coat @ 11 m²/L
- Paint: Enamel-Gloss, 2 coats @ 11 m²/L
- Prices: Skim=250, Undercoat=350, Paint=450

Calculations:
Skimming:  (50/11) × 1 = 4.55 bags → round up to 5 bags → 5 × 250 = KES 1,250
Undercoat: (50/11) × 1 = 4.55 L → round up to 5.0 L → 5.0 × 350 = KES 1,750
Paint:     (50/11) × 2 = 9.09 L → round up to 9.5 L → 9.5 × 450 = KES 4,275
Total:     KES 7,275
```

## 🔍 Validation Rules

### Enforced (Will Show Error)

❌ Finishing paint without preparation layer (AND not overridden)
❌ Enamel paint on plaster without preparation
❌ Invalid paint subtype for category
❌ Surface area ≤ 0

### Warned (Will Show Warning)

⚠️ Coat count < 1 or > reasonable bounds
⚠️ Surface area > 5000 m² (unusually large)

## 📝 Common Tasks

### Add a New Painting Surface

```typescript
const paintingSpec = addPainting(150, "All Walls - Ground Floor");
// Returns calculated PaintingSpecification
```

### Change Paint Type

```typescript
updateFinishingPaint(paintingId, "enamel", "gloss", 2);
// Changes to Enamel-Gloss with 2 coats
```

### Disable Skimming

```typescript
updateSkimming(paintingId, false, 0);
// Disables skimming layer
```

### Get Total Painting Cost

```typescript
import { calculateTotalPaintingCost } from "@/utils/quoteIntegration";

const total = calculateTotalPaintingCost(paintings);
// Returns number in KES
```

### Generate Report

```typescript
import { generatePaintingReport } from "@/utils/quoteIntegration";

const report = generatePaintingReport(paintings);
console.log(report);
// Outputs professional text report
```

## 🎯 Integration Checklist

### Phase 1: Setup ✅

- [x] Add types file
- [x] Add calculation utilities
- [x] Add React hook
- [x] Create UI components
- [x] Add quote integration

### Phase 2: Component Integration

- [ ] Import in FinishesCalculator ✅ (Done)
- [ ] Update Dashboard to pass paintings prop
- [ ] Update Quote Detail page to persist paintings
- [ ] Update Quote List to show painting costs

### Phase 3: Testing

- [ ] Unit tests for calculations
- [ ] Integration tests for quote persistence
- [ ] E2E tests for UI workflow
- [ ] Manual testing with different scenarios

### Phase 4: Rollout

- [ ] Deploy to staging
- [ ] Test with existing quotes (legacy migration)
- [ ] Test with new quotes
- [ ] Deploy to production
- [ ] Monitor for issues

## 🔧 Troubleshooting

### Paintings Not Showing

```typescript
// Check if paintings are being extracted
const { paintings } = extractPaintingsFromQuote(quote);
console.log("Paintings:", paintings); // Should not be empty

// Check material prices
console.log("Material prices:", materialPrices);
// Should include "paint" category with materials
```

### Calculations Wrong

```typescript
// Verify coverage rates
console.log(DEFAULT_COVERAGE_RATES);
// Should be: { skimming: 11, undercoat: 11, finishPaint: 11 }

// Check material prices are loading
const prices = extractPaintingPrices(materialPrices);
console.log("Painting prices:", prices);
```

### Data Not Persisting

```typescript
// Check quote update function is called
const updated = updateQuoteWithPaintings(quote, paintings);
console.log("Updated quote:", updated);

// Verify painting_specifications is in quote
console.log("Has paintings:", !!updated.painting_specifications);
```

## 📚 Documentation Files

- `PAINTING_SYSTEM_DOCS.md` - Full system documentation
- `src/types/painting.ts` - Type definitions with JSDoc
- `src/utils/paintingCalculations.ts` - Calculation logic with comments
- `src/utils/paintingExamples.ts` - Working code examples
- `src/utils/quoteIntegration.ts` - Integration utilities with docs

## 🤝 Support

For questions or issues:

1. Check documentation files
2. Review examples in `paintingExamples.ts`
3. Check types in `painting.ts` for interface details
4. Review unit tests (when created)

## 📅 Timeline

| Phase | Task                      | Status      |
| ----- | ------------------------- | ----------- |
| 1     | Core types & calculations | ✅ Complete |
| 2     | UI components             | ✅ Complete |
| 3     | Quote integration         | ✅ Complete |
| 4     | Backward compatibility    | ✅ Complete |
| 5     | Documentation             | ✅ Complete |
| 6     | Dashboard integration     | 🚀 Next     |
| 7     | Testing & QA              | 🚀 Next     |
| 8     | Production rollout        | 🚀 Next     |
