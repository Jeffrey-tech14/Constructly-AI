# Advanced Multi-Layer Painting System

## Overview

This system extends the basic painting functionality with a sophisticated multi-layer workflow that models real-world QS (Quantity Surveying) painting practices. It separates painting into distinct sequential layers with independent configuration and calculation.

## Core Architecture

### Layers (Sequential & Dependent)

The painting system is built on three distinct layers, applied in sequence:

```
PAINTING WORKFLOW (Top to Bottom Application)
│
├─ 1. SURFACE PREPARATION (Skimming)
│   ├─ Material: Skimming Filler
│   ├─ Unit: 25 kg bags
│   ├─ Coverage: 10-12 m² per bag per coat
│   ├─ Coats: User-selectable (default: 2)
│   └─ Optional but enabled by default
│
├─ 2. PAINT PREPARATION (Undercoat)
│   ├─ Material: Undercoat / Covermat
│   ├─ Unit: Litres
│   ├─ Coverage: 10-12 m² per litre
│   ├─ Coats: Fixed at 1
│   └─ Must be applied before finishing unless explicitly disabled
│
└─ 3. FINISHING PAINT (Visible Layer)
    ├─ Categories:
    │  ├─ Emulsion (Water-based)
    │  │  ├─ Vinyl Matt
    │  │  ├─ Vinyl Silk
    │  │  └─ Antibacterial
    │  └─ Enamel (Oil-based)
    │     ├─ Eggshell (Low Sheen)
    │     └─ Gloss (High Sheen)
    ├─ Unit: Litres
    ├─ Coverage: 10-12 m² per litre per coat
    ├─ Coats: User-selectable (default: 2)
    └─ Always applied (main visible coat)
```

## Data Model

### PaintingSpecification

```typescript
interface PaintingSpecification {
  id: string; // Unique identifier
  surfaceArea: number; // m² to paint
  location?: string; // e.g., "Living Room - East Wall"

  skimming: SkimmingConfig; // Surface prep configuration
  undercoat: UndercoatConfig; // Prep layer configuration
  finishingPaint: FinishingPaintConfig; // Visible paint configuration

  calculations: {
    skimming: LayerCalculation | null;
    undercoat: LayerCalculation | null;
    finishing: LayerCalculation | null;
  };

  createdAt: string;
  updatedAt: string;
  legacyPaintingData?: any; // For backward compatibility
}
```

### LayerCalculation

Each layer stores complete calculation details:

```typescript
interface LayerCalculation {
  layerType: "skimming" | "undercoat" | "finishing";
  material: string;
  enabled: boolean;
  coats: number;
  coverage: number; // m² per unit
  quantity: number; // Raw calculated value
  roundedQuantity: number; // Rounded to purchasable units
  unit: "bags" | "litres";
  unitRate: number; // Price per unit
  totalCost: number;
  totalCostWithWastage: number; // Using rounded quantity
}
```

## Calculation Formula

### For Each Layer

```
litres_required = (wall_area_m²) / (coverage_m²_per_litre) × coats
bags_required = (wall_area_m²) / (coverage_m²_per_bag) × coats
```

### Rounding Rules

- **Bags (Skimming)**: Always round up to whole number
  - 5.1 bags → 6 bags
- **Litres (Paint)**: Round up to nearest 0.5L (common purchase size)
  - 4.6L → 5.0L
  - 5.1L → 5.5L

### Cost Calculation

```
totalCost = rawQuantity × unitRate
totalCostWithWastage = roundedQuantity × unitRate
```

The `totalCostWithWastage` reflects the actual cost when purchasing rounded quantities.

## Features

### 1. Layer Independence

Each layer can be independently:

- Enabled/disabled
- Configured (coats, type)
- Calculated and priced

### 2. Validation & Guardrails

The system enforces:

- ✅ Finishing paint always requires either skimming OR undercoat
- ✅ Enamel paint requires preparation (can't apply directly to plaster)
- ✅ Coat counts must be reasonable (1-5 for skimming, 1-4 for paint)
- ✅ Surface area must be positive
- ⚠️ Warnings for unusually large areas (>5000 m²)

### 3. Defaults Follow QS Best Practice

```typescript
DEFAULT_PAINTING_CONFIG = {
  skimming: {
    enabled: true, // Enabled for internal walls
    coats: 2, // Common standard
  },
  undercoat: {
    enabled: true, // Always applied
  },
  finishingPaint: {
    category: "emulsion",
    subtype: "vinyl-matt",
    coats: 2, // Standard interior painting
  },
};
```

### 4. Backward Compatibility

- Legacy paint finishes from old system are automatically migrated
- Existing quotes continue to work unchanged
- New quotes use enhanced system by default
- Migration flag tracks quotes converted from old system

## React Hook: usePaintingCalculator

```typescript
const {
  paintings, // All painting specifications
  totals, // Summary totals across all surfaces
  addPainting, // Create new painting surface
  updatePainting, // Update any property
  updateSkimming, // Quick update skimming layer
  updateUndercoat, // Quick update undercoat layer
  updateFinishingPaint, // Quick update finishing paint
  deletePainting, // Remove a surface
  validate, // Validate a specification
  getPainting, // Get by ID
  calculateAll, // Recalculate all specifications
} = usePaintingCalculator({
  initialPaintings,
  materialPrices,
  quote,
  onPaintingsChange,
});
```

## Component: PaintingLayerConfig

Provides expandable UI for configuring all layers:

- **Surface Preparation**: Enable/disable, select coat count
- **Undercoat**: Enable/disable (fixed at 1 coat)
- **Finishing Paint**: Select category, subtype, coat count

Each layer shows:

- Raw and rounded quantities
- Coverage rate
- Estimated cost
- Validation errors/warnings

## Quote Integration

### Persistence

All painting data is stored in the quote object:

```typescript
quote.painting_specifications: PaintingSpecification[]
quote.painting_data: {
  paintings: PaintingSpecification[];
  migratedFromLegacy: boolean;
  legacyPaintFinishes?: FinishElement[];
}
```

### Extracting Data

```typescript
import { extractPaintingsFromQuote } from "@/utils/quoteIntegration";

const { paintings, legacyPaintFinishes } = extractPaintingsFromQuote(quote);
```

### Updating Quote

```typescript
import { updateQuoteWithPaintings } from "@/utils/quoteIntegration";

const updatedQuote = updateQuoteWithPaintings(quote, paintings, keepLegacy);
```

## Usage Example

### In a Component

```tsx
import { FinishesCalculator } from "@/components/FinishesCalculator";
import { extractPaintingsFromQuote } from "@/utils/quoteIntegration";

function MyQuoteComponent() {
  const [quote, setQuote] = useState(initialQuote);
  const { paintings } = extractPaintingsFromQuote(quote);

  return (
    <FinishesCalculator
      finishes={quote.finishes}
      materialPrices={quote.materialPrices}
      paintings={paintings}
      quote={quote}
      onPaintingsUpdate={(updated) => {
        setQuote((prev) => updateQuoteWithPaintings(prev, updated));
      }}
      setQuoteData={setQuote}
    />
  );
}
```

## Material Price Configuration

Painting material prices are read from the `materialPrices` array:

```typescript
[
  {
    name: "paint",
    type: {
      materials: {
        "Skimming Filler": 250, // Per 25kg bag
        "Undercoat / Covermat": 350, // Per litre
        "Emulsion - Vinyl Matt": 400, // Per litre
        "Emulsion - Vinyl Silk": 420, // Per litre
        "Enamel - Gloss": 450, // Per litre
        // ... etc
      },
    },
  },
];
```

## Reporting & Export

### Generate CSV

```typescript
import { exportPaintingsToCsv } from "@/utils/quoteIntegration";

const csv = exportPaintingsToCsv(paintings);
```

### Generate Report

```typescript
import { generatePaintingReport } from "@/utils/quoteIntegration";

const report = generatePaintingReport(paintings);
console.log(report);
```

Output includes:

- Each surface with all layers
- Quantities and costs
- Grand totals
- Professional formatting

## Validation Rules

### Errors (Block Quote)

- Finishing paint without preparation layer
- Enamel without preparation layer
- Invalid paint subtype for category
- Surface area <= 0

### Warnings (Notify User)

- Coat counts outside reasonable bounds
- Unusually large surface areas

## Migration Strategy

### For Existing Quotes

1. Old paint finishes detected in `quote.finishes`
2. Automatically converted using `migrateLegacyPainting()`
3. Migration flag set: `painting_data.migratedFromLegacy = true`
4. Legacy data preserved: `painting_data.legacyPaintFinishes`
5. Original finishes unchanged (if `keepLegacy = true`)

### For New Quotes

- Use new system by default
- All layer configuration available
- No migration needed

## Best Practices

### Surface Area Definition

- Include all walls to be painted
- For rooms: length × height × walls
- Account for door/window deductions separately if needed

### Layer Configuration

- Use defaults unless project-specific requirements
- Enamel always requires preparation
- Skimming important for uneven/damaged surfaces
- Undercoat improves paint adhesion and coverage

### Cost Management

- Review material prices before calculation
- Round quantities reflect real market purchases
- Monitor total costs across all surfaces
- Export report for stakeholder approval

## Performance Notes

- Calculations are instant (no network calls)
- Hook uses useCallback for optimization
- All state managed locally
- Only persists to quote on explicit save

## Technical Stack

- **Language**: TypeScript
- **Framework**: React with hooks
- **UI**: shadcn/ui components
- **Validation**: Custom validation logic
- **Persistence**: Quote object integration

## Future Enhancements

Possible additions:

- Paint sheen profiles by climate
- Surface condition pre-calculations (rough, smooth, new)
- Seasonal material price adjustments
- Multi-space painting templates
- Contractor rate comparisons
- Historical quote comparisons
