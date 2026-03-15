const fs = require('fs');

let content = fs.readFileSync('src/index.css', 'utf8');

// Replace light mode variables completely
content = content.replace(/--background: \d+ \d+% [^;]+;/g, "--background: 180 33% 99%;");
content = content.replace(/--foreground: \d+(?:\.\d+)? \d+% [^;]+;/g, "--foreground: 0 0% 10%; /* #1a1a1a */");
content = content.replace(/--card: \d+ \d+% [^;]+;/g, "--card: 0 0% 100%;");
content = content.replace(/--card-foreground: \d+(?:\.\d+)? \d+% [^;]+;/g, "--card-foreground: 0 0% 10%;");
content = content.replace(/--popover: \d+(?:\.\d+)? \d+% [^;]+;/g, "--popover: 180 33% 99%;");
content = content.replace(/--popover-foreground: \d+(?:\.\d+)? \d+% [^;]+;/g, "--popover-foreground: 0 0% 10%;");
content = content.replace(/--primary: \d+(?:\.\d+)? \d+(?:\.\d+)?% [^;]+;/g, "--primary: 1 85% 62%; /* #f0514e */");
content = content.replace(/--primary-foreground: \d+ \d+% [^;]+;/g, "--primary-foreground: 0 0% 100%;");
content = content.replace(/--radius: [^;]+;/g, "--radius: 0.25rem;");
content = content.replace(/--radius-auth-button: [^;]+;/g, "--radius-auth-button: 0.25rem;");

// Find to replace the `.dark` block safely:
const darkStart = content.indexOf('.dark {');
const darkEnd = content.indexOf('}', darkStart) + 1; // Assuming closing brace
if(darkStart > -1) {
  const replacement = `.dark {
      /* 🌙 DARK MODE - EXACT FRONTEND MATCH */
      --background: 220 16% 4%; /* #08090b */
      --foreground: 220 25% 95%; /* #eceff4 */
      
      --card: 216 18% 8%; /* #14161a */
      --card-foreground: 220 25% 95%;
      
      --popover: 216 18% 8%;
      --popover-foreground: 220 25% 95%;
      
      --primary: 1 85% 62%; /* #f0514e */
      --primary-foreground: 0 0% 100%;
      
      --secondary: 216 18% 12%; 
      --secondary-foreground: 220 25% 95%;
      
      --muted: 216 18% 12%;
      --muted-foreground: 215 20% 65%;
      
      --accent: 1 85% 62%;
      --accent-foreground: 0 0% 100%;
      
      --destructive: 0 62% 30%;
      --destructive-foreground: 220 25% 95%;
      
      --border: 220 11% 19%; /* #2a2d35 */
      --input: 220 11% 19%;
      --ring: 1 85% 62%;
    }`;
    
  // Using simple slice to replace
  content = content.substring(0, darkStart) + replacement + content.substring(darkEnd);
}

fs.writeFileSync('src/index.css', content);
console.log("updated index.css");
