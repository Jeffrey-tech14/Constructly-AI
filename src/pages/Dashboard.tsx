import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const [userTier] = useState('Free');
  const [quotesUsed] = useState(2);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isAdmin] = useState(false); // This would come from user authentication
  const quotesLimit = userTier === 'Free' ? 3 : userTier === 'Intermediate' ? Infinity : Infinity;

  const handleSignOut = () => {
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/auth');
  };

  const handleUpgradePlan = () => {
    toast({
      title: "Upgrade Plan",
      description: "Redirecting to upgrade options...",
    });
    // In a real app, this would redirect to a payment page
  };

  const handleManageClients = () => {
    toast({
      title: "Manage Clients",
      description: "Client management feature coming soon!",
    });
  };

  const handleScheduleMeeting = () => {
    toast({
      title: "Schedule Meeting",
      description: "Meeting scheduler coming soon!",
    });
  };

  const handleViewReports = () => {
    toast({
      title: "View Reports",
      description: "Reports feature coming soon!",
    });
  };

  const handleViewQuote = (quoteId: number) => {
    toast({
      title: "View Quote",
      description: `Opening quote #${quoteId}...`,
    });
  };

  const handleViewAllQuotes = () => {
    navigate('/quotes/all');
  };

  const recentQuotes = [
    {
      id: 1,
      title: "Residential House - Nairobi",
      amount: "KSh 2,850,000",
      status: "approved",
      date: "2024-01-05",
      client: "John Kamau"
    },
    {
      id: 2,
      title: "Office Building Extension",
      amount: "KSh 4,200,000",
      status: "pending",
      date: "2024-01-03",
      client: "Safaricom Ltd"
    },
    {
      id: 3,
      title: "School Renovation - Kisumu",
      amount: "KSh 1,650,000",
      status: "draft",
      date: "2024-01-02",
      client: "Kisumu County"
    }
  ];

  const stats = [
    {
      title: "Total Quotes",
      value: "24",
      change: "+12%",
      icon: <FileText className="w-5 h-5" />
    },
    {
      title: "This Month Revenue",
      value: "KSh 12.5M",
      change: "+8%",
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      title: "Active Projects",
      value: "8",
      change: "+3",
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      title: "Success Rate",
      value: "76%",
      change: "+4%",
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
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
                {userTier} Plan
              </Badge>
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
              {isAdmin && (
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Usage Alert for Free Tier */}
        {userTier === 'Free' && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800">Quote Usage</h3>
                  <p className="text-yellow-700 text-sm">
                    You've used {quotesUsed} of {quotesLimit} quotes this month
                  </p>
                  <Progress value={(quotesUsed / quotesLimit) * 100} className="w-64 mt-2" />
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
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
              <div className="space-y-4">
                {recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{quote.title}</h4>
                      <p className="text-sm text-gray-600">{quote.client}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-lg font-bold text-primary">{quote.amount}</span>
                        {getStatusBadge(quote.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{quote.date}</p>
                      <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleViewQuote(quote.id)}>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
                <Button variant="outline" className="w-full" onClick={handleManageClients}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Clients
                </Button>
                <Button variant="outline" className="w-full" onClick={handleScheduleMeeting}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full" onClick={handleViewReports}>
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
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Follow up with Safaricom</p>
                      <p className="text-xs text-gray-500">Due today</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Update material costs</p>
                      <p className="text-xs text-gray-500">Due tomorrow</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Site visit - Kisumu</p>
                      <p className="text-xs text-gray-500">Jan 8, 2024</p>
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
