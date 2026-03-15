const fs = require('fs');
let c = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

if (!c.includes('import PublicLayout')) {
    c = c.replace('import React, { useState } from "react";', 'import React, { useState } from "react";\nimport PublicLayout from "@/components/PublicLayout";\nimport { motion } from "framer-motion";');
}

// Wrap in PublicLayout and explicitly set dark mode background tracking
c = c.replace(/return \(\s*<div className="min-h-screen py-12 px-4">/, 
eturn (
    <PublicLayout>
      <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-technical antialiased transition-colors duration-300">
        {/* HERO SECTION */}
        <div className="w-full bg-[#1a1a1a] relative border-b border-[#333] mb-12">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#141414] z-0"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center flex flex-col items-center">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#D85C2C] font-mono text-[10px] font-bold uppercase tracking-[3px]">
                Documentation Hub
              </span>
              <div className="h-[1px] w-12 bg-[#D85C2C]/30" />
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6"
            >
              Constructly AI <span className="text-[#D85C2C]">User Guide</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              Master automated BOQ generation, Material Scheduling, and advanced measurement tools. Everything you need to know to create accurate construction quotes in minutes.
            </motion.p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 pb-20">);

c = c.replace(/\s*\);\s*};\s*export default UserGuide;\s*$/g, '\n      </div>\n    </PublicLayout>\n  );\n};\n\nexport default UserGuide;');

// Remove the old simple header block
c = c.replace(/\{\/\* Header \*\/\}\s*<div className="text-center mb-12">[\s\S]*?<\/div>\s*\{\/\* Main Content \*\/\}/, '{/* Main Content */}');

// Enhance some of the blue classes to the orange theme while retaining dark variants
c = c.replace(/bg-blue-600/g, 'bg-[#D85C2C]');
c = c.replace(/hover:bg-blue-700/g, 'hover:bg-[#b84520]');
c = c.replace(/text-blue-600/g, 'text-[#D85C2C]');
c = c.replace(/text-blue-700/g, 'text-[#c64c20]');
c = c.replace(/dark:from-blue-400/g, 'dark:from-[#FFA584]');
c = c.replace(/dark:to-blue-300/g, 'dark:to-[#ffbda5]');
c = c.replace(/bg-blue-50/g, 'bg-orange-50');
c = c.replace(/dark:bg-blue-900\/20/g, 'dark:bg-[#D85C2C]/10');
c = c.replace(/dark:bg-blue-950\/20/g, 'dark:bg-[#D85C2C]/5');
c = c.replace(/border-blue-200/g, 'border-orange-200');

fs.writeFileSync('src/components/UserGuide.tsx', c);
