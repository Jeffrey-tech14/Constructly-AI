const fs = require('fs');
try {
  let text = fs.readFileSync('temp_sections.tsx', 'utf8');

  // Strip dark mode classes
  text = text.replace(/dark:[A-Za-z0-9-\/]+/g, '');

  // Colors 
  text = text.replace(/text-blue-900|text-gray-900|text-slate-900|text-gray-800/g, 'text-white font-normal');
  text = text.replace(/text-blue-800|text-gray-700|text-gray-600|text-muted-foreground/g, 'text-[#a0a0a0] font-light');
  text = text.replace(/text-blue-600|text-blue-700|text-blue-500/g, 'text-[#ef443b]');
  text = text.replace(/text-green-600|text-green-700/g, 'text-[#ef443b]');
  text = text.replace(/bg-blue-50|bg-gray-50|bg-slate-50|bg-muted\/50/g, 'bg-[#1a1a1a]');
  text = text.replace(/bg-blue-100|bg-gray-100|bg-slate-100/g, 'bg-[#1a1a1a]');
  text = text.replace(/border-blue-200|border-gray-200|border-slate-200|border-blue-100/g, 'border-[#333]');
  text = text.replace(/bg-white/g, 'bg-transparent');
  text = text.replace(/bg-blue-600|bg-blue-700/g, 'bg-[#ef443b]');
  text = text.replace(/border-blue-500|border-blue-600/g, 'border-[#ef443b]');

  // Structural 
  text = text.replace(/<Card>/g, '<Card className="bg-transparent border border-[#333] rounded-sm text-white">');
  text = text.replace(/<Card className="/g, '<Card className="bg-transparent border border-[#333] rounded-sm text-white ');

  // Clean up double spaces
  text = text.replace(/  +/g, ' ');

  fs.writeFileSync('temp_sections_dark.tsx', text, 'utf8');
} catch (e) { console.error(e); }
