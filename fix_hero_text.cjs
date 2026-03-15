const fs = require('fs');
let c = fs.readFileSync('src/components/Hero.tsx', 'utf8');

c = c.replace(
  '<span className="text-[#D85C2C]">Re-Imagine</span> <br />\n              <span className="text-white font-normal text-opacity-90">Remote Access</span>',
  '<span className="text-[#D85C2C]">Generate Accurate</span> <br />\n              <span className="text-white font-normal text-opacity-90">BOQ in Minutes</span>'
);

fs.writeFileSync('src/components/Hero.tsx', c);
