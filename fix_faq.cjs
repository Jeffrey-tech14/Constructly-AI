const fs = require('fs');
let content = fs.readFileSync('src/components/sections/FaqSection.tsx', 'utf-8');

// 1. Image
content = content.replace(
  'https://png.pngtree.com/png-vector/20240314/ourmid/pngtree-trendy-civil-engineering-png-image_11952952.png',
  'https://png.pngtree.com/thumb_back/fh260/background/20220729/pngtree-3d-man-presenting-faq-concept-concept-frequetly-asked-question-isolated-photo-image_19292830.jpg'
);

// 2. Fonts & styles
content = content.replace('.font-technical { font-family: \'Outfit\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif; }', '');
content = content.replace(/\\bfont-technical\\b/g, '');
content = content.replace(/@import url[^;]+;/g, '');
content = content.replace(/const GlobalStyles[^<]+<style>{\[\\s\\S]*?\}<\/style>\\s*\n\s*\);/g, '');

// 3. Fix colors for dark theme
content = content.replace(/bg-\[\#eef5ff\]/g, 'bg-[#ef443b]/10');
content = content.replace(/border-\[\#d1d5db\]/g, 'border-white/10');
content = content.replace(/border-\[\#e5e7eb\]/g, 'border-white/5');
content = content.replace(/bg-\[\#e5e7eb\]/g, 'bg-white/10');
content = content.replace(/border-gray-300/g, 'border-white/20');
content = content.replace(/bg-gray-100/g, 'bg-[#2a2c32]');
content = content.replace(/text-gray-700/g, 'text-[#a3a9b7]');
content = content.replace(/text-\[\#a0a0a0\]/g, 'text-[#a3a9b7]');
content = content.replace(/text-\[\#707070\]/g, 'text-[#a3a9b7]');
content = content.replace(/bg-\[\#141414\]/g, 'bg-[#15171c]');
content = content.replace(/bg-\[\#1a1a1a\]/g, 'bg-[#1a1c22]');

fs.writeFileSync('src/components/sections/FaqSection.tsx', content);
console.log('Done!');
