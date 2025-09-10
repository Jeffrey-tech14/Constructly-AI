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

// RISA Color Palette
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

  // Global styles for RISA design
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
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
      .risa-input {
        border-radius: 8px;
        border: 1px solid ${RISA_MEDIUM_GRAY};
        padding: 0.75rem;
        transition: all 0.3s ease;
      }
      .risa-input:focus {
        border-color: ${RISA_BLUE};
        box-shadow: 0 0 0 2px rgba(1, 91, 151, 0.2);
        outline: none;
      }
      .risa-card {
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: RISA_LIGHT_GRAY }}>
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors mb-4"
            style={{ color: RISA_BLUE }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          <div className="flex items-center justify-center mb-4">
            <div className="p-2 rounded-xl bg-transparent shadow-md group-hover:scale-105 transition-transform">
              <Pickaxe className="sm:w-8 sm:h-8 text-blue-600" style={{ color: RISA_BLUE }} />
            </div>
            <span className="sm:text-2xl text-lg font-bold ml-3" style={{ color: RISA_BLUE }}>
              Elaris
            </span>
          </div>
          <h1 className="sm:text-3xl text-2xl font-bold mb-2" style={{ color: RISA_DARK_TEXT }}>
            {mode === "signin" ? "Welcome Back" : "Get Started"}
          </h1>
          <p className="text-gray-600 mt-2 text-base">
            {mode === "signin"
              ? "Sign in to your construction management account"
              : "Create your account and start building quotes"}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="risa-card" style={{ 
          borderRadius: '12px', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: 'none'
        }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-xl" style={{ color: RISA_DARK_TEXT }}>
              {mode === "signin" ? "Sign In" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name" className="text-sm font-medium" style={{ color: RISA_DARK_TEXT }}>Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="risa-input w-full mt-1"
                    style={{ 
                      borderRadius: '8px',
                      border: `1px solid ${RISA_MEDIUM_GRAY}`,
                      padding: '0.75rem'
                    }}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-medium" style={{ color: RISA_DARK_TEXT }}>Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="you@example.com"
                  className="risa-input w-full mt-1"
                  style={{ 
                    borderRadius: '8px',
                    border: `1px solid ${RISA_MEDIUM_GRAY}`,
                    padding: '0.75rem'
                  }}
                />
              </div>

              <div className="relative">
                <Label htmlFor="password" className="text-sm font-medium" style={{ color: RISA_DARK_TEXT }}>Password</Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="risa-input w-full mt-1 pr-10"
                  style={{ 
                    borderRadius: '8px',
                    border: `1px solid ${RISA_MEDIUM_GRAY}`,
                    padding: '0.75rem'
                  }}
                />

                {/* Eye icon toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {mode === "signup" && (
                <div className="relative">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: RISA_DARK_TEXT }}>Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="risa-input w-full mt-1"
                    style={{ 
                      borderRadius: '8px',
                      border: `1px solid ${RISA_MEDIUM_GRAY}`,
                      padding: '0.75rem'
                    }}
                  />
                  {/* Eye icon toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full text-sm"
                disabled={loading}
                style={{ 
                  backgroundColor: RISA_BLUE,
                  color: RISA_WHITE,
                  padding: '0.5rem 2rem',
                  borderRadius: '50px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="my-6 relative text-center">
              <span className="absolute left-0 top-1/2 w-full border-t" style={{ borderColor: RISA_MEDIUM_GRAY }}></span>
              <span className="relative bg-white px-4 py-1 text-sm text-gray-500" style={{ backgroundColor: RISA_WHITE }}>
                OR
              </span>
            </div>

            <Button
              type="button"
              onClick={signInWithGoogle}
              className="w-full text-sm flex items-center justify-center gap-3"
              disabled={loading}
              style={{ 
                backgroundColor: RISA_WHITE,
                color: RISA_DARK_TEXT,
                padding: '0.5rem 2rem',
                borderRadius: '50px',
                border: `1px solid ${RISA_BLUE}`,
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </Button>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {mode === "signin"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() =>
                    setMode(mode === "signin" ? "signup" : "signin")
                  }
                  className="text-sm font-medium transition-colors"
                  style={{ 
                    color: RISA_BLUE,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom CSS for RISA styling */}
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        .slide-up {
          animation: slideUp 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        .gradient-card {
          background: linear-gradient(145deg, #ffffff, #f8f9fa);
        }
        .smooth-transition {
          transition: all 0.3s ease;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Auth;