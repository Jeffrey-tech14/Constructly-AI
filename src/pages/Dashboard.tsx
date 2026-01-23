// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  Calendar as CalendarIcon,
  TrendingUp,
  CheckCircle,
  LayoutDashboard,
  Zap,
  ChevronRight,
  Loader2,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Calculator from "@/components/Calculator";
import Reports from "@/components/Reports";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Calendar from "@/components/Calendar";

// --- GLOBAL STYLES (Matches Frontend) ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; }
    
    /* Sleek Scrollbar hide */
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
  `}</style>
);

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCalculator, setShowCalculator] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalQuotesValue: 0,
    completedProjects: 0,
    activeProjects: 0,
    pendingQuotes: 0,
    upcomingEvents: [],
    recentQuotes: [],
    allQuotes: [],
  });

  const [localDashboardLoading, setLocalDashboardLoading] = useState(true);
  const hasLoadedOnce = useRef(false);

  // --- THEME CONSTANTS ---
  const THEME = {
    NAVY: "#00356B",
    ORANGE: "#D85C2C",
    GREEN: "#86bc25",
  };

  const formatCurrency = (value) => {
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
      if (!profile?.id) return;

      const { data: quotes, error: quotesError } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", profile.id)
        .limit(5);
      if (quotesError) throw quotesError;

      const { data: events, error: eventsError } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", profile.id);
      if (eventsError) throw eventsError;

      const totalQuotesValue = quotes.reduce(
        (sum, quote) => sum + (quote.total_amount || 0),
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

  useEffect(() => {
    const fetchAndSet = async () => {
      if (!hasLoadedOnce.current) {
        setLocalDashboardLoading(true);
      }
      await fetchDashboardData();
      if (!hasLoadedOnce.current) {
        setLocalDashboardLoading(false);
        hasLoadedOnce.current = true;
      }
    };

    fetchAndSet();
  }, [user, profile?.id]);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      planning: "bg-purple-50 text-purple-700 border-purple-200",
      started: "bg-blue-50 text-[#00356B] border-blue-200",
      in_progress: "bg-amber-50 text-amber-700 border-amber-200",
      completed: "bg-[#86bc25]/10 text-[#5da40b] border-[#86bc25]/20",
      on_hold: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  // Early return if no user — prevent execution (after all hooks)
  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  // Show loader while profile is not available
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin rounded-full h-10 w-10 text-[#00356B]" />
      </div>
    );
  }

  // Now safe to use profile — it's guaranteed non-null
  if (localDashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin rounded-full h-10 w-10 text-[#00356B]" />
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen inset-0 scrollbar-hide bg-[#f8f9fa] dark:bg-[#0b1120] font-technical pb-20">
        <div className="max-w-7xl scrollbar-hide mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* --- HEADER SECTION: Clean & Professional --- */}
          <div className="mb-8 animate-fade-in">
            <div className="sm:flex flex-1 justify-between items-end">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-[#00356B] rounded-lg text-white shadow-md">
                      <LayoutDashboard className="w-5 h-5" />
                   </div>
                   <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00356B] dark:text-white tracking-tight">
                     Welcome back, {profile.name}!
                   </h1>
                </div>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium max-w-2xl">
                  Here's an overview of your construction projects and financial performance today.
                </p>
              </div>
              <Button
                onClick={() => setShowCalculator(true)}
                className="group relative overflow-hidden text-sm px-6 py-5 rounded-full sm:mt-0 mt-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-bold tracking-wide"
                style={{ backgroundColor: THEME.ORANGE }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                   <Zap className="w-4 h-4 fill-white" /> Quick Calculator
                </span>
              </Button>
            </div>
          </div>

          {/* --- KPI CARDS: Sleek White Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-[#151c2f] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <DollarSign className="w-24 h-24 text-[#00356B]" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Total Quotes Value
                </CardTitle>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-[#00356B] dark:text-blue-300">
                   <DollarSign className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="z-10 relative">
                <div className="text-3xl font-extrabold text-[#00356B] dark:text-white mt-2">
                  KSh {formatCurrency(dashboardData.totalQuotesValue)}
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium flex items-center gap-1">
                  <span className="text-[#86bc25] font-bold">+{dashboardData.allQuotes.length}</span> quotes generated total
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-[#151c2f] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <FileText className="w-24 h-24 text-[#D85C2C]" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Active Projects
                </CardTitle>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-full text-[#D85C2C]">
                   <FileText className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="z-10 relative">
                <div className="text-3xl font-extrabold text-[#00356B] dark:text-white mt-2">
                  {dashboardData.activeProjects}
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  {dashboardData.pendingQuotes} pending approval
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-[#151c2f] overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <CheckCircle className="w-24 h-24 text-[#86bc25]" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 z-10 relative">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Completed Projects
                </CardTitle>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full text-[#86bc25]">
                   <CheckCircle className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="z-10 relative">
                <div className="text-3xl font-extrabold text-[#00356B] dark:text-white mt-2">
                  {dashboardData.completedProjects}
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  Succesfully delivered
                </p>
              </CardContent>
            </Card>
          </div>

          {/* --- TABS SECTION: Modern Pill Style --- */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="animate-fade-in"
          >
            <TabsList
              className={`grid w-full ${
                profile.tier === "Professional"
                  ? "grid-cols-3"
                  : profile.tier === "Free"
                  ? "grid-cols-1"
                  : "grid-cols-2"
              } mb-8 bg-gray-200/50 dark:bg-gray-800 p-1.5 rounded-full h-auto`}
            >
              <TabsTrigger 
                value="overview" 
                className="rounded-full py-2.5 data-[state=active]:bg-[#00356B] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-gray-600 dark:text-gray-300"
              >
                <BarChart className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              {profile.tier === "Professional" && (
                <TabsTrigger 
                    value="reports" 
                    className="rounded-full py-2.5 data-[state=active]:bg-[#00356B] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-gray-600 dark:text-gray-300"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Reports
                </TabsTrigger>
              )}
              {profile.tier !== "Free" && (
                <TabsTrigger 
                    value="calendar" 
                    className="rounded-full py-2.5 data-[state=active]:bg-[#00356B] data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-gray-600 dark:text-gray-300"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Calendar
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- RECENT QUOTES LIST --- */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-[#151c2f]">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                    <CardTitle className="flex items-center text-[#00356B] dark:text-white font-bold text-lg">
                      <div className="p-1.5 bg-blue-50 rounded-md mr-3 text-[#00356B]">
                        <FileText className="w-5 h-5" />
                      </div>
                      Recent Quotes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {dashboardData.recentQuotes.length > 0 ? (
                        dashboardData.recentQuotes.map((quote) => (
                          <div
                            key={quote.id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-[#1e2538] border border-gray-100 dark:border-gray-700/50 rounded-xl hover:border-[#00356B]/30 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00356B] opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex-1 mb-4 sm:mb-0">
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-[#00356B] transition-colors">
                                    {quote.title}
                                </h3>
                                {profile.tier !== "Free" && (
                                    <Badge className={`${getStatusColor(quote.status)} border px-2 py-0.5 font-bold shadow-none`}>
                                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1).replace("_", " ")}
                                    </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    {quote.client_name}
                                </p>
                                <span className="text-gray-300">•</span>
                                <p className="text-xs text-gray-500">
                                    {quote.location}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <p className="text-lg font-extrabold text-[#00356B] dark:text-white">
                                    KSh {formatCurrency(quote.total_amount)}
                                </p>
                                <Button
                                    onClick={() => navigate("/quotes/all")}
                                    variant="outline"
                                    size="sm"
                                    className="border-[#00356B] text-[#00356B] hover:bg-[#00356B] hover:text-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-white dark:hover:text-[#00356B] font-bold rounded-lg transition-colors"
                                >
                                    <Eye className="w-4 h-4 mr-1.5" />
                                    View
                                </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                             <FileText className="w-8 h-8 text-gray-300" />
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                            No quotes yet
                          </h3>
                          <p className="text-gray-500 text-sm mb-4">
                            Create your first professional quote to get started!
                          </p>
                          <Button 
                             onClick={() => navigate("/quotes/new")}
                             className="bg-[#00356B] hover:bg-[#002a54] text-white font-bold rounded-full"
                          >
                             Create Quote
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-8">
                  {/* --- UPCOMING EVENTS --- */}
                  {profile.tier !== "Free" && (
                    <Card className="border-none shadow-sm bg-white dark:bg-[#151c2f]">
                      <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                        <CardTitle className="flex items-center text-[#00356B] dark:text-white font-bold">
                           <div className="p-1.5 bg-purple-50 rounded-md mr-3 text-purple-600">
                             <Clock className="w-5 h-5" />
                           </div>
                           Upcoming Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {dashboardData.upcomingEvents.length > 0 ? (
                          <div className="space-y-4">
                            {dashboardData.upcomingEvents.map((event) => (
                              <div
                                key={event.id}
                                className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
                              >
                                <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 w-12 h-12 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                                   <span className="text-[10px] font-bold text-gray-400 uppercase">
                                     {format(new Date(event.event_date), "MMM")}
                                   </span>
                                   <span className="text-lg font-extrabold text-[#00356B] dark:text-white">
                                     {format(new Date(event.event_date), "d")}
                                   </span>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                                    {event.title}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {event.event_time || "All Day"}
                                    </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-sm text-gray-400 italic">
                              No upcoming events on your calendar.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* --- QUICK ACTIONS --- */}
                  <Card className="border-none shadow-sm bg-white dark:bg-[#151c2f]">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
                      <CardTitle className="flex items-center text-[#00356B] dark:text-white font-bold">
                        <div className="p-1.5 bg-yellow-50 rounded-md mr-3 text-yellow-600">
                           <Zap className="w-5 h-5" />
                        </div>
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/quotes/new")}
                        className="w-full text-left p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-[#00356B] hover:bg-[#00356B]/5 transition-all duration-300 bg-white dark:bg-[#1e2538] flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#00356B] dark:text-blue-300 group-hover:bg-[#00356B] group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-gray-700 dark:text-white group-hover:text-[#00356B] dark:group-hover:text-blue-300 transition-colors">
                            Create New Quote
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#00356B] transition-colors" />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCalculator(true)}
                        className="w-full text-left p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-[#86bc25] hover:bg-[#86bc25]/5 transition-all duration-300 bg-white dark:bg-[#1e2538] flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-full bg-green-50 dark:bg-green-900/20 text-[#86bc25] group-hover:bg-[#86bc25] group-hover:text-white transition-colors">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-gray-700 dark:text-white group-hover:text-[#5da40b] dark:group-hover:text-green-300 transition-colors">
                            Cost Calculator
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#86bc25] transition-colors" />
                      </motion.button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {profile.tier === "Professional" && (
              <TabsContent value="reports">
                <Reports />
              </TabsContent>
            )}
            {profile.tier !== "Free" && (
              <TabsContent value="calendar">
                <Calendar />
              </TabsContent>
            )}
          </Tabs>

          <Calculator
            isOpen={showCalculator}
            onClose={() => setShowCalculator(false)}
          />
        </div>
      </div>
    </>
  );
};

export default Dashboard;