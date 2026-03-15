const fs = require('fs');
let c = fs.readFileSync('src/components/sections/WhoItsForSection.tsx', 'utf8');

c = c.replace(
  'origin-right drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)]"',
  'origin-center md:origin-right drop-shadow-2xl mix-blend-multiply"'
);

fs.writeFileSync('src/components/sections/WhoItsForSection.tsx', c);
