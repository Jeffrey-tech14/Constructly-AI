const fs = require('fs');

let code = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

// Ensure framer-motion is imported
if (!code.includes('} from "framer-motion"')) {
    code = code.replace(
        'import React, { useState } from "react";',
        'import React, { useState } from "react";\nimport { motion } from "framer-motion";'
    );
}

const globalStyles = `
const GlobalStyles = () => (
  <style>{\`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #222222; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #ef443b; border-radius: 2px; }
    
    /* Override internal light/dark mode for the UserGuide to force dark theme matching FAQ */
    .ug-container h1, .ug-container h2, .ug-container h3, .ug-container h4, .ug-container h5, .ug-container h6 {
       color: #ffffff !important;
    }
    .ug-container p, .ug-container li {
       color: #a0a0a0 !important;
    }
    .ug-container .bg-white {
       background-color: #1a1a1a !important;
       border-color: #d1d5db !important;
    }
    .ug-container .text-gray-900, .ug-container .text-gray-800 {
       color: #ffffff !important;
    }
    .ug-container .text-blue-600, .ug-container .text-blue-800, .ug-container .text-blue-900 {
       color: #ef443b !important;
    }
    .ug-container .bg-blue-50, .ug-container .bg-blue-100, .ug-container .bg-blue-950\\/20 {
       background-color: #141414 !important;
       border-color: #ef443b !important;
    }
    .ug-container .bg-blue-600 {
       background-color: #ef443b !important;
       color: #ffffff !important;
    }
    .ug-container .bg-gray-100, .ug-container .bg-gray-50 {
       background-color: #1e1e1e !important;
    }
  \`}</style>
);
`;

if (!code.includes('const GlobalStyles = () =>')) {
    code = code.replace(
        'const UserGuide = () => {',
        globalStyles + '\n\nconst UserGuide = () => {'
    );
}

// Re-write the return block and Hero section
const heroSection = `  return (
    <PublicLayout>
      <GlobalStyles />
      <div className="w-full font-technical bg-[#1a1a1a] min-h-screen ug-container">
        {/* HERO SECTION */}
        <div className="w-full bg-[#1e1e1e] pt-24 pb-16">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="w-full max-w-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[#ef443b] font-mono text-xs font-bold uppercase tracking-[3px]">
                    Documentation
                  </span>
                  <div className="h-[1px] w-12 bg-[#ef443b]/30" />
                </div>

                <motion.h1
                  className="text-3xl md:text-4xl leading-[1.2] text-white mb-6 tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="font-light block">Platform</span>
                  <span className="font-bold text-[#ef443b] block mt-1">
                    User Guide
                  </span>
                </motion.h1>

                <p className="text-[#a0a0a0] text-base leading-relaxed mb-8 font-medium max-w-sm">
                  Comprehensive manual on uploading plans, calculating costs, and building accurate quotes.
                </p>

                <div className="flex">
                  <a
                    href="#guide-content"
                    onClick={(e) => { e.preventDefault(); document.getElementById('guide-content')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="h-12 px-8 flex items-center justify-center bg-[#ef443b] text-white font-black text-xs uppercase tracking-[1.5px] hover:bg-[#002a54] transition-colors rounded-md"
                  >
                    Start Reading
                  </a>
                </div>
              </div>

              <div className="hidden lg:flex relative w-full justify-center items-center">
                <img src="https://png.pngtree.com/png-vector/20240314/ourmid/pngtree-trendy-civil-engineering-png-image_11952952.png" alt="User Guide Graphic" className="w-auto h-auto max-w-full max-h-[400px] object-contain transform-gpu hover:translate-y-[-10px] transition-transform duration-500 drop-shadow-[0_20px_40px_rgba(239,68,59,0.15)]" />
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main id="guide-content" className="max-w-[1200px] mx-auto py-16 px-5 gap-10">
          <div className="w-full">
`;

// Extract from "return (" up to the start of "{/* Main Content */}" or the actual tabs.
// Looking at the console earlier:
/*
      <PublicLayout>
        <div className="dark w-full">
          <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header * /
          <div className="text-center mb-12">
            ...
          </div>
*/

const oldReturnRegex = /return \(\s*<PublicLayout>\s*<div className="dark w-full">\s*<div className="[^"]+">\s*<div className="[^"]+">[\s\S]*?(?:\{\/\* Main Content \*\/\})?/g;

code = code.replace(oldReturnRegex, heroSection);

// Update all the bottom closing tags.
// Previously:
/*
        </div>
      </div>
    </div>
    </PublicLayout>
*/
const oldEndRegex = /        <\/div>\s*<\/div>\s*<\/div>\s*<\/PublicLayout>/g;
code = code.replace(oldEndRegex, '          </div>\n        </main>\n      </div>\n    </PublicLayout>');

// Convert blue and rounded styles roughly to look more like the FAQ
code = code.replace(/text-blue-600/g, "text-[#ef443b]");
code = code.replace(/text-blue-700/g, "text-[#ef443b]");
code = code.replace(/text-blue-800/g, "text-[#ef443b]");
code = code.replace(/text-blue-900/g, "text-white");
code = code.replace(/bg-blue-600/g, "bg-[#ef443b]");
code = code.replace(/hover:bg-blue-700/g, "hover:bg-[#002a54]");
code = code.replace(/bg-blue-50/g, "bg-[#141414]");
code = code.replace(/border-blue-200/g, "border-[#d1d5db]");
code = code.replace(/bg-white/g, "bg-[#1a1a1a]");
code = code.replace(/text-gray-900/g, "text-white");
code = code.replace(/text-gray-600/g, "text-[#a0a0a0]");
code = code.replace(/text-gray-700/g, "text-[#a0a0a0]");
code = code.replace(/border-gray-200/g, "border-[#d1d5db]");

fs.writeFileSync('src/components/UserGuide.tsx', code);
console.log("Updated UserGuide!");
