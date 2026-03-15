const fs = require('fs');
let c = fs.readFileSync('src/components/Hero.tsx', 'utf8');

c = c.replace(
  'https://png.pngtree.com/png-vector/20240314/ourmid/pngtree-trendy-civil-engineering-png-image_11952952.png',
  'https://img.freepik.com/premium-psd/3d-rendering-construction-site-with-building-construction-transparent-background_498208-3721.jpg'
);

fs.writeFileSync('src/components/Hero.tsx', c);
