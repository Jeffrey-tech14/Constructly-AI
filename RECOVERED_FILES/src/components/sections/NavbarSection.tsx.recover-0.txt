import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion } from 'framer-motion';

const THEME = {
  NAVY: '#00356B',
  ORANGE: '#fb4b4e', // Matching the red button color
  DARK_GRAY: '#1c1c1c', // Main bar dark
  TOP_BAR_GRAY: '#222222', // Top bar slightly different dark
  TEXT_LIGHT: '#ffffff',
  TEXT_MUTED: '#b3b3b3'
};

interface NavbarProps {
  scrollTo?: (sectionId: string) => void;
  setDemoOpen?: (open: boolean) => void;
}

const NavbarSection: React.FC<NavbarProps> = ({ scrollTo }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateToSection = (item: string) => {
    const routes: { [key: string]: string } = {
      'Why JTech': '/features',
      'FAQ': '/faq',
      'Support': '/guide'
    };
    const route = routes[item] || '/';
    navigate(route);
    window.scrollTo(0, 0);
    setMenuOpen(false);
  };

  return (
    <div
      className={`fixed top-0 w-full z-50 transition-all duration-300 font-sans ${
        scrolled ? 'shadow-lg bg-[#1c1c1c]' : 'bg-[#1c1c1c]'
      }`}
    >
      {/* Utility Strip */}
      <div
        className="text-[12px] font-medium py-2 px-4 sm:px-6 hidden md:block transition-colors duration-300"
        style={{ backgroundColor: THEME.TOP_BAR_GRAY, color: THEME.TEXT_MUTED }}
      >
        <div className="max-w-[1440px] mx-auto flex justify-between items-center h-[24px]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5" style={{ color: THEME.ORANGE }}>
              <Phone className="w-3.5 h-3.5" />
              <span className="font-bold uppercase">Call Sales:</span>
            </div>
            <span>+254 706 927062</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="cursor-pointer hover:text-white transition-colors">My Portal</span>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              <img src="/small-icon.png" alt="" className="w-3 h-3 object-contain rounded-full bg-orange-200" onError={(e) => e.currentTarget.style.display='none'} />
              <span>s</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex items-center relative z-20 border-b border-gray-800" style={{ height: '70px', backgroundColor: THEME.DARK_GRAY }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 w-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <div className="flex items-center cursor-pointer h-full py-2 pr-10" onClick={() => navigate('/')}>
              <img src="/logo4.jpg" alt="JTech AI Logo" className="h-[40px] w-auto object-contain" />
            </div>

            {/* Desktop Nav Items */}
            <div className="hidden lg:flex items-center gap-8 flex-1 justify-start h-full ml-10">
              {['Why JTech', 'FAQ', 'Support'].map((item) => (
                <button
                  key={item}
                  onClick={() => navigateToSection(item)}
                  className="text-white text-[15px] font-bold hover:text-[#fb4b4e] transition-colors tracking-wide"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pl-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/auth?mode=signup')}
                className="hidden sm:flex items-center justify-center text-white text-[14px] font-bold px-6 py-2.5 rounded-[2px] shadow-sm transition-colors"
                style={{ backgroundColor: THEME.ORANGE }}
              >
                Get Started
              </motion.button>

              <button
                onClick={() => navigate('/auth?mode=signin')}
                className="hidden lg:flex items-center justify-center text-[14px] font-bold px-6 py-2.5 rounded-[2px] transition-colors border"
                style={{ color: THEME.ORANGE, borderColor: '#333', backgroundColor: '#222' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = THEME.ORANGE;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                }}
              >
                Sign In
              </button>

              {/* Mobile Menu Trigger */}
              <div className="lg:hidden ml-2">
                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger asChild>
                    <button className="p-2 rounded-md transition-colors text-white hover:bg-white/10">
                      {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                  </SheetTrigger>

                  <SheetContent side="right" className="w-[300px] border-l border-gray-800 bg-[#1c1c1c] p-6">
                    <div className="flex flex-col gap-6 pt-10">
                      {['Why JTech', 'FAQ', 'Support'].map((item) => (
                        <button
                          key={item}
                          onClick={() => navigateToSection(item)}
                          className="text-left text-[18px] font-bold text-white hover:text-[#fb4b4e] transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                      <div className="h-px bg-gray-800 my-4" />
                      <button
                        onClick={() => navigate('/auth?mode=signin')}
                        className="w-full text-center py-3 text-[16px] font-bold text-[#fb4b4e] border border-gray-700 bg-[#222] rounded-[2px]"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => navigate('/auth?mode=signup')}
                        className="w-full text-center py-3 text-[16px] font-bold text-white bg-[#fb4b4e] rounded-[2px]"
                      >
                        Get Started
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavbarSection;
