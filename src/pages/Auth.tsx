
import { useState } from 'react';
import { useSearchParams, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') || 'signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: ''
  });

  // Mock authentication - in real app this would connect to Supabase
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock successful authentication
    setIsAuthenticated(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Redirect to dashboard if authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-primary">Constructly</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'signin' ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'signin' 
              ? 'Sign in to your construction management account' 
              : 'Create your account and start building quotes'
            }
          </p>
        </div>

        {/* Auth Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="ABC Construction Ltd"
                    />
                  </div>
                </>
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
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                />
              </div>
              
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                  />
                </div>
              )}
              
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-primary hover:text-primary/80 font-medium"
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
