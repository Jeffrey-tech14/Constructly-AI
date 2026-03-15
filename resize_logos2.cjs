const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.tsx') || dirPath.endsWith('.html') || dirPath.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let orig = content;

  // Simple string replace for the class names on any Logo
  
  // Height specific replaces:
  content = content.replace(/h-\[40px\](?=\s+w-auto)/g, 'h-[24px]');
  content = content.replace(/h-10(?=\s+w-auto)/g, 'h-6');
  content = content.replace(/h-8(?=\s+w-auto)/g, 'h-5');
  content = content.replace(/h-\[50px\](?=\s+w-auto)/g, 'h-[30px]');
  content = content.replace(/h-12(?=\s+w-auto)/g, 'h-7');
  content = content.replace(/h-16(?=\s+w-auto)/g, 'h-10');
  content = content.replace(/h-\[60px\](?=\s+w-auto)/g, 'h-[36px]');
  
  // Custom instances from grep
  // h-8 w-auto rounded-sm object-contain -> h-5 w-auto
  content = content.replace(/h-8 w-auto rounded-sm object-contain/g, 'h-5 w-auto rounded-sm object-contain');

  // Any other h-[] w-auto
  
  if (content !== orig) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
}

walkDir('./src', processFile);
if (fs.existsSync('./index.html')) {
  processFile('./index.html');
}
