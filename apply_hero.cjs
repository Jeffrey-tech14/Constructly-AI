const fs = require('fs');
let c = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

const returnStr = 'return (';
const idx = c.indexOf(returnStr);
if (idx !== -1) {
    const before = c.substring(0, idx);
    let after = c.substring(idx);
    
    // find the start of the layout flex flex-col md:flex-row gap-8 (the main content)
    const contentStart = after.indexOf('<div className="flex flex-col md:flex-row gap-8">');
    if (contentStart !== -1) {
        const afterContent = after.substring(contentStart);
        
        const newWrapper = eturn (
    <PublicLayout>
      <div className="bg-[#f8f9fa] w-full min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-[#00356B] text-white py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-blue-900/50 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#00356B] to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">User <span className="font-bold text-[#D85C2C]">Guide</span></h1>
            <p className="text-lg md:text-xl text-blue-100 font-medium max-w-2xl mx-auto leading-relaxed">
              Master JTech AI and learn how to create accurate, professional construction estimates in minutes.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-16 relative z-20">
          ;
          
        c = before + newWrapper + afterContent;
    }
}

fs.writeFileSync('src/components/UserGuide.tsx', c);
