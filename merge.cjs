const fs = require('fs');
let text = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

// Ensure extra icons are imported
if (!text.includes('DollarSign')) {
  text = text.replace('Layers,', 'Layers, DollarSign, User, CreditCard, FileText, Heart,');
}

const sectionsStart = text.indexOf('const guideSections: GuideSection[] = [');
const returnIdx = text.indexOf('return (', sectionsStart);

if (sectionsStart > 0 && returnIdx > 0) {
  const newSections = fs.readFileSync('temp_sections_dark.tsx', 'utf8');
  const result = text.substring(0, sectionsStart) + newSections + '\n  ' + text.substring(returnIdx);
  fs.writeFileSync('src/components/UserGuide.tsx', result, 'utf8');
  console.log('Replaced successfully');
} else {
  console.log('Could not find indices', sectionsStart, returnIdx);
}
