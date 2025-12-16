# Calculator Updates - Implementation Plan

## Overview

Comprehensive improvements to construction calculators for accuracy, completeness, and better estimation methodologies.

---

## 1. CONCRETE CALCULATOR UPDATES

### 1.1 Slab Calculation Improvements

- **Issue**: Wall area excluded in area calculation; verandah not measured
- **Solution**:
  - Add external dimensions fields for slab (separate from wall area)
  - Add verandah area input field
  - Add corridor/lobby area input field
  - Update volume calculation to use external dimensions only (exclude wall thickness from area)

### 1.2 Component Reorganization

- **Polythene Sheet Movement**:

  - Current: Foundation section (WaterproofingDetails)
  - Move To: Slab section
  - Keep: Calculation logic intact
  - Reason: Polythene is used primarily under slabs for moisture barrier

- **DPC Movement**:
  - Current: Foundation section (WaterproofingDetails)
  - Move To: Masonry/Walling section
  - Keep: Calculation logic intact
  - Reason: DPC (Damp Proof Course) is applied on top of masonry walling

### 1.3 Total Concrete Volume Fix

- Audit calculation logic for completeness
- Ensure all elements are being summed correctly
- Add validation for edge cases (nested elements, overlapping dimensions)

---

## 2. REBAR CALCULATOR UPDATES

### 2.1 Add R6 Reinforcement Bars

- **Use Case**: Links for lintels
- **Implementation**:
  - Add "R6" to available rebar sizes
  - Current sizes: Y8, Y10, Y12, Y16, Y20, Y25
  - New sizes: R6, Y8, Y10, Y12, Y16, Y20, Y25

### 2.2 Additional BRC Mesh Sizes

- **Issue**: Only A98 available
- **Solution**:
  - Research standard BRC mesh sizes in region
  - Add A98, A142, A193, A252, B196, B283, B393, B503, B785 (or regional equivalents)
  - Keep A98 as default for backward compatibility

---

## 3. MASONRY CALCULATOR UPDATES

### 3.1 Centre Line Method Implementation

- **Current**: Block calculation method (not specified)
- **Change To**: Centre line method of measurement
- **Implementation**:
  - Calculate based on center line of walls
  - Formula: (Length + Width) × 2 × Height × 1 meter height of one block per depth
  - Adjust for opening areas (doors, windows)
  - Apply mortar joint allowances

### 3.2 Assumptions Display

- Add assumptions section showing:
  - Standard measurements (e.g., rate per m² of glass)
  - Block dimensions used
  - Mortar joint thickness
  - Wastage percentages
  - Regional multipliers applied
- Display as collapsible section for transparency

---

## 4. PLUMBING CALCULATOR UPDATES

### 4.1 Dual Estimation Modes

- **Mode 1**: Detailed Line-Item (current)

  - Individual pipes, fittings, fixtures
  - Material and labor breakdown

- **Mode 2**: Quick Estimate (new)
  - Lump-sum input option
  - OR automatic calculation based on:
    - Number of washrooms
    - Number of kitchens
    - Extra utilities:
      - Water tanks (count & capacity)
      - Septic tanks
      - Sauna
      - Jacuzzi
      - Other utilities

### 4.2 Implementation Logic

- Keep line-item logic intact
- Add toggle/radio button to switch between modes
- When in quick mode:
  - Hide detailed item input
  - Show utility-based inputs
  - Calculate total based on preset rates per utility
  - Allow manual adjustment of calculated amount

---

## 5. ELECTRICAL CALCULATOR UPDATES

### 5.1 Dual Estimation Modes

- **Mode 1**: Detailed Line-Item (current)

  - Individual circuits, cables, outlets, lighting
  - Material and labor breakdown

- **Mode 2**: Quick Estimate (new)
  - Rough estimate based on:
    - Number of rooms
    - Number of floors
    - Extra utilities:
      - Solar installation (yes/no + capacity)
      - Boiler (yes/no)
      - CCTV system
      - Fire alarm system
      - Access control
      - AV systems
      - Other special systems

### 5.2 Implementation Logic

- Keep line-item logic intact
- Add toggle/radio button to switch between modes
- Preset rates per room per floor
- Multipliers for utilities
- Allow manual adjustment of calculated amount

### 5.3 Component Movement

- **Plaster Movement**:
  - Current: Electrical section (if present)
  - Move To: Finishes Calculator
  - Category: Wall Finishes or separate Paint/Plaster section

---

## 6. FINISHES CALCULATOR UPDATES

### 6.1 Add Plaster Category

- If not already present:
  - Add "Plaster" or "Wall Finishes - Plaster" category
  - Standard materials: Gypsum Plaster, Cement Plaster, Lime Plaster, Textured Plaster
  - Unit: m²
  - Include labor costs

### 6.2 Assumptions Display (Optional)

- Similar to masonry, consider adding assumptions
- Standard rates per m²
- Thickness assumptions
- Wastage percentages

---

## Data Structure Changes

### ConcreteRow Enhancement

```typescript
// Add to slab elements:
slabArea?: string;           // External slab area
verandahArea?: string;       // Verandah area
corridorArea?: string;       // Corridor/lobby area
polytheneDetails?: {         // Move from waterproofing
  includesPolythene: boolean;
  polytheneGauge?: string;
};

// Remove from foundation waterproofing:
// - polytheneDetails (move to slab)
// - dpcDetails (move to masonry)
```

### RebarRow Enhancement

```typescript
// Add to size options:
// Include R6 for lintel links
// Expand MESH_PROPERTIES with additional BRC sizes
```

### PlumbingSystem Enhancement

```typescript
estimationMode?: 'detailed' | 'quick';
lumpSumAmount?: number;
quickEstimate?: {
  washrooms: number;
  kitchens: number;
  tanks: Array<{ type: string; count: number; capacity: number }>;
  utilities: Array<{ name: string; included: boolean }>;
};
```

### ElectricalSystem Enhancement

```typescript
estimationMode?: 'detailed' | 'quick';
quickEstimate?: {
  rooms: number;
  floors: number;
  utilities: Array<{ name: string; included: boolean; details?: string }>;
};
```

---

## Implementation Order (Recommended)

1. **Phase 1 (High Priority)**

   - Concrete Calculator: Add verandah/corridor/external dimensions
   - Concrete Calculator: Fix total concrete volume
   - Move Polythene to Slab section
   - Move DPC to Walling section

2. **Phase 2 (Medium Priority)**

   - Rebar Calculator: Add R6 sizes
   - Rebar Calculator: Add more BRC sizes
   - Masonry Calculator: Implement centre line method
   - Masonry Calculator: Add assumptions display

3. **Phase 3 (Enhancement)**
   - Plumbing Calculator: Add quick estimate mode
   - Electrical Calculator: Add quick estimate mode
   - Add assumptions displays to all calculators

---

## Testing Checklist

- [ ] Concrete calculator produces consistent volumes with new input fields
- [ ] Polythene sheet calculations work in slab section
- [ ] DPC calculations work in masonry section
- [ ] Rebar sizes include R6
- [ ] BRC mesh sizes options expanded
- [ ] Masonry centre line method produces correct block counts
- [ ] Plumbing quick mode calculations match expected values
- [ ] Electrical quick mode calculations match expected values
- [ ] All modes can switch between detailed and quick without data loss
- [ ] Assumptions display is clear and helpful

---

## Notes

- Maintain backward compatibility where possible
- Keep existing calculation logic intact; refactor only as needed
- Test with sample projects before deployment
- Document any new assumptions or methodologies
