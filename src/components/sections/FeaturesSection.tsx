// src/components/sections/FeaturesSection.tsx
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Globe, Database } from "lucide-react";

// --- 1. GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; }
  `}</style>
);

// --- ENGINEERING THEME ---
const THEME = {
  NAVY: "#002d5c",
  ACCENT: "#5BB539",
  TEXT_MAIN: "#1a1a1a",
  BG_GRAY: "#fcfcfc",
  BORDER: "#d1d5db"
};

// --- GRAPHICS (unchanged) ---
const GlobeGraphic = () => (
  <div className="relative w-32 h-32 md:w-40 md:h-40">
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#002d5c] to-[#001a35] shadow-xl"></div>
    <svg
      className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay"
      viewBox="0 0 100 100"
    >
      <circle cx="50" cy="50" r="49" fill="none" stroke="white" strokeWidth="0.5" />
      <path d="M50 1 L50 99 M1 50 L99 50" stroke="white" strokeWidth="0.5" fill="none" />
      <ellipse
        cx="50"
        cy="50"
        rx="49"
        ry="20"
        fill="none"
        stroke="white"
        strokeWidth="0.5"
        className="rotate-45 origin-center"
      />
    </svg>
    <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-[#5BB539] rounded-full animate-pulse"></div>
    <div className="absolute top-1/2 -left-2 bg-white text-[8px] font-bold text-[#002d5c] px-2 py-0.5 border border-gray-200 uppercase tracking-wider shadow-sm">
      Phase: AI Scan
    </div>
  </div>
);

const MonitorGraphic = () => (
  <div className="relative w-40 md:w-48">
    <div className="bg-[#1a1a1a] p-1 border border-black shadow-lg">
      <div className="bg-[#002d5c] relative overflow-hidden aspect-[16/10]">
        <div className="h-2 bg-[#001a35] w-full flex items-center px-1 space-x-1">
          <div className="w-0.5 h-0.5 rounded-full bg-red-400"></div>
          <div className="w-0.5 h-0.5 rounded-full bg-yellow-400"></div>
        </div>
        <div className="p-2 grid grid-cols-2 gap-1 opacity-50">
          <div className="h-6 bg-white/20 border border-white/10"></div>
          <div className="h-6 bg-white/10 border border-white/10"></div>
          <div className="col-span-2 h-3 bg-white/10"></div>
        </div>
      </div>
    </div>
    <div className="w-8 h-3 bg-[#1a1a1a] mx-auto"></div>
    <div className="w-12 h-0.5 bg-black/20 mx-auto"></div>
  </div>
);

const CommunityGraphic = () => (
  <div className="w-full h-full bg-[#001021] relative flex flex-col items-center justify-center overflow-hidden">
    <img
      className="absolute inset-0 w-full h-full object-cover opacity-80"
      src="https://wpmedia.roomsketcher.com/content/uploads/2022/01/05101816/RoomSketcher-Custom-2D-Floor-Plan-Branding.jpg"
      alt="Estimation Workflow"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#001021]/95 via-[#001021]/50 to-transparent pointer-events-none" />
    
    <div className="relative z-10 mb-8 scale-90">
      <div className="px-6 py-2 border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl flex items-center gap-2">
        <span className="text-white font-technical font-bold text-lg drop-shadow-md uppercase tracking-wide">
          J-Tech <span className="text-[#5BB539]">Estimator</span>
        </span>
      </div>
    </div>

    <div className="flex gap-6 text-white/70 relative z-10 drop-shadow-md">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m4.242 0l-.707.707m4.242 0l-.707-.707M12 19v-1" /></svg>
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </div>
  </div>
);

// --- PROP INTERFACE ---
interface FeaturesSectionProps {
  scrollTo: (sectionId: string) => void;
}

// --- MAIN COMPONENT ---
export default function FeaturesSection({ scrollTo }: FeaturesSectionProps) {
  const goToHowItWorks = () => {
    scrollTo("how-it-works");
  };

  const goToContact = () => {
    scrollTo("contact");
  };

  return (
    <>
      <GlobalStyles />
      <section
        id="features"
        className="w-full py-24 bg-white font-technical text-[#1a1a1a] overflow-hidden scroll-mt-24 border-b border-[#d1d5db]"
      >
        <div className="max-w-[1200px] mx-auto px-6">
          
          {/* =========================================
              SECTION 1: WORKFLOW OVERVIEW
          ========================================= */}
          <div className="flex flex-col md:flex-row items-center gap-16 mb-32 border-b border-[#e5e7eb] pb-24">
            
            <motion.div
              className="w-full md:w-1/2 h-[340px] overflow-hidden shadow-2xl border border-[#d1d5db]"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <CommunityGraphic />
            </motion.div>

            <motion.div
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                 <span className="bg-[#002d5c] text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">Estimation Pipeline</span>
                 <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[2px]">4-Step Automation</span>
              </div>

              <h2 className="text-4xl leading-[1.1] text-[#001021] mb-6 tracking-tight">
                <span className="font-light block">Get Quotes in Minutes,</span>
                <span className="font-extrabold text-[#002d5c] block mt-1">Not Hours</span>
              </h2>
              
              <p className="text-gray-500 text-[15px] leading-relaxed mb-10 max-w-md font-medium">
                Skip manual takeoffs and error-prone spreadsheets. Upload your plans,
                and let our AI-powered engine extract quantities, apply rates, and generate
                professional estimates — automatically.
              </p>
              
              <button 
                onClick={goToHowItWorks}
                className="bg-[#002d5c] text-white px-8 py-4 text-[11px] font-black uppercase tracking-[2px] hover:bg-[#001a35] transition-all shadow-lg flex items-center gap-2 group"
              >
                Access Workflow Details <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* =========================================
              SECTION 2: CORE CAPABILITIES
          ========================================= */}
          <div className="w-full">
            
            <motion.div
              className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div>
                 <h2 className="text-3xl font-light text-[#1a1a1a] mb-1">
                    Intelligent <span className="font-extrabold text-[#002d5c]">Estimation Engine</span>
                 </h2>
                 <p className="text-sm text-gray-500 font-medium">
                    End-to-end automation from file upload to client-ready quote.
                 </p>
              </div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                 Based on Your Workflow
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* CARD 1: AI ANALYSIS */}
              <motion.div
                className="bg-white border border-[#d1d5db] border-t-4 border-t-[#002d5c] relative overflow-hidden min-h-[300px] group shadow-sm hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-10 h-full flex flex-col justify-between relative z-20">
                  <div className="max-w-[65%]">
                    <div className="flex items-center gap-2 mb-4 text-gray-400">
                       <Globe className="w-3 h-3" />
                       <span className="text-[9px] font-mono block tracking-widest uppercase">PHASE // 02</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#002d5c] mb-4 uppercase tracking-tight">
                      AI-Powered Plan Analysis
                    </h3>
                    <p className="text-gray-500 text-[13px] leading-relaxed mb-8 font-medium">
                      Our engine scans uploaded PDFs, DWGs, or images to identify walls,
                      openings, and annotations — then extracts measurable quantities with precision.
                    </p>
                  </div>

                  <button 
                    onClick={goToHowItWorks}
                    className="w-fit bg-[#002d5c] text-white px-6 py-3 text-[10px] font-black uppercase tracking-[2px] hover:bg-[#001a35] transition-all flex items-center gap-2 shadow-md"
                  >
                    Learn More <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="absolute bottom-6 right-6 transform group-hover:scale-105 transition-transform duration-500 z-10">
                  <GlobeGraphic />
                </div>
              </motion.div>

              {/* CARD 2: AUTO-CALC & EXPORT */}
              <motion.div
                className="bg-white border border-[#d1d5db] border-t-4 border-t-[#5BB539] relative overflow-hidden min-h-[300px] group shadow-sm hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="p-10 h-full flex flex-col justify-between relative z-20">
                  <div className="max-w-[65%]">
                    <div className="flex items-center gap-2 mb-4 text-gray-400">
                       <Database className="w-3 h-3" />
                       <span className="text-[9px] font-mono block tracking-widest uppercase">PHASE // 03-04</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#002d5c] mb-4 uppercase tracking-tight">
                      Auto-Calc & Export
                    </h3>
                    <p className="text-gray-500 text-[13px] leading-relaxed mb-8 font-medium">
                      Automatically computes material volumes, applies current unit rates,
                      and generates branded PDF quotes or Excel exports — ready for client delivery.
                    </p>
                  </div>

                  <button 
                    onClick={goToContact}
                    className="w-fit bg-[#002d5c] text-white px-6 py-3 text-[10px] font-black uppercase tracking-[2px] hover:bg-[#001a35] transition-all flex items-center gap-2 shadow-md"
                  >
                    Contact Technical Support <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

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