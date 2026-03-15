const fs = require('fs');
const glob = require('glob');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let orig = content;

  // Simple string replace for the class names on the JTech AI Logo
  content = content.replace(/className=\"h-\[40px\] w-auto/g, 'className=\"h-[24px] w-auto');
  content = content.replace(/className=\"h-10 w-auto/g, 'className=\"h-6 w-auto');
  content = content.replace(/className=\"h-8 w-auto/g, 'className=\"h-5 w-auto');
  content = content.replace(/className=\"h-\[50px\] w-auto/g, 'className=\"h-[30px] w-auto');
  content = content.replace(/className=\"h-12 w-auto/g, 'className=\"h-7 w-auto');
  content = content.replace(/className=\"w-10 h-10/g, 'className=\"w-6 h-6');

  // Also catch other variants
  content = content.replace(/h-\[40px\] w-auto/g, 'h-[24px] w-auto');
  content = content.replace(/h-8 w-auto/g, 'h-5 w-auto');
  
  // Custom for auth
  content = content.replace(/h-16 w-auto/g, 'h-10 w-auto');
  content = content.replace(/h-\[60px\] w-auto/g, 'h-[36px] w-auto');

  if (content !== orig) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}

const files = glob.sync('src/**/*.{tsx,ts,jsx,js,html}');
files.push('index.html');

let i = 0;
files.forEach(f => {
  if (fs.existsSync(f)) {
    processFile(f);
  }
});
