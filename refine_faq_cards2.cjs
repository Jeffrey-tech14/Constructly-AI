const fs = require('fs');
let code = fs.readFileSync('src/components/sections/FaqSection.tsx', 'utf8');

// The main FAQ list items
code = code.replace(/className="flex-grow bg-\[#1a1c22\] border border-white\/10 rounded-xl shadow-none hover:shadow-none transition-all duration-300 group overflow-hidden"/g, 'className="flex-grow bg-[#1a1c22] border border-white/5 rounded-xl shadow-2xl hover:border-white/10 transition-all duration-300 group overflow-hidden"');

// The main Category sidebar
code = code.replace(/<div className="bg-\[#1a1c22\] border border-white\/10 rounded-xl shadow-none mb-6 sticky top-24 overflow-hidden">/g, '<div className="bg-[#1a1c22] border border-white/5 rounded-xl shadow-2xl mb-6 sticky top-24 overflow-hidden">');

// All instances of bad gray
code = code.replace(/text-\[#a3a9b7\] font-light text-\[15px\] leading-relaxed/g, 'text-[#a3a9b7] font-light text-[15px] leading-relaxed');

// FAQ Title fonts
code = code.replace(/<h3 className="text-xl md:text-2xl font-bold text-white mb-3 font-technical tracking-tight">/g, '<h3 className="text-xl md:text-2xl font-bold text-white mb-3 font-technical tracking-tight">');
// any h3 with text-[#ef443b]
code = code.replace(/<h3 className="text-lg md:text-xl font-bold text-\[#ef443b\] mb-6 uppercase tracking-tight">/g, '<h3 className="text-xl md:text-2xl font-bold text-[#ef443b] mb-4 font-technical tracking-tight">');

// Make the text items look sleek
code = code.replace(/<span className="font-bold text-white uppercase tracking-wider">/g, '<span className="font-medium text-white tracking-wide font-technical text-lg">');
code = code.replace(/<span className="font-bold uppercase tracking-wider text-\[#a3a9b7\]">/g, '<span className="font-medium tracking-wide text-[#a3a9b7] font-technical text-[15px]">');
code = code.replace(/<select className="bg-transparent font-bold text-\[#ef443b\] focus:outline-none cursor-pointer uppercase tracking-wide text-sm">/g, '<select className="bg-transparent font-medium text-[#ef443b] focus:outline-none cursor-pointer tracking-wide text-sm font-technical">');



fs.writeFileSync('src/components/sections/FaqSection.tsx', code);
console.log("Fixed main wrapper inner cards");
