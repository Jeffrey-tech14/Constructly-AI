const fs = require('fs');
let content = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

// Replace old red text colors with AnyDesk color
content = content.replace(/text-\[#ef443b\]/gi, 'text-[#D85C2C]');

// Replace background red
content = content.replace(/bg-\[#ef443b\]/gi, 'bg-[#f0514e]');

// Fix light backgrounds in Cards
content = content.replace(/bg-amber-50/g, 'bg-white/5');
content = content.replace(/border-amber-500/g, 'border-[#D85C2C]');

// Append dark bg to specific elements
content = content.replace(/<Card>/g, '<Card className=\"bg-white/5 border-white/10 text-white\">');
content = content.replace(/<Card className=\"/g, '<Card className=\"bg-white/5 border-white/10 text-white ');

// Remove dark mode blue overrides as we are forcing dark theme
// This regex strips dark:bg-blue... dark:text-...
content = content.replace(/dark:[a-zA-Z0-9-\/[\]#]+/g, '');

content = content.replace(/text-\[#a0a0a0\]/gi, 'text-gray-400');
content = content.replace(/text-black/gi, 'text-white');

// Make ensure all headers are white
content = content.replace(/text-gray-900/gi, 'text-white');
content = content.replace(/text-gray-800/gi, 'text-white');
content = content.replace(/bg-white/gi, 'bg-white/5');

fs.writeFileSync('src/components/UserGuide.tsx', content);
