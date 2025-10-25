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
        model_name = "gemini-2.5-flash"
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
(Keep output EXACTLY as JSON matching the requested schema. If no rooms detected, respond with {"error":"No rooms found"}.)

Analyze this construction document and extract ALL available information about:

### 🏠 ROOM IDENTIFICATION:
- Identify ALL rooms/spaces (living rooms, bedrooms, kitchens, bathrooms, etc.)
- Look for room labels, dimensions, and layout information
- Note any specific room names or numbers
- Pay special attention to room boundaries and labels within floor plans
- Identify if rooms are marked as "Master Bedroom", "Bedroom 1", "Bedroom 2", etc.
- Identify en-suite bathrooms vs shared bathrooms

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

**Roofing:**
- Roof types: "pitched", "flat", "gable", "hip", "mansard", "butterfly", "skillion"
- Roof materials: "concrete-tiles", "clay-tiles", "metal-sheets", "box-profile", "thatch", "slate", "asphalt-shingles", "green-roof", "membrane"
- Timber sizes: "50x25", "50x50", "75x50", "100x50", "100x75", "150x50", "200x50"
- Underlayment: "felt-30", "felt-40", "synthetic", "rubberized", "breathable"
- Insulation: "glass-wool", "rock-wool", "eps", "xps", "polyurethane", "reflective-foil"
- Accessories: Use exact types (e.g., gutterType: "PVC", "Galvanized Steel", etc.)

**Finishes:**
- Categories: "flooring", "ceiling", "wall-finishes", "painting", "glazing", "joinery"
- Only use these specified categories: skip glass, blocks etc that are not in this list
- Materials must match common options per category (e.g., flooring: "Ceramic Tiles", "Hardwood", etc.)

**Concrete & Structure:**
- Element types: "slab", "beam", "column", "foundation", "strip-footing", "raft-foundation", etc.
- Categories: "substructure", "superstructure"
- Rebar sizes follow standard notation (e.g., "Y10", "Y12")

### 📐 DIMENSION EXTRACTION:
- Extract room dimensions (length × width) in meters
- Look for dimension lines, labels, or text annotations
- Convert all measurements to meters (mm values should be divided by 1000)
- Pay attention to dimension lines that connect to room boundaries
- Look for both internal and external dimensions
- Identify grid lines or dimension strings that show room measurements

### 🚪 DOOR & WINDOW SPECIFICATIONS:
- Identify door types, sizes, and locations
- Identify window types, sizes, and locations
- Look for door/window schedules or labels (like DOO-001, WD-012, etc.)
- Note door swings and window opening directions if visible
- Count the number of doors and windows in each room

### 🏗️ CONSTRUCTION DETAILS:
- Note wall thicknesses if specified
- Identify floor levels (single story, multi-story)
- Look for any construction notes or specifications
- Note any special features like fireplaces, built-in cabinets, etc.
- If a room cannot be plasters for whatever reason, mark as "None"

### 🏗️ FOUNDATION AND CONSTRUCTION DETAILS (NEW FOCUS): 
# - Determine the **TOTAL EXTERNAL PERIMETER** of the building footprint in meters. 
# - Identify the specified **FOUNDATION TYPE** (e.g., Strip Footing, Raft). 
# - Identify the material used for the foundation wall/plinth level, specifically the **MASONRY TYPE** (e.g., Block Wall, Rubble Stone). 
# - Extract the **MASONRY WALL THICKNESS** (e.g., 0.200m). 
# - Extract the approximate **MASONRY WALL HEIGHT** from the top of the footing to the slab level (e.g., 1.0m).

### 📤 OUTPUT REQUIREMENTS:
Return ONLY valid JSON with this structure. Use reasonable estimates if exact dimensions aren't visible.

{
  "rooms": [
    {
      "roomType": "Room Type",
      "room_name": "Room Name", 
      "length": "dimension_in_meters",
      "width": "dimension_in_meters",
      "height": "2.7",
      "thickness": "0.2",
      "blockType": "Standard Block",
      "plaster": "Both Sides",
      "customBlock": {"length": "", "height": "", "thickness": "", "price": ""},
      "doors": [{
        "sizeType": "standard/custom",
        "standardSize": "0.9 × 2.1 m",
        "custom": {"height": "2.1", "width": "0.9", "price": ""},
        "type": "Panel",
        "frame: {
            type: "Wood",
            sizeType: "standard", // "standard" | "custom"
            standardSize: 0.9 x 2.1 m;
            custom: {
                "height": "1.2", "width": "1.2", "price": ""
            };
        }",
        "count": 1
      }],
      "windows": [{
        "sizeType": "standard/custom", 
        "standardSize": "1.2 × 1.2 m",
        "custom": {"height": "1.2", "width": "1.2", "price": ""},
        "glass": "Clear",
        "frame: {
            type: "Steel",
            sizeType: "standard", // "standard" | "custom"
            standardSize: 1.2 x 1.2 m;
            custom: {
                "height": "1.2", "width": "1.2", "price": ""
            };
        }",
        "count": 1
      }]
    }
  ],
  "floors": 1
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
    "description": string
  
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
      "id": "uuid-001",
      "name": "Ground Floor Slab",
      "element": "slab",
      "length": "12.5",
      "width": "10.0",
      "height": "0.15",
      "mix": "C25",
      "category": "superstructure",
      "number": "1",
      "foundationType": "raft-foundation",
      "reinforcement": {
        "mainBarSize": "Y12",
        "mainBarSpacing": "200",
        "distributionBarSize": "Y10",
        "distributionBarSpacing": "200"
      }
    },
    {
      "id": "uuid-002",
      "name": "Strip Footing",
      "element": "strip-footing",
      "length": "20.0",
      "width": "0.6",
      "height": "0.3",
      "mix": "C20",
      "category": "substructure",
      "number": "2",
      "foundationType": "strip",
      "reinforcement": {
        "mainBarSize": "Y16",
        "mainBarSpacing": "150",
        "distributionBarSize": "Y12",
        "distributionBarSpacing": "200"
      }
    },
    {
      "id": "uuid-003",
      "name": "Septic Tank Base",
      "element": "septic-tank",
      "length": "3.0",
      "width": "2.0",
      "height": "0.25",
      "mix": "C25",
      "category": "substructure",
      "number": "3",
      "foundationType": "raft-foundation",
      "reinforcement": {
        "mainBarSize": "Y10",
        "mainBarSpacing": "150",
        "distributionBarSize": "Y10",
        "distributionBarSpacing": "150"
      }
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
    }
  ],
  "masonry": [
    {
      "id": string,
      "type": "block" | "brick",
      "blockType": string,
      "length": string,
      "height": string,
      "thickness": string,
      "area": string
    }
  ],
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
        "insulation"?: { "type": InsulationType, "thickness": number }
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
   - Room height → 2.7 m
   - Roof wastage → 5%
   - Electrical voltage → 230V
   - Fixture quality → "standard"
   - Timber grade/treatment → "structural" / "pressure-treated" for structural elements
3. **Map extracted names to closest enum** (e.g., "toilet" → "water-closet", "LED light" → "led-downlight")
4. **If a section has no data, return empty array** (`[]`) or omit optional objects.
5. **All numeric measurements in meters or as specified** (e.g., diameter in mm, area in m²).
6. **Be consistent with your type system** — no arbitrary strings.
- Base your analysis on what you can actually see in the drawing
- External works should be in the concreteStructures section
- Use reasonable architectural standards for missing information
- Return at least one room if any building elements are visible
- Prefer custom sizes when specific dimensions are visible
- For bedrooms, distinguish between "Master Bedroom" and regular "Bedroom"
- For bathrooms, identify if they are "En-suite" or shared
- Pay special attention to dimension lines and labels
- Convert all measurements to meters (mm ÷ 1000)
- Use the specific types provided
- Use the variables provided as is: eg led-downlight, water-closet, etc. should stay as they are in the output, do not chnage the speling or characters
- Be precise with room identification and dimensions
"""

    result = call_gemini(file_path, GEMINI_PROMPT)
    
    # Validate the result structure
    if not isinstance(result, dict):
        raise RuntimeError("Gemini returned invalid response format")
    
    if "error" in result:
        return result
    
    if "rooms" not in result:
        raise RuntimeError("Gemini response missing 'rooms' field")
    
    if not result["rooms"]:
        return {"error": "No rooms found in analysis"}
    
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