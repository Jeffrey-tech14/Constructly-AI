#!/usr/bin/env python3
"""
Script to update Android launcher icons with a new image
Resizes the image to all required Android density buckets
"""

from PIL import Image
import os
from pathlib import Path

# Define the sizes for each mipmap density (in pixels)
SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

def update_launcher_icons(source_image_path, android_res_path):
    """Update launcher icons for all Android densities"""
    
    # Open the source image
    img = Image.open(source_image_path).convert('RGBA')
    
    # Process each density
    for density, size in SIZES.items():
        mipmap_dir = os.path.join(android_res_path, density)
        
        # Resize image
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Save icon files
        resized.save(os.path.join(mipmap_dir, 'ic_launcher.png'))
        resized.save(os.path.join(mipmap_dir, 'ic_launcher_foreground.png'))
        resized.save(os.path.join(mipmap_dir, 'ic_launcher_round.png'))
        
        print(f"✓ Updated {density} ({size}x{size})")
    
    print("\n✅ Android launcher icons updated successfully!")

if __name__ == '__main__':
    # Get the image path and Android res path
    import sys
    script_dir = Path(__file__).parent
    
    if len(sys.argv) > 1:
        source_image = sys.argv[1]
    else:
        source_image = input("Enter the path to your logo image (PNG or JPG): ").strip()
    
    if not os.path.exists(source_image):
        print(f"❌ Error: File not found: {source_image}")
        exit(1)
    
    android_res_path = os.path.join(
        str(script_dir),
        'android',
        'app',
        'src',
        'main',
        'res'
    )
    
    if not os.path.exists(android_res_path):
        print(f"❌ Error: Android resource directory not found: {android_res_path}")
        exit(1)
    
    try:
        update_launcher_icons(source_image, android_res_path)
    except Exception as e:
        print(f"❌ Error: {e}")
        exit(1)
