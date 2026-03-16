const fs = require('fs');
let text = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

text = text.replace(/className="([^"]+)"\s+className="text-\[#1a1a1a\]"/g, 'className="$1 text-[#1a1a1a]"');

fs.writeFileSync('src/pages/Auth.tsx', text);
