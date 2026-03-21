#!/usr/bin/env python3
"""Convert PNG icon to Android resource densities"""

import os
from pathlib import Path
from PIL import Image

# Define Android icon sizes (dp -> px at each density)
# Using mdpi (160 dpi) as baseline: 1 dp = 1 px
# Android icon sizes are in pixels
ANDROID_SIZES = {
    'ldpi': 36,      # 0.75x baseline
    'mdpi': 48,      # 1x baseline
    'hdpi': 72,      # 1.5x baseline
    'xhdpi': 96,     # 2x baseline
    'xxhdpi': 144,   # 3x baseline
    'xxxhdpi': 192,  # 4x baseline
}

def main():
    project_root = Path(__file__).parent
    # Use the jtech-small-color.png as source
    png_file = project_root / 'public' / 'jtech-small-color.png'
    android_base = project_root / 'android' / 'app' / 'src' / 'main' / 'res'
    
    if not png_file.exists():
        print(f"Error: {png_file} not found!")
        return False
    
    print(f"Converting {png_file.name} to Android resources...")
    
    # Create directories
    for density in ANDROID_SIZES.keys():
        mipmap_dir = android_base / f'mipmap-{density}'
        mipmap_dir.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created {mipmap_dir.name}/")
    
    try:
        # Open source PNG
        print(f"Opening {png_file.name}...")
        master_img = Image.open(png_file).convert('RGBA')
        print(f"Original size: {master_img.size}")
        
        # Resize and save to each density
        for density, size in ANDROID_SIZES.items():
            resized = master_img.resize((size, size), Image.Resampling.LANCZOS)
            output_path = android_base / f'mipmap-{density}' / 'ic_launcher.png'
            resized.save(output_path, 'PNG', optimize=True)
            print(f"✓ {output_path.name} ({size}x{size}) - {output_path.stat().st_size} bytes")
        
        print("\n✅ Successfully created Android icon resources at all densities!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)

