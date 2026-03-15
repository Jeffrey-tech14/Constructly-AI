/* Patching index.css directly for global dark mode */
const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Update global background/foreground pairs
css = css.replace(/--background: \d+ \d+% \d+%; \/\* #fcfdfd \*\//, '--background: 220 16% 4%;');
css = css.replace(/--foreground: 0 0% 10%; \/\* #1a1a1a \*\//, '--foreground: 220 14% 96%;');

css = css.replace(/--card: 0 0% 100%; \/\* #ffffff \*\//, '--card: 220 13% 9%;');
css = css.replace(/--card-foreground: 0 0% 10%;/, '--card-foreground: 220 14% 96%;');

css = css.replace(/--popover: 0 0% 100%;/, '--popover: 220 13% 9%;');
css = css.replace(/--popover-foreground: 0 0% 10%;/, '--popover-foreground: 220 14% 96%;');

css = css.replace(/--muted: 210 40% 98%;/g, '--muted: 215 20% 15%;');

fs.writeFileSync('src/index.css', css, 'utf8');
console.log('index.css updated');
