const fs = require('fs');
let content = fs.readFileSync('src/pages/Auth.tsx', 'utf-8');

content = content.replace(/className="text-xl font-bold"[\s]*style={{ color: BRAND.PRIMARY }}/g, 'className="text-xl font-bold text-white mb-2"');

content = content.replace(/text-black/g, 'text-white');
content = content.replace(/style={{ color: BRAND.PRIMARY }}/g, 'style={{ color: "white" }}');

fs.writeFileSync('src/pages/Auth.tsx', content);
console.log('Fixed Auth.tsx text styles');
