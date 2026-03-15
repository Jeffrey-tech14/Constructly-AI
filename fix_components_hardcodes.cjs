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

  // Let tailwind variables do the work
  content = content.replace(/bg-white\s+dark:bg-\[#111418\]/g, 'bg-card');
  content = content.replace(/bg-white\s+dark:bg-\[#1a1b22\]/g, 'bg-card');
  content = content.replace(/bg-white\s+dark:bg-gray-[789]00/g, 'bg-card');
  
  content = content.replace(/border-gray-200\s+dark:border-\[#2a2d35\]/g, 'border-border');
  content = content.replace(/border-gray-200\s+dark:border-gray-[678]00/g, 'border-border');
  
  content = content.replace(/text-gray-900\s+dark:text-white/g, 'text-foreground');
  content = content.replace(/text-\[#1a1a1a\]\s+dark:text-\[#eceff4\]/g, 'text-foreground');
  
  if (content !== oldContent) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    updated++;
  }
});
console.log(`Updated ${updated} files.`);
