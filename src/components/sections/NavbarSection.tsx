import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  User,
  Search,
  Globe,
  Phone,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

// --- Global Styles (Technical Font) ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; }
  `}</style>
);

const NAV_ITEMS = [
  "Who It's For",
  "How It Works",
  "Features",
  "Pricing",
  "Testimonials",
  "FAQ",
];

// --- ENGINEERING PALETTE ---
const THEME = {
  NAVY: "#002d5c",
  ACCENT: "#5BB539",
  TEXT_DARK: "#001226",
  LOGO_DARK: "#002855",
  LOGO_LIGHT: "#0077B6",
  BORDER: "#d1d5db",
  BG_UTILITY: "#f8f9fa",
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

  // ✅ WIDENED & POLISHED LOGO
  const JTechAILogo = () => (
    <svg
      width="160"
      height="36"
      viewBox="0 0 135 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-200"
    >
      <path
        d="M19.2857 11.25H12.8571V15.75H19.2857V11.25Z"
        fill={THEME.LOGO_DARK}
      />
      <path
        d="M19.2857 20.25H12.8571V24.75H19.2857V20.25Z"
        fill={THEME.LOGO_DARK}
      />
      <path
        d="M9.64286 6.75H25.7143V2.25H9.64286V6.75Z"
        fill={THEME.LOGO_DARK}
      />
      <path
        d="M9.64286 29.25H25.7143V24.75H9.64286V29.25Z"
        fill={THEME.LOGO_DARK}
      />
      <path d="M6.42857 11.25H0V24.75H6.42857V11.25Z" fill={THEME.LOGO_DARK} />
      <path
        d="M32.1429 11.25H25.7143V24.75H32.1429V11.25Z"
        fill={THEME.LOGO_DARK}
      />
      <path
        d="M38.5714 15.75H32.1429V20.25H38.5714V15.75Z"
        fill={THEME.LOGO_DARK}
      />
      <circle cx="22.5" cy="13.5" r="2.25" fill={THEME.LOGO_LIGHT} />
      <circle cx="22.5" cy="22.5" r="2.25" fill={THEME.LOGO_LIGHT} />
      <path d="M22.5 15.75V20.25" stroke={THEME.LOGO_LIGHT} strokeWidth="1.5" />
      <text
        x="45"
        y="24"
        fontFamily="Outfit"
        fontWeight="800"
        fontSize="22"
        fill={THEME.LOGO_DARK}
      >
        JTech
      </text>
      <text
        x="108"
        y="24"
        fontFamily="Outfit"
        fontWeight="800"
        fontSize="22"
        fill={THEME.LOGO_LIGHT}
      >
        AI
      </text>
    </svg>
  );

  return (
    <>
      <GlobalStyles />

      {/* Fixed Navbar Wrapper */}
      <div
        className={`fixed top-0 w-full z-50 font-technical transition-all duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        {/* ✅ UTILITY STRIP – Technical Grey Bar */}
        <div className="bg-[#f8f9fa] border-b border-[#e1e1e1] text-[#4b5563] text-[10px] font-bold py-1.5 px-4 sm:px-6 hidden md:block tracking-widest uppercase">
          <div className="max-w-[1440px] mx-auto flex justify-between items-center">
            {/* Left: System Info */}
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 hover:text-[#002d5c] cursor-pointer transition-colors">
                <Globe className="w-3 h-3" /> System: Global / EN-US
              </span>
              <span className="w-px h-3 bg-[#d1d5db]"></span>
              <span className="flex items-center gap-2 hover:text-[#002d5c] cursor-pointer transition-colors">
                <Phone className="w-3 h-3" /> +254 706 927062
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-6">
              <button className="hover:text-[#002d5c] transition-colors text-[10px] font-bold uppercase tracking-widest">
                Engineering Support
              </button>
              <span className="w-px h-3 bg-[#d1d5db]"></span>
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2 hover:text-[#002d5c] transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                <User className="w-3 h-3" /> Client Portal
              </button>
            </div>
          </div>
        </div>

        {/* ✅ MAIN NAV – Command Bar Style */}
        <nav
          className="bg-white border-b border-[#d1d5db] flex items-center relative z-20"
          style={{ height: "72px" }}
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 w-full">
            <div className="flex items-center justify-between">
              {/* Logo Area (Bordered) */}
              <div
                className="flex items-center cursor-pointer pr-8 border-r-0 lg:border-r border-transparent lg:border-[#f0f0f0] h-[40px]"
                onClick={() => navigate("/")}
              >
                <JTechAILogo />
              </div>

              {/* Desktop Nav – Sharp, Uppercase, Tracking */}
              <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item)}
                    className="relative group py-6 text-[11px] font-extrabold text-[#001021] uppercase tracking-[1.5px] hover:text-[#002d5c] transition-colors"
                  >
                    {item}
                    {/* Active Line Indicator */}
                    <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#5BB539] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left ease-out" />
                  </button>
                ))}
              </div>

              {/* Actions – Rectangular Buttons */}
              <div className="flex items-center gap-0 pl-4">
                {/* Search (Boxed) */}
                <button className="hidden lg:flex p-3 text-gray-500 hover:text-[#002d5c] hover:bg-[#f8f9fa] border-l border-[#f0f0f0] transition-all ">
                  <Search className="w-4 h-4" />
                </button>

                {/* Login (Text Button) */}
                <button
                  onClick={() => navigate("/auth")}
                  className="hidden lg:flex px-6 py-3 text-[11px] font-black uppercase tracking-[1px] text-[#002d5c] hover:bg-[#f8f9fa] border-l border-[#f0f0f0] transition-colors"
                >
                  Log In
                </button>

                {/* ✅ REDESIGNED CTA BUTTON – Smaller, Cleaner */}
                <motion.button
                  whileHover={{ backgroundColor: "#4a942e", scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/dashboard")}
                  className="hidden sm:flex items-center justify-center gap-1.5 text-white text-[10px] font-bold uppercase tracking-[1px] h-8 px-4 rounded-sm transition-all"
                  style={{ backgroundColor: THEME.ACCENT }}
                >
                  Get Started
                  <ArrowRight className="w-3 h-3" />
                </motion.button>

                {/* Mobile Menu Trigger */}
                <div className="lg:hidden ml-3">
                  <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                      <button className="p-2 text-[#001021] border border-[#d1d5db] hover:bg-gray-50 transition-colors ">
                        <Menu className="h-5 w-5" />
                      </button>
                    </SheetTrigger>

                    <SheetContent
                      side="right"
                      className="bg-white w-[300px] p-0 font-technical border-l border-[#d1d5db]"
                    >
                      {/* Mobile Header */}
                      <div
                        className="text-white p-6 flex items-center justify-between"
                        style={{ backgroundColor: THEME.NAVY }}
                      >
                        <span className="text-[12px] font-bold uppercase tracking-widest">
                          Navigation
                        </span>
                        <div className="w-2 h-2 bg-[#5BB539] rounded-full animate-pulse" />
                      </div>

                      <div className="flex flex-col">
                        {NAV_ITEMS.map((item) => (
                          <button
                            key={item}
                            onClick={() => scrollToSection(item)}
                            className="text-left font-bold text-[13px] uppercase tracking-wide py-5 px-6 border-b border-[#f0f0f0] hover:bg-[#f8f9fa] hover:pl-8 transition-all text-[#001021]"
                          >
                            {item}
                          </button>
                        ))}

                        <div className="p-6 mt-4 flex flex-col gap-4">
                          <button
                            onClick={() => navigate("/auth")}
                            className="flex items-center justify-center gap-2 w-full py-4 border border-[#002d5c] text-[#002d5c] text-[11px] font-black uppercase tracking-widest hover:bg-[#002d5c] hover:text-white transition-all "
                          >
                            <User className="h-3.5 w-3.5" /> Client Portal
                          </button>

                          {/* ✅ Also updated mobile CTA for consistency */}
                          <motion.button
                            whileHover={{
                              backgroundColor: "#4a942e",
                              scale: 1.02,
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              navigate("/dashboard");
                              setMenuOpen(false);
                            }}
                            className="w-full text-white text-[10px] font-bold uppercase tracking-widest py-3 transition-colors rounded-sm flex items-center justify-center gap-2"
                            style={{ backgroundColor: THEME.ACCENT }}
                          >
                            Get Started <ChevronRight className="w-3 h-3" />
                          </motion.button>
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

      {/* Spacer – adjusted for new height (Utility + Nav) */}
      <div className="h-[72px] md:h-[105px]" />
    </>
  );
};

export default NavbarSection;
