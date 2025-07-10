
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Calculator as CalculatorIcon, 
  Plus, 
  Eye, 
  BarChart, 
  Settings, 
  Calendar as CalendarIcon,
  TrendingUp,
  FileText,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  ArrowUp,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotes } from '@/hooks/useQuotes';
import Calculator from '@/components/Calculator';
import Reports from '@/components/Reports';
import CalendarComponent from '@/components/Calendar';
import DashboardSettings from '@/components/DashboardSettings';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { quotes } = useQuotes();
  const [activeTab, setActiveTab] = useState('overview');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  const stats = {
    totalQuotes: quotes.length,
    pendingQuotes: quotes.filter(q => q.status === 'pending').length,
    approvedQuotes: quotes.filter(q => q.status === 'approved').length,
    totalRevenue: quotes
      .filter(q => q.status === 'approved')
      .reduce((sum, q) => sum + q.total_amount, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {profile?.name || user.email}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Manage your construction projects and quotes with ease
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => setIsCalculatorOpen(true)}
                className="gradient-primary card-hover"
                size="lg"
              >
                <CalculatorIcon className="w-5 h-5 mr-2" />
                Quick Calculator
              </Button>
              <Button asChild className="card-hover" size="lg" variant="outline">
                <Link to="/quotes/new">
                  <Plus className="w-5 h-5 mr-2" />
                  New Quote
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="gradient-card card-hover animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
                  <p className="text-2xl font-bold">{stats.totalQuotes}</p>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +12% from last month
                  </div>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingQuotes}</p>
                  <div className="flex items-center text-xs text-yellow-600 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Awaiting review
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{stats.approvedQuotes}</p>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready to start
                  </div>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card card-hover animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">
                    KSh {(stats.totalRevenue / 100).toLocaleString()}
                  </p>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +18% growth
                  </div>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="gradient-card mb-8 animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="card-hover h-auto p-4 flex-col">
                <Link to="/quotes/new">
                  <Plus className="w-8 h-8 mb-2 text-blue-600" />
                  <span>New Quote</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="card-hover h-auto p-4 flex-col">
                <Link to="/quotes/all">
                  <Eye className="w-8 h-8 mb-2 text-green-600" />
                  <span>View All</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="card-hover h-auto p-4 flex-col">
                <Link to="/variables">
                  <Settings className="w-8 h-8 mb-2 text-purple-600" />
                  <span>Variables</span>
                </Link>
              </Button>
              <Button
                onClick={() => setIsCalculatorOpen(true)}
                variant="outline"
                className="card-hover h-auto p-4 flex-col"
              >
                <CalculatorIcon className="w-8 h-8 mb-2 text-orange-600" />
                <span>Calculator</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Quotes
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/quotes/all">View All</Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quotes.slice(0, 5).map((quote) => (
                      <div key={quote.id} className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg card-hover">
                        <div>
                          <p className="font-medium">{quote.title}</p>
                          <p className="text-sm text-muted-foreground">{quote.client_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">KSh {(quote.total_amount / 100).toLocaleString()}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                            quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {quote.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Quote Success Rate</span>
                      <span className="font-medium">
                        {stats.totalQuotes > 0 
                          ? Math.round((stats.approvedQuotes / stats.totalQuotes) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Quote Value</span>
                      <span className="font-medium">
                        KSh {stats.totalQuotes > 0 
                          ? Math.round(stats.totalRevenue / stats.totalQuotes / 100).toLocaleString()
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Projects</span>
                      <span className="font-medium">{profile?.total_projects || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Client Satisfaction</span>
                      <span className="font-medium">98%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarComponent />
          </TabsContent>

          <TabsContent value="settings">
            <DashboardSettings />
          </TabsContent>
        </Tabs>

        <Calculator 
          isOpen={isCalculatorOpen} 
          onClose={() => setIsCalculatorOpen(false)} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
