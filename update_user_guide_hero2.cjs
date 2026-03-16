const fs = require('fs');
let code = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

// The new hero section
const newHero = `
 <div className="w-full relative z-10 pt-24 pb-24 sm:pt-32 sm:pb-32 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.5)), url('https://www.maticad.com/wp-content/uploads/2020/07/support_img_1_ok.jpg')" }}>
 <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
 <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
 <div className="flex items-center justify-center gap-3 mb-4">
 <span className="text-[#ef443b] font-mono text-sm font-bold uppercase tracking-[1px]">
 High Performance Construction Estimation
 </span>
 </div>

 <motion.h1
 className="text-4xl md:text-5xl lg:text-7xl text-white mb-6 font-bold tracking-tight leading-tight"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 Industry-leading High Speed<br/>and Accurate Construction<br/>Estimation Software
 </motion.h1>

 <a
 href="#guide-content"
 onClick={(e) => { e.preventDefault(); document.getElementById('guide-content')?.scrollIntoView({ behavior: 'smooth' }); }}
 className="h-12 px-8 flex items-center justify-center bg-[#ef443b] text-white font-bold text-sm tracking-[1px] hover:bg-[#d83a31] transition-colors rounded-md mt-6"
 >
 Start Business Trial
 </a>
 </div>
 </div>
 </div>
`;

// Replace the old hero section
code = code.replace(/<div className="w-full relative z-10 pt-12 pb-12 sm:pt-16 sm:pb-16">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, newHero.trim());

const iconColors = [
  'text-blue-500', 'text-indigo-500', 'text-purple-500', 
  'text-orange-500', 'text-cyan-500', 'text-pink-500', 
  'text-yellow-500', 'text-teal-500', 'text-rose-500'
];
let colorIndex = 0;

// Replace <Icon className="w-5 h-5 text-[#ef443b]" />
code = code.replace(/<([A-Z][a-zA-Z0-9]*)\s+className="([^"]*)text-\[#ef443b\]([^"]*)"/g, (match, iconName, pre, post) => {
  if (iconName === 'CheckCircle2' || iconName === 'Check' || iconName === 'CheckCircle') {
    return `<${iconName} className="${pre}text-green-500${post}"`;
  }
  const color = iconColors[colorIndex % iconColors.length];
  colorIndex++;
  return `<${iconName} className="${pre}${color}${post}"`;
});

// Also make sure text colors for the active tab aren't all getting lost if we need dark mode
// It seems "everything to be in dark mode" might mean adding dark class or bg-[#141414]. 
// UserGuide currently has bg-[#141414] manually.

fs.writeFileSync('src/components/UserGuide.tsx', code);
console.log("Updated Hero Section and Icon Colors.");
