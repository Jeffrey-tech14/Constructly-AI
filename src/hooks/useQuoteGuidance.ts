// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

/**
 * Guidance data for quote builder steps
 * Format: { title: "description" }
 */
export const guidanceData = {
  projectDetails: {
    "Project Name": "Unique identifier or name for this construction project",
    "Client Name": "Full name of the client requesting the quote",
    "Client Email":
      "Client's email address for quote delivery and communication",
    "Contract Type":
      "Choose Full Contract (materials + labor) or Labor Only (client supplies materials)",
    "Project Type":
      "Category of construction (residential, commercial, industrial, etc.)",
    "Project Location":
      "Specific address or site location where work will be performed",
    Region: "Geographic region - affects cost adjustments and logistics",
    "Distance from site (KM)":
      "Distance in kilometers from your base - affects transport costs",
    "Upload Plan":
      "Optional: Upload construction plans for automatic room and measurement detection",
  },

  qsSettings: {
    Labor:
      "Cost for labor as a percentage of total or fixed daily/hourly amount",
    Overhead:
      "Project overhead costs (site supervision, management) - percentage or fixed amount",
    Profit: "Your profit margin as a percentage of costs or fixed amount",
    Contingency:
      "Safety reserve for unexpected costs (typically 5-10% of total)",
    "Unknown Unknowns Reserve":
      "Additional buffer for truly unforeseen circumstances",
    "Permit Cost":
      "Government permits, licenses, and inspection fees required for the project",
    "Client Provides Water":
      "Check if client will supply water on site - unchecked means you provide cost",
    "Wastage - Concrete":
      "Extra concrete material for spillage, waste (typically 5%)",
    "Wastage - Reinforcement":
      "Extra steel reinforcement for cutting, bending waste (typically 4%)",
    "Wastage - Masonry": "Extra blocks and mortar for breakage (typically 3%)",
    "Wastage - Water": "Extra water for site use and curing",
    "Wastage - Roofing":
      "Extra roofing materials for cutting and installation waste (typically 7%)",
    "Wastage - Finishes":
      "Extra paint, tiles, and finishing materials (typically 8%)",
    "Wastage - Electrical":
      "Extra wiring, conduit, fixtures for installation waste (typically 2%)",
    "Wastage - Plumbing":
      "Extra pipes, fittings for installation waste (typically 3%)",
    "Concrete Mix Ratio":
      "Cement:Sand:Aggregate ratio (e.g., 1:2:4 for foundations)",
    "Concrete Water-Cement Ratio":
      "Water to cement ratio affecting concrete strength (typically 0.45-0.55)",
    "Mortar Joint Thickness":
      "Thickness of mortar between blocks in meters (typically 0.01m/10mm)",
    "Mortar Ratio": "Cement to sand ratio for mortar (e.g., 1:4 or 1:5)",
    "Plaster Ratio": "Cement to sand ratio for wall plaster (e.g., 1:4)",
  },

  preliminaries: {
    "Site Clearance":
      "Cost to clear vegetation, debris and obstacles from the site - enter area (m²) and rate (KES/m²) for automatic calculation",
    "Sign Board":
      "Project identification and safety signage boards - enter unit price and quantity",
    Hoarding:
      "Temporary site boundary fencing for security and safety (only for non-low-rise buildings) - unit price × quantity",
    "Safety Nets":
      "Protective netting for fall prevention (only for non-low-rise buildings) - unit price × quantity",
    "Fall Prevention Fence":
      "Protective barrier for high-rise buildings (only for high-rise projects) - unit price × quantity",
  },

  earthworks: {
    "Excavation Type":
      "Type of excavation (topsoil removal, oversite excavation, or foundation excavation)",
    Length: "Length of excavation area in meters",
    Width: "Width of excavation area in meters",
    Depth: "Depth of excavation in meters",
    Area: "Direct area entry in m² (alternative to length × width)",
    "Material Type": "Type of material being excavated",
    "Foundation Type":
      "Type of foundation (strip footing, raft foundation, general)",
    "Wall Location": "Whether this is external or internal wall location",
    Volume: "Calculated total volume in m³ (auto-calculated, read-only)",
  },

  concrete: {
    "Element Name": "Descriptive name for this concrete element",
    "Element Type":
      "Type of concrete structure (slab, footing, lintel, beam, tank, raft, blinding, etc.)",
    Length: "Length dimension in meters",
    Width: "Width dimension in meters",
    "Height/Thickness": "Vertical height or thickness dimension in meters",
    "Concrete Mix": "Mix ratio or concrete grade (e.g., 1:2:4 or C30)",
    "Quantity/Number": "Number of identical elements",
    "Aggregate Bed Depth":
      "Depth of aggregate bedding under slab (auto-synced from height)",
    "Includes DPC": "Damp Proof Course waterproofing - checkbox to include",
    "Includes Polythene": "Polythene sheeting - checkbox to include",
    "Includes Waterproofing":
      "Additional waterproofing treatment - checkbox to include",
  },

  foundationWalling: {
    "Wall Type":
      "External (perimeter) or Internal wall classification (shown as tabs)",
    "Wall Length":
      "Perimeter length of the wall in meters (auto-calculated from quote)",
    "Wall Height":
      "Height of wall above foundation in meters (auto-calculated)",
    "Block Type":
      "Size category of masonry blocks (Large, Standard, or Small Block)",
    "Mortar Ratio": "Cement to sand ratio for mortar joints (e.g., 1:4 or 1:6)",
    "Ground Floor Elevation":
      "Ground floor height above natural ground level (auto-filled)",
    "Topsoil Depth":
      "Depth of topsoil layer from earthworks in meters (auto-filled)",
    "Slab Thickness":
      "Thickness of concrete slab in meters (auto-filled from concrete rows)",
    "Blinding Thickness":
      "Thickness of blinding layer in meters (auto-filled from concrete rows)",
    "Return Fill Depth":
      "Depth of fill material around foundation in meters (auto-calculated)",
  },

  doorsWindows: {
    "Wall Type": "External or Internal wall classification",
    "Wall Thickness": "Thickness of wall in meters",
    "Block Type": "Type of masonry blocks in wall",
    "Plaster Type": "Internal plaster type (Both Sides, One Side, or None)",
    "Door Size Type":
      "Standard size or custom dimensions (doors: 0.9×2.1m, 1.0×2.1m, 1.2×2.4m)",
    "Door Custom Height":
      "Custom door height in meters (if custom size selected)",
    "Door Custom Width":
      "Custom door width in meters (if custom size selected)",
    "Door Type":
      "Door material/style (Steel, Solid flush, Semi-solid flush, Panel, T&G, Aluminium)",
    "Number of Doors": "Count of doors of this type",
    "Door Frame": "Frame specifications - type, size, thickness",
    Architrave:
      "Decorative trim around door opening - enable/disable and select type",
    Transom:
      "Fixed glass panel above door - enable/disable and specify dimensions",
    "Quarter Round":
      "Rounded molding at junction - enable/disable and select type",
    "Door Hardware":
      "Hardware components - hinges, locks, handles, bolts, closers with quantities",
    "Window Size Type":
      "Standard size or custom dimensions (windows: 1.2×1.2m, 1.5×1.2m, 2.0×1.5m)",
    "Window Custom Height":
      "Custom window height in meters (if custom size selected)",
    "Window Custom Width":
      "Custom window width in meters (if custom size selected)",
    "Glass Type": "Glass type (Clear, Tinted, or Frosted)",
    "Glass Thickness": "Glass thickness in mm (3-12mm options)",
    "Frame Type": "Frame material (Wood, Steel, or Aluminum)",
    "Number of Windows": "Count of windows of this type",
  },

  masonry: {
    "External Wall Perimeter":
      "Total perimeter length of external walls in meters",
    "Internal Wall Perimeter":
      "Total perimeter length of internal walls in meters",
    "External Wall Height":
      "Height of external walls above foundation in meters",
    "Internal Wall Height":
      "Height of internal walls above foundation in meters",
    "Block Type":
      "Size category of masonry blocks (Large 200mm, Standard 150mm, Small 100mm)",
    "Mortar Ratio": "Cement to sand ratio for mortar joints (e.g., 1:4)",
    "Include Lintels":
      "Checkbox - whether to include reinforced concrete lintels above openings",
    "Lintel Width":
      "Width of lintels in meters (only when Include Lintels is checked)",
    "Lintel Depth":
      "Depth/thickness of lintels in meters (only when Include Lintels is checked)",
    "Lintel Rebar Size":
      "Rebar bar size for lintels (D8, D10, D12, D16, D20, D25)",
    "Include Ring Beams":
      "Checkbox - whether to include horizontal concrete beam at top of walls",
    "Ring Beam Configuration":
      "Reinforcement and dimensions for ring beam (only when Include Ring Beams is checked)",
  },

  rebar: {
    "Element Name": "Descriptive name for this reinforced element",
    "Element Type":
      "Type of element (slab, raft-foundation, beam, column, strip-footing, tank, retaining-wall)",
    "Calculation Mode":
      "NORMAL (intensity-based) or DETAILED (bar-by-bar calculation)",
    "Concrete Volume": "Volume of concrete in m³ (for intensity mode)",
    "Steel Intensity":
      "Amount of steel per m³ concrete in kg/m³ (for intensity mode)",
    Length: "Length of element in meters (for detailed mode)",
    Width: "Width of element in meters (for detailed mode)",
    "Depth/Thickness":
      "Depth or thickness of element in meters (for detailed mode)",
    Area: "Direct area entry in m² (alternative to length × width, for detailed mode)",
    "Main Bar Size":
      "Primary reinforcement bar diameter (D8, D10, D12, D16, D20, D25, etc.)",
    "Main Bar Spacing": "Spacing between main bars in mm (for detailed mode)",
    "Distribution Bar Size": "Secondary reinforcement bar size",
    "Distribution Bar Spacing": "Spacing between distribution bars in mm",
    "Slab Layers":
      "Number of reinforcement layers in slab (1-4, for slabs only)",
    "Reinforcement Type":
      "Type of reinforcement - individual bars or welded mesh",
    "Mesh Grade":
      "Grade of welded mesh if using mesh (A98, A125, A142, A193, A252, A393, etc.)",
    "Mesh Sheet Width": "Width of mesh sheet in meters",
    "Mesh Sheet Length": "Length of mesh sheet in meters",
    "Mesh Lap Length": "Overlap length when joining mesh sheets in meters",
    "Main Bars Count": "Number of main reinforcement bars (for beams/columns)",
    "Stirrup Size":
      "Size of stirrup/transverse reinforcement (for beams: D8-D16, for columns: ties)",
    "Stirrup Spacing": "Distance between stirrups in mm",
  },

  plumbing: {
    "System Name": "Custom name for the piping system",
    "System Type":
      "Type of system (Water Supply, Drainage, Sewage, Rainwater, Hot Water, Fire Fighting, Gas Piping, Irrigation)",
    "Pipe Material":
      "Material of pipes (PVC-U, PVC-C, Copper, PEX, Galvanized Steel, HDPE, PPR, Cast Iron, Vitrified Clay)",
    "Pipe Diameter":
      "Diameter of pipes in mm (15, 20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 160, 200)",
    "Pipe Length": "Length of pipe run in meters",
    "Pipe Quantity": "Number of pipe lengths or sections",
    "Fixture Type":
      "Type of sanitary fixture (Water Closet, Urinal, Lavatory, Kitchen Sink, Shower, Bathtub, Bidet, Floor Drain, Cleanout, Hose Bib)",
    "Fixture Count": "Number of fixtures of this type",
    "Fixture Location": "Room or location where fixture is installed",
    "Fixture Quality": "Quality level (Standard, Premium, or Luxury)",
    "Water Supply Connection":
      "Checkbox - whether this fixture has water supply",
    "Drainage Connection": "Checkbox - whether this fixture has drainage",
    "Vent Connection": "Checkbox - whether this fixture has vent pipe",
  },

  electrical: {
    "System Name": "Custom name for the electrical system",
    "System Type":
      "Type of system (Lighting, Power, Data, Security, CCTV, Fire Alarm, Access Control, AV Systems, Emergency Lighting, Renewable Energy)",
    Voltage: "Electrical voltage (230V or 400V)",
    "Cable Type":
      "Type of cable (NYM-J, PVC/PVC, XLPE, MICC, SWA, Ethernet, Data CAT6, Fiber Optic, Coaxial)",
    "Cable Size":
      "Cross-sectional area of cable in mm² (1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150)",
    "Cable Length": "Length of cable run in meters",
    "Cable Quantity": "Number of cable lengths or sections",
    Circuit: "Circuit identifier or name",
    "Protection Type": "Type of protection device (MCB, RCBO, etc.)",
    "Installation Method":
      "How cable is installed (Surface, Concealed, Underground, Trunking)",
    "Outlet Type":
      "Type of outlet (Power Socket, Light Switch, Dimmer Switch, Data Port, TV Point, Telephone, USB Charger, GPO)",
    "Outlet Count": "Number of outlets of this type",
    "Outlet Location": "Room or location where outlet is installed",
    "Outlet Rating":
      "Amperage rating of outlet (6, 10, 13, 16, 20, 25, 32, 40, 45, 63 Amps)",
    "Gang Configuration":
      "Number of gangs for grouped outlets (1, 2, 3, or 4 gang)",
    "Lighting Type":
      "Type of light fitting (LED Downlight, Fluorescent, Halogen, Emergency Light, Floodlight, Street Light, Decorative)",
    "Lighting Count": "Number of light fittings of this type",
    "Lighting Wattage":
      "Power consumption in watts (3, 5, 7, 9, 12, 15, 18, 20, 24, 30, 36, 40, 50, 60 W)",
  },

  roofing: {
    "Footprint Area":
      "Building footprint area in m² (auto-synced from slab if available)",
    "External Perimeter":
      "External wall perimeter in meters (auto-synced from quote if available)",
    "Roof Type": "Type of roof (gable, hip, pitched, or flat)",
    "Roof Pitch": "Roof pitch/slope in degrees (0-90°, where 0 is flat)",
    "Eave Width": "Roof overhang/eave width in meters",
    "Sheet Effective Cover Width":
      "Effective coverage width of roofing sheet in meters (1.0m or 1.06m)",
    "Sheet Standard Length":
      "Standard length of roofing sheet in meters (2.0m, 2.5m, or 3.0m)",
    "Use King Post Truss Type":
      "Checkbox - whether roof uses king post truss design",
    "Purlin Spacing": "Spacing between purlins in meters",
    "Rafter Spacing": "Spacing between rafters in mm",
    "Truss Spacing": "Spacing between roof trusses in mm",
  },

  flooring: {
    "Flooring Material":
      "Type of finish material (Ceramic Tiles, Granite Tiles, Granite, Hardwood Wooden Panels, Cement paste/Niro finish, PVC vinyl, Epoxy, Terrazzo, SPC flooring)",
    Area: "Area to be finished in m²",
    Quantity: "Quantity needed (for pre-packed materials)",
    "Tile Size":
      "Size of tiles in mm (150×150, 200×200, 300×300, 400×400, 450×450, 300×600, 600×600, 600×900, 800×800, 900×900, 1200×600)",
    "Base Layer Material": "Sub-base type (Cement Screed, Sand Base, etc.)",
    "Base Layer Thickness": "Thickness of base layer in mm",
    "Skirting Type": "Type of skirting/baseboard (based on flooring material)",
    "Skirting Height": "Height of skirting in meters",
    "Skirting Tile Size": "Skirting tile size in mm (if tiled skirting)",
  },

  internalFinishes: {
    "Finish Material":
      "Type of wall finish (Stone Cladding, Tile Cladding, Wood Paneling, Smooth Stucco, Gypsum Board, Fluted panels)",
    Area: "Area to be finished in m²",
    Quantity: "Quantity of material needed",
    "Tile Size": "Size of tiles if applicable in mm",
    "Include Kitchen Tiles":
      "Checkbox - whether to include kitchen backsplash tiling",
    "Kitchen Tile Height": "Height of kitchen tile backsplash in meters",
    "Kitchen Tile Size": "Size of kitchen tiles in mm",
    "Kitchen Tile Type": "Type of kitchen tiles (material)",
    "Kitchen Perimeter": "Perimeter of kitchen area in meters",
    "Include Bathroom Tiles":
      "Checkbox - whether to include bathroom wall tiling",
    "Bathroom Tile Height": "Height of bathroom tile in meters",
    "Bathroom Tile Size": "Size of bathroom tiles in mm",
    "Bathroom Tile Type": "Type of bathroom tiles (material)",
    "Bathroom Perimeter": "Perimeter of bathroom area in meters",
  },

  externalFinishes: {
    "Finish Type": "Choose between keying (cladding/coating) or plaster",
    "Finish Material":
      "Material type (Cladding, Marble, Limestone, Marzella, Wall Master, Painting, etc.) - when keying selected",
    Area: "Area to be finished in m²",
    Quantity: "Quantity needed",
    "Include Plaster": "Checkbox - whether to include external plaster",
    "Plaster Thickness":
      "Thickness of plaster in mm (only when Include Plaster is checked)",
    "Include Wall Pointing":
      "Checkbox - whether to include joint pointing treatment",
    "Include Painting": "Checkbox - whether to include external painting",
    "Plaster Ratio":
      "Cement to sand ratio for plaster (default 1:3, configurable in QS Settings)",
  },

  ceiling: {
    "Ceiling Type": "Select type: gypsum board, painting, or other",
    Material: "Material type (auto-populated based on ceiling type)",
    Area: "Area to be finished in m² (auto-filled from slab area)",
    Quantity: "Quantity of material needed (auto-calculated)",
    "Include Gypsum Supplementary":
      "When gypsum selected, includes auto-addition of supplementary materials (Blundering, Metal Channels/Studs, Screws, Tape, Mesh, Filler, Cornice)",
    "Include Painting Cornice":
      "When painting selected, includes auto-addition of cornice material",
    "Include Other Supplementary":
      "When other type selected, includes auto-addition of PVC and Blundering",
    "Cornice Length":
      "Length of cornice in meters (auto-calculated from internal and external perimeters)",
  },

  kitchenWardrobe: {
    "Wardrobe Name": "Descriptive name for the wardrobe unit",
    "Wardrobe Quotation Type":
      "Choose: lump-sum (fixed price) or detailed (itemized calculation)",
    "Wardrobe Lump Sum Amount": "Fixed price in KES (only for lump-sum type)",
    "Number of Boards": "Number of boards needed (only for detailed type)",
    "Number of Hinges": "Number of hinges needed (only for detailed type)",
    "Number of Locks": "Number of locks needed (only for detailed type)",
    "Number of Drawer Rails": "Number of drawer rails (only for detailed type)",
    "Include Glass Panels":
      "Checkbox - whether wardrobe includes glass panels (only for detailed type)",
    "Glass Area":
      "Area  of glass in m² (only if Include Glass Panels is checked)",
    "Wardrobe Unit Price": "Price per unit in KES (only for detailed type)",
    "Cabinet Name": "Descriptive name for the kitchen cabinet unit",
    "Cabinet Quotation Type":
      "Choose: lump-sum (fixed price) or detailed (itemized calculation)",
    "Cabinet Lump Sum Amount": "Fixed price in KES (only for lump-sum type)",
    "Number of Cupboards":
      "Number of cupboards needed (only for detailed type)",
    "Number of Drawers": "Number of drawers needed (only for detailed type)",
    "Number of Doors": "Number of doors needed (only for detailed type)",
    "Cabinet Unit Price": "Price per unit in KES (only for detailed type)",
    "Countertop Type": "Choose: granite or tiled",
    "Countertop Material":
      "Type of material (Granite Polished, Granite Honed, Granite Flamed, Granite Bush Hammered for granite type; Ceramic/Porcelain/Stone/Mosaic for tiled type)",
    "Countertop Length": "Length of countertop in meters",
    "Countertop Width": "Width of countertop in meters",
    "Granite Size":
      "Size of granite slab (1200×600×20mm, 1500×600×20mm, 2000×600×20mm, 2400×600×20mm, 3000×600×20mm) - only for granite type",
    "Include Corner Strips":
      "Checkbox - whether to include corner protection strips",
    "Corner Strip Length":
      "Length of corner strips in meters (only if Include Corner Strips is checked)",
    "Countertop Unit Price": "Price per unit/m² in KES",
  },

  paintDoors: {
    "Paint Type": "Gloss, Matt",
    "Surface Type": "Type of surface being painted (wood, steel etc.)",
    Price: "Price per liter",
    "Coverage Area": "Total area to be painted (m² or linear meters)",
  },

  otherFinishes: {
    "Finish Item": "Description of the specific finishing work",
    "Finish Type": "Category of additional finishes",
    Material: "Material specification for the finish",
    "Coverage Area": "Total area or quantity to be covered",
    "Installation Method": "How the material will be installed",
    "Quality Grade": "Material quality/durability rating",
    "Cost per Unit": "Unit price for calculation",
    "Quantity Required": "Amount of material needed",
    "Special Requirements": "Any custom or specific requirements",
  },

  equipment: {
    "Equipment Type":
      "Category (cranes, pumps, compressors, generators, excavators, etc.)",
    "Equipment Item":
      "Specific equipment needed (e.g., 50-ton crane, 5kVA generator, 0.8 excavator)",
    Duration: "Number of days/weeks/months equipment is needed on site",
    "Duration Unit": "Time unit for rental (hour, day, week, month, or unit)",
    "Daily/Unit Rate": "Cost per time unit of equipment rental",
    "Equipment Count":
      "Number of that specific equipment piece needed (e.g., 2 excavators means 2 units of the same equipment)",
    "Total Cost":
      "Automatically calculated: Duration × Rate per unit × Equipment Count",
    Notes:
      "Any special requirements (operator included, fuel provision, maintenance, etc.)",
  },

  services: {
    "Service Type": "Category (labor, supervision, inspection, testing, etc.)",
    "Service Description": "Detailed description of service",
    "Days Required": "Number of working days needed",
    "Team Size": "Number of personnel required",
    "Skill Level": "Qualifications or certifications needed",
    "Daily Rate": "Cost per day for the service",
    "Supervision Required": "Site supervision/management - yes/no",
  },

  subcontractors: {
    "Subcontractor Name": "Name of specialized contractor company",
    "Service Type": "Type of work they will perform",
    Scope: "Detailed breakdown of their responsibilities",
    "Contract Period": "Duration of their engagement (start to end date)",
    Cost: "Fixed price or daily/hourly rate",
    Insurance: "Professional indemnity and liability insurance required",
    "Contact Person": "Key contact person and phone number",
    "Special Requirements": "Any specific requirements or conditions",
  },

  boq: {
    "Bill of Quantities":
      "Detailed breakdown of all materials, labor, and costs for the project",
    "Item Code": "Unique identifier for tracking each item",
    "Item Description": "Detailed description of the work item or material",
    Specification: "Technical specification or quality standard",
    Quantity: "Amount of work to be done or material quantity",
    Unit: "Measurement unit (m², m³, kg, no., lump sum, etc.)",
    "Unit Rate": "Cost per unit of measurement",
    Amount: "Total cost for this line item (Qty × Rate)",
    "Section Headers":
      "Group related items together by work section for organization",
    Summary: "Total costs by section for easy reference",
  },

  review: {
    "Quote Summary":
      "Overview of total costs, project scope, and key assumptions",
    "Cost Breakdown": "Analysis of costs by category and major sections",
    "Bill of Quantities": "Detailed BOQ for client approval and final record",
    "Total Cost": "Complete sum of all project costs including markups",
    "Payment Terms": "Terms of payment (deposits, milestones, final)",
    Timeline: "Project duration and key completion dates",
    Assumptions: "Key assumptions made in quote preparation",
    Exclusions: "Items not included in this quote",
    "Export Options": "Download quote in multiple formats (PDF, Excel, DOCX)",
    "Material Schedule": "PDF showing material quantity summary by trade",
    "Save Quote": "Save the quote for later editing or client reference",
    Print: "Print the complete quote for physical delivery",
  },
};

export interface GuidanceSection {
  [key: string]: string;
}

export const useQuoteGuidance = (step: string): GuidanceSection | null => {
  return guidanceData[step as keyof typeof guidanceData] || null;
};

export default useQuoteGuidance;
