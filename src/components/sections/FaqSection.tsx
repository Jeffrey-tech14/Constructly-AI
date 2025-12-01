// src/components/sections/FaqSection.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Plus, 
  Minus, 
  Target,
  FileCode,
  ShieldCheck,
  HelpCircle,
  Play
} from "lucide-react";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
  `}</style>
);

// --- THEME COLORS ---
const THEME = {
  headerBackground: "#001021", // Dark Navy
  brandBlue: "#005F9E",        // Engineering Blue
  bgLight: "#F5F7FA",          // Light Grey
  textDark: "#1a1a1a",
};

// --- MOCK DATA ---
const faqCategories = [
  { name: "General", checked: true },
  { name: "Account & Signup", checked: false },
  { name: "Plan Upload", checked: false },
  { name: "AI Takeoff", checked: false },
  { name: "Cost Estimation", checked: false },
  { name: "Pricing & Plans", checked: false },
  { name: "For Quantity Surveyors", checked: false },
  { name: "File Formats", checked: false },
  { name: "Security", checked: false },
  { name: "Billing", checked: false },
];

const mockFaqResults = [
  {
    id: "JT001",
    icon: Target,
    tags: ["AI Takeoff", "Accuracy"],
    title: "How accurate is J-Tech AI’s quantity takeoff?",
    question: "What level of precision can I expect from automated measurements?",
    answer: "J-Tech AI delivers **99.9% measurement accuracy** on clear, scaled plans (PDF, DWG, or high-res images). Our AI cross-validates dimensions using structural logic and industry standards. For complex projects, users can review and adjust any item before finalizing.",
    historyText: "How does J-Tech AI verify its results?",
    historyAnswer: "J-Tech AI uses a dual-validation system: 1) geometric consistency checks, and 2) material logic rules (e.g., 'concrete slabs must span between beams'). You always retain final control."
  },
  {
    id: "JT002",
    icon: FileCode,
    tags: ["Plan Upload", "File Formats"],
    title: "What file types does J-Tech AI support?",
    question: "Can I upload scanned PDFs or hand-drawn plans?",
    answer: "Yes! J-Tech AI supports **PDF, DWG, DXF, JPG, PNG**, and even scanned or hand-drawn plans. For best results, ensure your plans include a scale reference (e.g., a dimension line or known room size). Our AI will auto-detect scale where possible.",
    historyText: "Tips for best upload results",
    historyAnswer: "Ensure plans are high contrast and not rotated. J-Tech AI includes a built-in rotation and crop tool to help you prepare your files before analysis."
  },
  {
    id: "JT003",
    icon: ShieldCheck,
    tags: ["Security", "Data"],
    title: "Is my project data secure?",
    question: "Where is my data stored and who has access?",
    answer: "Your data is encrypted using AES-256 standards and stored on secure AWS servers. We strictly adhere to GDPR compliance. Only you and authorized team members within your organization can access your project files.",
    historyText: "Do you train AI on my private plans?",
    historyAnswer: "We do not use your proprietary project data to train our public models without your explicit consent. Your intellectual property remains yours."
  },
];

// --- COMPONENTS ---

// 1. The "Video Card" visual for the hero section
const VideoCardMockup = ({ opacity = 1, scale = 1, offset = 0 }) => (
  <div 
    className="absolute top-1/2 -translate-y-1/2 w-[280px] h-[160px] rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden flex flex-col justify-between shadow-2xl"
    style={{ 
      right: `${offset}px`, 
      opacity: opacity, 
      transform: `translateY(-50%) scale(${scale})`,
      zIndex: Math.floor(opacity * 10)
    }}
  >
    {/* Glass Reflection */}
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
    
    {/* Play Button */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center bg-black/20 backdrop-blur-md">
        <Play className="w-5 h-5 text-white fill-current ml-1" />
      </div>
    </div>

    {/* Footer / Progress Bar */}
    <div className="mt-auto p-3">
       <div className="flex justify-between items-center mb-1 px-1">
         <div className="h-1 w-1 bg-red-500 rounded-full"></div>
         <div className="h-1 w-1 bg-white/30 rounded-full"></div>
       </div>
       {/* Red Progress Line */}
       <div className="w-full h-[2px] bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-red-600 w-[70%]"></div>
       </div>
    </div>
  </div>
);

const CategorySidebar = () => (
  <aside className="w-full max-w-[280px] hidden md:block flex-shrink-0">
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-6 sticky top-24">
      <div className="p-4 bg-[#F5F7FA] border-b border-gray-200 flex justify-between items-center">
        <span className="text-sm font-bold text-[#001021] uppercase tracking-wider">
          Categories
        </span>
        <ChevronUp className="w-4 h-4 text-gray-500" />
      </div>
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
        {faqCategories.map((category, index) => (
          <label key={index} className="flex items-center text-sm text-gray-600 hover:text-[#005F9E] cursor-pointer transition-colors group">
            <input
              type="checkbox"
              className="h-4 w-4 text-[#005F9E] border-gray-300 rounded focus:ring-[#005F9E] mr-3 cursor-pointer"
              defaultChecked={category.checked}
            />
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              {category.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  </aside>
);

const FaqItem = ({ faq, index }) => {
  const [isOpenMain, setIsOpenMain] = useState(index === 0); 
  const [isOpenSub, setIsOpenSub] = useState(false);
  const IconComponent = faq.icon || HelpCircle;

  return (
    <motion.div
      className="flex flex-col md:flex-row gap-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="hidden md:flex flex-col items-center pt-2 w-12 flex-shrink-0">
         <div className="w-12 h-12 rounded-full bg-[#F5F7FA] flex items-center justify-center border border-gray-200 text-[#005F9E] shadow-sm">
            <IconComponent className="w-6 h-6" />
         </div>
         <div className="h-full w-px bg-gray-200 mt-4 border-l border-dashed border-gray-300"></div>
      </div>

      <div className="flex-grow bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-gray-400 text-[10px] font-mono border border-gray-100 px-2 py-0.5 rounded">
              {faq.id}
            </span>
            {faq.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#005F9E]">
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-xl font-bold text-[#001021] mb-6">
            {faq.title}
          </h3>

          <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
            <div 
              onClick={() => setIsOpenMain(!isOpenMain)}
              className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isOpenMain ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`font-semibold text-sm ${isOpenMain ? 'text-[#005F9E]' : 'text-gray-700'}`}>
                  {faq.question}
                </span>
              </div>
              {isOpenMain ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </div>
            <AnimatePresence>
              {isOpenMain && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 leading-relaxed">
                     <p dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {faq.historyText && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                onClick={() => setIsOpenSub(!isOpenSub)}
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isOpenSub ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
              >
                 <div className="flex items-center gap-3">
                    <span className={`font-semibold text-sm ${isOpenSub ? 'text-[#005F9E]' : 'text-gray-700'}`}>
                      {faq.historyText}
                    </span>
                 </div>
                 {isOpenSub ? <Minus className="w-4 h-4 text-gray-400" /> : <Plus className="w-4 h-4 text-gray-400" />}
              </div>
              <AnimatePresence>
                {isOpenSub && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 leading-relaxed">
                      <p dangerouslySetInnerHTML={{ __html: faq.historyAnswer?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT ---
const FaqSection = () => {
  return (
    <>
      <GlobalStyles />
      <div id="faq" className="w-full font-inter bg-white min-h-screen">
        
        {/* ========================================
            HERO SECTION (Replicating the Reference Image)
           ======================================== */}
        <div
          className="w-full relative overflow-hidden h-[450px]"
          style={{ backgroundColor: THEME.headerBackground }}
        >
          {/* Subtle Background Glow/Gradient */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none"></div>

          <div className="max-w-[1340px] mx-auto px-6 h-full flex items-center relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-12 items-center">
              
              {/* LEFT COLUMN: Text & Search */}
              <div className="w-full max-w-xl">
                <motion.h1
                  className="text-4xl lg:text-5xl font-extrabold text-white mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  J-Tech AI FAQs
                </motion.h1>

                <p className="text-gray-300 text-base leading-relaxed mb-8 pr-8">
                  Training is not necessarily structured differently than face-to-face seminars. Here, communication between the AI assistant and you as a participant takes place instantly. All you need is a reliable internet connection.
                </p>

                {/* EXACT STYLE SEARCH BAR */}
                <div className="flex bg-white rounded-sm overflow-hidden h-14 w-full max-w-lg shadow-xl">
                  <div className="flex-1 flex items-center px-4">
                    <input
                      type="text"
                      placeholder="Search in J-Tech AI FAQs"
                      className="w-full text-base text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent font-medium"
                    />
                  </div>
                  <button
                    className="h-full px-8 font-bold text-white text-sm uppercase tracking-wide transition-colors hover:bg-opacity-90"
                    style={{ backgroundColor: THEME.headerBackground }} // Dark Navy Button
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: VIDEO REPLACEMENT */}
              <div className="hidden lg:block relative h-64 w-full rounded-lg overflow-hidden shadow-2xl">
                {/* VIDEO ELEMENT */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
                >
                  <source src="/demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Optional Overlay to match the dark theme slightly if needed */}
                <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay pointer-events-none rounded-lg"></div>
              </div>

            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="max-w-[1250px] mx-auto flex py-16 px-6 gap-8 bg-white">
          <CategorySidebar />
          <div className="w-full md:flex-1"> 
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 mb-8 pb-4 border-b border-gray-100">
              <span className="font-semibold text-[#001021]">
                Showing <span className="text-[#005F9E]">3</span> of 142 Results
              </span>
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Sort by:</span>
                  <select className="bg-transparent font-semibold text-[#001021] focus:outline-none cursor-pointer">
                    <option>Relevance</option>
                    <option>Latest</option>
                    <option>Most Viewed</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Results List */}
            <div className="space-y-2">
              {mockFaqResults.map((faq, index) => (
                <FaqItem key={faq.id} faq={faq} index={index} />
              ))}
            </div>
            {/* Load More */}
            <div className="mt-12 text-center">
               <button className="px-6 py-3 border border-gray-200 text-[#001021] font-bold text-xs uppercase tracking-widest rounded hover:border-[#001021] transition-colors">
                  Load More Questions
               </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default FaqSection;