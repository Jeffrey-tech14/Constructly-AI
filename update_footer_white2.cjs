const fs = require('fs');
let c = fs.readFileSync('src/components/PageFooter.tsx', 'utf8');

c = c.replace(
  'hover:text-[#001226] flex items-center',
  'hover:text-white flex items-center'
);
c = c.replace(
  'hover:text-[#001226] flex items-center',
  'hover:text-white flex items-center'
);
c = c.replace(
  'hover:text-[#001226] flex items-center',
  'hover:text-white flex items-center'
);

fs.writeFileSync('src/components/PageFooter.tsx', c);
