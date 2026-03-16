const fs = require('fs');
let c = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

c = c.replace(/bg-\[\#111418\] bg-\[\#f0514e\]\/10/g, 'bg-[#111418] relative overflow-hidden');
c = c.replace(/border border-white\/10 border-primary\/20/g, 'border border-primary/20');
c = c.replace(/border-white\/10 border-primary\/20/g, 'border-primary/20');
c = c.replace(/text-white mb-4/g, 'text-white font-medium mb-4');

fs.writeFileSync('src/components/UserGuide.tsx', c);
