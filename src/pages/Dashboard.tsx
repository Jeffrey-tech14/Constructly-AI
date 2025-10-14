import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  FileText,
  Eye,
  BarChart,
  Calendar as CalendarIcon,
  TrendingUp,
  CheckCircle,
  LayoutDashboard,
  Star,
  Clock,
  Users,
  Building,
  Target,
  Zap,
  ArrowRight,
  ChevronRight,
  PieChart,
  Activity,
  ArrowUpRight,
  Download,
  Filter,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuotes } from "@/hooks/useQuotes";
import { useClientReviews } from "@/hooks/useClientReviews";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import Calculator from "@/components/Calculator";
import Reports from "@/components/Reports";
import CalendarComponent from "@/components/Calendar";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// RISA Color Palette (Matching index.tsx)
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748";
const RISA_LIGHT_GRAY = "#F5F7FA";
const RISA_MEDIUM_GRAY = "#E2E8F0";

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const { quotes, loading: quotesLoading } = useQuotes();
  const { reviews, averageRating, totalReviews } = useClientReviews();
  const { events } = useCalendarEvents();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCalculator, setShowCalculator] = useState(false);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalQuotesValue: 0,
    completedProjects: 0,
    activeProjects: 0,
    pendingQuotes: 0,
    upcomingEvents: [],
    recentQuotes: [],
    allQuotes: [],
    monthlyGrowth: 15.2,
    conversionRate: 68.5,
  });

  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    const fetchAndSet = async () => {
      if (!hasLoadedOnce.current) {
        // Simulate loading state if needed
      }
      await fetchDashboardData();
      hasLoadedOnce.current = true;
    };

    if (user && profile) {
      fetchAndSet();
    }
  }, [user, profile, location.key]);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return value.toLocaleString();
  };

  const fetchDashboardData = async () => {
    try {
      const { data: quotesData, error: quotesError } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", profile.id);

      if (quotesError) throw quotesError;

      const { data: eventsData, error: eventsError } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", profile.id);

      if (eventsError) throw eventsError;

      const totalQuotesValue = quotesData.reduce(
        (sum, quote) => sum + quote.total_amount,
        0
      );

      const completedProjects = quotesData.filter(
        (quote) => quote.status === "completed"
      ).length;

      const activeProjects = quotesData.filter((quote) =>
        ["started", "in_progress"].includes(quote.status)
      ).length;

      const pendingQuotes = quotesData.filter(
        (quote) => quote.status === "draft"
      ).length;

      const upcomingEvents = eventsData
        .filter((event) => new Date(event.event_date) >= new Date())
        .sort(
          (a, b) =>
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        )
        .slice(0, 3);

      const recentQuotes = quotesData
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5);

      const allQuotes = quotesData.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setDashboardData({
        totalQuotesValue,
        completedProjects,
        activeProjects,
        pendingQuotes,
        upcomingEvents,
        recentQuotes,
        allQuotes,
        monthlyGrowth: 15.2,
        conversionRate: 68.5,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const baseClasses = "text-xs px-3 py-1 rounded-full font-medium";
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      planning: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      started: `bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`,
      in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      on_hold: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return `${baseClasses} ${colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`;
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (quotesLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: RISA_BLUE }}></div>
          <p className="text-gray-600 dark:text-gray-300" style={{ color: RISA_BLUE }}>Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Badge className="mb-3 text-xs bg-blue-600 text-white dark:bg-blue-700">
                <LayoutDashboard className="w-3 h-3 mr-1" /> Dashboard
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={{ color: RISA_BLUE }}>
                Welcome back, {profile.name}!
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                >
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </motion.div>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                Here's what's happening with your construction business today.
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowCalculator(true)}
                className="rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                style={{
                  backgroundColor: RISA_BLUE,
                  color: RISA_WHITE,
                  padding: "0.75rem 2rem",
                }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick Calculator
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign className="w-12 h-12" style={{ color: RISA_BLUE }} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Portfolio Value</p>
                  <h3 className="text-2xl font-bold mt-2" style={{ color: RISA_BLUE }}>
                    KSh {formatCurrency(dashboardData.totalQuotesValue)}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      +{dashboardData.monthlyGrowth}% this month
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="w-12 h-12" style={{ color: RISA_LIGHT_BLUE }} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
                  <h3 className="text-2xl font-bold mt-2" style={{ color: RISA_LIGHT_BLUE }}>
                    {dashboardData.activeProjects}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {dashboardData.pendingQuotes} pending approval
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle className="w-12 h-12" style={{ color: RISA_BLUE }} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Projects</p>
                  <h3 className="text-2xl font-bold mt-2" style={{ color: RISA_BLUE }}>
                    {dashboardData.completedProjects}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs">
                      {dashboardData.conversionRate}% success rate
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden group">
            <CardContent className="p-6 relative">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Star className="w-12 h-12" style={{ color: RISA_LIGHT_BLUE }} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Client Satisfaction</p>
                  <h3 className="text-2xl font-bold mt-2" style={{ color: RISA_LIGHT_BLUE }}>
                    {averageRating}/5
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {totalReviews} total reviews
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList
            className={`grid w-full mb-2 ${
              profile.tier === "Free" ? "grid-cols-1" : profile.tier === "Professional" ? "grid-cols-3" : "grid-cols-2"
            } bg-gray-100 dark:bg-gray-800 p-1 rounded-xl`}
          >
            <TabsTrigger
              value="overview"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 rounded-lg transition-all"
              style={{ 
                color: RISA_DARK_TEXT,
                backgroundColor: activeTab === "overview" ? RISA_WHITE : "transparent"
              }}
            >
              <BarChart className="w-4 h-4" />
              Overview
            </TabsTrigger>
            {profile.tier === "Professional" && (
              <TabsTrigger
                value="reports"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 rounded-lg transition-all"
                style={{ 
                  color: RISA_DARK_TEXT,
                  backgroundColor: activeTab === "reports" ? RISA_WHITE : "transparent"
                }}
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            )}
            {profile.tier !== "Free" && (
              <TabsTrigger
                value="calendar"
                className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 rounded-lg transition-all"
                style={{ 
                  color: RISA_DARK_TEXT,
                  backgroundColor: activeTab === "calendar" ? RISA_WHITE : "transparent"
                }}
              >
                <CalendarIcon className="w-4 h-4" />
                Schedule
              </TabsTrigger>
            )}
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-6">
              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Quotes */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 rounded-xl">
                    <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                          <FileText className="w-5 h-5" style={{ color: RISA_BLUE }} />
                          Recent Quotes
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="rounded-lg">
                          <Filter className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        Your most recently created quotes and proposals
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {dashboardData.recentQuotes.length > 0 ? (
                        <div className="space-y-4">
                          {dashboardData.recentQuotes.map((quote, index) => (
                            <motion.div
                              key={quote.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-all duration-300 group"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                    <FileText className="w-4 h-4" style={{ color: RISA_BLUE }} />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {quote.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                      {quote.client_name} • {quote.location}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-sm font-bold" style={{ color: RISA_BLUE }}>
                                    KSh {formatCurrency(quote.total_amount)}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {format(new Date(quote.created_at), "MMM d, yyyy")}
                                  </p>
                                </div>
                                {profile.tier !== "Free" && (
                                  <Badge 
                                    className={getStatusColor(quote.status)}
                                    style={{ 
                                      border: `1px solid ${RISA_MEDIUM_GRAY}` 
                                    }}
                                  >
                                    {quote.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                                  </Badge>
                                )}
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate("/quotes/all")}
                                    className="rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                    style={{
                                      borderColor: RISA_BLUE,
                                      color: RISA_BLUE
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="text-center pt-4"
                          >
                            <Button
                              onClick={() => navigate("/quotes/all")}
                              variant="ghost"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-full"
                            >
                              View All Quotes <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          </motion.div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                          <FileText className="w-16 h-16 mx-auto mb-4 opacity-60" style={{ color: RISA_BLUE }} />
                          <h3 className="font-medium text-lg mb-2 text-gray-900 dark:text-white">No quotes yet</h3>
                          <p className="mb-6">Create your first quote to get started!</p>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              onClick={() => navigate("/quotes/new")}
                              className="rounded-full font-semibold"
                              style={{
                                backgroundColor: RISA_BLUE,
                                color: RISA_WHITE,
                                padding: "0.75rem 2rem",
                              }}
                            >
                              Create First Quote
                            </Button>
                          </motion.div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Right Column */}
                {profile.tier !== "Free" && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 rounded-xl">
                      <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                          <Clock className="w-5 h-5" style={{ color: RISA_BLUE }} />
                          Upcoming Events
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Your scheduled events and meetings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        {dashboardData.upcomingEvents.length > 0 ? (
                          <div className="space-y-4">
                            {dashboardData.upcomingEvents.map((event, index) => (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-sm transition-all duration-300 bg-white dark:bg-gray-700/30 group cursor-pointer"
                              >
                                <div className="font-medium text-gray-900 dark:text-white text-sm mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {event.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                  <CalendarIcon className="w-3 h-3" />
                                  {format(new Date(event.event_date), "MMM d, yyyy")}
                                  {event.event_time && ` • ${event.event_time}`}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-60" style={{ color: RISA_BLUE }} />
                            <p className="text-sm">No upcoming events</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 rounded-xl">
                      <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                          <Zap className="w-5 h-5" style={{ color: RISA_BLUE }} />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate("/quotes/new")}
                          className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 bg-white dark:bg-gray-700/30 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                              <FileText className="w-4 h-4" style={{ color: RISA_BLUE }} />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">New Quote</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowCalculator(true)}
                          className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 bg-white dark:bg-gray-700/30 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                              <DollarSign className="w-4 h-4" style={{ color: RISA_BLUE }} />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">Cost Calculator</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </motion.button>
                      </CardContent>
                    </Card>

                    {/* Performance Summary */}
                    <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 rounded-xl">
                      <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                          <TrendingUp className="w-5 h-5" style={{ color: RISA_BLUE }} />
                          Performance Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Growth</span>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            +{dashboardData.monthlyGrowth}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {dashboardData.conversionRate}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Active Projects</span>
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            {dashboardData.activeProjects}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </TabsContent>

            {profile.tier === "Professional" && (
              <TabsContent value="reports">
                <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 rounded-xl">
                  <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-xl">
                        <PieChart className="w-6 h-6" style={{ color: RISA_BLUE }} />
                        Business Analytics
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg border-gray-300 dark:border-gray-600">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-lg border-gray-300 dark:border-gray-600">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Comprehensive analytics and performance metrics for your construction business
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Reports />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {profile.tier !== "Free" && (
              <TabsContent value="calendar">
                <Card className="border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 rounded-xl">
                  <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-xl">
                      <CalendarIcon className="w-6 h-6" style={{ color: RISA_BLUE }} />
                      Project Schedule
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Manage your project timeline, meetings, and important deadlines
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CalendarComponent />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </AnimatePresence>
        </Tabs>
      </div>

      <Calculator isOpen={showCalculator} onClose={() => setShowCalculator(false)} />
    </div>
  );
};

export default Dashboard;
