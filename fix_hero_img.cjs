const fs = require('fs');
let c = fs.readFileSync('src/components/Hero.tsx', 'utf8');

c = c.replace(
  'h-[300px] sm:h-[400px] lg:h-[450px]',
  'h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px]'
);

c = c.replace(
  'className="relative w-full h-full z-10 flex items-center justify-center p-4 sm:p-8"',
  'className="relative w-full h-full z-10 flex items-center justify-center"'
);

c = c.replace(
  'className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-[0_20px_40px_rgba(216,92,44,0.15)]"',
  'className="w-[120%] lg:w-[130%] max-w-none h-auto object-contain drop-shadow-[0_20px_40px_rgba(216,92,44,0.25)] scale-110 transform-gpu" style={{ imageRendering: "high-quality" }}'
);

fs.writeFileSync('src/components/Hero.tsx', c);
