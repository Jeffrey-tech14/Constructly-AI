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
        'bedroom': 'Bedroom', 'dining': 'Dining', 'bedrm': 'Bedroom'
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
# GEMINI INTEGRATION
# -----------------------------

def call_gemini(image_path: str, prompt: str) -> Dict[str, Any]:
    try:
        import google.generativeai as genai
        import os

        # Get API key
        API_KEY = os.getenv("GEMINI_API_KEY")
        if not API_KEY:
            print("⚠️ GOOGLE_API_KEY not set", file=sys.stderr)
            return {}

        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Upload file
        uploaded_file = genai.upload_file(image_path)

        # Generate content
        response = model.generate_content([prompt, uploaded_file])
        
        if response.text:
            # Extract JSON
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
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

    # ✅ Final step: Let Gemini validate and correct
    try:
        temp_img = "temp_preview.png"
        if images:
            cv2.imwrite(temp_img, images[0])

        if os.path.exists(temp_img):
            VISION_PROMPT = """
            You are an expert architectural AI. Analyze this floor plan, elevation, or section drawing and extract **all** of the following information with maximum precision.

            ### 📌 INSTRUCTIONS
            - Read **all text**, dimensions, labels, and symbols.
            - Understand room names like "living rm", "wc& shower", "BEDROOM 1", "DINING", etc.
            - Extract dimensions in **meters** (e.g., 3.500 → "3.5", 3,580 → "3.58")
            - Detect doors and windows from symbols, lines, and labels.
            - Use section views (e.g., S-01) to extract **room and door heights**.
            - Return **only valid JSON** — no explanation.

            ### 🧱 ROOM PROPERTIES TO EXTRACT
            For each room, include:
            - `roomType`: As labeled 
            - `room_name`: Standardized name (e.g., "Living Room", "Toilet", "Bedroom")
            - `length`: In meters (from dimensions)
            - `width`: In meters
            - `height`: From section view or default to "2.7"
            - `thickness`: Wall thickness (e.g., 0.2m, 200mm → "0.2")
            - `blockType`: e.g., "Standard Block", "Half Block", "Brick"
            - `plaster`: "None", "One Side", or "Both Sides"
            - `customBlock`: If custom, fill length, height, thickness, price
            - `doors`: Array of door objects
            - `windows`: Array of window objects

            ### 🚪 DOOR PROPERTIES
            Each door must have:
            - `sizeType`: "standard" (if matches 0.9 × 2.1 m) or "custom"
            - `standardSize`: "0.9 × 2.1 m" (or similar)
            - `custom`: { "height": "", "width": "", "price": "" } if custom
            - `type`: "Panel", "Flush", "Metal"
            - `frame`: "Wood", "Steel", "Aluminum"
            - `count`: Number of doors in this room with the same dimensions

            ### 🪟 WINDOW PROPERTIES
            Each window must have:
            - `sizeType`: "standard" (if matches 1.2 × 1.2 m) or "custom"
            - `standardSize`: "1.2 × 1.2 m" (or similar)
            - `custom`: { "height": "", "width": "", "price": "" }
            - `glass`: "Clear", "Frosted", "Tinted"
            - `frame`: "Wood", "Steel", "Aluminum"
            - `count`: Number of windows in this room with the same dimensions

            ### 🏗️ GENERAL RULES
            - Convert all dimensions to **meters** (mm → /1000, cm → /100)
            - Handle both `.` and `,` as decimal separators (e.g., 3,580 = 3.58)
            - If no block type specified, use: "Standard Block"
            - Default plaster: "Both Sides"
            - Default wall thickness: "0.2"
            - Default room height: "2.7"
            - Floor count: Detect "Ground Floor", "First Floor", etc.

            ### 📤 RETURN FORMAT
            Return only a JSON object with this structure:
            {
            "rooms": [
                {
                "roomType": "Living Room",
                "room_name": "Living Room",
                "length": "3.5",
                "width": "3.3",
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
                    "frame": "Wood",
                    "count": 1
                    }
                ],
                "windows": [
                    {
                    "sizeType": "standard",
                    "standardSize": "1.2 × 1.2 m",
                    "custom": { "height": "", "width": "", "price": "" },
                    "glass": "Clear",
                    "frame": "Aluminum",
                    "count": 1
                    }
                ]
                }
            ],
            "floors": 1
            }

            Now analyze the image and return the JSON.
            """
            gemini_result = call_gemini(temp_img, VISION_PROMPT)
            if gemini_result:
                result = gemini_result
                print("✅ Gemini correction applied", file=sys.stderr)
            os.remove(temp_img)
    except Exception as e:
        print(f"Gemini fallback failed: {e}", file=sys.stderr)

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
        print(json.dumps(result))
    except Exception as e:
        import traceback
        print(json.dumps({"error": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)