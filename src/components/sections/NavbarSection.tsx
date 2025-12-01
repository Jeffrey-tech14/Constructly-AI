// src/components/sections/NavbarSection.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  User,
  Search,
  Globe,
  Phone,
  ArrowRight
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";

// --- 1. GLOBAL STYLES (Professional Font) ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
  `}</style>
);

// --- 2. CONFIGURATION ---
const NAV_ITEMS = [
  "Who It's For",
  "How It Works",
  "Features",
  "Pricing",
  "Testimonials",
  "FAQ",
];

const THEME = {
  PRIMARY: "#005F9E", // Trimble-inspired blue
  ACCENT: "#5BB539", // Your CTA green
  TEXT_DARK: "#001226", // Your global dark text
};

interface NavbarProps {
  scrollTo: (sectionId: string) => void;
  setDemoOpen: (open: boolean) => void;
}

const NavbarSection: React.FC<NavbarProps> = ({ scrollTo, setDemoOpen }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (item: string) => {
    const id = item.toLowerCase().replace(/ /g, "-").replace(/'/g, "");
    scrollTo(id);
    setMenuOpen(false);
  };

  return (
    <>
      <GlobalStyles />
      
      {/* WRAPPER: Fixed positioning */}
      <div className={`fixed top-0 w-full z-50 font-inter transition-all duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}>
        
        {/* =========================================
            1. TOP UTILITY BAR (Dlubal Style)
        ========================================= */}
        <div className="bg-[#001021] text-white text-[11px] font-medium py-2 px-4 sm:px-6 lg:px-8 hidden md:block">
          <div className="max-w-[1440px] mx-auto flex justify-between items-center">
            
            {/* Left: Contact / Info */}
            <div className="flex items-center gap-6 opacity-90">
              <span className="flex items-center gap-2 hover:text-[#005F9E] cursor-pointer transition-colors">
                <Globe className="w-3 h-3" />
                Global / English
              </span>
              <span className="flex items-center gap-2 hover:text-[#005F9E] cursor-pointer transition-colors">
                <Phone className="w-3 h-3" />
                +254 706 927062
              </span>
            </div>

            {/* Right: Login / Support */}
            <div className="flex items-center gap-6">
              <button className="hover:text-[#005F9E] transition-colors">Support</button>
              <button 
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2 hover:text-[#005F9E] transition-colors font-semibold"
              >
                <User className="w-3 h-3" />
                Log in
              </button>
            </div>
          </div>
        </div>

        {/* =========================================
            2. MAIN NAVBAR (White Background)
        ========================================= */}
        <nav className="bg-white border-b border-gray-200 h-[72px] flex items-center">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex items-center justify-between">
              
              {/* LOGO AREA */}
              <div
                className="flex items-center gap-2.5 cursor-pointer pr-8"
                onClick={() => navigate("/")}
              >
                <div 
                  className="flex items-center justify-center w-9 h-9 rounded text-white font-extrabold text-lg shadow-sm"
                  style={{ backgroundColor: THEME.TEXT_DARK }}
                >
                  J
                </div>
                <span 
                  className="text-xl font-extrabold tracking-tight hidden sm:block"
                  style={{ color: THEME.TEXT_DARK }}
                >
                  JTech <span style={{ color: THEME.PRIMARY }}>AI</span>
                </span>
              </div>

              {/* DESKTOP NAVIGATION */}
              <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="group relative px-4 py-6 text-sm font-bold text-[#001021] hover:text-[#005F9E] transition-colors"
                  >
                    {item}
                    <span 
                      className="absolute bottom-0 left-0 w-full h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out" 
                      style={{ backgroundColor: THEME.PRIMARY }}
                    />
                  </button>
                ))}
              </div>

              {/* UTILITY ACTIONS */}
              <div className="flex items-center gap-3 pl-4">
                
                {/* Search */}
                <button className="p-2.5 text-gray-500 hover:text-[#005F9E] hover:bg-gray-50 rounded-full transition-all">
                  <Search className="w-5 h-5" />
                </button>

                {/* CTA Button (Desktop) - UPDATED TO REDIRECT */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/auth?mode=signup")} // ✅ Redirects to Signup
                  className="hidden sm:flex text-white text-[13px] font-bold px-6 py-2.5 rounded shadow-sm transition-colors items-center gap-2"
                  style={{ backgroundColor: THEME.ACCENT }}
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>

                {/* MOBILE MENU TRIGGER */}
                <div className="lg:hidden ml-1">
                  <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                      <button className="p-2 text-[#001021] hover:bg-gray-100 rounded transition-colors">
                        <Menu className="h-6 w-6" />
                      </button>
                    </SheetTrigger>
                    
                    <SheetContent side="right" className="bg-white w-[300px] p-0 font-inter border-l border-gray-200">
                      
                      {/* Mobile Header */}
                      <div className="text-white p-6" style={{ backgroundColor: THEME.TEXT_DARK }}>
                        <span className="text-lg font-bold">Menu</span>
                      </div>

                      <div className="flex flex-col p-6 gap-2">
                        {/* Mobile Links */}
                        {NAV_ITEMS.map((item) => (
                          <button
                            key={item}
                            onClick={() => scrollToSection(item)}
                            className="text-left font-semibold text-lg py-3 border-b border-gray-100 hover:pl-2 transition-all"
                            style={{ color: THEME.TEXT_DARK }}
                          >
                            {item}
                          </button>
                        ))}

                        <div className="mt-8 flex flex-col gap-4">
                          <button
                            onClick={() => navigate("/auth")}
                            className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 font-bold rounded hover:bg-gray-50 transition-colors"
                            style={{ color: THEME.TEXT_DARK }}
                          >
                            <User className="h-4 w-4" /> Log in
                          </button>
                          
                          {/* CTA Button (Mobile) - UPDATED TO REDIRECT */}
                          <button
                            onClick={() => {
                              navigate("/auth?mode=signup"); // ✅ Redirects to Signup
                              setMenuOpen(false);
                            }}
                            className="w-full text-white font-bold py-3 rounded shadow-md transition-colors"
                            style={{ backgroundColor: THEME.ACCENT }}
                          >
                            Get Started
                          </button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

              </div>
            </div>
          </div>
        </nav>
      </div>
      
      {/* Spacer */}
      <div className="h-[72px] md:h-[108px]" />
    </>
  );
};

export default NavbarSection;