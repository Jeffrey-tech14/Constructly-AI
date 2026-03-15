const fs = require('fs');
let c = fs.readFileSync('src/components/sections/WhoItsForSection.tsx', 'utf8');

c = c.replace(
  '  Activity,\n} from "lucide-react";',
  '  Activity,\n  Globe,\n  Headphones,\n  GraduationCap,\n  MonitorSmartphone\n} from "lucide-react";'
);

const section3Start = '{/* SECTION 3: INDUSTRIAL SUPPORT */}';
const targetString = c.substring(c.indexOf(section3Start));

const newSection3 = `{/* SECTION 3: LICENSE CONFIGURATOR */}
      <section className="bg-gradient-to-r from-[#EA5342] via-[#F0743B] to-[#F49324] py-16 lg:py-24 text-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            
            <div className="w-full md:w-5/12 flex justify-center md:justify-end relative">
               <img 
                 src="https://www.pngplay.com/wp-content/uploads/9/Apple-iMac-Transparent-Background.png" 
                 alt="License Configurator" 
                 className="w-[85%] max-w-[500px] object-contain drop-shadow-2xl -rotate-2" 
               />
            </div>

            <div className="w-full md:w-7/12 flex flex-col items-center md:items-start text-center md:text-left">
               <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-light mb-6 leading-[1.2] tracking-tight text-white drop-shadow-sm">
                 Let us guide you to the right plan<br className="hidden md:block"/> in less than a minute.
               </h2>
               
               <p className="font-bold mb-10 text-sm md:text-base tracking-wide">
                 What do you need JTech AI for?
               </p>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-10 mb-10 w-full max-w-2xl">
                  <div className="flex flex-col items-center gap-3 w-28 text-center group cursor-pointer">
                     <div className="w-16 h-16 rounded-full bg-[#5E4E7A] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg border border-white/10">
                        <Globe className="w-7 h-7 text-white" strokeWidth={1.5} />
                     </div>
                     <span className="text-[12px] font-bold leading-tight">Remote Access</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 w-28 text-center group cursor-pointer">
                     <div className="w-16 h-16 rounded-full bg-[#5E4E7A] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg border border-white/10">
                        <Headphones className="w-7 h-7 text-white" strokeWidth={1.5} />
                     </div>
                     <span className="text-[12px] font-bold leading-tight">Technical Support</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 w-28 text-center group cursor-pointer">
                     <div className="w-16 h-16 rounded-full bg-[#5E4E7A] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg border border-white/10">
                        <GraduationCap className="w-7 h-7 text-white" strokeWidth={1.5} />
                     </div>
                     <span className="text-[12px] font-bold leading-tight">Education or Research</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-3 w-28 text-center group cursor-pointer">
                     <div className="w-16 h-16 rounded-full bg-[#5E4E7A] flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg border border-white/10">
                        <MonitorSmartphone className="w-7 h-7 text-white" strokeWidth={1.5} />
                     </div>
                     <span className="text-[12px] font-bold leading-tight">Managing Remote Devices</span>
                  </div>
               </div>

               <button className="bg-white text-[#EA5342] px-8 py-3.5 rounded-md text-[13px] font-extrabold tracking-wide shadow-xl hover:bg-[#ffeceb] transition-colors">
                  Try the License Configurator
               </button>
            </div>
        </div>
      </section>
    </div>
  );
}`;

c = c.replace(targetString, newSection3);
fs.writeFileSync('src/components/sections/WhoItsForSection.tsx', c);
