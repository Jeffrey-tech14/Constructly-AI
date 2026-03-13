// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

/**
 * Quote Structure Organization - Construction Lifecycle Approach
 *
 * This file defines the organizational structure for quotes following
 * a construction lifecycle approach (Substructure → Superstructure → Other)
 */

export type QuoteCategory =
  | "substructure"
  | "superstructure"
  | "furniture-fittings"
  | "landscaping"
  | "contingency"
  | "other";

export type SubstructureSection =
  | "earthworks"
  | "foundation"
  | "ground-floor-prep"
  | "waterproofing";

export type SuperstructureSection =
  | "structural-elements"
  | "walls"
  | "roof"
  | "internal-finishes"
  | "external-finishes";

export type FurnitureSection =
  | "wardrobes-cabinets"
  | "fittings"
  | "hardware"
  | "appliances";

export type LandscapingSection =
  | "external-works"
  | "paving"
  | "drainage"
  | "landscaping";

export interface QuoteSectionConfig {
  id: string;
  category: QuoteCategory;
  section?: string;
  title: string;
  description?: string;
  order: number;
  color?: string; // For UI
  icon?: string; // Icon name for UI
}

export interface QuoteElement {
  id: string;
  sectionId: string;
  type:
    | "concrete"
    | "masonry"
    | "finishes"
    | "roofing"
    | "wardrobes"
    | "labor"
    | "materials"
    | "equipment"
    | "other";
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  reinforcementConfig?: any;
  notes?: string;
}

/**
 * Standard Quote Structure Configuration
 * This defines the default sections and ordering for construction quotes
 * Order: Preliminaries → Substructure → Superstructure → Other
 */
export const DEFAULT_QUOTE_STRUCTURE: QuoteSectionConfig[] = [
  // ============ PRELIMINARIES ============
  {
    id: "preliminaries",
    category: "substructure",
    section: "preliminaries",
    title: "Preliminaries",
    description: "Site clearance, hording, sign board, temporary structures",
    order: 0.9,
    color: "bg-indigo-50",
    icon: "Flag",
  },

  // ============ SUBSTRUCTURE ============
  {
    id: "substructure",
    category: "substructure",
    title: "SUBSTRUCTURE",
    description: "Foundation and ground-level preparation",
    order: 1,
    color: "bg-red-50",
    icon: "Building2",
  },
  {
    id: "earthworks",
    category: "substructure",
    section: "earthworks",
    title: "Earthworks & Excavation",
    description:
      "Site preparation, oversite excavation (200mm), foundation excavation based on type",
    order: 1.1,
    color: "bg-orange-50",
    icon: "Pickaxe",
  },
  {
    id: "foundation",
    category: "substructure",
    section: "foundation",
    title: "Foundation",
    description:
      "Strip footing, Raft foundation, or Pad foundations with reinforcement",
    order: 1.2,
    color: "bg-amber-50",
    icon: "Building",
  },
  {
    id: "ground-floor-prep",
    category: "substructure",
    section: "ground-floor-prep",
    title: "Ground Floor Preparation",
    description:
      "Concrete blinding (50mm, 1:4:8), marram blinding, DPM 500 gauge, anti-termite treatment, hardcore backfill",
    order: 1.3,
    color: "bg-yellow-50",
    icon: "Layers",
  },
  {
    id: "waterproofing",
    category: "substructure",
    section: "waterproofing",
    title: "Waterproofing & DPC",
    description: "DPC, polythene sheet, waterproofing membranes",
    order: 1.4,
    color: "bg-blue-50",
    icon: "Droplets",
  },

  // ============ SUPERSTRUCTURE ============
  {
    id: "superstructure",
    category: "superstructure",
    title: "SUPERSTRUCTURE",
    description: "Main structural and finishing elements",
    order: 2,
    color: "bg-sky-50",
    icon: "Building2",
  },
  {
    id: "structural-elements",
    category: "superstructure",
    section: "structural-elements",
    title: "Structural Elements",
    description:
      "Columns, beams, slabs, stairs - all with reinforcement options",
    order: 2.1,
    color: "bg-indigo-50",
    icon: "Boxes",
  },
  {
    id: "walls",
    category: "superstructure",
    section: "walls",
    title: "Walls & Shear Walls",
    description: "Internal/external walls, shear walls with reinforcement",
    order: 2.2,
    color: "bg-purple-50",
    icon: "Maximize2",
  },
  {
    id: "roof",
    category: "superstructure",
    section: "roof",
    title: "Roof",
    description: "Roof structure, covering, gutters - with lump-sum option",
    order: 2.3,
    color: "bg-pink-50",
    icon: "Home",
  },
  {
    id: "internal-finishes",
    category: "superstructure",
    section: "internal-finishes",
    title: "Internal Finishes",
    description: "Wall finishes (plaster/tiling), flooring, ceiling, painting",
    order: 2.4,
    color: "bg-rose-50",
    icon: "Palette",
  },
  {
    id: "external-finishes",
    category: "superstructure",
    section: "external-finishes",
    title: "External Finishes",
    description: "External rendering, painting, weatherproofing",
    order: 2.5,
    color: "bg-fuchsia-50",
    icon: "Brush",
  },

  // ============ FURNITURE & FITTINGS ============
  {
    id: "furniture-fittings",
    category: "furniture-fittings",
    title: "FURNITURE & FITTINGS",
    description: "Movable items and specialist fittings",
    order: 3,
    color: "bg-green-50",
    icon: "Square",
  },
  {
    id: "wardrobes-cabinets",
    category: "furniture-fittings",
    section: "wardrobes-cabinets",
    title: "Wardrobes & Cabinets",
    description: "Wardrobes, kitchen cabinets - lump-sum or detailed breakdown",
    order: 3.1,
    color: "bg-lime-50",
    icon: "LayoutList",
  },
  {
    id: "fittings-hardware",
    category: "furniture-fittings",
    section: "fittings",
    title: "Fittings & Hardware",
    description: "Doors, windows, hinges, locks, handles, etc.",
    order: 3.2,
    color: "bg-emerald-50",
    icon: "Lock",
  },
  {
    id: "appliances",
    category: "furniture-fittings",
    section: "appliances",
    title: "Appliances & Specialist Items",
    description: "Kitchen appliances, sanitary ware, etc.",
    order: 3.3,
    color: "bg-teal-50",
    icon: "Zap",
  },

  // ============ LANDSCAPING ============
  {
    id: "landscaping",
    category: "landscaping",
    title: "LANDSCAPING & EXTERNAL WORKS",
    description: "External site development",
    order: 4,
    color: "bg-cyan-50",
    icon: "Leaf",
  },
  {
    id: "external-works",
    category: "landscaping",
    section: "external-works",
    title: "External Works",
    description: "Boundary walls, gates, fences, entrance area",
    order: 4.1,
    color: "bg-blue-50",
    icon: "Fence",
  },
  {
    id: "paving",
    category: "landscaping",
    section: "paving",
    title: "Paving & Surfacing",
    description: "Concrete/paving slabs, asphalt, parking area",
    order: 4.2,
    color: "bg-slate-50",
    icon: "Square",
  },
  {
    id: "drainage",
    category: "landscaping",
    section: "drainage",
    title: "Drainage & Utilities",
    description: "Storm drainage, gutters, downpipes, soak pits",
    order: 4.3,
    color: "bg-stone-50",
    icon: "Droplets",
  },
  {
    id: "landscaping-soft",
    category: "landscaping",
    section: "landscaping",
    title: "Soft Landscaping",
    description: "Planting, grass, trees, irrigation",
    order: 4.4,
    color: "bg-green-50",
    icon: "Leaf",
  },

  // ============ OTHER ============
  {
    id: "contingency",
    category: "contingency",
    title: "Contingency & Allowances",
    description: "Contingency fund, design changes allowance",
    order: 5,
    color: "bg-warning-50",
    icon: "AlertTriangle",
  },
  {
    id: "professional-services",
    category: "other",
    title: "Professional Services",
    description: "Architect, engineer, supervision fees",
    order: 6,
    color: "bg-gray-50",
    icon: "Briefcase",
  },
  {
    id: "preliminaries",
    category: "other",
    title: "Preliminaries & Preliminaries",
    description: "Site management, temporary structures, insurance",
    order: 7,
    color: "bg-gray-100",
    icon: "Folder",
  },
];

/**
 * Get the section configuration by ID
 */
export function getSectionConfig(
  sectionId: string,
): QuoteSectionConfig | undefined {
  return DEFAULT_QUOTE_STRUCTURE.find((s) => s.id === sectionId);
}

/**
 * Get all sections for a category
 */
export function getSectionsForCategory(
  category: QuoteCategory,
): QuoteSectionConfig[] {
  return DEFAULT_QUOTE_STRUCTURE.filter((s) => s.category === category).sort(
    (a, b) => a.order - b.order,
  );
}

/**
 * Get organized structure grouped by category
 */
export function getOrganizedStructure(): Record<
  QuoteCategory,
  QuoteSectionConfig[]
> {
  const categories: QuoteCategory[] = [
    "substructure",
    "superstructure",
    "furniture-fittings",
    "landscaping",
    "contingency",
    "other",
  ];

  return categories.reduce(
    (acc, category) => {
      acc[category] = getSectionsForCategory(category);
      return acc;
    },
    {} as Record<QuoteCategory, QuoteSectionConfig[]>,
  );
}

/**
 * Example: Get excavation section
 * const earthworksSection = getSectionConfig('earthworks');
 *
 * Example: Get all superstructure sections
 * const superSections = getSectionsForCategory('superstructure');
 *
 * Example: Generate quote with new structure
 * const organized = getOrganizedStructure();
 * Object.entries(organized).forEach(([category, sections]) => {
 *   console.log(category);
 *   sections.forEach(section => console.log(`  - ${section.title}`));
 * });
 */
