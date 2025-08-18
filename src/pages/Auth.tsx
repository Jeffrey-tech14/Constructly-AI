
import { useState, useEffect } from 'react';
import { useSearchParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wrench, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') || 'signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user, profile, signIn, signUp, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!sessionStorage.getItem('profile_reloaded')) {
      sessionStorage.setItem('profile_reloaded', 'true');
      window.location.reload();
    }
  }, []);

    const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true);

  try {
    // Sign up validation
    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      await signUp(formData.email, formData.password, formData.name);
      setSuccess(
        'Account created successfully! Please check your email to verify your account.'
      );
    }

    // Sign in flow
    if (mode === 'signin') {
      await signIn(formData.email, formData.password);
    }

  } catch (err: any) {
    console.error('Auth error:', err);

    // Default fallback
    let friendlyMessage = 'Something went wrong. Please try again.';
    const msg = (err.message).toLowerCase();

    // Match against common cases
    if (msg.includes('passwords do not match')) {
      friendlyMessage = 'Your passwords do not match.';
      throw new Error(friendlyMessage);
    } else if (msg.includes('at least 6 characters')) {
      friendlyMessage = 'Password must be at least 6 characters long.';
      throw new Error(friendlyMessage);
    } else if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
      friendlyMessage = 'Invalid email or password. Please try again.';
      throw new Error(friendlyMessage);
    } else if (msg.includes('user not found')) {
      friendlyMessage = 'No account found with that email.';
      throw new Error(friendlyMessage);
    } else if (msg.includes('email already in use')) {
      friendlyMessage = 'This email is already registered. Try signing in.';
      throw new Error(friendlyMessage);
    } else if (msg.includes('network')) {
      friendlyMessage = 'Network error. Please check your internet connection.';
      throw new Error(friendlyMessage);
    }

    // Show toast notification
    toast({
      title: 'Authentication Error',
      description: friendlyMessage,
      variant: 'destructive'
    });

    // Show inline error below the header
    setError(friendlyMessage);

  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Redirect to dashboard if authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen animate-fade-in flex items-center justify-center p-4 smooth-transition">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <Button onClick={() => navigate("/")} className="inline-flex items-center bg-transparent hover:bg-gradient-to-r from-blue-600 to-purple-600 hover:text-white text-primary mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
            <div className="flex items-center justify-center mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <Wrench className="w-8 h-8 text-white" />
              </div>
            <span className="sm:text-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">Constructly</span>
          </div>
          <h1 className="sm:text-3xl sm:text-2xl text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            {mode === 'signin' ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === 'signin' 
              ? 'Sign in to your construction management account' 
              : 'Create your account and start building quotes'
            }
          </p>
        </div>

        {/* Auth Form */}
        <Card className="gradient-card rounded-2xl border-0 shadow-2xl slide-up">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="rounded-xl border-slate-300 dark:border-slate-600"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="you@example.com"
                  className="rounded-xl border-slate-300 dark:border-slate-600"
                />
              </div>
              
              <div className="relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="rounded-xl border-slate-300 dark:border-slate-600 pr-10" // padding for icon
                />

                {/* Eye icon toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[33px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  tabIndex={-1} // prevent accidental tab focus
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>  

              {mode === 'signup' && (
                <div className='relative'>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="rounded-xl border-slate-300 dark:border-slate-600"
                  />
                  {/* Eye icon toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[33px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  tabIndex={-1} // prevent accidental tab focus
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            
              <div className="my-4 relative text-center">
                <span className="absolute left-0 top-1/2 w-full border-t border-slate-300 dark:border-slate-600"></span>
                <span className="relative bg-white dark:bg-slate-900 px-2 text-sm text-slate-500 dark:text-slate-400">
                  OR
                </span>
              </div>

              <Button
                type="button"
                onClick={signInWithGoogle}
                className="w-full bg-white text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-600 rounded-xl shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                disabled={loading}
              >
                <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="w-5 h-5" />
                Continue with Google
              </Button>


            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                  disabled={loading}
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
