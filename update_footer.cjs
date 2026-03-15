const fs = require('fs');
let c = fs.readFileSync('src/components/PageFooter.tsx', 'utf8');

c = c.replace(
  '<footer id="footer" className="bg-[#F2F8EB] border-t border-[#86bc25]/20 pt-16 pb-8 text-[#1a1a1a]">',
  '<footer id="footer" className="bg-[#111315] pt-16 pb-8 text-white relative antialiased z-10">'
);

// We need to change text colors to match a dark theme similar to CTA Banner where text is white.
c = c.replace(/text-gray-600/g, 'text-gray-400');
c = c.replace(/text-\[#002d5c\]/g, 'text-white');
c = c.replace(/text-\[#1a1a1a\]/g, 'text-white');
c = c.replace(/text-\[#001226\]/g, 'text-gray-300');
c = c.replace(/bg-white/g, 'bg-[#1a1c1e]');
c = c.replace(/border-\[#d1d5db\]/g, 'border-white/10');
c = c.replace(/bg-\[#e5f0f7\]/g, 'bg-white/5');
c = c.replace(/bg-\[#002d5c\]/g, 'bg-[#1a1c1e]');
c = c.replace(/border-\[#e5e7eb\]/g, 'border-white/10');
c = c.replace(/placeholder:text-gray-400/g, 'placeholder:text-gray-600');

fs.writeFileSync('src/components/PageFooter.tsx', c);
