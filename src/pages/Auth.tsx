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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// --- THEME DEFINITIONS BASED ON USER'S HERO COMPONENT ---
const THEME = {
  NAVY_BG: "#000B29",
  HERO_BTN_GREEN: "#5BB539",
  HERO_ACCENT_BLUE: "#38bdf8",
  TEXT_LIGHT: "#F0F0F0",
  LEFT_PANEL_TEXT: "#FDBA74",
};

const BACKGROUND_IMAGE_URL =
  "https://img.freepik.com/free-photo/construction-site-sunset_23-2152006125.jpg?semt=ais_hybrid&w=740&q=80";

// Enhanced auth flow stages with method tracking
type AuthMethod = "email" | "google" | null;
type AuthFlow = "signin" | "signup";
type AuthStage = "idle" | "verifying" | "redirecting" | "error";

interface AuthState {
  stage: AuthStage;
  method: AuthMethod;
  flow: AuthFlow;
  error: string;
  loading: boolean;
  email?: string;
  resetPasswordMode?: boolean;
}

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced state management for complete auth flow tracking
  const [authState, setAuthState] = useState<AuthState>({
    stage: "idle",
    method: null,
    flow: (searchParams.get("mode") as AuthFlow) || "signin",
    error: "",
    loading: false,
    resetPasswordMode: false,
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { user, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  // Helper to update auth state with all tracking info
  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  };

  // Helper to clear errors
  const clearError = () => {
    updateAuthState({ error: "" });
  };

  // Helper to execute redirect after successful auth
  const executeRedirect = () => {
    const redirectUrl = searchParams.get("redirect");
    if (redirectUrl && redirectUrl.startsWith("/")) {
      navigate(redirectUrl);
    } else {
      navigate("/dashboard");
    }
  };

  // Google Sign-In Flow
  const handleGoogleSignIn = async () => {
    clearError();
    updateAuthState({
      stage: "verifying",
      method: "google",
      loading: true,
    });

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error("Google sign-in failed:", error);
        updateAuthState({
          stage: "idle",
          error: error.message || "SSO Verification failed. Please try again.",
          loading: false,
        });
        return;
      }

      // Transition to redirecting stage on successful auth
      updateAuthState({
        stage: "redirecting",
        loading: false,
      });

      // Execute redirect after animation completes
      setTimeout(() => {
        executeRedirect();
      }, 2500);
    } catch (err) {
      console.error("Exception during Google sign-in:", err);
      updateAuthState({
        stage: "idle",
        error: "System error during handshake. Please retry.",
        loading: false,
      });
    }
  };

  // Email Sign-In Flow
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.email || !formData.password) {
      updateAuthState({
        error: "Credentials required.",
      });
      return;
    }

    updateAuthState({
      stage: "verifying",
      method: "email",
      flow: "signin",
      loading: true,
    });

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        updateAuthState({
          stage: "idle",
          error:
            error.message ||
            "Authentication failed. Invalid credentials provided.",
          loading: false,
        });
        return;
      }

      // Track successful email sign-in and transition to redirecting
      updateAuthState({
        stage: "redirecting",
        loading: false,
      });

      setTimeout(() => {
        executeRedirect();
      }, 2500);
    } catch (err) {
      console.error("Exception during email sign-in:", err);
      updateAuthState({
        stage: "idle",
        error: "Connection timeout. Please check your network.",
        loading: false,
      });
    }
  };

  // Email Sign-Up Flow
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!formData.name || !formData.email || !formData.password) {
      updateAuthState({
        error: "All specification fields are required.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      updateAuthState({
        error: "Security keys do not match.",
      });
      return;
    }

    if (formData.password.length < 6) {
      updateAuthState({
        error: "Security key must exceed 6 characters.",
      });
      return;
    }

    updateAuthState({
      stage: "verifying",
      method: "email",
      flow: "signup",
      loading: true,
    });

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.name
      );

      if (error) {
        updateAuthState({
          stage: "idle",
          error: error.message || "License creation failed. Please try again.",
          loading: false,
        });
        return;
      }

      // Track successful email sign-up and transition to redirecting
      updateAuthState({
        stage: "redirecting",
        loading: false,
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);
    } catch (err) {
      console.error("Exception during email sign-up:", err);
      updateAuthState({
        stage: "idle",
        error: "System error during registration. Please retry.",
        loading: false,
      });
    }
  };

  // Password Reset Flow
  const handlePasswordReset = async () => {
    clearError();

    if (!formData.email) {
      updateAuthState({
        error: "Corporate ID / Email required for reset.",
      });
      return;
    }

    updateAuthState({
      stage: "verifying",
      loading: true,
    });

    try {
      await resetPassword(formData.email);
      updateAuthState({
        stage: "idle",
        resetPasswordMode: false,
        error: "Reset protocol initiated. Check your inbox.",
        loading: false,
      });
      setFormData((prev) => ({ ...prev, email: "" }));
    } catch (err: any) {
      updateAuthState({
        stage: "idle",
        error: err.message || "Failed to initiate reset protocol.",
        loading: false,
      });
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    clearError();
  };

  // Handle flow switching (signin <-> signup)
  const switchAuthFlow = (newFlow: AuthFlow) => {
    updateAuthState({
      flow: newFlow,
      method: null,
      resetPasswordMode: false,
    });
    clearError();
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    });
  };

  // Auto-redirect if user already authenticated
  useEffect(() => {
    if (user && authState.stage === "idle") {
      executeRedirect();
    }
  }, [user, authState.stage, navigate, searchParams]);

  // Handle URL param changes for mode switching
  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "signin" || urlMode === "signup") {
      switchAuthFlow(urlMode as AuthFlow);
    }
  }, [searchParams]);

  return (
    <div
      className="min-h-screen flex relative overflow-hidden bg-cover bg-center "
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: THEME.NAVY_BG + "E6" }} // Increased opacity for legibility
      ></div>

      <div className="hidden lg:block absolute inset-y-0 left-0 w-1/2 p-16 z-10">
        <motion.div
          className="relative text-white w-full max-w-lg lg:max-w-md"
          style={{ top: "30%", left: "15%" }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded bg-[#5BB539]/20 border border-[#5BB539]/30">
            <div className="w-2 h-2 rounded-full bg-[#5BB539] animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5BB539]">
              Secure Gateway
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-light mb-6 leading-tight text-white tracking-tight">
            {authState.flow === "signin" ? (
              <>
                JTech <span className="font-bold">Portal</span>
              </>
            ) : (
              <>
                System <span className="font-bold">Setup</span>
              </>
            )}
          </h1>
          <p
            className="text-sm lg:text-base mb-8 max-w-sm font-light leading-relaxed opacity-90"
            style={{ color: THEME.TEXT_LIGHT }}
          >
            {authState.flow === "signin"
              ? "Authenticate to access the JTech Engineering Suite. Manage estimations, verified databases, and project analytics in a secure environment."
              : "Initialize your professional license. Gain access to cloud-based FEA analysis and automated quantity surveying modules."}
          </p>
          <div className="flex space-x-4 mt-6">
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              className="text-white opacity-60 hover:opacity-100 transition-opacity"
            >
              <Facebook className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              className="text-white opacity-60 hover:opacity-100 transition-opacity"
            >
              <Twitter className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              className="text-white opacity-60 hover:opacity-100 transition-opacity"
            >
              <Youtube className="w-5 h-5" />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1 }}
              className="text-white opacity-60 hover:opacity-100 transition-opacity"
            >
              <Instagram className="w-5 h-5" />
            </motion.a>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 w-full flex items-center justify-center lg:justify-end lg:pr-[15%] p-4 z-20">
        <AnimatePresence>
          {authState.stage === "redirecting" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-center max-w-md mx-4 bg-[#000B29] border border-white/10 p-8 rounded-sm shadow-2xl"
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
                <h2 className="text-2xl font-bold text-white mb-3 uppercase tracking-wide">
                  {authState.flow === "signin"
                    ? "Identity Verified"
                    : "License Registered"}
                </h2>
                <p className="text-gray-400 text-sm mb-2 font-mono">
                  {authState.method === "google"
                    ? "SSO Handshake: Successful"
                    : "Credential Check: Passed"}
                </p>
                <p className="text-gray-300 text-sm mb-8">
                  Initializing dashboard environment...
                </p>
                <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    className="h-full"
                    style={{ backgroundColor: THEME.HERO_BTN_GREEN }}
                  />
                  <motion.div
                    animate={{ x: ["0%", "100%"] }}
                    transition={{
                      duration: 2.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 0.5,
                    }}
                    className="absolute -top-6 left-0"
                  >
                    <Rocket
                      className="w-6 h-6"
                      style={{ color: THEME.HERO_ACCENT_BLUE }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="w-full max-w-xs lg:max-w-sm relative p-4 lg:p-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity:
              authState.stage === "idle" || authState.stage === "verifying"
                ? 1
                : 0,
            scale:
              authState.stage === "idle" || authState.stage === "verifying"
                ? 1
                : 0.95,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 uppercase tracking-wide">
              {authState.flow === "signin"
                ? "Authorized Access"
                : "New Registration"}
            </h1>
            <p
              className="text-xs opacity-80 mb-6"
              style={{ color: THEME.TEXT_LIGHT }}
            >
              {authState.flow === "signin"
                ? "New user? "
                : "Existing license holder? "}
              <button
                type="button"
                onClick={() =>
                  switchAuthFlow(
                    authState.flow === "signin" ? "signup" : "signin"
                  )
                }
                className="font-bold hover:underline uppercase tracking-wider"
                style={{ color: THEME.HERO_BTN_GREEN }}
              >
                {authState.flow === "signin"
                  ? "Configure System"
                  : "Login Here"}
              </button>
            </p>
          </div>

          <Button className="w-full bg-white mb-6 rounded-sm">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="w-full text-[#000B29] font-bold text-xs uppercase tracking-wider hover:bg-gray-100 h-full rounded-sm transition-all duration-300 group flex items-center justify-center gap-3"
              disabled={authState.stage !== "idle"}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Enterprise Login (Google)</span>
            </motion.button>
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full border-t"
                style={{ borderColor: "rgba(255,255,255,0.1)" }}
              ></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span
                className="px-2"
                style={{
                  backgroundColor: THEME.NAVY_BG + "E6",
                  color: THEME.TEXT_LIGHT,
                  opacity: 0.6,
                }}
              >
                Or use standard credentials
              </span>
            </div>
          </div>

          <div className="p-0 space-y-6">
            <AnimatePresence mode="wait">
              {authState.stage === "idle" && (
                <motion.div
                  key="auth-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {authState.error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 rounded-sm flex items-start gap-3"
                      style={{
                        backgroundColor: "rgba(220, 38, 38, 0.1)",
                        borderLeft: `4px solid #DC2626`,
                      }}
                    >
                      <AlertCircle
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        style={{ color: "#DC2626" }}
                      />
                      <p
                        className="text-xs font-bold"
                        style={{ color: "#FECACA" }}
                      >
                        {authState.error}
                      </p>
                    </motion.div>
                  )}

                  <form
                    onSubmit={
                      authState.flow === "signin"
                        ? handleEmailSignIn
                        : handleEmailSignUp
                    }
                  >
                    <div className="space-y-5">
                      {authState.flow === "signup" && (
                        <div>
                          <Label
                            htmlFor="name"
                            className="text-xs font-bold uppercase tracking-wider block mb-2 opacity-70"
                            style={{ color: THEME.TEXT_LIGHT }}
                          >
                            Engineer / Company Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. JTech Solutions Ltd."
                            className="w-full auth-input rounded-sm"
                            required
                          />
                        </div>
                      )}

                      <div>
                        <Label
                          htmlFor="email"
                          className="text-xs font-bold uppercase tracking-wider block mb-2 opacity-70"
                          style={{ color: THEME.TEXT_LIGHT }}
                        >
                          Corporate ID / Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="user@organization.com"
                          className="w-full auth-input rounded-sm"
                          required
                        />
                      </div>

                      <div>
                        <Label
                          htmlFor="password"
                          className="text-xs font-bold uppercase tracking-wider block mb-2 opacity-70"
                          style={{ color: THEME.TEXT_LIGHT }}
                        >
                          Security Token (Password)
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter secure key"
                            className="w-full pr-12 auth-input rounded-sm"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                            style={{ color: "#333" }}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {authState.flow === "signup" && (
                        <div>
                          <Label
                            htmlFor="confirmPassword"
                            className="text-xs font-bold uppercase tracking-wider block mb-2 opacity-70"
                            style={{ color: THEME.TEXT_LIGHT }}
                          >
                            Verify Token
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Confirm secure key"
                              className="w-full pr-12 auth-input rounded-sm"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword((prev) => !prev)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                              style={{ color: "#333" }}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {authState.flow === "signin" && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="rememberMe"
                              className="w-3.5 h-3.5 rounded-sm border-white/50 focus:ring-offset-0"
                              style={{
                                accentColor: THEME.HERO_BTN_GREEN,
                              }}
                            />
                            <label
                              htmlFor="rememberMe"
                              className="ml-2 block text-xs font-medium opacity-70"
                              style={{ color: THEME.TEXT_LIGHT }}
                            >
                              Remember Session
                            </label>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateAuthState({
                                resetPasswordMode: !authState.resetPasswordMode,
                              })
                            }
                            className="text-xs font-bold hover:underline"
                            style={{ color: THEME.HERO_BTN_GREEN }}
                          >
                            Reset Token?
                          </button>
                        </div>
                      )}

                      {/* Auth Submit Button */}
                      <Button className="w-full bg-[#5BB539] hover:bg-[#4a942e] rounded-sm mt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-sm shadow-md transition-all duration-300 relative overflow-hidden group flex items-center justify-center gap-2"
                          disabled={
                            authState.loading || authState.stage !== "idle"
                          }
                        >
                          {authState.loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : authState.flow === "signin" ? (
                            <>
                              <LogIn className="w-4 h-4" />
                              <span>Authenticate Session</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              <span>Register License</span>
                            </>
                          )}
                        </motion.button>
                      </Button>
                    </div>
                  </form>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center pt-4"
                  >
                    <p
                      className="text-[10px] opacity-60"
                      style={{ color: THEME.TEXT_LIGHT }}
                    >
                      By clicking '
                      {authState.flow === "signin"
                        ? "AUTHENTICATE"
                        : "REGISTER"}
                      ' you agree to our
                      <br />
                      <span className="font-bold">
                        <a
                          href="#"
                          className="hover:underline mr-2"
                          style={{ color: THEME.TEXT_LIGHT }}
                        >
                          EULA
                        </a>
                        <span style={{ color: THEME.TEXT_LIGHT }}>|</span>
                        <a
                          href="#"
                          className="hover:underline ml-2"
                          style={{ color: THEME.TEXT_LIGHT }}
                        >
                          Data Privacy Policy
                        </a>
                      </span>
                    </p>
                  </motion.div>
                </motion.div>
              )}

              {authState.stage === "verifying" && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center justify-center text-center py-12 rounded-sm"
                  style={{ backgroundColor: THEME.NAVY_BG + "40" }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="mb-6"
                  >
                    <Loader2 className="w-12 h-12 text-[#5BB539]" />
                  </motion.div>
                  <h2 className="text-lg font-bold uppercase tracking-wider mb-2 text-white">
                    {authState.method === "google"
                      ? "Verifying SSO Token..."
                      : authState.flow === "signin"
                      ? "Validating Credentials..."
                      : "Generating License..."}
                  </h2>
                  <p className="text-gray-300 text-xs font-mono">
                    {authState.method === "google"
                      ? "Establishing secure handshake with Google Workspace"
                      : authState.flow === "signin"
                      ? "Checking encrypted database records"
                      : "Allocating user resources"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <style>{`
          .auth-input {
            border-radius: 2px; 
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
            background-color: white;
            color: #333;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
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
            font-size: 0.85rem;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Auth;
