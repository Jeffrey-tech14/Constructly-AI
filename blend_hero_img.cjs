const fs = require('fs');
let c = fs.readFileSync('src/components/Hero.tsx', 'utf8');

c = c.replace(
  'className="w-[120%] lg:w-[130%] max-w-none h-auto object-contain drop-shadow-[0_20px_40px_rgba(216,92,44,0.25)] scale-110 transform-gpu" style={{ imageRendering: "high-quality" }}',
  'className="w-[120%] lg:w-[130%] max-w-none h-auto object-contain mix-blend-screen scale-110 transform-gpu" style={{ imageRendering: "high-quality" }}'
);

fs.writeFileSync('src/components/Hero.tsx', c);
