
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  FileText, 
  Eye, 
  BarChart, 
  Settings, 
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Star,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotes } from '@/hooks/useQuotes';
import { useClientReviews } from '@/hooks/useClientReviews';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import Calculator from '@/components/Calculator';
import Reports from '@/components/Reports';
import CalendarComponent from '@/components/Calendar';
import DashboardSettings from '@/components/DashboardSettings';
import { format } from 'date-fns';

const Dashboard = () => {
  const { profile } = useAuth();
  const { quotes, loading: quotesLoading } = useQuotes();
  const { reviews, averageRating, totalReviews } = useClientReviews();
  const { events } = useCalendarEvents();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCalculator, setShowCalculator] = useState(false);
  useEffect(() => {
    if (!sessionStorage.getItem('profile_reloaded')) {
      sessionStorage.setItem('profile_reloaded', 'true');
      window.location.reload();
    }
  }, []);

const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return value.toString();
  };

  // Calculate dashboard metrics
  const totalQuotesValue = quotes.reduce((sum, quote) => sum + quote.total_amount, 0);
  const completedProjects = quotes.filter(quote => quote.status === 'completed').length;
  const activeProjects = quotes.filter(quote => ['started', 'in_progress'].includes(quote.status)).length;
  const pendingQuotes = quotes.filter(quote => quote.status === 'pending').length;

  const upcomingEvents = events
    .filter(event => new Date(event.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
    .slice(0, 3);

  const recentQuotes = quotes
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      started: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (quotesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {profile?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Here's what's happening with your construction business today.
              </p>
            </div>
            <Button 
              onClick={() => setShowCalculator(true)}
              className="animate-bounce-gentle text-white"
            >
              Quick Calculator
            </Button>
          </div>
        </div>

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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="gradient-card card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quotes Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSh {(formatCurrency(totalQuotesValue)).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{quotes.length} quotes generated
                  </p>
                </CardContent>
              </Card>

              <Card className="gradient-card card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingQuotes} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card className="gradient-card card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    Projects finished
                  </p>
                </CardContent>
              </Card>

              <Card className="gradient-card card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Client Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                    {averageRating > 0 && <Star className="w-5 h-5 ml-1 text-yellow-400 fill-current" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Quotes */}
              <Card className="gradient-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Recent Quotes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentQuotes.length > 0 ? (
                      recentQuotes.map((quote) => (
                        <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{quote.title}</h3>
                              <Badge className={getStatusColor(quote.status)}>
                                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {quote.client_name} • {quote.location}
                            </p>
                            <p className="text-sm font-medium mt-1">
                              KSh {(formatCurrency(quote.total_amount)).toLocaleString()}
                            </p>
                          </div>
                          <a href='/quotes/all'>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium text-lg mb-2">No quotes yet</h3>
                        <p className="text-muted-foreground">Create your first quote to get started!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events & Reviews */}
              <div className="space-y-6">
                <Card className="gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents.length > 0 ? (
                      <div className="space-y-3">
                        {upcomingEvents.map((event) => (
                          <div key={event.id} className="p-3 border rounded">
                            <div className="font-medium text-sm">{event.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(event.event_date), 'MMM d, yyyy')}
                              {event.event_time && ` at ${event.event_time}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No upcoming events</p>
                    )}
                  </CardContent>
                </Card>

                {reviews.length > 0 && (
                  <Card className="gradient-card">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Recent Reviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {reviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="p-3 border rounded">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium text-sm">{review.client_name}</div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.review_text && (
                              <p className="text-xs text-muted-foreground">{review.review_text}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
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

        {/* Calculator Modal */}
        <Calculator 
          isOpen={showCalculator} 
          onClose={() => setShowCalculator(false)} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
