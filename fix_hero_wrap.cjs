const fs = require('fs');
let c = fs.readFileSync('src/components/Hero.tsx', 'utf8');

c = c.replace(
  '<span className="text-[#D85C2C]">Generate Accurate</span> <br />',
  '<span className="text-[#D85C2C] whitespace-nowrap">Generate Accurate</span> <br className="hidden md:block" />'
);

c = c.replace(
  'font-bold leading-[1.1] tracking-tight mb-6',
  'font-bold leading-[1.1] tracking-tight mb-6 flex flex-col md:block'
);

c = c.replace(
  'text-4xl sm:text-5xl lg:text-[4.5rem] xl:text-[5rem]',
  'text-4xl sm:text-5xl lg:text-[4rem] xl:text-[4rem]'
);

fs.writeFileSync('src/components/Hero.tsx', c);
