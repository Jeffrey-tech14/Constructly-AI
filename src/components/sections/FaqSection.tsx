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
  Play,
  Database,
  Filter,
} from "lucide-react";

const GlobalStyles = () => (
  <style>{`
    400;500;600;700;800&display=swap');
    
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #222222; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #ef443b; border-radius: 2px; }
  `}</style>
);

// Updated theme to use your brand blue
const THEME = {
  brandBlue: "#ef443b",
  accentGreen: "#ef443b", // matching your other sections
  bgLight: "#141414",
  textDark: "#ffffff",
};

const faqCategories = [
  { name: "Getting Started", checked: true },
  { name: "File Upload", checked: false },
  { name: "AI Takeoff", checked: false },
  { name: "Cost Calculation", checked: false },
  { name: "Export & Quotes", checked: false },
  { name: "Account & Billing", checked: false },
  { name: "Troubleshooting", checked: false },
];

const mockFaqResults = [
  {
    id: "KB-001",
    icon: Target,
    tags: ["Accuracy", "Takeoff"],
    title: "How accurate is the quantity extraction?",
    question: "What level of accuracy can I expect from automated takeoffs?",
    answer:
      "**High accuracy on clear, scaled plans.** The system detects walls, doors, windows, and annotations in PDF/DWG files. For best results, ensure plans include a scale reference. Manual review is recommended for final quotes.",
    historyText: "Improving Results",
    historyAnswer:
      "Upload vector-based PDFs or clean DWG files. Avoid low-resolution scans or hand-drawn sketches without clear dimensions.",
  },
  {
    id: "KB-002",
    icon: FileCode,
    tags: ["Upload", "Formats"],
    title: "What file types are supported?",
    question: "Can I upload scanned drawings or images?",
    answer:
      "**Yes: PDF, DWG, DXF, and image files (JPG, PNG, TIFF).** For scanned plans, a minimum of 300 DPI is recommended. The system uses AI to interpret geometry and text, but results may vary with poor-quality inputs.",
    historyText: "Optimizing Scans",
    historyAnswer:
      "Use the built-in preview tool to check alignment and clarity before processing. Rotated or skewed images may reduce accuracy.",
  },
  {
    id: "KB-003",
    icon: ShieldCheck,
    tags: ["Security", "Privacy"],
    title: "Is my data secure?",
    question: "What happens to my uploaded files?",
    answer:
      "**Your files are processed securely and deleted after export** unless you choose to save the project. We do not use your plans to train public AI models. All data is encrypted in transit and at rest.",
    historyText: "Data Retention",
    historyAnswer:
      "Saved projects remain in your account until manually deleted. You retain full ownership of your files and estimates.",
  },
];

const CategorySidebar = () => (
  <aside className="w-full max-w-[220px] hidden md:block flex-shrink-0">
    <div className="bg-[#1a1c22] border border-white/5 rounded-xl shadow-2xl mb-6 sticky top-24 overflow-hidden">
      <div className="p-4 bg-[#15171c] flex justify-between items-center">
        <span className="text-xs font-bold text-[#ef443b] uppercase tracking-widest flex items-center gap-2">
          <Filter className="w-3 h-3" />
          Filters
        </span>
        <ChevronUp className="w-3.5 h-3.5 text-[#a3a9b7]" />
      </div>
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {faqCategories.map((category, index) => (
          <label
            key={index}
            className="flex items-center text-base font-medium text-[#a3a9b7] font-light text-[15px] leading-relaxed hover:text-[#ef443b] cursor-pointer transition-colors group"
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 text-[#ef443b] border-white/20 focus:ring-[#ef443b] mr-3 cursor-pointer"
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
      className="flex flex-col md:flex-row gap-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Icon Column */}
      <div className="hidden md:flex flex-col items-center pt-2 w-10 flex-shrink-0">
        <div className="w-6 h-6 bg-[#ef443b]/10 flex items-center justify-center rounded-lg text-[#ef443b] border border-white/10">
          <IconComponent className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <div className="h-full w-px bg-white/10 mt-4"></div>
      </div>

      {/* FAQ Card */}
      <div className="flex-grow bg-[#1a1c22] border border-white/5 rounded-xl shadow-2xl hover:border-white/10 transition-all duration-300 group overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[#ef443b] text-xs font-bold font-mono bg-[#ef443b]/10 px-2 py-0.5 rounded uppercase tracking-wider">
              {faq.id}
            </span>
            {faq.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#a3a9b7] font-light text-[15px] leading-relaxed bg-[#2a2c32] rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold text-[#ef443b] mb-4 font-technical tracking-tight">
            {faq.title}
          </h3>

          {/* Main Q&A */}
          <div className="border border-white/5 rounded-lg mb-4 overflow-hidden">
            <div
              onClick={() => setIsOpenMain(!isOpenMain)}
              className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                isOpenMain ? "bg-[#15171c]" : "bg-[#1a1c22] hover:bg-[#15171c]"
              }`}
            >
              <span
                className={`font-medium text-sm md:text-base ${isOpenMain ? "text-[#ef443b]" : "text-[#a3a9b7]"}`}
              >
                {faq.question}
              </span>
              {isOpenMain ? (
                <ChevronUp className="w-4 h-4 text-[#a3a9b7]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#a3a9b7]" />
              )}
            </div>
            <AnimatePresence>
              {isOpenMain && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 pt-0 bg-[#15171c] text-sm md:text-base text-[#a3a9b7] font-light text-[15px] leading-relaxed leading-relaxed">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: faq.answer.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong class="text-[#ef443b]">$1</strong>',
                        ),
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sub Q&A (if exists) */}
          {faq.historyText && (
            <div className="border border-white/5 rounded-lg overflow-hidden">
              <div
                onClick={() => setIsOpenSub(!isOpenSub)}
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                  isOpenSub ? "bg-[#15171c]" : "bg-[#1a1c22] hover:bg-[#15171c]"
                }`}
              >
                <span
                  className={`font-medium text-sm md:text-base ${isOpenSub ? "text-[#ef443b]" : "text-[#a3a9b7]"}`}
                >
                  {faq.historyText}
                </span>
                {isOpenSub ? (
                  <Minus className="w-3.5 h-3.5 text-[#a3a9b7]" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-[#a3a9b7]" />
                )}
              </div>
              <AnimatePresence>
                {isOpenSub && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 pt-0 bg-[#15171c] text-sm md:text-base text-[#a3a9b7] font-light text-[15px] leading-relaxed leading-relaxed">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: faq.historyAnswer?.replace(
                            /\*\*(.*?)\*\*/g,
                            "<strong>$1</strong>",
                          ),
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        {/* Bottom accent bar */}
        <div className="h-0.5 bg-[#ef443b] w-0 group-hover:w-full transition-all duration-500 ease-out" />
      </div>
    </motion.div>
  );
};

const FaqSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <>
      
      <div id="faq" className="font-technical dark w-full bg-[#111418] text-[#eceff4] text-base min-h-screen">
        {/* HERO SECTION */}
<div className="w-full relative z-10 pt-32 pb-32 sm:pt-40 sm:pb-40 bg-cover bg-center font-technical" style={{ backgroundImage: "linear-gradient(to right, rgba(17, 20, 24, 0.95), rgba(17, 20, 24, 0.7)), url('https://png.pngtree.com/thumb_back/fh260/background/20220729/pngtree-3d-man-presenting-faq-concept-concept-frequetly-asked-question-isolated-photo-image_19292830.jpg')" }}>
 <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
 <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
 <div className="flex items-center justify-center gap-3 mb-6">
 <span className="text-[#ef443b] font-mono text-sm font-bold uppercase tracking-[3px]">
 Support Center
 </span>
 <div className="hidden sm:block h-[1px] w-12 bg-[#ef443b]/30" />
 </div>

 <motion.h1
 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white mb-6 tracking-tight font-technical"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 >
 <span className="font-light block">Frequently Asked</span>
 <span className="font-bold text-[#ef443b] block mt-2">Questions</span>
 </motion.h1>

 <p className="text-[#a3a9b7] font-light text-lg md:text-xl leading-relaxed mb-10 font-light max-w-2xl mx-auto font-technical">
 Find answers about file uploads, AI takeoff, cost calculation, and exporting quotes quickly and effortlessly.
 </p>

 <div className="flex h-14 w-full max-w-lg border border-white/20 rounded-md overflow-hidden bg-black/40 backdrop-blur-sm mx-auto shadow-2xl">
    <div className="flex-1 flex items-center px-4">
      <Search className="w-5 h-5 text-[#a3a9b7] font-light text-[15px] leading-relaxed mr-3" />
      <input
        type="text"
        placeholder="Search by topic or keyword..."
        className="w-full text-base font-light text-white placeholder-[#a3a9b7] focus:outline-none bg-transparent"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
    <button className="h-full px-8 bg-[#ef443b] text-white font-bold text-sm uppercase tracking-[1.5px] hover:bg-[#d83a31] transition-colors shadow-[0_0_20px_rgba(239,68,59,0.3)] hover:shadow-[0_0_30px_rgba(239,68,59,0.5)]">
      Search
    </button>
 </div>
 </div>
 </div>
 </div>

        {/* MAIN CONTENT */}
        <main className="max-w-[1200px] mx-auto flex py-16 px-5 gap-10">
          <CategorySidebar />
          <div className="w-full md:flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm md:text-base text-[#a3a9b7] font-light text-[15px] leading-relaxed mb-8 pb-4">
              <span className="font-medium text-white tracking-wide font-technical text-lg">
                Displaying <span className="text-[#ef443b]">3</span> Entries
              </span>
              <div className="flex items-center gap-4 mt-3 sm:mt-0">
                <span className="font-medium tracking-wide text-[#a3a9b7] font-technical text-[15px]">
                  Sort By:
                </span>
                <select className="bg-transparent font-medium text-[#ef443b] focus:outline-none cursor-pointer tracking-wide text-sm font-technical">
                  <option>Relevance</option>
                  <option>Date Added</option>
                  <option>ID</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {mockFaqResults.map((faq, index) => (
                <FaqItem key={faq.id} faq={faq} index={index} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <button className="px-8 py-3 border border-white/10 text-[#ef443b] font-black text-xs uppercase tracking-[1.5px] hover:bg-[#ef443b] hover:text-white transition-all rounded-md">
                View All FAQs
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default FaqSection;

// Adjusted logo sizing and UI spacing

