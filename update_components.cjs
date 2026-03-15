const fs = require('fs');

const TARGET_PAGES = [
  'src/components/Navbar.tsx',
  'src/components/Reports.tsx',
  'src/components/QuotesTab.tsx',
  'src/components/DashboardSettings.tsx'
];

TARGET_PAGES.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');

    content = content.replace(/bg-gray-50/g, 'bg-[#08090b]');
    content = content.replace(/bg-gray-100/g, 'bg-[#14161a]');
    content = content.replace(/bg-gray-200/g, 'bg-[#1a1c1e]');
    content = content.replace(/bg-white/g, 'bg-[#14161a]');
    
    content = content.replace(/border-gray-200/g, 'border-white/10');
    content = content.replace(/border-gray-300/g, 'border-white/20');
    content = content.replace(/border-gray-100/g, 'border-white/5');

    content = content.replace(/text-gray-900/g, 'text-[#eceff4]');
    content = content.replace(/text-gray-800/g, 'text-[#f0f2f6]');
    content = content.replace(/text-gray-700/g, 'text-gray-300');
    content = content.replace(/text-gray-600/g, 'text-gray-400');
    content = content.replace(/text-gray-500/g, 'text-gray-500');

    content = content.replace(/text-primary/g, 'text-[#f0514e]');
    
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated ' + f);
  }
});
