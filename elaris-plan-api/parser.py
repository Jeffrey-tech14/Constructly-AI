#!/usr/bin/env python3
# parser.py

import sys
import json
import cv2
import numpy as np
import pytesseract
import fitz
from PIL import Image
import io
import re
from typing import List, Dict, Any, Optional, Tuple
import os
import base64
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# -----------------------------
# CONFIGURATION
# -----------------------------
DPI = 300
MIN_ROOM_AREA = 1000
MAX_PAGES = 4
DEFAULT_HEIGHT = "2.7"
DEFAULT_DOOR_HEIGHT = "2.1"
DEFAULT_THICKNESS = "0.2"
DEFAULT_BLOCK_TYPE = "Standard Block"
DEFAULT_PLASTER = "Both Sides"

# -----------------------------
# UTILITY FUNCTIONS
# -----------------------------

def normalize_whitespace(text: str) -> str:
    return re.sub(r'\s+', ' ', text.strip())

def parse_dimension_token(token: str) -> Optional[float]:
    token = normalize_whitespace(token).replace(',', '.')
    match = re.match(r"([\d.]+)\s*(mm|cm|m|ft|in|['\"])?", token, re.I)
    if match:
        val = float(match.group(1))
        unit = match.group(2) or "m"
        if 'mm' in unit:
            return val / 1000
        if 'cm' in unit:
            return val / 100
        if 'ft' in unit or "'" in unit:
            return val * 0.3048
        if 'in' in unit or '"' in unit:
            return val * 0.0254
        return val
    return None

def extract_dimensions_from_context(texts: List[str]) -> Optional[Tuple[float, float]]:
    numbers = []
    for text in texts:
        cleaned = re.sub(r'[^\d.,]', '', text)
        if not cleaned:
            continue
        cleaned = cleaned.replace(',', '.')
        try:
            val = float(cleaned)
            if 0.5 <= val <= 30.0:
                numbers.append(val)
        except:
            continue
    if len(numbers) >= 2:
        numbers.sort(reverse=True)
        return (round(numbers[0], 3), round(numbers[1], 3))
    elif len(numbers) == 1:
        return (round(numbers[0], 3), round(numbers[0], 3))
    return None

def extract_floor_count(text: str) -> int:
    text = text.lower()
    if 'first floor' in text or 'second floor' in text or 'floor 2' in text:
        return 2
    if 'ground floor' in text and 'first floor' in text:
        return 2
    return 1

def find_room_type(line: str) -> Optional[str]:
    line = line.lower()
    mapping = {
        'living rm': 'Living Room', 'dinning': 'Dining', 'kitchen': 'Kitchen',
        'bedroom 1': 'Bedroom 1', 'bedroom 2': 'Bedroom 2', 'wc& shower': 'Toilet',
        'wc & shower': 'Toilet', 'toilet': 'Toilet', 'lounge': 'Lounge',
        'bedroom': 'Bedroom', 'dining': 'Dining', 'bedrm': 'Bedroom',
        'living': 'Living Room', 'bathroom': 'Bathroom', 'shower': 'Shower',
        'store': 'Store', 'garage': 'Garage', 'verandah': 'Verandah',
        'porch': 'Porch', 'hall': 'Hall', 'corridor': 'Corridor'
    }
    for key in mapping:
        if key in line:
            return mapping[key]
    return None

# -----------------------------
# IMAGE PROCESSING
# -----------------------------

def preprocess_image(img: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return binary

def extract_text_with_boxes(img: np.ndarray) -> List[Dict[str, Any]]:
    preprocessed = preprocess_image(img)
    custom_config = '--oem 3 --psm 6'
    data = pytesseract.image_to_data(preprocessed, config=custom_config, output_type=pytesseract.Output.DICT)
    texts = []
    for i in range(len(data['text'])):
        word = data['text'][i].strip()
        conf = int(data['conf'][i])
        if word and conf > 30:
            x, y, w, h = data['left'][i], data['top'][i], data['width'][i], data['height'][i]
            texts.append({
                'text': word,
                'box': [x, y, x+w, y+h],
                'conf': conf
            })
    return texts

# -----------------------------
# DOOR DETECTION
# -----------------------------

def detect_doors(img: np.ndarray) -> List[Dict]:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=50, minLineLength=30, maxLineGap=10)

    doors = []
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            length = np.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
            if 80 < length < 200:  # Door swing line
                doors.append({
                    'box': [min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2)],
                    'length': length
                })
    return doors

# -----------------------------
# SECTION VIEW HEIGHT PARSING
# -----------------------------

def extract_height_from_section(texts: List[str]) -> str:
    for text in texts:
        if 'S-' in text or 'section' in text.lower():
            matches = re.findall(r'(\d+\.\d{3})\s*(?:m)?\s*(?:high|height|room)', ' '.join(texts), re.I)
            if matches:
                return matches[0]
    return DEFAULT_HEIGHT

# -----------------------------
# GEMINI INTEGRATION (ENHANCED)
# -----------------------------

def call_gemini(image_path: str, prompt: str) -> Dict[str, Any]:
    try:
        import google.generativeai as genai
        import os

        # Get API key - try both environment variables
        API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not API_KEY:
            print("⚠️ GEMINI_API_KEY or GOOGLE_API_KEY not set", file=sys.stderr)
            return {}

        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Check if file exists
        if not os.path.exists(image_path):
            print(f"⚠️ Image file not found: {image_path}", file=sys.stderr)
            return {}

        # Upload file with timeout
        uploaded_file = genai.upload_file(image_path)
        
        # Generate content with timeout
        response = model.generate_content([prompt, uploaded_file])
        
        if response.text:
            # Clean the response
            cleaned_text = response.text.strip()
            # Remove markdown code blocks if present
            cleaned_text = cleaned_text.replace('```json', '').replace('```', '').strip()
            
            try:
                return json.loads(cleaned_text)
            except json.JSONDecodeError:
                print(f"⚠️ Failed to parse Gemini response as JSON: {cleaned_text}", file=sys.stderr)
                # Try to extract JSON from malformed response
                json_match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
                if json_match:
                    try:
                        return json.loads(json_match.group())
                    except:
                        pass
                return {}
                
    except Exception as e:
        print(f"Gemini error: {e}", file=sys.stderr)
    return {}

# -----------------------------
# MAIN PARSING LOGIC
# -----------------------------

def pdf_to_images(pdf_path: str) -> List[np.ndarray]:
    doc = fitz.open(pdf_path)
    images = []
    for i in range(min(len(doc), MAX_PAGES)):
        page = doc[i]
        mat = fitz.Matrix(DPI / 72, DPI / 72)
        pix = page.get_pixmap(matrix=mat)
        img_data = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_data))
        images.append(cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR))
    doc.close()
    return images

def parse_file(file_path: str) -> Dict[str, Any]:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.pdf':
        images = pdf_to_images(file_path)
    elif ext in ['.jpg', '.jpeg', '.png']:
        img = cv2.imread(file_path)
        if img is None:
            raise FileNotFoundError(f"Cannot load image: {file_path}")
        images = [img]
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    all_rooms = []
    all_texts = []
    section_height = DEFAULT_HEIGHT
    total_doors = 0

    for idx, img in enumerate(images):
        texts = extract_text_with_boxes(img)
        page_texts = [t['text'] for t in texts]
        all_texts.extend(page_texts)

        doors = detect_doors(img)
        total_doors += len(doors)

        page_text = " ".join(page_texts).lower()
        if 'section' in page_text or 'elevation' in page_text or 'S-' in page_text:
            h = extract_height_from_section(page_texts)
            if h != DEFAULT_HEIGHT:
                section_height = h

    floors = extract_floor_count(" ".join(all_texts))

    # Build initial rooms
    for text in all_texts:
        room_name = find_room_type(text)
        if room_name:
            dims = extract_dimensions_from_context(all_texts)
            all_rooms.append({
                "roomType": room_name,
                "room_name": room_name,
                "length": str(dims[0]) if dims else "0",
                "width": str(dims[1]) if dims else "0",
                "height": section_height,
                "thickness": DEFAULT_THICKNESS,
                "blockType": DEFAULT_BLOCK_TYPE,
                "plaster": DEFAULT_PLASTER,
                "customBlock": {"length": "", "height": "", "thickness": "", "price": ""},
                "doors": [{"sizeType": "standard", "standardSize": "0.9 × 2.1 m", "custom": {"height": "", "width": ""}, "type": "Panel", "frame": "Wood", "count": 1}] * total_doors,
                "windows": []
            })

    result = {
        "rooms": all_rooms if all_rooms else [{
            "roomType": "Room",
            "room_name": "Room",
            "length": "0",
            "width": "0",
            "height": section_height,
            "thickness": DEFAULT_THICKNESS,
            "blockType": DEFAULT_BLOCK_TYPE,
            "plaster": DEFAULT_PLASTER,
            "customBlock": {"length": "", "height": "", "thickness": "", "price": ""},
            "doors": [],
            "windows": []
        }],
        "floors": floors
    }

    # ✅ Enhanced Gemini integration
    try:
        temp_img = "temp_preview.png"
        if images:
            cv2.imwrite(temp_img, images[0])

        if os.path.exists(temp_img):
            VISION_PROMPT = """
            You are an expert architectural AI analyzing a construction document. This appears to be a BLOCK TYPOLOGY B document with general construction information.

            ### 📌 DOCUMENT ANALYSIS INSTRUCTIONS
            - This is a BLOCK TYPOLOGY B document
            - Focus on extracting actual room dimensions, door/window specifications, and construction details
            - Look for any numerical values that could represent dimensions (in meters)
            - Identify room types from labels like "LIVING", "BEDROOM", "KITCHEN", "TOILET", etc.
            - Extract construction specifications from the content

            ### 🧱 CRITICAL INFORMATION TO EXTRACT
            1. **Room Dimensions**: Look for patterns like "3.5 × 4.2" or "3500 × 4200 mm"
            2. **Room Types**: Identify living areas, bedrooms, kitchens, bathrooms
            3. **Construction Details**: Wall thickness, block types, plastering
            4. **Door/Window Specifications**: Sizes, types, quantities
            5. **Floor Information**: Check for ground floor/first floor mentions

            ### 🏗️ DEFAULT VALUES (use when not specified)
            - Room height: "2.7" meters
            - Wall thickness: "0.2" meters  
            - Block type: "Standard Block"
            - Plaster: "Both Sides"
            - Door size: "0.9 × 2.1 m" standard
            - Window size: "1.2 × 1.2 m" standard

            ### 📤 RETURN FORMAT
            Return only JSON with this structure. If no specific room data found, return at least one generic room:

            {
              "rooms": [
                {
                  "roomType": "Generic Room",
                  "room_name": "Generic Room",
                  "length": "4.0",
                  "width": "3.0", 
                  "height": "2.7",
                  "thickness": "0.2",
                  "blockType": "Standard Block",
                  "plaster": "Both Sides",
                  "customBlock": {
                    "length": "",
                    "height": "", 
                    "thickness": "",
                    "price": ""
                  },
                  "doors": [
                    {
                      "sizeType": "standard",
                      "standardSize": "0.9 × 2.1 m",
                      "custom": { "height": "", "width": "", "price": "" },
                      "type": "Panel",
                      "frame": {
                        "price": 3000,
                        "width": "",
                        "height": "",
                        "sizeType": "standard", 
                        "standardSize": ""
                      },
                      "count": 1
                    }
                  ],
                  "windows": [
                    {
                      "sizeType": "standard", 
                      "standardSize": "1.2 × 1.2 m",
                      "custom": { "height": "", "width": "", "price": "" },
                      "glass": "Clear",
                      "frame": {
                        "price": 3000,
                        "width": "",
                        "height": "",
                        "sizeType": "standard",
                        "standardSize": ""
                      },
                      "count": 1
                    }
                  ]
                }
              ],
              "floors": 1
            }
            """
            gemini_result = call_gemini(temp_img, VISION_PROMPT)
            if gemini_result and gemini_result.get('rooms'):
                result = gemini_result
                print("✅ Gemini correction applied", file=sys.stderr)
            os.remove(temp_img)
    except Exception as e:
        print(f"Gemini fallback failed: {e}", file=sys.stderr)

    # Final fallback if no valid rooms
    if not result.get('rooms') or len(result['rooms']) == 0:
        print("⚠️ No rooms found, using default fallback", file=sys.stderr)
        result = {
            "rooms": [{
                "roomType": "Generic Block B Room",
                "room_name": "Generic Block B Room",
                "length": "5.0",
                "width": "4.0",
                "height": DEFAULT_HEIGHT,
                "thickness": DEFAULT_THICKNESS,
                "blockType": DEFAULT_BLOCK_TYPE,
                "plaster": DEFAULT_PLASTER,
                "customBlock": {"length": "", "height": "", "thickness": "", "price": ""},
                "doors": [{
                    "sizeType": "standard",
                    "standardSize": "0.9 × 2.1 m",
                    "custom": {"height": "", "width": "", "price": ""},
                    "type": "Panel",
                    "frame": {
                        "price": 3000,
                        "width": "",
                        "height": "",
                        "sizeType": "standard",
                        "standardSize": ""
                    },
                    "count": 1
                }],
                "windows": [{
                    "sizeType": "standard",
                    "standardSize": "1.2 × 1.2 m",
                    "custom": {"height": "", "width": "", "price": ""},
                    "glass": "Clear",
                    "frame": {
                        "price": 3000,
                        "width": "",
                        "height": "",
                        "sizeType": "standard",
                        "standardSize": ""
                    },
                    "count": 1
                }]
            }],
            "floors": 1
        }

    print(f"✅ Final result: {len(result['rooms'])} rooms, {result['floors']} floors", file=sys.stderr)
    return result

# -----------------------------
# CLI ENTRYPOINT
# -----------------------------

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python parser.py <file_path>"}))
        sys.exit(1)

    file_path = sys.argv[1]
    try:
        result = parse_file(file_path)
        print(json.dumps(result, indent=2))
    except Exception as e:
        import traceback
        error_result = {
            "error": str(e),
            "rooms": [{
                "roomType": "Fallback Room",
                "room_name": "Fallback Room",
                "length": "4.0",
                "width": "3.0",
                "height": DEFAULT_HEIGHT,
                "thickness": DEFAULT_THICKNESS,
                "blockType": DEFAULT_BLOCK_TYPE,
                "plaster": DEFAULT_PLASTER,
                "customBlock": {"length": "", "height": "", "thickness": "", "price": ""},
                "doors": [{
                    "sizeType": "standard",
                    "standardSize": "0.9 × 2.1 m",
                    "custom": {"height": "", "width": "", "price": ""},
                    "type": "Panel",
                    "frame": {
                        "price": 3000,
                        "width": "",
                        "height": "",
                        "sizeType": "standard",
                        "standardSize": ""
                    },
                    "count": 1
                }],
                "windows": [{
                    "sizeType": "standard",
                    "standardSize": "1.2 × 1.2 m",
                    "custom": {"height": "", "width": "", "price": ""},
                    "glass": "Clear",
                    "frame": {
                        "price": 3000,
                        "width": "",
                        "height": "",
                        "sizeType": "standard",
                        "standardSize": ""
                    },
                    "count": 1
                }]
            }],
            "floors": 1
        }
        print(json.dumps(error_result, indent=2))
        print(f"ERROR: {str(e)}", file=sys.stderr)
        print(f"TRACEBACK: {traceback.format_exc()}", file=sys.stderr)
        sys.exit(1)