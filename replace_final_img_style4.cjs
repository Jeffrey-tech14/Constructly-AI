const fs = require('fs');
let c = fs.readFileSync('src/components/sections/WhoItsForSection.tsx', 'utf8');

c = c.replace(
  '<div className="w-full md:w-7/12 flex flex-col items-center md:items-start text-center md:text-left">',
  '<div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left py-12 px-8 lg:px-12">'
);

fs.writeFileSync('src/components/sections/WhoItsForSection.tsx', c);
