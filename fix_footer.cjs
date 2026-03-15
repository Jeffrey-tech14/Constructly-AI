const fs = require('fs');
let c = fs.readFileSync('src/components/PageFooter.tsx', 'utf8');

c = c.replace(
  'hover:text-white',
  'hover:text-gray-300'
);

c = c.replace(
  '<span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#002d5c]',
  '<span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#ef4444]'
);

c = c.replace(
  'bg-white text-white px-4 flex items-center justify-center hover:bg-gray-300',
  'bg-[#ef4444] text-white px-5 flex items-center justify-center hover:bg-[#dc2626]'
);

fs.writeFileSync('src/components/PageFooter.tsx', c);
