
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Calculator from '@/components/Calculator';
import { Badge } from '@/components/ui/badge';
import {
  Wrench,
  User,
  LogOut,
  Moon,
  Sun,
  Shield,
  Crown,
  Calculator as CalculatorIcon,
  Plus,
  BarChart,
  Settings,
  Eye,
  Menu,
  X,
  Star,
  ThumbsUp,
  Shell,
  Building,
  Building2,
  DoorOpen
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertDialog } from '@radix-ui/react-alert-dialog';
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
    setTimeout(async () => {
      await signOut();
      toast({
        title: "Signed out successfully"
      });
      navigate("/");
    });
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart },
    { path: '/quotes/new', label: 'New Quote', icon: Building2 },
    { path: '/quotes/all', label: 'All Quotes', icon: Eye },
    { path: '/variables', label: 'Variables', icon: Settings },
  ];

  if (location.pathname === '/' || location.pathname === '/auth') {
    return null;
  }
const getTierBadge = (tier: string) => {
      switch (tier) {
        case 'Free':
          return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200"><Shell className="w-3 h-3 mr-1" />Free</Badge>;
        case 'Intermediate':
          return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200"><Crown className="w-3 h-3 mr-1" />Intermediate</Badge>;
        case 'Professional':
          return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200"><Shield className="w-3 h-3 mr-1" />Professional</Badge>;
        default:
          return <Badge>{tier}</Badge>;
      }
    };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-sm border-b border-blue-900/20 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-1">
              <div className="p-2 mr-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl md:sm:text-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Constructly
              </span>
            </div>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:flex ml-auto items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`card-hover ${isActive(item.path) ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden xl:inline ml-2">{item.label}</span> {/* Hide text below xl */}
                    </Button>
                  );
                })}
                
                <Button
                  variant="ghost"
                  onClick={() => setIsCalculatorOpen(true)}
                  className="card-hover"  
                >
                  <CalculatorIcon className="w-4 h-4" />
                </Button>

                <Badge className="bg-transparent text-inherit border-transparent hover:bg-transparent hover:text-inherit hover:border-transparent focus:bg-transparent focus:text-inherit focus:border-transparent active:bg-transparent active:text-inherit active:border-transparent">
                  {getTierBadge(profile?.tier)}
                </Badge>

              </div>
            )}

            {/* Right side actions */}
            <div className="flex items-center ml-auto space-x-2">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="card-hover"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>

              {user ? (
                <>
                  {/* Mobile menu button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  >
                    {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  </Button>

                  {/* User menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="card-hover">
                        <User className="w-4 h-4 mr-2" />
                        {profile?.name || user.email}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-">
                      <DropdownMenuItem  className=' w-full bg-transparent text-black dark:text-white' onClick={() => navigate("/profile")}>
                          <User className="w-4 h-4 mr-2" />
                          Profile
                      </DropdownMenuItem>
                      {profile?.is_admin && (
                        <DropdownMenuItem className=' bg-transparent text-black dark:text-white' onClick={() => navigate("/admin")}>
                            <BarChart className="w-4 h-4 mr-2" />
                            Admin Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="focus:bg-red-50 focus:text-red-900" >
                        <LogOut className="w-4 h-4 mr-2 text-red-700"/>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              className="bg-transparent text-red-600 h-6 hover:text-red-700 hover:bg-transparent"
                            >
                              Sign Out
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Log Out</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to log out as "{profile?.name}"? You will have to log back in.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleSignOut()}
                                className="bg-red-600 hover:bg-red-200 hover:text-red-800 text-white"
                              >
                                Log Out
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button className='text-white' asChild onClick={() =>
                  navigate("/auth")}>Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {user && isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-slide-down">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`justify-start ${isActive(item.path) ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate(item.path);
                      }}
                    >
                     
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                      
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCalculatorOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <CalculatorIcon className="w-4 h-4 mr-2" />
                  Calculator
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <Calculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />
    </>
  );
};

export default Navbar;
