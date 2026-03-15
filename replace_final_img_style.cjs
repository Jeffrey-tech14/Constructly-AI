const fs = require('fs');
let c = fs.readFileSync('src/components/sections/WhoItsForSection.tsx', 'utf8');

c = c.replace(
  '<div className="w-full md:w-5/12 flex justify-center md:justify-end relative">',
  '<div className="w-full md:w-5/12 flex justify-center md:justify-start relative">'
);

c = c.replace(
  'className="w-[120%] max-w-[650px] lg:scale-125 object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)] transform-gpu hover:scale-[1.28] transition-transform duration-700"',
  'className="w-full max-w-[800px] object-cover scale-[1.3] origin-right drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)]"'
);

fs.writeFileSync('src/components/sections/WhoItsForSection.tsx', c);
