const fs = require('fs');

const TARGET_PAGES = [
  'src/pages/Dashboard.tsx',
  'src/pages/ViewAllQuotes.tsx',
  'src/pages/UploadPage.tsx',
  'src/pages/QuoteBuilder.tsx',
  'src/pages/AdminDashboard.tsx',
  'src/pages/Variables.tsx',
  'src/components/AdminLayout.tsx'
];

TARGET_PAGES.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');

    // Make the background dark, like the hero section
    content = content.replace(/bg-gray-50/g, 'bg-[#08090b]');
    content = content.replace(/bg-gray-100/g, 'bg-[#14161a]');
    content = content.replace(/bg-white/g, 'bg-[#14161a]');
    
    // Borders
    content = content.replace(/border-gray-200/g, 'border-white/10');
    content = content.replace(/border-gray-100/g, 'border-white/5');

    // Text colors
    content = content.replace(/text-gray-900/g, 'text-[#eceff4]');
    content = content.replace(/text-gray-800/g, 'text-[#f0f2f6]');
    content = content.replace(/text-gray-700/g, 'text-gray-300');
    content = content.replace(/text-gray-600/g, 'text-gray-400');
    content = content.replace(/text-gray-500/g, 'text-gray-500');

    // Fonts - we want Outfit
    content = content.replace(/font-bold/g, 'font-bold font-["Outfit"] tracking-wide');
    content = content.replace(/font-semibold/g, 'font-semibold font-["Outfit"] tracking-wide');

    // Accents to Brand Red
    content = content.replace(/text-primary/g, 'text-[#f0514e]');
    content = content.replace(/bg-primary\\/10/g, 'bg-[#f0514e]/10');
    content = content.replace(/bg-primary\\/5/g, 'bg-[#f0514e]/5');

    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated ' + f);
  }
});
