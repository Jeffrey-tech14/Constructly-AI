import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  User,
  HelpCircle,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

// --- Global Styles ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; }
    
    /* Sharp box shadow for dropdown */
    .dropdown-shadow {
      box-shadow: 0 4px 20px -5px rgba(0,0,0,0.2);
    }
  `}</style>
);

const NAV_ITEMS = [
  "Home",
  "Who It's For",
  "How It Works",
  "Features",
  "Pricing",
  "Payment Options",
  "Testimonials",
  "FAQ",
  "Guide",
];

const NAV_GROUPS = {
  home: "Home",
  about: ["Who It's For", "How It Works", "Testimonials"],
  services: ["Features"],
  packages: ["Pricing", "Payment Options"],
  faq: "FAQ",
};

// --- THEME CONSTANTS ---
const THEME = {
  NAVY: "#00356B",
  ORANGE: "#D85C2C",
  GREEN: "#86bc25",
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
      Home: "/",
      "Who It's For": "/features",
      "How It Works": "/how-it-works",
      Features: "/who-its-for",
      Pricing: "/pricing",
      "Payment Options": "/payment-options",
      Testimonials: "/testimonials",
      FAQ: "/faq",
      Guide: "/guide",
    };
    const route = routes[item] || "/";
    navigate(route);
    window.scrollTo(0, 0);
    setMenuOpen(false);
  };

  // ✅ DROPDOWN COMPONENT (Sharp, Text Only)
  const NavDropdown = ({
    label,
    items,
  }: {
    label: string;
    items: string[];
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const menuVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, staggerChildren: 0.05 },
      },
      exit: { opacity: 0, y: 10, transition: { duration: 0.15 } },
    };

    const itemVariants = {
      hidden: { opacity: 0, x: -5 },
      visible: { opacity: 1, x: 0 },
    };

    return (
      <div
        className="relative h-full rounded-3xl flex items-center"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Trigger Button - Unbolded (Medium) */}
        <button
          className={`relative group h-full flex items-center gap-1.5 text-[16px] font-medium transition-colors duration-300 px-2
            text-[#00356B] hover:text-[#002a54]
          `}
        >
          {label}
          <ChevronDown
            className={`w-4 h-4 opacity-80 transition-transform duration-300 ${
              isOpen
                ? "rotate-180 text-[#D85C2C]"
                : "rotate-0 group-hover:text-[#D85C2C]"
            }`}
          />
          {/* ✅ ORANGE UNDERLINE: Thinned to 2px (Unbolded) */}
          <span
            className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#D85C2C] transition-transform duration-300 origin-left ${
              isOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </button>

        {/* Dropdown Menu - SHARP CORNERS */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute rounded-3xl top-full left-0 pt-0 w-64 z-50"
            >
              <div className="relative bg-white border border-gray-100 dropdown-shadow p-0 rounded-3xl overflow-hidden">
                {items.map((item) => (
                  <motion.button
                    key={item}
                    variants={itemVariants}
                    onClick={() => {
                      navigateToSection(item);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-5 py-3.5 text-[15px] font-medium text-gray-700 transition-all duration-200 
                               hover:bg-[#f8f9fa] hover:text-[#00356B] hover:pl-7 flex items-center justify-between group border-b border-gray-50 last:border-0"
                  >
                    <span>{item}</span>
                    <ChevronRight className="w-4 h-4 text-[#D85C2C] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ✅ JTech Logo
  const JTechAILogo = () => (
    <img
      src="https://jtechai.vercel.app/color-icon-left-layout.png"
      alt="JTech AI Logo"
      onClick={() => navigate("/")}
      className="cursor-pointer h-9 w-auto"
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
          scrolled ? "shadow-md bg-white/95 backdrop-blur-md" : "bg-white"
        }`}
      >
        {/* ✅ UTILITY STRIP: Navy Background + Black Text + No Icons */}
        <div
          className="text-[11px] font-bold py-2.5 px-4 sm:px-6 hidden md:block tracking-widest uppercase transition-colors duration-300"
          style={{ backgroundColor: THEME.NAVY, color: "white" }}
        >
          <div className="max-w-[1440px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <span className="cursor-pointer transition-colors hover:opacity-70">
                Global / EN-US
              </span>
              <span className="w-px h-3 bg-black/30"></span>
              <span className="cursor-pointer transition-colors hover:opacity-70">
                +254 706 927062
              </span>
            </div>
            <div className="flex items-center gap-6">
              <button className="hover:opacity-70 transition-opacity text-[11px] font-bold uppercase tracking-widest">
                Support Center
              </button>
            </div>
          </div>
        </div>

        {/* ✅ MAIN NAV */}
        <nav
          className="flex items-center relative z-20 border-b border-gray-100"
          style={{ height: "88px" }}
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

              {/* Desktop Nav Items - NO ICONS, UNBOLDED */}
              <div className="hidden lg:flex items-center gap-8 flex-1 justify-center h-full">
                {/* Home */}
                <button
                  onClick={() => navigateToSection(NAV_GROUPS.home)}
                  className="relative group h-full flex items-center px-1 text-[16px] font-medium text-[#00356B] hover:text-[#002a54] transition-colors tracking-normal"
                >
                  {NAV_GROUPS.home}
                  {/* ✅ ORANGE UNDERLINE: Thinned to 2px */}
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D85C2C] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
                </button>

                {/* Dropdowns */}
                <NavDropdown label="About" items={NAV_GROUPS.about} />
                <NavDropdown label="Services" items={NAV_GROUPS.services} />
                <NavDropdown label="Packages" items={NAV_GROUPS.packages} />

                {/* FAQ */}
                <button
                  onClick={() => navigateToSection(NAV_GROUPS.faq)}
                  className="relative group h-full flex items-center px-1 text-[16px] font-medium text-[#00356B] hover:text-[#002a54] transition-colors tracking-normal"
                >
                  {NAV_GROUPS.faq}
                  {/* ✅ ORANGE UNDERLINE: Thinned to 2px */}
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D85C2C] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
                </button>

                {/* Guide */}
                <button
                  onClick={() => navigate("/guide")}
                  className="relative group h-full flex items-center gap-1 px-1 text-[16px] font-medium text-[#00356B] hover:text-[#002a54] transition-colors tracking-normal"
                >
                  <HelpCircle className="w-4 h-4" />
                  Guide
                  {/* ✅ ORANGE UNDERLINE: Thinned to 2px */}
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D85C2C] transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
                </button>
              </div>

              {/* Actions Area */}
              <div className="flex items-center gap-4 pl-4">
                {/* Search Icon */}
                <button className="hidden lg:flex p-2 text-gray-400 hover:text-[#00356B] hover:bg-gray-50 rounded-full transition-all">
                  <Search className="w-5 h-5" />
                </button>

                {/* Login Button */}
                <button
                  onClick={() => navigate("/auth?mode=signin")}
                  className="hidden lg:flex items-center gap-2 px-5 py-2.5 text-[12px] font-extrabold uppercase tracking-widest text-[#00356B] hover:text-[#86bc25] hover:bg-gray-50 rounded-full transition-all border border-transparent hover:border-gray-100"
                >
                  <User className="w-4 h-4 mb-0.5" />
                  Login
                </button>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/auth?mode=signup")}
                  className="hidden sm:flex items-center justify-center gap-2 text-white text-[12px] font-extrabold uppercase tracking-widest px-8 py-3 rounded-full shadow-lg shadow-green-600/20 hover:shadow-xl transition-all"
                  style={{ backgroundColor: THEME.GREEN }}
                >
                  Get Started
                </motion.button>

                {/* Mobile Menu Trigger */}
                <div className="lg:hidden ml-2">
                  <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                      <button className="p-2 text-[#00356B] hover:bg-gray-50 rounded-full transition-colors">
                        <Menu className="h-8 w-8" />
                      </button>
                    </SheetTrigger>

                    <SheetContent
                      side="right"
                      className="w-[300px] p-0 font-technical border-l-0 shadow-2xl"
                    >
                      {/* Mobile Header */}
                      <div
                        className="h-full flex flex-col"
                        style={{ backgroundColor: THEME.NAVY }}
                      >
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
                        <div className="p-6 bg-[#002855] pb-10">
                          <button
                            onClick={() => {
                              navigate("/auth?mode=signin");
                              setMenuOpen(false);
                            }}
                            className="flex items-center justify-center gap-2 w-full py-4 mb-4 border border-white/20 text-white text-[13px] font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition-all"
                          >
                            <User className="w-4 h-4" /> Sign In
                          </button>

                          <button
                            onClick={() => {
                              navigate("/auth?mode=signup");
                              setMenuOpen(false);
                            }}
                            className="w-full text-white text-[13px] font-bold uppercase tracking-widest py-4 rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                            style={{ backgroundColor: THEME.GREEN }}
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

      <div className="h-[88px]" />
    </>
  );
};

export default NavbarSection;
