const fs = require('fs');
let c = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

// Fix main wrapper background
c = c.replace('<div className="bg-[#f8f9fa] w-full min-h-screen">', '<div className="bg-[#141414] text-gray-300 w-full min-h-screen font-technical antialiased">');

// Fix inner structural layout classes to be dark
c = c.replace(/className="bg-\\[#1a1a1a\\]  border border-\\[#333\\]  rounded-lg  p-6"/g, 'className="bg-[#222] border border-[#333] rounded-xl p-6"');

// Fix texts and titles
c = c.replace(/text-\\[#00356B\\]/g, 'text-gray-100');
c = c.replace(/text-gray-900/g, 'text-white');
c = c.replace(/text-gray-600/g, 'text-gray-400');
c = c.replace(/text-blue-900/g, 'text-gray-100');

// Fix card text
c = c.replace(/text-xl  text-gray-200 font-semibold  mb-4/g, 'text-xl text-white font-semibold mb-4');

c = c.replace(/bg-\\[#1a1a1a\\]\\s+border border-\\[#333\\]\\s+rounded-lg\\s+p-6/g, 'bg-[#1a1a1a] border border-[#333] rounded-xl p-6 shadow-sm');
c = c.replace(/p-2 bg-\\[#1a1a1a\\]  rounded border-l-4/g, 'p-3 bg-[#222] rounded-r-lg border-l-4');

// Improve section card styling so it flows smoothly into the background
c = c.replace(/<Card className=" border border-transparent hover:border-\\[#333\\] shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl bg-\\[#1a1a1a\\]">/g, '<Card className="border border-[#333] shadow-none hover:border-[#D85C2C]/50 transition-all duration-300 rounded-2xl bg-[#1a1a1a]">');

fs.writeFileSync('src/components/UserGuide.tsx', c);

