
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Wrench } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';

const NotFound = () => {
  
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    if(!user){
    navigate('/auth')
  }
  return (
    <div className="min-h-screen animate-fade-in flex items-center justify-center p-4 smooth-transition">

      <div className="text-center">
        <Card className="gradient-card rounded-2xl border-0 shadow-2xl max-w-md mx-auto fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                <Wrench className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-900 via-blue-600 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-900 bg-clip-text text-transparent mb-4">
              404
            </h1>
            
            <h2 className="sm:text-2xl text-lg font-bold text-foreground mb-4">
              Page Not Found
            </h2>
            
            <p className="text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="rounded-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
