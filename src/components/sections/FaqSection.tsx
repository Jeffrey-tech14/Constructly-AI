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
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #00356B; border-radius: 2px; }
  `}</style>
);

// Updated theme to use your brand blue
const THEME = {
  brandBlue: "#00356B",
  accentGreen: "#86bc25", // matching your other sections
  bgLight: "#f8f9fa",
  textDark: "#1a1a1a",
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
    <div className="bg-white border border-[#d1d5db] rounded-xl shadow-sm mb-6 sticky top-24 overflow-hidden">
      <div className="p-4 bg-[#f8f9fa] flex justify-between items-center">
        <span className="text-[10px] font-bold text-[#00356B] uppercase tracking-widest flex items-center gap-2">
          <Filter className="w-3 h-3" />
          Filters
        </span>
        <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {faqCategories.map((category, index) => (
          <label
            key={index}
            className="flex items-center text-[13px] font-medium text-gray-600 hover:text-[#00356B] cursor-pointer transition-colors group"
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 text-[#00356B] border-gray-300 focus:ring-[#00356B] mr-3 cursor-pointer"
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
        <div className="w-10 h-10 bg-[#eef5ff] flex items-center justify-center rounded-lg text-[#00356B] border border-[#d1d5db]">
          <IconComponent className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <div className="h-full w-px bg-[#e5e7eb] mt-4"></div>
      </div>

      {/* FAQ Card */}
      <div className="flex-grow bg-white border border-[#d1d5db] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[#00356B] text-[10px] font-bold font-mono bg-[#eef5ff] px-2 py-0.5 rounded uppercase tracking-wider">
              {faq.id}
            </span>
            {faq.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-bold text-[#00356B] mb-6 uppercase tracking-tight">
            {faq.title}
          </h3>

          {/* Main Q&A */}
          <div className="border border-[#e5e7eb] rounded-lg mb-4 overflow-hidden">
            <div
              onClick={() => setIsOpenMain(!isOpenMain)}
              className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                isOpenMain ? "bg-[#f8f9fa]" : "bg-white hover:bg-[#f8f9fa]"
              }`}
            >
              <span
                className={`font-medium text-[12px] ${isOpenMain ? "text-[#00356B]" : "text-gray-700"}`}
              >
                {faq.question}
              </span>
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
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4 pt-0 bg-[#f8f9fa] text-[12px] text-gray-600 leading-relaxed">
                    <p
                      dangerouslySetInnerHTML={{
                        __html: faq.answer.replace(
                          /\*\*(.*?)\*\*/g,
                          '<strong class="text-[#00356B]">$1</strong>',
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
            <div className="border border-[#e5e7eb] rounded-lg overflow-hidden">
              <div
                onClick={() => setIsOpenSub(!isOpenSub)}
                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                  isOpenSub ? "bg-[#f8f9fa]" : "bg-white hover:bg-[#f8f9fa]"
                }`}
              >
                <span
                  className={`font-medium text-[12px] ${isOpenSub ? "text-[#00356B]" : "text-gray-500"}`}
                >
                  {faq.historyText}
                </span>
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
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-4 pt-0 bg-[#f8f9fa] text-[12px] text-gray-600 leading-relaxed">
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
        <div className="h-0.5 bg-[#00356B] w-0 group-hover:w-full transition-all duration-500 ease-out" />
      </div>
    </motion.div>
  );
};

const FaqSection = () => {
  return (
    <>
      <GlobalStyles />
      <div id="faq" className="w-full font-technical bg-white min-h-screen">
        {/* HERO SECTION – Redesigned to be clean & professional */}
        <div className="w-full bg-gradient-to-b from-white to-[#f8f9fa] py-16">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="w-full max-w-lg">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[#00356B] font-mono text-[10px] font-bold uppercase tracking-[3px]">
                    Support Center
                  </span>
                  <div className="h-[1px] w-12 bg-[#00356B]/30" />
                </div>

                <motion.h1
                  className="text-3xl md:text-4xl leading-[1.2] text-[#1a1a1a] mb-6 tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="font-light block">Estimation</span>
                  <span className="font-bold text-[#00356B] block mt-1">
                    Support Hub
                  </span>
                </motion.h1>

                <p className="text-gray-600 text-[13px] leading-relaxed mb-8 font-medium max-w-sm">
                  Find answers about file uploads, AI takeoff, cost calculation,
                  and exporting quotes.
                </p>

                {/* Search Bar – Sharper, matches your form style */}
                <div className="flex h-12 w-full border border-[#d1d5db] rounded-md overflow-hidden shadow-sm">
                  <div className="flex-1 flex items-center px-4 bg-white">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search by topic or keyword..."
                      className="w-full text-[12px] font-medium text-[#1a1a1a] placeholder-gray-400 focus:outline-none bg-transparent"
                    />
                  </div>
                  <button className="h-full px-6 bg-[#00356B] text-white font-black text-[10px] uppercase tracking-[1.5px] hover:bg-[#002a54] transition-colors">
                    Search
                  </button>
                </div>
              </div>

              {/* Optional: Keep video or replace with illustration */}
              <div className="hidden lg:block relative h-64 w-full border border-[#d1d5db] rounded-xl bg-[#f8f9fa] flex items-center justify-center">
                <div className="text-center text-gray-500 text-sm">
                  <Play className="w-10 h-10 mx-auto text-[#00356B] mb-2" />
                  <span>Technical Workflow Demo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main className="max-w-[1200px] mx-auto flex py-16 px-5 gap-10">
          <CategorySidebar />
          <div className="w-full md:flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between text-[12px] text-gray-500 mb-8 pb-4">
              <span className="font-bold text-[#1a1a1a] uppercase tracking-wider">
                Displaying <span className="text-[#00356B]">3</span> Entries
              </span>
              <div className="flex items-center gap-4 mt-3 sm:mt-0">
                <span className="font-bold uppercase tracking-wider text-gray-500">
                  Sort By:
                </span>
                <select className="bg-transparent font-bold text-[#00356B] focus:outline-none cursor-pointer uppercase tracking-wide text-[11px]">
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
              <button className="px-8 py-3 border border-[#d1d5db] text-[#00356B] font-black text-[10px] uppercase tracking-[1.5px] hover:bg-[#00356B] hover:text-white transition-all rounded-md">
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
