const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

// Replace page background
code = code.replace(/bg-\[#0a0a0a\]/g, 'bg-[#fcfdfd]');

// Replace container background
code = code.replace(/bg-\[#1a1c22\]/g, 'bg-white');

// Replace input backgrounds
code = code.replace(/bg-\[#15171c\]/g, 'bg-[#f2f6f9]');

// Replace divider and border colors
code = code.replace(/border-white\/10/g, 'border-gray-200');
code = code.replace(/bg-\[#1a1c22\]\/10/g, 'bg-gray-100');

// Fix text colors in the forms without touching the blue overlay text
// The title "Create Account"
code = code.replace(/style=\{\{ color: "white" \}\}/g, 'className="text-[#1a1a1a]"');

// "Use your email for registration"
code = code.replace(/text-\[#a3a9b7\]/g, 'text-gray-500');

// Replace eye icon text color from white to gray
code = code.replace(/text-white \//g, 'text-gray-500 /');
code = code.replace(/text-white hover:text-white\/80/g, 'text-gray-400 hover:text-gray-600');

fs.writeFileSync('src/pages/Auth.tsx', code);
console.log('Auth.tsx altered.');
