// src/components/sections/Hero.tsx
import { PlayCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavbarSection from "@/components/sections/NavbarSection";

// JTech Engineering Theme Colors
const THEME = {
  NAVY_BG: "#000B29",
  HERO_BTN_GREEN: "#86bc25",
  HERO_ACCENT_BLUE: "#00356B",
};

const openDemoVideo = () => {
  window.open("/Demo1.mp4", "_blank");
};

// ✅ ANIMATED JTech AI LOGO (AI "BOOTING" STYLE)
const AnimatedJTechLogo = () => (
  <div className="relative w-64 h-16 mx-auto lg:mx-0 mb-8">
    {/* Static base */}
    <svg
      width="135"
      height="36"
      viewBox="0 0 135 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0"
    >
      <path d="M19.2857 11.25H12.8571V15.75H19.2857V11.25Z" fill="#00356B" />
      <path d="M19.2857 20.25H12.8571V24.75H19.2857V20.25Z" fill="#00356B" />
      <path d="M9.64286 6.75H25.7143V2.25H9.64286V6.75Z" fill="#00356B" />
      <path d="M9.64286 29.25H25.7143V24.75H9.64286V29.25Z" fill="#00356B" />
      <path d="M6.42857 11.25H0V24.75H6.42857V11.25Z" fill="#00356B" />
      <path d="M32.1429 11.25H25.7143V24.75H32.1429V11.25Z" fill="#00356B" />
      <path d="M38.5714 15.75H32.1429V20.25H38.5714V15.75Z" fill="#00356B" />
      <circle cx="22.5" cy="13.5" r="2.25" fill="#0077B6" />
      <circle cx="22.5" cy="22.5" r="2.25" fill="#0077B6" />
      <path d="M22.5 15.75V20.25" stroke="#0077B6" strokeWidth="1.5" />
      <text
        x="45"
        y="24"
        fontFamily="Segoe UI"
        fontWeight="800"
        fontSize="22"
        fill="#00356B"
      >
        JTech
      </text>
      <text
        x="108"
        y="24"
        fontFamily="Segoe UI"
        fontWeight="800"
        fontSize="22"
        fill="#0077B6"
      >
        AI
      </text>
    </svg>

    {/* 🔹 ANIMATED PULSING NODES */}
    <div className="absolute top-3 left-[21px] w-1.5 h-1.5 rounded-full bg-[#86bc25] animate-pulse-node"></div>
    <div className="absolute top-8 left-[21px] w-1.5 h-1.5 rounded-full bg-[#86bc25] animate-pulse-node delay-300"></div>

    {/* 🔸 SCANNING LINE (AI "ANALYZING") */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-[#86bc25]/30 animate-scan-line"></div>
    </div>
  </div>
);

const Hero = ({ scrollTo, demoOpen, setDemoOpen }: any) => {
  const navigate = useNavigate();

  return (
    <div className="antialiased text-white selection:bg-[#86bc25] selection:text-white bg-[#000B29] relative">
      {/* ✅ GLOBAL ANIMATION STYLES */}
      <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0.7; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.4; }
        }
        @keyframes pulse-node {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.8); opacity: 0.5; }
        }
        .animate-scan-line {
          animation: scan-line 3s infinite ease-in-out;
        }
        .animate-pulse-node {
          animation: pulse-node 2s infinite ease-in-out;
        }
      `}</style>

      <NavbarSection scrollTo={scrollTo} setDemoOpen={setDemoOpen} />

      <section className="relative min-h-screen w-full  overflow-hidden flex items-center pt-16 lg:pt-0 border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            alt="Construction professionals"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#000B29]/85 mix-blend-multiply"></div>
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="w-full lg:w-[60%] pt-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* ✅ SHRUNK TEXT & UNIQUE LOGO */}
              <AnimatedJTechLogo />

              {/* Tagline - slightly smaller */}
              <p
                className="text-[9px] font-bold tracking-[0.25em] uppercase mb-3 opacity-90"
                style={{ color: THEME.HERO_BTN_GREEN }}
              >
                THE SOLUTION
              </p>

              {/* Headline - tighter size */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-4 tracking-tight text-white">
                GENERATE ACCURATE QUOTES <br />
                <span className="font-black">IN MINUTES.</span>
              </h1>

              {/* Description - smaller, lighter */}
              <p className="text-xs text-blue-100/80 max-w-lg mx-auto lg:mx-0 mb-5 leading-relaxed font-light">
                Generate and edit accurate quotes. Connect workflows, validate
                costs, and generate automated takeoffs with 99.9% precision.
              </p>

              {/* Divider - thinner */}
              <div className="w-10 h-[1.5px] bg-[#86bc25] mx-auto lg:mx-0 mb-6 opacity-80"></div>

              {/* CTA Buttons - slightly smaller padding */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openDemoVideo}
                  className="bg-[#86bc25] text-white text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#75a620] transition-all"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Watch Demo
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/auth?mode=signup")}
                  className="bg-white text-[#00356B] text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  Get Started
                  <ChevronRight className="w-3.5 h-3.5 text-[#86bc25]" />
                </motion.button>
              </div>

              {/* Trust badge - smaller */}
              <p className="text-[9px] text-white/60 uppercase tracking-widest font-bold">
                Trusted by 500+ Top Firms
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
