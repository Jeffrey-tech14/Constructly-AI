// src/components/sections/WhoItsForSection.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Globe,
  Headphones,
  GraduationCap,
  MonitorSmartphone,
} from "lucide-react";

interface WhoItsForSectionProps {
  scrollTo: (sectionId: string) => void;
}

export default function WhoItsForSection({ scrollTo }: WhoItsForSectionProps) {
  const navigate = useNavigate();

  const goToWorkflowDetails = () => {
    scrollTo("how-it-works");
  };

  const professionals = [
    {
      prefix: "Built for",
      title: "General Contractors",
      imageUrl:
        "https://info.plbco.com/hubfs/Stock%20images/Architects%20at%20a%20construction%20site%20looking%20at%20blueprints.jpeg",
      overlay: "#e64a09", // Vibrant orange/red
    },
    {
      prefix: "Accelerate",
      title: "Quantity Surveyors",
      imageUrl:
        "https://www.shutterstock.com/image-photo/black-engineer-wearing-safety-jacket-600nw-2195109333.jpg",
      overlay: "#1c3c96", // Vibrant deep blue
    },
    {
      prefix: "Perfect for",
      title: "Subcontractors",
      imageUrl:
        "https://www.shutterstock.com/image-photo/portrait-handsome-black-civil-engineer-600nw-2551185311.jpg",
      overlay: "#6f227a", // Vibrant purple
    },
  ];

  return (
    <div id="who-its-for" className="bg-white antialiased text-[#1a1a1a]">
      {/* SECTION 1: TECHNICAL HERO / KNOWLEDGE BASE */}
      <section className="bg-gradient-to-b from-white to-[#f8f9fa] overflow-hidden">
        {/* CHANGED: Removed 'flex-col', used 'flex-row' to force side-by-side on all screens. Added 'items-center' for vertical alignment. */}
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-0 min-h-[500px]">
          {/* LEFT COLUMN (TEXT) */}
          {/* CHANGED: Width is now 45% on all screens. Padding reduces to 'p-4' on mobile. */}
          <div className="w-full md:w-[45%] md:shrink-0 p-6 md:p-10 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3 md:mb-6">
              <span className="bg-[#00356B] text-white text-[7px] md:text-[9px] font-bold px-2 py-0.5 tracking-tighter uppercase rounded">
                V 4.2.0
              </span>
              <span className="text-[#00356B] text-[7px] md:text-[9px] font-bold uppercase tracking-[2px]">
                Process Documentation
              </span>
            </div>

            {/* CHANGED: Text size scales down (text-lg) on small screens */}
            <h1 className="text-3xl md:text-4xl font-light text-[#00356B] mb-4 md:mb-6 leading-[1.2] tracking-tight">
              Automated <span className="font-bold">Quantity Takeoff</span>
              <br />& Costing Pipeline
            </h1>

            <p className="text-[15px] md:text-[16px] text-gray-600 leading-relaxed mb-4 md:mb-8 max-w-md font-medium">
              Our system transforms construction plans (PDF, DWG) into precise
              quantities and cost data in four automated, highly efficient
              phases.
            </p>

            <div>
              <button
                onClick={goToWorkflowDetails}
                // CHANGED: Button padding and text size reduced for small screens
                className="w-fit flex items-center gap-2 bg-[#D85C2C] text-white px-3 py-2 md:px-6 md:py-3 text-[11px] md:text-[12px] font-black uppercase tracking-[1.5px] hover:bg-[#b84520] transition-colors rounded-md shadow-sm"
              >
                Access Workflow Details{" "}
                <ChevronRight
                  className="w-2 h-2 md:w-3 md:h-3"
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (IMAGE) */}
          {/* CHANGED: Width is now 55% on all screens. Reduced padding significantly on mobile. */}
          <div className="w-full md:w-[55%] md:shrink-0">
            <img
              src="https://gegosoft.com/wp-content/uploads/2023/03/boq_software_for_construction_projects.jpg"
              alt="Automated quantity takeoff preview"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: ROLE-SPECIFIC BENEFITS */}
      <section className="bg-[#f2f6f9] py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="text-[20px] md:text-[28px] lg:text-[32px] font-bold text-[#0b3e74] uppercase tracking-tight">
              Optimized for Construction Professionals
            </h2>
            <p className="text-[13px] md:text-[15px] text-[#5b6576] mt-3 font-medium">
              How AI-driven quantity takeoff supports your specific workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {professionals.map((pro, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="relative aspect-[4/3] md:aspect-auto md:h-[400px] lg:h-[420px] xl:h-[460px] overflow-hidden group shadow-md"
              >
                <img
                  src={pro.imageUrl}
                  alt={pro.title.replace('\n', ' ')}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Base color tint to map the image to the specific vibrant tone without haziness */}
                <div
                  className="absolute inset-0 mix-blend-color opacity-80"
                  style={{ backgroundColor: pro.overlay }}
                />
                
                {/* Deep multiply layer to enrich the base colors and darken deep shadows */}
                <div 
                  className="absolute inset-0 mix-blend-multiply opacity-80" 
                  style={{ backgroundColor: pro.overlay }} 
                />
                
                {/* Clean bottom gradient strictly for text legibility without muddying the whole image */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent opacity-90" />

                <div className="absolute left-6 right-6 bottom-6 md:left-8 md:bottom-8 text-white z-10">
                  <p className="text-[20px] md:text-[24px] lg:text-[28px] xl:text-[32px] leading-[1.2] font-medium tracking-tight">
                    {pro.prefix}
                  </p>
                  <p className="text-[26px] md:text-[30px] lg:text-[34px] xl:text-[40px] leading-[1.05] font-bold tracking-tight mt-1 whitespace-nowrap">
                    {pro.title}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: PLAN GUIDANCE */}
      <section
        className="bg-white antialiased"
        style={{
          fontFamily: "'Outfit', sans-serif",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "geometricPrecision",
        }}
      >
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2">
          <div className="relative min-h-[300px] lg:min-h-[480px] overflow-hidden">
            <img
              src="https://snu.edu.in/site/assets/files/18047/floating-industrial-landscape-with-chimneys-tank-mixed-media.1600x0.webp"
              alt="Construction planning visual"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-white/74" />
          </div>

          <div className="bg-[#f18a2b] min-h-[300px] lg:min-h-[480px] px-8 py-10 md:px-12 lg:px-14 lg:py-16 text-white flex flex-col justify-center">
            <h3 className="text-[28px] md:text-[42px] leading-[1.03] font-normal max-w-2xl tracking-[-0.01em]">
              Let us guide you to the right plan in less than a minute.
            </h3>

            <p className="mt-8 text-[15px] md:text-[18px] font-normal">
              What do you need JTech AI for?
            </p>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl">
              {[
                { icon: Globe, label: "Remote Access" },
                { icon: Headphones, label: "Technical Support" },
                { icon: GraduationCap, label: "Education or Research" },
                { icon: MonitorSmartphone, label: "Managing Remote Devices" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-full bg-[#7060b4] flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                  </div>
                  <p className="mt-3 text-[13px] md:text-[14px] leading-tight font-normal text-white/95">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <button
                onClick={() => navigate("/guide")}
                className="bg-white text-[#e45d4d] px-8 py-3 rounded-xl text-[18px] font-normal shadow-[0_10px_20px_rgba(0,0,0,0.16)] hover:brightness-95 transition-all tracking-tight"
              >
                Try our User Guide
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


// Adjusted logo sizing and UI spacing
