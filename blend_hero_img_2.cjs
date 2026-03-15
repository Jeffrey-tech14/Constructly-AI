const fs = require('fs');
let c = fs.readFileSync('src/components/Hero.tsx', 'utf8');

c = c.replace(
  'className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-[0_20px_40px_rgba(216,92,44,0.15)]"',
  'className="max-w-[130%] min-w-[110%] w-[120%] lg:w-[130%] h-auto object-contain mix-blend-screen scale-110 drop-shadow-2xl transform-gpu"'
);

fs.writeFileSync('src/components/Hero.tsx', c);
