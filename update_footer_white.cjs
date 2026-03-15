const fs = require('fs');
let c = fs.readFileSync('src/components/PageFooter.tsx', 'utf8');

c = c.replace(
  '<footer id="footer" className="bg-[#111315] pt-16 pb-8 text-white relative antialiased z-10">',
  '<footer id="footer" className="bg-white pt-16 pb-8 text-[#1a1a1a] relative antialiased z-10">'
);

// Specifically reverse text colors back to standard for White bg.
c = c.replace(/text-gray-400/g, 'text-gray-600');
c = c.replace(/text-white/g, 'text-[#002d5c]');
c = c.replace(/text-gray-300/g, 'text-[#001226]');

// Because the above replaces text-white, we need to fix the buttons that should actually be white text
c = c.replace('bg-[#ef4444] text-[#002d5c]', 'bg-[#ef4444] text-white');
c = c.replace('bg-[#002d5c] text-[color:white]', 'bg-[#002d5c] text-white');
// The bottom bar is dark, so text should be white there too
const bottomBarIndex = c.indexOf('{/* BOTTOM BAR */}');
if (bottomBarIndex !== -1) {
    let lowerHalf = c.slice(bottomBarIndex);
    lowerHalf = lowerHalf.replace(/text-\[#002d5c\]/g, 'text-white');
    c = c.slice(0, bottomBarIndex) + lowerHalf;
}


// Fix borders and simple cards
c = c.replace(/bg-\[#1a1c1e\]/g, 'bg-[#f8f9fa]');
c = c.replace(/border-white\/10/g, 'border-[#d1d5db]');
c = c.replace(/bg-white\/5/g, 'bg-[#e5f0f7]');
c = c.replace(/placeholder:text-gray-600/g, 'placeholder:text-gray-400');
c = c.replace('hover:text-gray-300', 'hover:text-[#001226]');


// The logo uses text which cannot be white on a white background, already covered by 	ext-[#002d5c] replacements.
fs.writeFileSync('src/components/PageFooter.tsx', c);
