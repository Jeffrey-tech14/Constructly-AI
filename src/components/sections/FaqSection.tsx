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

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #002d5c; border-radius: 0px; }
  `}</style>
);

// --- THEME COLORS (Engineering Palette) ---
const THEME = {
  headerBackground: "#001021",
  brandBlue: "#002d5c", // Navy
  accentGreen: "#5BB539",
  bgLight: "#F5F7FA",
  textDark: "#1a1a1a",
};

// --- UPDATED CATEGORIES (aligned with real features) ---
const faqCategories = [
  { name: "Getting Started", checked: true },
  { name: "File Upload", checked: false },
  { name: "AI Takeoff", checked: false },
  { name: "Cost Calculation", checked: false },
  { name: "Export & Quotes", checked: false },
  { name: "Account & Billing", checked: false },
  { name: "Troubleshooting", checked: false },
];

// --- REALISTIC FAQ CONTENT (no overpromising) ---
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

// --- COMPONENTS (UNCHANGED STRUCTURE) ---

const CategorySidebar = () => (
  <aside className="w-full max-w-[220px] hidden md:block flex-shrink-0">
    <div className="bg-white border border-[#d1d5db] shadow-sm mb-6 sticky top-24">
      <div className="p-4 bg-[#f8f9fa] border-b border-[#d1d5db] flex justify-between items-center">
        <span className="text-[10px] font-bold text-[#002d5c] uppercase tracking-widest flex items-center gap-2">
          <Database className="w-3 h-3" /> Filters
        </span>
        <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {faqCategories.map((category, index) => (
          <label
            key={index}
            className="flex items-center text-[13px] font-medium text-gray-600 hover:text-[#002d5c] cursor-pointer transition-colors group"
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 text-[#002d5c] border-gray-300  focus:ring-[#002d5c] mr-3 cursor-pointer"
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
      <div className="hidden md:flex flex-col items-center pt-2 w-10 flex-shrink-0">
        <div className="w-10 h-10 bg-white flex items-center justify-center border border-[#d1d5db] text-[#002d5c] shadow-sm">
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="h-full w-px bg-[#e5e7eb] mt-4 border-l border-dashed border-gray-300"></div>
      </div>

      <div className="flex-grow bg-white border border-[#d1d5db] shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-[#002d5c] text-[10px] font-bold font-mono border border-[#002d5c]/20 bg-[#002d5c]/5 px-2 py-0.5 uppercase tracking-wider">
              {faq.id}
            </span>
            {faq.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500 border border-gray-200"
              >
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-lg font-bold text-[#001021] mb-6 uppercase tracking-tight">
            {faq.title}
          </h3>

          <div className="border border-[#e5e7eb] mb-3">
            <div
              onClick={() => setIsOpenMain(!isOpenMain)}
              className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                isOpenMain ? "bg-[#f8f9fa]" : "bg-white hover:bg-[#f8f9fa]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold text-sm ${
                    isOpenMain ? "text-[#002d5c]" : "text-gray-700"
                  }`}
                >
                  {faq.question}
                </span>
              </div>
              {isOpenMain ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <AnimatePresence>
              {isOpenMain && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 bg-[#f8f9fa] border-t border-[#e5e7eb] text-sm text-gray-600 leading-relaxed font-medium">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: faq.answer.replace(
                          /\*\*(.*?)\*\*/g,
                          "<strong class='text-[#002d5c]'>$1</strong>"
                        ),
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {faq.historyText && (
            <div className="border border-[#e5e7eb]">
              <div
                onClick={() => setIsOpenSub(!isOpenSub)}
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                  isOpenSub ? "bg-[#f8f9fa]" : "bg-white hover:bg-[#f8f9fa]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold text-sm ${
                      isOpenSub ? "text-[#002d5c]" : "text-gray-500"
                    }`}
                  >
                    {faq.historyText}
                  </span>
                </div>
                {isOpenSub ? (
                  <Minus className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                )}
              </div>
              <AnimatePresence>
                {isOpenSub && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 bg-[#f8f9fa] border-t border-[#e5e7eb] text-sm text-gray-600 leading-relaxed">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: faq.historyAnswer?.replace(
                            /\*\*(.*?)\*\*/g,
                            "<strong>$1</strong>"
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
        <div className="h-[2px] bg-[#002d5c] w-0 group-hover:w-full transition-all duration-500 ease-out" />
      </div>
    </motion.div>
  );
};

// --- MAIN PAGE COMPONENT (unchanged structure) ---
const FaqSection = () => {
  return (
    <>
      <GlobalStyles />
      <div id="faq" className="w-full font-technical bg-white min-h-screen">
        {/* HERO SECTION */}
        <div
          className="w-full relative overflow-hidden h-[400px] border-b border-[#002d5c]"
          style={{ backgroundColor: THEME.headerBackground }}
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="max-w-[1200px] mx-auto px-5 h-full flex items-center relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-16 items-center">
              <div className="w-full max-w-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[#5BB539] font-mono text-[10px] font-bold uppercase tracking-[3px]">
                    Support Center
                  </span>
                  <div className="h-[1px] w-12 bg-[#5BB539]/50" />
                </div>

                <motion.h1
                  className="text-4xl lg:text-5xl leading-[1.1] text-white mb-6 tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="font-light block">Estimation</span>
                  <span className="font-extrabold block mt-1">Support Hub</span>
                </motion.h1>

                <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium max-w-sm">
                  Find answers about file uploads, AI takeoff, cost calculation,
                  and exporting quotes.
                </p>

                <div className="flex bg-white h-12 w-full shadow-2xl border border-white/10">
                  <div className="flex-1 flex items-center px-4">
                    <input
                      type="text"
                      placeholder="Search by topic or keyword..."
                      className="w-full text-xs font-bold text-[#001021] placeholder-gray-400 focus:outline-none bg-transparent uppercase tracking-wide"
                    />
                  </div>
                  <button
                    className="h-full px-8 font-black text-white text-[10px] uppercase tracking-[2px] transition-colors hover:bg-[#004182]"
                    style={{ backgroundColor: THEME.brandBlue }}
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Technical Video Container (unchanged) */}
              <div className="hidden lg:block relative h-64 w-full border border-white/20 bg-black/50 backdrop-blur-sm p-2">
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/50" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/50" />

                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-80"
                >
                  <source src="/demo.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="max-w-[1200px] mx-auto flex py-16 px-5 gap-10 bg-white">
          <CategorySidebar />
          <div className="w-full md:flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 mb-8 pb-4 border-b border-[#e5e7eb]">
              <span className="font-bold text-[#001021] uppercase tracking-wider">
                Displaying <span className="text-[#002d5c]">3</span> Entries
              </span>
              <div className="flex items-center gap-4 mt-3 sm:mt-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-gray-400">
                    Sort By:
                  </span>
                  <select className="bg-transparent font-bold text-[#002d5c] focus:outline-none cursor-pointer uppercase tracking-wide">
                    <option>Relevance</option>
                    <option>Date Added</option>
                    <option>ID</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {mockFaqResults.map((faq, index) => (
                <FaqItem key={faq.id} faq={faq} index={index} />
              ))}
            </div>

            <div className="mt-12 text-center">
              <button className="px-8 py-4 border border-[#d1d5db] text-[#002d5c] font-black text-[10px] uppercase tracking-[2px] hover:bg-[#002d5c] hover:text-white transition-all">
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
