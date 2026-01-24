// src/components/sections/HowItWorks.tsx
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

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

  return (
    <>
      <GlobalStyles />
      <section
        id="how-it-works"
        className="bg-white font-technical text-[#1a1a1a] py-16 overflow-hidden"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Section Heading */}
          <div className="mb-14 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="h-[1.5px] w-6 bg-[#00356B]"></div>
              <span className="text-[10px] font-bold uppercase tracking-[2.5px] text-gray-500">
                Process Workflow
              </span>
              <div className="h-[1.5px] w-6 bg-[#00356B]"></div>
            </div>

            <h2 className="text-3xl md:text-4xl leading-[1.15] mb-4 tracking-tight text-[#1a1a1a]">
              <span className="font-light block">Automated</span>
              <span className="font-bold text-[#00356B] block my-1.5">
                Estimation Pipeline
              </span>
            </h2>
            <p className="text-[13px] text-gray-600 max-w-xl mx-auto leading-relaxed">
              Transform raw construction plans into precise, client-ready quotes
              in four automated stages.
            </p>
          </div>

          {/* Process Grid – Updated to match WhoItsFor card style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group flex flex-col items-center text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-transparent hover:border-[#00356B]/20 transition-all duration-300"
              >
                {/* Icon Container */}
                <div className="relative mb-5">
                  <div className="w-16 h-16 flex items-center justify-center bg-[#eef5ff] rounded-lg group-hover:bg-[#00356B] transition-colors duration-300">
                    <img
                      src={step.iconUrl}
                      alt={step.title}
                      className="w-8 h-8 object-contain group-hover:invert-[0.9] transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-[#00356B] text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-white">
                    {step.id}
                  </div>
                </div>

                {/* Text Content */}
                <h3 className="text-[15px] font-bold text-[#00356B] mb-2 uppercase tracking-tight">
                  {step.title}
                </h3>
                <p className="text-[12px] text-gray-600 leading-relaxed">
                  {step.desc}
                </p>

                {/* Optional: Arrow indicator on mobile */}
                {i < steps.length - 1 && (
                  <div className="md:hidden mt-4 text-[#00356B]">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
