# Calculator Refactoring - Project Summary

**Status**: Planning & Documentation Complete ✅  
**Last Updated**: December 16, 2025

---

## ✅ COMPLETED

### 1. Rebar Calculator Enhancements

- **Added R6 reinforcement bars** for lintel links

  - Updated `RebarSize` type in `useRebarCalculator.ts`
  - Updated `sizeOptions` in `RebarCalculationForm.tsx`
  - Now available: R6, Y6, Y8, Y10, Y12, Y14, Y16, Y18, Y20, Y22, Y25, Y28, Y32, Y36, Y40, Y50

- **Expanded BRC Mesh Sizes** from 6 to 15 options
  - Previous: A142, A193, A252, A393, C283, C385
  - Updated: A98, A142, A193, A252, A393, B196, B283, B385, B503, B785, C283, C385
  - Better coverage of available mesh options
  - All sizes with accurate wire diameter and weight per m² specifications

---

## 📋 READY FOR IMPLEMENTATION

### Documentation Created:

1. **CALCULATOR_UPDATES.md** - High-level overview of all changes
2. **IMPLEMENTATION_GUIDE.md** - Detailed code-level implementation guide with:
   - Exact code snippets
   - File locations
   - Step-by-step implementation instructions
   - Logic improvements
   - Testing checklist

### Changes By Phase:

#### Phase 2: Polythene & DPC Reorganization

- **Strategy**: Use conditional rendering instead of data restructuring
- **Polythene Sheet**: Show only for slab elements
- **DPC (Damp Proof Course)**: Show only for foundation elements
- **Location**: `ConcreteCalculatorForm.tsx` - `renderWaterproofing()` function
- **Effort**: Low (UI refactoring, no data migration needed)

#### Phase 3: Concrete Calculator Enhancements

- **Add Inputs**:
  - External slab dimensions (separate from wall thickness)
  - Verandah area (additive)
  - Corridor/lobby area (additive)
- **Calculate**: Total slab area = (External L × W) + Verandah + Corridor
- **Update**: Volume calculation to use external dimensions
- **Location**: `ConcreteCalculatorForm.tsx` and `useConcreteCalculator.ts`
- **Effort**: Medium (new fields + updated calculations)

#### Phase 4: Masonry Calculator - Centre Line Method

- **Add Assumptions Display**:
  - Block dimensions used
  - Mortar joint thickness
  - Blocks per m²
  - Wastage percentages
  - Regional multipliers
- **Update Calculation**: Implement centre line method formula
  - Formula: (Length + Width) × 2 × (Height / Block Height) × Blocks per metre
- **Location**: `MasonryCalculatorForm.tsx` and `useMasonryCalculator.ts`
- **Effort**: Medium (calculation update + UI for assumptions)

#### Phase 5: Plumbing Calculator - Dual Estimation Modes

- **Add Mode Toggle**: Detailed vs Quick
- **Quick Mode Features**:
  - Option 1: Lump-sum amount input
  - Option 2: Automatic calculation based on:
    - Number of washrooms
    - Number of kitchens
    - Utilities: water tanks, septic tanks, greywater, sauna, jacuzzi, etc.
- **Keep**: Existing detailed mode logic intact
- **Location**: `PlumbingCalculator.tsx` and related calculation logic
- **Effort**: Medium-High (two complete UI flows)

#### Phase 6: Electrical Calculator - Dual Estimation Modes

- **Add Mode Toggle**: Detailed vs Quick
- **Quick Mode Features**:
  - Input number of rooms
  - Input number of floors
  - Add utilities:
    - Solar installation
    - Boiler
    - CCTV system
    - Fire alarm system
    - Access control
    - AV systems
    - Other special systems
- **Calculation**: Base rate × rooms + per-floor rate + utility multipliers
- **Keep**: Existing detailed mode logic intact
- **Location**: `ElectricalCalculator.tsx` and related calculation logic
- **Effort**: Medium-High (two complete UI flows)

#### Phase 7: Move Plaster to Finishes

- **Add Category**: "Plaster Work" to Finishes Calculator if not present
- **Add Materials**: Common plaster types (cement, gypsum, lime, textured)
- **Location**: `FinishesCalculator.tsx` and `useUniversalFinishesCalculator.ts`
- **Effort**: Low (simple category addition)

---

## 📁 Files Modified So Far

✅ **src/hooks/useRebarCalculator.ts**

- Added R6 to RebarSize type
- Expanded MESH_PROPERTIES with 9 additional BRC sizes

✅ **src/components/RebarCalculationForm.tsx**

- Updated sizeOptions array

---

## 📁 Files to Modify Next

### Phase 2:

- [ ] `src/components/ConcreteCalculatorForm.tsx` (renderWaterproofing function)
- [ ] `src/hooks/useConcreteCalculator.ts` (calculation logic)

### Phase 3:

- [ ] `src/components/ConcreteCalculatorForm.tsx` (add UI fields for slabs)
- [ ] `src/hooks/useConcreteCalculator.ts` (ConcreteRow interface + calculations)

### Phase 4:

- [ ] `src/components/MasonryCalculatorForm.tsx` (add assumptions display)
- [ ] `src/hooks/useMasonryCalculator.ts` (update calculation method)

### Phase 5:

- [ ] `src/components/PlumbingCalculator.tsx` (add mode toggle + quick UI)
- [ ] `src/hooks/usePlumbingCalculator.ts` (if exists - add quick calculation)

### Phase 6:

- [ ] `src/components/ElectricalCalculator.tsx` (add mode toggle + quick UI)
- [ ] `src/hooks/useElectricalCalculator.ts` (if exists - add quick calculation)

### Phase 7:

- [ ] `src/components/FinishesCalculator.tsx` (add plaster category)
- [ ] `src/hooks/useUniversalFinishesCalculator.ts` (if needed)

---

## 💡 Key Implementation Principles

1. **Maintain Backward Compatibility**

   - Existing quotes/projects still work
   - Fallback values where needed
   - No breaking changes to data structures

2. **Keep Logic Intact**

   - All existing calculations remain functional
   - New modes don't interfere with detailed mode
   - Data integrity when switching modes

3. **Progressive Enhancement**

   - New features optional (defaults to existing behavior)
   - UI guides users to new capabilities
   - Assumptions clearly displayed

4. **User-Friendly**
   - Clear labels and help text
   - Assumptions displayed for transparency
   - Sensible defaults for all new fields

---

## 🧪 Testing Strategy

### Unit Tests Needed:

1. **Rebar**: Verify R6 and new BRC sizes in dropdowns
2. **Concrete**: Test slab volume with external dimensions + verandah + corridor
3. **Masonry**: Verify centre line calculation produces expected block counts
4. **Plumbing**: Test quick mode calculations match expected rates
5. **Electrical**: Test quick mode calculations match expected rates
6. **Finishes**: Verify plaster category works correctly

### Integration Tests:

1. Create quote with new features
2. Switch between modes (plumbing/electrical)
3. Export quote with new data
4. Load existing quote (backward compatibility)

### User Acceptance:

1. Assumptions are clear and accurate
2. Calculations match industry standards
3. UI is intuitive and discoverable
4. No performance degradation

---

## 📊 Implementation Timeline Estimate

- **Phase 2 (Polythene/DPC)**: 2-3 hours
- **Phase 3 (Concrete)**: 3-4 hours
- **Phase 4 (Masonry)**: 3-4 hours
- **Phase 5 (Plumbing)**: 4-5 hours
- **Phase 6 (Electrical)**: 4-5 hours
- **Phase 7 (Plaster)**: 1-2 hours
- **Testing & Refinement**: 4-6 hours

**Total Estimate**: 21-29 hours of development

---

## 🎯 Next Steps

1. Review implementation guide: `IMPLEMENTATION_GUIDE.md`
2. Start with Phase 2 (Polythene/DPC reorganization)
3. Test each phase before moving to next
4. Update documentation as needed
5. Conduct user testing on new features

---

## 📞 Quick Reference

**All Changes Documented In**:

- `CALCULATOR_UPDATES.md` - Overview
- `IMPLEMENTATION_GUIDE.md` - Detailed Guide
- This file - Summary & Status

**Code Snippets Location**: See `IMPLEMENTATION_GUIDE.md` for:

- Exact code to add
- File locations
- Before/after examples
- Implementation notes

---

## 🎉 Summary

✅ Phase 1 (Rebar) - **COMPLETE**

- R6 bars added
- BRC mesh expanded to 15 sizes

📋 Phases 2-7 - **DOCUMENTED & READY**

- Detailed implementation guides created
- Code snippets provided
- Testing checklist included
- No blocking issues identified

**Status**: Ready to proceed with Phase 2 implementation
