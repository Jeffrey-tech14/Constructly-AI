import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Target,
  FileText,
  HardHat,
  ChevronRight,
  CheckCircle2,
  Settings2,
  Database,
  Layers,
  Activity
} from "lucide-react";

export default function JTechAISection() {
  const navigate = useNavigate();

  const professionals = [
    {
      id: "GC-01",
      icon: <Target className="h-5 w-5" strokeWidth={1.8} />,
      title: "General Contractors",
      description: "Comprehensive bid verification and multi-trade estimation management. Eliminate spreadsheet redundancy through centralized AI-driven data processing.",
      imageUrl: "https://contractortrainingcenter.com/cdn/shop/articles/general_contractors_making_plans_for_new_project_smaller_520x500_db69fb37-61b4-4727-827a-b631920e58ba.jpg?v=1736785491",
    },
    {
      id: "QS-02",
      icon: <FileText className="h-5 w-5" strokeWidth={1.8} />,
      title: "Quantity Surveyors",
      description: "Precision-engineered takeoff automation. Focus on high-level elemental analysis and cost planning rather than manual geometric measurement.",
      imageUrl: "https://www.shutterstock.com/image-photo/black-engineer-wearing-safety-jacket-600nw-2195109333.jpg",
    },
    {
      id: "SC-03",
      icon: <HardHat className="h-5 w-5" strokeWidth={1.8} />,
      title: "Subcontractors",
      description: "Optimized trade-specific workflows. Reduce takeoff duration by 70% while increasing proposal accuracy for competitive bidding scenarios.",
      imageUrl: "https://media.istockphoto.com/id/1249847960/photo/female-african-american-construction-worker.jpg?s=612x612&w=0&k=20&c=aURtbARF23o9JAbPo8g1_aYoC7sPMQQ5_1PASo0Qjbw=",
    },
  ];

  return (
    <div className="bg-white font-sans antialiased text-[#1a1a1a]">
      
      {/* SECTION 1: TECHNICAL HERO / KNOWLEDGE BASE */}
      <section className="border-b border-[#d1d5db] bg-[#f8f9fb]">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-stretch">
          
          {/* TEXT CONTENT */}
          <div className="p-12 lg:p-16 lg:w-[45%] bg-[#fcfcfc] border-r border-[#d1d5db] flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-[#002d5c] text-white text-[9px] font-bold px-2 py-0.5 tracking-tighter uppercase">V 4.2.0</span>
              <span className="text-[#002d5c] text-[9px] font-bold uppercase tracking-[2px]">Knowledge Academy</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-light text-[#002d5c] mb-6 leading-[1.15] tracking-tight">
              Professional <span className="font-bold">Estimation</span> <br />
              Management
            </h1>
            <p className="text-[13px] text-[#4b5563] leading-relaxed mb-8 max-w-md font-medium">
              Transition from manual measurement to AI-assisted analysis. Our structured learning path is designed for professional engineering integration.
            </p>
            <div>
              <button className="w-fit flex items-center gap-2 bg-[#002d5c] text-white px-6 py-3 text-[10px] font-black uppercase tracking-[1.5px] hover:bg-[#004182] transition-colors rounded-none border border-[#002d5c]">
                Access Documentation <ChevronRight className="w-3 h-3" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* VIDEO CONTAINER - SOFTWARE INTERFACE STYLE */}
          <div className="lg:w-[55%] relative flex items-center justify-center p-12 lg:p-20 overflow-hidden bg-[#eef2f6]">
            <div className="absolute inset-0 opacity-[0.04]" 
                 style={{ backgroundImage: `linear-gradient(#002d5c 1px, transparent 1px), linear-gradient(90deg, #002d5c 1px, transparent 1px)`, backgroundSize: '24px 24px' }} 
            />

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-full shadow-none bg-white border border-[#d1d5db] rounded-none overflow-hidden z-10"
            >
              {/* Title Bar - Sharp Industrial Style */}
              <div className="h-8 bg-[#f9fafb] border-b border-[#e5e7eb] flex items-center justify-between px-3 select-none">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-none bg-[#ff5f57] border border-[#e0443e]" />
                  <div className="w-3 h-3 rounded-none bg-[#febc2e] border border-[#d89e24]" />
                  <div className="w-3 h-3 rounded-none bg-[#28c840] border border-[#1aab29]" />
                </div>
                <div className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" strokeWidth={1.8} /> J-Tech_Viewer_Pro.exe
                </div>
                <div className="w-6" /> 
              </div>

              {/* Video Viewport */}
              <div className="relative aspect-video bg-black">
                <video 
                  className="w-full h-full object-cover"
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                >
                  <source src="/Demo1.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* HUD Overlays — Sharp Corners Only */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/40" />
                  <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/40" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/40" />
                  <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/40" />
                </div>

                <div className="absolute bottom-3 left-3 bg-black/80 border border-white/10 px-2.5 py-1 flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[9px] font-mono text-[#5BB539] font-bold tracking-wider">
                    <div className="w-1.5 h-1.5 bg-[#5BB539] rounded-full animate-pulse" />
                    LIVE ANALYSIS
                  </div>
                  <div className="w-[1px] h-2.5 bg-white/20" />
                  <div className="text-[9px] font-mono text-white/70 tracking-wider">LOD: 300</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PRODUCT MATRIX — SHARP CARDS */}
      <section className="bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {professionals.map((pro, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="flex flex-col bg-white border border-[#d1d5db] rounded-none overflow-hidden shadow-none hover:border-[#9ca3af] transition-colors"
              >
                <div className="h-[160px] overflow-hidden">
                  <img 
                    src={pro.imageUrl} 
                    alt={pro.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="p-5 flex-grow">
                  <div className="text-[#9ca3af] text-[9px] font-bold mb-2 font-mono uppercase">ID / {pro.id}</div>
                  <div className="flex items-center gap-2 mb-2.5 text-[#002d5c]">
                    {pro.icon}
                    <h3 className="text-[15px] font-bold uppercase tracking-tight">{pro.title}</h3>
                  </div>
                  <p className="text-[12px] text-[#4b5563] leading-relaxed mb-4">
                    {pro.description}
                  </p>
                  <button 
                    onClick={() => navigate("/auth?mode=signup")}
                    className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#002d5c] border-b border-[#002d5c]/0 group-hover:border-[#002d5c] pb-0.5"
                  >
                    View Role Specifics <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: TECHNICAL DATA TABLE — SHARP GRID */}
      <section className="py-12 bg-[#f8f9fb]">
        <div className="max-w-[1000px] mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#002d5c] uppercase tracking-tighter">System Specifications</h2>
              <div className="h-0.5 w-8 bg-[#002d5c] mt-1" />
            </div>
            <div className="text-right text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              Last Update: Dec 2025
            </div>
          </div>

          <div className="bg-white border border-[#d1d5db] rounded-none overflow-hidden">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="bg-[#002d5c] text-white">
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px]">Feature Module</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] border-l border-white/20">Standard AI</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] border-l border-white/20">Neural Engine (Pro)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1d5db]">
                {[
                  { feature: "Geometric Takeoff Accuracy", s: "95% Typical", p: "99.8% Verified" },
                  { feature: "Processing Speed (per A1 Sheet)", s: "45 Seconds", p: "Sub 5-Seconds" },
                  { feature: "BIM Integration (IFC/Revit)", s: "Read-Only", p: "Full Bi-Directional" },
                  { feature: "Multi-User Sync", s: "Available", p: "Real-time Collaborative" },
                  { feature: "Custom Material Libraries", s: "Limited", p: "Unlimited (SQL/CSV)" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="p-3.5 font-medium text-[#002d5c] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" strokeWidth={2} /> {row.feature}
                    </td>
                    <td className="p-3.5 text-gray-700 border-l border-[#d1d5db]">{row.s}</td>
                    <td className="p-3.5 font-semibold text-[#002d5c] bg-[#002d5c]/5 border-l border-[#d1d5db]">{row.p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 4: INDUSTRIAL SUPPORT — SHARP DARK MODE */}
      <section className="bg-[#001a35] py-12 text-white">
        <div className="max-w-[1200px] mx-auto px-4 lg:px-12">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-10">
            <div className="lg:w-1/2">
              <h2 className="text-2xl lg:text-3xl font-light mb-5">Technical <span className="font-bold">Service & SLA</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {[
                  { icon: <Settings2 className="w-4.5 h-4.5" strokeWidth={1.8} />, title: "Implementation", text: "Guided deployment for corporate server environments." },
                  { icon: <Database className="w-4.5 h-4.5" strokeWidth={1.8} />, title: "Data Integrity", text: "ISO 27001 certified storage for sensitive project bids." },
                  { icon: <Layers className="w-4.5 h-4.5" strokeWidth={1.8} />, title: "Modular Updates", text: "Weekly neural network training on regional materials." },
                  { icon: <Activity className="w-4.5 h-4.5" strokeWidth={1.8} />, title: "24/7 Monitoring", text: "Global uptime tracking for mission-critical bidding." }
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="text-[#5BB539]">{item.icon}</div>
                    <h4 className="font-bold text-[11px] uppercase tracking-wider">{item.title}</h4>
                    <p className="text-[12px] text-gray-300 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full md:w-auto border border-white text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-wider hover:bg-white hover:text-[#001a35] transition-colors rounded-none">
                Contact Engineering Support
              </button>
            </div>
            <div className="lg:w-1/2">
              <img
                src="https://www.ituonline.com/wp-content/uploads/2024/01/IT-Technical-Support-Skills.jpg"
                alt="Technical Engineering Center"
                className="w-full h-auto border border-white/10"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}