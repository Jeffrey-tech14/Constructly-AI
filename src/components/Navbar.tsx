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
  Settings,
  Eye,
  Menu,
  X,
  ChevronDown,
  Settings2,
  AlertCircle,
  XCircle,
  Building,
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

// ✅ UPDATED THEME TO MATCH FRONTEND (FROM YOUR HERO/PRICING PAGES)
const THEME = {
  PRIMARY: "#002d5c",          // Deep JTech Navy (was #005F9E)
  ACCENT: "#86bc25",           // JTech Action Green (was #5BB539)
  TEXT_DARK: "#001226",
  LOGO_DARK: "#002855",        // Matches your SVG from NavbarSection
  LOGO_LIGHT: "#0077B6",
};

// ✅ EXACT SAME LOGO AS USED IN NavbarSection.tsx
const JTechAILogo = () => (
  <svg
    width="135"
    height="36"
    viewBox="0 0 135 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.2857 11.25H12.8571V15.75H19.2857V11.25Z" fill={THEME.LOGO_DARK} />
    <path d="M19.2857 20.25H12.8571V24.75H19.2857V20.25Z" fill={THEME.LOGO_DARK} />
    <path d="M9.64286 6.75H25.7143V2.25H9.64286V6.75Z" fill={THEME.LOGO_DARK} />
    <path d="M9.64286 29.25H25.7143V24.75H9.64286V29.25Z" fill={THEME.LOGO_DARK} />
    <path d="M6.42857 11.25H0V24.75H6.42857V11.25Z" fill={THEME.LOGO_DARK} />
    <path d="M32.1429 11.25H25.7143V24.75H32.1429V11.25Z" fill={THEME.LOGO_DARK} />
    <path d="M38.5714 15.75H32.1429V20.25H38.5714V15.75Z" fill={THEME.LOGO_DARK} />
    <circle cx="22.5" cy="13.5" r="2.25" fill={THEME.LOGO_LIGHT} />
    <circle cx="22.5" cy="22.5" r="2.25" fill={THEME.LOGO_LIGHT} />
    <path d="M22.5 15.75V20.25" stroke={THEME.LOGO_LIGHT} strokeWidth="1.5" />
    <text x="45" y="24" fontFamily="Segoe UI" fontWeight="800" fontSize="22" fill={THEME.LOGO_DARK}>
      JTech
    </text>
    <text x="108" y="24" fontFamily="Segoe UI" fontWeight="800" fontSize="22" fill={THEME.LOGO_LIGHT}>
      AI
    </text>
  </svg>
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
      toast({ title: "Signed out successfully" });
      navigate("/");
    });
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart },
    { path: "/quotes/new", label: "New Quote", icon: Building },
    { path: "/quotes/all", label: "All Quotes", icon: Eye },
    { path: "/variables", label: "Variables", icon: Settings },
  ];

  if (location.pathname === "/" || location.pathname === "/auth") {
    return null;
  }

  const getTierImage = (tier: string | undefined) => {
    const t = tier || "Free";
    switch (t) {
      case "Free": return <Home className="w-4 h-4" />;
      case "Intermediate": return <Crown className="w-4 h-4" />;
      case "Professional": return <Shield className="w-4 h-4" />;
      default: return <span className="text-sm font-medium">{t}</span>;
    }
  };

  const getTierBadge = (tier: string | undefined) => {
    const t = tier || "Free";
    switch (t) {
      case "Free":
        return (
          <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
            <Home className="w-3 h-3 mr-1" /> Free
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
        return <Badge>{t}</Badge>;
    }
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-[#d1d5db] shadow-none">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <JTechAILogo />
            </div>

            {user && (
              <div className="hidden md:flex ml-auto items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <Button
                        onClick={() => navigate(item.path)}
                        style={isActive(item.path) ? { backgroundColor: THEME.PRIMARY } : {}}
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className={`relative font-medium transition-colors duration-200 ${
                          isActive(item.path)
                            ? "text-white"
                            : "text-gray-700 hover:bg-[#f8f9fa]"
                        } px-4 rounded-none border border-transparent`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden ml-2 xl:inline">{item.label}</span>
                      </Button>
                    </motion.div>
                  );
                })}
                <Button
                  variant="ghost"
                  onClick={() => setIsCalculatorOpen(true)}
                  className="text-gray-700 hover:bg-[#f8f9fa] rounded-none"
                >
                  <CalculatorIcon className="w-4 h-4" />
                </Button>

                <Badge className="bg-transparent hover:bg-transparent">
                  {getTierBadge(profile?.tier)}
                </Badge>
              </div>
            )}

            <div className="flex items-center ml-auto space-x-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-sm ${
                  (profile?.tier || "Free") === "Free"
                    ? "bg-green-100 text-green-700"
                    : (profile?.tier || "Free") === "Intermediate"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {getTierImage(profile?.tier)}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-gray-700 hover:bg-[#f8f9fa] rounded-none"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden text-gray-700 hover:bg-[#f8f9fa]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div>
                        <Button
                          variant="ghost"
                          className="rounded-none text-gray-700 hover:bg-[#f8f9fa]"
                        >
                          <Avatar className="w-6 h-6 items-center">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-2xl">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="max-w-32 truncate max-md:hidden">
                            {profile?.name || user.email}
                          </span>
                          <ChevronDown className="w-3 h-3 ml-1 opacity-60 max-md:hidden" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 border border-[#d1d5db] shadow-none bg-white rounded-none p-2"
                    >
                      <div className="px-3 py-2 border-b border-[#e5e7eb] mb-2">
                        <p className="font-semibold text-gray-900 truncate">
                          {profile?.name || user.email}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                        <div className="mt-2">{getTierBadge(profile?.tier)}</div>
                      </div>

                      <DropdownMenuItem
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-3 p-3 rounded-none cursor-pointer text-gray-700 hover:bg-[#f8f9fa]"
                      >
                        <div
                          className="rounded-sm items-center"
                          style={{ backgroundColor: THEME.PRIMARY, opacity: 0.1 }}
                        >
                          <Avatar className="w-8 h-8 items-center justify-center text-center">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="w-4 h-4" style={{ color: THEME.PRIMARY }} />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-medium">Profile</p>
                          <p className="text-xs text-gray-500">
                            Manage your account
                          </p>
                        </div>
                      </DropdownMenuItem>

                      {profile?.is_admin && (
                        <DropdownMenuItem
                          onClick={() => navigate("/admin")}
                          className="flex items-center gap-3 p-3 rounded-none cursor-pointer text-gray-700 hover:bg-[#f8f9fa]"
                        >
                          <div
                            className="p-2 rounded-sm"
                            style={{ backgroundColor: THEME.PRIMARY, opacity: 0.1 }}
                          >
                            <Settings2 className="w-4 h-4" style={{ color: THEME.PRIMARY }} />
                          </div>
                          <div>
                            <p className="font-medium">Admin Dashboard</p>
                            <p className="text-xs text-gray-500">
                              System administration
                            </p>
                          </div>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="my-2 bg-[#e5e7eb]" />

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="flex items-center gap-3 p-3 rounded-none cursor-pointer text-red-600 hover:bg-red-50">
                            <div className="p-2 rounded-sm bg-red-100">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium">Sign Out</p>
                              <p className="text-xs text-red-500">
                                End your session
                              </p>
                            </div>
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border border-[#d1d5db] bg-white rounded-none shadow-none">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
                              <LogOut className="w-5 h-5 text-red-500" />
                              Confirm Sign Out
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              Are you sure you want to sign out as{" "}
                              <span className="font-semibold">
                                {profile?.name || user.email}
                              </span>
                              ? You will need to sign in again to access your account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-none border border-[#d1d5db] text-gray-700 hover:bg-[#f8f9fa]">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleSignOut}
                              className="bg-[#86bc25] hover:bg-[#75a620] text-white rounded-none"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
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
                  className="text-white rounded-none"
                  onClick={() => navigate("/auth")}
                  style={{ backgroundColor: THEME.ACCENT }} // ✅ Green "Get Started" style
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {user && isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#d1d5db]">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      style={isActive(item.path) ? { backgroundColor: THEME.PRIMARY } : {}}
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`justify-start rounded-none ${
                        isActive(item.path) ? "text-white" : "text-gray-700"
                      } hover:bg-[#f8f9fa]`}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate(item.path);
                      }}
                    >
                      <Icon className="w-4 h-4 mr-2" />
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
                  className="justify-start text-gray-700 hover:bg-[#f8f9fa] rounded-none"
                >
                  <CalculatorIcon className="w-4 h-4 mr-2" />
                  Calculator
                </Button>
              </div>
            </div>
          )}
        </div>

        {user &&
          profile &&
          profile.subscription_status !== "active" &&
          showSubAlert &&
          (() => {
            const status = profile.subscription_status?.toLowerCase();
            const statusConfig = {
              expired: {
                bg: "bg-yellow-50",
                border: "border-yellow-200",
                text: "text-yellow-800",
                icon: <AlertCircle className="w-4 h-4 text-yellow-600" />,
                message: "Your subscription has expired. Please renew to continue using premium features.",
              },
              cancelled: {
                bg: "bg-red-50",
                border: "border-red-200",
                text: "text-red-800",
                icon: <XCircle className="w-4 h-4 text-red-600" />,
                message: "Your subscription was cancelled. Update your plan to regain access.",
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
                message: "Your subscription is pending confirmation. It will activate once payment is verified.",
              },
            }[status || "inactive"] || {
              bg: "bg-neutral-50",
              border: "border-neutral-200",
              text: "text-neutral-800",
              icon: <AlertCircle className="w-4 h-4 text-neutral-600" />,
              message: "Your subscription status is unknown. Please check your billing details.",
            };

            return (
              <div
                className={`w-full ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} py-2 px-4 flex items-center justify-between text-sm`}
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
      <Calculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
    </>
  );
};

export default Navbar;