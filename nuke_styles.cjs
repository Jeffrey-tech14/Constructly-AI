const fs = require('fs');
let c = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

c = c.replace(/const GlobalStyles = \(\) => \([\s\S]*?<\/style>\s*\);\n/g, '');
c = c.replace(/<GlobalStyles \/>/g, '');

c = c.replace(/className=\"bg-\[\#111418\] relative overflow-hidden border border-primary\/20 rounded-lg p-6\"/g, 'className="bg-[#111418] border border-primary/20 rounded-lg p-6"');

// Fix the card border artifact:
c = c.replace(/className=\"bg-\[\#111418\] border-white\/5:(from-[A-Za-z0-9-]+\/(?:[0-9]+))/g, 'className="bg-[#111418] ');

fs.writeFileSync('src/components/UserGuide.tsx', c);
