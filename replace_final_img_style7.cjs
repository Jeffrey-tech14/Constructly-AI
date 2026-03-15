const fs = require('fs');
let c = fs.readFileSync('src/components/sections/WhoItsForSection.tsx', 'utf8');

c = c.replace(
  '<div className="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between">',
  '<div className="w-full mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between">'
);

fs.writeFileSync('src/components/sections/WhoItsForSection.tsx', c);
