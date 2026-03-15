const fs = require('fs');
let c = fs.readFileSync('src/components/sections/FaqSection.tsx', 'utf8');

const badChunk =               {/* Optional: Keep video or replace with illustration */}
              <div className="hidden lg:flex relative w-full h-[400px] justify-center items-center drop-shadow-[0_20px_40px_rgba(239,68,59,0.15)]"><img src="https://png.pngtree.com/png-vector/20240314/ourmid/pngtree-trendy-civil-engineering-png-image_11952952.png" alt="FAQ Graphic" className="max-w-[100%] max-h-[400px] object-contain transform-gpu hover:scale-105 transition-transform duration-500" /></div>                                                                       


                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */};

const goodChunk =               {/* Optional: Keep video or replace with illustration */}
              <div className="hidden lg:flex relative w-full h-[400px] justify-center items-center drop-shadow-[0_20px_40px_rgba(239,68,59,0.15)]">
                <img src="https://png.pngtree.com/png-vector/20240314/ourmid/pngtree-trendy-civil-engineering-png-image_11952952.png" alt="FAQ Graphic" className="max-w-[100%] max-h-[400px] object-contain transform-gpu hover:scale-105 transition-transform duration-500" />
              </div>

            </div>
          </div>
        </div>

        {/* MAIN CONTENT */};

let newC = c.replace(badChunk, goodChunk);

// if not found, we use a regex approach to just clean ALL trailing closing tags before MAIN CONTENT:

newC = newC.replace(/\{\/\* Optional: Keep video or replace with illustration \*\/\}.*?\{\/\* MAIN CONTENT \*\/\}/s, goodChunk);


fs.writeFileSync('src/components/sections/FaqSection.tsx', newC);
