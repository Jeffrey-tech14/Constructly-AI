# Implementation Guide - Calculator Refactoring

## COMPLETED ✅

- R6 added to RebarSize type and sizeOptions
- BRC mesh sizes expanded from 6 to 15 types (A98, A142, A193, A252, A393, B196, B283, B385, B503, B785, C283, C385)

---

## PHASE 2: POLYTHENE & DPC REORGANIZATION

### Strategy: Conditional Rendering

Instead of completely restructuring, use conditional rendering to show polythene/DPC in different sections based on element type.

### ConcreteCalculatorForm.tsx Changes

#### 1. Modify renderWaterproofing function

- Add conditional logic: Only show DPC for foundation elements
- Only show Polythene for slab elements
- Keep waterproofing for both

```typescript
const renderWaterproofing = (row: ConcreteRow) => {
  const shouldShowDPC = row.element === "foundation";
  const shouldShowPolythene = row.element === "slab";

  return (
    <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
      <h4 className="font-semibold text-green-800 dark:text-green-200">
        {row.element === "slab"
          ? "Slab Details & Polythene"
          : "Waterproofing & DPC Details"}
      </h4>
      <div className="grid sm:grid-cols-2 gap-4">
        {shouldShowDPC && (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={row.waterproofing?.includesDPC || false}
              onCheckedChange={(checked) =>
                updateRow(row.id, "waterproofing", {
                  ...row.waterproofing,
                  includesDPC: checked === true,
                })
              }
            />
            <Label className="text-sm font-medium">Include DPC</Label>
          </div>
        )}

        {shouldShowPolythene && (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={row.waterproofing?.includesPolythene || false}
              onCheckedChange={(checked) =>
                updateRow(row.id, "waterproofing", {
                  ...row.waterproofing,
                  includesPolythene: checked === true,
                })
              }
            />
            <Label className="text-sm font-medium">
              Include Polythene Sheet
            </Label>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={row.waterproofing?.includesWaterproofing || false}
            onCheckedChange={(checked) =>
              updateRow(row.id, "waterproofing", {
                ...row.waterproofing,
                includesWaterproofing: checked === true,
              })
            }
          />
          <Label className="text-sm font-medium">Include Waterproofing</Label>
        </div>
      </div>
      // ... rest of conditional DPC/Polythene fields ...
    </div>
  );
};
```

#### 2. Update the calculation logic

In useConcreteCalculator.ts, ensure DPC and Polythene calculations only apply to appropriate elements:

```typescript
// In calculateConcreteAndMaterials function:
if (waterproofing.includesDPC && row.element === "foundation") {
  // DPC calculation logic
}

if (waterproofing.includesPolythene && row.element === "slab") {
  // Polythene calculation logic
}
```

---

## PHASE 3: CONCRETE CALCULATOR ENHANCEMENTS

### Add Verandah, Corridor & External Dimensions

#### 1. Update ConcreteRow interface

Add to useConcreteCalculator.ts:

```typescript
export interface ConcreteRow {
  // ... existing fields ...

  // For slabs - add these:
  slabExternalLength?: string; // External dimension (excludes walls)
  slabExternalWidth?: string; // External dimension (excludes walls)
  verandahArea?: string; // Separate verandah area
  corridorArea?: string; // Separate corridor/lobby area
  slabArea?: string; // Total slab area (calculated or manual)
}
```

#### 2. Add UI inputs in ConcreteCalculatorForm.tsx

For slab elements, add these fields:

```tsx
{
  row.element === "slab" && (
    <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
      <h4 className="font-semibold text-blue-800 dark:text-blue-200">
        Slab Area Details
      </h4>
      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <Label>External Length (m)</Label>
          <Input
            type="number"
            value={row.slabExternalLength || ""}
            onChange={(e) =>
              updateRow(row.id, "slabExternalLength", e.target.value)
            }
            placeholder="External slab length"
          />
        </div>
        <div>
          <Label>External Width (m)</Label>
          <Input
            type="number"
            value={row.slabExternalWidth || ""}
            onChange={(e) =>
              updateRow(row.id, "slabExternalWidth", e.target.value)
            }
            placeholder="External slab width"
          />
        </div>
        <div>
          <Label>Verandah Area (m²)</Label>
          <Input
            type="number"
            value={row.verandahArea || ""}
            onChange={(e) => updateRow(row.id, "verandahArea", e.target.value)}
            placeholder="Additional verandah area"
          />
        </div>
        <div>
          <Label>Corridor/Lobby Area (m²)</Label>
          <Input
            type="number"
            value={row.corridorArea || ""}
            onChange={(e) => updateRow(row.id, "corridorArea", e.target.value)}
            placeholder="Corridor or lobby area"
          />
        </div>
      </div>
      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
        <small className="text-blue-900 dark:text-blue-200">
          <strong>Total Area:</strong> (External L × W) + Verandah + Corridor
        </small>
      </div>
    </div>
  );
}
```

#### 3. Update calculation logic

In useConcreteCalculator.ts, update the volume calculation:

```typescript
const calculateSlabVolume = (row: ConcreteRow): number => {
  let slabArea = 0;

  if (row.slabExternalLength && row.slabExternalWidth) {
    const extLen = parseFloat(row.slabExternalLength) || 0;
    const extWid = parseFloat(row.slabExternalWidth) || 0;
    slabArea = extLen * extWid; // Use external dimensions (no wall thickness)
  } else if (row.length && row.width) {
    // Fallback to legacy length/width if no external dimensions
    slabArea = parseFloat(row.length) * parseFloat(row.width) || 0;
  }

  // Add verandah and corridor areas
  slabArea += parseFloat(row.verandahArea || "0") || 0;
  slabArea += parseFloat(row.corridorArea || "0") || 0;

  const depth = parseFloat(row.height || "0.15") || 0.15; // Default 150mm slab
  return slabArea * depth;
};
```

---

## PHASE 4: MASONRY CALCULATOR - CENTRE LINE METHOD

### Current Issue

Block calculation method not clearly specified.

### Solution: Implement Centre Line Method

#### 1. Update MasonryCalculatorForm.tsx

Add assumption display:

```tsx
<Card className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
  <h4 className="font-semibold mb-2">Measurement Assumptions</h4>
  <ul className="text-sm space-y-1 text-yellow-900 dark:text-yellow-200">
    <li>
      ✓ Block calculation uses <strong>Centre Line Method</strong>
    </li>
    <li>✓ Standard Block: 400×200×200mm (L×H×T)</li>
    <li>✓ Mortar Joint: 10mm</li>
    <li>✓ Blocks per m²: ~12.5 (with mortar)</li>
    <li>✓ Wastage: {qsSettings?.blockWastagePercent || 5}%</li>
    <li>✓ Regional Multiplier: {regionalMultiplier}x</li>
  </ul>
</Card>
```

#### 2. Update calculation logic in useMasonryCalculator.ts

```typescript
// Centre line method calculation
const calculateCentreLineLength = (room: Room): number => {
  // (Length + Width) × 2 × (Height / Block Height) × Block Adjustment
  const centreLinePerimeter = (room.length + room.width) * 2;
  const numberOfCourses = Math.ceil((room.height || 2.8) / BLOCK_HEIGHT);

  return centreLinePerimeter * numberOfCourses;
};

const calculateBlocksFromCentreLine = (centreLineLength: number): number => {
  // Blocks per metre based on block size and mortar joint
  const blocksPerMetre = 2.5; // For 400mm blocks (400mm + 10mm mortar joint = 410mm)
  return Math.ceil(centreLineLength * blocksPerMetre);
};
```

---

## PHASE 5: PLUMBING CALCULATOR - DUAL ESTIMATION MODES

### Add Toggle Between Modes

#### 1. Update PlumbingCalculator.tsx component state:

```tsx
const [estimationMode, setEstimationMode] = useState<"detailed" | "quick">(
  "detailed"
);
const [lumpSumAmount, setLumpSumAmount] = useState<number | undefined>();
const [quickEstimate, setQuickEstimate] = useState({
  washrooms: 0,
  kitchens: 0,
  tanks: [] as Array<{
    type: "water" | "septic" | "greywater";
    count: number;
    capacity?: number;
  }>,
  utilities: [] as Array<{ name: string; included: boolean }>,
});
```

#### 2. Add mode toggle UI:

```tsx
<div className="flex gap-2 mb-4">
  <Button
    variant={estimationMode === "detailed" ? "default" : "outline"}
    onClick={() => setEstimationMode("detailed")}
  >
    Detailed Estimation
  </Button>
  <Button
    variant={estimationMode === "quick" ? "default" : "outline"}
    onClick={() => setEstimationMode("quick")}
  >
    Quick Estimate
  </Button>
</div>
```

#### 3. Conditional rendering:

```tsx
{estimationMode === "detailed" && (
  // Existing detailed UI
)}

{estimationMode === "quick" && (
  <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md">
    <h4 className="font-semibold">Quick Plumbing Estimate</h4>

    {/* Lump Sum Option */}
    <div className="space-y-2">
      <Label>Or Use Lump Sum Amount (Ksh)</Label>
      <Input
        type="number"
        value={lumpSumAmount || ""}
        onChange={(e) => setLumpSumAmount(parseFloat(e.target.value))}
        placeholder="Enter total plumbing cost"
      />
    </div>

    {/* Utility Based */}
    <Tabs defaultValue="utilities">
      <TabsList>
        <TabsTrigger value="utilities">Utilities</TabsTrigger>
        <TabsTrigger value="fixtures">Fixtures & Tanks</TabsTrigger>
      </TabsList>

      <TabsContent value="utilities" className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-2">
          <div>
            <Label>Number of Washrooms</Label>
            <Input
              type="number"
              value={quickEstimate.washrooms}
              onChange={(e) => setQuickEstimate({...quickEstimate, washrooms: parseInt(e.target.value) || 0})}
              min="0"
            />
          </div>
          <div>
            <Label>Number of Kitchens</Label>
            <Input
              type="number"
              value={quickEstimate.kitchens}
              onChange={(e) => setQuickEstimate({...quickEstimate, kitchens: parseInt(e.target.value) || 0})}
              min="0"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="fixtures" className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-2">
          {["water-tank", "septic-tank", "greywater-tank", "sauna", "jacuzzi"].map((utility) => (
            <Button key={utility} variant="outline" onClick={() => { /* Add utility */ }}>
              + Add {utility.replace(/-/g, " ")}
            </Button>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  </div>
)}
```

#### 4. Calculation method:

```typescript
const calculateQuickPlumbingEstimate = (quickEstimate, rates) => {
  let total = 0;

  // Base rates
  total += quickEstimate.washrooms * rates.perWashroom; // e.g., 15,000 Ksh
  total += quickEstimate.kitchens * rates.perKitchen;   // e.g., 8,000 Ksh

  // Utilities
  quickEstimate.tanks.forEach((tank) => {
    const rate = rates.tanks[tank.type] || 25,000;
    total += tank.count * rate;
  });

  // Add per-tank multiplier for capacity
  const specialUtilities = quickEstimate.utilities.filter(u => u.included);
  specialUtilities.forEach((utility) => {
    total += rates.utilities[utility.name] || 10,000;
  });

  return total;
};
```

---

## PHASE 6: ELECTRICAL CALCULATOR - DUAL ESTIMATION MODES

### Parallel implementation to Plumbing

#### 1. Add state:

```tsx
const [estimationMode, setEstimationMode] = useState<"detailed" | "quick">(
  "detailed"
);
const [quickEstimate, setQuickEstimate] = useState({
  rooms: 0,
  floors: 1,
  hasAlternateSource: false,
  utilities: [] as Array<{ name: string; included: boolean; details?: string }>,
});
```

#### 2. Quick estimate inputs:

```tsx
{
  estimationMode === "quick" && (
    <div className="space-y-4 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-md">
      <h4 className="font-semibold">Quick Electrical Estimate</h4>

      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <Label>Number of Rooms</Label>
          <Input
            type="number"
            min="1"
            value={quickEstimate.rooms}
            onChange={(e) =>
              setQuickEstimate({
                ...quickEstimate,
                rooms: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
        <div>
          <Label>Number of Floors</Label>
          <Input
            type="number"
            min="1"
            value={quickEstimate.floors}
            onChange={(e) =>
              setQuickEstimate({
                ...quickEstimate,
                floors: parseInt(e.target.value) || 1,
              })
            }
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Extra Utilities</Label>
        <div className="space-y-2">
          {[
            "solar",
            "boiler",
            "cctv",
            "fire-alarm",
            "access-control",
            "av-systems",
          ].map((utility) => (
            <div key={utility} className="flex items-center space-x-2">
              <Checkbox
                checked={quickEstimate.utilities.some(
                  (u) => u.name === utility
                )}
                onCheckedChange={(checked) => {
                  setQuickEstimate({
                    ...quickEstimate,
                    utilities: checked
                      ? [
                          ...quickEstimate.utilities,
                          { name: utility, included: true },
                        ]
                      : quickEstimate.utilities.filter(
                          (u) => u.name !== utility
                        ),
                  });
                }}
              />
              <Label className="capitalize">{utility.replace(/-/g, " ")}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

#### 3. Calculation:

```typescript
const calculateQuickElectricalEstimate = (quickEstimate, rates) => {
  const basePerRoom = rates.perRoom || 5,000; // Ksh
  const basePerFloor = rates.perFloor || 15,000; // Ksh

  let total = (quickEstimate.rooms * basePerRoom) + (quickEstimate.floors * basePerFloor);

  // Add utilities
  quickEstimate.utilities.forEach((utility) => {
    total += rates.utilities[utility.name] || 20,000;
  });

  return total;
};
```

---

## PHASE 7: MOVE PLASTER TO FINISHES

### Simple Fix - Add Category to Finishes Calculator

#### In FinishesCalculator.tsx:

Check if "paint" category exists. If not, add "plaster" as separate category:

```typescript
const FINISH_CATEGORIES = [
  // ... existing ...
  { value: "plaster", label: "Plaster Work" },
];

const COMMON_MATERIALS = {
  // ... existing ...
  plaster: [
    "Cement Plaster (1:4)",
    "Gypsum Plaster",
    "Lime Plaster",
    "Textured Plaster",
    "Smooth Plaster",
  ],
};
```

---

## TESTING CHECKLIST

- [ ] R6 rebar size appears in all dropdown selects
- [ ] BRC mesh grades show all 15 sizes
- [ ] Polythene sheet only appears for slab elements
- [ ] DPC only appears for foundation elements
- [ ] Verandah/corridor areas are additive to slab area
- [ ] Plumbing can toggle between detailed and quick mode
- [ ] Quick plumbing calculates based on washrooms + kitchens + utilities
- [ ] Electrical can toggle between detailed and quick mode
- [ ] Quick electrical calculates based on rooms + floors + utilities
- [ ] Plaster category appears in Finishes calculator
- [ ] All calculations maintain data integrity when switching modes

---

## Implementation Priority

1. **HIGH**: R6 rebar sizes, BRC mesh expansion (DONE ✅)
2. **HIGH**: Polythene/DPC conditional rendering
3. **MEDIUM**: Verandah/corridor area inputs for slab
4. **MEDIUM**: Masonry centre line method + assumptions display
5. **MEDIUM**: Plumbing dual mode
6. **MEDIUM**: Electrical dual mode
7. **LOW**: Move plaster to finishes

---

## Notes

- All changes maintain backward compatibility
- Existing calculation logic preserved
- New fields have sensible defaults
- UI uses consistent patterns across all calculators
