// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Zap,
  ChevronRight,
  Loader2,
  Sparkles,
  Target,
  Building,
  LineChart,
  Globe,
  Cpu,
  Server,
  Activity,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users2,
  CalendarDays,
  FolderKanban,
  Bolt
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
import Calendar from "@/components/Calendar";

// UPDATED: Sleek dark theme colors matching other pages
const THEME = {
  DARK_BG: "#0A0A0A",
  CARD_BG: "#1A1A1A",
  ACCENT_PRIMARY: "#3B82F6", // Blue accent
  ACCENT_SECONDARY: "#8B5CF6", // Purple accent
  TEXT_LIGHT: "#E5E5E5",
  TEXT_MUTED: "#A3A3A3",
  BORDER_COLOR: "#2A2A2A",
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  DANGER: "#EF4444",
  GRADIENT: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
  GLASS_BG: "rgba(26, 26, 26, 0.7)"
};

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
  }, [user, location.key]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return value.toString();
  };

  const fetchDashboardData = async () => {
    try {
      const { data: quotes, error: quotesError } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", profile.id);
      if (quotesError) throw quotesError;
      
      const { data: events, error: eventsError } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", profile.id);
      if (eventsError) throw eventsError;

      const totalQuotesValue = quotes.reduce(
        (sum, quote) => sum + quote.total_amount,
        0
      );
      const completedProjects = quotes.filter(
        (quote) => quote.status === "completed"
      ).length;
      const activeProjects = quotes.filter((quote) =>
        ["started", "in_progress"].includes(quote.status)
      ).length;
      const pendingQuotes = quotes.filter(
        (quote) => quote.status === "draft"
      ).length;
      const upcomingEvents = events
        .filter((event) => new Date(event.event_date) >= new Date())
        .sort(
          (a, b) =>
            new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        )
        .slice(0, 3);
      const recentQuotes = quotes
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
        .slice(0, 5);
      const allQuotes = quotes.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setDashboardData({
        totalQuotesValue,
        completedProjects,
        activeProjects,
        pendingQuotes,
        upcomingEvents,
        recentQuotes,
        allQuotes,
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
    const colors = {
      draft: "bg-gray-900/30 text-gray-400 border-gray-700",
      planning: "bg-purple-900/30 text-purple-400 border-purple-800",
      started: "bg-blue-900/30 text-blue-400 border-blue-800",
      in_progress: "bg-amber-900/30 text-amber-400 border-amber-800",
      completed: "bg-green-900/30 text-green-400 border-green-800",
      on_hold: "bg-red-900/30 text-red-400 border-red-800",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-900/30 text-gray-400 border-gray-700"
    );
  };

  if (!user) {
    navigate("/auth");
  }

  if (quotesLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto border-4 border-blue-500/20 border-t-blue-500 rounded-full"
          />
          <Loader2 className="w-12 h-12 mx-auto text-blue-400 absolute inset-0 m-auto animate-spin" />
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-950"></div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 mb-4"
              >
                <LayoutDashboard className="w-8 h-8 text-blue-400" />
              </motion.div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{profile?.name}</span>!
              </h1>
              <p className="text-gray-400 text-lg">
                Here's what's happening with your construction business today.
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setShowCalculator(true)}
                className="px-6 py-5 rounded-xl shadow-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold transition-all"
              >
                <Bolt className="w-5 h-5 mr-2" />
                Quick Calculator
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800 hover:border-blue-500/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Total Quotes Value
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-900/20">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  KSh {formatCurrency(dashboardData.totalQuotesValue).toLocaleString()}
                </div>
                <div className="flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-gray-400">
                    {dashboardData.allQuotes.length} quotes generated
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Active Projects
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-900/20">
                  <Activity className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {dashboardData.activeProjects}
                </div>
                <div className="flex items-center text-sm">
                  <FolderKanban className="w-4 h-4 text-purple-400 mr-1" />
                  <span className="text-gray-400">
                    {dashboardData.pendingQuotes} pending approval
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800 hover:border-green-500/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Completed Projects
                </CardTitle>
                <div className="p-2 rounded-lg bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {dashboardData.completedProjects}
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-gray-400">Projects finished</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="animate-fade-in"
        >
          <TabsList className="grid w-full mb-8 bg-gray-900/50 p-1 rounded-xl border border-gray-800">
            <TabsTrigger 
              value="overview" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-600/20 data-[state=active]:border data-[state=active]:border-blue-500/30 data-[state=active]:text-white"
            >
              <BarChart className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            {profile.tier === "Professional" && (
              <TabsTrigger 
                value="reports" 
                className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-600/20 data-[state=active]:border data-[state=active]:border-blue-500/30 data-[state=active]:text-white"
              >
                <LineChart className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
            )}
            {profile.tier !== "Free" && (
              <TabsTrigger 
                value="calendar" 
                className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-600/20 data-[state=active]:border data-[state=active]:border-blue-500/30 data-[state=active]:text-white"
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Quotes Card */}
              <Card className="lg:col-span-2 bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800">
                <CardHeader className="border-b border-gray-800">
                  <CardTitle className="flex items-center text-white">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center mr-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    Recent Quotes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {dashboardData.recentQuotes.length > 0 ? (
                      dashboardData.recentQuotes.map((quote) => (
                        <motion.div
                          key={quote.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-4 bg-gray-900/30 border border-gray-800 rounded-xl hover:border-blue-500/50 transition-all"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-white">{quote.title}</h3>
                              <span className="text-lg font-bold text-blue-400">
                                KSh {formatCurrency(quote.total_amount).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">
                              {quote.client_name} • {quote.location}
                            </p>
                            <div className="flex items-center gap-2">
                              {profile.tier !== "Free" && (
                                <Badge className={getStatusColor(quote.status)}>
                                  {quote.status.charAt(0).toUpperCase() +
                                    quote.status.slice(1).replace("_", " ")}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {format(new Date(quote.updated_at), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                          <Button
                            className="ml-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-600/30 hover:to-blue-700/30 text-blue-400 border border-blue-500/30"
                            onClick={() => navigate("/quotes/all")}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium text-lg text-white mb-2">
                          No quotes yet
                        </h3>
                        <p className="text-gray-400">
                          Create your first quote to get started!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Events Card */}
                {profile.tier !== "Free" && (
                  <Card className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800">
                    <CardHeader className="border-b border-gray-800">
                      <CardTitle className="flex items-center text-white">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 flex items-center justify-center mr-3">
                          <Clock className="w-5 h-5 text-green-400" />
                        </div>
                        Upcoming Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {dashboardData.upcomingEvents.length > 0 ? (
                        <div className="space-y-4">
                          {dashboardData.upcomingEvents.map((event) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3 bg-gray-900/30 rounded-lg border border-gray-800 hover:border-green-500/50 transition-all"
                            >
                              <div className="font-medium text-sm text-white mb-1">
                                {event.title}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center">
                                <CalendarDays className="w-3 h-3 mr-1" />
                                {format(new Date(event.event_date), "MMM d, yyyy")}
                                {event.event_time && ` • ${event.event_time}`}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-sm text-gray-400">No upcoming events</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions Card */}
                <Card className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800">
                  <CardHeader className="border-b border-gray-800">
                    <CardTitle className="flex items-center text-white">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center mr-3">
                        <Zap className="w-5 h-5 text-amber-400" />
                      </div>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/quotes/new")}
                      className="w-full text-left p-4 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 bg-gray-900/30 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:border-blue-400">
                          <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <span className="font-medium text-white block">New Quote</span>
                          <span className="text-xs text-gray-400">Create a new project estimate</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCalculator(true)}
                      className="w-full text-left p-4 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300 bg-gray-900/30 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center group-hover:border-purple-400">
                          <DollarSign className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <span className="font-medium text-white block">Cost Calculator</span>
                          <span className="text-xs text-gray-400">Quick material calculations</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    </motion.button>
                  </CardContent>
                </Card>

                {/* Performance Indicator */}
                {profile.tier === "Professional" && (
                  <Card className="bg-gradient-to-b from-gray-900/50 to-black/50 backdrop-blur-sm border border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Performance</CardTitle>
                      <CardDescription className="text-gray-400">
                        Last 30 days
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Quote Completion</span>
                          <span className="text-green-400 flex items-center">
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                            85%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Client Satisfaction</span>
                          <span className="text-green-400 flex items-center">
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                            92%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          {profile.tier !== "Free" && (
            <TabsContent value="reports">
              <Reports />
            </TabsContent>
          )}

          {/* Calendar Tab */}
          {profile.tier !== "Free" && (
            <TabsContent value="calendar">
              <Calendar />
            </TabsContent>
          )}
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