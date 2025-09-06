<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DraftingCompass, ArrowLeft, Loader2, Eye, EyeOff, MailCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
=======
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
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") || "signin");
  const [formData, setFormData] = useState({
<<<<<<< HEAD
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
=======
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
=======
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870

  const { user, signIn, signUp, signInWithGoogle, loading: authLoading } = useAuth();

<<<<<<< HEAD
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setEmailVerificationSent(false);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const { error } = await signUp(formData.email, formData.password, formData.name);
        
        if (error) throw error;

        setSuccess('Account created successfully! Please check your email to verify your account.');
        setEmailVerificationSent(true);
      }

      if (mode === 'signin') {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          // Check if error is due to unverified email
          if (error.message?.includes('Email not confirmed') || error.message?.includes('not verified')) {
            setError('Please verify your email address before signing in. Check your inbox for the verification email.');
            setEmailVerificationSent(true);
          } else {
            throw error;
          }
        } else {
          // Successful login will be handled by the AuthContext
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);

      let friendlyMessage = 'Something went wrong. Please try again.';
      
      // Supabase error handling
      if (err.message) {
        const msg = err.message.toLowerCase();
        
        if (msg.includes('passwords do not match')) {
          friendlyMessage = 'Your passwords do not match.';
        } else if (msg.includes('at least 6 characters')) {
          friendlyMessage = 'Password must be at least 6 characters long.';
        } else if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
          friendlyMessage = 'Invalid email or password. Please try again.';
        } else if (msg.includes('user not found')) {
          friendlyMessage = 'No account found with that email.';
        } else if (msg.includes('email already in use')) {
          friendlyMessage = 'This email is already registered. Try signing in.';
        } else if (msg.includes('network')) {
          friendlyMessage = 'Network error. Please check your internet connection.';
        } else if (msg.includes('email not confirmed') || msg.includes('not verified')) {
          friendlyMessage = 'Please verify your email address before signing in.';
          setEmailVerificationSent(true);
        }
      }

      toast({
        title: 'Authentication Error',
        description: friendlyMessage,
        variant: 'destructive',
      });

=======
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
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };
<<<<<<< HEAD

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) throw error;
      
      // Google sign-in will redirect automatically
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      // This would require adding a resendVerification method to your AuthContext
      // For now, we'll show a message to the user
      toast({
        title: 'Verification Email',
        description: 'Please check your inbox and spam folder for the verification email.',
      });
    } catch (err: any) {
      setError('Failed to resend verification email. Please try again.');
    }
  };
=======
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300"
      style={{ fontFamily: "Poppins, Helvetica Neue, Arial, sans-serif" }}
    >
      {/* Background with overlay similar to index page */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: darkMode 
            ? "linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('/page2.jpg')"
            : "linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9)), url('/page2.jpg')",
        }}
      />

      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md px-6 z-10"
      >
        {/* Header */}
<<<<<<< HEAD
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="inline-flex items-center text-risa-secondary hover:text-risa-primary mb-4 transition-colors lowercase"
=======
        <div className="text-center mb-8 fade-in">
          <Button
            onClick={() => navigate("/")}
            className="inline-flex items-center bg-transparent hover:bg-gradient-to-r from-blue-600 to-purple-600 hover:text-white dark:text-blue-300 dark:hover:text-white text-primary mb-4 transition-colors"
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            back to home
          </Button>
          <div className="flex items-center justify-center mb-4">
<<<<<<< HEAD
            <div className="p-2 rounded-xl bg-risa-primary/10">
              <DraftingCompass className="w-8 h-8 text-risa-primary" />
            </div>
            <span className="text-2xl font-bold text-risa-primary ml-3">Constructly</span>
          </div>
          <h1 className="text-3xl font-bold text-risa-primary">
            {mode === 'signin' ? 'welcome back' : 'get started'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 lowercase">
            {mode === 'signin'
              ? 'sign in to your construction management account'
              : 'create your account and start building quotes'}
=======
            <div className="p-2 rounded-xl bg-transparent shadow-lg">
              <Pickaxe className="sm:w-8 sm:h-8  text-primary dark:text-white" />
            </div>
            <span className="sm:text-2xl text-lg font-bold  text-primary dark:text-white ml-3">
              Elaris
            </span>
          </div>
          <h1 className="sm:text-3xl text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {mode === "signin" ? "Welcome Back" : "Get Started"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === "signin"
              ? "Sign in to your construction management account"
              : "Create your account and start building quotes"}
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
          </p>
        </div>

        {/* Auth Form */}
<<<<<<< HEAD
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl transition-all duration-300">
          <CardHeader className="pb-3 bg-risa-primary/10">
            <CardTitle className="text-center text-gray-800 dark:text-white lowercase">
              {mode === 'signin' ? 'sign in' : 'create account'}
=======
        <Card className="gradient-card rounded-2xl border-0 shadow-2xl slide-up">
          <CardHeader>
            <CardTitle className="text-center sm:text-xl">
              {mode === "signin" ? "Sign In" : "Create Account"}
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
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

<<<<<<< HEAD
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
              {mode === 'signup' && (
=======
            <form onSubmit={handleSubmit} className="sm:space-y-4 space-y-3">
              {mode === "signup" && (
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
                <div>
                  <Label htmlFor="name" className="text-gray-800 dark:text-white lowercase">full name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
<<<<<<< HEAD
                    className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
=======
                    className="rounded-xl   border-slate-300 dark:border-slate-600"
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-gray-800 dark:text-white lowercase">email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="you@example.com"
<<<<<<< HEAD
                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
=======
                  className="rounded-xl  border-slate-300 dark:border-slate-600"
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
                />
              </div>

              <div className="relative">
                <Label htmlFor="password" className="text-gray-800 dark:text-white lowercase">password</Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
<<<<<<< HEAD
                  className="mt-1 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
=======
                  className="rounded-xl   border-slate-300 dark:border-slate-600 pr-10" // padding for icon
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
<<<<<<< HEAD
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  tabIndex={-1}
=======
                  className="absolute right-3 top-[33px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  tabIndex={-1} // prevent accidental tab focus
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

<<<<<<< HEAD
              {mode === 'signup' && (
                <div className="relative">
                  <Label htmlFor="confirmPassword" className="text-gray-800 dark:text-white lowercase">confirm password</Label>
=======
              {mode === "signup" && (
                <div className="relative">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
<<<<<<< HEAD
                    className="mt-1 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
=======
                    className="rounded-xl   border-slate-300 dark:border-slate-600"
                  />
                  {/* Eye icon toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-[33px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    tabIndex={-1} // prevent accidental tab focus
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
                  </button>
                </div>
              )}

              <Button
                type="submit"
<<<<<<< HEAD
                className="w-full bg-risa-primary hover:bg-risa-primaryLight text-white py-3 lowercase"
                disabled={loading || authLoading}
              >
                {(loading || authLoading) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === 'signin' ? 'sign in' : 'create account'}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6 relative text-center">
              <span className="absolute left-0 top-1/2 w-full border-t border-gray-200 dark:border-gray-700"></span>
              <span className="relative bg-white dark:bg-gray-800 px-2 text-sm text-gray-600 dark:text-gray-300">or</span>
=======
                className="w-full sm:text-sm text-xs bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="my-4 relative text-center">
              <span className="absolute left-0 top-1/2 w-full border-t border-slate-300 dark:border-slate-600"></span>
              <span className="relative bg-white dark:bg-slate-900 px-2 text-sm text-slate-500 dark:text-slate-400">
                OR
              </span>
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
            </div>

            <Button
              type="button"
<<<<<<< HEAD
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-gray-800 border border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 py-3 lowercase"
              disabled={loading || authLoading}
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5" />
              continue with google
            </Button>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-300 text-sm lowercase">
                {mode === 'signin' ? "don't have an account? " : "already have an account? "}
                <button
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setError('');
                    setSuccess('');
                    setEmailVerificationSent(false);
                  }}
                  className="text-risa-primary hover:text-risa-primaryLight font-medium transition-colors"
                  disabled={loading || authLoading}
                >
                  {mode === 'signin' ? 'sign up' : 'sign in'}
=======
              onClick={signInWithGoogle}
              className="w-full bg-white sm:text-sm text-xs text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-600 rounded-xl shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
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
              <p className="text-muted-foreground sm:text-md text-sm">
                {mode === "signin"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={() =>
                    setMode(mode === "signin" ? "signup" : "signin")
                  }
                  className="sm:text-md text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  disabled={loading}
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
>>>>>>> beea2b1dfd8f7fa9fe8d0e8fcb00e8f70e364870
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Email Verification Help */}
        {emailVerificationSent && (
          <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Not seeing the verification email?</h3>
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