import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
    .font-display { font-family: 'Outfit', sans-serif; }

    .hero-pattern {
      background: #111418;
      position: relative;
      z-index: 1;
    }

    .hero-pattern::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      /* AnyDesk style angled background */
      background: linear-gradient(105deg, #222831 0%, #222831 42%, transparent 42.2%);
      pointer-events: none;
      z-index: -2;
    }

    .hero-pattern::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(-75deg, #1a1e24 0%, #1a1e24 30%, transparent 30.2%);
      pointer-events: none;
      z-index: -2;
    }

    .hero-diagonal::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: -1;
      background: radial-gradient(circle at 70% 30%, rgba(240, 81, 78, 0.08), transparent 60%);
    }
  `}</style>
);

const Hero = ({ scrollTo }: any) => {
  const navigate = useNavigate();

  return (
    <section className="antialiased w-full relative font-display hero-pattern hero-diagonal overflow-hidden">
      <GlobalStyles />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-[136px] pb-12 sm:pt-[160px] sm:pb-16">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-8">

          {/* LEFT SIDE: Floating Graphic */}
          <div className="hidden md:flex w-full md:w-1/2 relative h-[300px] sm:h-[400px] lg:h-[470px] items-center justify-center -ml-10">
            <motion.div 
              className="relative w-full h-full z-10 flex items-center justify-center p-4 sm:p-8"
              initial={{ opacity: 0, scale: 0.6, x: -80, rotateY: 45, rotateZ: -10 }}
              animate={{ opacity: 1, scale: 1.1, x: 0, rotateY: 0, rotateZ: 0 }}
              transition={{ 
                duration: 1.6, 
                ease: [0.34, 1.56, 0.64, 1], // Boing effect
                delay: 4.4 
              }}
            >
              <motion.img
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                src="https://png.pngtree.com/png-vector/20240314/ourmid/pngtree-trendy-civil-engineering-png-image_11952952.png"
                alt="Civil Engineering Graphic" 
                className="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-[0_30px_60px_rgba(240,81,78,0.35)]"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ duration: 1.6, ease: "easeOut", delay: 4.6 }}
              className="absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-[25px] sm:h-[40px] bg-black blur-[28px] rounded-full pointer-events-none flex items-center justify-center z-0"
            >
              <div className="w-[85%] h-[60%] bg-[#f0514e]/40 blur-[20px] rounded-full"></div>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Content */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left pt-0 lg:pt-8 relative z-20">
            {/* Tagline pill */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 4.7 }}
              className="inline-flex items-center gap-2 px-3 py-1 lg:px-4 lg:py-1.5 rounded-full bg-white/[0.03] border border-white/15 text-[#ed6a32] text-xs sm:text-sm font-semibold mb-6 lg:mb-8 tracking-wide"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ed6a32] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ed6a32]"></span>
              </span>
              Next-Gen Construction Costing
            </motion.div>
            
            <motion.h1 
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 4.9 }}
              className="text-[2.2rem] sm:text-[3rem] md:text-[2.6rem] lg:text-[4rem] xl:text-[4.2rem] font-bold leading-[1.05] tracking-tight mb-6 flex flex-col md:block"
            >
              <span className="text-[#ed6a32] whitespace-nowrap">Generate Accurate</span> <br className="hidden md:block" />
              <span className="text-[#f0f2f6] font-normal">BOQ in Minutes</span>
            </motion.h1>

            <motion.p 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 5.1 }}
              className="text-lg sm:text-xl md:text-lg lg:text-xl text-[#8f95a3] max-w-[560px] font-semibold leading-relaxed mb-8 sm:mb-12"
            >
              JTech simplifies estimating, letting you generate accurate Bills of Quantities in a fraction of the time.
            </motion.p>
            
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 5.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <button
                onClick={() => navigate('/auth?mode=signup')}
                className="group relative px-8 sm:px-10 md:px-6 lg:px-10 py-4 sm:py-4 md:py-3 lg:py-4 bg-[#f0514e] text-white text-lg sm:text-[1.1rem] md:text-base lg:text-[1.1rem] font-bold rounded-[4px] overflow-hidden transition-all duration-300 hover:brightness-110 active:scale-[0.98] shadow-[0_0_24px_rgba(240,81,78,0.38)] w-full sm:w-auto z-10"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Get Started</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;




// Adjusted logo sizing and UI spacing
