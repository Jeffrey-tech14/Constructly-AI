// src/components/sections/Footer.tsx
import { motion } from "framer-motion";
import { 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  Linkedin, 
  Twitter, 
  Facebook 
} from "lucide-react";

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
  `}</style>
);

const Footer = ({ scrollTo }: { scrollTo: (section: string) => void }) => {
  
  const links = [
    { label: "Features & Capabilities", id: "features" },
    { label: "Pricing Plans", id: "pricing" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Success Stories", id: "testimonials" },
    { label: "Support & FAQs", id: "faq" },
  ];

  return (
    <>
      <GlobalStyles />
      <footer 
        id="contact" 
        // ✅ BACKGROUND MATCHED: Light Blue from your image
        className="bg-[#F0F7FA] border-t border-[#E1EBF2] pt-20 pb-10 font-inter text-[#1a1a1a]"
      >
        <div className="max-w-[1250px] mx-auto px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            
            {/* COLUMN 1: BRANDING & LOGO */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-3 mb-6">
                {/* BOLD 'J' LOGO */}
                <div className="w-10 h-10 bg-[#005F9E] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                   <span className="text-white font-extrabold text-2xl tracking-tighter">J</span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#001021]">
                  JTech <span className="text-[#005F9E]">AI</span>
                </h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-xs font-medium">
                Next-generation construction estimation powered by artificial intelligence. Built for precision, speed, and reliability.
              </p>
              
              {/* Social Icons (White bg to pop against light blue) */}
              <div className="flex gap-3">
                {[Linkedin, Twitter, Facebook].map((Icon, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-500 hover:bg-[#005F9E] hover:text-white transition-all duration-300 shadow-sm border border-gray-100"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* COLUMN 2: PLATFORM LINKS */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#005F9E] mb-6">
                Platform
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="text-gray-600 hover:text-[#005F9E] hover:translate-x-1 transition-all duration-300 text-sm font-medium flex items-center gap-2"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3: CONTACT INFO */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#005F9E] mb-6">
                Contact
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-[#005F9E] shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed font-medium">
                    JTech Plaza, 4th Floor<br/>
                    Nairobi, Kenya<br/>
                    East Africa
                  </span>
                </div>
                
                <a href="tel:+254706927062" className="flex items-center gap-3 text-gray-600 hover:text-[#005F9E] transition-colors">
                  <Phone className="w-5 h-5 text-[#005F9E] shrink-0" />
                  <span className="text-sm font-bold">+254 706 927062</span>
                </a>

                <a href="mailto:support@jtechai.com" className="flex items-center gap-3 text-gray-600 hover:text-[#005F9E] transition-colors">
                  <Mail className="w-5 h-5 text-[#005F9E] shrink-0" />
                  <span className="text-sm font-bold">support@jtechai.com</span>
                </a>
              </div>
            </div>

            {/* COLUMN 4: NEWSLETTER */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#005F9E] mb-6">
                Stay Updated
              </h3>
              <p className="text-gray-600 text-sm mb-4 font-medium">
                Subscribe to our newsletter for the latest AI engineering updates.
              </p>
              <div className="relative">
                {/* White Input to contrast with Light Blue Background */}
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white border border-gray-200 rounded-lg py-3 px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#005F9E] focus:ring-1 focus:ring-[#005F9E] shadow-sm transition-all"
                />
                <button className="absolute right-1 top-1 bottom-1 bg-[#005F9E] hover:bg-blue-700 text-white p-2 rounded-md transition-colors shadow-sm">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* BOTTOM BAR */}
          <div className="border-t border-[#E1EBF2] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 font-medium">
              © {new Date().getFullYear()} JTech AI. All rights reserved.
            </p>
            
            <div className="flex gap-6">
              <a href="#" className="text-xs text-gray-500 hover:text-[#005F9E] transition-colors font-medium">Privacy Policy</a>
              <a href="#" className="text-xs text-gray-500 hover:text-[#005F9E] transition-colors font-medium">Terms of Service</a>
              <a href="#" className="text-xs text-gray-500 hover:text-[#005F9E] transition-colors font-medium">Cookie Settings</a>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
};

export default Footer;