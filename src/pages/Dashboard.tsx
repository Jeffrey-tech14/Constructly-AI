
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  Workflow,
  PersonStanding,
  PersonStandingIcon,
  LayoutDashboard,
} from 'lucide-react';
import { refreshApp, useAuth } from '@/contexts/AuthContext';
import { useQuotes } from '@/hooks/useQuotes';
import { useClientReviews } from '@/hooks/useClientReviews';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import Calculator from '@/components/Calculator';
import Reports from '@/components/Reports';
import CalendarComponent from '@/components/Calendar';
import DashboardSettings from '@/components/DashboardSettings';
import { format } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const { quotes, loading: quotesLoading } = useQuotes();
  const { reviews, averageRating, totalReviews } = useClientReviews();
  const { events } = useCalendarEvents();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCalculator, setShowCalculator] = useState(false);
    const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
  totalQuotesValue: 0,
  completedProjects: 0,
  activeProjects: 0,
  pendingQuotes: 0,
  upcomingEvents: [],
  recentQuotes: []
});

const hasLoadedOnce = useRef(false); 

useEffect(() => {
  const fetchAndSet = async () => {
    if (!hasLoadedOnce.current) {
      quotesLoading == true; 
    }
    await fetchDashboardData();
    if (!hasLoadedOnce.current) {
      quotesLoading == false; 
      hasLoadedOnce.current = true; 
    }
  };

  fetchAndSet();
}, [user,location.key]);

const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return value.toString();
  };

  const fetchDashboardData = async () => {
  try {
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', profile.id);

    if (quotesError) throw quotesError;

    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', profile.id); 

    if (eventsError) throw eventsError;

    const totalQuotesValue = quotes.reduce(
      (sum, quote) => sum + quote.total_amount, 
      0
    );

    const completedProjects = quotes.filter(
      quote => quote.status === 'completed'
    ).length;

    const activeProjects = quotes.filter(
      quote => ['started', 'in_progress'].includes(quote.status)
    ).length;

    const pendingQuotes = quotes.filter(
      quote => quote.status === 'draft'
    ).length;

    const upcomingEvents = events
      .filter(event => new Date(event.event_date) >= new Date())
      .sort(
        (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      )
      .slice(0, 3);

    const recentQuotes = quotes
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);

    setDashboardData({
      totalQuotesValue,
      completedProjects,
      activeProjects,
      pendingQuotes,
      upcomingEvents,
      recentQuotes
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    toast({
      title: "Error",
      description: "Failed to load dashboard data",
      variant: "destructive"
    });
  }
};

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 hover:bg-gray-300',
      planning: 'bg-purple-100 text-purple-800 hover:bg-purple-300',
      started: 'bg-blue-100 text-blue-800 hover:bg-blue-300',
      in_progress: 'bg-amber-100 text-amber-800 hover:bg-amber-300',
      completed: 'bg-green-100 text-green-800 hover:bg-green-300',
      on_hold: 'bg-red-100 text-red-800 hover:bg-red-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 hover:bg-gray-100 text-gray-800';
  };

  if(!user){
    navigate('/auth')
  }

  if (quotesLoading) {
    return (
      <div className="min-h-screen grid flex grid-rows-2 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen inset-0 scrollbar-hide">
      <div className="max-w-7xl scrollbar-hide mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-3xl flex font-bold bg-gradient-to-r from-purple-900 via-blue-600 to-purple-900 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                <LayoutDashboard className="w-8 h-8 mr-2 text-purple-900 dark:text-white" />
                Welcome back, {profile?.name}!
              </div>
              <p className=" bg-gradient-to-r from-purple-900 via-blue-600 to-purple-900 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mt-2">
                Here's what's happening with your construction business today.
              </p>
            </div>
            <Button 
              onClick={() => setShowCalculator(true)}
              className="animate-bounce-gentle bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              Quick Calculator
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
          <TabsList className={`grid w-full ${profile.tier === 'Professional' ? 'grid-cols-3': 'grid-cols-2'} ${profile.tier === 'Free' ? 'grid-cols-1': 'grid-cols-3'} mb-6`}>
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            {profile.tier === 'Professional'  && (
              <TabsTrigger value="reports" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            )}
            {profile.tier !== 'Free'  && (
            <TabsTrigger value="calendar" className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            {/* Key Metrics */}
            <div className={`grid grid-cols-1 md:grid-cols-3 ${profile.tier === "Free" ? "lg-grid-cols-3" : "lg:grid-cols-4"} gap-6`}>
              <Card className="gradient-card card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Quotes Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSh {(formatCurrency(dashboardData.totalQuotesValue)).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {quotes.length} quotes generated
                  </p>
                </CardContent>
              </Card>

              <Card className="gradient-card card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.pendingQuotes} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card className="gradient-card card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.completedProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    Projects finished
                  </p>
                </CardContent>
              </Card>

              {profile.tier !== "Free" && (
              <Card className="gradient-card card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Client Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                    {averageRating > 0 && <Star className="w-5 h-5 ml-1 text-blue-400 fill-current" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
              )}
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
                    {dashboardData.recentQuotes.length > 0 ? (
                      dashboardData.recentQuotes.map((quote) => (
                        <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{quote.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {quote.client_name} • {quote.location}
                            </p>
                            <p className="text-sm font-medium mt-1">
                              KSh {(formatCurrency(quote.total_amount)).toLocaleString()}
                            </p>
                          </div>
                          <div className='flex'>
                          {profile.tier !== "Free" && (
                          <Badge className={getStatusColor(quote.status)}>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace('_', ' ')}
                          </Badge>
                          )}
                          <Button className='ml-3 bg-secondary hover:bg-secondary/20 text-white hover:dark:bg-primary/60 dark:bg-primary/20' onClick={() => navigate('/quotes/all')} variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          </div>
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

            {profile.tier !== 'Free' && (
              <div className="space-y-6">
                <Card className="gradient-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Upcoming Events
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.upcomingEvents.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.upcomingEvents.map((event) => (
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
                                      i < review.rating ? 'text-blue-400 fill-current' : 'text-gray-300'
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
            )}
            </div>
          </TabsContent>

          {profile.tier !== 'Free' && (
          <TabsContent value="reports">
            <Reports />
          </TabsContent>
          )}

          <TabsContent value="calendar">
            <CalendarComponent />
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
