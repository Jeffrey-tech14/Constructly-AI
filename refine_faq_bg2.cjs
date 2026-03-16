const fs = require('fs');
let code = fs.readFileSync('src/components/sections/FaqSection.tsx', 'utf8');

code = code.replace(
    /<div id="faq" className="w-full bg-\[#1a1c22\] min-h-screen">/,
    '<div id="faq" className="font-technical dark w-full bg-[#111418] text-[#eceff4] text-base min-h-screen">'
);
code = code.replace(
    /<div id="faq" className="w-full bg-\[#111418\] min-h-screen">/,
    '<div id="faq" className="font-technical dark w-full bg-[#111418] text-[#eceff4] text-base min-h-screen">'
);


// we also need to ensure category titles and description texts don't look weird.
code = code.replace(/text-\[#a3a9b7\] font-light text-\[15px\] leading-relaxed text-lg/g, 'text-[#a3a9b7] font-light text-lg');
code = code.replace(/text-\[#a3a9b7\] font-light text-\[15px\] leading-relaxed/g, 'text-[#a3a9b7] font-light text-[15px] leading-relaxed');

// Cards background: replace the old dark mode background #1a1c22 with the exact sleek styling we made for the UserGuide cards
code = code.replace(/<div\s+key=\{idx\}\s+className="bg-\[#1a1c22\]/g, '<div key={idx} className="bg-[#1a1c22] border-white/5 shadow-2xl');

fs.writeFileSync('src/components/sections/FaqSection.tsx', code);
console.log("Fixed main wrapper");
