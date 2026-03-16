const fs = require('fs');
let c = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

const sIdx = c.indexOf('const GlobalStyles = () =>');
const eIdx = c.indexOf('</style>', sIdx);
if (sIdx !== -1 && eIdx !== -1) {
   const eIdx2 = c.indexOf(';', eIdx);
   c = c.substring(0, sIdx) + c.substring(eIdx2 + 1);
}
c = c.replace(/<GlobalStyles \/>/g, '');

c = c.replace(/ className=\{\ug-container/g, ' className={');
c = c.replace(/ug-container /g, '');
c = c.replace(/ug-container/g, '');

c = c.replace(/bg-gray-50/g, 'bg-transparent');
c = c.replace(/dark:bg-gray-900/g, '');
c = c.replace(/bg-white/g, 'bg-[#1a1b22]');
c = c.replace(/bg-\[\#141414\]/g, 'bg-[#161a1f]');
c = c.replace(/bg-\[\#1a1a1a\]/g, 'bg-[#1a1b22]');
c = c.replace(/dark:bg-primary\/20/g, 'bg-[#f0514e]/10');
c = c.replace(/dark:bg-gray-800/g, '');
c = c.replace(/dark:from-primary\/20/g, 'from-primary/20');
c = c.replace(/dark:to-indigo-950\/20/g, 'to-indigo-950/20');

c = c.replace(/border-gray-200/g, 'border-white/10');
c = c.replace(/border-\[\#d1d5db\]/g, 'border-white/10');
c = c.replace(/border-\[\#333333\]/g, 'border-white/5');
c = c.replace(/dark:border-white\/10/g, '');
c = c.replace(/dark:border-primary\/30/g, 'border-primary/20');
c = c.replace(/dark:border-gray-800/g, '');

c = c.replace(/text-gray-900/g, 'text-white');
c = c.replace(/text-gray-800/g, 'text-gray-200');
c = c.replace(/text-gray-700/g, 'text-gray-300');
c = c.replace(/text-gray-600/g, 'text-gray-400');
c = c.replace(/text-\[\#a0a0a0\]/g, 'text-gray-400');

// Clean up dark text overrides which aren't needed anymore
c = c.replace(/dark:text-white/g, '');
c = c.replace(/dark:text-primary/g, '');
c = c.replace(/dark:text-gray-400/g, '');
c = c.replace(/dark:text-gray-300/g, '');

c = c.replace(/bg-amber-50/g, 'bg-amber-950/20');

c = c.replace(/  +/g, ' '); // collapse big gaps
fs.writeFileSync('src/components/UserGuide.tsx', c);
