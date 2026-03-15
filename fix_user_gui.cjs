const fs = require('fs');

try {
    let code = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

    // 1. Add import
    if (!code.includes('import PublicLayout')) {
        code = code.replace(
            /(import React[^;]+;)/,
            '$1\nimport PublicLayout from "@/components/PublicLayout";'
        );
    }

    // 2. Wrap return statement
    if (!code.includes('<PublicLayout>')) {
        code = code.replace(
            /return \(\s+<div className="([^"]*)">/g,
            'return (\n    <PublicLayout>\n      <div className="dark w-full">\n        <div className="$1">'
        );
    }

    // 3. Fix closing tags securely
    if (code.includes('  );\n};\n\nexport default UserGuide;')) {
        code = code.replace(
            /  \);\n};\n\nexport default UserGuide;/g,
            '        </div>\n      </div>\n    </PublicLayout>\n  );\n};\n\nexport default UserGuide;'
        );
    } else if (code.includes('  );\r\n};\r\n\r\nexport default UserGuide;')) {
         code = code.replace(
            /  \);\r\n};\r\n\r\nexport default UserGuide;/g,
            '        </div>\n      </div>\n    </PublicLayout>\n  );\n};\n\nexport default UserGuide;'
        );       
    }

    fs.writeFileSync('src/components/UserGuide.tsx', code);
    console.log("Success");
} catch(e) { console.error(e); }
