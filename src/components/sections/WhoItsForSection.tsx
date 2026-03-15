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
    <div id="who-its-for" className="bg-[#fcfdfd] antialiased text-[#1a1a1a]">
      {/* SECTION 1: TECHNICAL HERO / KNOWLEDGE BASE */}
      <section className="bg-[#fcfcfc] overflow-hidden relative">
        {/* The background pattern lines mimicking the reference image styling */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
           {/* Diagonal Chevron Line (Top to bottom right) */}
           <div className="absolute top-[-30%] right-[35%] w-[1.5px] h-[150%] bg-gradient-to-b from-[#ef4444]/20 via-[#f97316]/30 to-transparent transform rotate-[40deg] origin-center -z-10"></div>
           {/* Diagonal Chevron Line (Bottom to top right) */}
           <div className="absolute bottom-[-50%] right-[40%] w-[1.5px] h-[150%] bg-gradient-to-t from-[#ef4444]/20 via-[#f97316]/30 to-transparent transform -rotate-[40deg] origin-center -z-10"></div>
           
           {/* Parallel accent lines */}
           <div className="absolute top-[10%] right-[25%] w-[1px] h-[100%] bg-gradient-to-b from-transparent via-[#f97316]/10 to-transparent transform rotate-[40deg] origin-center -z-10"></div>
           <div className="absolute bottom-[-10%] right-[30%] w-[1px] h-[100%] bg-gradient-to-t from-transparent via-[#f97316]/10 to-transparent transform -rotate-[40deg] origin-center -z-10"></div>

           {/* Soft background glow left side */}
           <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#f97316]/[0.02] blur-[80px] rounded-full transform -translate-y-1/2"></div>
        </div>

        {/* Global style specifically for this component to match image fonts exactly */}
        <style>{`
          .header-gradient-text {
            background: linear-gradient(to right, #ea580c, #ef4444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .custom-red-btn {
            background: linear-gradient(135deg, #ef4444 0%, #ea580c 100%);
          }
        `}</style>

        {/* CHANGED: Removed 'flex-col', used 'flex-row' to force side-by-side on all screens. Added 'items-center' for vertical alignment. */}
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center gap-12 min-h-[500px] relative z-10 py-16 md:py-24">
          {/* LEFT COLUMN (TEXT) */}
          <div className="w-full md:w-[48%] md:shrink-0 px-6 lg:px-12 flex flex-col justify-center">
            
            {/* Version Pill */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#0b3e74] text-[18px] md:text-[22px] font-bold tracking-tight">
                jtech ai
              </span>
              <span className="text-[#0b3e74] text-[18px] md:text-[22px] font-bold tracking-tight">
                 is out now
              </span>
            </div>

            {/* Giant Title */}
            <h1 className="text-[52px] md:text-[72px] lg:text-[85px] leading-[1.05] tracking-tight mb-6 font-light text-[#111]">
              Automated <br className="hidden md:block"/>
              <span className="font-bold header-gradient-text">Takeoff</span>
            </h1>

            {/* Description Paragraph */}
            <p className="text-[14px] md:text-[16px] text-[#4b5563] leading-relaxed mb-8 max-w-[420px] font-light">
              Our system transforms construction plans (PDF, DWG) into precise
              quantities and cost data in four automated, highly efficient
              phases.
            </p>

            {/* Red CTA Button */}
            <div>
              <button
                onClick={goToWorkflowDetails}
                className="custom-red-btn text-white px-8 py-3.5 text-[15px] font-bold rounded shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_16px_rgba(239,68,68,0.4)] transition-all hover:scale-[1.02]"
              >
                Access Workflow Details
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (IMAGE & NUMBER) */}
          <div className="w-full md:w-[52%] md:shrink-0 relative mt-10 md:mt-0">
             
             {/* The large background number (like the '9') */}
             <div className="absolute right-[-10%] top-1/2 transform -translate-y-1/2 flex items-center justify-center -z-10 translate-x-1/4 pointer-events-none">
                {/* SVG representing the massive thick stroke 9/number from the image */}
                <svg width="450" height="450" viewBox="0 0 100 100" className="drop-shadow-2xl opacity-90 overflow-visible">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#082b54" />
                      <stop offset="60%" stopColor="#0b3e74" />
                      <stop offset="100%" stopColor="#0b3e74" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  {/* Creating a massive '4' shape utilizing thick paths */}
                  <path d="M70,90 L70,70 L90,70" stroke="url(#grad1)" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M70,90 L70,10" stroke="url(#grad1)" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M70,70 L20,70 L70,10" stroke="url(#grad1)" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>

             {/* Interface Image Container */}
            <div className="relative z-10 mr-12 md:mr-24 rounded-lg bg-[#272630] border-2 border-[#ff7b4b]/40 shadow-[-20px_20px_60px_-15px_rgba(0,0,0,0.4)] p-[2px]">
              <div className="bg-[#1f1e24] rounded border border-gray-600/30 overflow-hidden shadow-inner">
                {/* Simulated window header */}
                <div className="h-6 bg-[#33323a] border-b border-black/20 flex items-center px-3 gap-2">
                   <div className="w-2 h-2 rounded-full bg-red-400"></div>
                   <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                   <div className="w-2 h-2 rounded-full bg-green-400"></div>
                   <div className="mx-auto h-3 w-32 bg-white/5 rounded-sm"></div>
                </div>
                {/* Mockup image inner */}
                <img
                  src="https://gegosoft.com/wp-content/uploads/2023/03/boq_software_for_construction_projects.jpg"
                  alt="Automated quantity takeoff preview"
                  className="w-full h-auto object-cover opacity-90 mix-blend-lighten"
                />
              </div>
            </div>
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
