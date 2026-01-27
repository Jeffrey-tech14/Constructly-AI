// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedPlan } from "@/contexts/PlanContext";
import { getEnv } from "@/utils/envConfig";

class PlanParserService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor() {
    const apiKey =
      getEnv("NEXT_GEMINI_API_KEY") || getEnv("VITE_GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error(
        "Missing Gemini API key. Set NEXT_PUBLIC_GEMINI_API_KEY (Next.js) OR VITE_GEMINI_API_KEY (Vite).",
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
  }

  /**
   * Parse a construction plan file using Gemini Vision API
   * Supports PDF, images (JPG, PNG)
   * Optionally accepts a Bar Bending Schedule (BBS) file for rebar extraction
   */
  async parsePlanFile(file: File, bbsFile?: File): Promise<ExtractedPlan> {
    try {
      const base64Data = await this.fileToBase64(file);
      const mimeType = this.getMimeType(file.name);

      const contentParts: any[] = [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
      ];

      // If BBS file provided, add it to the content
      if (bbsFile) {
        const bbsBase64Data = await this.fileToBase64(bbsFile);
        const bbsMimeType = this.getMimeType(bbsFile.name);
        contentParts.push({
          inlineData: {
            data: bbsBase64Data,
            mimeType: bbsMimeType,
          },
        });
      }

      contentParts.push({
        text: this.getAnalysisPrompt(!!bbsFile),
      });

      const response = await this.model.generateContent(contentParts);

      const responseText = response.response.text();
      const parsedData = this.extractJsonFromResponse(responseText);

      return parsedData;
    } catch (error) {
      console.error("Plan parsing error:", error);
      throw new Error(
        `Failed to parse plan: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  /**
   * Parse a plan from a URL (remote file)
   */
  async parsePlanFromUrl(url: string): Promise<ExtractedPlan> {
    try {
      const response = await this.model.generateContent([
        {
          text: `Analyze this construction plan image from URL: ${url}\n\n${this.getAnalysisPrompt()}`,
        },
      ]);

      const responseText = response.response.text();
      const parsedData = this.extractJsonFromResponse(responseText);

      return parsedData;
    } catch (error) {
      console.error("Plan URL parsing error:", error);
      throw new Error(
        `Failed to parse plan from URL: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split(".").pop();
    const mimeTypes: { [key: string]: string } = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    };
    return mimeTypes[ext || ""] || "application/octet-stream";
  }

  private getAnalysisPrompt(hasBBSFile: boolean = false): string {
    return `
You are an expert architectural data extraction engine analyzing construction drawings and plans.

OUTPUT RULE:
Return VALID JSON ONLY matching the provided schema.
If no walls are detected, return exactly:
{"error":"No walls found"}

You are deterministic.
You do not explain.
You do not narrate.
You do not invent.
You do not rename enums.
Any deviation invalidates the result.

════════════════════════════════════
GLOBAL NON-NEGOTIABLE RULES
════════════════════════════════════

OUTPUT FORMAT

Output must be valid JSON

First character: {

Last character: }

No markdown

No comments

No trailing commas

No explanatory text

SCHEMA & ENUM LOCK

Field names must match schema exactly

Enum values must match exactly

Never invent enums

Map extracted labels to closest valid enum

Example: "toilet" → "water-closet"

Example: "LED light" → "led-downlight"

Preserve enum spelling exactly

SOURCE OF TRUTH

Extract ONLY what is visible, labelled, or inferable from drawings

Do NOT hallucinate dimensions

Do NOT assume missing data

Defaults are allowed ONLY where explicitly stated

UNIT NORMALIZATION

Lengths → meters

Areas → m²

Diameters → mm

Convert mm ÷ 1000

Never mix units

DEFAULTS (ONLY IF DATA IS NOT SHOWN)

External wall height → 3.2 m

Internal wall height → 2.9 m

Wall thickness → 0.2 m

Block type → "Standard Block"

Plaster → "Both Sides"

Electrical voltage → 230V

Fixture quality → "standard"

Timber: "structural", "pressure-treated"

COMPLETENESS & CONSISTENCY

Empty sections → []

Optional objects → omit (never null)

Numeric values only (no strings for numbers)

Be consistent with types

Do not include paint anywhere

Do not include varandah slabs or porch slabs anywhere in this analysis
════════════════════════════════════
WALL EXTRACTION (CRITICAL)
════════════════════════════════════

Identify ALL walls

Exactly TWO wall sections only:

"external"

"internal"

One object per wall type (no duplicates)

MEASUREMENTS

External wall perimeter = full building footprint

Internal wall perimeter = sum of all partition walls

Use external dimension lines where available

Prefer labelled dimensions over inferred ones

HEIGHTS

Measure from ground to slab/roof level

Add 0.3 m allowance above slab for ceilings

THICKNESS

Extract external and internal thickness separately

════════════════════════════════════
DOORS & WINDOWS (WITHIN WALLS)
════════════════════════════════════

Detect all doors and windows

Use schedules or symbols if present

Count totals per wall section

Identify frame types

Identify whether opening is internal or external

Allowed sizes only:
standardDoorSizes =
["0.9 × 2.1 m", "1.0 × 2.1 m", "1.2 × 2.4 m"]

standardWindowSizes =
["1.2 × 1.2 m", "1.5 × 1.2 m", "2.0 × 1.5 m"]

════════════════════════════════════
FOUNDATION EXTRACTION (MANDATORY)
════════════════════════════════════

If structure is concrete → foundation MUST exist.
If there is no defined height, use 0.65 m as default.

Foundation type (extract from drawing):

"strip-footing"

"raft-foundation"

"pad-foundation"

If bungalow and concrete → default to "strip-footing"

FOUNDATION DEFINITIONS

Excavation Depth: ground → bottom of trench

Foundation Height: trench bottom - strip footing height(if present) → top of slab

Strip Footing Height: footing element only

Ground Floor Slab Thickness: typically 0.15 m

Foundation Wall Height =
Foundation Height − Strip Footing Height − Slab Thickness

If no clear foundation height → use 0.65 m

FOUNDATION WALL / PLINTH

Extract as a concreteStructure

Name: "Foundation Wall" or "Plinth Wall"

Element type: "foundation-wall"

Identify masonry type (block / rubble stone)

Extract wall thickness and height

MUST have corresponding reinforcement

════════════════════════════════════
REINFORCEMENT & CONCRETE RULE
════════════════════════════════════

Concrete item ↔ reinforcement item must BOTH exist

Exception: Bar Bending Schedule present → do not duplicate

Rebar sizes: "D10", "D12", "D16", etc
Default calculation should be kg/m3 not individual bars
Ground floor is always BRC A98 as default
Do not include oversite concrete or any form of blinding
For bungalows, we only have ground floor slab and strip footing foundation elements only
The width of strip footings is always 3 times the wall thickness unless otherwise specified

Concrete grades:

C25 → "1:2:4"

C20 → "1:2:3"

════════════════════════════════════
FOUNDATION WALLING (MASONRY ABOVE FOOTING)
════════════════════════════════════

Extract separately for:

external

internal

Block sizes (LxHxT in meters):

"0.2x0.2x0.2"

"0.15x0.2x0.15"

"0.1x0.2x0.1"

"0.4x0.2x0.2"

Block thickness (mm only):
100, 150, 200, 250, 300

Mortar ratios:
"1:3", "1:4", "1:5", "1:6"

════════════════════════════════════
RING BEAMS (ONLY IF SHOWN)
════════════════════════════════════

Extract ONLY if explicitly drawn or labelled

Perimeter usually equals external wall perimeter

Width usually equals wall thickness

Typical depth: 0.15–0.25 m

Reinforcement (if visible):

mainBarSize

mainBarsCount

stirrupSize

stirrupSpacing (mm)

Multiple ring beams → multiple entries

════════════════════════════════════
FINAL RULE
════════════════════════════════════

The drawing may include plans, sections, and elevations of the SAME building.
Use ALL views to resolve dimensions accurately.
Never guess.
Never invent.
Never explain.

Return JSON only.
Analyze this construction document and extract ALL available information about:

### 🏗️ WALL STRUCTURE IDENTIFICATION:
- Calculate the TOTAL EXTERNAL WALL PERIMETER of the building footprint in meters
- Calculate the TOTAL INTERNAL WALL PERIMETER in meters  
- Identify the EXTERNAL WALL HEIGHT from ground to slab level
- Identify the INTERNAL WALL HEIGHT from ground to slab level
- Create wall sections categorized as "external" or "internal"
- For each wall section, identify and list all doors and windows with their properties
- Pay special attention to door and window schedules or labels (like DOO-001, WD-012, etc.)
- Count doors and windows per section type

**Plumbing:**
- System types: "water-supply", "drainage", "sewage", "rainwater", "hot-water", "fire-fighting", "gas-piping", "irrigation"
- Pipe materials: "PVC-u", "PVC-c", "copper", "PEX", "galvanized-steel", "HDPE", "PPR", "cast-iron", "vitrified-clay"
- Fixture types: "water-closet", "urinal", "lavatory", "kitchen-sink", "shower", "bathtub", "bidet", "floor-drain", "cleanout", "hose-bib"
- Quality: "standard", "premium", "luxury"

**Electrical:**
- System types: "lighting", "power", "data", "security", "cctv", "fire-alarm", "access-control", "av-systems", "emergency-lighting", "renewable-energy"
- Cable types: "NYM-J", "PVC/PVC", "XLPE", "MICC", "SWA", "Data-CAT6", "Ethernet", "Fiber-Optic", "Coaxial"
- Outlet types: "power-socket", "light-switch", "dimmer-switch", "data-port", "tv-point", "telephone", "usb-charger", "gpo"
- Lighting types: "led-downlight", "fluorescent", "halogen", "emergency-light", "floodlight", "street-light", "decorative"
- Installation methods: "surface", "concealed", "underground", "trunking"
- Amperes: "6, 10, 13, 16, 20, 25, 32, 40, 45, 63"
- LIGHTING_WATTAGE = [3, 5, 7, 9, 12, 15, 18, 20, 24, 30, 36, 40, 50, 60];
- commonOutletRatings = [6, 10, 13, 16, 20, 25, 32, 40, 45, 63];

**Reinforcement:** 
- ElementTypes =
  | "slab"
  | "beam"
  | "column"
  | "raft-foundation"
  | "strip-footing"
  | "tank";
- RebarSize =
  | "R6"
  | "D6"
  | "D8"
  | "D10"
  | "D12"
  | "D14"
  | "D16"
  | "D18"
  | "D20"
  | "D22"
  | "D25"
  | "D28"
  | "D32"
  | "D36"
  | "D40"
  | "D50";
- ReinforcementType = "individual_bars" | "mesh";
- FootingType = "isolated" | "strip" | "combined";
- STANDARD_MESH_SHEETS = [
    { width: 2.4, length: 4.8 },
    { width: 2.4, length: 6.0 },
    { width: 2.4, length: 7.2 },
    { width: 3.0, length: 6.0 },
    { width: 3.6, length: 6.0 },
  ];
- TankType =
  | "septic"
  | "underground"
  | "overhead"
  | "water"
  | "circular";
- TankWallType = "walls" | "base" | "cover" | "all";
- RetainingWallType = "cantilever" | "gravity" | "counterfort";
- Be definite between the reinforcement types, eg either mesh or individual_bars
- If you find both reinforcement types, create two individual entries for each with the correct type

${
  hasBBSFile
    ? `**BAR BENDING SCHEDULE (BBS) EXTRACTION:**
- If a Bar Bending Schedule file is provided, extract ALL bar bending details:
- Bar types: D6, D8, D10, D12, D14, D16, D18, D20, D22, D25, D28, D32, D36, D40, D50
- For each bar type found, identify:
  - Bar length (in meters, convert from mm if needed)
  - Total quantity of bars with that length
  - Estimated weight per meter (if visible or calculable)
- Group bars by type and length combination
- Make sure to combine similar bars into single entries with total quantities
- Set rebar_calculation_method to "bbs"
- Look out for symbols that will inform you of the type of bar eg, ↀ16 or ∅16 will be D16. This applies to the the bbs and the reinforecement in general
- Look out for measurements eg; 12mm, 8mm, etc these are the diameters of the needed bars, hence D12, D8, etc.
- Return complete bar_schedule array with all extracted bars
- Be precise and thorough, make usre you capture every detail you can find correctly so take the time to check`
    : `**REBAR CALCULATION METHOD:**
- Since no Bar Bending Schedule is provided, set rebar_calculation_method to "intensity-based"
- This indicates that rebar calculations will be based on reinforcement intensity formulas
- bar_schedule array should be empty [] when using intensity-based method`
}


### DETAILED REINFORCEMENT EXTRACTION BY ELEMENT TYPE:

**For Strip Footings and Raft Foundations:**
- Extract longitudinalBars: Main bars running along the length (string format: "D12" for bar size or "D12@150" for bar size and spacing)
- Extract transverseBars: Distribution bars across width (string format)
- Extract topReinforcement: Top layer reinforcement specification
- Extract bottomReinforcement: Bottom layer reinforcement specification
- footingType: Must be "strip", "isolated", or "combined"
- Include mainBarSpacing, distributionBarSpacing in mm (e.g., "150", "200")

**For Retaining Walls:**
- retainingWallType: MUST be "cantilever", "gravity", or "counterfort"
- heelLength: Length of heel in meters (e.g., "0.5")
- toeLength: Length of toe in meters (e.g., "0.5")
- Stem reinforcement:
  - stemVerticalBarSize: Vertical bar size (e.g., "D12", "D10")
  - stemHorizontalBarSize: Horizontal bar size (e.g., "D10", "D8")
  - stemVerticalSpacing: Vertical bar spacing in mm (e.g., "150")
  - stemHorizontalSpacing: Horizontal bar spacing in mm (e.g., "200")
- Base reinforcement (same structure as footings):
  - baseMainBarSize, baseDistributionBarSize
  - baseMainSpacing, baseDistributionSpacing

**For Beams:**
- mainBarsCount: Number of main bars (e.g., "4", "6")
- distributionBarsCount: Number of distribution/shear reinforcement bars
- stirrupSpacing: Stirrup spacing in mm (e.g., "100", "150", "200")
- stirrupSize: Stirrup bar size (e.g., "D8", "D6")
- mainBarSpacing: Spacing of main bars (if continuous layout)

**For Columns:**
- mainBarsCount: Number of longitudinal bars (e.g., "4", "6", "8", "12")
- tieSpacing: Column tie/link spacing in mm (e.g., "150", "200", "250")
- tieSize: Tie bar size (e.g., "D6", "D8", "D10")
- mainBarSize: Longitudinal bar size
- columnHeight: Height of column in meters

**For Slabs:**
- mainBarSize: Bottom layer main bars
- distributionBarSize: Bottom layer distribution bars
- mainBarSpacing: Main bar spacing in mm
- distributionBarSpacing: Distribution bar spacing in mm
- slabLayers: Number of reinforcement layers ("1" for single, "2" for double)
- If slabLayers > 1, also provide top layer reinforcement (use topReinforcement field)

**For Tanks:**
- All basic fields PLUS tank-specific reinforcement (wall, base, cover separately)
- Ensure corresponding concrete tank exists
- Tank reinforcement may include vertical and horizontal directions
- Be deifinate between the reinforcement types, eg either mesh or individual_bars
- If you find both reinforecement types, create two individual entries for each with the correct 

**Equipment:**
- Standard equipment types and their respective id = Bulldozer:15846932-db16-4a28-a477-2e4b2e1e42d5, Concrete Mixer:3203526d-fa51-4878-911b-477b2b909db5, Generator: 32c2ea0f-be58-47f0-bdcd-3027099eac4b, Water Pump:598ca378-6eb3-451f-89ea-f45aa6ecece8, Crane: d4665c7d-6ace-474d-8282-e888b53e7b48, Compactoreb80f645-6450-4026-b007-064b5f15a72a, Excavator:ef8d17ca-581d-4703-b200-17395bbe1c51

**Roofing:**
- Roof types: "pitched", "flat", "gable", "hip", "mansard", "butterfly", "skillion"
- Roof materials: "concrete-tiles", "clay-tiles", "metal-sheets", "box-profile", "thatch", "slate", "asphalt-shingles", "green-roof", "membrane"
- Timber sizes: "50x25", "50x50", "75x50", "100x50", "100x75", "150x50", "200x50"
- Underlayment: "felt-30", "felt-40", "synthetic", "rubberized", "breathable"
- Insulation: "glass-wool", "rock-wool", "eps", "xps", "polyurethane", "reflective-foil"
- Accessories: Use exact types (e.g., gutterType: "PVC", "Galvanized Steel", etc.)
- TIMBER_GRADES = [
  { value: "standard", label: "Standard Grade" },
  { value: "structural", label: "Structural Grade" },
  { value: "premium", label: "Premium Grade" },
];

- TIMBER_TREATMENTS = [
  { value: "untreated", label: "Untreated" },
  { value: "pressure-treated", label: "Pressure Treated" },
  { value: "fire-retardant", label: "Fire Retardant" },
];

- TIMBER_TYPES = [
  { value: "rafter", label: "Rafter" },
  { value: "wall-plate", label: "Wall Plate" },
  { value: "ridge-board", label: "Ridge Board" },
  { value: "purlin", label: "Purlin" },
  { value: "battens", label: "Battens" },
  { value: "truss", label: "Truss" },
  { value: "joist", label: "Joist" },
];

- UNDERLAYMENT_TYPES = [
  { value: "felt-30", label: "30# Felt Underlayment" },
  { value: "felt-40", label: "40# Felt Underlayment" },
  { value: "synthetic", label: "Synthetic Underlayment" },
  { value: "rubberized", label: "Rubberized Asphalt" },
  { value: "breathable", label: "Breathable Membrane" },
];

- INSULATION_TYPES = [
  { value: "glass-wool", label: "Glass Wool Batts" },
  { value: "rock-wool", label: "Rock Wool" },
  { value: "eps", label: "Expanded Polystyrene" },
  { value: "xps", label: "Extruded Polystyrene" },
  { value: "polyurethane", label: "Polyurethane Foam" },
  { value: "reflective-foil", label: "Reflective Foil" },
];

- GUTTER_TYPES = [
  { value: "PVC", label: "PVC Gutter" },
  { value: "Galvanized Steel", label: "Galvanized Steel Gutter" },
  { value: "Aluminum", label: "Aluminum Gutter" },
  { value: "Copper", label: "Copper Gutter" },
];

- DOWNPIPE_TYPES = [
  { value: "PVC", label: "PVC Downpipe" },
  { value: "Galvanized Steel", label: "Galvanized Steel Downpipe" },
  { value: "Aluminum", label: "Aluminum Downpipe" },
  { value: "Copper", label: "Copper Downpipe" },
];

- FLASHING_TYPES = [
  { value: "PVC", label: "PVC Flashing" },
  { value: "Galvanized Steel", label: "Galvanized Steel Flashing" },
  { value: "Aluminum", label: "Aluminum Flashing" },
  { value: "Copper", label: "Copper Flashing" },
];

- FASCIA_TYPES = [
  { value: "PVC", label: "PVC Fascia" },
  { value: "Painted Wood", label: "Painted Wood Fascia" },
  { value: "Aluminum", label: "Aluminum Fascia" },
  { value: "Composite", label: "Composite Fascia" },
];

- SOFFIT_TYPES = [
  { value: "PVC", label: "PVC Soffit" },
  { value: "Aluminum", label: "Aluminum Soffit" },
  { value: "Composite", label: "Composite Soffit" },
  { value: "Metal", label: "Metal Soffit" },
];

- ROOF_TYPES: { value: RoofType; label: string }[] = [
  { value: "flat", label: "Flat Roof" },
  { value: "pitched", label: "Pitched Roof" },
  { value: "gable", label: "Gable Roof" },
  { value: "hip", label: "Hip Roof" },
  { value: "mansard", label: "Mansard Roof" },
  { value: "butterfly", label: "Butterfly Roof" },
  { value: "skillion", label: "Skillion Roof" },
];

- ROOF_MATERIALS: { value: RoofMaterial; label: string }[] = [
  { value: "concrete-tiles", label: "Concrete Tiles" },
  { value: "clay-tiles", label: "Clay Tiles" },
  { value: "metal-sheets", label: "Metal Sheets" },
  { value: "box-profile", label: "Box Profile" },
  { value: "thatch", label: "Thatch" },
  { value: "slate", label: "Slate" },
  { value: "asphalt-shingles", label: "Asphalt Shingles" },
  { value: "green-roof", label: "Green Roof" },
  { value: "membrane", label: "Membrane" },
];

- TIMBER_SIZES: { value: TimberSize; label: string }[] = [
  { value: "50x25", label: "50mm x 25mm" },
  { value: "50x50", label: "50mm x 50mm" },
  { value: "75x50", label: "75mm x 50mm" },
  { value: "100x50", label: "100mm x 50mm" },
  { value: "100x75", label: "100mm x 75mm" },
  { value: "150x50", label: "150mm x 50mm" },
  { value: "200x50", label: "200mm x 50mm" },
];


**Finishes:**
- Categories: "flooring", "ceiling", "wall-finishes",  "joinery"
- Only use these specified categories: skip glass, blocks, anyting to do with masonry or glass etc that are not in this list
- Materials must match common options per category (e.g., flooring: "Ceramic Tiles", "Hardwood", etc.)
- COMMON_MATERIALS = {
  flooring: [
    "Ceramic Tiles",
    "Porcelain Tiles",
    "Hardwood",
    "Laminate",
    "Vinyl",
    "Carpet",
    "Polished Concrete",
    "Terrazzo",
  ],
  ceiling: [
    "Gypsum Board",
    "PVC",
    "Acoustic Tiles",
    "Exposed Concrete",
    "Suspended Grid",
    "Wood Panels",
  ],
  "wall-finishes": [
    "Wallpaper",
    "Stone Cladding",
    "Tile Cladding",
    "Wood Paneling",
  ],
  joinery: ["Solid Wood", "Plywood", "MDF", "Melamine", "Laminate"],
};

**Concrete & Structure:**
- Category = "substructure" | "superstructure";
- If we have a concrete item, ensure there is a corresponding reinforcement item extracted as well, and vice versa
- ElementType = "slab"| "beam"| "column"| "septic-tank"| "underground-tank"| "staircase"| "strip-footing"| "raft-foundation"| "pile-cap"|"water-tank"
  | "ramp"| "retaining-wall"| "culvert"| "swimming-pool"| "paving"| "kerb"| "drainage-channel"| "manhole"| "inspection-chamber"|"soak-pit"| "soakaway";

- FoundationStep {
  id: string;
  length: string;
  width: string;
  depth: string;
  offset: string;
}

- ConnectionDetails {
  lapLength?: number;
  developmentLength?: number;
  hookType?: "standard" | "seismic" | "special";
  spliceType?: "lap" | "mechanical" | "welded";
}

- WaterproofingDetails {
  includesDPC: boolean;
  dpcWidth?: string;
  dpcMaterial?: string;
  includesPolythene: boolean;
  polytheneGauge?: string;
  includesWaterproofing: boolean;
  waterproofingType?: "bituminous" | "crystalline" | "membrane";
}

- SepticTankDetails {
  capacity: string;
  numberOfChambers: number;
  wallThickness: string;
  baseThickness: string;
  coverType: "slab" | "precast" | "none";
  depth: string;
  includesBaffles: boolean;
  includesManhole: boolean;
  manholeSize?: string;
}

- UndergroundTankDetails {
  capacity: string;
  wallThickness: string;
  baseThickness: string;
  coverType: "slab" | "precast" | "none";
  includesManhole: boolean;
  manholeSize?: string;
  waterProofingRequired: boolean;
}

- SoakPitDetails {
  diameter: string;
  depth: string;
  wallThickness: string;
  baseThickness: string;
  liningType: "brick" | "concrete" | "precast";
  includesGravel: boolean;
  gravelDepth?: string;
  includesGeotextile: boolean;
}

- SoakawayDetails {
  length: string;
  width: string;
  depth: string;
  wallThickness: string;
  baseThickness: string;
  includesGravel: boolean;
  gravelDepth?: string;
  includesPerforatedPipes: boolean;
}

Only use the materials specified above strictly.
Return ONLY valid JSON with this structure. Use reasonable estimates if exact dimensions aren't visible.

{
  "wallDimensions": {
    "externalWallPerimiter": 50.5,
    "internalWallPerimiter": 35.2,
    "externalWallHeight": 3.0,
    "internalWallHeight": 2.7,
    "length": "5.0", // Length of the house
    "width": "3.0", // Width of the house
  },
  "wallSections": [
    {
      "type": "external",
      "blockType": "Standard Block" | "Large Block" | "Small Block",
      "thickness": 0.2,
      "plaster": "Both Sides",
      "doors": [
        {
          "sizeType": "standard",
          "standardSize": "0.9 × 2.1 m",
          "custom": {
            "height": "2.1",
            "width": "0.9",
            "price": ""
          },
          "type": "Panel",
          "frame": {
            "type": "Wood",
            "sizeType": "standard",
            "standardSize": "0.9 × 2.1 m",
            "height": "2.1",
            "width": "0.9",
            "custom": {
              "height": "2.1",
              "width": "0.9",
              "price": ""
            }
          },
          "count": 1,
          "price": 0
        }
      ],
      "windows": [
        {
          "sizeType": "standard",
          "standardSize": "1.2 × 1.2 m",
          "custom": {
            "height": "1.2",
            "width": "1.2",
            "price": ""
          },
          "glass": "Clear",
          "frame": {
            "type": "Steel",
            "sizeType": "standard",
            "standardSize": "1.2 × 1.2 m",
            "height": "1.2",
            "width": "1.2",
            "custom": {
              "height": "1.2",
              "width": "1.2",
              "price": ""
            }
          },
          "count": 2,
          "price": 0
        }
      ]
    },
    {
      "type": "internal",
      "blockType": "Standard Block" | "Large Block" | "Small Block",
      "thickness": 0.2,
      "plaster": "Both Sides",
      "doors": [
        {
          "sizeType": "standard",
          "standardSize": "0.9 × 2.1 m",
          "custom": {
            "height": "2.1",
            "width": "0.9",
            "price": ""
          },
          "type": "Panel",
          "frame": {
            "type": "Wood",
            "sizeType": "standard",
            "standardSize": "0.9 × 2.1 m",
            "height": "2.1",
            "width": "0.9",
            "custom": {
              "height": "2.1",
              "width": "0.9",
              "price": ""
            }
          },
          "count": 5,
          "price": 0
        }
      ],
      "windows": []
    }
  ],
  "wallProperties": {
    "blockType": "Standard Block" | "Large Block" | "Small Block",
    "thickness": 0.2,
    "plaster": "Both Sides"
  },
  "floors": 1,
  "foundationDetails": [{ 
    "foundationType": "Strip Footing", 
    "totalPerimeter": 50.5, // Total length of all exterior foundation walls in meters 
    "wallThickness": "0.200", // Thickness of the block/stone wall in meters
    "wallHeight": "1.0", // Height of the block/stone wall in meters 
    "blockDimensions": "0.400 x 0.200 x 0.200" // L x W x H in meters (optional) 
    "height": "1.0" // Height from the bottom of the footing to the top of the ground floor slab
    "length": "5.0" // Length of the foundation
    "width"" "6.0" //Width of the foundation
    "groundFloorElevation": "0.3" // Elevation from ground level to top of slab
  }],
  "foundationWalling": [
    {
      "id": "fwall-external-01",
      "type": "external",
      "blockDimensions": "0.2x0.2x0.2",
      "blockThickness": "200",
      "wallLength": "12.5",
      "wallHeight": "1.0",
      "numberOfWalls": 2,
      "mortarRatio": "1:4"
    },
    {
      "id": "fwall-internal-01",
      "type": "internal",
      "blockDimensions": "0.15x0.2x0.15",
      "blockThickness": "150",
      "wallLength": "8.0",
      "wallHeight": "1.0",
      "numberOfWalls": 1,
      "mortarRatio": "1:4"
    }
  ],
  "ringBeams": [
    {
      "id": string,
      "name": string,
      "perimeter": string, // Total perimeter of ring beam in meters (usually external wall perimeter)
      "width": string, // Width of ring beam in meters (typically 0.2m to 0.3m)
      "depth": string, // Depth of ring beam in meters (typically 0.15m to 0.2m)
      "concrete_mix": string, // Concrete mix ratio e.g., "1:2:4" for C25
      "mainBarSize"?: string, // Main reinforcement bar size (e.g., "D12", "D16")
      "mainBarsCount"?: string, // Number of main bars (e.g., "8", "10", "12")
      "stirrupSize"?: string, // Stirrup bar size (e.g., "D8", "D10")
      "stirrupSpacing"?: string // Stirrup spacing in mm (e.g., "200", "250")
    }
  ],
  "projectType": "residential" | "commercial" | "industrial" | "institutional",
  "floors": number,
  "totalArea": number, //Area covered by the house L x W then multiply by 200%
  "houseType": "bungalow" | "mansionate",
  "description": string
  "clientName": string,
  "projectName": string,
  "projectLocation": string,
  
  "concreteStructures": [
    {
      id:string;
      name: string;
      element: ElementType;
      length: string;
      width: string;
      height: string;
      mix: string;
      formwork?: string;
      category: Category;
      number: string;
      hasConcreteBed?: boolean;
      verandahArea: number;
      slabArea?: number;
      bedDepth?: string;
      hasAggregateBed?: boolean;
      aggregateDepth?: string;
      hasMasonryWall?: boolean;
      masonryBlockType?: string;
      masonryBlockDimensions?: string;
      masonryWallThickness?: string;
      masonryWallHeight?: string;
      masonryWallPerimeter?: number;
      foundationType?: string;
      clientProvidesWater?: boolean;
      cementWaterRatio?: string;

      isSteppedFoundation?: boolean;
      foundationSteps?: FoundationStep[];
      totalFoundationDepth?: string;

      waterproofing?: WaterproofingDetails;

      reinforcement?: {
        mainBarSize?: RebarSize;
        mainBarSpacing?: string;
        distributionBarSize?: RebarSize;
        distributionBarSpacing?: string;
        connectionDetails?: ConnectionDetails;
      };

      staircaseDetails?: {
        riserHeight?: number;
        treadWidth?: number;
        numberOfSteps?: number;
      };

      tankDetails?: {
        capacity?: string;
        wallThickness?: string;
        coverType?: string;
      };

      septicTankDetails?: SepticTankDetails;
      undergroundTankDetails?: UndergroundTankDetails;
      soakPitDetails?: SoakPitDetails;
      soakawayDetails?: SoakawayDetails;
    }
  ],
  ${
    !hasBBSFile
      ? `
  "reinforcement":[
    {
      id?: string;
      element: ElementTypes;
      name: string;
      length: string;
      width: string;
      depth: string;
      columnHeight?: string;
      mainBarSpacing?: string;
      distributionBarSpacing?: string;
      mainBarsCount?: string;
      distributionBarsCount?: string;
      slabLayers?: string;
      mainBarSize?: RebarSize;
      distributionBarSize?: RebarSize;
      stirrupSize?: RebarSize;
      tieSize?: RebarSize;
      stirrupSpacing?: string;
      tieSpacing?: string;
      category?: Category;
      number?: string;
      reinforcementType?: ReinforcementType;
      rebarCalculationMode: "NORMAL_REBAR_MODE"; //default is NORMAL_REBAR_MODE always
      meshGrade?: string;
      meshSheetWidth?: string;
      meshSheetLength?: string;
      meshLapLength?: string;
      footingType?: FootingType;
      longitudinalBars?: string;
      transverseBars?: string;
      topReinforcement?: string;
      bottomReinforcement?: string;
      retainingWallType?: RetainingWallType;
      heelLength?: string;
      toeLength?: string;
      stemVerticalBarSize?: RebarSize;
      stemHorizontalBarSize?: RebarSize;
      stemVerticalSpacing?: string;
      stemHorizontalSpacing?: string;
    },
    {
      "id": "unique-id-6",
      "element": "tank",
      "name": "Septic Tank ST1",
      "length": "3.0",
      "width": "2.0",
      "depth": "1.8",
      "columnHeight": "",
      "mainBarSpacing": "",
      "distributionBarSpacing": "",
      "mainBarsCount": "",
      "distributionBarsCount": "",
      "slabLayers": "",
      "mainBarSize": "D12",
      "distributionBarSize": "D10",
      "stirrupSize": "",
      "tieSize": "",
      "stirrupSpacing": "",
      "tieSpacing": "",
      "category": "substructure",
      "number": "1",
      "reinforcementType": "individual_bars",
      "meshGrade": "",
      "meshSheetWidth": "",
      "meshSheetLength": "",
      "meshLapLength": "",
      "footingType": "",
      "longitudinalBars": "",
      "transverseBars": "",
      "topReinforcement": "",
      "bottomReinforcement": "",
      "tankType": "septic",
      "tankShape": "rectangular",
      "wallThickness": "0.2",
      "baseThickness": "0.2",
      "coverThickness": "0.15",
      "includeCover": true,
      "wallVerticalBarSize": "D12",
      "wallHorizontalBarSize": "D10",
      "wallVerticalSpacing": "150",
      "wallHorizontalSpacing": "200",
      "baseMainBarSize": "D12",
      "baseDistributionBarSize": "D10",
      "baseMainSpacing": "150",
      "baseDistributionSpacing": "200",
      "coverMainBarSize": "D10",
      "coverDistributionBarSize": "D8",
      "coverMainSpacing": "200",
      "coverDistributionSpacing": "250"
    },
  ],
  `
      : ``
  }
  "equipment":{
    "equipmentData": {
      "standardEquipment": [
        {
          "id": "equip_001",
          "name": "Excavator",
          "description": "Heavy-duty excavator for digging and earthmoving",
          "usage_unit": "day",
          "usage_quantity": 1 // number of days, weeks, hours etc to be used,
          "category": "earthmoving"
        },
      ],
      "customEquipment": [
        {
          "equipment_type_id": "custom_001",
          "name": "Specialized Drilling Rig",
          "desc": "Custom drilling equipment for foundation work",
          "usage_unit": "week",
          "usage_quantity": 1 // number of days, weeks, hours etc to be used,
        },
      ],
    }
  }
  "roofing": [
    {
      "id": string,
      "name": string,
      "type": RoofType,
      "material": RoofMaterial,
      "area": number,
      "pitch": number, // degrees
      "length": number,
      "width": number,
      "eavesOverhang": number,
      "covering": {
        "type": string,
        "material": RoofMaterial,
        "underlayment"?: UnderlaymentType,
        "insulation"?: { "type": InsulationType, "thickness": number // m }
      },
      "timbers": [
        {
          "id": string,
          "type": string, // e.g., "rafter", "battens"
          "size": TimberSize,
          "spacing": number,
          "grade": "standard" | "structural" | "premium",
          "treatment": "untreated" | "pressure-treated" | "fire-retardant",
          "quantity": number,
          "length": number,
          "unit": "m" | "pcs"
        }
      ],
      "accessories": {
        "gutters": number,
        "gutterType": GutterType,
        "downpipes": number,
        "downpipeType": DownpipeType,
        "flashings": number,
        "flashingType": FlashingType,
        "fascia": number,
        "fasciaType": FasciaType,
        "soffit": number,
        "soffitType": SoffitType
        "RidgeCaps": number // m,
        valleyTraps: number // m
      },
    }
  ],
  "plumbing": [
    {
      "id": string,
      "name": string,
      "systemType": PlumbingSystemType,
      "pipes": [
        {
          "id": string,
          "material": PipeMaterial,
          "diameter": number, // from [15,20,...200]
          "length": number,
          "quantity": number,
          "pressureRating"?: string,
          "insulation"?: { "type": string, "thickness": number },
          "trenchDetails"?: { "width": number, "depth": number, "length": number }
        }
      ],
      "fixtures": [
        {
          "id": string,
          "type": FixtureType,
          "count": number,
          "location": string,
          "quality": "standard" | "premium" | "luxury",
          "connections": {
            "waterSupply": boolean,
            "drainage": boolean,
            "vent": boolean
          }
        }
      ],
      "tanks": [],
      "pumps": [],
      "fittings": []
    }
  ],
  "electrical": [
    {
      "id": string,
      "name": string,
      "systemType": ElectricalSystemType,
      "cables": [
        {
          "id": string,
          "type": CableType,
          "size": number, // mm² (from commonCableSizes)
          "length": number,
          "quantity": number,
          "circuit": string,
          "protection": string,
          "installationMethod": InstallationMethod
        }
      ],
      "outlets": [
        {
          "id": string,
          "type": OutletType,
          "count": number,
          "location": string,
          "circuit": string,
          "rating": number, // from commonOutletRatings
          "gang": number, // 1–4
          "mounting": "surface" | "flush"
        }
      ],
      "lighting": [
        {
          "id": string,
          "type": LightingType,
          "count": number,
          "location": string,
          "circuit": string,
          "wattage": number, // from LIGHTING_WATTAGE
          "controlType": "switch" | "dimmer" | "sensor" | "smart",
          "emergency": boolean
        }
      ],
      "distributionBoards": [
        {
          "id": string,
          "type": "main" | "sub",
          "circuits": number,
          "rating": number,
          "mounting": "surface" | "flush",
          "accessories": string[]
        }
      ],
      "protectionDevices": [],
      "voltage": 230 // default if not specified
    }
  ],
  "finishes": [
    {
      "id": string,
      "category": FinishCategory,
      "type": string,
      "material": string, // from COMMON_MATERIALS[category]
      "area": number,
      "unit": "m²" | "m" | "pcs",
      "quantity": number,
      "location": string
    }
  ],
  ${
    hasBBSFile
      ? `"bar_schedule": [
    {
      "bar_type": "D6" | "D8" | "D10" | "D12" | "D14" | "D16" | "D18" | "D20" | "D22" | "D25" | "D28" | "D32" | "D36" | "D40" | "D50",
      "bar_length": number, // in meters
      "quantity": number, // total quantity for this bar type and length
      "weight_per_meter"?: number, // optional: estimated weight per meter in kg
      "total_weight"?: number // optional: total weight in kg
    }
  ],
  "rebar_calculation_method": "bbs"`
      : `"rebar_calculation_method": "intensity-based"`
  }
  }
`;
  }

  private extractJsonFromResponse(text: string): ExtractedPlan {
    try {
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // Map Gemini response to ExtractedPlan interface
      let extractedPlan: ExtractedPlan = {
        ...parsed,
        projectInfo: {
          projectType: parsed.projectType || "residential",
          floors: parsed.floors || 1,
          totalArea: parsed.totalArea || 0,
          description: parsed.projectDescription || parsed.description || "",
        },
      };

      // Calculate foundation wall heights from concrete structures
      extractedPlan = this.calculateFoundationWallHeights(extractedPlan);

      return extractedPlan;
    } catch (error) {
      console.error("JSON extraction error:", error);
      throw new Error(
        `Failed to parse plan response: ${
          error instanceof Error ? error.message : "Invalid JSON"
        }`,
      );
    }
  }

  /**
   * Calculate foundation wall heights by:
   * wallHeight = excavationDepth - stripFootingHeight - groundFloorSlabThickness
   * Ensures both external and internal walls exist
   */
  private calculateFoundationWallHeights(
    extractedPlan: ExtractedPlan,
  ): ExtractedPlan {
    try {
      // Extract key dimensions from concrete structures
      const concreteStructures = extractedPlan.concreteStructures || [];

      // Find excavation depth (from foundation details or deepest concrete element)
      const excavationDepth =
        parseFloat(extractedPlan.foundationDetails?.[0].height || "0") || 0;

      // Find strip footing height by element type
      const stripFooting = concreteStructures.find(
        (c) => c.element?.toLowerCase() === "strip-footing",
      );
      const stripFootingHeight = stripFooting
        ? parseFloat(stripFooting.height || "0")
        : 0;

      // Find ground floor slab thickness by name
      const groundFloorSlab = concreteStructures.find(
        (c) =>
          c.name?.toLowerCase().includes("ground floor") &&
          c.name?.toLowerCase().includes("slab"),
      );
      const groundFloorSlabThickness = groundFloorSlab
        ? parseFloat(groundFloorSlab.height || "0.15")
        : 0.15; // Default 150mm if not found

      // Calculate foundation wall height
      const calculatedWallHeight =
        excavationDepth - stripFootingHeight - groundFloorSlabThickness;

      // Get wall lengths from wall dimensions
      const wallDimensions = extractedPlan?.wallDimensions;
      const externalWallLength = (
        wallDimensions?.externalWallPerimiter || "0"
      ).toString();
      const internalWallLength = (
        wallDimensions?.internalWallPerimiter || "0"
      ).toString();

      // Ensure both external and internal walls exist
      let foundationWalls = extractedPlan.foundationWalling || [];
      const hasExternal = foundationWalls.some((w) => w.type === "external");
      const hasInternal = foundationWalls.some((w) => w.type === "internal");

      // Add missing external wall if not present
      if (!hasExternal) {
        foundationWalls.push({
          id: "fwall-external-default",
          type: "external",
          blockType: "Standard Natural Block",
          blockDimensions: "0.2x0.2x0.2",
          blockThickness: "200",
          wallLength: externalWallLength,
          wallHeight:
            calculatedWallHeight > 0 ? calculatedWallHeight.toString() : "1.0",
          numberOfWalls: 1,
          mortarRatio: "1:4",
        });
      }

      // Add missing internal wall if not present
      if (!hasInternal) {
        foundationWalls.push({
          id: "fwall-internal-default",
          type: "internal",
          blockType: "Standard Natural Block",
          blockDimensions: "0.15x0.2x0.15",
          blockThickness: "150",
          wallLength: internalWallLength,
          wallHeight:
            calculatedWallHeight > 0 ? calculatedWallHeight.toString() : "1.0",
          numberOfWalls: 1,
          mortarRatio: "1:4",
        });
      }

      // Update foundation walls with calculated height and wall lengths
      extractedPlan.foundationWalling = foundationWalls.map((wall) => ({
        ...wall,
        wallHeight:
          calculatedWallHeight > 0
            ? calculatedWallHeight.toString()
            : wall.wallHeight || "1.0", // Fallback to extracted value if calculation fails
        wallLength:
          wall.type === "external"
            ? externalWallLength
            : wall.type === "internal"
              ? internalWallLength
              : wall.wallLength,
      }));

      return extractedPlan;
    } catch (error) {
      console.error("Foundation wall height calculation error:", error);
      // Return original plan if calculation fails
      return extractedPlan;
    }
  }
}

export const planParserService = new PlanParserService();
