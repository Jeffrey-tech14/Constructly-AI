const fs = require('fs');
let c = fs.readFileSync('src/components/Hero.tsx', 'utf8');

c = c.replace(
  'GENERATE ACCURATE <br />\n              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D85C2C] to-[#FFA584]">QUOTES IN MINUTES.</span>',
  '<span className="text-[#D85C2C]">Re-Imagine</span> <br />\n              <span className="text-white font-normal text-opacity-90">Remote Access</span>'
);

c = c.replace(
  'text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-bold leading-[1.1] text-white tracking-tight mb-6',
  'text-4xl sm:text-5xl lg:text-[4.5rem] xl:text-[5rem] font-bold leading-[1.1] tracking-tight mb-6'
);

fs.writeFileSync('src/components/Hero.tsx', c);
