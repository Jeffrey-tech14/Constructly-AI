const fs = require('fs');
const code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

// Find all properties inside JSX tags
const tags = code.match(/<[^>]+>/g) || [];
for (const tag of tags) {
    const classNames = tag.match(/className=/g);
    if (classNames && classNames.length > 1) {
        console.log("Found duplicate className in tag:\n", tag);
    }
}
