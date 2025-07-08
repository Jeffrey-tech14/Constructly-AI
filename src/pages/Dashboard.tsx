
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotes } from '@/hooks/useQuotes';
import { DashboardSettings } from '@/components/DashboardSettings';
import Calendar from '@/components/Calendar';
import Reports from '@/components/Reports';
import { 
  Plus, 
  FileText, 
  Settings, 
  BarChart3, 
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Crown,
  Wrench
} from 'lucide-react';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { quotes, loading } = useQuotes();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate dashboard statistics
  const totalQuotes = quotes.length;
  const totalRevenue = quotes.reduce((sum, quote) => sum + quote.total_amount, 0);
  const completedProjects = quotes.filter(q => q.status === 'completed').length;
  const activeProjects = quotes.filter(q => ['started', 'in_progress'].includes(q.status)).length;
  const pendingQuotes = quotes.filter(q => q.status === 'draft').length;

  const recentQuotes = quotes.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm border-b border-white/20 dark:border-slate-700/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Wrench className="w-8 h-8 text-primary mr-2" />
              <span className="text-2xl font-bold text-primary">Constructly</span>
            </div>
            <div className="flex items-center space-x-4">
              {profile?.is_admin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <Crown className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Badge variant="secondary" className="capitalize">
                {profile?.tier || 'Free'}
              </Badge>
              <span className="text-sm font-medium">{profile?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your construction projects, track progress, and grow your business
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/quote-builder">
            <Card className="gradient-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create New Quote</h3>
                    <p className="text-sm text-muted-foreground">Start a new construction project quote</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/quotes/all">
            <Card className="gradient-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">View All Quotes</h3>
                    <p className="text-sm text-muted-foreground">Manage existing quotes and projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card 
            className="gradient-card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setActiveTab('reports')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold">Business Reports</h3>
                  <p className="text-sm text-muted-foreground">Analyze performance and growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            {profile?.is_admin && <TabsTrigger value="admin">Admin</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    KSh {(totalRevenue / 100).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">From {totalQuotes} quotes</p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeProjects}</div>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedProjects}</div>
                  <p className="text-xs text-muted-foreground">Successfully finished</p>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingQuotes}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle>Recent Quotes</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentQuotes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-sm font-medium mb-2">No quotes yet</h3>
                      <p className="text-xs text-muted-foreground mb-4">Create your first quote to get started</p>
                      <Link to="/quote-builder">
                        <Button size="sm">Create Quote</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentQuotes.map((quote) => (
                        <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium text-sm">{quote.title}</h4>
                              <p className="text-xs text-muted-foreground">{quote.client_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="text-xs" variant={
                              quote.status === 'completed' ? 'default' :
                              quote.status === 'in_progress' ? 'secondary' : 'outline'
                            }>
                              {quote.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              KSh {(quote.total_amount / 100).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Link to="/quotes/all">
                        <Button variant="outline" className="w-full">
                          View All Quotes
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Quote Value</span>
                      <span className="font-medium">
                        KSh {totalQuotes > 0 ? ((totalRevenue / totalQuotes) / 100).toLocaleString() : '0'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <span className="font-medium">
                        {totalQuotes > 0 ? ((completedProjects / totalQuotes) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Quotes Used</span>
                      <span className="font-medium">{profile?.quotes_used || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Account Tier</span>
                      <Badge variant="secondary" className="capitalize">
                        {profile?.tier || 'Free'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <Calendar />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>

          <TabsContent value="settings">
            <DashboardSettings />
          </TabsContent>

          {profile?.is_admin && (
            <TabsContent value="admin">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="w-5 h-5 mr-2" />
                    Admin Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Access the full admin dashboard to manage users, system settings, and analytics.
                  </p>
                  <Link to="/admin">
                    <Button>
                      <Crown className="w-4 h-4 mr-2" />
                      Open Admin Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
