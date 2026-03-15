const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('sections')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.tsx') && !file.includes('sections')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src/pages').concat(walk('src/components'));

let updated = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let oldContent = content;

  // Flatten all gradient texts
  content = content.replace(/bg-gradient-to-[a-z]+ [^"]*bg-clip-text[^"]*text-transparent/g, 'text-[#1a1a1a] dark:text-[#eceff4] tracking-tight');
  content = content.replace(/bg-clip-text[^"]*text-transparent[^"]*bg-gradient-to-[a-z]+ [^"]*/g, 'text-[#1a1a1a] dark:text-[#eceff4] tracking-tight');

  // Specific leftover texts
  content = content.replace(/bg-gradient-to-r from-blue-700 via-primary to-primary\/90 dark:from-white dark:via-white\s*dark:to-white bg-clip-text text-transparent/g, 'text-[#1a1a1a] dark:text-[#eceff4] tracking-tight');
  content = content.replace(/bg-gradient-to-r from-blue-700 via-primary to-primary\/90 dark:from-white dark:via-white dark:to-white\s*text-transparent\s*bg-clip-text/g, 'text-[#1a1a1a] dark:text-[#eceff4] tracking-tight');

  // Fix container backgrounds
  content = content.replace(/bg-gradient-to-[a-z]+ from-blue-[0-9]+ to-indigo-[0-9]+ dark:from-gray-[0-9]+ dark:to-gray-[0-9]+/g, 'bg-[#fcfdfd] dark:bg-[#111418]');

  content = content.replace(/bg-gray-100\s+dark:bg-gray-800/g, 'bg-[#f3f4f6] dark:bg-[#1a1b22]');
  content = content.replace(/bg-white\s+dark:bg-gray-800/g, 'bg-white dark:bg-[#111418]');
  content = content.replace(/border-gray-200\s+dark:border-gray-700/g, 'border-gray-200 dark:border-[#2a2d35]');
  
  if (content !== oldContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    updated++;
  }
});
console.log(`Updated ${updated} files using text gradients.`);
