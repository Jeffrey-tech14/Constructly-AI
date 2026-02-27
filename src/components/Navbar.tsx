import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Wrench,
  User,
  LogOut,
  Moon,
  Sun,
  Shield,
  Crown,
  Calculator as CalculatorIcon,
  Plus,
  BarChart,
  Settings,
  Eye,
  Menu,
  X,
  Star,
  ThumbsUp,
  Shell,
  Building,
  Building2,
  DoorOpen,
  DraftingCompass,
  Pickaxe,
  ChevronDown,
  Settings2,
  AlertCircle,
  XCircle,
  Home,
  HelpCircle,
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
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { ThemeToggle } from "./ThemeToggle";
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
    { path: "/variables", label: "Settings", icon: Settings },
  ];
  if (location.pathname === "/" || location.pathname === "/auth") {
    return null;
  }

  const THEME = {
    PRIMARY: "#002d5c",
    ACCENT: "#86bc25",
    TEXT_DARK: "#001226",
    LOGO_DARK: "#002855",
    LOGO_LIGHT: "#0077B6",
  };

  const JTechAILogo = () => {
    const isDark = theme === "dark";
    const logoDarkColor = isDark ? "#0077B6" : "#002855";
    const logoLightColor = isDark ? "#002855" : "#0077B6";

    return (
      <img
        src="https://jtechai.vercel.app/color-icon-left-layout.png"
        alt="JTech AI Logo"
        onClick={() => navigate("/")}
        className="cursor-pointer h-32 w-auto"
      />
      // <svg
      //   width="135"
      //   height="36"
      //   viewBox="0 0 135 36"
      //   onClick={() => navigate("/")}
      //   fill="none"
      //   className="cursor-pointer"
      //   xmlns="http://www.w3.org/2000/svg"
      // >
      //   <path
      //     d="M19.2857 11.25H12.8571V15.75H19.2857V11.25Z"
      //     fill={logoDarkColor}
      //   />
      //   <path
      //     d="M19.2857 20.25H12.8571V24.75H19.2857V20.25Z"
      //     fill={logoDarkColor}
      //   />
      //   <path
      //     d="M9.64286 6.75H25.7143V2.25H9.64286V6.75Z"
      //     fill={logoDarkColor}
      //   />
      //   <path
      //     d="M9.64286 29.25H25.7143V24.75H9.64286V29.25Z"
      //     fill={logoDarkColor}
      //   />
      //   <path d="M6.42857 11.25H0V24.75H6.42857V11.25Z" fill={logoDarkColor} />
      //   <path
      //     d="M32.1429 11.25H25.7143V24.75H32.1429V11.25Z"
      //     fill={logoDarkColor}
      //   />
      //   <path
      //     d="M38.5714 15.75H32.1429V20.25H38.5714V15.75Z"
      //     fill={logoDarkColor}
      //   />
      //   <circle cx="22.5" cy="13.5" r="2.25" fill={logoLightColor} />
      //   <circle cx="22.5" cy="22.5" r="2.25" fill={logoLightColor} />
      //   <path d="M22.5 15.75V20.25" stroke={logoLightColor} strokeWidth="1.5" />
      //   <text
      //     x="45"
      //     y="24"
      //     fontFamily="Outfit"
      //     fontWeight="800"
      //     fontSize="22"
      //     fill={logoDarkColor}
      //   >
      //     JTech
      //   </text>
      //   <text
      //     x="108"
      //     y="24"
      //     fontFamily="Outfit"
      //     fontWeight="800"
      //     fontSize="22"
      //     fill={logoLightColor}
      //   >
      //     AI
      //   </text>
      // </svg>
    );
  };

  return (
    <>
      <nav className="fixed sticky top-0 z-50 glass border-b shadow-sm">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-1">
              <JTechAILogo />
            </div>

            {user && (
              <div className="hidden md:flex ml-auto items-center space-x-1">
                {navItems.map((item, index) => {
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
                        variant={isActive(item.path) ? "default" : "ghost"}
                        className={`relative font-medium transition-colors duration-500 ${
                          isActive(item.path)
                            ? " text-white shadow-lg"
                            : " dark:text-gray-300"
                        } px-4`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden ml-2 xl:inline">
                          {item.label}
                        </span>
                      </Button>
                    </motion.div>
                  );
                })}
                <Button
                  variant="ghost"
                  onClick={() => setIsCalculatorOpen(true)}
                  className="card-hover"
                >
                  <CalculatorIcon className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center ml-auto space-x-2">
              <ThemeToggle />

              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Menu className="w-4 h-4" />
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div>
                        <Button variant="ghost" className=" rounded-xl">
                          <Avatar className="w-6 h-6 items-center">
                            <AvatarImage
                              src={profile?.avatar_url || undefined}
                            />
                            <AvatarFallback className="text-2xl">
                              <User className="w-4 h-4"></User>
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden md:flex max-w-32 truncate">
                            {profile?.name || user.email}
                          </span>
                          <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 border border-gray-200 dark:border-gray-700 shadow-xl glass rounded-xl p-2"
                    >
                      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-2">
                        <p className=" text-gray-900 dark:text-white truncate">
                          {profile?.name || user.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>

                      <DropdownMenuItem
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:bg-blue-200 hover:text-background dark:text-gray-300 dark:hover:bg-primary/40 dark:hover:text-white transition-colors  duration-200"
                      >
                        <div className="rounded-lg bg-blue-100 dark:bg-primary/30 items-center">
                          <Avatar className="w-8 h-8 items-center justify-center text-center">
                            <AvatarImage
                              src={profile?.avatar_url || undefined}
                            />
                            <AvatarFallback className="items-center justify-center text-center">
                              <User className="w-4 h-4 justify-center text-center text-primary dark:text-blue-400"></User>
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <p className="font-medium">Profile</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Manage your account
                          </p>
                        </div>
                      </DropdownMenuItem>

                      {profile?.is_admin && (
                        <DropdownMenuItem
                          onClick={() => navigate("/admin")}
                          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:bg-blue-200 hover:text-background dark:text-gray-300 dark:hover:bg-primary/40 dark:hover:text-white transition-colors duration-200"
                        >
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-primary/30">
                            <Settings2 className="w-4 h-4 text-primary dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">Admin Dashboard</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              System administration
                            </p>
                          </div>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-700" />
                      <DropdownMenuItem
                        onClick={() => navigate("/guide")}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-700 hover:bg-blue-200 hover:text-background dark:text-gray-300 dark:hover:bg-primary/40 dark:hover:text-white transition-colors duration-200"
                      >
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-primary/30">
                          <HelpCircle className="w-4 h-4 text-primary dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">User Guide</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Learn how to use the app
                          </p>
                        </div>
                      </DropdownMenuItem>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-red-600 hover:bg-red-200 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors duration-200">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium">Sign Out</p>
                              <p className="text-xs text-red-500 dark:text-red-400">
                                End your session
                              </p>
                            </div>
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                              <LogOut className="w-5 h-5 text-red-500" />
                              Confirm Sign Out
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                              Are you sure you want to sign out as{" "}
                              <span className=" text-gray-900 dark:text-white">
                                {profile?.name || user.email}
                              </span>
                              ? You will need to sign in again to access your
                              account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleSignOut}
                              className="bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
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
                  className="text-white"
                  asChild
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {user && isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-slide-down">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`justify-start ${
                        isActive(item.path) ? "bg-primary text-white" : ""
                      }`}
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
                  className="justify-start"
                >
                  <CalculatorIcon className="w-4 h-4 mr-2" />
                  Calculator
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
      <Calculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </>
  );
};

export default Navbar;
