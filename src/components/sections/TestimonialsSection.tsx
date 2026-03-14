import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

// Match RIB's color palette and design language
const THEME = {
  PRIMARY: "#00356B", // RIB blue
  LIGHT_BLUE_BG: "#eef5ff",
  WHITE: "#ffffff",
  BLACK: "#000000",
  TEXT_DARK: "#363d42",
  TEXT_LIGHT: "#6c757d",
  BORDER: "#d9d9d6",
  SHADOW: "0 6px 34px 0 rgba(0,0,0,0.05)",
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
    <section
      id="testimonials"
      className="py-16 bg-[#eef5ff] scroll-mt-28" // RIB light blue background
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#000000]">
            <span>What Our</span>{" "}
            <span className="text-[#00356B]">Clients Say</span>
          </h2>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Navigation Arrows (Desktop Only) */}
          <button
            onClick={prevSlide}
            className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-[#00356B] hover:bg-[#00356B] hover:text-white border border-[#d9d9d6] rounded-md transition-all z-10 hidden md:flex items-center justify-center"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 text-[#00356B] hover:bg-[#00356B] hover:text-white border border-[#d9d9d6] rounded-md transition-all z-10 hidden md:flex items-center justify-center"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Testimonial Cards */}
          <div
            className="bg-white rounded-lg shadow-[0_6px_34px_0_rgba(0,0,0,0.05)] overflow-hidden min-h-[320px]"
            style={{ border: `1px solid ${THEME.BORDER}` }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-2 w-full divide-y md:divide-y-0 md:divide-x"
                style={{ borderColor: THEME.BORDER }}
              >
                {currentPair.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col p-6 md:p-7 transition-colors"
                  >
                    {/* Quote Icon & Ref ID */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-8 h-8 bg-[#00356B] rounded-full flex items-center justify-center text-white">
                        <Quote
                          className="w-4 h-4 fill-current"
                          strokeWidth={0}
                        />
                      </div>
                      <span className="text-xs font-mono text-[#6c757d] font-bold uppercase tracking-widest">
                        {item.refId}
                      </span>
                    </div>

                    {/* Quote Text */}
                    <p className="text-[#363d42] text-sm leading-relaxed mb-6 font-normal">
                      “{item.quote}”
                    </p>

                    {/* Author Info */}
                    <div className="mt-auto pt-4 border-t border-[#d9d9d6]">
                      <h4 className="font-bold text-[#00356B] text-base">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#6c757d] font-medium mb-1">
                        {item.title}
                      </p>
                      <div className="text-xs font-bold text-[#363d42] uppercase tracking-wide">
                        {item.company}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Go to testimonial slide ${idx + 1}`}
                className={`h-2 transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-8 bg-[#00356B]"
                    : "w-2 bg-[#d9d9d6] hover:bg-[#b0b0b0]"
                }`}
                style={{ borderRadius: "9999px" }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
