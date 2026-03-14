import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Testimonial = {
  id: number;
  company: string;
  name: string;
  quote: string;
  imageUrl: string;
  overlay: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    company: "JTech AI Ltd",
    name: "Michael Johnson",
    quote:
      "JTech AI reduced our estimation time by 70% and improved accuracy by 40%. The AI-powered insights have transformed how we approach project budgeting.",
    imageUrl:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    overlay: "rgba(126, 64, 160, 0.32)",
  },
  {
    id: 2,
    company: "UrbanBuild Group",
    name: "Sarah Williams",
    quote:
      "We're now able to bid on more projects with confidence. The platform's ability to learn from past data has been a game changer for our margins.",
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    overlay: "rgba(203, 84, 84, 0.34)",
  },
  {
    id: 3,
    company: "BuildPro Inc",
    name: "David Chen",
    quote:
      "The automated BOQ generation has saved my team countless hours. We can finally focus on project delivery rather than administrative paperwork.",
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    overlay: "rgba(65, 31, 76, 0.34)",
  },
  {
    id: 4,
    company: "Leipzig-Halle Airport",
    name: "Lars Ohse",
    quote:
      "The bidder workflow is particularly popular with our vendors because the completeness checks and standards alignment are excellent.",
    imageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    overlay: "rgba(52, 76, 142, 0.32)",
  },
  {
    id: 5,
    company: "ab ARCHITECT",
    name: "Amy Baker",
    quote:
      "I've been impressed by JTech's willingness to improve the product based on real user feedback. It feels like a true technical partnership.",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    overlay: "rgba(142, 71, 132, 0.33)",
  },
  {
    id: 6,
    company: "Delta Constructors",
    name: "Daniel Reed",
    quote:
      "The platform gives us clear traceability from quantities to costs. That clarity improved trust with clients and internal teams.",
    imageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    overlay: "rgba(176, 72, 70, 0.34)",
  },
];

const PER_VIEW = 3;

export default function TestimonialsSection() {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const totalPages = Math.ceil(testimonials.length / PER_VIEW);

  const pages = useMemo(() => {
    const arr: Testimonial[][] = [];
    for (let i = 0; i < testimonials.length; i += PER_VIEW) {
      arr.push(testimonials.slice(i, i + PER_VIEW));
    }
    return arr;
  }, []);

  const nextSlide = () => {
    setDirection(1);
    setPage((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setDirection(-1);
    setPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 6500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="testimonials"
      className="py-20 testimonials-bg scroll-mt-28 relative overflow-hidden"
      style={{
        fontFamily: "'Outfit', sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <style>{`
        .testimonials-bg {
          background:
            radial-gradient(1000px 420px at 8% 96%, rgba(240,81,78,0.08), transparent 60%),
            radial-gradient(900px 380px at 92% 12%, rgba(240,81,78,0.06), transparent 62%),
            #1a1b22;
        }
        .testimonials-bg::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.24;
          background-image:
            repeating-linear-gradient(
              135deg,
              transparent 0,
              transparent 220px,
              rgba(240,81,78,0.28) 221px,
              transparent 222px,
              transparent 520px
            );
        }
      `}</style>

      <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-white text-2xl md:text-[42px] font-normal tracking-tight mb-11 md:mb-12 relative z-10">
          What Our Clients Say
        </h2>

        <div className="relative z-10">
          

          

          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? -110 : 110 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? 110 : -110 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
              >
                {pages[page].map((item, idx) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: idx * 0.12 }}
                    className="group"
                  >
                    <div className="relative h-[220px] md:h-[250px] overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={`${item.name} testimonial`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: item.overlay }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-[#f05847] text-[14px] md:text-[16px] font-medium">
                          {item.company}
                        </p>
                        <div className="h-[2px] w-16 bg-[#f05847] mt-1" />
                      </div>
                    </div>

                    <div className="pt-4">
                      <h3 className="text-[#f05847] text-[32px] md:text-[40px] font-medium leading-[1.05] tracking-tight">
                        {item.name}
                      </h3>
                      <p className="mt-2.5 text-white/92 text-[12px] md:text-[13px] leading-relaxed font-medium">
                        “{item.quote}”
                      </p>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > page ? 1 : -1);
                setPage(idx);
              }}
              aria-label={`Go to testimonial page ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === page ? "w-9 bg-[#f05847]" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

