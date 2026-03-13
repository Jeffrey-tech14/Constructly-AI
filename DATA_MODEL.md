# Constructly AI - Data Model Reference

> Complete guide to data structures, TypeScript interfaces, and database relationships

---

## 📌 Table of Contents

1. [Core Data Types](#core-data-types)
2. [Quote Models](#quote-models)
3. [Calculator Input/Output Models](#calculator-inputoutput-models)
4. [Material & Pricing Models](#material--pricing-models)
5. [Component Models](#component-models)
6. [Database Schema](#database-schema)
7. [Type Safety Patterns](#type-safety-patterns)
8. [Data Validation](#data-validation)

---

## Core Data Types

### User Profile

**Location:** `src/types/auth.ts`

```typescript
interface Profile {
  id: string; // UUID from auth.users
  email: string;
  full_name: string;
  company_name: string;
  phone: string;
  region: string; // Nairobi, Mombasa, Kisumu, etc.
  avatar_url: string;
  tier: "free" | "professional" | "premium";
  total_quotes_created: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

### User Settings & Preferences

```typescript
interface UserSettings {
  user_id: string; // References profiles.id

  // Pricing preferences
  default_wastage_percent: number;
  default_contingency_percent: number;
  default_labor_rate_per_hour: number;

  // Display preferences
  currency: "KES" | "USD";
  decimal_places: 2 | 3 | 4;
  theme: "light" | "dark";

  // Quote defaults
  default_project_margin_percent: number;
  auto_save_enabled: boolean;
  auto_save_interval_ms: number; // Milliseconds
}
```

---

## Quote Models

### Quote Document

**Location:** `src/types/quote.ts`

```typescript
interface Quote {
  // ═══════════════════════════════════════════════════════════════
  // METADATA SECTION
  // ═══════════════════════════════════════════════════════════════

  id: string; // UUID
  user_id: string; // References profiles.id
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp

  // ═══════════════════════════════════════════════════════════════
  // PROJECT INFORMATION
  // ═══════════════════════════════════════════════════════════════

  project_name: string;
  project_description: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  project_location: string;
  project_region: string; // For regional pricing multiplier

  // Dates
  start_date: string; // ISO date
  end_date: string; // ISO date
  estimated_duration_days: number;

  // ═══════════════════════════════════════════════════════════════
  // QUOTE SETTINGS
  // ═══════════════════════════════════════════════════════════════

  qs_settings: QuoteSettings;

  // ═══════════════════════════════════════════════════════════════
  // CALCULATOR SECTIONS (INPUT + OUTPUT)
  // ═══════════════════════════════════════════════════════════════

  // Concrete / Excavation
  concrete_input: ConcreteInput;
  concrete_totals: ConcreteCalculation;

  // Masonry / Walls / Doors / Windows
  masonry_walls: WallSection[];
  doors: Door[];
  windows: Window[];
  masonry_totals: MasonryTotals;

  // Electrical
  electrical_input: ElectricalInput;
  electrical_totals: ElectricalCalculation;

  // Plumbing
  plumbing_input: PlumbingInput;
  plumbing_totals: PlumbingCalculation;

  // Roofing
  roofing_input: RoofingInput;
  roofing_totals: RoofingCalculation;

  // Painting (Multi-layer)
  paintings_specifications: PaintingSpecification[];
  paintings_totals: Record<string, PaintingTotals>; // By location

  // Internal & External Finishes
  internal_finishes_input: InternalFinishesInput;
  internal_finishes_totals: FinishesTotals;

  external_finishes_input: ExternalFinishesInput;
  external_finishes_totals: FinishesTotals;

  // Other Domains
  flooring_input: FlooringInput;
  flooring_totals: FlooringTotals;

  ceiling_input: CeilingInput;
  ceiling_totals: CeilingTotals;

  equipment_selections: EquipmentSelection[];
  services_selections: ServiceSelection[];
  subcontractors_selections: SubcontractorSelection[];

  // ═══════════════════════════════════════════════════════════════
  // BOQ & PRELIMINARIES
  // ═══════════════════════════════════════════════════════════════

  preliminaries_specifications: PreliminariesItem[];
  preliminaries_total: number;

  boq_lines: BOQLine[];

  // ═══════════════════════════════════════════════════════════════
  // FINANCIAL SUMMARY
  // ═══════════════════════════════════════════════════════════════

  // Totals by category
  materials_total: number;
  labor_total: number;
  equipment_total: number;
  services_total: number;

  // Applied margins
  preliminaries_amount: number;
  contingency_amount: number;
  custom_margin_amount: number;

  // Final totals
  subtotal: number; // Before margins
  total_cost: number; // Final with margins

  // ═══════════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════════

  custom_specs: string; // Additional notes
  status:
    | "draft"
    | "planning"
    | "inquiry"
    | "proposed"
    | "accepted"
    | "rejected";

  // Export URLs
  pdf_url?: string;
  excel_url?: string;

  // Version tracking
  version: number;
  is_archived: boolean;
}
```

### Quote Settings

```typescript
interface QuoteSettings {
  // Wastage settings (percentages)
  wastage_concrete: number; // %, e.g., 5
  wastage_masonry: number; // %, e.g., 10
  wastage_finishes: number; // %, e.g., 10
  wastage_paint: number; // %, e.g., 10

  // Wall geometry (for calculations)
  wall_height: number; // meters, e.g., 2.4
  internal_wall_perimeter: number; // meters
  external_wall_perimeter: number; // meters
  internal_wall_area: number; // m²
  external_wall_area: number; // m²
  floor_area: number; // m²

  // Margins & adjustments
  labor_rate_per_hour: number; // KES
  equipment_daily_rate: number; // KES
  preliminary_percentage: number; // %, e.g., 15
  contingency_percentage: number; // %, e.g., 10
  profit_margin_percentage: number; // %, e.g., 20

  // Feature toggles
  include_preliminaries: boolean;
  include_contingency: boolean;
  include_profit_margin: boolean;

  // Quote format
  currency: "KES" | "USD";
  number_format: "1,234.56" | "1.234,56";
  dp_places: 2 | 3;
}
```

---

## Calculator Input/Output Models

### Concrete Calculator

```typescript
// INPUT
interface ConcreteInput {
  shape: "rectangular" | "circular" | "complex";

  // Rectangular dimensions
  length?: number; // meters
  width?: number; // meters
  height: number; // meters

  // Circular dimensions
  diameter?: number; // meters
  radius?: number; // meters

  // Properties
  wastage_percent: number; // %, e.g., 5
  unit_price: number; // KES per m³
  density: number; // kg/m³, typically 2400
}

// OUTPUT
interface ConcreteCalculation {
  volume: number; // m³
  volume_with_wastage: number; // m³
  category_wastage: number; // m³
  total_weight: number; // kg
  cost_kes: number; // Total cost

  // Additional metrics
  cement_required: number; // kg, if using standard mix
  sand_required: number; // m³
  aggregate_required: number; // m³
  water_required: number; // liters
}
```

### Masonry Calculator

```typescript
// Wall Section (represents a section of brick/block wall)
interface WallSection {
  id: string;
  name: string; // e.g., "Exterior Wall - Front"

  // Dimensions
  perimeter: number; // meters
  height: number; // meters
  area: number; // m² (calculated)

  // Material
  material_type: "brick" | "block" | "stone";
  brick_size: "standard" | "jumbo" | "custom";
  brick_dimensions?: { length: number; width: number; height: number }; // mm
  bricks_per_m2: number; // Standard metric

  // Quantities
  brick_count: number;
  mortar_volume: number; // m³
  mortar_wastage_percent: number;

  // Labor
  labor_hours: number;
  labor_rate_per_hour: number;

  // Finishes (optional)
  plaster_thickness: number; // mm, typically 25
  plaster_type: "cement" | "lime" | "gypsum";
  plaster_required: number; // m³

  // Costs
  material_cost: number;
  labor_cost: number;
  total_cost: number;

  // DPC & Reinforcement (optional)
  includes_dpc: boolean;
  dpc_type?: "plastic" | "slate" | "lime";
  includes_hoop_iron: boolean;
  hoop_iron_weight?: number; // kg
}

interface MasonryTotals {
  total_bricks: number;
  total_mortar: number; // m³
  total_plaster: number; // m³
  total_labor_hours: number;
  material_cost: number;
  labor_cost: number;
  total_cost: number;
}
```

### Door & Window Models

```typescript
// DOOR STRUCTURE
interface Door {
  id: string;
  quantity: number;

  // Size
  size_type: "standard" | "custom";
  standard_size?: "2400x900" | "2400x1000"; // Height x Width (mm)
  custom?: {
    height: number; // mm
    width: number; // mm
    price?: number;
  };

  // Door Type
  door_type: "steel" | "flush" | "panel" | "t&g" | "aluminum";
  door_price?: number;

  // Wall interface
  wall_thickness: number; // mm

  // ═══════════════════════════════════════════════════════════════
  // FRAME
  // ═══════════════════════════════════════════════════════════════

  frame: {
    type: string; // Hardwood, softwood, aluminum, etc.
    sizeType: "standard" | "custom";
    standardSize?: string;
    height: string;
    width: string;
    thickness?: string; // Related to wall thickness
    custom?: {
      height: string;
      width: string;
      price?: number;
    };
    price?: number;
  };

  // ═══════════════════════════════════════════════════════════════
  // OPTIONAL COMPONENTS (Checkbox-enabled)
  // ═══════════════════════════════════════════════════════════════

  // Architrave (decorative trim):
  architrave?: {
    enabled?: boolean; // Checkbox state
    selected?: { type?: string; size?: string };
    customSize?: string;
    quantity?: number; // Auto-calculated from perimeter
    price?: number;
  };

  // Quarter round (optional trim):
  quarterRound?: {
    enabled?: boolean;
    selected?: { type?: string; size?: string };
    customSize?: string;
    quantity?: number;
    price?: number;
  };

  // Ironmongery (hardware):
  ironmongery?: {
    hinges?: {
      enabled?: boolean; // Checkbox: include hinges?
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number; // Usually 3 for standard door
      price?: number;
    };
    locks?: {
      enabled?: boolean;
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number; // Usually 1
      price?: number;
    };
    handles?: {
      enabled?: boolean;
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number; // Usually 1-2
      price?: number;
    };
    bolts?: {
      enabled?: boolean;
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number;
      price?: number;
    };
    closers?: {
      enabled?: boolean;
      selected?: { type?: string; size?: string };
      customSize?: string;
      quantity?: number; // Usually 1
      price?: number;
    };
  };

  // Transom / Fanlight (upper window):
  transom?: {
    enabled?: boolean; // Checkbox: include transom?
    height?: string; // mm
    width?: string; // mm
    quantity?: number;
    price?: number;
    glazing?: {
      included?: boolean;
      glassAreaM2?: number;
      glassPricePerM2?: number;
    };
  };

  // Overall cost
  total_price?: number;
}

// WINDOW (Similar structure to Door)
interface Window {
  id: string;
  quantity: number;

  size_type: "standard" | "custom";
  standard_size?: string;
  custom?: {
    height: number;
    width: number;
    price?: number;
  };

  window_type: "aluminum_frame" | "timber_frame" | "pvcu";
  glass_type: "clear" | "tinted" | "frosted";
  glass_thickness?: "4mm" | "6mm" | "8mm";

  wall_thickness: number;

  // Frame details
  frame?: {
    type: string;
    price?: number;
  };

  // Hardware
  ironmongery?: {
    handles?: { enabled?: boolean; quantity?: number; price?: number };
    hinges?: { enabled?: boolean; quantity?: number; price?: number };
    // ... other hardware
  };

  total_price?: number;
}
```

### Painting Models

```typescript
// PAINTING SPECIFICATION (Multi-layer)
interface PaintingSpecification {
  id: string;
  location:
    | "Interior Walls"
    | "Exterior Walls"
    | "Doors & Windows"
    | "Ceilings";
  surface_area: number; // m²

  // Layer specifications
  skimming?: PaintingLayer;
  undercoat?: PaintingLayer;
  finishing?: PaintingLayer;

  // Summary
  total_coats: number;
  total_liters_required: number;
  total_cost: number;
}

interface PaintingLayer {
  enabled: boolean;
  material_type: string; // "Cement plaster", "Acrylic base coat", etc.
  coverage_rate: number; // m²/liter
  number_of_coats: number;
  wastage_percent: number; // %
  liters_required: number; // Calculated
  unit_price: number; // KES per liter
  total_cost: number; // Calculated
}

// PAINTING TOTALS (aggregated)
interface PaintingTotals {
  location: string;
  surface_area: number;
  total_coats: number;
  total_liters: number;
  total_cost: number;

  // By layer
  skimming?: LayerTotals;
  undercoat?: LayerTotals;
  finishing?: LayerTotals;
}

interface LayerTotals {
  liters: number;
  coats: number;
  cost: number;
}
```

### Finishes Models

```typescript
// INTERNAL FINISHES
interface InternalFinishesInput {
  // Material finishes (always present)
  material_finishes: {
    enabled: boolean;
    finish_type:
      | "stone"
      | "tiles"
      | "wood"
      | "stucco"
      | "gypsum_board"
      | "panels";
    area: number; // m²
    unit_price: number;
    cost: number;
  };

  // Paint (optional, checkbox-controlled)
  paint_specifications?: PaintingSpecification;

  // Flooring
  flooring?: {
    material_type: string;
    area: number;
    unit_price: number;
    cost: number;
  };

  // Trim
  trim?: {
    type: string;
    length: number; // lin m
    unit_price: number;
    cost: number;
  };

  // Wet area tiling (optional)
  wet_area_tiling?: {
    enabled: boolean;
    kitchen: boolean;
    bathroom: boolean;
    tile_size_mm: string; // "150x150", "200x200"
    area: number;
    unit_price: number;
    adhesive_cost: number;
    total_cost: number;
  };
}

interface FinishesTotals {
  material_cost: number;
  paint_cost: number;
  flooring_cost: number;
  trim_cost: number;
  wet_area_cost: number;
  total_cost: number;
}
```

---

## Material & Pricing Models

### Material Database Record

```typescript
interface Material {
  id: string; // UUID
  material_name: string; // "Concrete", "Bricks", "Paint", etc.
  unit: string; // "m³", "m²", "kg", "liter", etc.
  price_kes: number; // Base price
  category: string; // "Concrete", "Masonry", "Painting", etc.

  // Variants (optional - for complex materials)
  type?: Array<{
    // Variant details (e.g., concrete grade, brick size)
    [key: string]: string | number;
    price_kes?: number; // Override for this variant
  }>;

  // Metadata
  created_at: string;
  updated_at: string;
  supplier?: string;
  availability?: "in_stock" | "limited" | "out_of_stock";
}
```

### Regional Multiplier

```typescript
interface RegionalMultiplier {
  id: string;
  region: string; // "Nairobi", "Mombasa", "Kisumu", etc.
  multiplier: number; // 1.0 = base, 1.15 = 15% premium
  reason?: string; // "Coastal premium", "Remote area surcharge"
  created_at: string;
  updated_at: string;
}
```

### User Price Override

```typescript
interface UserMaterialPrice {
  id: string;
  user_id: string; // References profiles.id
  material_id: string; // References material_prices.id
  custom_price: number; // Override price in KES
  created_at: string;
  updated_at: string;
}
```

---

## Component Models

### BOQ (Bill of Quantities) Line Item

```typescript
interface BOQLine {
  id: string;
  quote_id: string;

  position: number; // Order in BOQ
  section: string; // "Concrete", "Masonry", "Painting", etc.
  description: string; // Detailed line item description

  unit: string; // "m³", "m²", "no", "kg", etc.
  quantity: number;
  unit_rate: number; // Price per unit
  total: number; // Quantity × Unit Rate

  notes?: string;
}
```

### Preliminaries Item

```typescript
interface PreliminariesItem {
  id: string;
  description: string; // "Mobilization", "Site clearing", etc.
  cost: number; // Fixed cost or % of subtotal
  cost_type: "fixed" | "percentage";
}
```

### Equipment Selection

```typescript
interface EquipmentSelection {
  id: string;
  equipment_name: string; // "Excavator", "Concrete mixer", etc.
  equipment_type: string;
  quantity: number;
  rental_period_days: number;
  daily_rate: number; // KES per day
  operator_cost_per_day?: number; // If operator needed
  total_cost: number;
}
```

### Service Selection

```typescript
interface ServiceSelection {
  id: string;
  service_name: string;
  service_type: string;
  cost: number;
  description?: string;
}
```

### Subcontractor Selection

```typescript
interface SubcontractorSelection {
  id: string;
  subcontractor_name: string;
  service_description: string;
  cost_type: "fixed" | "per_unit" | "per_day";
  quantity?: number;
  unit_rate?: number; // If per_unit
  daily_rate?: number; // If per_day
  total_cost: number;
  contact?: string;
}
```

---

## Database Schema

### ERD (Entity Relationship Diagram)

```
┌─────────────────────┐
│      profiles       │
├─────────────────────┤
│ id (UUID) PK        │
│ email              │
│ full_name          │
│ company_name       │
│ region             │
│ tier               │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐      ┌──────────────────────┐
│      quotes         │◄─────►│   quote_events       │
├─────────────────────┤      ├──────────────────────┤
│ id (UUID) PK        │      │ id (UUID) PK         │
│ user_id FK          │      │ quote_id FK          │
│ project_name       │      │ user_id FK           │
│ client_name        │      │ event_type           │
│ client_email       │      │ changes (JSONB)      │
│ qs_settings (JSON) │      │ created_at           │
│ concrete_input     │      └──────────────────────┘
│ concrete_totals    │
│ doors (JSONB)      │      ┌─────────────────────┐
│ windows (JSONB)    │◄─────►│   quote_exports     │
│ ...                │      ├─────────────────────┤
└─────────────────────┘      │ id (UUID) PK        │
         │                   │ quote_id FK         │
         │                   │ export_type         │
         │                   │ file_url            │
         │                   │ created_at          │
┌────────┴──────────────┐    └─────────────────────┘
│                       │
├──────────────────────┬┴─────────────────┐
│                      │                  │
│        1:N           │     1:N          │
▼        │             │      │           ▼
┌─────────────────────┐│┌────────────────────────┐
│  subscriptions      ││ material_prices        │
├─────────────────────┤││────────────────────────┤
│ id (UUID) PK        │││ id (UUID) PK           │
│ user_id FK          │││ material_name          │
│ plan                │││ unit                   │
│ status              │││ price_kes              │
│ next_billing_date   │││ category               │
└─────────────────────┘││ type (JSONB)           │
                      ││ created_at             │
                      └┴────────────────────────┘
                       │
                       │ 1:N
                       ▼
              ┌────────────────────────┐
              │ regional_multipliers   │
              ├────────────────────────┤
              │ id (UUID) PK           │
              │ region                 │
              │ multiplier             │
              │ created_at             │
              └────────────────────────┘

                       │
                       │ 1:N
                       ▼
              ┌────────────────────────┐
              │ user_material_prices   │
              ├────────────────────────┤
              │ id (UUID) PK           │
              │ user_id FK             │
              │ material_id FK         │
              │ custom_price           │
              │ created_at             │
              └────────────────────────┘
```

---

## Type Safety Patterns

### Using Discriminated Unions

```typescript
// ✅ Type-safe component selection
type DoorWindow = Door | Window;

function getDimensions(item: DoorWindow) {
  // TypeScript knows both have size_type
  return {
    type: item.size_type,
    // Only access Door-specific fields when needed
    ...(item instanceof Door && { transom: item.transom }),
  };
}
```

### Using Generics for Reusable Types

```typescript
// Generic Calculator Input/Output
interface CalculatorResult<T> {
  input: T;
  calculations: any;
  loading: boolean;
  error: Error | null;
}

function useCalculator<T extends object>(initialData: T): CalculatorResult<T> {
  // Implementation
  return {
    input: initialData,
    calculations: null,
    loading: false,
    error: null,
  };
}
```

### Using Zod for Runtime Validation

```typescript
import { z } from "zod";

const ConcreteInputSchema = z.object({
  shape: z.enum(["rectangular", "circular", "complex"]),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive(),
  wastage_percent: z.number().min(0).max(100),
});

type ConcreteInput = z.infer<typeof ConcreteInputSchema>;

// Validate at runtime
const validated = ConcreteInputSchema.parse(data);
```

---

## Data Validation

### Quote Validation Schema

```typescript
const QuoteValidationSchema = z.object({
  projectName: z.string().min(3, "Project name too short").max(255),
  clientName: z.string().min(2),
  clientEmail: z.string().email("Invalid email"),
  projectLocation: z.string().min(2),

  // At least one calculator must have data
  concrete_input: z.object({}).optional(),
  masonry_walls: z.array(z.object({})).optional(),
  // ... others
}).refine(
  (data) => {
    // Ensure at least one calculator has data
    return data.concrete_input || data.masonry_walls || /* ...others */;
  },
  { message: "At least one calculator must have data" }
);
```

### Validation at Save Time

```typescript
async function saveQuote(quote: unknown) {
  try {
    const validated = QuoteValidationSchema.parse(quote);

    const { error } = await supabase.from("quotes").upsert(validated);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Field-level validation errors
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    // Database error
    return { success: false, error: error.message };
  }
}
```

---

**References:**

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Zod Documentation: https://zod.dev
- Supabase Type Definitions: https://supabase.com/docs/guides/typescript
