import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, Eye, EyeOff, TargetIcon, Mail, PhoneCall } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// RISA Color Palette (from Index.tsx)
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";

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

  const { user, signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        await signUp(formData.email, formData.password, formData.name);
        setSuccess("Account created successfully! Please check your email to verify.");
      }

      if (mode === "signin") {
        await signIn(formData.email, formData.password);
      }
    } catch (err: any) {
      let friendlyMessage = "Something went wrong. Please try again.";
      const msg = err.message.toLowerCase();

      if (msg.includes("passwords do not match")) {
        friendlyMessage = "Your passwords do not match.";
      } else if (msg.includes("at least 6 characters")) {
        friendlyMessage = "Password must be at least 6 characters long.";
      } else if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
        friendlyMessage = "Invalid email or password.";
      } else if (msg.includes("user not found")) {
        friendlyMessage = "No account found with that email.";
      } else if (msg.includes("email already in use")) {
        friendlyMessage = "This email is already registered. Try signing in.";
      } else if (msg.includes("network")) {
        friendlyMessage = "Network error. Please check your connection.";
      }

      toast({
        title: "Authentication Error",
        description: friendlyMessage,
        variant: "destructive",
      });
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

  if (user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.button
            onClick={() => navigate("/")}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center text-sm font-medium mb-6 transition-colors group"
            style={{ color: RISA_BLUE }}
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:translate-x-[-2px] transition-transform" />
            Back to Home
          </motion.button>

          <div className="flex items-center justify-center mb-4">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <TargetIcon className="sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="sm:text-2xl text-lg font-bold ml-3 text-blue-600 dark:text-blue-400"
            >
              Jtech AI
            </motion.span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="sm:text-3xl text-2xl font-bold mb-2 text-gray-900 dark:text-white"
          >
            {mode === "signin" ? "Welcome Back" : "Get Started"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 mt-2 text-base dark:text-gray-300"
          >
            {mode === "signin"
              ? "Sign in to your construction management account"
              : "Create your account and start building quotes with Jtech AI"}
          </motion.p>
        </div>

        {/* Auth Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-center text-xl font-semibold text-gray-900 dark:text-white">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-900/30 dark:border-green-800 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                      className="w-full bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-3 text-sm rounded-full border"
                      style={{ borderColor: RISA_BLUE }}
                    />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-3 text-sm rounded-full border"
                    style={{ borderColor: RISA_BLUE }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
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
                      className="w-full bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-3 text-sm rounded-full border pr-12"
                      style={{ borderColor: RISA_BLUE }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>

                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900 dark:text-white block mb-2">
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
                        className="w-full bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600 px-4 py-3 text-sm rounded-full border pr-12"
                        style={{ borderColor: RISA_BLUE }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full text-sm font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-white"
                  disabled={loading}
                  style={{
                    backgroundColor: RISA_BLUE,
                    padding: "0.5rem 2rem",
                    borderRadius: "50px",
                    border: "none",
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
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={signInWithGoogle}
                className="w-full text-sm font-semibold py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
                disabled={loading}
                style={{
                  backgroundColor: RISA_WHITE,
                  color: RISA_BLUE,
                  padding: "0.5rem 2rem",
                  borderRadius: "50px",
                  border: `1px solid ${RISA_BLUE}`,
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
                    whileHover={{ scale: 1.05, color: RISA_LIGHT_BLUE }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    className="text-sm font-medium"
                    style={{
                      color: RISA_BLUE,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
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
      </motion.div>
    </div>
  );
};

export default Auth;
