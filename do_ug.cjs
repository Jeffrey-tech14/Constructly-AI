const fs = require('fs');
let c = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

c = c.replace(/<div className="bg-\\[#f8f9fa\\] w-full min-h-screen">/, '<div className="bg-[#121212] w-full min-h-screen text-gray-200 font-technical antialiased">');

const newHero = '{/* Hero Section */}\n' +
'          <section className="relative bg-[#1a1a1a] text-white pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden border-b border-white/10">\n' +
'            {/* Pattern Background */}\n' +
'            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: \"radial-gradient(circle at center, #ffffff 1.5px, transparent 1.5px)\", backgroundSize: \"24px 24px\" }}></div>\n' +
'            \n' +
'            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent z-0" />\n' +
'            \n' +
'            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 flex flex-col items-center">\n' +
'              <div className="flex items-center gap-3 mb-8">\n' +
'                <span className="text-[#D85C2C] font-mono text-[11px] font-black uppercase tracking-[3px]">\n' +
'                  Documentation Hub\n' +
'                </span>\n' +
'                <div className="h-[1px] w-12 bg-[#D85C2C]/30" />\n' +
'              </div>\n' +
'              <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-6">\n' +
'                User <span className="font-bold text-[#D85C2C]">Guide</span>\n' +
'              </h1>\n' +
'              <p className="text-sm md:text-base text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">\n' +
'                Learn how to create accurate construction quotes using Constructly AI. Master automated BOQ generation, material scheduling, and professional estimates in minutes.\n' +
'              </p>\n' +
'            </div>\n' +
'          </section>';

c = c.replace(/\{\/\* Hero Section \*\/\}[\s\S]*?<\/section>/, newHero);

c = c.replace(/<Card className="border border-transparent hover:border-\\[#00356B\\]\/20 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl bg-white">/g, '<Card className="border border-[#333] hover:border-[#D85C2C]/50 shadow-sm transition-all duration-300 rounded-xl bg-[#1a1a1a]">');
c = c.replace(/bg-white/g, 'bg-[#1a1a1a]');

c = c.replace(/<TabsList className="flex flex-col h-auto bg-transparent space-y-1">/g, '<TabsList className="flex flex-col h-auto bg-transparent space-y-2">');

c = c.replace(/className="w-full justify-start px-4 py-3 text-left hover:bg-gray-50 data-\\[state=active\\]:bg-white data-\\[state=active\\]:shadow-sm data-\\[state=active\\]:text-\\[#00356B\\] rounded-lg transition-all duration-200"/g, 'className="w-full justify-start px-4 py-3 text-left hover:bg-[#222] data-[state=active]:bg-[#2a2a2a] data-[state=active]:shadow-md data-[state=active]:text-[#D85C2C] data-[state=active]:border data-[state=active]:border-[#D85C2C]/20 text-gray-400 rounded-lg transition-all duration-200"');

c = c.replace(/text-\\[#00356B\\]/g, 'text-gray-100');
c = c.replace(/text-gray-900/g, 'text-white');
c = c.replace(/text-gray-800/g, 'text-gray-200');
c = c.replace(/text-gray-700/g, 'text-gray-300');
c = c.replace(/text-gray-600/g, 'text-gray-400');
c = c.replace(/text-gray-500/g, 'text-gray-400');
c = c.replace(/bg-gray-50/g, 'bg-[#222]');
c = c.replace(/bg-gray-100/g, 'bg-[#333]');
c = c.replace(/border-gray-100/g, 'border-[#333]');
c = c.replace(/border-gray-200/g, 'border-[#444]');
c = c.replace(/border-blue-100/g, 'border-[#555]');
c = c.replace(/bg-blue-50\/50/g, 'bg-[#D85C2C]/5');
c = c.replace(/bg-blue-50/g, 'bg-[#D85C2C]/10');
c = c.replace(/bg-blue-100/g, 'bg-[#D85C2C]/20');
c = c.replace(/text-blue-600/g, 'text-[#D85C2C]');
c = c.replace(/text-blue-700/g, 'text-[#D85C2C]');

fs.writeFileSync('src/components/UserGuide.tsx', c);
