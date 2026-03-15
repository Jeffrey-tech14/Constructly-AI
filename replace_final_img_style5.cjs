const fs = require('fs');
let c = fs.readFileSync('src/components/sections/WhoItsForSection.tsx', 'utf8');

c = c.replace(
  '<section className="bg-gradient-to-r from-[#EA5342] via-[#F0743B] to-[#F49324] py-16 lg:py-24 text-white relative overflow-hidden">',
  '<section className="bg-gradient-to-r from-[#EA5342] via-[#F0743B] to-[#F49324] text-white relative overflow-hidden">'
);

c = c.replace(
  '<div className="w-full h-full object-cover max-h-[400px] md:max-h-[600px] shadow-2xl mix-blend-normal"',
  '<div className="w-full h-[300px] md:h-full min-h-[400px] md:min-h-[550px] object-cover shadow-[20px_0_30px_rgba(0,0,0,0.3)] pointer-events-none"'
);

fs.writeFileSync('src/components/sections/WhoItsForSection.tsx', c);
