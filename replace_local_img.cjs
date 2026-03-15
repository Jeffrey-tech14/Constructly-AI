const fs = require('fs');
let c = fs.readFileSync('src/components/sections/WhoItsForSection.tsx', 'utf8');

c = c.replace(
  'src="/JMST.jpg"',
  'src="https://www.shutterstock.com/image-photo/hologram-project-construction-site-holographic-260nw-2114687588.jpg"'
);

fs.writeFileSync('src/components/sections/WhoItsForSection.tsx', c);
