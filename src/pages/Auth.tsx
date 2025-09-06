import { useState, useEffect } from "react";
import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DraftingCompass,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  MailCheck,
} from "lucide-react";
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
  const [darkMode, setDarkMode] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const { user, signIn, signUp, signInWithGoogle, loading: authLoading } =
    useAuth();

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setEmailVerificationSent(false);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.name
        );
        if (error) throw error;

        setSuccess(
          "Account created successfully! Please check your email to verify your account."
        );
        setEmailVerificationSent(true);
      }

      if (mode === "signin") {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (
            error.message?.includes("Email not confirmed") ||
            error.message?.includes("not verified")
          ) {
            setError(
              "Please verify your email address before signing in. Check your inbox for the verification email."
            );
            setEmailVerificationSent(true);
          } else {
            throw error;
          }
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);

      let friendlyMessage = "Something went wrong. Please try again.";
      if (err.message) {
        const msg = err.message.toLowerCase();

        if (msg.includes("passwords do not match")) {
          friendlyMessage = "Your passwords do not match.";
        } else if (msg.includes("at least 6 characters")) {
          friendlyMessage = "Password must be at least 6 characters long.";
        } else if (
          msg.includes("invalid login") ||
          msg.includes("invalid credentials")
        ) {
          friendlyMessage = "Invalid email or password. Please try again.";
        } else if (msg.includes("user not found")) {
          friendlyMessage = "No account found with that email.";
        } else if (msg.includes("email already in use")) {
          friendlyMessage = "This email is already registered. Try signing in.";
        } else if (msg.includes("network")) {
          friendlyMessage = "Network error. Please check your internet connection.";
        } else if (
          msg.includes("email not confirmed") ||
          msg.includes("not verified")
        ) {
          friendlyMessage = "Please verify your email address before signing in.";
          setEmailVerificationSent(true);
        }
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      console.error("Google auth error:", err);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      toast({
        title: "Verification Email",
        description:
          "Please check your inbox and spam folder for the verification email.",
      });
    } catch (err: any) {
      setError("Failed to resend verification email. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300"
      style={{ fontFamily: "Poppins, Helvetica Neue, Arial, sans-serif" }}
    >
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: darkMode
            ? "linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('/page2.jpg')"
            : "linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9)), url('/page2.jpg')",
        }}
      />

      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md px-6 z-10"
      >
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="inline-flex items-center text-risa-secondary hover:text-risa-primary mb-4 transition-colors lowercase"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            back to home
          </Button>
          <div className="flex items-center justify-center mb-4">
            <div className="p-2 rounded-xl bg-risa-primary/10">
              <DraftingCompass className="w-8 h-8 text-risa-primary" />
            </div>
            <span className="text-2xl font-bold text-risa-primary ml-3">
              Constructly
            </span>
          </div>
          <h1 className="text-3xl font-bold text-risa-primary">
            {mode === "signin" ? "welcome back" : "get started"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 lowercase">
            {mode === "signin"
              ? "sign in to your construction management account"
              : "create your account and start building quotes"}
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl transition-all duration-300">
          <CardHeader className="pb-3 bg-risa-primary/10">
            <CardTitle className="text-center text-gray-800 dark:text-white lowercase">
              {mode === "signin" ? "sign in" : "create account"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
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

            {emailVerificationSent && (
              <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <MailCheck className="w-4 h-4 mr-2" />
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  <p>Verification email sent! Please check your inbox.</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-700 dark:text-blue-400 font-normal"
                    onClick={resendVerificationEmail}
                  >
                    Click here if you didn't receive the email
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <Label
                    htmlFor="name"
                    className="text-gray-800 dark:text-white lowercase"
                  >
                    full name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <Label
                  htmlFor="email"
                  className="text-gray-800 dark:text-white lowercase"
                >
                  email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="you@example.com"
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>

              <div className="relative">
                <Label
                  htmlFor="password"
                  className="text-gray-800 dark:text-white lowercase"
                >
                  password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="mt-1 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-800 dark:text-white lowercase"
                  >
                    confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="mt-1 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
                className="w-full bg-risa-primary hover:bg-risa-primaryLight text-white py-3 lowercase"
                disabled={loading || authLoading}
              >
                {(loading || authLoading) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {mode === "signin" ? "sign in" : "create account"}
              </Button>
            </form>

            <div className="my-6 relative text-center">
              <span className="absolute left-0 top-1/2 w-full border-t border-gray-200 dark:border-gray-700"></span>
              <span className="relative bg-white dark:bg-gray-800 px-2 text-sm text-gray-600 dark:text-gray-300">
                or
              </span>
            </div>

            <Button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 py-3 lowercase"
              disabled={loading || authLoading}
            >
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              continue with google
            </Button>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-300 text-sm lowercase">
                {mode === "signin"
                  ? "don't have an account? "
                  : "already have an account? "}
                <button
                  onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setError("");
                    setSuccess("");
                    setEmailVerificationSent(false);
                  }}
                  className="text-risa-primary hover:text-risa-primaryLight font-medium transition-colors"
                  disabled={loading || authLoading}
                >
                  {mode === "signin" ? "sign up" : "sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {emailVerificationSent && (
          <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Not seeing the verification email?
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure you entered the correct email address</li>
                <li>• Wait a few minutes - it might take a while to arrive</li>
                <li>• Try signing up again if you don't receive it within 15 minutes</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
