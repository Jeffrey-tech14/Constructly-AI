const fs = require('fs');
const glob = require('glob'); // Make sure glob is installed, but we can just use fs.readdirSync recursively
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src/pages');

let totalUpdated = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let oldContent = content;

  // Header text backgrounds
  content = content.replace(/bg-gradient-to-r from-primary via-indigo-[67]00 to-indigo-[89]00 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent/g, 'text-[#1a1a1a] dark:text-[#eceff4] tracking-tight');
  
  content = content.replace(/bg-gradient-to-r from-primary via-indigo-[67]00 to-indigo-[89]00 dark:from-white dark:via-blue-[45]00\s*dark:to-purple-[45]00 text-transparent bg-clip-text/g, 'text-[#4b5563] dark:text-gray-300');

  // Any other similar text gradient
  content = content.replace(/bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent/g, 'text-[#1a1a1a] dark:text-[#eceff4]');

  // Background gradients for full page or large sections
  content = content.replace(/bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800/g, 'bg-[#fcfdfd] dark:bg-[#08090b]');
  content = content.replace(/bg-gray-50 dark:bg-gray-900/g, 'bg-[#fcfdfd] dark:bg-[#08090b]');
  
  // Update standard card backgrounds to match dark mode UI
  content = content.replace(/dark:bg-gray-[89]00\/?\d*/g, 'dark:bg-[#111418]');
  content = content.replace(/dark:bg-gray-[78]00\/?\d*/g, 'dark:bg-[#1a1b22]'); // Sub surfaces

  content = content.replace(/dark:border-gray-[678]00\/?\d*/g, 'dark:border-[#2a2d35]');

  // The weird "glass" classes
  content = content.replace(/className="([^"]*)glass([^"]*)"/g, 'className="$1 $2"');
  
  // Font text
  content = content.replace(/text-gray-900 dark:text-white/g, 'text-[#1a1a1a] dark:text-[#eceff4]');
  

  if (content !== oldContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    totalUpdated++;
  }
});

console.log(`Updated ${totalUpdated} files.`);
