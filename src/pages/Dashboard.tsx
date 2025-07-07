
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotes } from '@/hooks/useQuotes';
import { ThemeToggle } from '@/components/ThemeToggle';
import Calculator from '@/components/Calculator';
import { 
  Plus, 
  FileText, 
  Settings, 
  Users, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Wrench,
  LogOut,
  User,
  Calculator as CalculatorIcon
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { quotes, loading: quotesLoading } = useQuotes();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpgradePlan = () => {
    navigate('/payment');
  };

  const handleViewQuote = (quoteId: string) => {
    navigate(`/quotes/${quoteId}`);
  };

  const handleViewAllQuotes = () => {
    navigate('/quotes/all');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center">
        <Card className="gradient-card rounded-2xl border-0 shadow-2xl">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Loading Dashboard...</h2>
            <p className="text-muted-foreground">Please wait while we load your dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierLimits = {
    Free: { quotes: 3 },
    Intermediate: { quotes: Infinity },
    Premium: { quotes: Infinity }
  };

  const recentQuotes = quotes.slice(0, 3);

  const stats = [
    {
      title: "Total Quotes",
      value: quotes.length.toString(),
      change: "+12%",
      icon: <FileText className="w-5 h-5" />,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "This Month Revenue",
      value: `KSh ${(profile.total_revenue / 100000).toFixed(1)}K`,
      change: "+8%",
      icon: <DollarSign className="w-5 h-5" />,
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Total Projects",
      value: profile.total_projects.toString(),
      change: `+${profile.completed_projects}`,
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Success Rate",
      value: profile.total_projects > 0 ? `${Math.round((profile.completed_projects / profile.total_projects) * 100)}%` : "0%",
      change: "+4%",
      icon: <CheckCircle className="w-5 h-5" />,
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">Pending</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full">Draft</Badge>;
      default:
        return <Badge className="rounded-full">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 smooth-transition">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-white/20 dark:border-slate-700/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg group-hover:scale-105 transition-transform">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-3">Constructly</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 rounded-full px-3 py-1">
                {profile.tier} Plan
              </Badge>
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsCalculatorOpen(true)}
                className="rounded-full hover:bg-primary/10"
              >
                <CalculatorIcon className="w-4 h-4 mr-2" />
                Calculator
              </Button>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              {profile.is_admin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="rounded-full hover:bg-primary/10">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">Welcome back, {profile.name}! Here's what's happening with your projects.</p>
        </div>

        {/* Usage Alert for Free Tier */}
        {profile.tier === 'Free' && (
          <Card className="mb-6 gradient-card rounded-2xl border-0 shadow-lg card-hover slide-up">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 text-lg">Quote Usage</h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                    You've used {profile.quotes_used} of {tierLimits.Free.quotes} quotes this month
                  </p>
                  <Progress value={(profile.quotes_used / tierLimits.Free.quotes) * 100} className="w-64 h-3 rounded-full" />
                </div>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={handleUpgradePlan}
                >
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="gradient-card rounded-2xl border-0 shadow-lg card-hover slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} text-white shadow-lg`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Quotes */}
          <Card className="lg:col-span-2 gradient-card rounded-2xl border-0 shadow-lg slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl">
                  <FileText className="w-5 h-5 mr-2" />
                  Recent Quotes
                </CardTitle>
                <Button variant="ghost" onClick={handleViewAllQuotes} className="rounded-full hover:bg-primary/10">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {quotesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading quotes...</p>
                </div>
              ) : recentQuotes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No quotes yet. Create your first quote!</p>
                  <Link to="/quotes/new">
                    <Button className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Quote
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentQuotes.map((quote, index) => (
                    <div key={quote.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 card-hover" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{quote.title}</h4>
                        <p className="text-sm text-muted-foreground">{quote.client_name}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">KSh {(quote.total_amount / 100).toLocaleString()}</span>
                          {getStatusBadge(quote.status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{new Date(quote.created_at).toLocaleDateString()}</p>
                        <Button variant="ghost" size="sm" className="mt-2 rounded-full hover:bg-primary/10" onClick={() => handleViewQuote(quote.id)}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="gradient-card rounded-2xl border-0 shadow-lg slide-up">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/quotes/new" className="block">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    New Quote
                  </Button>
                </Link>
                <Button variant="outline" className="w-full rounded-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300" onClick={() => alert('Feature coming soon!')}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Clients
                </Button>
                <Button variant="outline" className="w-full rounded-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300" onClick={() => alert('Feature coming soon!')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full rounded-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300" onClick={() => alert('Feature coming soon!')}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card className="gradient-card rounded-2xl border-0 shadow-lg slide-up">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Clock className="w-5 h-5 mr-2" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl card-hover">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Follow up with clients</p>
                      <p className="text-xs text-muted-foreground">Due today</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-xl card-hover">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Update material costs</p>
                      <p className="text-xs text-muted-foreground">Due tomorrow</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl card-hover">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Site visit scheduled</p>
                      <p className="text-xs text-muted-foreground">Next week</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Calculator Modal */}
      <Calculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
