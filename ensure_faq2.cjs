const fs = require('fs');
let code = fs.readFileSync('src/components/sections/FaqSection.tsx', 'utf8');

// Ensure font-technical wrappings (just to be safe)
if (!code.includes('<div className="font-technical')) {
  code = code.replace(
      /return \(\s*<div className="flex flex-col min-h-screen bg-\[#111418\] text-white w-full">/,
      'return (\n    <div className="font-technical dark flex flex-col min-h-screen bg-[#111418] text-[#eceff4] text-base w-full">'
  );
  code = code.replace(
      /return \(\s*<div className="flex flex-col min-h-screen bg-\[#111418\] font-sans text-white w-full">/,
      'return (\n    <div className="font-technical dark flex flex-col min-h-screen bg-[#111418] text-[#eceff4] text-base w-full">'
  );
  code = code.replace(
      /<div className="w-full bg-\[#111418\] min-h-screen text-white">/g,
      '<div className="font-technical dark w-full bg-[#111418] min-h-screen text-[#eceff4] text-base">'
  );
}

// Ensure the outer div has font-technical if we missed it
code = code.replace(/<div className="w-full bg-\[#1a1c22\] pt-24 pb-16">/, '<div className="w-full bg-[#1a1c22] pt-24 pb-16 font-technical">');


const newHero = `
 <div className="w-full relative z-10 pt-32 pb-32 sm:pt-40 sm:pb-40 bg-cover bg-center font-technical" style={{ backgroundImage: "linear-gradient(to right, rgba(17, 20, 24, 0.95), rgba(17, 20, 24, 0.7)), url('https://png.pngtree.com/thumb_back/fh260/background/20220729/pngtree-3d-man-presenting-faq-concept-concept-frequetly-asked-question-isolated-photo-image_19292830.jpg')" }}>
 <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
 <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
 <div className="flex items-center justify-center gap-3 mb-6">
 <span className="text-[#ef443b] font-mono text-sm font-bold uppercase tracking-[3px]">
 Support Center
 </span>
 <div className="hidden sm:block h-[1px] w-12 bg-[#ef443b]/30" />
 </div>

 <motion.h1
 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white mb-6 tracking-tight font-technical"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <span className="font-light block">Frequently Asked</span>
 <span className="font-bold text-[#ef443b] block mt-2">Questions</span>
 </motion.h1>

 <p className="text-[#a3a9b7] text-lg md:text-xl leading-relaxed mb-10 font-light max-w-2xl mx-auto font-technical">
 Find answers about file uploads, AI takeoff, cost calculation, and exporting quotes quickly and effortlessly.
 </p>

 <div className="flex h-14 w-full max-w-lg border border-white/20 rounded-md overflow-hidden bg-black/40 backdrop-blur-sm mx-auto shadow-2xl">
    <div className="flex-1 flex items-center px-4">
      <Search className="w-5 h-5 text-[#a3a9b7] mr-3" />
      <input
        type="text"
        placeholder="Search by topic or keyword..."
        className="w-full text-base font-light text-white placeholder-[#a3a9b7] focus:outline-none bg-transparent"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
    <button className="h-full px-8 bg-[#ef443b] text-white font-bold text-sm uppercase tracking-[1.5px] hover:bg-[#d83a31] transition-colors shadow-[0_0_20px_rgba(239,68,59,0.3)] hover:shadow-[0_0_30px_rgba(239,68,59,0.5)]">
      Search
    </button>
 </div>
 </div>
 </div>
 </div>
`;

code = code.replace(/\{\/\* HERO SECTION(.*?)\*\/\}\s*<div className="w-full bg-\[#1a1c22\](.*?)\s*\{\/\* MAIN CONTENT \*\/\}/s, `{/* HERO SECTION */}\n${newHero.trim()}\n\n        {/* MAIN CONTENT */}`);

// We also need to fix the specific hero div if regex fails
if (code.includes('w-full bg-[#1a1c22] pt-24 pb-16')) {
    code = code.replace(/<div className="w-full bg-\[#1a1c22\] pt-24 pb-16">[\s\S]*?\{\/\* MAIN CONTENT \*\/\}/m, newHero.trim() + "\n\n        {/* MAIN CONTENT */}");
}

// Redesign Cards
code = code.replace(/<div\s+className="[\s]*bg-\[#1a1c22\] border border-white\/10 rounded-xl p-8 hover:bg-\[#1e2128\] transition-colors cursor-pointer[\s]*"/g, '<div className="bg-[#1a1c22] border border-white/5 rounded-xl p-8 shadow-2xl text-white hover:border-white/10 transition-colors cursor-pointer">');
// Try another variant of class spacing
code = code.replace(/className="bg-\[#1a1c22\] border border-white\/10 rounded-xl p-8 hover:bg-\[#1e2128\] transition-colors cursor-pointer"/g, 'className="bg-[#1a1c22] border border-white/5 rounded-xl p-8 shadow-2xl text-white hover:border-white/10 transition-colors cursor-pointer"');

// Fix Category Sidebar styles if needed
code = code.replace(/className="w-full bg-\[#1a1c22\] border border-white\/10 rounded-xl overflow-hidden"/g, 'className="w-full bg-[#1a1c22] border-white/5 shadow-2xl rounded-xl overflow-hidden text-white"');

// Apply font technical globally where it might be lacking on Faq sections
code = code.replace(/text-gray-400 /g, 'text-[#a3a9b7] font-light text-[15px] leading-relaxed ');
code = code.replace(/text-\[#a3a9b7\] /g, 'text-[#a3a9b7] font-light text-[15px] leading-relaxed ');

// FAQ Content specific overrides - making titles technical and sleek
code = code.replace(/<h3 className="text-xl font-bold text-white mb-3">/g, '<h3 className="text-xl md:text-2xl font-bold text-white mb-3 font-technical tracking-tight">');
code = code.replace(/<h3 className="text-lg font-bold text-white mb-2">/g, '<h3 className="text-xl md:text-2xl font-bold text-white mb-3 font-technical tracking-tight">');
code = code.replace(/<p className="text-\[#a3a9b7\] text-sm md:text-base leading-relaxed">/g, '<p className="text-[#a3a9b7] font-light leading-relaxed text-[15px]">');

fs.writeFileSync('src/components/sections/FaqSection.tsx', code);
console.log("faq hero up");