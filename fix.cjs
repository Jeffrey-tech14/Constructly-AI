const fs = require('fs');
let c = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

c = c.replace(/const GlobalStyles = \(\) => \([\s\S]*?<\/style>\s*\);\n\n/, '');
c = c.replace(/<GlobalStyles \/>/g, '');
c = c.replace(/className=\"ug-container\"/g, 'className=\"\"');
c = c.replace(/ className=\{\ug-container/g, ' className={');
c = c.replace(/ug-container /g, '');

fs.writeFileSync('src/components/UserGuide.tsx', c);
console.log('Fixed UserGuide CSS.');
