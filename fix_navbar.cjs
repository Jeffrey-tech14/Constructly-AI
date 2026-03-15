const fs = require('fs');
let c = fs.readFileSync('src/components/sections/NavbarSection.tsx', 'utf8');

// Change alignment of links next to logo
// From: flex-1 justify-center items-center gap-10
// To: flex-1 justify-start ml-8 items-center gap-8
c = c.replace(
  'hidden lg:flex flex-1 justify-center items-center gap-10 text-[15.5px]',
  'hidden lg:flex flex-1 justify-start ml-8 items-center gap-8 text-[15.5px]'
);

fs.writeFileSync('src/components/sections/NavbarSection.tsx', c);
