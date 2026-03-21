// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  LoaderPinwheel,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  ArrowLeft,
  AlertCircle,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const BRAND = {
  PRIMARY: "#00356B",
  ACCENT: "#D85C2C",
  SUCCESS: "#86bc25",
};

type AuthView = "signin" | "signup" | "forgot-password";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [view, setView] = useState<AuthView>("signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signupEmailSent, setSignupEmailSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { user, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  const isSignUp = view === "signup";
  const isForgotPassword = view === "forgot-password";

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") setView("signup");
    else if (mode === "signin") setView("signin");
  }, [searchParams]);

  useEffect(() => {
    if (user && !loading && !success && !googleLoading) {
      navigate("/dashboard");
    }
  }, [user, loading, success, googleLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setStatusMessage("");
  };

  const executeSuccess = () => {
    setLoading(false);
    setSuccess(true);
    setStatusMessage("Authentication successful! Redirecting...");
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setStatusMessage("Connecting to Google...");
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      setStatusMessage("Redirecting to Google...");
    } catch (err: any) {
      setGoogleLoading(false);
      setStatusMessage("");
      setError(err.message || "Google Sign In failed. Please try again.");
      console.error("Google OAuth error:", err);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatusMessage("Signing you in...");
    setLoading(true);
    try {
      if (!formData.email || !formData.password)
        throw new Error("Please enter your email and password.");
      const { error } = await signIn(formData.email, formData.password);
      if (error) throw error;
      executeSuccess();
    } catch (err: any) {
      setLoading(false);
      setStatusMessage("");
      const msg = err.message || "Invalid credentials.";
      if (msg.includes("Invalid login")) {
        setError("Incorrect email or password. Please try again.");
      } else if (msg.includes("Email not confirmed")) {
        setError(
          "Your email is not confirmed. Please check your inbox for a verification link.",
        );
      } else {
        setError(msg);
      }
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatusMessage("Creating your account...");
    setLoading(true);
    try {
      if (!formData.name || !formData.email || !formData.password)
        throw new Error("Please fill in all fields.");
      if (formData.password.length < 6)
        throw new Error("Password must be at least 6 characters.");
      if (formData.password !== formData.confirmPassword)
        throw new Error("Passwords do not match.");
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.name,
      );
      if (error) throw error;
      setLoading(false);
      setSignupEmailSent(true);
      setStatusMessage("");
    } catch (err: any) {
      setLoading(false);
      setStatusMessage("");
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatusMessage("Sending reset link...");
    setLoading(true);
    try {
      if (!formData.email) throw new Error("Please enter your email address.");
      await resetPassword(formData.email);
      setLoading(false);
      setResetEmailSent(true);
      setStatusMessage("");
    } catch (err: any) {
      setLoading(false);
      setStatusMessage("");
      setError(err.message || "Failed to send reset email. Please try again.");
    }
  };

  // Email confirmation screens
  if (signupEmailSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${BRAND.SUCCESS}20` }}
          >
            <Mail className="w-8 h-8" style={{ color: BRAND.SUCCESS }} />
          </div>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            We've sent a confirmation link to{" "}
            <span className="font-semibold text-[#1a1a1a]">
              {formData.email}
            </span>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-left">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Click the link in the email to verify your account. If you don't
                see it, check your spam folder.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSignupEmailSent(false);
              setView("signin");
            }}
            className="text-sm font-medium hover:underline"
            style={{ color: BRAND.ACCENT }}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (resetEmailSent) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${BRAND.SUCCESS}20` }}
          >
            <Mail className="w-8 h-8" style={{ color: BRAND.SUCCESS }} />
          </div>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
            Reset Link Sent
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            We've sent a password reset link to{" "}
            <span className="font-semibold text-[#1a1a1a]">
              {formData.email}
            </span>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-left">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Follow the link in the email to set a new password. The link
                expires in 1 hour.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setResetEmailSent(false);
              setView("signin");
            }}
            className="text-sm font-medium hover:underline"
            style={{ color: BRAND.ACCENT }}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center p-4 font-technical relative bg-white overflow-hidden">
        <div className="relative bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-[850px] min-h-[600px] md:min-h-[520px] z-10 border border-gray-100">
          {/* Status bar */}
          {statusMessage && (
            <div className="absolute top-0 left-0 right-0 z-[200] bg-blue-600 text-white text-xs py-2 px-4 flex items-center justify-center gap-2 animate-fade-in">
              <LoaderPinwheel className="w-3 h-3 animate-spin" />
              {statusMessage}
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {isForgotPassword && (
            <div className="flex items-center justify-center h-full min-h-[520px]">
              <form
                className="bg-white flex flex-col items-center justify-center px-6 sm:px-10 text-center w-full max-w-md"
                onSubmit={handleForgotPassword}
              >
                <h1 className="font-bold text-2xl md:text-3xl mb-2 text-[#1a1a1a]">
                  Reset Password
                </h1>
                <p className="text-xs text-gray-500 mb-6">
                  Enter your email and we'll send you a reset link
                </p>

                <div className="w-full space-y-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-[#f2f6f9] border border-gray-200 px-4 py-3 text-sm w-full outline-none text-[#1a1a1a] rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B]"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 mt-3">
                    <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <p className="text-red-500 text-xs font-bold">{error}</p>
                  </div>
                )}

                <button
                  className="mt-6 text-white text-xs font-black py-3 px-12 rounded-md uppercase tracking-wider hover:brightness-110 transition-all shadow-sm"
                  disabled={loading}
                  style={{ backgroundColor: BRAND.ACCENT }}
                >
                  {loading ? (
                    <LoaderPinwheel className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setView("signin");
                    setError("");
                  }}
                  className="mt-4 text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to Sign In
                </button>
              </form>
            </div>
          )}

          {/* SIGN UP FORM */}
          {!isForgotPassword && (
            <div
              className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 z-[1] 
              ${isSignUp ? "opacity-100 z-[5] md:translate-x-full" : "opacity-0 z-[1] md:opacity-100 md:translate-x-0"}
            `}
            >
              <form
                className="bg-white flex flex-col items-center justify-center h-full px-6 sm:px-10 text-center"
                onSubmit={handleEmailSignUp}
              >
                <h1 className="font-bold text-2xl md:text-3xl mb-4 text-[#1a1a1a]">
                  Create Account
                </h1>
                <span className="text-xs text-gray-500 mb-6 font-medium">
                  Use your email for registration
                </span>

                <div className="w-full space-y-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-[#f2f6f9] border border-gray-200 px-4 py-3 text-sm w-full outline-none text-[#1a1a1a] rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B]"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-[#f2f6f9] border border-gray-200 px-4 py-3 text-sm w-full outline-none text-[#1a1a1a] rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B]"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password (min 6 characters)"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-[#f2f6f9] border border-gray-200 px-4 py-3 text-sm w-full outline-none text-[#1a1a1a] rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="bg-[#f2f6f9] border border-gray-200 px-4 py-3 text-sm w-full outline-none text-[#1a1a1a] rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-500 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && isSignUp && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <p className="text-red-500 text-xs font-bold">{error}</p>
                  </div>
                )}

                <button
                  className="mt-6 text-white text-xs font-black py-3 px-12 rounded-md uppercase tracking-wider hover:brightness-110 transition-all shadow-sm"
                  disabled={loading}
                  style={{ backgroundColor: BRAND.ACCENT }}
                >
                  {loading ? (
                    <LoaderPinwheel className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Sign Up"
                  )}
                </button>

                <div className="flex items-center gap-4 w-full my-6">
                  <div className="h-px bg-white/10 w-full"></div>
                  <span className="text-xs font-bold text-gray-400">OR</span>
                  <div className="h-px bg-white/10 w-full"></div>
                </div>

                <GoogleButton
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  text={googleLoading ? "Connecting..." : "Sign up with Google"}
                />

                <div className="mt-6 md:hidden">
                  <p className="text-xs text-gray-500">
                    Already have an account?
                  </p>
                  <button
                    type="button"
                    onClick={() => setView("signin")}
                    className="text-xs font-bold uppercase mt-2 hover:underline"
                    style={{ color: BRAND.ACCENT }}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SIGN IN FORM */}
          {!isForgotPassword && (
            <div
              className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 z-[2]
               ${isSignUp ? "opacity-0 z-[1] md:opacity-100 md:translate-x-full" : "opacity-100 z-[5] md:translate-x-0"}
            `}
            >
              <form
                className="bg-white flex flex-col items-center justify-center h-full px-6 sm:px-10 text-center"
                onSubmit={handleEmailSignIn}
              >
                <h1 className="font-bold text-2xl md:text-3xl mb-6 text-[#1a1a1a]">
                  Sign In
                </h1>

                <div className="w-full space-y-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-[#f2f6f9] border border-gray-200 px-4 py-3 text-sm w-full outline-none text-[#1a1a1a] rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B]"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-[#f2f6f9] border border-gray-200 px-4 py-3 text-sm w-full outline-none text-[#1a1a1a] rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setView("forgot-password");
                    setError("");
                  }}
                  className="text-xs mt-3 hover:underline font-medium transition-colors text-[#1a1a1a]"
                >
                  Forgot Password?
                </button>

                {error && !isSignUp && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <p className="text-red-500 text-xs font-bold">{error}</p>
                  </div>
                )}

                <button
                  className="mt-6 text-white text-xs font-black py-3 px-16 rounded-md uppercase tracking-wider hover:brightness-110 transition-all shadow-sm"
                  disabled={loading}
                  style={{ backgroundColor: BRAND.ACCENT }}
                >
                  {loading ? (
                    <LoaderPinwheel className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Login"
                  )}
                </button>

                <div className="flex items-center gap-4 w-full my-6">
                  <div className="h-px bg-white/10 w-full"></div>
                  <span className="text-xs font-bold text-gray-400">OR</span>
                  <div className="h-px bg-white/10 w-full"></div>
                </div>

                <GoogleButton
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  text={googleLoading ? "Connecting..." : "Sign in with Google"}
                />

                <div className="mt-6 md:hidden">
                  <p className="text-xs text-gray-500">
                    Don't have an account?
                  </p>
                  <button
                    type="button"
                    onClick={() => setView("signup")}
                    className="text-xs font-bold uppercase mt-2 hover:underline"
                    style={{ color: BRAND.ACCENT }}
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* OVERLAY PANEL (Desktop Only) */}
          {!isForgotPassword && (
            <div
              className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-[100]
              ${isSignUp ? "-translate-x-full rounded-tr-[100px]" : "translate-x-0 rounded-tl-[100px]"}
            `}
            >
              <div
                className={`bg-[#00356B] text-white relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out
                ${isSignUp ? "translate-x-1/2" : "translate-x-0"}
              `}
              >
                <div
                  className={`absolute flex flex-col items-center justify-center h-full w-1/2 px-8 text-center top-0 transition-transform duration-700 ease-in-out
                  ${isSignUp ? "translate-x-0" : "-translate-x-[20%]"}
                `}
                >
                  <div className="mb-6 h-20 w-20 flex items-center justify-center ">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm p-2">
                      <svg
                        viewBox="0 0 44 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full text-[#f0514e]"
                      >
                        <path
                          d="M14 4 L26 16 L14 28 L2 16 Z"
                          fill="currentColor"
                        />
                        <path
                          d="M30 4 L42 16 L30 28 L24 22 L30 16 L24 10 Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                  <h1
                    className="font-bold text-2xl md:text-3xl mb-3"
                    style={{ color: BRAND.SUCCESS }}
                  >
                    Welcome Back!
                  </h1>
                  <p className="text-sm text-white/90 mb-6 max-w-[260px]">
                    Enter your details to access your dashboard.
                  </p>
                  <button
                    className="text-xs font-black py-2.5 px-8 rounded-md uppercase tracking-wider hover:bg-white/10 transition-colors"
                    style={{ backgroundColor: "#1e2128", color: BRAND.PRIMARY }}
                    onClick={() => setView("signin")}
                  >
                    Sign In
                  </button>
                </div>

                <div
                  className={`absolute right-0 flex flex-col items-center justify-center h-full w-1/2 px-8 text-center top-0 transition-transform duration-700 ease-in-out
                  ${isSignUp ? "translate-x-[20%]" : "translate-x-0"}
                `}
                >
                  <div className="mb-6 h-20 w-20 flex items-center justify-center ">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl shadow-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm p-2">
                      <svg
                        viewBox="0 0 44 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full text-[#f0514e]"
                      >
                        <path
                          d="M14 4 L26 16 L14 28 L2 16 Z"
                          fill="currentColor"
                        />
                        <path
                          d="M30 4 L42 16 L30 28 L24 22 L30 16 L24 10 Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                  <h1
                    className="font-bold text-2xl md:text-3xl mb-3"
                    style={{ color: BRAND.SUCCESS }}
                  >
                    Join JTech AI
                  </h1>
                  <p className="text-sm text-white/90 mb-6 max-w-[260px]">
                    Register to unlock automated estimation tools.
                  </p>
                  <button
                    className="text-xs font-black py-2.5 px-8 rounded-md uppercase tracking-wider hover:bg-white/10 transition-colors"
                    style={{ backgroundColor: "#1e2128", color: BRAND.PRIMARY }}
                    onClick={() => setView("signup")}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {success && (
            <div className="fixed inset-0 z-[9999] bg-[#fcfdfd]/95 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${BRAND.SUCCESS}20` }}
                >
                  <CheckCircle
                    className="w-8 h-8"
                    style={{ color: BRAND.SUCCESS }}
                    strokeWidth={2}
                  />
                </div>
                <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
                  Success!
                </h2>
                <p className="text-gray-500 text-sm">
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const GoogleButton = ({ onClick, disabled, text }: any) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-full h-11 bg-white border border-gray-200 text-gray-500 text-sm font-medium rounded-md hover:bg-[#f2f6f9] transition-colors flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
    {text}
  </button>
);

export default Auth;
