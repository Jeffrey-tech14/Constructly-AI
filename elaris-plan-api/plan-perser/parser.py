# parser.py - PDF-FIRST APPROACH with enhanced local extraction
import sys
import json
import os
import re
import base64
import time
import io
from typing import List, Dict, Any, Optional, Tuple
from dotenv import load_dotenv
from typing import Any
from PIL import Image, ImageOps
import numpy as np
import cv2
# Load environment
load_dotenv()

# -----------------------------
# CONFIGURATION / PLACEHOLDERS
# -----------------------------
DPI = 300
MAX_PAGES = 6
DEFAULT_HEIGHT = "2.7"
DEFAULT_THICKNESS = "0.2"
DEFAULT_BLOCK_TYPE = "Standard Block"
DEFAULT_PLASTER = "Both Sides"

# Gemini key uses GOOGLE_API_KEY or GEMINI_API_KEY env var
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
GEMINI_ENABLED = bool(GEMINI_API_KEY)

# -----------------------------
# OPTIONAL DEPENDENCIES (soft)
# -----------------------------
_missing = []
try:
    import cv2
    import numpy as np
except Exception:
    cv2 = None
    np = None
    _missing.append('opencv-python (cv2), numpy')

try:
    import pytesseract
except Exception:
    pytesseract = None
    _missing.append('pytesseract')

try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None
    _missing.append('PyMuPDF (fitz)')

try:
    from PIL import Image, ImageOps
except Exception:
    Image = None
    _missing.append('Pillow (PIL)')

if _missing:
    print(f"⚠️ Optional dependencies missing: {', '.join(_missing)}. Some parsers will be disabled.", file=sys.stderr)

# -----------------------------
# ENHANCED UTILITIES
# -----------------------------
def normalize_whitespace(text: str) -> str:
    return re.sub(r'\s+', ' ', text.strip())

def parse_dimension_value(value: str) -> Optional[float]:
    """Enhanced dimension parsing with unit detection"""
    if not value:
        return None
    
    # Clean the value
    value = value.replace(',', '.').replace(' ', '').strip().lower()
    
    # Remove common units and symbols
    value = re.sub(r'[mм\']$', '', value)  # meters, millimeters, feet symbol
    value = re.sub(r'mm$', '', value)      # explicit millimeters
    value = re.sub(r'cm$', '', value)      # centimeters
    value = re.sub(r'm$', '', value)       # meters
    value = re.sub(r'["″]$', '', value)    # inches
    
    if not value.replace('.', '').isdigit():
        return None
        
    num_value = float(value)
    
    # Auto-detect unit based on value range
    if num_value > 1000:  # Likely millimeters
        return round(num_value / 1000, 3)
    elif num_value > 10:  # Likely centimeters
        return round(num_value / 100, 3)
    elif num_value > 3:   # Likely feet
        return round(num_value * 0.3048, 3)  # Convert feet to meters
    else:
        return round(num_value, 3)

def extract_dimensions_from_text(text: str) -> Tuple[Optional[float], Optional[float]]:
    """Enhanced dimension extraction with multiple patterns"""
    patterns = [
        # Standard dimension patterns: 4.5×3.2, 4.5 x 3.2, 4500×3200
        r'(\d+[.,]?\d*)\s*[×xX*]\s*(\d+[.,]?\d*)',
        r'(\d+[.,]?\d*)\s*by\s*(\d+[.,]?\d*)',
        
        # Labeled dimensions: L=4.5 W=3.2, Length: 4.5 Width: 3.2
        r'[Ll](?:ength)?\s*[=:]\s*(\d+[.,]?\d*).*?[Ww](?:idth)?\s*[=:]\s*(\d+[.,]?\d*)',
        r'[Ww](?:idth)?\s*[=:]\s*(\d+[.,]?\d*).*?[Ll](?:ength)?\s*[=:]\s*(\d+[.,]?\d*)',
        
        # Dimension lines: ─4.5─, -4.5-, |4.5|
        r'[─\-|]\s*(\d+[.,]?\d*)\s*[─\-|]',
        
        # Room size notations: 4.5m x 3.2m, 4500x3200mm
        r'(\d+[.,]?\d*)\s*[mм]?\s*[×xX*]\s*(\d+[.,]?\d*)\s*[mм]?',
        
        # Parenthetical dimensions: (4.5×3.2), [4.5×3.2]
        r'[\(\[]\s*(\d+[.,]?\d*)\s*[×xX*]\s*(\d+[.,]?\d*)\s*[\)\]]',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            for match in matches:
                if len(match) == 2:
                    length = parse_dimension_value(match[0])
                    width = parse_dimension_value(match[1])
                    if length and width and 1.0 <= length <= 25.0 and 1.0 <= width <= 25.0:
                        return length, width
    
    # Fallback: look for number pairs that could be dimensions
    numbers = re.findall(r'\d+[.,]?\d*', text)
    if len(numbers) >= 2:
        potential_dims = []
        for num in numbers:
            dim = parse_dimension_value(num)
            if dim and 1.0 <= dim <= 15.0:  # Reasonable room dimension range
                potential_dims.append(dim)
        
        if len(potential_dims) >= 2:
            # Sort by size, assume larger is length
            potential_dims.sort(reverse=True)
            # Use the two largest reasonable numbers
            return potential_dims[0], potential_dims[1]
    
    return None, None

def identify_room_type(text: str) -> Optional[str]:
    """Enhanced room type identification with context"""
    text_lower = text.lower()
    
    # Remove common dimension patterns to avoid false positives
    text_clean = re.sub(r'\d+[.,]?\d*\s*[×xX*]\s*\d+[.,]?\d*', '', text_lower)
    text_clean = re.sub(r'\d+[.,]?\d*\s*[mм]', '', text_clean)
    
    room_patterns = {
        'Living Room': ['living', 'lounge', 'sitting', 'family room', 'livingroom', 'l.r.', 'lr'],
        'Kitchen': ['kitchen', 'cooking', 'pantry', 'kit', 'kitch'],
        'Bedroom': ['bedroom', 'bed room', 'bedrm', 'm.bed', 'm.bedroom', 'bed', 'br'],
        'Master Bedroom': ['master bedroom', 'master bed', 'mbr', 'main bedroom', 'principal bedroom'],
        'Bathroom': ['bathroom', 'bath', 'washroom', 'toilet', 'wc', 'shower', 'restroom', 'bth'],
        'Dining Room': ['dining', 'dinner', 'dining room', 'dr'],
        'Office': ['office', 'study', 'workroom', 'study room', 'off'],
        'Store': ['store', 'storage', 'storeroom', 'utility', 'stor'],
        'Garage': ['garage', 'carport', 'gar'],
        'Verandah': ['verandah', 'veranda', 'porch', 'balcony', 'patio', 'deck'],
        'Hall': ['hall', 'corridor', 'passage', 'hallway', 'entry', 'entrance'],
        'Laundry': ['laundry', 'washing', 'laundry room'],
        'Toilet': ['toilet', 'wc', 'water closet'],
        'Wardrobe': ['wardrobe', 'closet', 'dressing room'],
    }
    
    for room_type, patterns in room_patterns.items():
        for pattern in patterns:
            if pattern in text_clean and len(text_clean) > 2:
                # Additional validation: ensure it's not part of a larger word
                pattern_re = r'\b' + re.escape(pattern) + r'\b'
                if re.search(pattern_re, text_clean):
                    return room_type
    
    return None

def extract_floor_info(texts: List[str]) -> int:
    """Enhanced floor detection"""
    full_text = " ".join(texts).lower()
    
    floor_indicators = {
        2: ['first floor', '1st floor', 'ground floor', 'level 1', 'floor 1'],
        3: ['second floor', '2nd floor', 'level 2', 'floor 2'],
        4: ['third floor', '3rd floor', 'level 3', 'floor 3'],
        5: ['fourth floor', '4th floor', 'level 4', 'floor 4']
    }
    
    multi_story_terms = ['two story', 'two-storey', 'double story', 'multi-level', 'two level']
    
    # Check for multi-story indicators first
    if any(term in full_text for term in multi_story_terms):
        return 2
    
    # Check for specific floor mentions
    max_floor = 1
    for floor_num, indicators in floor_indicators.items():
        if any(indicator in full_text for indicator in indicators):
            max_floor = max(max_floor, floor_num)
    
    return max_floor

def extract_doors_windows(texts: List[str]) -> Tuple[List[Dict], List[Dict]]:
    """Enhanced door and window extraction"""
    doors = []
    windows = []
    
    door_patterns = [
        (r'DOO\s*[-\s]?\s*(\d+)\s*(\d+)\s*by\s*(\d+)', 'custom'),
        (r'DOOR\s*[#]?(\d+)\s*[×xX*]\s*(\d+)', 'custom'),
        (r'(\d+)\s*×\s*(\d+)\s*DOOR', 'custom'),
        (r'DOOR.*?(\d+)\s*[×xX*]\s*(\d+)', 'custom'),
        (r'D\s*[-\s]?\s*(\d+)\s*(\d+)\s*by\s*(\d+)', 'custom'),
        (r'(\d+)\s*[-]?\s*(\d+)\s*D\s*[O]?', 'custom'),  # 09D, 09-D
    ]
    
    window_patterns = [
        (r'WD\s*[-\s]?\s*(\d+)\s*(\d+)\s*by\s*(\d+)', 'custom'),
        (r'WINDOW\s*[#]?(\d+)\s*[×xX*]\s*(\d+)', 'custom'),
        (r'(\d+)\s*×\s*(\d+)\s*WINDOW', 'custom'),
        (r'WINDOW.*?(\d+)\s*[×xX*]\s*(\d+)', 'custom'),
        (r'W\s*[-\s]?\s*(\d+)\s*(\d+)\s*by\s*(\d+)', 'custom'),
        (r'(\d+)\s*[-]?\s*(\d+)\s*W\s*[D]?', 'custom'),  # 12W, 12-WD
    ]
    
    for text in texts:
        text_upper = text.upper()
        
        # Door extraction
        for pattern, size_type in door_patterns:
            matches = re.findall(pattern, text_upper)
            for match in matches:
                nums = [m for m in match if m.isdigit()]
                if len(nums) >= 2:
                    width = float(nums[-2]) / 1000  # Assume mm, convert to meters
                    height = float(nums[-1]) / 1000
                    
                    if 0.5 <= width <= 2.5 and 1.5 <= height <= 3.0:
                        doors.append({
                            "sizeType": size_type,
                            "standardSize": f"{width} × {height} m",
                            "custom": {"height": str(height), "width": str(width), "price": ""},
                            "type": "Panel",
                            "frame": "Wood",
                            "count": 1
                        })
        
        # Window extraction
        for pattern, size_type in window_patterns:
            matches = re.findall(pattern, text_upper)
            for match in matches:
                nums = [m for m in match if m.isdigit()]
                if len(nums) >= 2:
                    width = float(nums[-2]) / 1000
                    height = float(nums[-1]) / 1000
                    
                    if 0.3 <= width <= 3.0 and 0.3 <= height <= 3.0:
                        windows.append({
                            "sizeType": size_type,
                            "standardSize": f"{width} × {height} m",
                            "custom": {"height": str(height), "width": str(width), "price": ""},
                            "glass": "Clear",
                            "frame": "Aluminum",
                            "count": 1
                        })
    
    return doors, windows

def create_room_record(roomType: str, length: float, width: float, doors=None, windows=None) -> Dict[str, Any]:
    doors = doors or []
    windows = windows or []
    return {
        "roomType": roomType,
        "room_name": roomType,
        "length": str(round(length, 2)),
        "width": str(round(width, 2)),
        "height": DEFAULT_HEIGHT,
        "thickness": DEFAULT_THICKNESS,
        "blockType": DEFAULT_BLOCK_TYPE,
        "plaster": DEFAULT_PLASTER,
        "customBlock": {"length": "", "height": "", "thickness": "", "price": ""},
        "doors": doors,
        "windows": windows
    }

# -----------------------------
# ENHANCED OCR / IMAGE PROCESSING
# -----------------------------
def deskew_image_if_needed(pil_img: Image.Image) -> Image.Image:
    """Enhanced deskewing with better orientation detection"""
    try:
        # Handle EXIF orientation
        pil_img = ImageOps.exif_transpose(pil_img)
        
        # Convert to grayscale for processing
        gray = pil_img.convert("L")
        
        # Use OpenCV for advanced deskewing if available
        if cv2 and np:
            img_array = np.array(gray)
            
            # Threshold and find contours to detect document edges
            _, thresh = cv2.threshold(img_array, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                # Find the largest contour (likely the document)
                largest_contour = max(contours, key=cv2.contourArea)
                rect = cv2.minAreaRect(largest_contour)
                angle = rect[-1]
                
                # Adjust angle for proper deskewing
                if angle < -45:
                    angle = -(90 + angle)
                else:
                    angle = -angle
                
                # Rotate if significant skew detected
                if abs(angle) > 1.0:
                    center = (img_array.shape[1] // 2, img_array.shape[0] // 2)
                    rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
                    deskewed = cv2.warpAffine(img_array, rotation_matrix, (img_array.shape[1], img_array.shape[0]), 
                                            flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                    return Image.fromarray(deskewed)
        
        return pil_img
        
    except Exception:
        return pil_img

def preprocess_for_ocr(cv_img: np.ndarray) -> np.ndarray:
    """Enhanced image preprocessing for architectural drawings"""
    if cv2 is None or np is None:
        return cv_img

    # Convert to grayscale
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY) if len(cv_img.shape) == 3 else cv_img

    # Multiple preprocessing techniques
    processed_images = []
    
    # Technique 1: CLAHE for contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    processed_images.append(enhanced)
    
    # Technique 2: Bilateral filter for noise reduction while preserving edges
    bilateral = cv2.bilateralFilter(gray, 9, 75, 75)
    processed_images.append(bilateral)
    
    # Technique 3: Morphological operations for cleaning
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    morph = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
    processed_images.append(morph)
    
    # Use the best one based on variance (edge preservation)
    best_image = max(processed_images, key=lambda img: np.var(img))
    
    return best_image

def multi_pass_tesseract_on_image(cv_img: np.ndarray) -> List[Dict[str, Any]]:
    """Enhanced multi-pass OCR with architectural drawing optimizations"""
    results = []
    if pytesseract is None:
        return results
        
    # PSM configurations optimized for architectural drawings
    configs = [
        '--oem 3 --psm 6',  # Uniform block of text
        '--oem 3 --psm 4',  # Single column of text of variable sizes
        '--oem 3 --psm 8',  # Single word
        '--oem 3 --psm 11', # Sparse text
        '--oem 3 --psm 12', # Sparse text with OSD
    ]
    
    for cfg in configs:
        try:
            data = pytesseract.image_to_data(cv_img, config=cfg, output_type=pytesseract.Output.DICT)
            for i in range(len(data['text'])):
                word = data['text'][i].strip()
                conf = int(data['conf'][i])
                
                # Enhanced filtering for architectural content
                if (word and len(word) > 1 and conf > 30 and
                    not re.match(r'^[^a-zA-Z0-9]*$', word)):  # Filter symbols-only
                    
                    x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
                    
                    # Calculate font size approximation
                    font_size = max(h, w // max(len(word), 1))
                    
                    results.append({
                        'text': word, 
                        'box': [x, y, x+w, y+h], 
                        'conf': conf,
                        'font_size': font_size
                    })
        except Exception:
            continue
    
    # Advanced de-duplication with spatial awareness
    seen = set()
    unique_results = []
    
    for result in results:
        # Create spatial signature
        spatial_key = (result['text'].lower(), 
                      result['box'][0] // 10,  # Group by approximate position
                      result['box'][1] // 10,
                      result['font_size'] // 5)  # Group by font size
        
        if spatial_key not in seen:
            unique_results.append(result)
            seen.add(spatial_key)
    
    return unique_results

def extract_text_with_boxes_from_cvimg(cv_img: np.ndarray) -> List[Dict[str, Any]]:
    """Enhanced text extraction with multiple preprocessing techniques"""
    preprocessed = preprocess_for_ocr(cv_img)
    return multi_pass_tesseract_on_image(preprocessed)

# -----------------------------
# ENHANCED PDF PROCESSING
# -----------------------------
def pdf_to_images(pdf_path: str, max_pages: int = MAX_PAGES) -> List[np.ndarray]:
    """Enhanced PDF to image conversion with quality optimization"""
    if fitz is None or Image is None or cv2 is None or np is None:
        raise RuntimeError("PDF->image conversion dependencies missing")
        
    doc = fitz.open(pdf_path)
    images = []
    
    for i in range(min(len(doc), max_pages)):
        page = doc[i]
        
        # Higher DPI for better text recognition
        mat = fitz.Matrix(DPI / 72, DPI / 72)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img_data = pix.tobytes("png")
        
        img = Image.open(io.BytesIO(img_data)).convert("RGB")
        img = deskew_image_if_needed(img)
        
        # Convert to OpenCV format
        cv_img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        images.append(cv_img)
    
    doc.close()
    return images

def extract_pdf_text(pdf_path: str) -> List[str]:
    """Enhanced PDF text extraction with layout preservation"""
    if fitz is None:
        return []
        
    doc = fitz.open(pdf_path)
    texts = []
    
    for page in doc:
        # Extract text with layout preservation
        text_blocks = page.get_text("blocks")
        
        for block in text_blocks:
            text = block[4].strip()  # Text content is at index 4
            if text and len(text) > 1:
                # Clean and split into lines
                lines = [line.strip() for line in text.split('\n') if line.strip()]
                texts.extend(lines)
    
    doc.close()
    return texts

# -----------------------------
# ENHANCED ROOM DATA EXTRACTION
# -----------------------------
def extract_room_data(texts: List[str]) -> List[Dict[str, Any]]:
    """Human-like room data extraction with spatial context awareness"""
    rooms = []
    processed_room_types = set()
    
    # Group text by approximate spatial regions (simulating human reading pattern)
    text_groups = []
    current_group = []
    
    for i, text in enumerate(texts):
        if len(current_group) < 5:  # Group nearby text
            current_group.append((i, text))
        else:
            text_groups.append(current_group)
            current_group = [(i, text)]
    
    if current_group:
        text_groups.append(current_group)
    
    for group in text_groups:
        group_texts = [text for _, text in group]
        group_indices = [idx for idx, _ in group]
        
        # Look for room labels and their associated dimensions
        for idx, text in zip(group_indices, group_texts):
            room_type = identify_room_type(text)
            
            if room_type and room_type not in processed_room_types:
                length, width = None, None
                
                # Search in context (current group + adjacent groups)
                search_range = []
                for search_group in text_groups:
                    search_range.extend([t for _, t in search_group])
                
                # Priority 1: Look for explicit dimensions near room label
                for search_text in search_range:
                    l, w = extract_dimensions_from_text(search_text)
                    if l and w:
                        length, width = l, w
                        break
                
                # Priority 2: Look for dimension patterns in the same area
                if not length or not width:
                    for j, search_text in enumerate(texts[max(0, idx-3):min(len(texts), idx+4)]):
                        l, w = extract_dimensions_from_text(search_text)
                        if l and w:
                            length, width = l, w
                            break
                
                # Priority 3: Use intelligent defaults based on room type
                if not length or not width:
                    default_sizes = {
                        'Living Room': (5.5, 4.5),
                        'Kitchen': (4.0, 3.0),
                        'Bedroom': (4.5, 3.8),
                        'Master Bedroom': (5.0, 4.2),
                        'Bathroom': (2.8, 2.2),
                        'Dining Room': (4.5, 3.5),
                        'Office': (3.8, 3.2),
                        'Store': (3.0, 2.5),
                        'Garage': (6.5, 4.5),
                        'Verandah': (4.5, 2.5),
                        'Hall': (4.0, 2.0),
                        'Laundry': (3.5, 2.5),
                        'Toilet': (2.2, 1.8),
                        'Wardrobe': (2.5, 2.0),
                    }
                    length, width = default_sizes.get(room_type, (4.0, 3.5))
                
                # Extract doors and windows for this specific room
                room_doors, room_windows = [], []
                for search_text in search_range[:10]:  # Limit search to nearby text
                    d, w = extract_doors_windows([search_text])
                    if d:
                        room_doors.extend(d)
                    if w:
                        room_windows.extend(w)
                
                # Use the first door/window found, or empty lists
                room_data = create_room_record(
                    room_type, length, width, 
                    doors=room_doors[:1] if room_doors else [],
                    windows=room_windows[:1] if room_windows else []
                )
                
                rooms.append(room_data)
                processed_room_types.add(room_type)
    
    return rooms

# -----------------------------
# GEMINI INTEGRATION (primary)
# -----------------------------
def call_gemini(file_path: str, prompt: str) -> Optional[Dict[str, Any]]:
    if not GEMINI_ENABLED:
        print("ℹ️ Gemini disabled (no API key).", file=sys.stderr)
        return None
    try:
        import google.generativeai as genai
    except Exception:
        print("⚠️ google.generativeai library not installed; Gemini unavailable.", file=sys.stderr)
        return None
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.5-flash")
        if not os.path.exists(file_path):
            print(f"⚠️ File not found for Gemini upload: {file_path}", file=sys.stderr)
            return None
        print(f"🔄 Uploading file to Gemini: {os.path.basename(file_path)}", file=sys.stderr)
        uploaded = genai.upload_file(file_path)
        response = model.generate_content([prompt, uploaded])
        try:
            genai.delete_file(uploaded.name)
        except Exception:
            pass
        if response and getattr(response, 'text', None):
            cleaned = response.text.strip().replace('```json', '').replace('```', '').strip()
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                # try to extract first {...}
                m = re.search(r'\{.*\}', cleaned, re.DOTALL)
                if m:
                    try:
                        return json.loads(m.group())
                    except Exception:
                        pass
                print("⚠️ Gemini returned non-JSON or unparsable JSON.", file=sys.stderr)
                return None
        return None
    except Exception as e:
        print(f"❌ Gemini call failed: {e}", file=sys.stderr)
        return None

def analyze_with_gemini(file_path: str) -> Optional[Dict[str, Any]]:
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
        "frame": "Wood",
        "count": 1
      }],
      "windows": [{
        "sizeType": "standard/custom", 
        "standardSize": "1.2 × 1.2 m",
        "custom": {"height": "1.2", "width": "1.2", "price": ""},
        "glass": "Clear",
        "frame": "Aluminum",
        "count": 1
      }]
    }
  ],
  "floors": 1
  "foundationDetails": { "foundationType": "Strip Footing", "totalPerimeter": 50.5, // Total length of all exterior foundation walls in meters "masonryType": "Standard Block", // e.g., "Standard Block", "Rubble Stone" "wallThickness": "0.200", // Thickness of the block/stone wall in meters "wallHeight": "1.0", // Height of the block/stone wall in meters "blockDimensions": "0.400 x 0.200 x 0.200" // L x W x H in meters (optional) } 
  }

IMPORTANT: 
- Base your analysis on what you can actually see in the drawing
- Use reasonable architectural standards for missing information
- Return at least one room if any building elements are visible
- Prefer custom sizes when specific dimensions are visible
- For bedrooms, distinguish between "Master Bedroom" and regular "Bedroom"
- For bathrooms, identify if they are "En-suite" or shared
- Pay special attention to dimension lines and labels
- Convert all measurements to meters (mm ÷ 1000)
- Be precise with room identification and dimensions
"""
    
    try:
        return call_gemini(file_path, GEMINI_PROMPT)
    except Exception as e:
        print(f"❌ analyze_with_gemini failed: {e}", file=sys.stderr)
        return None

# -----------------------------
# ENHANCED LOCAL ANALYSIS
# -----------------------------
def analyze_locally(file_path: str) -> Optional[Dict[str, Any]]:
    """Enhanced local analysis with human-like reasoning"""
    print("🔄 Running enhanced local analysis...", file=sys.stderr)
    
    ext = os.path.splitext(file_path)[1].lower()
    all_texts = []
    
    try:
        if ext == '.pdf':
            # Enhanced PDF processing: native text + OCR
            print("📄 Processing PDF with enhanced extraction...", file=sys.stderr)
            
            # 1. Extract native text (highest quality)
            pdf_texts = extract_pdf_text(file_path)
            all_texts.extend(pdf_texts)
            print(f"   Extracted {len(pdf_texts)} native text elements", file=sys.stderr)
            
            # 2. Enhanced OCR for graphical elements
            if fitz and Image and cv2:
                images = pdf_to_images(file_path)
                print(f"   Processing {len(images)} page images with enhanced OCR...", file=sys.stderr)
                
                for page_num, img in enumerate(images):
                    blocks = extract_text_with_boxes_from_cvimg(img)
                    ocr_texts = [t['text'] for t in blocks]
                    all_texts.extend(ocr_texts)
                    print(f"   Page {page_num + 1}: {len(ocr_texts)} OCR elements", file=sys.stderr)
                    
        elif ext in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
            # Enhanced image processing
            print("🖼️ Processing image with enhanced OCR...", file=sys.stderr)
            
            if cv2 is None:
                raise RuntimeError("OpenCV required for image OCR")
                
            img = cv2.imdecode(np.fromfile(file_path, dtype=np.uint8), cv2.IMREAD_COLOR) if hasattr(np, 'fromfile') else cv2.imread(file_path)
            if img is None:
                raise FileNotFoundError(f"Cannot load image: {file_path}")
            
            # Multi-orientation OCR for better coverage
            rotations = [0, 90, 180, 270]
            best_texts = []
            
            for rot in rotations:
                try:
                    if rot != 0:
                        M = cv2.getRotationMatrix2D((img.shape[1]//2, img.shape[0]//2), rot, 1.0)
                        img_rot = cv2.warpAffine(img, M, (img.shape[1], img.shape[0]))
                    else:
                        img_rot = img
                    
                    blocks = extract_text_with_boxes_from_cvimg(img_rot)
                    candidate = [t['text'] for t in blocks]
                    
                    if len(candidate) > len(best_texts):
                        best_texts = candidate
                        print(f"   Rotation {rot}°: {len(candidate)} elements", file=sys.stderr)
                        
                except Exception as e:
                    print(f"   Rotation {rot}° failed: {e}", file=sys.stderr)
                    continue
            
            all_texts.extend(best_texts)
            
        else:
            print(f"⚠️ Local analysis does not support extension {ext}", file=sys.stderr)
            return None
            
    except Exception as e:
        print(f"❌ Enhanced local analysis failed: {e}", file=sys.stderr)
        return None

    # Advanced text cleaning and organization
    print("🧹 Cleaning and organizing extracted text...", file=sys.stderr)
    
    # Clean and normalize
    cleaned_texts = [normalize_whitespace(t) for t in all_texts if t and t.strip()]
    
    # Remove duplicates while preserving order and context
    seen = set()
    unique_texts = []
    
    for text in cleaned_texts:
        # Create a signature that considers text and approximate length
        signature = (text.lower(), len(text) // 5)
        if signature not in seen:
            unique_texts.append(text)
            seen.add(signature)
    
    print(f"📊 Final text corpus: {len(unique_texts)} unique elements", file=sys.stderr)
    
    # Enhanced room extraction with context awareness
    rooms = extract_room_data(unique_texts)
    floors = extract_floor_info(unique_texts)
    
    # Global door/window extraction
    all_doors, all_windows = extract_doors_windows(unique_texts)
    
    # Assign doors/windows to rooms intelligently
    for room in rooms:
        # Assign doors/windows based on room type
        if room['roomType'] in ['Bathroom', 'Toilet']:
            room['doors'] = all_doors[:1] if all_doors else []
            room['windows'] = all_windows[:1] if all_windows else []
        elif room['roomType'] in ['Bedroom', 'Master Bedroom']:
            room['doors'] = all_doors[:1] if all_doors else []
            room['windows'] = all_windows[:1] if all_windows else []
        elif room['roomType'] in ['Living Room', 'Dining Room']:
            room['doors'] = all_doors[:2] if len(all_doors) >= 2 else all_doors[:1]
            room['windows'] = all_windows[:2] if len(all_windows) >= 2 else all_windows[:1]
        else:
            room['doors'] = all_doors[:1] if all_doors else []
            room['windows'] = all_windows[:1] if all_windows else []

    if not rooms:
        print("❌ No rooms detected in local analysis", file=sys.stderr)
        return None
        
    result = {
        "rooms": rooms, 
        "floors": floors,
        "analysis_method": "enhanced_local",
        "text_elements_processed": len(unique_texts)
    }
    
    print(f"✅ Enhanced local analysis detected {len(rooms)} rooms across {floors} floor(s)", file=sys.stderr)
    return result

# -----------------------------
# TOP-LEVEL PARSE FLOW
# -----------------------------
def parse_file(file_path: str) -> Dict[str, Any]:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
        
    print(f"🔍 Beginning analysis: {file_path}", file=sys.stderr)

    # 1) Gemini first (for PDFs and images)
    ext = os.path.splitext(file_path)[1].lower()
    if ext in ['.pdf', '.jpg', '.jpeg', '.png']:
        print("🎯 Attempting Gemini analysis...", file=sys.stderr)
        gemini_res = analyze_with_gemini(file_path)
        if gemini_res:
            if isinstance(gemini_res, dict) and gemini_res.get("error"):
                print("ℹ️ Gemini returned an error result; trying local analysis...", file=sys.stderr)
            elif isinstance(gemini_res, dict) and gemini_res.get("rooms"):
                print("✅ Using Gemini result", file=sys.stderr)
                gemini_res["analysis_method"] = "gemini_ai"
                return gemini_res

    # 2) Enhanced local analysis (fallback)
    print("🔄 Gemini unavailable or failed, using enhanced local analysis...", file=sys.stderr)
    local_res = analyze_locally(file_path)
    if local_res:
        return local_res

    # 3) Final fallback - minimal room detection
    print("⚠️ All methods failed, creating minimal room estimate...", file=sys.stderr)
    minimal_room = create_room_record("Main Room", 5.0, 4.0)
    return {
        "rooms": [minimal_room],
        "floors": 1,
        "analysis_method": "minimal_fallback",
        "note": "Automatic detection failed, using default room"
    }

# -----------------------------
# CLI ENTRYPOINT
# -----------------------------
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python parser.py <file_path>"}))
        sys.exit(1)
    file_path = sys.argv[1]
    try:
        res = parse_file(file_path)
        print(json.dumps(res, indent=2))
        if isinstance(res, dict) and res.get("error"):
            sys.exit(1)
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        print(f"❌ EXCEPTION: {type(e).__name__}: {e}", file=sys.stderr)
        sys.exit(1)