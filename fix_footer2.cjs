const fs = require('fs');
let c = fs.readFileSync('src/components/PageFooter.tsx', 'utf8');

c = c.replace(
  '<button className="bg-[#1a1c1e] text-white px-4 flex items-center justify-center hover:bg-[#001226] transition-colors">',
  '<button className="bg-[#ef4444] text-white px-5 flex items-center justify-center hover:bg-[#dc2626] transition-colors">'
);

fs.writeFileSync('src/components/PageFooter.tsx', c);
