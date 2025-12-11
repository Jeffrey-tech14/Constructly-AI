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
import Calculator from "@/components/Calculator";
import Reports from "@/components/Reports";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "@/components/Calendar";

// --- GLOBAL STYLES: Outfit Font ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; }
  `}</style>
);

// --- THEME CONSTANTS ---
const THEME = {
  NAVY: "#002d5c",
  ACCENT: "#5BB539",
  TEXT_MAIN: "#1a1a1a",
  TEXT_LIGHT: "#666666",
  BG_LIGHT: "#fcfcfc",
  BORDER: "#d1d5db",
};

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
        .eq("user_id", profile.id);
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
  }, [user, location.key, profile?.id]);

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800 hover:bg-gray-300",
      planning: "bg-purple-100 text-purple-800 hover:bg-purple-300",
      started: "bg-blue-100 text-blue-800 hover:bg-blue-300",
      in_progress: "bg-amber-100 text-amber-800 hover:bg-amber-300",
      completed: "bg-green-100 text-green-800 hover:bg-green-300",
      on_hold: "bg-red-100 text-red-800 hover:bg-red-300",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 hover:bg-gray-100 text-gray-800"
    );
  };

  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a]">
        <Loader2 className="animate-spin h-8 w-8 text-[#002d5c] dark:text-white" />
      </div>
    );
  }

  if (localDashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a]">
        <Loader2 className="animate-spin h-8 w-8 text-[#002d5c] dark:text-white" />
      </div>
    );
  }

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen font-technical bg-white text-[#1a1a1a] dark:bg-[#0f172a] dark:text-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center text-2xl font-extrabold tracking-tight">
                  <LayoutDashboard className="w-7 h-7 mr-2 text-[#002d5c] dark:text-white" />
                  <span className="bg-gradient-to-r from-[#002d5c] to-[#001a35] bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                    Welcome back, {profile.name}!
                  </span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-base font-medium">
                  Here's what's happening with your construction business today.
                </p>
              </div>
              <Button
                onClick={() => setShowCalculator(true)}
                className="px-5 py-3 text-sm font-bold uppercase tracking-wider bg-[#002d5c] text-white hover:bg-[#001a35] shadow-lg transition-all duration-300 rounded-lg"
              >
                ⚡ Quick Calculator
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Total Quotes Value",
                value: `KSh ${formatCurrency(dashboardData.totalQuotesValue)}`,
                subtitle: `${dashboardData.allQuotes.length} quotes generated`,
                icon: <DollarSign className="w-4 h-4 text-gray-500 dark:text-gray-400" />,
              },
              {
                title: "Active Projects",
                value: dashboardData.activeProjects.toString(),
                subtitle: `${dashboardData.pendingQuotes} pending approval`,
                icon: <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />,
              },
              {
                title: "Completed Projects",
                value: dashboardData.completedProjects.toString(),
                subtitle: "Projects finished",
                icon: <CheckCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />,
              },
            ].map((stat, idx) => (
              <Card
                key={idx}
                className="border border-[#d1d5db] dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-extrabold text-[#002d5c] dark:text-white">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.subtitle}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList
              className={`grid w-full mb-6 ${
                profile.tier === "Professional"
                  ? "grid-cols-3"
                  : profile.tier === "Free"
                  ? "grid-cols-1"
                  : "grid-cols-2"
              }`}
            >
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-[#002d5c] data-[state=active]:text-white rounded-md"
              >
                <BarChart className="w-4 h-4" />
                Overview
              </TabsTrigger>
              {profile.tier === "Professional" && (
                <TabsTrigger
                  value="reports"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-[#002d5c] data-[state=active]:text-white rounded-md"
                >
                  <TrendingUp className="w-4 h-4" />
                  Reports
                </TabsTrigger>
              )}
              {profile.tier !== "Free" && (
                <TabsTrigger
                  value="calendar"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 data-[state=active]:bg-[#002d5c] data-[state=active]:text-white rounded-md"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Calendar
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Quotes */}
                <Card className="lg:col-span-2 border border-[#d1d5db] dark:border-gray-700 rounded-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                      <FileText className="w-5 h-5" />
                      Recent Quotes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.recentQuotes.length > 0 ? (
                        dashboardData.recentQuotes.map((quote) => (
                          <div
                            key={quote.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#e5e7eb] dark:border-gray-600 rounded-lg hover:shadow transition-shadow"
                          >
                            <div className="flex-1 mb-3 sm:mb-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {quote.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {quote.client_name} • {quote.location}
                              </p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                KSh {formatCurrency(quote.total_amount)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {profile.tier !== "Free" && (
                                <Badge className={`${getStatusColor(quote.status)} text-xs font-medium`}>
                                  {quote.status.charAt(0).toUpperCase() +
                                    quote.status.slice(1).replace("_", " ")}
                                </Badge>
                              )}
                              <Button
                                onClick={() => navigate("/quotes/all")}
                                variant="outline"
                                size="sm"
                                className="border-[#002d5c] text-[#002d5c] hover:bg-[#002d5c] hover:text-white dark:border-[#5BB539] dark:text-[#5BB539] dark:hover:bg-[#5BB539] dark:hover:text-white"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-lg mb-2">
                            No quotes yet
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400">
                            Create your first quote to get started!
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Upcoming Events (Non-Free) */}
                  {profile.tier !== "Free" && (
                    <Card className="border border-[#d1d5db] dark:border-gray-700 rounded-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-white">
                          <Clock className="w-5 h-5" />
                          Upcoming Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dashboardData.upcomingEvents.length > 0 ? (
                          <div className="space-y-3">
                            {dashboardData.upcomingEvents.map((event) => (
                              <div
                                key={event.id}
                                className="p-3 border-t border-[#e5e7eb] dark:border-gray-600"
                              >
                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                  {event.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {format(new Date(event.event_date), "MMM d, yyyy")}
                                  {event.event_time && ` at ${event.event_time}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            No upcoming events
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Actions */}
                  <Card className="border border-[#d1d5db] dark:border-gray-700 rounded-lg">
                    <CardHeader className="pb-4 border-b border-[#d1d5db] dark:border-gray-700">
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base font-semibold">
                        <Zap className="w-5 h-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/quotes/new")}
                        className="w-full text-left p-3 rounded-lg border border-[#d1d5db] dark:border-gray-600 hover:border-[#002d5c] dark:hover:border-[#5BB539] transition-colors bg-white dark:bg-[#1e293b] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-[#002d5c]/10 dark:bg-[#5BB539]/10">
                            <FileText className="w-4 h-4 text-[#002d5c] dark:text-[#5BB539]" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            New Quote
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCalculator(true)}
                        className="w-full text-left p-3 rounded-lg border border-[#d1d5db] dark:border-gray-600 hover:border-[#002d5c] dark:hover:border-[#5BB539] transition-colors bg-white dark:bg-[#1e293b] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-[#5BB539]/10">
                            <DollarSign className="w-4 h-4 text-[#5BB539]" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            Cost Calculator
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
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
        </div>

        <Calculator
          isOpen={showCalculator}
          onClose={() => setShowCalculator(false)}
        />
      </div>
    </>
  );
};

export default Dashboard;