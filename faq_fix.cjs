const fs = require('fs');
let c = fs.readFileSync('src/components/sections/FaqSection.tsx', 'utf8');

c = c.replace(/className="w-full font-technical bg-\[\#1a1a1a\] min-h-screen"/g, 'className="w-full font-technical antialiased bg-[#1a1a1a] min-h-screen"');
c = c.split('text-[10px]').join('text-xs');
c = c.split('text-[9px]').join('text-xs');
c = c.split('text-[12px]').join('text-sm md:text-base');
c = c.split('text-[13px]').join('text-base');
c = c.split('text-[15px]').join('text-lg md:text-xl');
c = c.split('text-[11px]').join('text-sm');

const newImg = \              <div className="hidden lg:flex relative w-full h-[400px] justify-center items-center drop-shadow-[0_20px_40px_rgba(239,68,59,0.15)]">
                <img src="https://img.freepik.com/premium-photo/ai-construction-worker-holds-ai-construction-site-while-using-ai-construction-site_111797-2516.jpg" alt="Construction Hero" className="w-full h-[400px] object-cover rounded-xl transform-gpu hover:scale-[1.02] transition-transform duration-500" />
              </div>\;

c = c.replace(/\{\/\* Optional: Keep video or replace with illustration \*\/\}.*?<\/div>\s*<\/div>\s*<\/div>/s, newImg + '\n            </div>\n          </div>\n        </div>');

fs.writeFileSync('src/components/sections/FaqSection.tsx', c);
