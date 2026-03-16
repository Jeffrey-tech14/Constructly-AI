const fs = require('fs');
let code = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

// The main <h1> needs adjusting to look extremely sleek
code = code.replace(
    /<h1 className="text-4xl font-bold text-white mb-4 tracking-tight"><span className="text-\[#ef443b\]">Platform<\/span> Documentation<\/h1>/,
    '<h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight font-technical"><span className="text-[#ef443b] font-light">Platform</span> Documentation</h1>'
);

// All paragraphs in the guide should look sleek and have right color
code = code.replace(/text-\[#9fa5b3\] /g, 'text-[#a3a9b7] font-light leading-relaxed text-[15px] ');
code = code.replace(/text-\[#9fa5b3\]/g, 'text-[#a3a9b7] font-light leading-relaxed text-[15px]');

fs.writeFileSync('src/components/UserGuide.tsx', code);
console.log("Improved font styles");
