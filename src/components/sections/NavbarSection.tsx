import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Phone,
  User,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";      
import { motion } from "framer-motion";

// --- Global Styles ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; }
  `}</style>
);

const NAV_ITEMS = [
  "Why JTech",
  "FAQ",
  "Support",
];

const NAV_GROUPS = {
  why: "Why JTech",
  faq: "FAQ",
  support: "Support",
};

// --- THEME CONSTANTS ---
const THEME = {
  BG: "#000000",
  PANEL: "#1a1b22",
  ORANGE: "#f0514e",
  TEXT: "#eceff4",
  MUTED: "#9fa5b3",
};

interface NavbarProps {
  scrollTo: (sectionId: string) => void;
  setDemoOpen: (open: boolean) => void;
}

const NavbarSection: React.FC<NavbarProps> = ({ scrollTo }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigateToSection = (item: string) => {
    const routes: { [key: string]: string } = {
      "Why JTech": "/",
      FAQ: "/faq",
      Support: "/guide",
    };
    const route = routes[item] || "/";
    navigate(route);
    window.scrollTo(0, 0);
    setMenuOpen(false);
  };

  // ✅ JTech Logo
  const JTechAILogo = () => (
    <img
      src="/logo.jpg"
      alt="JTech AI Logo"
      onClick={() => navigate("/")}
      className="cursor-pointer h-10 w-auto object-contain"
    />
    // <svg
    //   width="160"
    //   height="34"
    //   viewBox="0 0 135 36"
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg"
    //   className="transition-all duration-200 hover:opacity-90"
    // >
    //   <path d="M19.2857 11.25H12.8571V15.75H19.2857V11.25Z" fill={THEME.NAVY} />
    //   <path d="M19.2857 20.25H12.8571V24.75H19.2857V20.25Z" fill={THEME.NAVY} />
    //   <path d="M9.64286 6.75H25.7143V2.25H9.64286V6.75Z" fill={THEME.NAVY} />
    //   <path d="M9.64286 29.25H25.7143V24.75H9.64286V29.25Z" fill={THEME.NAVY} />
    //   <path d="M6.42857 11.25H0V24.75H6.42857V11.25Z" fill={THEME.NAVY} />
    //   <path d="M32.1429 11.25H25.7143V24.75H32.1429V11.25Z" fill={THEME.NAVY} />
    //   <path d="M38.5714 15.75H32.1429V20.25H38.5714V15.75Z" fill={THEME.NAVY} />
    //   <circle cx="22.5" cy="13.5" r="2.25" fill={THEME.ORANGE} />
    //   <circle cx="22.5" cy="22.5" r="2.25" fill={THEME.ORANGE} />
    //   <path d="M22.5 15.75V20.25" stroke={THEME.ORANGE} strokeWidth="1.5" />
    //   <text
    //     x="45"
    //     y="24"
    //     fontFamily="Outfit"
    //     fontWeight="800"
    //     fontSize="22"
    //     fill={THEME.NAVY}
    //   >
    //     JTech
    //   </text>
    //   <text
    //     x="108"
    //     y="24"
    //     fontFamily="Outfit"
    //     fontWeight="800"
    //     fontSize="22"
    //     fill={THEME.GREEN}
    //   >
    //     AI
    //   </text>
    // </svg>
  );

  return (
    <>
      <GlobalStyles />

      {/* Fixed Navbar Wrapper */}
      <div
        className={`fixed top-0 w-full z-50 font-technical transition-all duration-300 ${
          ""
        }`}
        style={{ backgroundColor: THEME.BG }}
      >
        {/* Top utility strip */}
        <div
          className="text-[12px] font-semibold py-2.5 px-4 sm:px-6 hidden md:block border-b border-white/10"
          style={{ backgroundColor: THEME.BG, color: THEME.MUTED }}
        >
          <div className="max-w-[1440px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 text-[#f0514e]">
              <Phone className="w-4 h-4" />
              <span className="font-bold">Call Sales:</span>
              <span className="text-[#a3a9b7]">+254 706 927062</span>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-[#a3a9b7] hover:text-white cursor-pointer transition-colors">
                My Portal
              </span>
              <button className="flex items-center gap-1 text-[#a3a9b7] hover:text-white transition-colors">
                <User className="w-3.5 h-3.5" />
                <span className="text-xs">$</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav
          className="flex items-center relative z-20"
          style={{ height: "66px", backgroundColor: THEME.PANEL }}
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 w-full">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div
                className="flex items-center cursor-pointer pr-10"
                onClick={() => navigate("/")}
              >
                <JTechAILogo />
              </div>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-10 flex-1 justify-start pl-8 h-full">
                <button
                  onClick={() => navigateToSection(NAV_GROUPS.why)}
                  className="relative group h-full flex items-center px-1 text-[16px] font-semibold text-[#eceff4] hover:text-white transition-colors"
                >
                  {NAV_GROUPS.why}
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#f0514e] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
                </button>
                <button
                  onClick={() => navigateToSection(NAV_GROUPS.faq)}
                  className="relative group h-full flex items-center px-1 text-[16px] font-semibold text-[#eceff4] hover:text-white transition-colors"
                >
                  {NAV_GROUPS.faq}
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#f0514e] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
                </button>
                <button
                  onClick={() => navigateToSection(NAV_GROUPS.support)}
                  className="relative group h-full flex items-center px-1 text-[16px] font-semibold text-[#eceff4] hover:text-white transition-colors"
                >
                  {NAV_GROUPS.support}
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#f0514e] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
                </button>
              </div>

              {/* Actions Area */}
              <div className="flex items-center gap-3 pl-4">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/auth?mode=signup")}
                  className="hidden sm:flex items-center justify-center text-white text-[16px] font-bold px-8 py-2.5 rounded-none transition-all"
                  style={{ backgroundColor: THEME.ORANGE }}
                >
                  Get Started
                </motion.button>
                <button
                  onClick={() => navigate("/auth?mode=signin")}
                  className="hidden lg:flex items-center gap-2 px-6 py-2.5 text-[16px] font-semibold text-[#f0514e] hover:text-[#ff726f] border border-white/10 hover:border-white/20 transition-all"
                >
                  Sign In
                </button>

                {/* Mobile Menu Trigger */}
                <div className="lg:hidden ml-2">
                  <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                      <button className="p-2 text-white/90 hover:bg-white/10 rounded transition-colors">
                        <Menu className="h-8 w-8" />
                      </button>
                    </SheetTrigger>

                    <SheetContent
                      side="right"
                      className="w-[300px] p-0 font-technical border-l-0 shadow-2xl bg-[#1b1e27]"
                    >
                      {/* Mobile Header */}
                      <div className="h-full flex flex-col bg-[#1b1e27]">
                        <div className="p-8 pb-4">
                          <h2 className="text-white text-2xl font-bold">
                            Menu
                          </h2>
                          <div className="w-10 h-1 bg-[#D85C2C] mt-2 rounded-full"></div>
                        </div>

                        <div className="flex flex-col flex-1 px-4 mt-4 space-y-2">
                          {NAV_ITEMS.map((item) => (
                            <button
                              key={item}
                              onClick={() => navigateToSection(item)}
                              className="text-left font-bold text-white/80 text-[18px] py-4 px-4 border-b border-white/10 hover:bg-white/10 hover:text-white rounded-lg transition-all flex justify-between items-center group"
                            >
                              {item}
                              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>

                        {/* Mobile Footer Actions */}
                        <div className="p-6 bg-[#151820] pb-10">
                          <button
                            onClick={() => {
                              navigate("/auth?mode=signin");
                              setMenuOpen(false);
                            }}
                            className="flex items-center justify-center gap-2 w-full py-4 mb-4 border border-white/20 text-white text-[13px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                          >
                            <User className="w-4 h-4" /> Sign In
                          </button>

                          <button
                            onClick={() => {
                              navigate("/auth?mode=signup");
                              setMenuOpen(false);
                            }}
                            className="w-full text-white text-[13px] font-bold uppercase tracking-widest py-4 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                            style={{ backgroundColor: THEME.ORANGE }}
                          >
                            Create Account <ArrowRight className="w-4 h-4" />
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

      <div className="h-[104px]" style={{ backgroundColor: THEME.BG }} />
    </>
  );
};

export default NavbarSection;

