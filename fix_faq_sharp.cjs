const fs = require('fs');
let c = fs.readFileSync('src/components/sections/FaqSection.tsx', 'utf8');

// 1. Add antialiased to fix blurry rendering
c = c.replace(/className="w-full font-technical bg-\\[#1a1a1a\\] min-h-screen"/g, 'className="w-full font-technical antialiased bg-[#1a1a1a] min-h-screen"');

// 2. Increase extremely small font sizes for better clarity
c = c.replace(/text-\\[10px\\]/g, 'text-xs md:text-sm');
c = c.replace(/text-\\[9px\\]/g, 'text-xs');
c = c.replace(/text-\\[12px\\]/g, 'text-sm md:text-base');
c = c.replace(/text-\\[13px\\]/g, 'text-base');
c = c.replace(/text-\\[15px\\]/g, 'text-lg md:text-xl');
c = c.replace(/text-\\[11px\\]/g, 'text-sm');

// 3. Replace the placeholder missing video box with a high-res floating graphic
const oldImg =               {/* Optional: Keep video or replace with illustration */}
              <div className="hidden lg:block relative h-64 w-full border border-[#d1d5db] rounded-xl bg-[#141414] flex items-center justify-center">
                <div className="text-center text-[#a0a0a0] text-sm">
                  <Play className="w-10 h-10 mx-auto text-[#ef443b] mb-2" />
                  <span>Technical Workflow Demo</span>
                </div>
              </div>;

const newImg =               <div className="hidden lg:flex relative w-full h-[400px] justify-center items-center drop-shadow-[0_20px_40px_rgba(239,68,59,0.15)]">
                <img 
                  src="https://png.pngtree.com/png-vector/20240314/ourmid/pngtree-trendy-civil-engineering-png-image_11952952.png"
                  alt="Technical Operations Support"
                  className="max-w-[90%] max-h-[350px] object-contain transform-gpu hover:scale-105 transition-transform duration-500"
                />
              </div>;

c = c.replace(oldImg, newImg);

fs.writeFileSync('src/components/sections/FaqSection.tsx', c);
