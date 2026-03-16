const fs = require('fs');
let content = fs.readFileSync('src/pages/Auth.tsx', 'utf-8');

content = content.replace('className="absolute inset-0 z-[200] bg-black/95', 'className="fixed inset-0 z-[9999] bg-[#0a0a0a]/95');

fs.writeFileSync('src/pages/Auth.tsx', content);
console.log('Fixed overlay');
