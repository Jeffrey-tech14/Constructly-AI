const fs = require('fs');
let code = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

code = code.replace(
    /<div className="w-full font-technical min-h-screen bg-\[#141414\] ug-container">/g,
    '<div className="dark w-full font-technical min-h-screen bg-[#111111] text-white ug-container">'
);
code = code.replace(
    /<div className="w-full font-technical min-h-screen bg-\[#141414\]\nug-container">/g,
    '<div className="dark w-full font-technical min-h-screen bg-[#111111] text-white ug-container">'
);
code = code.replace(
    /<div className="w-full font-technical min-h-screen bg-\[#141414\]\r\nug-container">/g,
    '<div className="dark w-full font-technical min-h-screen bg-[#111111] text-white ug-container">'
);

fs.writeFileSync('src/components/UserGuide.tsx', code);
console.log("Applied dark class.");
