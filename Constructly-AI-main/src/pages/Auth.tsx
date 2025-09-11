import { useState, useEffect } from "react";
import { useSearchParams, Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DraftingCompass, ArrowLeft, Loader2, Pickaxe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

// RISA Color Palette (Imported from index.tsx)
const RISA_BLUE = "#015B97"; // Primary Brand Color
const RISA_LIGHT_BLUE = "#3288e6"; // Secondary/Accent
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748"; // Charcoal for text
const RISA_LIGHT_GRAY = "#F5F7FA"; // Backgrounds
const RISA_MEDIUM_GRAY = "#E2E8F0"; // Borders

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") || "signin");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { user, profile, signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Sign up validation
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        await signUp(formData.email, formData.password, formData.name);
        setSuccess(
          "Account created successfully! Please check your email to verify your account."
        );
      }

      // Sign in flow
      if (mode === "signin") {
        await signIn(formData.email, formData.password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);

      // Default fallback
      let friendlyMessage = "Something went wrong. Please try again.";
      const msg = err.message.toLowerCase();

      // Match against common cases
      if (msg.includes("passwords do not match")) {
        friendlyMessage = "Your passwords do not match.";
        throw new Error(friendlyMessage);
      } else if (msg.includes("at least 6 characters")) {
        friendlyMessage = "Password must be at least 6 characters long.";
        throw new Error(friendlyMessage);
      } else if (
        msg.includes("invalid login") ||
        msg.includes("invalid credentials")
      ) {
        friendlyMessage = "Invalid email or password. Please try again.";
        throw new Error(friendlyMessage);
      } else if (msg.includes("user not found")) {
        friendlyMessage = "No account found with that email.";
        throw new Error(friendlyMessage);
      } else if (msg.includes("email already in use")) {
        friendlyMessage = "This email is already registered. Try signing in.";
        throw new Error(friendlyMessage);
      } else if (msg.includes("network")) {
        friendlyMessage =
          "Network error. Please check your internet connection.";
        throw new Error(friendlyMessage);
      }

      // Show toast notification
      toast({
        title: "Authentication Error",
        description: friendlyMessage,
        variant: "destructive",
      });

      // Show inline error below the header
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Redirect to dashboard if authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
      style={{ fontFamily: "Poppins, Helvetica Neue, Arial, sans-serif" }}
    >
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors mb-4 dark:text-gray-300 dark:hover:text-blue-400"
            style={{ color: RISA_BLUE }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </motion.button>
          <div className="flex items-center justify-center mb-4 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Pickaxe className="sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <span className="sm:text-2xl text-lg font-bold ml-3 text-blue-600 dark:text-blue-400">
              Elaris
            </span>
          </div>
          <h1 className="sm:text-3xl text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {mode === "signin" ? "Welcome Back" : "Get Started"}
          </h1>
          <p className="text-gray-600 mt-2 text-base dark:text-gray-300">
            {mode === "signin"
              ? "Sign in to your construction management account"
              : "Create your account and start building quotes"}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-center text-xl text-gray-900 dark:text-white">
              {mode === "signin" ? "Sign In" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-800">
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/30 dark:border-green-800">
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "signup" && (
                <div>
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-900 dark:text-white block mb-2"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                      className="w-full bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-3 text-sm rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                      style={{ borderColor: RISA_BLUE }}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-900 dark:text-white block mb-2"
                >
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-3 text-sm rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300"
                    style={{ borderColor: RISA_BLUE }}
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-900 dark:text-white block mb-2"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-3 text-sm rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 pr-12"
                    style={{ borderColor: RISA_BLUE }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-900 dark:text-white block mb-2"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-3 text-sm rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 pr-12"
                      style={{ borderColor: RISA_BLUE }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full text-sm font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-white"
                disabled={loading}
                style={{ 
                  backgroundColor: RISA_BLUE,
                  padding: '0.5rem 2rem',
                  borderRadius: '50px',
                  border: 'none'
                }}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />}
                {mode === "signin" ? "Sign In" : "Create Account"}
              </motion.button>
            </form>

            <div className="my-6 relative text-center">
              <span className="absolute left-0 top-1/2 w-full border-t border-gray-200 dark:border-gray-700"></span>
              <span className="relative bg-white px-4 py-1 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                OR
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={signInWithGoogle}
              className="w-full text-sm font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
              disabled={loading}
              style={{ 
                backgroundColor: RISA_WHITE,
                color: RISA_BLUE,
                padding: '0.5rem 2rem',
                borderRadius: '50px',
                border: `1px solid ${RISA_BLUE}`
              }}
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </motion.button>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm dark:text-gray-300">
                {mode === "signin"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setMode(mode === "signin" ? "signup" : "signin")
                  }
                  className="text-sm font-medium transition-colors"
                  style={{ 
                    color: RISA_BLUE,
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer"
                  }}
                  disabled={loading}
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </motion.button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Global Styles */}
      <style>{`
        .auth-input {
          border-radius: 50px;
          border: 1px solid ${RISA_MEDIUM_GRAY};
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
        }
        .auth-input:focus {
          border-color: ${RISA_BLUE};
          box-shadow: 0 0 0 2px rgba(1, 91, 151, 0.2);
          outline: none;
        }
        .auth-card {
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: none;
        }
        .risa-btn-primary {
          background-color: ${RISA_BLUE};
          color: ${RISA_WHITE};
          padding: 0.5rem 2rem;
          border-radius: 50px;
          border: none;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        .risa-btn-primary:hover {
          background-color: ${RISA_WHITE};
          color: ${RISA_BLUE};
          border: 1px solid ${RISA_BLUE};
        }
        .risa-btn-outline {
          background-color: ${RISA_WHITE};
          color: ${RISA_BLUE};
          padding: 0.5rem 2rem;
          border-radius: 50px;
          border: 1px solid ${RISA_BLUE};
          font-weight: bold;
          transition: all 0.3s ease;
        }
        .risa-btn-outline:hover {
          background-color: ${RISA_BLUE};
          color: ${RISA_WHITE};
          border: 1px solid ${RISA_BLUE};
        }
      `}</style>
    </div>
  );
};

export default Auth;