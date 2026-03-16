const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// Use regex to catch the malformed blocks
content = content.replace(/if \(!profile\) {[\s\S]*?if \(localDashboardLoading\)/, 
\if (!profile) {
    return (
      <div className="min-h-screen bg-[#111418] flex flex-col items-center justify-center p-4"><div className="relative w-24 h-24 mb-10"><div className="absolute inset-0 rounded-full border-4 border-[#0e1014]"></div><div className="absolute inset-0 rounded-full border-4 border-[#ef443b] border-t-transparent animate-spin"></div><div className="absolute inset-2 rounded-full border-4 border-[#ef443b]/30 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div></div><h2 className="text-[#eceff4] text-xl font-bold tracking-[0.2em] uppercase mb-3 animate-pulse">Initializing Setup</h2><p className="text-[#a3a9b7] text-sm tracking-wide">Syncing workspaces...</p></div>
    );
  }

  // Now safe to use profile — it's guaranteed non-null
  if (localDashboardLoading)\);

content = content.replace(/if \(localDashboardLoading\) {[\s\S]*?return \(/,
\if (localDashboardLoading) {
    return (
      <div className="min-h-screen bg-[#111418] flex flex-col items-center justify-center p-4"><div className="relative w-24 h-24 mb-10"><div className="absolute inset-0 rounded-full border-4 border-[#0e1014]"></div><div className="absolute inset-0 rounded-full border-4 border-[#ef443b] border-t-transparent animate-spin"></div><div className="absolute inset-2 rounded-full border-4 border-[#ef443b]/30 border-b-transparent animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div></div><h2 className="text-[#eceff4] text-xl font-bold tracking-[0.2em] uppercase mb-3 animate-pulse">Loading Dashboard</h2><p className="text-[#a3a9b7] text-sm tracking-wide">Fetching recent quotes...</p></div>
    );
  }

  return (\);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
