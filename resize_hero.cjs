const fs = require('fs');
let c = fs.readFileSync('src/components/Hero.tsx', 'utf8');

c = c.replace(
  'h-[300px] sm:h-[400px] lg:h-[450px]',
  'h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px]'
);

c = c.replace(
  'className="relative w-full h-full z-10 flex items-center justify-center p-4 sm:p-8"',
  'className="relative w-full h-full z-10 flex items-center justify-center mix-blend-lighten"'
);

fs.writeFileSync('src/components/Hero.tsx', c);
