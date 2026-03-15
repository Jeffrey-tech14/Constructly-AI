const fs = require('fs');
let c = fs.readFileSync('src/components/sections/WhoItsForSection.tsx', 'utf8');

c = c.replace(
  'src="https://www.shutterstock.com/image-photo/hologram-project-construction-site-holographic-260nw-2114687588.jpg"',
  'src="https://snu.edu.in/site/assets/files/18047/floating-industrial-landscape-with-chimneys-tank-mixed-media.1600x0.webp"'
);

c = c.replace(
  'className="w-[95%] max-w-[550px] object-cover rounded-xl shadow-2xl"',
  'className="w-[120%] max-w-[650px] lg:scale-125 object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)] transform-gpu hover:scale-[1.28] transition-transform duration-700"'
);

fs.writeFileSync('src/components/sections/WhoItsForSection.tsx', c);
