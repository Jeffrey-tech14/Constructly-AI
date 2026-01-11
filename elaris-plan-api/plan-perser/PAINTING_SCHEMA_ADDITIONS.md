# Painting Schema Additions to Parser

## Overview

The Gemini LLM parser has been updated to extract and generate painting specifications from construction documents.

## Prompt Instructions Added

### Painting Extraction Guidance

The Gemini prompt now instructs the LLM to identify:

- **Categories**: "emulsion" or "enamel"
- **Emulsion Subtypes**: "vinyl-matt", "vinyl-silk", "antibacterial"
- **Enamel Subtypes**: "eggshell", "gloss"
- **Coverage Rates** (Industry Standard):
  - Skimming: 11 m² per 25kg bag per coat
  - Undercoat: 11 m² per litre
  - Finish Paint: 11 m² per litre per coat

### Required Extractions

For each painted surface:

1. Surface area (m²)
2. Location/room name
3. Whether skimming/surface prep is needed
4. Whether undercoat is needed
5. Finish paint category (emulsion vs enamel)
6. Finish paint subtype
7. Number of coats for finishing paint

**Important Note**: Painting areas should be calculated as wall area minus door/window openings.

## Output Schema

### painting: Array of Painting Specifications

Each painting object includes:

```json
{
  "id": "unique-id",
  "surfaceArea": 45.5,
  "location": "Living Room",
  "skimming": {
    "enabled": true,
    "coats": 2,
    "coverage": 11
  },
  "undercoat": {
    "enabled": true,
    "coverage": 11
  },
  "finishingPaint": {
    "category": "emulsion",
    "subtype": "vinyl-matt",
    "coats": 2,
    "coverage": 11
  },
  "calculations": {
    "skimming": {
      "quantity": 8.27,
      "roundedQuantity": 9,
      "grossQuantity": 10,
      "unit": "bags",
      "unitRate": 150,
      "totalCost": 1241.5,
      "totalCostWithWastage": 1500
    },
    "undercoat": {
      "quantity": 4.13,
      "roundedQuantity": 4.5,
      "grossQuantity": 5,
      "unit": "litres",
      "unitRate": 85,
      "totalCost": 351.25,
      "totalCostWithWastage": 425
    },
    "finishing": {
      "quantity": 8.27,
      "roundedQuantity": 9,
      "grossQuantity": 10,
      "unit": "litres",
      "unitRate": 120,
      "totalCost": 992.4,
      "totalCostWithWastage": 1200
    }
  }
}
```

### paintingTotals: Aggregated Totals

```json
{
  "totalArea": 150.5,
  "skimmingBags": 28,
  "skimmingCost": 4200,
  "undercoatLitres": 16.5,
  "undercoatCost": 1402.5,
  "finishingLitres": 32,
  "finishingCost": 3840,
  "totalLitres": 48.5,
  "totalBags": 28,
  "totalCost": 9442.5,
  "totalCostWithWastage": 10500
}
```

## Quantity Types

- **quantity**: Raw calculated quantity based on coverage rates
- **roundedQuantity**: Net quantity rounded to purchasable units (bags or 0.5L increments)
- **grossQuantity**: Rounded quantity adjusted for wastage (what to actually purchase)

## Cost Calculations

- **totalCost**: Based on raw quantity
- **totalCostWithWastage**: Based on gross quantity (what you actually purchase and pay for)

## Integration with Frontend

The painting data extracted by the parser maps directly to:

- `PaintingSpecification` type in `src/types/painting.ts`
- `usePaintingCalculator` hook in `src/hooks/usePaintingCalculator.ts`
- Paintings are stored in quote as `paintings_specifications` and `paintings_totals`

## Example LLM Prompt

The Gemini prompt now includes:

```
**Painting:**
- Multi-layer painting system with coverage-based calculations
- Categories: "emulsion", "enamel"
- Emulsion subtypes: "vinyl-matt", "vinyl-silk", "antibacterial"
- Enamel subtypes: "eggshell", "gloss"
- For each wall/surface with painting, identify:
  - Surface area (m²)
  - Location/room name
  - Whether skimming/surface prep is needed
  - Whether undercoat is needed
  - Finish paint category and subtype
  - Number of coats for finishing paint
- Extract painting areas by calculating wall area minus door/window openings
```

## Usage in Frontend

When a plan is uploaded and parsed:

1. The `painting` array is extracted from the LLM response
2. Data is passed to `usePaintingCalculator` via `initialPaintings` prop
3. User can view and edit painting layers in the Finishes tab
4. Calculations automatically include wastage from finishes settings
5. All data is persisted to quote for later editing
