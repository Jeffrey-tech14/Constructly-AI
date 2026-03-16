const fs = require('fs');
let code = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

// The new hero section replacement with correct Platform User Guide text
const newHero = `
 <div className="w-full relative z-10 pt-24 pb-24 sm:pt-32 sm:pb-32 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(to right, rgba(17, 20, 24, 0.95), rgba(17, 20, 24, 0.7)), url('https://www.maticad.com/wp-content/uploads/2020/07/support_img_1_ok.jpg')" }}>
 <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
 <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
 <div className="flex items-center justify-center gap-3 mb-6">
 <span className="text-[#ef443b] font-mono text-sm font-bold uppercase tracking-[3px]">
 Documentation
 </span>
 <div className="hidden sm:block h-[1px] w-12 bg-[#ef443b]/30" />
 </div>

 <motion.h1
 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white mb-6 tracking-tight font-technical"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <span className="font-light block">Platform</span>
 <span className="font-bold text-[#ef443b] block mt-2">User Guide</span>
 </motion.h1>

 <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 font-light max-w-2xl mx-auto font-technical">
 Comprehensive manual on uploading plans, calculating costs, and building accurate quotes securely and effectively.
 </p>

 <a
 href="#guide-content"
 onClick={(e) => { e.preventDefault(); document.getElementById('guide-content')?.scrollIntoView({ behavior: 'smooth' }); }}
 className="h-14 px-10 flex items-center justify-center bg-[#ef443b] text-white font-bold text-sm uppercase tracking-[1.5px] hover:bg-[#d83a31] transition-all rounded-md mt-4 shadow-[0_0_20px_rgba(239,68,59,0.3)] hover:shadow-[0_0_30px_rgba(239,68,59,0.5)]"
 >
 Start Reading
 </a>
 </div>
 </div>
 </div>
`;

// Replace the old hero section again using a broad regex
code = code.replace(/<div className="w-full relative z-10 pt-24 pb-24 sm:pt-32 sm:pb-32 bg-cover bg-center"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newHero.trim());


code = code.replace(
    /<div className="dark w-full font-technical min-h-screen bg-\[#111111\] text-white ug-container">/g,
    '<div className="dark w-full font-technical min-h-screen bg-[#111418] text-[#eceff4] text-base ug-container">'
);

// Custom overrides for shadcn cards
code = code.replace(/<Card>/g, '<Card className="bg-[#1a1c22] border-white/5 shadow-2xl text-white hover:border-white/10 transition-colors">');
code = code.replace(/<Card className="([^"]*)">/g, (match, classes) => {
    if(classes.includes('bg-')) return match; 
    return `<Card className="${classes} bg-[#1a1c22] border-white/5 shadow-2xl text-white hover:border-white/10 transition-colors">`;
});

// Let's modify sidebar card
code = code.replace(/<Card className="sticky top-16">/g, '<Card className="sticky top-16 bg-[#1a1c22] border-white/5 text-white shadow-2xl">');
code = code.replace(/<Card className="sticky top-16 bg-\[#1a1c22\][^"]*">/g, '<Card className="sticky top-16 bg-[#1a1c22] border-white/5 text-white shadow-2xl">');

// Override default CardHeaders
code = code.replace(/<CardHeader>/g, '<CardHeader className="border-b border-white/5 pb-4">');

// Make text more legible and styled properly
code = code.replace(/text-gray-400 /g, 'text-[#9fa5b3] ');
code = code.replace(/bg-\[#111418\]/g, 'bg-[#15171c]');

// The <h1 className="... User Guide"> inside main needs font-technical and uniform styling
code = code.replace(
    /<h1 className="text-4xl font-bold bg-\[#15171c\] border-white\/5:from-primary dark:to-primary bg-clip-text text-transparent mb-4">\s*User Guide\s*<\/h1>/,
    '<h1 className="text-4xl font-bold text-white mb-4 tracking-tight"><span className="text-[#ef443b]">Platform</span> Documentation</h1>'
);
code = code.replace(
    /<h1 className="text-4xl font-bold bg-\[#111418\] border-white\/5:from-primary dark:to-primary bg-clip-text text-transparent mb-4">\s*User Guide\s*<\/h1>/,
    '<h1 className="text-4xl font-bold text-white mb-4 tracking-tight"><span className="text-[#ef443b]">Platform</span> Documentation</h1>'
);

fs.writeFileSync('src/components/UserGuide.tsx', code);
console.log("Updated Hero Section text back to Platform User Guide, applied sleek font styles globally.");
