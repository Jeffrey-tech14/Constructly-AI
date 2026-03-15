const fs = require('fs');
let content = fs.readFileSync('src/components/sections/FaqSection.tsx', 'utf8');

const oldHtml = \                {/* Optional: Keep video or replace with illustration */}
                <div className="hidden lg:block relative h-64 w-full border border-[#d1d5db] rounded-xl bg-[#141414] flex items-center justify-center">
                  <div className="text-center text-[#a0a0a0] text-sm">
                    <Play className="w-10 h-10 mx-auto text-[#ef443b] mb-2" />
                    <span>Technical Workflow Demo</span>
                  </div>
                </div>\;

const newHtml = \                {/* Technical Workflow Demo Image */}
                <div className="hidden lg:block relative w-full border border-[#333] rounded-xl bg-[#1a1a1a] overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                  <img 
                    src="https://cdn.mgmtech.org/media/news/20240301/65e1a48fafc90_02.jpg" 
                    alt="Technical Workflow Demo" 
                    className="w-full h-[400px] object-cover opacity-90 hover:opacity-100 transition-opacity" 
                  />
                </div>\;

// Doing a regex replace just in case indentation varies slightly
const regex = /\{\/\* Optional: Keep video or replace with illustration \*\/\}\s*<div className="hidden lg:block relative h-64 w-full border border-\[\#d1d5db\] rounded-xl bg-\[\#141414\] flex items-center justify-center">\s*<div className="text-center text-\[\#a0a0a0\] text-sm">\s*<Play className="w-10 h-10 mx-auto text-\[\#ef443b\] mb-2" \/>\s*<span>Technical Workflow Demo<\/span>\s*<\/div>\s*<\/div>/g;

content = content.replace(regex, newHtml);
fs.writeFileSync('src/components/sections/FaqSection.tsx', content);
console.log('Done!');
