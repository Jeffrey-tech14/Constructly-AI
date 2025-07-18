
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
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart },
    { path: '/quotes/new', label: 'New Quote', icon: Plus },
    { path: '/quotes/all', label: 'All Quotes', icon: Eye },
    { path: '/variables', label: 'Variables', icon: Settings },
  ];

  if (location.pathname === '/' || location.pathname === '/auth') {
    return null;
  }
const getTierBadge = (tier: string) => {
      switch (tier) {
        case 'Free':
          return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">Free</Badge>;
        case 'Basic':
          return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200"><Crown className="w-3 h-3 mr-1" />Basic</Badge>;
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
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-white/20 dark:border-slate-700/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a href="/dashboard" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Constructly
              </span>
            </a>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      asChild
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`card-hover ${isActive(item.path) ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
                    >
                      <a href={item.path}>
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </a>
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

                <Badge className="  bg-transparent text-inherit border-transparent hover:bg-transparent hover:text-inherit hover:border-transparent focus:bg-transparent focus:text-inherit focus:border-transparent active:bg-transparent active:text-inherit active:border-transparent">
                  {getTierBadge(profile?.tier)}
                </Badge>

              </div>
            )}

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
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
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <a href="/profile">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href="/variables">
                          <Settings className="w-4 h-4 mr-2" />
                          Variables
                        </a>
                      </DropdownMenuItem>
                      {profile?.is_admin && (
                        <DropdownMenuItem asChild>
                          <a href="/admin">
                            <BarChart className="w-4 h-4 mr-2" />
                            Admin Dashboard
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button asChild>
                  <a href="/auth">Sign In</a>
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
                      asChild
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className={`justify-start ${isActive(item.path) ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <a href={item.path}>
                        <Icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </a>
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
