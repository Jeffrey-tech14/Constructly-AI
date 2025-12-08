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

// --- GLOBAL STYLES (Inter Font) ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    .font-inter { font-family: 'Inter', sans-serif; }
  `}</style>
);

// RISA Color Palette (Adjusted for consistency with public pages)
const PRIMARY_TEXT = "#001021";
const ACCENT_BLUE = "#005F9E"; // slightly brighter than #015B97 for better contrast
const LIGHT_GRAY_BG = "#F5F7FA";
const BORDER_COLOR = "#E5E7EB";

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
        // (Logic remains — no change)
      }
      await fetchDashboardData();
      if (!hasLoadedOnce.current) {
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
    const baseClasses = "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full";
    const colors: Record<string, string> = {
      draft: `bg-gray-100 text-gray-700 ${baseClasses}`,
      planning: `bg-purple-100 text-purple-800 ${baseClasses}`,
      started: `bg-blue-100 text-blue-800 ${baseClasses}`,
      in_progress: `bg-amber-100 text-amber-800 ${baseClasses}`,
      completed: `bg-green-100 text-green-800 ${baseClasses}`,
      on_hold: `bg-red-100 text-red-800 ${baseClasses}`,
    };
    return colors[status] || `bg-gray-100 text-gray-700 ${baseClasses}`;
  };

  if (!user) {
    navigate("/auth");
  }

  if (quotesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <GlobalStyles />
        <Loader2 className="animate-spin h-8 w-8 text-[#005F9E]" />
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen bg-white font-inter text-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* --- Header --- */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#001021] flex items-center gap-3">
                  <LayoutDashboard className="w-6 h-6 text-[#005F9E]" />
                  Welcome back, {profile?.name}!
                </h1>
                <p className="text-sm text-gray-600 mt-2 max-w-2xl">
                  Here's what's happening with your construction business today.
                </p>
              </div>
              <Button
                onClick={() => setShowCalculator(true)}
                className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-md bg-[#005F9E] hover:bg-[#004a7a] text-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                ⚡ Quick Calculator
              </Button>
            </div>
          </div>

          {/* --- Stats Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                  Total Quotes Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-[#001021]">
                  KSh {formatCurrency(dashboardData.totalQuotesValue)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData.allQuotes.length} quotes generated
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                  Active Projects
                </CardTitle>
                <FileText className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-[#001021]">
                  {dashboardData.activeProjects}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData.pendingQuotes} pending approval
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xs font-bold text-gray-700 uppercase tracking-widest">
                  Completed Projects
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-[#001021]">
                  {dashboardData.completedProjects}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Projects finished
                </p>
              </CardContent>
            </Card>
          </div>

          {/* --- Tabs --- */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className={`grid w-full mb-6 ${
              profile.tier === "Free" ? "grid-cols-1" : profile.tier === "Professional" ? "grid-cols-3" : "grid-cols-3"
            }`}>
              <TabsTrigger
                value="overview"
                className="text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-[#005F9E] data-[state=active]:text-white rounded-md"
              >
                <BarChart className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              {profile.tier === "Professional" && (
                <TabsTrigger
                  value="reports"
                  className="text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-[#005F9E] data-[state=active]:text-white rounded-md"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Reports
                </TabsTrigger>
              )}
              {profile.tier !== "Free" && (
                <TabsTrigger
                  value="calendar"
                  className="text-[11px] font-bold uppercase tracking-widest data-[state=active]:bg-[#005F9E] data-[state=active]:text-white rounded-md"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Calendar
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 rounded-lg border border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-[#001021] flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Recent Quotes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentQuotes.length > 0 ? (
                        dashboardData.recentQuotes.map((quote) => (
                          <div
                            key={quote.id}
                            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-[#005F9E] transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-bold text-[#001021]">{quote.title}</h3>
                              <p className="text-xs text-gray-600 mt-1">
                                {quote.client_name} • {quote.location}
                              </p>
                              <p className="text-sm font-bold mt-1 text-[#001021]">
                                KSh {formatCurrency(quote.total_amount)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {profile.tier !== "Free" && (
                                <Badge className={getStatusColor(quote.status)}>
                                  {quote.status.charAt(0).toUpperCase() +
                                    quote.status.slice(1).replace("_", " ")}
                                </Badge>
                              )}
                              <Button
                                onClick={() => navigate("/quotes/all")}
                                variant="outline"
                                size="sm"
                                className="text-[10px] font-bold uppercase tracking-widest border-[#005F9E] text-[#005F9E] hover:bg-[#005F9E] hover:text-white"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                          <h3 className="font-bold text-gray-700">No quotes yet</h3>
                          <p className="text-gray-500 text-sm">Create your first quote to get started!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  {profile.tier !== "Free" && (
                    <Card className="rounded-lg border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold text-[#001021] flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Upcoming Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dashboardData.upcomingEvents.length > 0 ? (
                          <div className="space-y-3">
                            {dashboardData.upcomingEvents.map((event) => (
                              <div key={event.id} className="pb-3 last:pb-0 border-b border-gray-100 last:border-0">
                                <div className="font-bold text-[#001021] text-sm">{event.title}</div>
                                <div className="text-xs text-gray-500">
                                  {format(new Date(event.event_date), "MMM d, yyyy")}
                                  {event.event_time && ` at ${event.event_time}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No upcoming events</p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Actions */}
                  <Card className="rounded-lg border border-gray-200 shadow-sm">
                    <CardHeader className="pb-4 border-b border-gray-100">
                      <CardTitle className="text-sm font-bold text-[#001021] flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/quotes/new")}
                        className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-[#005F9E] transition-colors bg-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-blue-50">
                            <FileText className="w-4 h-4 text-[#005F9E]" />
                          </div>
                          <span className="font-bold text-[#001021] text-sm">New Quote</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCalculator(true)}
                        className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-[#005F9E] transition-colors bg-white flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-green-50">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="font-bold text-[#001021] text-sm">Cost Calculator</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {profile.tier !== "Free" && (
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