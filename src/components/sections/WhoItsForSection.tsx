// src/components/sections/WhoItsForSection.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target,
  FileText,
  HardHat,
  ChevronRight,
  Settings2,
  Database,
  Layers,
  Activity,
} from "lucide-react";

interface WhoItsForSectionProps {
  scrollTo: (sectionId: string) => void;
}

export default function WhoItsForSection({ scrollTo }: WhoItsForSectionProps) {
  const navigate = useNavigate();

  const goToWorkflowDetails = () => {
    scrollTo("how-it-works");
  };

  const goToTechnicalSupport = () => {
    scrollTo("faq");
  };

  const professionals = [
    {
      id: "GC-01",
      icon: <Target className="h-5 w-5" strokeWidth={1.8} />,
      title: "General Contractors",
      description:
        "Comprehensive bid verification using AI-extracted quantities. Centralize takeoff data to quickly confirm subcontractor proposals and material lists.",
      imageUrl:
        "https://info.plbco.com/hubfs/Stock%20images/Architects%20at%20a%20construction%20site%20looking%20at%20blueprints.jpeg",
    },
    {
      id: "QS-02",
      icon: <FileText className="h-5 w-5" strokeWidth={1.8} />,
      title: "Quantity Surveyors",
      description:
        "Automated takeoff and elemental quantity calculation from plan files (PDF/DWG). Transition from manual measurement to immediate, AI-driven data analysis.",
      imageUrl:
        "https://www.shutterstock.com/image-photo/black-engineer-wearing-safety-jacket-600nw-2195109333.jpg",
    },
    {
      id: "SC-03",
      icon: <HardHat className="h-5 w-5" strokeWidth={1.8} />,
      title: "Subcontractors",
      description:
        "Optimized trade-specific quantity takeoff. Drastically reduce the time spent extracting dimensions and materials to generate faster, competitive quotes.",
      imageUrl:
        "https://media.istockphoto.com/id/1249847960/photo/female-african-american-construction-worker.jpg?s=612x612&w=0&k=20&c=aURtbARF23o9JAbPo8g1_aYoC7sPMQQ5_1PASo0Qjbw=",
    },
  ];

  return (
    <div id="who-its-for" className="bg-white antialiased text-[#1a1a1a]">
      {/* SECTION 1: TECHNICAL HERO / KNOWLEDGE BASE */}
      <section className="bg-gradient-to-b from-white to-[#f8f9fa] overflow-hidden">
        {/* CHANGED: Removed 'flex-col', used 'flex-row' to force side-by-side on all screens. Added 'items-center' for vertical alignment. */}
        <div className="max-w-[1200px] mx-auto flex flex-row items-center">
          
          {/* LEFT COLUMN (TEXT) */}
          {/* CHANGED: Width is now 45% on all screens. Padding reduces to 'p-4' on mobile. */}
          <div className="w-[45%] p-4 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3 md:mb-6">
              <span className="bg-[#00356B] text-white text-[7px] md:text-[9px] font-bold px-2 py-0.5 tracking-tighter uppercase rounded">
                V 4.2.0
              </span>
              <span className="text-[#00356B] text-[7px] md:text-[9px] font-bold uppercase tracking-[2px]">
                Process Documentation
              </span>
            </div>
            
            {/* CHANGED: Text size scales down (text-lg) on small screens */}
            <h1 className="text-xl md:text-3xl lg:text-4xl font-light text-[#00356B] mb-3 md:mb-6 leading-[1.2] tracking-tight">
              Automated <span className="font-bold">Quantity Takeoff</span>
              <br />& Costing Pipeline
            </h1>
            
            <p className="text-[10px] md:text-[13px] text-gray-600 leading-relaxed mb-4 md:mb-8 max-w-md font-medium">
              Our system transforms construction plans (PDF, DWG) into precise
              quantities and cost data in four automated, highly efficient
              phases.
            </p>
            
            <div>
              <button
                onClick={goToWorkflowDetails}
                // CHANGED: Button padding and text size reduced for small screens
                className="w-fit flex items-center gap-2 bg-[#D85C2C] text-white px-3 py-2 md:px-6 md:py-3 text-[8px] md:text-[10px] font-black uppercase tracking-[1.5px] hover:bg-[#b84520] transition-colors rounded-md shadow-sm"
              >
                Access Workflow Details{" "}
                <ChevronRight className="w-2 h-2 md:w-3 md:h-3" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN (IMAGE) */}
          {/* CHANGED: Width is now 55% on all screens. Reduced padding significantly on mobile. */}
          <div className="w-[55%] relative flex items-center justify-center p-2 md:p-12 lg:p-16">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              // CHANGED: Removed max-w-lg constraint so it fits fluidly in the 55% width
              className="relative w-full overflow-hidden z-10 rounded-lg md:rounded-xl shadow-lg"
            >
              {/* Window Header */}
              <div className="h-4 md:h-8 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-2 md:px-3 select-none">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 md:w-3 md:h-3 bg-[#ff5f57] rounded-full" />
                  <div className="w-1.5 h-1.5 md:w-3 md:h-3 bg-[#febc2e] rounded-full" />
                  <div className="w-1.5 h-1.5 md:w-3 md:h-3 bg-[#28c840] rounded-full" />
                </div>
                {/* Hide title on very small screens if needed, or scale text */}
                <div className="text-[6px] md:text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1 md:gap-2">
                  <Activity className="w-2 h-2 md:w-3.5 md:h-3.5" strokeWidth={1.8} />{" "}
                  <span className="truncate">AI-Takeoff_Client.exe</span>
                </div>
                <div className="w-4 md:w-6" />
              </div>

              {/* Image Content */}
              <div className="relative aspect-video bg-black">
                <img
                  src="https://gegosoft.com/wp-content/uploads/2023/03/boq_software_for_construction_projects.jpg"
                  alt="Digital Construction Blueprints Analysis"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay UI elements - Scaled down for mobile */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/40" />
                  <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/40" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/40" />
                  <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/40" />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-black/80 border border-white/10 px-1.5 py-0.5 md:px-2.5 md:py-1 flex items-center gap-2 rounded">
                  <div className="flex items-center gap-1 text-[6px] md:text-[9px] font-mono text-[#86bc25] font-bold tracking-wider">
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[#86bc25] rounded-full animate-pulse" />
                    <span className="hidden md:inline">AI ANALYSIS</span>
                    <span className="md:hidden">AI</span>
                  </div>
                  <div className="w-[1px] h-1.5 md:h-2.5 bg-white/20" />
                  <div className="text-[6px] md:text-[9px] font-mono text-white/70 tracking-wider truncate max-w-[50px] md:max-w-none">
                    Plan: A-01
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ROLE-SPECIFIC BENEFITS */}
      <section className="bg-[#eef5ff] py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#00356B] uppercase tracking-tight">
              Optimized for Construction Professionals
            </h2>
            <p className="text-[13px] text-gray-600 mt-2 font-medium">
              How AI-driven quantity takeoff supports your specific workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {professionals.map((pro, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="group flex flex-col bg-white rounded-xl h-full shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-transparent hover:border-[#00356B]/20"
              >
                <div className="h-[200px] overflow-hidden relative">
                  <div className="absolute top-4 left-4 z-10 bg-[#00356B] text-white text-[9px] font-mono font-bold px-2 py-1 tracking-widest shadow-md rounded">
                    ID / {pro.id}
                  </div>
                  <img
                    src={pro.imageUrl}
                    alt={pro.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-4 text-[#00356B]">
                    <div className="p-2 bg-[#eef5ff] rounded-md group-hover:bg-[#00356B] group-hover:text-white transition-colors duration-300">
                      {pro.icon}
                    </div>
                    <h3 className="text-[15px] font-bold uppercase tracking-tight">
                      {pro.title}
                    </h3>
                  </div>

                  <p className="text-[13px] text-gray-600 leading-relaxed mb-6 flex-grow">
                    {pro.description}
                  </p>

                  <button
                    onClick={() => navigate("/auth?mode=signup")}
                    className="w-full flex justify-between items-center py-3 px-4 bg-[#D85C2C] text-white text-[10px] font-black uppercase tracking-wider rounded-md border border-transparent hover:bg-[#b84520] transition-all duration-300"
                  >
                    <span>Start Automated Takeoff</span>
                    <ChevronRight
                      className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform"
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: INDUSTRIAL SUPPORT */}
      <section className="bg-white py-16 text-[#1a1a1a]">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-12">
          <div className="flex flex-col items-center gap-16">
            <div className="w-full space-y-8 text-center lg:text-left">
              <div>
                <h2 className="text-2xl lg:text-3xl font-light mb-3">
                  Technical <span className="font-bold">Deployment & Data</span>
                </h2>
                <div className="h-1 w-20 bg-[#86bc25] mx-auto lg:mx-0" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 max-w-3xl mx-auto lg:mx-0">
                {[
                  {
                    icon: <Settings2 className="w-5 h-5" strokeWidth={1.5} />,
                    title: "Implementation",
                    text: "Guided deployment for corporate server and cloud environments.",
                  },
                  {
                    icon: <Database className="w-5 h-5" strokeWidth={1.5} />,
                    title: "Data Integrity",
                    text: "Secure storage for all uploaded plans and extracted quantity data.",
                  },
                  {
                    icon: <Layers className="w-5 h-5" strokeWidth={1.5} />,
                    title: "AI Model Updates",
                    text: "Regular neural network training to improve material and dimension recognition.",
                  },
                  {
                    icon: <Activity className="w-5 h-5" strokeWidth={1.5} />,
                    title: "24/7 Monitoring",
                    text: "Global uptime tracking for mission-critical takeoff and Auto-Calc availability.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-[#86bc25] flex-shrink-0 mt-0.5">{item.icon}</div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-[11px] uppercase tracking-wider text-[#1a1a1a]">
                        {item.title}
                      </h4>
                      <p className="text-[12px] text-gray-600 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={goToTechnicalSupport}
                  className="w-full sm:w-auto bg-[#D85C2C] text-white px-8 py-3 text-[10px] font-black uppercase tracking-wider hover:bg-[#b84520] transition-colors rounded-md"
                >
                  Contact Technical Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}