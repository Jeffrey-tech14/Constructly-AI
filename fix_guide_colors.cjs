const fs = require('fs');
let c = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

const reps = [
  ['dark:bg-primary/20', 'bg-[#f0514e]/10'],
  ['dark:border-primary/30', 'border-primary/20'],
  ['dark:bg-gray-900', ''],
  ['dark:bg-gray-800', ''],
  ['dark:from-primary/20', 'from-primary/20'],
  ['dark:to-indigo-950/20', 'to-indigo-950/20'],
  ['dark:border-white/10', ''],
  ['dark:border-gray-800', ''],
  ['dark:text-white', ''],
  ['dark:text-primary', ''],
  ['dark:text-gray-400', ''],
  ['dark:text-gray-300', ''],
  ['bg-white', 'bg-[#1a1b22]'],
  ['text-gray-900', 'text-white'],
  ['text-gray-800', 'text-gray-200'],
  ['text-gray-700', 'text-gray-300'],
  ['text-gray-600', 'text-gray-400'],
  ['bg-amber-50', 'bg-amber-950/20'],
  ['border-amber-200', 'border-amber-500/20'],
  ['dark:border-amber-800', 'border-amber-800/50'],
  ['text-amber-900', 'text-amber-100'],
  ['text-amber-800', 'text-amber-200'],
  ['bg-green-50', 'bg-green-950/20'],
  ['text-green-900', 'text-green-100'],
  ['text-green-800', 'text-green-200'],
  ['border-green-200', 'border-green-500/20'],
  ['dark:border-green-800', 'border-green-800/50'],
  ['bg-blue-50', 'bg-blue-950/20'],
  ['text-blue-900', 'text-blue-100'],
  ['text-blue-800', 'text-blue-200'],
  ['bg-purple-50', 'bg-purple-950/20'],
  ['text-purple-900', 'text-purple-100'],
  ['text-purple-800', 'text-purple-200'],
  ['dark:from-orange-950/30', 'from-orange-950/30'],
  ['dark:from-red-950/30', 'from-red-950/30'],
  ['dark:from-cyan-950/30', 'from-cyan-950/30'],
  ['dark:from-yellow-950/30', 'from-yellow-950/30'],
  ['border-[#333333]:', '']
];

for(const [k,v] of reps) {
   c = c.split(k).join(v);
}
c = c.replace(/  +/g, ' ');

fs.writeFileSync('src/components/UserGuide.tsx', c);
