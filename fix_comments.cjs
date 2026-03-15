const fs = require('fs');
let c = fs.readFileSync('src/components/sections/FaqSection.tsx', 'utf8');
c = c.replace('</div><!--', '</div>');
c = c.replace('<!--', '');
c = c.replace('<!--', '');
fs.writeFileSync('src/components/sections/FaqSection.tsx', c);
