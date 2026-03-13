// src/components/sections/CTABanner.tsx
import { motion } from "framer-motion";

// JTech AI Logo Component
const JTechAILogo = () => (
  <img
    src="https://jtechai.vercel.app/jtech-logo-transparent.png"
    alt="JTech AI Logo"
    className="cursor-pointer h-9 w-auto"
  />
  // <svg
  //   width="80"
  //   height="20"
  //   viewBox="0 0 135 36"
  //   fill="none"
  //   xmlns="http://www.w3.org/2000/svg"
  // >
  //   <path d="M19.2857 11.25H12.8571V15.75H19.2857V11.25Z" fill="#ffffff" />
  //   <path d="M19.2857 20.25H12.8571V24.75H19.2857V20.25Z" fill="#ffffff" />
  //   <path d="M9.64286 6.75H25.7143V2.25H9.64286V6.75Z" fill="#ffffff" />
  //   <path d="M9.64286 29.25H25.7143V24.75H9.64286V29.25Z" fill="#ffffff" />
  //   <path d="M6.42857 11.25H0V24.75H6.42857V11.25Z" fill="#ffffff" />
  //   <path d="M32.1429 11.25H25.7143V24.75H32.1429V11.25Z" fill="#ffffff" />
  //   <path d="M38.5714 15.75H32.1429V20.25H38.5714V15.75Z" fill="#ffffff" />
  //   <circle cx="22.5" cy="13.5" r="2.25" fill="#86bc25" />
  //   <circle cx="22.5" cy="22.5" r="2.25" fill="#86bc25" />
  //   <path d="M22.5 15.75V20.25" stroke="#86bc25" strokeWidth="1.5" />
  //   <text
  //     x="45"
  //     y="24"
  //     fontFamily="system-ui, sans-serif"
  //     fontWeight="800"
  //     fontSize="22"
  //     fill="#ffffff"
  //   >
  //     JTech
  //   </text>
  //   <text
  //     x="108"
  //     y="24"
  //     fontFamily="system-ui, sans-serif"
  //     fontWeight="800"
  //     fontSize="22"
  //     fill="#86bc25"
  //   >
  //     AI
  //   </text>
  // </svg>
);

const GlobalStyles = () => (
  <style>{`
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .animate-shimmer::before {
      animation: shimmer 3s infinite;
    }
  `}</style>
);

interface CTABannerProps {
  scrollTo: (id: string) => void;
}

export default function CTABanner({ scrollTo }: CTABannerProps) {
  const handleButtonClick = () => {
    scrollTo("testimonials");
  };

  return (
    <>
      <GlobalStyles />
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="w-full max-w-7xl mx-auto p-8 rounded-xl shadow-2xl bg-gradient-to-br from-[#00356B] via-[#002a54] to-[#001a3d] border border-[#004a80] flex justify-center relative overflow-hidden animate-shimmer"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-5xl">
            {/* Left Side: Text Content */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Share Your Success with Our Software!
              </h2>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed font-normal">
                Showcase your projects created using our solutions and gain
                increased visibility on our website, social networks, and in
                industry journals, along with a discount on our software.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <motion.button
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 8px 25px rgba(216, 92, 44, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleButtonClick}
                  className="bg-[#D85C2C] text-white px-8 py-4 text-sm font-black uppercase tracking-wider rounded-md hover:bg-[#c2451e] transition-all duration-300 shadow-lg border-2 border-[#D85C2C] hover:border-[#ff6b4a]"
                >
                  Share Your Project and Benefit
                </motion.button>
                <button
                  onClick={() => scrollTo("faq")}
                  className="border-2 border-white/30 text-white px-8 py-4 text-sm font-bold uppercase tracking-wider rounded-md hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                >
                  Learn More First
                </button>
              </div>
            </div>

            {/* Right Side: Icon */}
            <div className="hidden md:flex justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white/20">
                <JTechAILogo />
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
