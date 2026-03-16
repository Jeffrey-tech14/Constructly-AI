const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const loaderCode = \
      <div className="min-h-screen bg-[#111418] flex flex-col items-center justify-center p-4">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-[#0e1014]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#ef443b] border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-[#ef443b]/30 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <h2 className="text-[#eceff4] text-xl font-bold tracking-widest uppercase mb-2 animate-pulse">Initializing Dashboard</h2>
        <p className="text-[#a3a9b7] text-sm tracking-wide">Securely logging in...</p>
      </div>\;

content = content.replace(/<div className="min-h-screen flex items-center justify-center">[\s\S]*?<Loader2 className="animate-spin rounded-full h-8 w-8" \/>[\s\S]*?<\/div>/g, loaderCode);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
