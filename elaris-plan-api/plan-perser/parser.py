# © 2025 Jeff. All rights reserved.
# Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import sys
import json
import os
import re
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# Configuration
DEFAULT_HEIGHT = "2.7"
DEFAULT_THICKNESS = "0.2"
DEFAULT_BLOCK_TYPE = "Standard Block"
DEFAULT_PLASTER = "Both Sides"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
GEMINI_ENABLED = bool(GEMINI_API_KEY)

def call_gemini(file_path: str, prompt: str) -> Optional[Dict[str, Any]]:
    """Call Gemini API with proper error handling"""
    if not GEMINI_ENABLED:
        raise RuntimeError("Gemini API key not found. Set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.")
    
    try:
        import google.generativeai as genai
    except ImportError as e:
        raise RuntimeError(f"Google Generative AI library not installed: {e}")
    
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Use the most stable model
        model_name = "gemini-2.5-flash-lite"
        print(f"🔄 Using model: {model_name}", file=sys.stderr)
        model = genai.GenerativeModel(model_name)
        
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        print(f"📤 Processing file: {os.path.basename(file_path)}", file=sys.stderr)
        
        # Read file as binary data
        with open(file_path, 'rb') as f:
            file_data = f.read()
        
        # Get file extension and set MIME type
        ext = os.path.splitext(file_path)[1].lower()
        mime_type = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png'
        }.get(ext, 'application/octet-stream')
        
        # Create file parts for the model
        file_part = {
            "mime_type": mime_type,
            "data": file_data
        }
        
        print("⏳ Waiting for Gemini response...", file=sys.stderr)
        
        # Generate content with file data
        response = model.generate_content([prompt, file_part])
        
        if response and response.text:
            cleaned = response.text.strip().replace('```json', '').replace('```', '').strip()
            
            # Try to parse JSON
            try:
                result = json.loads(cleaned)
                print("✅ Successfully parsed Gemini response", file=sys.stderr)
                return result
            except json.JSONDecodeError:
                # Try to extract JSON from text
                m = re.search(r'\{.*\}', cleaned, re.DOTALL)
                if m:
                    try:
                        result = json.loads(m.group())
                        print("✅ Successfully extracted JSON from response", file=sys.stderr)
                        return result
                    except Exception:
                        pass
                raise RuntimeError("Gemini returned non-JSON response")
        else:
            raise RuntimeError("Gemini returned empty response")
        
    except Exception as e:
        raise RuntimeError(f"Gemini API call failed: {e}")

def analyze_with_gemini(file_path: str) -> Dict[str, Any]:
    """Analyze construction document using Gemini only"""
    GEMINI_PROMPT = """
You are an expert architectural AI analyzing construction drawings and plans with extreme attention to detail.
(Keep output EXACTLY as JSON matching the requested schema. If no walls detected, respond with {"error":"No walls found"}.)

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
  | "foundation"
  | "strip-footing"
  | "tank";
- RebarSize =
  | "R6"
  | "Y6"
  | "Y8"
  | "Y10"
  | "Y12"
  | "Y14"
  | "Y16"
  | "Y18"
  | "Y20"
  | "Y22"
  | "Y25"
  | "Y28"
  | "Y32"
  | "Y36"
  | "Y40"
  | "Y50";
- ReinforcementType = "individual_bars" | "mesh";
- FootingType = "isolated" | "strip" | "combined";
- MESH_PROPERTIES: Record<
    string,
    { weightPerSqm: number; wireDiameter: number; spacing: number }
  > = {
    A98: {
      weightPerSqm: 1.54,
      wireDiameter: 5,
      spacing: 200,
    },
    A142: {
      weightPerSqm: 2.22,
      wireDiameter: 6,
      spacing: 200,
    },
    A193: {
      weightPerSqm: 3.02,
      wireDiameter: 7,
      spacing: 200,
    },
    A252: {
      weightPerSqm: 3.95,
      wireDiameter: 8,
      spacing: 200,
    },
    A393: {
      weightPerSqm: 6.16,
      wireDiameter: 10,
      spacing: 200,
    },
    B196: {
      weightPerSqm: 2.45,
      wireDiameter: 6,
      spacing: 100,
    },
    B283: {
      weightPerSqm: 3.73,
      wireDiameter: 7,
      spacing: 100,
    },
    B385: {
      weightPerSqm: 5.0,
      wireDiameter: 8,
      spacing: 100,
    },
    B503: {
      weightPerSqm: 6.72,
      wireDiameter: 9,
      spacing: 100,
    },
    B785: {
      weightPerSqm: 10.9,
      wireDiameter: 11,
      spacing: 100,
    },
    C283: {
      weightPerSqm: 4.34,
      wireDiameter: 7,
      spacing: 100,
    },
    C385: {
      weightPerSqm: 6.0,
      wireDiameter: 8.5,
      spacing: 100,
    },
  };

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
- Categories: "flooring", "ceiling", "wall-finishes", "paint", "joinery"
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
  paint: ["Emulsion", "Enamel", "Weatherproof", "Textured", "Metallic"],
  joinery: ["Solid Wood", "Plywood", "MDF", "Melamine", "Laminate"],
};

**Concrete & Structure:**
- Category = "substructure" | "superstructure";
- ElementType =
  | "slab"
  | "beam"
  | "column"
  | "foundation"
  | "septic-tank"
  | "underground-tank"
  | "staircase"
  | "ring-beam"
  | "strip-footing"
  | "raft-foundation"
  | "pile-cap"
  | "water-tank"
  | "ramp"
  | "retaining-wall"
  | "culvert"
  | "swimming-pool"
  | "paving"
  | "kerb"
  | "drainage-channel"
  | "manhole"
  | "inspection-chamber"
  | "soak-pit"
  | "soakaway";

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
- Rebar sizes follow standard notation (e.g., "Y10", "Y12")
- Mixes to follow ratios eg 1:2:4, 1:2:3
- Notations C25 or C20 e.t.c, to be changed into their corresponding mixes for C:S:B(cement, sand, ballast)
- Note that the provided file contains information about one building from different perspectives (e.g plan, section, elevation etc). Use all the information available to provide the most accurate dimensions and details
- Ensure accuracy on measuring the wall perimeters and heights

### 📐 WALL DIMENSION EXTRACTION:
- Calculate EXTERNAL WALL PERIMETER: sum of all exterior wall lengths in meters
- Calculate INTERNAL WALL PERIMETER: sum of all interior partition wall lengths in meters
- Extract EXTERNAL WALL HEIGHT: distance from ground to roof level in meters
- Extract INTERNAL WALL HEIGHT: distance from ground to roof level for interior walls in meters
- Look for dimension lines, labels, or grid references on the plan
- Use external dimensions marked on the drawing
- Convert all measurements to meters (mm values should be divided by 1000)
- Pay attention to dimension strings and annotation

### 🚪 DOOR & WINDOW SPECIFICATIONS IN WALLS:
- Identify all doors: types, sizes, frame types, and counts
- Identify all windows: glass types, sizes, frame types, and counts
- Look for door/window schedules or symbols (like DOO-001, WD-012, etc.)
- Note whether openings are in external or internal walls
- We can only have two inputs for wall sections: "external" and "internal", we cannot have multiple wall sections of the same type, only one wall section with all its doors and windows listed
- Count the total number of each type per wall section
- standardDoorSizes = ["0.9 × 2.1 m", "1.0 × 2.1 m", "1.2 × 2.4 m"]
- standardWindowSizes = ["1.2 × 1.2 m", "1.5 × 1.2 m", "2.0 × 1.5 m"]

### 🏗️ CONSTRUCTION DETAILS:
- Note wall thicknesses if specified
- Identify floor levels (single story, multi-story)
- Look for any construction notes or specifications
- Note any special features like fireplaces, built-in cabinets, etc.
- If a room cannot be plasters for whatever reason, mark as "None"
- Do not assume any dimensions, only extract what is visible on the drawings
- Make sure you get the correct areas for the finishes, eg painting area should be wall area minus openings area (doors and windows)

### 🏗️ FOUNDATION AND CONSTRUCTION DETAILS: 
# - Determine the **TOTAL EXTERNAL PERIMETER** of the building footprint in meters. 
# - Identify the specified **FOUNDATION TYPE** (e.g., Strip Footing, Raft). 
# - Identify the material used for the foundation wall/plinth level, specifically the **MASONRY TYPE** (e.g., Block Wall, Rubble Stone). 
# - Extract the **MASONRY WALL THICKNESS** (e.g., 0.2m). 
# - Extract the approximate **MASONRY WALL HEIGHT** from the top of the footing to the slab level (e.g., 1.0m).

### 📤 OUTPUT REQUIREMENTS:
Only use the materials specified above strictly.
Return ONLY valid JSON with this structure. Use reasonable estimates if exact dimensions aren't visible.

{
  "wallDimensions": {
    "externalWallPerimiter": 50.5,
    "internalWallPerimiter": 35.2,
    "externalWallHeight": 3.0,
    "internalWallHeight": 2.7
  },
  "wallSections": [
    {
      "type": "external",
      "blockType": "Standard Block (400×200×200mm)",
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
      "blockType": "Standard Block (400×200×200mm)",
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
    "blockType": "Standard Block (400×200×200mm)",
    "thickness": 0.2,
    "plaster": "Both Sides"
  },
  "floors": 1,
  "foundationDetails": { 
    "foundationType": "Strip Footing", 
    "totalPerimeter": 50.5, // Total length of all exterior foundation walls in meters 
    "masonryType": "Standard Block", // e.g., "Standard Block", "Rubble Stone" 
    "wallThickness": "0.200", // Thickness of the block/stone wall in meters
    "wallHeight": "1.0", // Height of the block/stone wall in meters 
    "blockDimensions": "0.400 x 0.200 x 0.200" // L x W x H in meters (optional) 
    "height": "1.0" // Depth or height of the foundation
    "length": "5.0" // Length of the foundation
    "width"" "6.0" //Width of the foundation
  } 
  "projectType": "residential" | "commercial" | "industrial" | "institutional",
  "floors": number,
  "totalArea": number,
  "houseType": "bungalow" | "mansionate" | "apartment" | "villa" | "townhouse" |" warehouse"|"mansion",
  "description": string
  "projectName": string,
  "projectLocation": string,
  
  "earthworks": [ {
      "id": "excavation-01",
      "type": "foundation-excavation",
      "length": "15.5",
      "width": "10.2", 
      "depth": "1.2",
      "volume": "189.72",
      "material": "soil"
    } 
  ],
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
      "mainBarSize": "Y12",
      "distributionBarSize": "Y10",
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
      "wallVerticalBarSize": "Y12",
      "wallHorizontalBarSize": "Y10",
      "wallVerticalSpacing": "150",
      "wallHorizontalSpacing": "200",
      "baseMainBarSize": "Y12",
      "baseDistributionBarSize": "Y10",
      "baseMainSpacing": "150",
      "baseDistributionSpacing": "200",
      "coverMainBarSize": "Y10",
      "coverDistributionBarSize": "Y8",
      "coverMainSpacing": "200",
      "coverDistributionSpacing": "250"
    },
  ],
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
  }

IMPORTANT: 
1. **DO NOT invent dimensions** that are not visible or inferable.
2. **Use defaults only when reasonable**:
   - External wall height → 3.0 m
   - Internal wall height → 2.7 m
   - Wall thickness → 0.2 m
   - Block type → "Standard Block (400×200×200mm)"
   - Plaster → "Both Sides"
   - Roof wastage → 5%
   - Electrical voltage → 230V
   - Fixture quality → "standard"
   - Timber grade/treatment → "structural" / "pressure-treated" for structural elements
3. **Map extracted names to closest enum** (e.g., "toilet" → "water-closet", "LED light" → "led-downlight")
4. **If a section has no data, return empty array** (`[]`) or omit optional objects.
5. **All numeric measurements in meters or as specified** (e.g., diameter in mm, area in m²).
6. **Be consistent with your type system** — no arbitrary strings.
- Base your analysis on what you can actually see in the drawing
- Use external dimensions for perimeters
- Make sure to identify all wall sections (external and internal)
- External works should be in the concreteStructures section
- Use reasonable architectural standards for missing information
- Return wall structure even if some dimensions are estimated
- Prefer custom sizes when specific dimensions are visible
- Pay special attention to dimension lines and labels
- Estimate reasonably the equipment that would be used and days to be used
- Use the provided equipment types and ids, if your findings dont exist on the provided list, add them on your own
- Convert all measurements to meters (mm ÷ 1000)
- Use the specific types provided
- Use the variables provided as is: eg led-downlight, water-closet, etc. should stay as they are in the output, do not change the spelling or characters
- Be precise with wall dimension extraction
- Calculate perimeters by summing all wall lengths
- For internal walls, measure partition lengths
- Do not leave any null items. If empty use reasonable estimates based on the plan and what would be expected
"""

    result = call_gemini(file_path, GEMINI_PROMPT)
    
    if not isinstance(result, dict):
        raise RuntimeError("Gemini returned invalid response format")
    
    if "error" in result:
        return result
    
    if "wallDimensions" not in result or "wallProperties" not in result:
        raise RuntimeError("Gemini response missing 'wallDimensions' or 'wallProperties' fields")
    
    if not result.get("wallDimensions"):
        return {"error": "No wall dimensions found in analysis"}
    
    return result

def parse_file(file_path: str) -> Dict[str, Any]:
    """Parse file using Gemini only - no fallbacks"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Validate file type
    ext = os.path.splitext(file_path)[1].lower()
    supported_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
    
    if ext not in supported_extensions:
        raise ValueError(f"Unsupported file type: {ext}. Supported types: {', '.join(supported_extensions)}")
    
    print(f"🔍 Beginning Gemini analysis: {file_path}", file=sys.stderr)
    
    try:
        result = analyze_with_gemini(file_path)
        result["analysis_method"] = "gemini_ai"
        return result
    except Exception as e:
        # Re-raise with clear error message
        raise RuntimeError(f"Gemini analysis failed: {str(e)}")

# CLI Entrypoint
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python parser.py <file_path>"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        result = parse_file(file_path)
        print(json.dumps(result, indent=2))
        sys.exit(0)
    except Exception as e:
        error_result = {"error": str(e)}
        print(json.dumps(error_result, indent=2))
        print(f"❌ ERROR: {e}", file=sys.stderr)
        sys.exit(1)