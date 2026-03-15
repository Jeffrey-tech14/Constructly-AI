const fs = require('fs');
let c = fs.readFileSync('src/components/sections/WhoItsForSection.tsx', 'utf8');

c = c.replace(
  '<div className="w-full h-[300px] md:h-full min-h-[400px] md:min-h-[550px] object-cover shadow-[20px_0_30px_rgba(0,0,0,0.3)] pointer-events-none"',
  'className="w-full h-full min-h-[400px] md:min-h-[550px] object-cover shadow-[20px_0_30px_-15px_rgba(0,0,0,0.3)] pointer-events-none"'
);

c = c.replace(
  '<div className="w-full md:w-1/2 flex justify-start relative -ml-4 sm:-ml-8 md:-ml-12 lg:-ml-24 xl:-ml-32">',
  '<div className="w-full md:w-1/2 flex justify-start relative">'
);

fs.writeFileSync('src/components/sections/WhoItsForSection.tsx', c);
