import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', 'Helvetica Neue', Arial, sans-serif; }
  `}</style>
);

interface Step {
  id: string;
  iconUrl: string;
  title: string;
  desc: string;
}

export default function HowItWorks() {
  const steps: Step[] = [
    {
      id: "01",
      iconUrl: "https://img.icons8.com/color/96/upload--v1.png",
      title: "Upload Plans",
      desc: "Drag & drop PDF, DWG, or image files to initialize the extraction engine.",
    },
    {
      id: "02",
      iconUrl: "https://img.icons8.com/color/96/bullish.png",
      title: "AI Analysis",
      desc: "Algorithms scan geometry and text to identify materials and dimensions.",
    },
    {
      id: "03",
      iconUrl: "https://img.icons8.com/color/96/calculator--v1.png",
      title: "Auto-Calc",
      desc: "System computes exact quantities and applies current unit rates.",
    },
    {
      id: "04",
      iconUrl: "https://img.icons8.com/color/96/export-pdf.png",
      title: "Export Quote",
      desc: "Generate a branded, client-ready PDF or export raw data to Excel.",
    },
  ];

  const THEME = {
    NAVY: "#002d5c",
    BORDER: "#d1d5db",
    TEXT_GRAY: "#4b5563",
  };

  return (
    <>
      <GlobalStyles />
      <section
        id="how-it-works"
        className="bg-white font-technical text-[#1a1a1a] py-16 overflow-hidden border-b border-[#d1d5db]"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Section Heading – Tighter */}
          <div className="mb-14 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="h-[1.5px] w-6 bg-[#002d5c]"></div>
              <span className="text-[10px] font-bold uppercase tracking-[2.5px] text-gray-500">
                Process Workflow
              </span>
              <div className="h-[1.5px] w-6 bg-[#002d5c]"></div>
            </div>

            <h2 className="text-3xl md:text-4xl leading-[1.15] mb-4 tracking-tight text-[#001021]">
              <span className="font-light block">Automated</span>
              <span className="font-bold text-[#002d5c] block my-1.5">
                Estimation Pipeline
              </span>
            </h2>
            <p className="text-[13px] text-gray-500 max-w-xl mx-auto leading-relaxed">
              Transform raw construction plans into precise, client-ready quotes
              in four automated stages.
            </p>
          </div>

          {/* Process Grid – Compact */}
          <div className="relative">
            {/* Desktop connector line */}
            <div className="hidden md:block absolute top-[3.75rem] left-0 w-full h-[1px] bg-[#e5e7eb] z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
              {steps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Icon Container – Smaller */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-white border border-[#d1d5db] flex items-center justify-center group-hover:border-[#002d5c] shadow-sm transition-all duration-300 relative z-10">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <img
                          src={step.iconUrl}
                          alt={step.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Step badge – smaller */}
                      <div className="absolute -top-1.5 -right-1.5 bg-[#002d5c] text-white text-[8px] font-mono font-bold px-1.5 py-0.5 border border-white z-20 uppercase">
                        Phase {step.id}
                      </div>
                    </div>

                    {/* Mobile arrow */}
                    {i < steps.length - 1 && (
                      <div className="md:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 text-gray-300">
                        <ChevronRight className="w-5 h-5 rotate-90" />
                      </div>
                    )}
                  </div>

                  {/* Text – Smaller, tighter */}
                  <div className="px-1 md:px-0">
                    <h3 className="text-[15px] font-bold text-[#002d5c] mb-2 uppercase tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-[12px] text-[#4b5563] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  {/* Progress line – adjusted height/position */}
                  {i < steps.length - 1 && (
                    <motion.div
                      className="hidden md:block absolute top-[3.75rem] left-1/2 w-[120%] h-[2px] bg-[#002d5c] origin-left z-0"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.4, duration: 0.4 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
