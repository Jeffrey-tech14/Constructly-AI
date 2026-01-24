// src/components/sections/Hero.tsx
import { PlayCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Updated theme using your brand colors
const THEME = {
  HERO_BG: "#000B29", // Keep dark for contrast
  OVERLAY: "rgba(0, 11, 41, 0.65)", // Slightly lighter for better text legibility
  BRAND_BLUE: "#0067b1",
  ACCENT_GREEN: "#43b02a",
  TEXT_LIGHT: "#f0f9ff",
};

const openDemoVideo = () => {
  window.open("/Demo1.mp4", "_blank");
};

const Hero = ({ scrollTo }: any) => {
  const navigate = useNavigate();

  return (
    <div className="antialiased text-white selection:bg-[#43b02a] selection:text-white bg-[#000B29] relative">
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0.6; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.3; }
        }
        @keyframes pulse-node {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.6; }
        }
        .animate-scan-line {
          animation: scan-line 3.5s infinite ease-in-out;
        }
        .animate-pulse-node {
          animation: pulse-node 2.2s infinite ease-in-out;
        }
      `}</style>

      <section className="relative h-auto min-h-[550px] lg:h-[80vh] w-full overflow-hidden flex items-center pt-20 pb-16 lg:py-0 border-b border-white/10">
        {/* Background Image + Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            alt="Construction professionals reviewing blueprints"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: THEME.OVERLAY }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full lg:w-[65%] text-center lg:text-left mx-auto lg:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase mb-3 lg:mb-4 text-[#43b02a]">
                THE SOLUTION
              </p>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light leading-tight mb-4 lg:mb-5 tracking-tight text-white">
                Generate Accurate Quotes
                <br />
                <span className="font-light">In Minutes.</span>
              </h1>

              <p className="text-sm text-white/90 max-w-lg mx-auto lg:mx-0 mb-6 leading-relaxed font-medium">
                Generate and edit precise quotes. Connect workflows, validate
                costs, and produce automated takeoffs with 99.9% accuracy.
              </p>

              <div className="w-12 h-0.5 bg-[#43b02a] mb-6 mx-auto lg:mx-0 opacity-90"></div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6">
                <motion.button
                  whileHover={{
                    y: -3,
                    boxShadow: "0 6px 16px rgba(67, 176, 42, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openDemoVideo}
                  className="bg-[#43b02a] text-white text-[11px] font-black uppercase tracking-wider px-7 py-3 rounded-full flex items-center justify-center gap-2 shadow-md hover:bg-[#3a9a25] transition-all duration-300"
                >
                  <PlayCircle className="w-4 h-4" />
                  Watch Demo
                </motion.button>

                <motion.button
                  whileHover={{
                    y: -3,
                    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/auth?mode=signup")}
                  className="bg-white text-[#0067b1] text-[11px] font-black uppercase tracking-wider px-7 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors duration-300 shadow-md"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4 text-[#43b02a]" />
                </motion.button>
              </div>

              <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">
                Trusted by 500+ Top Construction Firms
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
