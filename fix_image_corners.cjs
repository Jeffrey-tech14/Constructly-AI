const fs = require('fs');
const file = 'src/components/sections/WhoItsForSection.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
    'className="w-full h-auto object-contain"',
    'className="w-[90%] md:w-[85%] max-w-[480px] h-auto object-contain rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.15)] mx-auto lg:mr-0"'
);

c = c.replace(
    'className="w-full md:w-[55%] md:shrink-0"',
    'className="w-full md:w-[50%] md:shrink-0 flex items-center justify-center p-4 lg:p-0"'
);

fs.writeFileSync(file, c);
console.log('Update success');