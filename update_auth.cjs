const fs = require('fs');
let content = fs.readFileSync('src/pages/Auth.tsx', 'utf-8');

// Replace the success block containing 'absolute inset-0' to use 'fixed inset-0'
content = content.replace(
  /<div className="absolute inset-0 z-\[200\] bg-black\/95\\nbackdrop-blur-sm flex items-center justify-center">/g,
  '<div className="fixed inset-0 z-[9999] bg-[#0a0a0a]/90 backdrop-blur-md flex items-center justify-center">'
);

// Fallback if the newline split isn't exact
content = content.replace(
  /<div className="absolute inset-0 z-\[200\] bg-black\/95\\s+backdrop-blur-sm flex items-center justify-center">/g,
  '<div className="fixed inset-0 z-[9999] bg-[#0a0a0a]/95 backdrop-blur-md flex items-center justify-center">'
);

fs.writeFileSync('src/pages/Auth.tsx', content);
console.log('updated auth success overlay');
