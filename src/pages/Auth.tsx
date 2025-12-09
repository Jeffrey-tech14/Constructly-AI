// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

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
  LogIn,
  UserPlus,
  AlertCircle,
  Shield
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

// Background Image URL
const BACKGROUND_IMAGE_URL = 'https://img.freepik.com/free-photo/construction-site-sunset_23-2152006125.jpg?semt=ais_hybrid&w=740&q=80';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<"signin" | "signup">(searchParams.get("mode") as "signin" | "signup" || "signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [authStage, setAuthStage] = useState<"idle" | "verifying" | "redirecting">("idle");
  const { 
    user, 
    signInWithGoogle 
  } = useAuth();

  // Execute redirect after successful authentication
  const executeRedirect = () => {
    const redirectUrl = searchParams.get("redirect");
    if (redirectUrl && redirectUrl.startsWith("/")) {
      navigate(redirectUrl);
    } else {
      navigate("/dashboard");
    }
  };

  // Handle "Create Account" button click (triggers Google sign-in)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic validation for signup
    if (!formData.name) {
      setError("Please enter your name");
      return;
    }
    
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (!formData.password) {
      setError("Please enter a password");
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // All validation passed, now trigger Google sign-in
    await handleGoogleAuth();
  };

  // Handle "Sign In" button click (triggers Google sign-in)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic validation for signin
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }
    
    if (!formData.password) {
      setError("Please enter your password");
      return;
    }

    // All validation passed, now trigger Google sign-in
    await handleGoogleAuth();
  };

  // Common Google authentication handler
  const handleGoogleAuth = async () => {
    setLoading(true);
    setAuthStage("verifying");
    
    try {
      // Use the form data to personalize the experience if needed
      console.log("Authenticating with form data:", {
        name: formData.name,
        email: formData.email,
        mode: mode
      });
      
      // Actually sign in with Google
      await signInWithGoogle();
      
      setAuthStage("redirecting");
      setTimeout(() => {
        executeRedirect();
      }, 2500);
    } catch (err: any) {
      console.error("Authentication failed:", err);
      setError(err.message || `Failed to ${mode === "signin" ? "sign in" : "create account"}. Please try again.`);
      setAuthStage("idle");
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && authStage === 'idle') {
      const redirectUrl = searchParams.get("redirect");
      if (redirectUrl && redirectUrl.startsWith("/")) {
        navigate(redirectUrl);
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, authStage, navigate, searchParams]);

  // Update mode when URL changes
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "signin" || urlMode === "signup") {
      setMode(urlMode);
      setError("");
      // Reset form data when switching modes
      if (mode !== urlMode) {
        setFormData({ email: "", password: "", confirmPassword: "", name: "" });
      }
    }
  }, [searchParams]);

  return (
    <div 
      className="min-h-screen flex relative overflow-hidden bg-cover bg-center" 
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }} 
    >
      {/* GLOBAL OVERLAY */}
      <div className="absolute inset-0" style={{ backgroundColor: THEME.NAVY_BG + 'D0' }}></div>
      
      {/* LEFT PANEL CONTENT */}
      <div className="hidden lg:block absolute inset-y-0 left-0 w-1/2 p-16 z-10">
        <motion.div 
          className="relative text-white w-full max-w-lg lg:max-w-md"
          style={{ top: '30%', left: '15%' }} 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl lg:text-7xl font-extrabold mb-4 leading-none text-white">
            {mode === "signin" ? "Welcome Back" : "Join Our Community"}
          </h1>
          <p className="text-sm lg:text-base mb-8 max-w-xs" style={{ color: THEME.LEFT_PANEL_TEXT }}>
            {mode === "signin" 
              ? "Securely access your account with Google authentication. Your data is protected with enterprise-grade security."
              : "Create your account instantly with Google. We'll use your information to personalize your experience."
            }
          </p>
          <div className="flex items-center gap-3 mt-8 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <Shield className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Secure Google Authentication</p>
              <p className="text-xs opacity-80" style={{ color: THEME.LEFT_PANEL_TEXT }}>Industry-standard security</p>
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Facebook className="w-5 h-5" /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Twitter className="w-5 h-5" /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Youtube className="w-5 h-5" /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-white opacity-90 hover:opacity-100 transition-opacity"><Instagram className="w-5 h-5" /></motion.a>
          </div>
        </motion.div>
      </div>

      {/* RIGHT PANEL/CENTERED FORM CONTAINER */}
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
                    <svg className="w-12 h-12" viewBox="0 0 24 24">
                      <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </motion.div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Authentication Successful!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
                  You've been securely authenticated with Google. Redirecting...
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
          {/* TITLE AND MODE SWITCHER */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white mb-2">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-sm opacity-80 mb-6" style={{ color: THEME.TEXT_LIGHT }}>
              {mode === "signin" 
                ? "Don't have an account? " 
                : "Already have an account? "}
              <button
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setError("");
                  setFormData({ email: "", password: "", confirmPassword: "", name: "" });
                }}
                className="font-semibold hover:underline"
                style={{ color: THEME.HERO_BTN_GREEN }}
              >
                {mode === "signin" ? "Create one now" : "Sign in instead"}
              </button>
            </p>
            
            {/* Google Authentication Notice */}
            <div className="mt-4 mb-6 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm" style={{ color: THEME.TEXT_LIGHT }}>
                  {mode === "signin" 
                    ? "Sign in securely with Google" 
                    : "Create account securely with Google"
                  }
                </span>
              </div>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-sm flex items-start gap-3"
              style={{ 
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                borderLeft: `4px solid #DC2626`
              }}
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#DC2626" }} />
              <p className="text-sm" style={{ color: "#FECACA" }}>{error}</p>
            </motion.div>
          )}

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
                  <form onSubmit={mode === "signin" ? handleSignIn : handleCreateAccount}>
                    <div className="space-y-6">
                      {/* Name field (only for sign up) */}
                      {mode === "signup" && (
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium block mb-2 opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="auth-input w-full"
                            required
                          />
                          <p className="text-xs mt-1 opacity-70" style={{ color: THEME.TEXT_LIGHT }}>
                            We'll use this to personalize your experience
                          </p>
                        </div>
                      )}

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
                          placeholder="Enter your email"
                          className="auth-input w-full"
                          required
                        />
                        <p className="text-xs mt-1 opacity-70" style={{ color: THEME.TEXT_LIGHT }}>
                          Used for account verification and communication
                        </p>
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
                            placeholder="Enter your password"
                            className="auth-input w-full pr-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            style={{ color: THEME.TEXT_LIGHT }}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <p className="text-xs mt-1 opacity-70" style={{ color: THEME.TEXT_LIGHT }}>
                          Must be at least 6 characters
                        </p>
                      </div>

                      {/* Confirm Password field (only for sign up) */}
                      {mode === "signup" && (
                        <div>
                          <Label htmlFor="confirmPassword" className="text-sm font-medium block mb-2 opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Confirm your password"
                              className="auth-input w-full pr-12"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                              style={{ color: THEME.TEXT_LIGHT }}
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Remember Me (only for sign in) */}
                      {mode === "signin" && (
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="rememberMe" 
                            className="w-4 h-4 rounded border-white/50 focus:ring-white focus:ring-offset-0 focus:ring-offset-transparent" 
                            style={{ 
                              backgroundColor: THEME.HERO_BTN_GREEN, 
                              borderColor: THEME.HERO_BTN_GREEN 
                            }} 
                          />
                          <label htmlFor="rememberMe" className="ml-2 block text-sm opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                            Keep me signed in
                          </label>
                        </div>
                      )}

                      {/* Submit Button - This triggers Google authentication */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full font-semibold py-3.5 px-6 rounded-sm shadow-md transition-all duration-300 relative overflow-hidden group flex items-center justify-center gap-3"
                        style={{
                          background: THEME.HERO_BTN_GREEN, 
                          borderRadius: "4px"
                        }}
                        disabled={loading || authStage === "verifying"}
                      >
                        {/* Hidden Google icon that appears on hover */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          className="absolute left-4"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        </motion.div>
                        
                        {loading || authStage === "verifying" ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Authenticating...</span>
                          </>
                        ) : mode === "signin" ? (
                          <>
                            <LogIn className="w-5 h-5" />
                            <span>Sign In Securely</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            <span>Create Account Securely</span>
                          </>
                        )}
                      </motion.button>

                      {/* Privacy Notice */}
                      <p className="text-xs text-center opacity-70 pt-2" style={{ color: THEME.TEXT_LIGHT }}>
                        By clicking "{mode === "signin" ? "Sign In Securely" : "Create Account Securely"}", you'll authenticate with Google
                      </p>
                    </div>
                  </form>

                  {/* Terms and Privacy */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <p className="text-xs opacity-80" style={{ color: THEME.TEXT_LIGHT }}>
                      Your privacy is important. We use Google OAuth for secure authentication.<br/>
                      <a href="#" className="hover:underline mr-2" style={{ color: THEME.TEXT_LIGHT }}>Terms</a>
                      <span style={{ color: THEME.TEXT_LIGHT }}>•</span>
                      <a href="#" className="hover:underline mx-2" style={{ color: THEME.TEXT_LIGHT }}>Privacy</a>
                      <span style={{ color: THEME.TEXT_LIGHT }}>•</span>
                      <a href="#" className="hover:underline ml-2" style={{ color: THEME.TEXT_LIGHT }}>Security</a>
                    </p>
                  </motion.div>
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
                  <div className="mb-6 relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="mb-2"
                    >
                      <Loader2 className="w-16 h-16 text-white" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-white">
                    {mode === "signin" ? "Signing in with Google..." : "Creating account with Google..."}
                  </h2>
                  <p className="text-gray-200">You'll be redirected to Google for secure authentication</p>
                  <div className="mt-6 w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="h-full"
                      style={{ backgroundColor: THEME.HERO_BTN_GREEN }}
                    />
                  </div>
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
          transition: all 0.2s ease;
        }
        .auth-input:focus {
          border-color: ${THEME.HERO_BTN_GREEN} !important;
          box-shadow: 0 0 0 2px ${THEME.HERO_BTN_GREEN}40;
          outline: none;
        }
        .auth-input:hover {
          border-color: ${THEME.HERO_BTN_GREEN};
        }
        .auth-input::placeholder {
          color: #9CA3AF;
        }
      `}</style>
    </div>
  );
};

export default Auth;