import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
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
  Instagram,
  UserPlus,
  LogIn,
  Mail,
  Lock,
  User,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// --- THEME DEFINITIONS ---
const THEME = {
  NAVY_BG: "#000B29",
  HERO_BTN_GREEN: "#5BB539",
  HERO_ACCENT_BLUE: "#38bdf8",
  TEXT_LIGHT: "#F0F0F0",
  LEFT_PANEL_TEXT: "#FDBA74", 
};

const BACKGROUND_IMAGE_URL = 'https://img.freepik.com/free-photo/construction-site-sunset_23-2152006125.jpg?semt=ais_hybrid&w=740&q=80';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<"signin" | "signup">(searchParams.get("mode") === "signup" ? "signup" : "signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [authStage, setAuthStage] = useState<"idle" | "verifying" | "redirecting">("idle");
  const { user, signInWithGoogle } = useAuth();

  const executeRedirect = () => {
    const redirectUrl = searchParams.get("redirect");
    if (redirectUrl && redirectUrl.startsWith("/")) {
      navigate(redirectUrl);
    } else {
      navigate("/dashboard");
    }
  };

  const handleGoogleAuth = async () => {
    setAuthStage("verifying");
    setErrorMessage("");
    
    try {
      await signInWithGoogle();
      setAuthStage("redirecting");
      setTimeout(() => {
        executeRedirect();
      }, 2500);
    } catch (err: any) {
      console.warn("Google sign-in failed:", err);
      setErrorMessage(err.message || "Google sign-in failed. Please try again.");
      setAuthStage("idle");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStage("verifying");
    setErrorMessage("");
    
    // Validate form
    if (mode === "signup") {
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage("Passwords do not match");
        setAuthStage("idle");
        return;
      }
      if (formData.password.length < 6) {
        setErrorMessage("Password must be at least 6 characters");
        setAuthStage("idle");
        return;
      }
    }

    try {
      // For now, we'll simulate email/password auth since we only have Google auth
      // In a real app, you would implement email/password auth in your AuthContext
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful auth for demo purposes
      // In production, replace this with actual email/password auth
      console.log(`Email auth: ${mode} with email: ${formData.email}`);
      
      setAuthStage("redirecting");
      setTimeout(() => {
        executeRedirect();
      }, 2500);
    } catch (err: any) {
      console.warn("Email authentication failed:", err);
      setErrorMessage(err.message || "Authentication failed. Please try again.");
      setAuthStage("idle");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    });
    setErrorMessage("");
  };

  useEffect(() => {
    if (user && authStage === 'idle') {
      executeRedirect();
    }
  }, [user]);

  return (
    <div 
      className="min-h-screen flex relative overflow-hidden bg-cover bg-center" 
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }} 
    >
      {/* GLOBAL OVERLAY */}
      <div className="absolute inset-0" style={{ backgroundColor: THEME.NAVY_BG + 'D0' }} ></div>
      
      {/* LEFT PANEL */}
      <div className="hidden lg:block absolute inset-y-0 left-0 w-1/2 p-16 z-10">
        <motion.div 
          className="relative text-white w-full max-w-lg lg:max-w-md"
          style={{ top: '30%', left: '15%' }} 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl lg:text-7xl font-extrabold mb-4 leading-none text-white">
            {mode === "signin" ? "Welcome" : "Get Started"} <br/> 
            {mode === "signin" ? "Back" : "Today"}
          </h1>
          
          <p className="text-sm lg:text-base mb-8 max-w-xs" style={{ color: THEME.LEFT_PANEL_TEXT }}>
            {mode === "signin" 
              ? "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
              : "Join thousands of construction professionals who trust our platform for accurate estimates and project management."
            }
          </p>
          
          <div className="flex space-x-4 mt-6">
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Facebook className="w-5 h-5" /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Twitter className="w-5 h-5" /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Youtube className="w-5 h-5" /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Instagram className="w-5 h-5" /></motion.a>
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANEL/FORM CONTAINER */}
      <div className="absolute inset-0 w-full flex items-center justify-center lg:justify-end lg:pr-[15%] p-4 z-20">
        {/* SUCCESS OVERLAY */}
        <AnimatePresence>
          {authStage === "redirecting" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
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
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {mode === "signin" ? "Login Successful!" : "Account Created!"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
                  We are redirecting you to the dashboard...
                </p>
                
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

        {/* MAIN FORM */}
        <motion.div
          className="w-full max-w-xs lg:max-w-sm relative p-4 lg:p-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: authStage === 'idle' || authStage === 'verifying' ? 1 : 0, 
            scale: authStage === 'idle' || authStage === 'verifying' ? 1 : 0.95
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* HEADER */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: THEME.HERO_BTN_GREEN }}
            >
              {mode === "signin" ? (
                <LogIn className="w-8 h-8 text-white" />
              ) : (
                <UserPlus className="w-8 h-8 text-white" />
              )}
            </motion.div>
            <h1 className="text-4xl font-extrabold text-white mb-2">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-sm opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
              {mode === "signin" 
                ? "Enter your credentials to access your account"
                : "Fill in your details to get started"
              }
            </p>
          </div>

          {/* AUTH FORM */}
          <div className="p-0 space-y-6">
            <AnimatePresence mode="wait">
              {authStage === "idle" && (
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Google Sign In Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleAuth}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-sm shadow-md transition-all duration-300 relative overflow-hidden group"
                    style={{
                      background: "white",
                      borderRadius: "4px"
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-gray-700 font-semibold">
                      Continue with Google
                    </span>
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: THEME.TEXT_LIGHT + '40' }}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2" style={{ 
                        backgroundColor: THEME.NAVY_BG + 'D0', 
                        color: THEME.TEXT_LIGHT 
                      }}>
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-500/10 border border-red-500/20 rounded-sm"
                    >
                      <p className="text-sm text-red-300 text-center">{errorMessage}</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleEmailAuth}>
                    <div className="space-y-4">
                      {/* Name Field (Sign Up Only) */}
                      {mode === "signup" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <Label htmlFor="name" className="text-sm font-medium block mb-2 opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                            Full Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: THEME.TEXT_LIGHT + '80' }} />
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              value={formData.name}
                              onChange={handleInputChange}
                              required={mode === "signup"}
                              placeholder="John Doe"
                              className="auth-input w-full pl-10"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Email Field */}
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium block mb-2 opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: THEME.TEXT_LIGHT + '80' }} />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="you@example.com"
                            className="auth-input w-full pl-10"
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <Label htmlFor="password" className="text-sm font-medium block mb-2 opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: THEME.TEXT_LIGHT + '80' }} />
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            placeholder="••••••••"
                            className="auth-input w-full pl-10 pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            style={{ color: THEME.TEXT_LIGHT + '80' }}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password (Sign Up Only) */}
                      {mode === "signup" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <Label htmlFor="confirmPassword" className="text-sm font-medium block mb-2 opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: THEME.TEXT_LIGHT + '80' }} />
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              required={mode === "signup"}
                              placeholder="••••••••"
                              className="auth-input w-full pl-10 pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              style={{ color: THEME.TEXT_LIGHT + '80' }}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Remember Me & Forgot Password (Sign In Only) */}
                      {mode === "signin" && (
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="rememberMe" 
                              className="w-4 h-4 rounded border-white/50 focus:ring-white focus:ring-offset-0 focus:ring-offset-transparent checked:bg-white checked:text-white" 
                              style={{ 
                                backgroundColor: THEME.HERO_BTN_GREEN, 
                                borderColor: THEME.HERO_BTN_GREEN 
                              }} 
                            />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                              Remember Me
                            </label>
                          </div>
                          <motion.a
                            href="#"
                            className="text-sm font-medium opacity-80 hover:underline"
                            style={{ color: THEME.TEXT_LIGHT }}
                            whileHover={{ x: 2 }}
                          >
                            Forgot password?
                          </motion.a>
                        </div>
                      )}

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full font-semibold py-3.5 px-6 rounded-sm shadow-md transition-all duration-300 relative overflow-hidden group mt-6"
                        style={{
                          background: THEME.HERO_BTN_GREEN,
                          borderRadius: "4px"
                        }}
                      >
                        <span className="relative z-10 text-white flex items-center justify-center gap-2">
                          {authStage === 'verifying' ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {mode === "signin" ? "Signing in..." : "Creating account..."}
                            </>
                          ) : (
                            <>
                              {mode === "signin" ? "Sign In" : "Create Account"}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </motion.button>

                      {/* Toggle Mode Link */}
                      <div className="text-center mt-6 pt-4 border-t" style={{ borderColor: THEME.TEXT_LIGHT + '20' }}>
                        <p className="text-sm opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
                          {" "}
                          <button
                            type="button"
                            onClick={toggleMode}
                            className="font-semibold hover:underline"
                            style={{ color: THEME.HERO_BTN_GREEN }}
                          >
                            {mode === "signin" ? "Sign Up" : "Sign In"}
                          </button>
                        </p>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* VERIFYING STATE */}
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
                  <h2 className="text-xl font-semibold mb-2 text-white">
                    {mode === "signin" ? "Signing In..." : "Creating Account..."}
                  </h2>
                  <p className="text-gray-200">Please wait while we authenticate</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <style>{`
        .auth-input {
          border-radius: 4px; 
          padding: 0.85rem 1rem;
          font-size: 1rem;
          background-color: white;
          color: #333;
          border: 1px solid #e5e7eb;
          box-shadow: 0 0px 0px 0 rgba(0, 0, 0, 0.0), 0 0px 1px 0 rgba(0, 0, 0, 0.1);
        }
        .auth-input:focus {
          border-color: ${THEME.HERO_BTN_GREEN} !important;
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