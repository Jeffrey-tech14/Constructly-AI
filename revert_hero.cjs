const fs = require('fs');
let c = fs.readFileSync('src/components/Hero.tsx', 'utf8');

c = c.replace(
  'className="relative w-full h-full z-10 flex items-center justify-center mix-blend-lighten"',
  'className="relative w-full h-full z-10 flex items-center justify-center"'
);

c = c.replace(
  'src="https://img.freepik.com/premium-psd/3d-rendering-construction-site-with-building-construction-transparent-background_498208-3721.jpg"',
  'src="https://png.pngtree.com/png-vector/20240314/ourmid/pngtree-trendy-civil-engineering-png-image_11952952.png"'
);

c = c.replace(
  'className="max-w-[130%] min-w-[110%] w-[120%] lg:w-[130%] h-auto object-contain mix-blend-screen scale-110 drop-shadow-2xl transform-gpu"',
  'className="w-[120%] lg:w-[130%] max-w-none h-auto object-contain drop-shadow-[0_20px_40px_rgba(216,92,44,0.25)] scale-110 transform-gpu" style={{ imageRendering: "high-quality" }}'
);

fs.writeFileSync('src/components/Hero.tsx', c);
