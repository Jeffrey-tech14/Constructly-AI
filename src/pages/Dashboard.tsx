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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we load your dashboard.</p>
        </div>
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
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: "This Month Revenue",
      value: `KSh ${(profile.total_revenue / 100000).toFixed(1)}K`,
      change: "+8%",
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      title: "Total Projects",
      value: profile.total_projects.toString(),
      change: `+${profile.completed_projects}`,
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      title: "Success Rate",
      value: profile.total_projects > 0 ? `${Math.round((profile.completed_projects / profile.total_projects) * 100)}%` : "0%",
      change: "+4%",
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Wrench className="w-8 h-8 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">Constructly</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-primary border-primary">
                {profile.tier} Plan
              </Badge>
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsCalculatorOpen(true)}
              >
                <CalculatorIcon className="w-4 h-4 mr-2" />
                Calculator
              </Button>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              {profile.is_admin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {profile.name}! Here's what's happening with your projects.</p>
        </div>

        {/* Usage Alert for Free Tier */}
        {profile.tier === 'Free' && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Quote Usage</h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    You've used {profile.quotes_used} of {tierLimits.Free.quotes} quotes this month
                  </p>
                  <Progress value={(profile.quotes_used / tierLimits.Free.quotes) * 100} className="w-64 mt-2" />
                </div>
                <Button className="bg-primary hover:bg-primary/90" onClick={handleUpgradePlan}>
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change}</p>
                  </div>
                  <div className="text-primary">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Quotes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Recent Quotes
                </CardTitle>
                <Button variant="ghost" onClick={handleViewAllQuotes}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {quotesLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading quotes...</p>
                </div>
              ) : recentQuotes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No quotes yet. Create your first quote!</p>
                  <Link to="/quotes/new">
                    <Button className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Quote
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentQuotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{quote.title}</h4>
                        <p className="text-sm text-muted-foreground">{quote.client_name}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="text-lg font-bold text-primary">KSh {(quote.total_amount / 100).toLocaleString()}</span>
                          {getStatusBadge(quote.status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{new Date(quote.created_at).toLocaleDateString()}</p>
                        <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleViewQuote(quote.id)}>
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
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/quotes/new" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    New Quote
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Clients
                </Button>
                <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full" onClick={() => alert('Feature coming soon!')}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Follow up with clients</p>
                      <p className="text-xs text-muted-foreground">Due today</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Update material costs</p>
                      <p className="text-xs text-muted-foreground">Due tomorrow</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
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
