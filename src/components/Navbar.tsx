import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Calculator from "@/components/Calculator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  Moon,
  Sun,
  Shield,
  Crown,
  Calculator as CalculatorIcon,
  BarChart,
  Settings,
  Eye,
  Menu,
  X,
  Building2,
  ChevronDown,
  Settings2,
  AlertCircle,
  XCircle,
  Home,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

// --- Global Styles: Loads the 'Outfit' font to match Frontend ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; }
    
    /* Smooth transition for theme colors */
    .nav-transition { transition: all 0.3s ease-in-out; }
  `}</style>
);

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSubAlert, setShowSubAlert] = useState(true);

  // --- THEME CONSTANTS (Matched to Frontend) ---
  const THEME = {
    NAVY: "#00356B",
    ORANGE: "#D85C2C",
    GREEN: "#86bc25",
  };

  const handleSignOut = async () => {
    setTimeout(async () => {
      await signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate("/");
    });
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart },
    { path: "/quotes/new", label: "New Quote", icon: Building2 },
    { path: "/quotes/all", label: "All Quotes", icon: Eye },
    { path: "/variables", label: "Settings", icon: Settings },
  ];

  if (location.pathname === "/" || location.pathname === "/auth") {
    return null;
  }

  // --- LOGO COMPONENT (Updated Colors) ---
  const JTechAILogo = () => (
    <svg
      width="135"
      height="36"
      viewBox="0 0 135 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="hover:opacity-90 transition-opacity"
    >
      <path d="M19.2857 11.25H12.8571V15.75H19.2857V11.25Z" fill={theme === 'dark' ? '#fff' : THEME.NAVY} />
      <path d="M19.2857 20.25H12.8571V24.75H19.2857V20.25Z" fill={theme === 'dark' ? '#fff' : THEME.NAVY} />
      <path d="M9.64286 6.75H25.7143V2.25H9.64286V6.75Z" fill={theme === 'dark' ? '#fff' : THEME.NAVY} />
      <path d="M9.64286 29.25H25.7143V24.75H9.64286V29.25Z" fill={theme === 'dark' ? '#fff' : THEME.NAVY} />
      <path d="M6.42857 11.25H0V24.75H6.42857V11.25Z" fill={theme === 'dark' ? '#fff' : THEME.NAVY} />
      <path d="M32.1429 11.25H25.7143V24.75H32.1429V11.25Z" fill={theme === 'dark' ? '#fff' : THEME.NAVY} />
      <path d="M38.5714 15.75H32.1429V20.25H38.5714V15.75Z" fill={theme === 'dark' ? '#fff' : THEME.NAVY} />
      <circle cx="22.5" cy="13.5" r="2.25" fill={THEME.ORANGE} />
      <circle cx="22.5" cy="22.5" r="2.25" fill={THEME.ORANGE} />
      <path d="M22.5 15.75V20.25" stroke={THEME.ORANGE} strokeWidth="1.5" />
      <text x="45" y="24" fontFamily="Outfit" fontWeight="800" fontSize="22" fill={theme === 'dark' ? '#fff' : THEME.NAVY}>JTech</text>
      <text x="108" y="24" fontFamily="Outfit" fontWeight="800" fontSize="22" fill={THEME.GREEN}>AI</text>
    </svg>
  );

  const getTierImage = (tier: string | undefined) => {
    const t = tier || "Free";
    switch (t) {
      case "Free":
        return <Home className="w-4 h-4" />;
      case "Professional":
        return <Shield className="w-4 h-4" />;
      case "Enterprise":
        return <Crown className="w-4 h-4" />;
      default:
        return <span className="text-sm font-medium">{t}</span>;
    }
  };

  const getTierBadge = (tier: string | undefined) => {
    const t = tier || "Free";
    // Updated Badge Styles to match Frontend Palette
    switch (t) {
      case "Free":
        return (
          <Badge className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 font-technical">
            <Home className="w-3 h-3 mr-1" />
            <span className="hidden md:flex">Free</span>
          </Badge>
        );
      case "Professional":
        return (
          <Badge className="text-xs bg-[#86bc25]/10 text-[#5da40b] hover:bg-[#86bc25]/20 border-0 font-technical">
            <Shield className="w-3 h-3 mr-1" />
            <span className="hidden md:flex">Professional</span>
          </Badge>
        );
      case "Enterprise":
        return (
          <Badge className="text-xs bg-[#00356B]/10 text-[#00356B] hover:bg-[#00356B]/20 border-0 font-technical dark:text-blue-200 dark:bg-blue-900/30">
            <Crown className="w-3 h-3 mr-1" />
            <span className="hidden md:flex">Enterprise</span>
          </Badge>
        );
      default:
        return <Badge>{t}</Badge>;
    }
  };

  return (
    <>
      <GlobalStyles />
      {/* Sleek Glass Background matching Frontend */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 dark:bg-[#0b1120]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 font-technical shadow-sm transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[88px]"> {/* Frontend Height */}
            
            <div className="flex items-center space-x-1 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <JTechAILogo />
            </div>

            {user && (
              <div className="hidden md:flex ml-auto items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <Button
                        onClick={() => navigate(item.path)}
                        variant="ghost"
                        // Custom styles to override shadcn default and enforce theme colors
                        className={`relative h-10 px-4 font-medium transition-all duration-300 rounded-md
                          ${active 
                            ? "text-white shadow-md" 
                            : "text-[#00356B] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-[#D85C2C]"
                          }
                        `}
                        style={{
                           backgroundColor: active ? THEME.NAVY : 'transparent',
                        }}
                      >
                        <Icon className={`w-4 h-4 mr-2 ${active ? "text-[#86bc25]" : "currentColor"}`} />
                        <span className="hidden xl:inline">{item.label}</span>
                      </Button>
                    </motion.div>
                  );
                })}

                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />

                <Button
                  variant="ghost"
                  onClick={() => setIsCalculatorOpen(true)}
                  className="text-[#00356B] dark:text-gray-300 hover:text-[#D85C2C] hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors"
                >
                  <CalculatorIcon className="w-5 h-5" />
                </Button>

                <div className="hidden md:flex ml-1">
                  {getTierBadge(profile?.tier)}
                </div>
              </div>
            )}

            <div className="flex items-center ml-auto space-x-2">
              <div
                className={`flex h-8 w-8 items-center hidden md:flex justify-center rounded-full transition-colors ${
                  profile?.tier === "Free"
                    ? "bg-gray-100 text-gray-600"
                    : profile?.tier === "Enterprise"
                    ? "bg-[#00356B]/10 text-[#00356B] dark:text-blue-200"
                    : "bg-[#86bc25]/10 text-[#5da40b]"
                }`}
              >
                {getTierImage(profile?.tier)}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="rounded-full text-[#00356B] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden text-[#00356B]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div>
                        <Button variant="ghost" className="pl-2 pr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                          <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-[#00356B] text-white">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <ChevronDown className="w-4 h-4 ml-1 text-[#00356B] dark:text-gray-400 opacity-70" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent
                      align="end"
                      className="w-64 mt-2 p-2 border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl font-technical bg-white dark:bg-[#0b1120]"
                    >
                      <div className="px-3 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-2 border border-gray-100 dark:border-gray-700">
                        <p className="font-bold text-[#00356B] dark:text-white truncate text-[15px]">
                          {profile?.name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {user.email}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                           {getTierBadge(profile?.tier)}
                        </div>
                      </div>

                      <DropdownMenuItem
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer text-gray-600 dark:text-gray-300 hover:text-[#00356B] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all focus:bg-blue-50"
                      >
                         <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-[#00356B] dark:text-blue-300">
                           <User className="w-4 h-4" />
                         </div>
                        <div>
                          <p className="font-medium">Profile</p>
                          <p className="text-xs text-gray-400">Manage your account</p>
                        </div>
                      </DropdownMenuItem>

                      {profile?.is_admin && (
                        <DropdownMenuItem
                          onClick={() => navigate("/admin")}
                          className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer text-gray-600 dark:text-gray-300 hover:text-[#00356B] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all focus:bg-blue-50"
                        >
                          <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-[#00356B] dark:text-blue-300">
                            <Settings2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">Admin</p>
                            <p className="text-xs text-gray-400">System administration</p>
                          </div>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-800" />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer text-[#D85C2C] hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all group">
                            <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-900/20 text-[#D85C2C] group-hover:bg-red-100">
                               <LogOut className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-medium">Sign Out</p>
                                <p className="text-xs text-red-400/80">End your session</p>
                            </div>
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="font-technical border-gray-100 shadow-2xl rounded-2xl bg-white dark:bg-[#0b1120]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-[#00356B] dark:text-white flex items-center gap-2">
                                <LogOut className="w-5 h-5 text-[#D85C2C]" />
                                Confirm Sign Out
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to sign out as <span className="font-bold text-[#00356B] dark:text-blue-200">{profile?.name || user.email}</span>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-full border-gray-200 hover:bg-gray-50">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={handleSignOut} 
                                className="bg-[#D85C2C] hover:bg-[#b84520] rounded-full text-white"
                            >
                              Sign Out
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  asChild
                  onClick={() => navigate("/auth")}
                  className="bg-[#00356B] hover:bg-[#002a54] text-white font-bold rounded-full px-6 font-technical"
                >
                   <span>Sign In</span>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Content */}
          {user && isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 animate-slide-down font-technical">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      className={`justify-start w-full ${
                        isActive(item.path) 
                        ? "bg-[#00356B] text-white" 
                        : "text-[#00356B] dark:text-gray-300 hover:bg-gray-50 hover:text-[#D85C2C]"
                      }`}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate(item.path);
                      }}
                    >
                      <Icon className={`w-4 h-4 mr-3 ${isActive(item.path) ? "text-[#86bc25]" : "currentColor"}`} />
                      {item.label}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCalculatorOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start w-full text-[#00356B] dark:text-gray-300 hover:bg-gray-50 hover:text-[#D85C2C]"
                >
                  <CalculatorIcon className="w-4 h-4 mr-3" />
                  Calculator
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Alert - Styled with Frontend Colors */}
        {user &&
          profile?.subscription_status !== "active" &&
          showSubAlert &&
          (() => {
            const status = profile?.subscription_status?.toLowerCase();

            const statusConfig = {
              expired: {
                bg: "bg-red-50 dark:bg-red-900/30",
                text: "text-red-800 dark:text-red-200",
                icon: <AlertCircle className="w-4 h-4 text-[#D85C2C]" />,
                message: "Your subscription has expired. Please renew to continue using premium features.",
              },
              cancelled: {
                bg: "bg-red-50 dark:bg-red-900/30",
                text: "text-red-800 dark:text-red-200",
                icon: <XCircle className="w-4 h-4 text-[#D85C2C]" />,
                message: "Your subscription was cancelled. Update your plan to regain access.",
              },
              inactive: {
                bg: "bg-gray-50 dark:bg-gray-900/30",
                text: "text-gray-800 dark:text-gray-200",
                icon: <AlertCircle className="w-4 h-4 text-gray-600" />,
                message: "Your subscription is inactive. Please reactivate your plan.",
              },
              pending: {
                bg: "bg-blue-50 dark:bg-blue-900/30",
                text: "text-blue-800 dark:text-blue-200",
                icon: <AlertCircle className="w-4 h-4 text-[#00356B]" />,
                message: "Your subscription is pending confirmation. It will activate once payment is verified.",
              },
            }[status] || {
              bg: "bg-gray-50 dark:bg-gray-900/30",
              text: "text-gray-800 dark:text-gray-200",
              icon: <AlertCircle className="w-4 h-4 text-gray-600" />,
              message: "Your subscription status is unknown. Please check your billing details.",
            };

            return (
              <div
                className={`w-full ${statusConfig.bg} ${statusConfig.text} py-2 px-4 flex items-center justify-between text-xs font-medium font-technical animate-slide-down border-t border-gray-100 dark:border-gray-800`}
              >
                <div className="flex items-center space-x-2">
                  {statusConfig.icon}
                  <span>{statusConfig.message}</span>
                </div>
                <button
                  onClick={() => setShowSubAlert(false)}
                  className="hover:opacity-70 transition"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            );
          })()}
      </nav>
      
      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div className="h-[88px]" />

      <Calculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </>
  );
};

export default Navbar;