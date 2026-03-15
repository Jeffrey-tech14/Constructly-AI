const fs = require('fs');
let c = fs.readFileSync('src/components/Hero.tsx', 'utf8');

c = c.replace(
  'Streamline your construction business with our automated BOQ, Material Scheduling, and advanced measurement tools.',
  'We connect you from where you are to where you need to be.'
);

c = c.replace(
  'Start Free Trial',
  'Download Now'
);

c = c.replace(
  'Book Demo',
  'Start Business Trial'
);

fs.writeFileSync('src/components/Hero.tsx', c);
