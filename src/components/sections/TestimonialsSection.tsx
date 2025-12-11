import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

const THEME = {
  NAVY: "#002d5c",
  GREEN: "#5BB539",
  BORDER: "#d1d5db",
  TEXT_MAIN: "#1a1a1a",
  TEXT_MUTED: "#6b7280"
};

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      refId: "REF: 104-AB",
      quote:
        "Over the years, I’ve been impressed by JTech’s willingness to make software improvements based on user feedback. It truly feels like a technical partnership.",
      name: "Amy Baker",
      title: "Spec Writing Consultant & Architect",
      company: "ab ARCHITECT",
    },
    {
      id: 2,
      refId: "REF: 209-LH",
      quote:
        "The bidder client was particularly popular with our vendors due to its completeness check and the seamless integration of the GAEB standard.",
      name: "Lars Ohse",
      title: "Head of Procurement",
      company: "LEIPZIG-HALLE AIRPORT",
    },
    {
      id: 3,
      refId: "REF: 440-JT",
      quote:
        "JTech AI reduced our estimation time by 70% and improved accuracy by 40%. The AI-powered insights have transformed how we approach project budgeting.",
      name: "Michael Johnson",
      title: "Senior Estimator",
      company: "JTech AI Ltd",
    },
    {
      id: 4,
      refId: "REF: 992-UB",
      quote:
        "We're now able to bid on more projects with confidence. The platform's ability to learn from past data has been a game changer for our margins.",
      name: "Sarah Williams",
      title: "Project Director",
      company: "UrbanBuild Group",
    },
  ];

  const totalPages = Math.ceil(testimonials.length / 2);
  const currentPair = testimonials.slice(activeIndex * 2, activeIndex * 2 + 2);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="py-16 bg-white border-b border-[#e1e1e1] scroll-mt-28 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header – Smaller, tighter */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-6 h-[1.5px] bg-[#002d5c]"></span>
            <span className="text-[9px] font-bold uppercase tracking-[2.5px] text-gray-500">Feedback Matrix</span>
            <span className="w-6 h-[1.5px] bg-[#002d5c]"></span>
          </div>
          <h2 className="text-2xl md:text-3xl font-light text-[#001021]">
            <span>What Our</span>{" "}
            <span className="font-bold text-[#002d5c]">Clients Say</span>
          </h2>
        </div>

        {/* Slider Container – Compact */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Arrows – Slightly smaller, hidden on smaller screens */}
          <button
            onClick={prevSlide}
            className="absolute -left-12 top-1/2 -translate-y-1/2 p-2.5 text-[#002d5c] hover:bg-[#002d5c] hover:text-white border border-[#d1d5db] transition-all z-10 hidden md:flex items-center justify-center"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute -right-12 top-1/2 -translate-y-1/2 p-2.5 text-[#002d5c] hover:bg-[#002d5c] hover:text-white border border-[#d1d5db] transition-all z-10 hidden md:flex items-center justify-center"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Cards – Reduced padding, smaller text */}
          <div className="bg-white border border-[#d1d5db] shadow-sm p-0 overflow-hidden min-h-[300px] flex items-stretch">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-2 w-full divide-y md:divide-y-0 md:divide-x divide-[#d1d5db]"
              >
                {currentPair.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col p-6 md:p-8 hover:bg-[#fcfcfc] transition-colors relative group"
                  >
                    {/* Hover corner mark */}
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#002d5c] opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Metadata */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-8 h-8 bg-[#002d5c] flex items-center justify-center text-white">
                        <Quote className="w-3.5 h-3.5 fill-current transform scale-x-[-1]" strokeWidth={0} />
                      </div>
                      <span className="text-[8px] font-mono text-gray-400 font-bold uppercase tracking-widest">{item.refId}</span>
                    </div>

                    {/* Quote */}
                    <p className="text-[#1a1a1a] text-[13px] leading-relaxed mb-6 font-medium">
                      "{item.quote}"
                    </p>

                    {/* Author */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <h4 className="font-bold text-[#002d5c] text-sm tracking-tight">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-gray-600 font-medium mb-2 uppercase tracking-wide">
                        {item.title}
                      </p>
                      <div className="text-[9px] font-black uppercase tracking-[1.5px] text-gray-400 group-hover:text-[#5BB539] transition-colors">
                        {item.company}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination – Smaller rectangles */}
          <div className="flex justify-center mt-6 gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1 transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-6 bg-[#002d5c]"
                    : "w-3 bg-[#d1d5db] hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}