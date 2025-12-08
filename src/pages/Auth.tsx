import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
// Card imports kept but unused
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  EyeOff,
  Eye,
  CheckCircle,
  Rocket,
  Twitter,
  Facebook,
  Youtube,
  Instagram
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// --- THEME DEFINITIONS BASED ON USER'S HERO COMPONENT ---
const THEME = {
  NAVY_BG: "#000B29",
  HERO_BTN_GREEN: "#5BB539", // Accent color for buttons/focus
  HERO_ACCENT_BLUE: "#38bdf8",
  TEXT_LIGHT: "#F0F0F0", // Light color for labels/links (used on the form side)
  // The light orange text from the original image (used only for the left panel paragraph)
  LEFT_PANEL_TEXT: "#FDBA74", 
};

// Background Image URL (Construction Site)
const BACKGROUND_IMAGE_URL = 'https://img.freepik.com/free-photo/construction-site-sunset_23-2152006125.jpg?semt=ais_hybrid&w=740&q=80';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState(searchParams.get("mode") || "signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [authStage, setAuthStage] = useState<"idle" | "verifying" | "redirecting">("idle");
  const { user } = useAuth(); // Assuming useAuth is used for login logic

  // --- LOGIC FUNCTIONS (UNTAMPERED) ---

  const executeRedirect = () => {
    const redirectUrl = searchParams.get("redirect");
    if (redirectUrl && redirectUrl.startsWith("/")) {
      navigate(redirectUrl);
    } else {
      navigate("/dashboard");
    }
  };

  const handleAuthAction = async () => {
    setAuthStage("verifying");
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      setAuthStage("redirecting");
      setTimeout(() => {
        executeRedirect();
      }, 2500);
    } catch (err) {
      console.warn("Auth action failed:", err);
      setAuthStage("idle");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // --- UI RENDERING ---

  return (
    // Main container handles the full background image
    <div 
      className="min-h-screen flex relative overflow-hidden bg-cover bg-center" 
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }} 
    >

      {/* GLOBAL OVERLAY: Use the deep navy color for the overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: THEME.NAVY_BG + 'D0' }} ></div>
      
      {/* ======================================================= */}
      {/* 1. LEFT PANEL CONTENT (HIDDEN ON SMALL SCREENS) */}
      {/* ======================================================= */}
      <div 
        // Absolute positioning to cover the left half on large screens. HIDDEN on small screens.
        className="hidden lg:block absolute inset-y-0 left-0 w-1/2 p-16 z-10"
      >
        <motion.div 
          // Adjusted left positioning to 15% to nudge it slightly towards the center divider
          className="relative text-white w-full max-w-lg lg:max-w-md"
          style={{ top: '30%', left: '15%' }} 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Welcome Back text styling (Large, White, Bold) */}
          <h1 className="text-6xl lg:text-7xl font-extrabold mb-4 leading-none text-white">
            Welcome <br/> Back
          </h1>
          
          {/* Paragraph text styling (Light Orange/Off-white) */}
          <p className="text-sm lg:text-base mb-8 max-w-xs" style={{ color: THEME.LEFT_PANEL_TEXT }}>
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using.
          </p>
          
          {/* Social Icons - White, simple */}
          <div className="flex space-x-4 mt-6">
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Facebook className="w-5 h-5" /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Twitter className="w-5 h-5" /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Youtube className="w-5 h-5" /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Instagram className="w-5 h-5" /></motion.a>
          </div>
        </motion.div>
      </div>

      {/* ======================================================= */}
      {/* 2. RIGHT PANEL/CENTERED FORM CONTAINER */}
      {/* ======================================================= */}
      <div 
        // Mobile: Centers the form. Large Screen: Pushes the form to the right half.
        className="absolute inset-0 w-full flex items-center justify-center lg:justify-end lg:pr-[15%] p-4 z-20"
      >
        {/* SUCCESS OVERLAY (Kept for functionality) */}
        <AnimatePresence>
          {authStage === "redirecting" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              {/* Redirecting Modal content... */}
              <motion.div 
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-center max-w-md mx-4 bg-white/90 dark:bg-gray-900/90 p-8 rounded-xl shadow-2xl"
              >
                <div className="relative mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-2xl"
                      style={{ backgroundColor: THEME.HERO_BTN_GREEN }}
                    >
                      <CheckCircle className="w-12 h-12 text-white" />
                    </motion.div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Login Successful!</h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">We are redirecting you to the dashboard...</p>
                
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5, ease: "easeInOut" }}
                      className="h-full"
                      style={{ backgroundColor: THEME.HERO_BTN_GREEN }}
                    />
                    <motion.div
                        animate={{ x: ["0%", "100%"] }}
                        transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
                        className="absolute -top-6 left-0"
                    >
                        <Rocket className="w-6 h-6" style={{ color: THEME.HERO_ACCENT_BLUE }} />
                    </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN FORM BLOCK */}
        <motion.div
          className="w-full max-w-xs lg:max-w-sm relative p-4 lg:p-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: authStage === 'idle' || authStage === 'verifying' ? 1 : 0, 
            scale: authStage === 'idle' || authStage === 'verifying' ? 1 : 0.95
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* SIGN IN Title */}
          <div className="text-center mb-10">
            {/* THIS WAS CHANGED TO text-center */}
            <h1 className="text-4xl font-extrabold text-white"> 
              Sign In
            </h1>
          </div>

          {/* AUTH FORM FIELDS */}
          <div className="p-0 space-y-6">
            <AnimatePresence mode="wait">
              {authStage === "idle" && (
                <motion.div
                  key="auth-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(); }}>
                    <div className="space-y-6">
                      
                      {/* Email field */}
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium block mb-2 opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="" 
                          className="auth-input w-full" 
                        />
                      </div>

                      {/* Password field */}
                      <div>
                        <Label htmlFor="password" className="text-sm font-medium block mb-2 opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="" 
                            className="auth-input w-full pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me and Lost Password */}
                      {mode === "signin" && (
                        <div className="flex flex-col items-start mt-4 mb-4 space-y-4">
                          {/* Remember Me Checkbox (Green themed) */}
                          <div className="flex items-center">
                            <input type="checkbox" id="rememberMe" className="w-4 h-4 text-white rounded border-white/50 focus:ring-white focus:ring-offset-0 focus:ring-offset-transparent checked:bg-white checked:text-white" style={{ backgroundColor: THEME.HERO_BTN_GREEN, borderColor: THEME.HERO_BTN_GREEN }} />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm opacity-80" style={{ color: THEME.TEXT_LIGHT }}>Remember Me</label>
                          </div>
                          
                          {/* Sign in now button (Green themed) */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full font-semibold py-3.5 px-6 rounded-sm shadow-md transition-all duration-300 relative overflow-hidden group"
                            style={{
                              background: THEME.HERO_BTN_GREEN, 
                              borderRadius: "4px"
                            }}
                          >
                            <span className="relative z-10 text-white">
                              {authStage === 'verifying'
                                ? <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                : "Sign in now"
                              }
                            </span>
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </motion.button>

                          {/* Lost your password link */}
                          <motion.a
                            href="#"
                            className="block text-left text-sm font-medium mt-4 opacity-80 hover:underline"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{ marginTop: '0.75rem', color: THEME.TEXT_LIGHT }} 
                          >
                            Lost your password?
                          </motion.a>
                        </div>
                      )}
                      
                      {/* Terms of Service/Privacy Policy text (Right aligned as per original image) */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-right mt-10 pt-4"
                      >
                        <p className="text-xs opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                          By clicking on 'Sign in now' you agree to <br/>
                          <span className='font-normal' style={{ color: THEME.TEXT_LIGHT }}>
                            <a href="#" className="hover:underline">Terms of Service</a> | <a href="#" className="hover:underline">Privacy Policy</a>
                          </span>
                        </p>
                      </motion.div>

                    </div>
                  </form>
                </motion.div>
              )}

              {/* VERIFYING STATE (LOGIC KEPT) */}
              {authStage === "verifying" && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center justify-center text-center py-12 rounded-lg"
                  style={{ backgroundColor: THEME.NAVY_BG + '40' }}
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="mb-6"
                  >
                    <Loader2 className="w-16 h-16 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-semibold mb-2 text-white">Authenticating...</h2>
                  <p className="text-gray-200">Please wait while we verify your credentials</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style>{`
        /* Custom styles to match the white input fields and apply theme focus color */
        .auth-input {
          border-radius: 4px; 
          padding: 0.85rem 1rem;
          font-size: 1rem;
          background-color: white; /* White background for form fields */
          color: #333; /* Dark text on white background */
          border: 1px solid #e5e7eb;
          box-shadow: 0 0px 0px 0 rgba(0, 0, 0, 0.0), 0 0px 1px 0 rgba(0, 0, 0, 0.1);
        }
        .auth-input:focus {
          border-color: ${THEME.HERO_BTN_GREEN} !important; /* Focus color is the green theme */
          box-shadow: 0 0 0 1px ${THEME.HERO_BTN_GREEN};
          outline: none;
        }
        .auth-input:hover {
          border-color: ${THEME.HERO_BTN_GREEN};
        }
      `}</style>
    </div>
  );
};

export default Auth;