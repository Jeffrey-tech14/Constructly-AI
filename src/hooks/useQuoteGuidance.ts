// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

/**
 * Guidance data for quote builder steps
 * Format: { title: "description" }
 */
export const guidanceData = {
  projectDetails: {
    "Project Name": "Unique identifier/name for this construction project",
    "Client Name": "Full name of the client requesting the quote",
    "Client Email": "Email address for quote delivery and communication",
    "Project Type":
      "Category of project (residential, commercial, industrial, institutional)",
    "Project Location": "Specific address or site location",
    Region: "Geographic region for cost adjustments and logistics",
    "Distance from Site":
      "Distance in kilometers - affects transport costs and logistics",
    "Contract Type": "Full contract (materials + labor) or labor only",
    "Upload Plan":
      "Optional: Upload construction plans for automatic room detection",
  },

  qsSettings: {
    "Quoted By": "Your name or team member identifier - appears on the quote",
    "Client Name": "Name of the client requesting the quote",
    "Project Location":
      "Physical location/address where the project will be built",
    "Regional Cost Multiplier":
      "Adjustment factor for regional cost variations in labor and materials",
    "Professional Fee (%)":
      "Your professional service charge as a percentage of total cost",
    "Contingency Reserve (%)":
      "Safety buffer to cover unforeseen costs (typically 5-10%)",
  },

  preliminaries: {
    "Site Clearance":
      "Cost to clear vegetation, debris, and obstacles from the site",
    "Site Fencing":
      "Temporary or permanent fencing for site security and safety",
    "Site Office":
      "Temporary structures for job site administration (if required)",
    "Material Storage":
      "Covered or open storage area for building materials on site",
    "Access Roads": "Temporary access routes for vehicles and equipment",
    "Waste Management": "Cost for disposal of construction waste and debris",
    "Welfare Facilities":
      "Worker facilities like toilets, rest areas, water supply",
    "Safety Equipment":
      "Temporary safety installations and protective equipment",
  },

  earthworks: {
    "Topsoil Removal":
      "Excavation and removal of fertile topsoil layer for later reinstatement",
    "Excavation Depth": "Depth of ground excavation required for foundations",
    "Excavation Width":
      "Width of excavated trench (will be divided by 3 for backfill spacing)",
    "Ground Conditions": "Site soil type: clay, sand, rock, etc.",
    Dewatering: "Pumping groundwater if water table is above foundation level",
    Preparation: "Ground leveling and compaction preparation",
  },

  concrete: {
    "Element Type":
      "Type of concrete structure (slab, footing, lintel, beam, etc.)",
    Length: "Length dimension of the concrete element (in meters)",
    Width: "Width dimension of the concrete element (in meters)",
    "Height/Depth":
      "Height or depth dimension of the concrete element (in meters)",
    "Mix Design": "Concrete grade/mix (e.g., 1:2:4 for foundations)",
    Reinforcement: "Steel reinforcement bars and their spacing",
    "Blinding Layer": "Lean concrete under structural slabs",
    "Maram Blinding": "Leveling layer of maram/earth material",
  },

  foundationWalling: {
    "Wall Type": "External or internal foundation wall classification",
    "Wall Length": "Perimeter length of the foundation wall (auto-calculated)",
    "Wall Height": "Vertical height of the foundation wall above foundation",
    "Block Type": "Size and material of masonry blocks used",
    "Block Dimensions":
      "Block dimensions in length × height × thickness format",
    "Mortar Ratio": "Cement to sand ratio for mortar joints (e.g., 1:4)",
    Elevation: "Ground floor height above natural ground level",
    "Topsoil Depth": "Depth of topsoil layer (from earthworks)",
    "Return Fill Depth":
      "Depth of fill material around foundation (calculated: excavation width ÷ 3)",
  },

  doorsWindows: {
    "Door/Window Type":
      "Classification (entrance, internal, sliding, casement, etc.)",
    "Door Size": "Standard size or custom dimensions (width × height)",
    "Door Material": "Material type (wood, steel, aluminium, glass)",
    Quantity: "Number of doors/windows of this specification",
    "Frame Type": "Frame material and style (aluminium, timber, uPVC, etc.)",
    Architrave: "Decorative trim around door/window opening",
    "Quarter Round": "Rounded molding at junction of wall and door frame",
    Transom: "Fixed glass panel above door/window",
    Ironmongery: "Hardware components (hinges, locks, handles, bolts, closers)",
  },

  masonry: {
    "Wall Type": "External or internal wall classification",
    "Wall Length": "Perimeter length of the wall",
    "Wall Height": "Total height of the wall above foundation",
    "Block Type": "Size category of masonry blocks (small, standard, large)",
    "Block Dimensions": "Exact block dimensions (length × height × thickness)",
    "Mortar Ratio": "Cement to sand ratio for mortar joints",
    "Lintel Type": "Reinforced concrete beam spanning door/window openings",
    "Ring Beam": "Horizontal concrete beam at top of walls",
    "Rebar Grade": "Steel reinforcement bar grade (e.g., 16mm Φ, Y10 Φ etc.)",
  },

  rebar: {
    "Bar Diameter": "Size of reinforcement bars (e.g., 16mm, 12mm, 10mm)",
    "Bar Grade": "Steel grade specification (e.g., Y16, Y12, Y10)",
    "Bar Spacing": "Distance between reinforcement bars",
    "Development Length": "Length needed to develop full strength of bar",
    "Lap Length": "Overlap length when joining bars end-to-end",
    Curtailment: "Points where reinforcement can be terminated or reduced",
    Bending: "Corners and bends in reinforcement",
    Quantity: "Total number and weight of reinforcement bars",
  },

  otherFinishes: {
    "Finish Type": "Category of additional finish work",
    "Coverage Area": "Total area to be covered",
    "Material Specification": "Detailed material type and quality",
    "Installation Method": "How the material will be installed",
    "Finish Details": "Special requirements or customizations",
    Quantity: "Amount of material needed",
    "Unit Price": "Cost per unit of measurement",
  },

  plumbing: {
    "Supply Pipes":
      "Water supply piping material and sizes (HDPE, PVC, copper)",
    "Drainage Pipes": "Wastewater drainage piping (soil, waste, vent pipes)",
    Fixtures: "Sanitary ware (WCs, sinks, showers, baths)",
    "Hot Water": "Water heating system (solar, electric, gas)",
    Taps: "Faucet specifications and quantities",
    "Grease Trap": "Wastewater treatment for kitchen drainage",
    Rainwater: "Gutters, downpipes, and rainwater storage/disposal",
  },

  electrical: {
    "Main Switch": "Main electrical isolator/circuit breaker",
    "Distribution Board": "Sub-board with circuit breakers and switches",
    Wiring: "Cable types (conduit, armored, buried): sizes and quantities",
    Outlets: "Sockets, switches, and plug points throughout house",
    Lighting: "Light fittings: bulbs, fixtures, and control switches",
    "Panel Upgrade": "Additional electrical infrastructure if needed",
    "Load Capacity": "Total electrical load capacity of the installation",
    Generator: "Backup power supply (if required)",
  },

  roofing: {
    "Roof Type": "Pitched, flat, truss frame, etc.",
    "Roof Area": "Total surface area to be covered (auto-calculated)",
    "Covering Material":
      "Roof covering (clay tiles, metal sheets, concrete tiles, etc.)",
    Underlayment: "Waterproofing layer below roof covering",
    Gutters: "Rainwater collection and drainage system",
    Downpipes: "Pipes to direct water away from building",
    Insulation: "Thermal insulation in roof space",
    Ventilation: "Roof ventilation for moisture control",
  },

  flooring: {
    "Floor Type": "Ground floor, upper floor, suspended, etc.",
    "Floor Area": "Total area of floor to be finished (auto-calculated)",
    "Finish Material":
      "Final flooring material (tiles, concrete, wood, polished, etc.)",
    "Base Layer": "Sub-base preparation (sand screed, concrete, etc.)",
    Thickness: "Total thickness of flooring layers",
    Adhesive: "Bonding agent for non-concrete finishes",
    Grout: "Joint filling material (for tiled finishes)",
  },

  internalFinishes: {
    "Wall Covering": "Internal wall finish (tiles, paint, plaster, etc.)",
    "Ceiling Finish": "Ceiling type (plastered, suspended, painted, etc.)",
    "Paint Spec": "Paint type, quality, and number of coats",
    "Skirting Board": "Base trim along walls",
    "Dado Rail": "Wall rail at chair height (if included)",
    "Access Panels": "Access for utilities and maintenance",
  },

  externalFinishes: {
    "Wall Finish": "External wall material (tiles, paint, render, stone, etc.)",
    Pointing: "Joint treatment between masonry units",
    Cladding: "External wall cladding if used",
    "Damp Proof Course": "Moisture barrier in walls (DPC)",
    Weatherproofing: "Water and wind protection measures",
    "Paint/Render": "External paint or rendered finish specification",
  },

  ceiling: {
    "Ceiling Type": "Plastered, suspended, timber, etc.",
    "Ceiling Area": "Total area to be finished (auto-calculated)",
    Finish: "Final ceiling finish (paint, texture, tiles)",
    "Support Structure": "Joist/frame specifications",
    Insulation: "Thermal insulation in ceiling void",
    Access: "Maintenance access points or hatches",
  },

  kitchenWardrobe: {
    "Cabinet Type": "Base, wall, tall units, etc.",
    Material: "Plywood, MDF, solid wood, etc.",
    Finish: "Paint, veneer, or laminate",
    Quantity: "Number and specification of units",
    Hardware: "Handles, hinges, and internal fittings",
    Countertop: "Work surface material and finish",
    Appliances: "Built-in or standalone kitchen equipment",
  },

  paintDoors: {
    "Paint Type": "Exterior, interior, tile, specialized paint",
    "Surface Preparation": "Priming, sanding, and undercoat requirements",
    "Number of Coats": "Typical 2-3 coats for quality finish",
    "Coverage Area": "Total area to be painted",
    "Color Selection": "Standard or custom color specification",
  },

  equipment: {
    "Equipment Type": "Cranes, pumps, generators, etc.",
    Quantity: "Number of each equipment type",
    Duration: "Days or weeks equipment is needed on site",
    Capacity: "Size/power specifications (e.g., 50-ton crane)",
  },

  services: {
    "Service Type": "Labor, supervision, inspection, testing, etc.",
    "Days Required": "Number of working days needed",
    "Team Size": "Number of personnel required",
    "Specialist Skills": "Qualifications or certifications needed",
  },

  subcontractors: {
    "Subcontractor Name": "Name of specialized contractor",
    Service: "Type of work they will perform",
    "Contract Period": "Duration of their engagement",
    Scope: "Detailed breakdown of their responsibilities",
    Insurance: "Professional indemnity and liability insurance",
  },

  boq: {
    "Bill of Quantities":
      "Detailed breakdown of all materials, labor, and costs",
    "Item Code": "Unique identifier for each item",
    Description: "Detailed description of the work item",
    Quantity: "Amount of work to be done",
    Unit: "Measurement unit (m², m³, no., etc.)",
    Rate: "Cost per unit",
    Amount: "Total cost for this line item (Qty × Rate)",
    "Section Headers": "Group related items together for organization",
  },

  review: {
    "Quote Summary": "Overview of total costs and project scope",
    "Bill of Quantities": "Detailed BOQ for client approval and record",
    "Total Cost": "Complete sum of all project costs",
    "Cost Breakdown": "Analysis of costs by category and section",
    "Export Options": "Download quote in various formats (PDF, Excel)",
    "Save Quote": "Save the quote for later editing or client reference",
  },
};

export interface GuidanceSection {
  [key: string]: string;
}

export const useQuoteGuidance = (step: string): GuidanceSection | null => {
  return guidanceData[step as keyof typeof guidanceData] || null;
};

export default useQuoteGuidance;
