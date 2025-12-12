// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

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
import { motion } from "framer-motion";
import {
  User,
  LogOut,
  Moon,
  Sun,
  Shield,
  Crown,
  Calculator as CalculatorIcon,
  BarChart,
  Eye,
  Menu,
  X,
  Shell,
  Building2,
  ChevronDown,
  Settings2,
  AlertCircle,
  XCircle,
  Search,
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

// --- THEME COLORS (Matches frontend NavbarSection.tsx) ---
const THEME = {
  PRIMARY: "#005F9E", // Trimble-inspired blue
  ACCENT: "#5BB539", // CTA green
  TEXT_DARK: "#001226",
  LOGO_DARK: "#002855",
  LOGO_LIGHT: "#0077B6",
};

// --- JTech AI LOGO (EXACT COPY FROM FRONTEND) ---
const JTechAILogo = () => (
  <svg width="135" height="36" viewBox="0 0 135 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.2857 11.25H12.8571V15.75H19.2857V11.25Z" fill={THEME.LOGO_DARK}/>
    <path d="M19.2857 20.25H12.8571V24.75H19.2857V20.25Z" fill={THEME.LOGO_DARK}/>
    <path d="M9.64286 6.75H25.7143V2.25H9.64286V6.75Z" fill={THEME.LOGO_DARK}/>
    <path d="M9.64286 29.25H25.7143V24.75H9.64286V29.25Z" fill={THEME.LOGO_DARK}/>
    <path d="M6.42857 11.25H0V24.75H6.42857V11.25Z" fill={THEME.LOGO_DARK}/>
    <path d="M32.1429 11.25H25.7143V24.75H32.1429V11.25Z" fill={THEME.LOGO_DARK}/>
    <path d="M38.5714 15.75H32.1429V20.25H38.5714V15.75Z" fill={THEME.LOGO_DARK}/>
    <circle cx="22.5" cy="13.5" r="2.25" fill={THEME.LOGO_LIGHT}/>
    <circle cx="22.5" cy="22.5" r="2.25" fill={THEME.LOGO_LIGHT}/>
    <path d="M22.5 15.75V20.25" stroke={THEME.LOGO_LIGHT} strokeWidth="1.5"/>
    <text x="45" y="24" fontFamily="Inter" fontWeight="bold" fontSize="22" fill={THEME.LOGO_DARK}>JTech</text>
    <text x="108" y="24" fontFamily="Inter" fontWeight="bold" fontSize="22" fill={THEME.LOGO_LIGHT}>AI</text>
  </svg>
);

// --- INTER FONT IMPORT ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
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
    { path: "/variables", label: "Variables", icon: Settings2 },
  ];

  if (location.pathname === "/" || location.pathname === "/auth") {
    return null;
  }

  const getTierImage = (tier: string) => {
    switch (tier) {
      case "Free":
        return <Shell className="w-4 h-4" />;
      case "Intermediate":
        return <Crown className="w-4 h-4" />;
      case "Professional":
        return <Shield className="w-4 h-4" />;
      default:
        return <span className="text-sm font-medium">{tier}</span>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Free":
        return (
          <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
            <Shell className="w-3 h-3 mr-1" /> Free
          </Badge>
        );
      case "Intermediate":
        return (
          <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Crown className="w-3 h-3 mr-1" /> Intermediate
          </Badge>
        );
      case "Professional":
        return (
          <Badge className="text-xs bg-purple-100 text-purple-800 hover:bg-purple-100">
            <Shield className="w-3 h-3 mr-1" /> Professional
          </Badge>
        );
      default:
        return <Badge>{tier}</Badge>;
    }
  };

  return (
    <>
      <GlobalStyles />

      {/* ===== NAVBAR ===== */}
      <nav
        className="fixed top-0 z-50 w-full font-inter"
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          height: "72px",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-full">

            {/* LOGO */}
            <div
              className="flex items-center cursor-pointer pr-8"
              onClick={() => navigate("/")}
            >
              <JTechAILogo />
            </div>

            {/* DESKTOP NAVIGATION */}
            {user && (
              <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`group relative px-4 py-6 text-sm font-bold text-[#001226] hover:text-[#005F9E] transition-colors`}
                    >
                      <Icon className="inline-block w-4 h-4 mr-2" />
                      {item.label}
                      <span
                        className="absolute bottom-0 left-0 w-full h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ease-out"
                        style={{ backgroundColor: THEME.PRIMARY }}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* RIGHT SIDE UTILITY */}
            <div className="flex items-center gap-3 pl-4">

              {/* SEARCH ICON */}
              <button className="p-2.5 text-gray-500 hover:text-[#005F9E] hover:bg-gray-50 rounded-full transition-all">
                <Search className="w-5 h-5" />
              </button>

              {/* CTA BUTTON */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/dashboard")}
                className="hidden sm:flex text-white text-[13px] font-bold px-6 py-2.5 rounded shadow-sm transition-colors items-center gap-2"
                style={{ backgroundColor: THEME.ACCENT }}
              >
                Get Started
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>

              {/* MOBILE MENU TRIGGER */}
              <div className="lg:hidden ml-1">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-[#001226] hover:bg-gray-100 rounded transition-colors"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* USER MENU */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-[#001226] hover:bg-gray-50 rounded-xl flex items-center gap-2"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-gray-200 text-[#001226]">
                          <User className="w-3.5 h-3.5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-32 truncate font-medium">
                        {profile?.name || user.email}
                      </span>
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 border border-gray-200 shadow-lg bg-white rounded-xl p-2"
                  >
                    <div className="px-3 py-2 border-b border-gray-100 mb-2">
                      <p className="font-semibold text-[#001226] truncate">
                        {profile?.name || user.email}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      <div className="mt-2">{getTierBadge(profile?.tier)}</div>
                    </div>

                    <DropdownMenuItem
                      onClick={() => navigate("/profile")}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-[#001226] hover:bg-gray-100 transition-colors"
                    >
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-white text-blue-600">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <p className="font-medium">Profile</p>
                        <p className="text-xs text-gray-500">Manage your account</p>
                      </div>
                    </DropdownMenuItem>

                    {profile?.is_admin && (
                      <DropdownMenuItem
                        onClick={() => navigate("/admin")}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-[#001226] hover:bg-gray-100 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-blue-100">
                          <Settings2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Admin Dashboard</p>
                          <p className="text-xs text-gray-500">System administration</p>
                        </div>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator className="my-2 bg-gray-200" />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <div className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-red-600 hover:bg-red-50 transition-colors">
                          <div className="p-2 rounded-lg bg-red-100">
                            <LogOut className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium">Sign Out</p>
                            <p className="text-xs text-red-500">End your session</p>
                          </div>
                        </div>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border border-gray-200 bg-white rounded-xl shadow-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-[#001226]">
                            <LogOut className="w-5 h-5 text-red-500" />
                            Confirm Sign Out
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-600">
                            Are you sure you want to sign out as{" "}
                            <span className="font-semibold text-[#001226]">
                              {profile?.name || user.email}
                            </span>
                            ? You will need to sign in again to access your account.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-gray-300 text-[#001226] hover:bg-gray-100">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleSignOut}
                            className="bg-[#5BB539] hover:bg-[#4aa22f] text-white"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  className="bg-[#5BB539] text-white hover:bg-[#4aa22f] font-bold text-sm px-4 py-2 rounded shadow-sm"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              )}

            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2 px-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate(item.path);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg text-[#001226] font-medium ${
                      isActive(item.path)
                        ? "bg-[#005F9E] text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setIsCalculatorOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 rounded-lg text-[#001226] font-medium hover:bg-gray-100"
              >
                <CalculatorIcon className="w-4 h-4" />
                Cost Calculator
              </button>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION ALERT */}
        {user &&
          profile?.subscription_status !== "active" &&
          showSubAlert &&
          (() => {
            const status = profile?.subscription_status?.toLowerCase();

            const statusConfig = {
              expired: {
                bg: "bg-yellow-50",
                border: "border-yellow-200",
                text: "text-yellow-800",
                icon: <AlertCircle className="w-4 h-4 text-yellow-600" />,
                message:
                  "Your subscription has expired. Please renew to continue using premium features.",
              },
              cancelled: {
                bg: "bg-red-50",
                border: "border-red-200",
                text: "text-red-800",
                icon: <XCircle className="w-4 h-4 text-red-600" />,
                message:
                  "Your subscription was cancelled. Update your plan to regain access.",
              },
              inactive: {
                bg: "bg-gray-50",
                border: "border-gray-200",
                text: "text-gray-800",
                icon: <AlertCircle className="w-4 h-4 text-gray-600" />,
                message: "Your subscription is inactive. Please reactivate your plan.",
              },
              pending: {
                bg: "bg-blue-50",
                border: "border-blue-200",
                text: "text-blue-800",
                icon: <AlertCircle className="w-4 h-4 text-blue-600" />,
                message:
                  "Your subscription is pending confirmation. It will activate once payment is verified.",
              },
            }[status] || {
              bg: "bg-neutral-50",
              border: "border-neutral-200",
              text: "text-neutral-800",
              icon: <AlertCircle className="w-4 h-4 text-neutral-600" />,
              message:
                "Your subscription status is unknown. Please check your billing details.",
            };

            return (
              <div
                className={`w-full ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} py-2.5 px-4 flex items-center justify-between text-sm font-medium`}
              >
                <div className="flex items-center space-x-2">
                  {statusConfig.icon}
                  <span>{statusConfig.message}</span>
                </div>
                <button
                  onClick={() => setShowSubAlert(false)}
                  className="text-current hover:opacity-70 transition"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            );
          })()}
      </nav>

      <Calculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </>
  );
};

export default Navbar;
