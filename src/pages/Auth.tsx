import { useState, useEffect } from "react";
import { useSearchParams, Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DraftingCompass, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => navigate("/")}
<<<<<<< HEAD
            variant="ghost"
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-risa-primary dark:hover:text-risa-primary mb-6 transition-colors"
=======
            className="inline-flex items-center bg-transparent hover:bg-gradient-to-r from-blue-600 to-blue-600 hover:text-white dark:text-blue-300 dark:hover:text-white text-primary mb-4 transition-colors"
>>>>>>> 9cf0aa89a3d5e2884d54a4b0e36a2af07f3ddb2d
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center justify-center mb-4">
            <motion.div 
              className="p-2 rounded-xl bg-risa-primary/10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <DraftingCompass className="w-8 h-8 text-risa-primary" />
            </motion.div>
            <span className="text-2xl font-bold text-risa-primary dark:text-white ml-3">
              Constructly
            </span>
          </div>
          <motion.h1 
            className="text-3xl font-bold text-gray-900 dark:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {mode === "signin" ? "Welcome Back" : "Get Started"}
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {mode === "signin"
              ? "Sign in to your construction management account"
              : "Create your account and start building quotes"}
          </p>
        </motion.div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-center text-gray-900 dark:text-white">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                      className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@example.com"
                    className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="relative">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                    <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="••••••••"
                      className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                  className="w-full bg-risa-primary hover:bg-risa-primaryLight text-white rounded-lg py-2 transition-colors"
                  disabled={loading}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </Button>
              </form>

              <div className="my-4 relative text-center">
                <span className="absolute left-0 top-1/2 w-full border-t border-gray-300 dark:border-gray-600"></span>
                <span className="relative bg-white dark:bg-gray-800 px-2 text-sm text-gray-500 dark:text-gray-400">
                  OR
                </span>
              </div>

              <Button
                type="button"
                onClick={signInWithGoogle}
                className="w-full bg-white text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
                disabled={loading}
              >
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </Button>

              <div className="mt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {mode === "signin"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={() =>
                      setMode(mode === "signin" ? "signup" : "signin")
                    }
                    className="text-risa-primary hover:text-risa-primaryLight font-medium transition-colors"
                    disabled={loading}
                  >
                    {mode === "signin" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;