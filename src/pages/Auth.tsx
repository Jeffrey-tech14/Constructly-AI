// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  `}</style>
);

// 🔴 RESTORE ORIGINAL BRAND COLORS
const BRAND = {
  PRIMARY: "#00356B",   // Deep navy — strong and professional
  ACCENT: "#D85C2C",    // Vibrant orange — for CTAs
  SUCCESS: "#86bc25",   // Bold green — for highlights
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { user, signIn, signUp, signInWithGoogle } = useAuth();

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") setIsSignUp(true);
    else if (mode === "signin") setIsSignUp(false);
  }, [searchParams]);

  useEffect(() => {
    if (user && !loading && !success) {
      navigate("/dashboard");
    }
  }, [user, loading, success, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const executeSuccess = () => {
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      executeSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Google Sign In failed.");
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!formData.email || !formData.password)
        throw new Error("Credentials required.");
      const { error } = await signIn(formData.email, formData.password);
      if (error) throw error;
      executeSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Invalid credentials.");
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!formData.name || !formData.email || !formData.password)
        throw new Error("All fields required.");
      if (formData.password !== formData.confirmPassword)
        throw new Error("Passwords do not match.");
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.name
      );
      if (error) throw error;
      executeSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Registration failed.");
    }
  };

  return (
    <>
      <GlobalStyles />
      <div
        className="min-h-screen w-full flex items-center justify-center p-4 font-technical relative"
        style={{
          backgroundImage: `url('https://t4.ftcdn.net/jpg/03/57/34/39/360_F_357343965_u58BFcRrziBVMqgt6liwPHJKcIjHsPnc.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

        <div className="relative bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-[850px] min-h-[600px] md:min-h-[520px] z-10">
          
          {/* SIGN UP FORM */}
          <div
            className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 z-[1] 
              ${isSignUp ? "opacity-100 z-[5] md:translate-x-full" : "opacity-0 z-[1] md:opacity-100 md:translate-x-0"}
            `}
          >
            <form
              className="bg-white flex flex-col items-center justify-center h-full px-6 sm:px-10 text-center"
              onSubmit={handleEmailSignUp}
            >
              <h1 className="font-bold text-2xl md:text-3xl mb-4" style={{ color: BRAND.PRIMARY }}>
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
                  className="bg-gray-50 border border-[#d1d5db] px-4 py-3 text-sm w-full outline-none rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B]"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-[#d1d5db] px-4 py-3 text-sm w-full outline-none rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B]"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-[#d1d5db] px-4 py-3 text-sm w-full outline-none rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B]"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-[#d1d5db] px-4 py-3 text-sm w-full outline-none rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B]"
                />
              </div>

              {error && isSignUp && (
                <p className="text-red-500 text-xs mt-2 font-bold">{error}</p>
              )}

              <button
                className="mt-6 text-white text-xs font-black py-3 px-12 rounded-md uppercase tracking-wider hover:brightness-110 transition-all shadow-sm"
                disabled={loading}
                style={{ backgroundColor: BRAND.ACCENT }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sign Up"}
              </button>

              <div className="flex items-center gap-4 w-full my-6">
                <div className="h-px bg-gray-200 w-full"></div>
                <span className="text-xs font-bold text-gray-400">OR</span>
                <div className="h-px bg-gray-200 w-full"></div>
              </div>
              
              <GoogleButton
                onClick={handleGoogleSignIn}
                disabled={loading}
                text="Sign up with Google"
              />

              <div className="mt-6 md:hidden">
                <p className="text-xs text-gray-500">Already have an account?</p>
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-xs font-bold uppercase mt-2 hover:underline"
                  style={{ color: BRAND.ACCENT }}
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>

          {/* SIGN IN FORM */}
          <div
            className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-full md:w-1/2 z-[2]
               ${isSignUp ? "opacity-0 z-[1] md:opacity-100 md:translate-x-full" : "opacity-100 z-[5] md:translate-x-0"}
            `}
          >
            <form
              className="bg-white flex flex-col items-center justify-center h-full px-6 sm:px-10 text-center"
              onSubmit={handleEmailSignIn}
            >
              <h1 className="font-bold text-2xl md:text-3xl mb-6" style={{ color: BRAND.PRIMARY }}>
                Sign In
              </h1>

              <div className="w-full space-y-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-[#d1d5db] px-4 py-3 text-sm w-full outline-none rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B]"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-gray-50 border border-[#d1d5db] px-4 py-3 text-sm w-full outline-none rounded-lg focus:ring-1 focus:ring-[#00356B] focus:border-[#00356B]"
                />
              </div>

              <button
                type="button"
                className="text-xs mt-3 hover:underline font-medium transition-colors"
                style={{ color: BRAND.PRIMARY }}
              >
                Forgot Password?
              </button>

              {error && !isSignUp && (
                <p className="text-red-500 text-xs mt-2 font-bold">{error}</p>
              )}

              <button
                className="mt-6 text-white text-xs font-black py-3 px-16 rounded-md uppercase tracking-wider hover:brightness-110 transition-all shadow-sm"
                disabled={loading}
                style={{ backgroundColor: BRAND.ACCENT }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Login"}
              </button>

              <div className="flex items-center gap-4 w-full my-6">
                <div className="h-px bg-gray-200 w-full"></div>
                <span className="text-xs font-bold text-gray-400">OR</span>
                <div className="h-px bg-gray-200 w-full"></div>
              </div>
              
              <GoogleButton
                onClick={handleGoogleSignIn}
                disabled={loading}
                text="Sign in with Google"
              />

              <div className="mt-6 md:hidden">
                <p className="text-xs text-gray-500">Don't have an account?</p>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-xs font-bold uppercase mt-2 hover:underline"
                  style={{ color: BRAND.ACCENT }}
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>

          {/* OVERLAY PANEL (Desktop Only) */}
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
                <div className="mb-6 h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-lg border-2" style={{ borderColor: BRAND.SUCCESS }}>
                  <User className="w-8 h-8" style={{ color: BRAND.PRIMARY }} strokeWidth={1.8} />
                </div>
                <h1 className="font-bold text-2xl md:text-3xl mb-3" style={{ color: BRAND.SUCCESS }}>Welcome Back!</h1>
                <p className="text-sm text-white/90 mb-6 max-w-[260px]">
                  Enter your details to access your dashboard.
                </p>
                <button
                  className="text-xs font-black py-2.5 px-8 rounded-md uppercase tracking-wider hover:bg-white/10 transition-colors"
                  style={{ backgroundColor: 'white', color: BRAND.PRIMARY }}
                  onClick={() => setIsSignUp(false)}
                >
                  Sign In
                </button>
              </div>

              <div
                className={`absolute right-0 flex flex-col items-center justify-center h-full w-1/2 px-8 text-center top-0 transition-transform duration-700 ease-in-out
                  ${isSignUp ? "translate-x-[20%]" : "translate-x-0"}
                `}
              >
                <div className="mb-6 h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-lg border-2" style={{ borderColor: BRAND.SUCCESS }}>
                  <User className="w-8 h-8" style={{ color: BRAND.PRIMARY }} strokeWidth={1.8} />
                </div>
                <h1 className="font-bold text-2xl md:text-3xl mb-3" style={{ color: BRAND.SUCCESS }}>Join JTech AI</h1>
                <p className="text-sm text-white/90 mb-6 max-w-[260px]">
                  Register to unlock automated estimation tools.
                </p>
                <button
                  className="text-xs font-black py-2.5 px-8 rounded-md uppercase tracking-wider hover:bg-white/10 transition-colors"
                  style={{ backgroundColor: 'white', color: BRAND.PRIMARY }}
                  onClick={() => setIsSignUp(true)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          {success && (
            <div className="absolute inset-0 z-[200] bg-white/95 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${BRAND.SUCCESS}20` }}>
                  <CheckCircle className="w-8 h-8" style={{ color: BRAND.SUCCESS }} strokeWidth={2} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: BRAND.PRIMARY }}>Success!</h2>
                <p className="text-gray-600 text-sm">Redirecting to dashboard...</p>
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
    className="w-full h-11 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 shadow-sm"
  >
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    {text}
  </button>
);

export default Auth;