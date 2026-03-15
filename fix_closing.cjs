const fs = require('fs');
let c = fs.readFileSync('src/components/sections/FaqSection.tsx', 'utf8');

c = c.replace(/uration-500" \/><\/div>(\s*<\/div>){5}\s*\{\/\* MAIN CONTENT \*\/\}/s, 'uration-500" /></div>\n            </div>\n          </div>\n        </div>\n\n        {/* MAIN CONTENT */}');

fs.writeFileSync('src/components/sections/FaqSection.tsx', c);
