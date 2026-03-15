const fs = require('fs');
let c = fs.readFileSync('src/components/sections/WhoItsForSection.tsx', 'utf8');

c = c.replace(
  '<div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">',
  '<div className="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between">'
);

c = c.replace(
  '<div className="w-full md:w-5/12 flex justify-center md:justify-start relative">',
  '<div className="w-full md:w-1/2 flex justify-start relative -ml-4 sm:-ml-8 md:-ml-12 lg:-ml-24 xl:-ml-32">'
);

c = c.replace(
  'className="w-full max-w-[800px] object-cover scale-[1.3] origin-center md:origin-right drop-shadow-2xl mix-blend-multiply"',
  'className="w-full h-full object-cover max-h-[400px] md:max-h-[600px] shadow-2xl mix-blend-normal"'
);

fs.writeFileSync('src/components/sections/WhoItsForSection.tsx', c);
