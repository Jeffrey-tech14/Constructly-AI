# main.py
import uuid
import subprocess
import json
import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Plan Parser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://192.168.0.100:8080", "https://elaris-ai.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/api/plan/upload")
async def parse_plan(file: UploadFile = File(...)):

    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.jpg', '.jpeg', '.png')):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}_{file.filename}"

    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        # 🔍 DEBUG: Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="File save failed")

        # 🚀 Run your Python parser
        result = subprocess.run(
            ["python3", "parser.py", str(file_path)],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=os.path.dirname(os.path.abspath(__file__))  # Ensure correct working dir
        )

        # Clean up file
        os.remove(file_path)

        # Handle subprocess result
        if result.returncode != 0:
            print(f"❌ Parser failed with return code {result.returncode}")  # LOG
            print(f"STDERR: {result.stderr}")  # 🔥 THIS IS KEY
            print(f"STDOUT: {result.stdout}")  # Sometimes has clues
            raise HTTPException(
                status_code=500,
                detail=f"Parser script error: {result.stderr[:200]}"
            )

        # Try to parse JSON
        output = result.stdout.strip()
        print(f"📄 Parser output: {output}")  # LOG

        try:
            parsed_data = json.loads(output)
            return parsed_data
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON from parser: {e}")  # LOG
            print(f"Raw output: >>>{output}<<<")  # Show exactly what came out
            raise HTTPException(
                status_code=500,
                detail=f"Parser returned invalid JSON: {str(e)}"
            )

    except Exception as e:
        # Make sure file is cleaned up
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"🧹 Cleaned up broken file: {file_path}")
            except:
                pass

        print(f"💥 Unexpected error: {type(e).__name__}: {e}")  # 🔥 LOG FULL ERROR
        import traceback
        traceback.print_exc()  # Full stack trace
        raise HTTPException(status_code=500, detail="Internal server error")