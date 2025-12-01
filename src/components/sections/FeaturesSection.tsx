// src/components/sections/FeaturesSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, Users, GraduationCap, ArrowRight
} from "lucide-react";

// --- 1. GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
  `}</style>
);

// --- 2. COMPACT GRAPHICS (RESIZED) ---

const GlobeGraphic = () => (
  <div className="relative w-40 h-40">
    {/* Main Blue Circle */}
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#005F9E] to-[#003865] shadow-xl"></div>
    {/* Grid Lines */}
    <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="49" fill="none" stroke="white" strokeWidth="1"/>
      <path d="M50 1 L50 99 M1 50 L99 50" stroke="white" strokeWidth="1" fill="none"/>
      <ellipse cx="50" cy="50" rx="49" ry="20" fill="none" stroke="white" strokeWidth="1" className="rotate-45 origin-center"/>
    </svg>
    {/* Highlight Dot */}
    <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
    {/* Small Floating Label */}
    <div className="absolute top-1/2 -left-2 bg-white text-[8px] font-bold text-[#003865] px-2 py-0.5 rounded shadow border border-gray-200">
      Zone: RV
    </div>
  </div>
);

const MonitorGraphic = () => (
  <div className="relative w-48">
    {/* Monitor Frame */}
    <div className="bg-[#001021] p-1.5 rounded shadow-xl border-b-2 border-[#001c36]">
      {/* Screen */}
      <div className="bg-[#005F9E] relative overflow-hidden rounded aspect-[16/10]">
         {/* UI Header */}
         <div className="h-3 bg-[#003865] w-full flex items-center px-1.5 space-x-1">
            <div className="w-1 h-1 rounded-full bg-red-400"></div>
            <div className="w-1 h-1 rounded-full bg-yellow-400"></div>
         </div>
         {/* Blue Content Mockup */}
         <div className="p-2 grid grid-cols-2 gap-1 opacity-60">
            <div className="h-8 bg-white/20 rounded"></div>
            <div className="h-8 bg-white/10 rounded border border-white/20"></div>
            <div className="col-span-2 h-4 bg-white/10 rounded"></div>
         </div>
      </div>
    </div>
    {/* Stand */}
    <div className="w-10 h-4 bg-[#001021] mx-auto"></div>
    <div className="w-16 h-1 bg-[#001021]/20 mx-auto rounded-full blur-[1px]"></div>
  </div>
);

const CommunityGraphic = () => (
  <div className="w-full h-full bg-[#001021] relative flex flex-col items-center justify-center overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[60%] bg-[#005F9E] blur-[80px] opacity-25" />
    
    {/* Pill Button */}
    <div className="relative z-10 mb-8 scale-90">
      <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl flex items-center gap-2">
        <span className="text-white font-inter font-bold text-lg">
          J-Tech <span className="text-[#005F9E]">Community</span>
        </span>
      </div>
      {/* Hand Cursor */}
      <div className="absolute -bottom-8 -right-6 text-white drop-shadow-lg">
         <svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zM16.03 12.35L17.5 12c-.17-1.93-1.84-3.5-3.89-3.5C12.28 8.5 11.28 8.9 10.5 9.57V7.5C10.5 6.67 9.83 6 9 6s-1.5.67-1.5 1.5v8l4.37 8.16c.39.73 1.25 1.09 2.06.87l5.95-1.59c.77-.21 1.34-.87 1.43-1.66l.6-5.41c.07-.63-.25-1.22-.82-1.46-.37-.16-.76-.18-1.06-.06z"/></svg>
      </div>
    </div>

    {/* Small Icons */}
    <div className="flex gap-6 text-white/50 relative z-10">
      <MessageSquare className="w-5 h-5" />
      <Users className="w-6 h-6 text-white/80 -mt-1" />
      <GraduationCap className="w-5 h-5" />
    </div>
  </div>
);

// --- 3. MAIN COMPONENT ---

export default function FeaturesSection() {
  return (
    <>
      <GlobalStyles />
      {/* ✅ KEY FIX IS HERE:
         1. id="features" -> Allows navbar to find this section.
         2. scroll-mt-32 -> Adds margin-top when scrolling so the fixed navbar doesn't cover the content.
      */}
      <section 
        id="features"
        className="w-full py-20 bg-white font-inter text-[#1a1a1a] overflow-hidden scroll-mt-32"
      >
        <div className="max-w-[1100px] mx-auto px-6">
          
          {/* SECTION 1: COMMUNITY (Dark Box Left, Text Right) */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-32">
            
            {/* Visual Box */}
            <motion.div 
              className="w-full md:w-1/2 h-[320px] rounded-xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <CommunityGraphic />
            </motion.div>

            {/* Text Content */}
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-extrabold text-[#001021] mb-5 leading-tight">
                Get Support Through the <br/> J-Tech Community
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                The J-Tech Community connects you with support engineers, fellow students, and experienced users — all ready to help you tackle technical challenges.
              </p>
              <button className="bg-[#001021] text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest rounded hover:bg-[#005F9E] transition-colors shadow-md">
                Join the Community
              </button>
            </motion.div>
          </div>


          {/* SECTION 2: TOOLS GRID */}
          <div className="w-full">
            <motion.h2 
              className="text-center text-2xl font-bold text-gray-800 mb-12"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Online Tools to Streamline Your Workflow
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CARD 1: GLOBAL TAKEOFF */}
              <motion.div 
                className="bg-[#F5F7FA] rounded-lg relative overflow-hidden min-h-[300px] group border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-8 h-full flex flex-col justify-between relative z-20">
                  {/* Text Container: Max width 60% to leave room for graphic */}
                  <div className="max-w-[60%]">
                    <h3 className="text-xl font-bold text-[#001021] mb-3">
                      Global Takeoff Tool
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      Easily determine material quantities and regional pricing. Our interactive zone maps deliver precise data in seconds.
                    </p>
                  </div>
                  
                  <button className="w-fit bg-transparent border border-[#001021] text-[#001021] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#001021] hover:text-white transition-all">
                    Discover Tool
                  </button>
                </div>
                
                {/* Graphic: Pinned Bottom Right, contained inside card */}
                <div className="absolute bottom-6 right-6 transform group-hover:scale-105 transition-transform duration-500 z-10">
                   <GlobeGraphic />
                </div>
              </motion.div>


              {/* CARD 2: MATERIAL DATABASE */}
              <motion.div 
                className="bg-[#F5F7FA] rounded-lg relative overflow-hidden min-h-[300px] group border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="p-8 h-full flex flex-col justify-between relative z-20">
                  {/* Text Container */}
                  <div className="max-w-[60%]">
                    <h3 className="text-xl font-bold text-[#001021] mb-3">
                      Material Database
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      Access online tables to easily find cross-section properties for steel and timber sections.
                    </p>
                  </div>
                  
                  <button className="w-fit bg-transparent border border-[#001021] text-[#001021] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-[#001021] hover:text-white transition-all">
                    Get Material Info
                  </button>
                </div>

                {/* Graphic: Pinned Bottom Right */}
                <div className="absolute bottom-8 right-6 transform group-hover:-translate-x-1 transition-transform duration-500 z-10">
                   <MonitorGraphic />
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </section>
    </>
  );
}