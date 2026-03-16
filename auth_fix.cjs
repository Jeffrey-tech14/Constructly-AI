const fs = require('fs');
let content = fs.readFileSync('src/pages/Auth.tsx', 'utf-8');

// Container & Panels
content = content.replace(/bg-white/g, 'bg-[#1a1c22]');
content = content.replace(/bg-gray-50/g, 'bg-[#15171c]');
content = content.replace(/border-\[\#d1d5db\]/g, 'border-white/10');
content = content.replace(/bg-gray-200/g, 'bg-white/10');
content = content.replace(/border-gray-300/g, 'border-white/10');
content = content.replace(/hover:bg-[#15171c]/g, 'hover:bg-white/5');

// Fix buttons styling
content = content.replace(/style={{ backgroundColor: "white"/g, 'style={{ backgroundColor: "#1e2128"');
content = content.replace(/hover:bg-\[\#1a1c22\]\/10/g, 'hover:bg-white/10');

// Text Colors
content = content.replace(/text-gray-800/g, 'text-white');
content = content.replace(/text-gray-700/g, 'text-[#a3a9b7]');
content = content.replace(/text-gray-600/g, 'text-[#a3a9b7]');
content = content.replace(/text-gray-500/g, 'text-[#a3a9b7]');
content = content.replace(/text-black/g, 'text-white');

// Success message specific
content = content.replace('bg-[#1a1c22]/95', 'bg-black/95');
content = content.replaceAll('<h2\n                    className="text-xl font-bold"\n                    style={{ color: BRAND.PRIMARY }}\n                  >', '<h2 className="text-xl font-bold text-white mb-2">');

fs.writeFileSync('src/pages/Auth.tsx', content);
console.log('Fixed Auth.tsx styles');
