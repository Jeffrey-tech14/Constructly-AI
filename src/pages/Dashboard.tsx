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

// 🔵 RISA Color Palette — aligned with JTechAISection
const RISA_BLUE = "#015B97";
const RISA_DARK_BG = "#001226";
const RISA_LIGHT_BG = "#F0F7FA"; // matches JTechAISection background
const RISA_BORDER = "#E1EBF2";
const RISA_TEXT_DARK = "#333333";
const RISA_TEXT_LIGHT = "#FFFFFF";
const RISA_TEXT_GRAY = "#666666";

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
        // Logic unchanged
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
    const base = "text-xs px-2 py-1 rounded-full font-medium";
    switch (status) {
      case "draft": return `${base} bg-gray-100 text-gray-800`;
      case "planning": return `${base} bg-purple-100 text-purple-800`;
      case "started": return `${base} bg-blue-100 text-blue-800`;
      case "in_progress": return `${base} bg-amber-100 text-amber-800`;
      case "completed": return `${base} bg-green-100 text-green-800`;
      case "on_hold": return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-gray-100 text-gray-800`;
    }
  };

  if (!user) {
    navigate("/auth");
  }

  if (quotesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F7FA]">
        <Loader2 className="animate-spin h-8 w-8 text-[#015B97]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F7FA]">
      <div className="max-w-[1240px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-[24px] lg:text-[30px] font-bold text-[#333333] flex items-center gap-3">
                <LayoutDashboard className="w-6 h-6 text-[#015B97]" />
                Welcome back, {profile?.name}!
              </h1>
              <p className="text-[15px] text-[#666666] mt-2">
                Here's what's happening with your construction business today.
              </p>
            </div>
            <Button
              onClick={() => setShowCalculator(true)}
              className="bg-[#015B97] hover:bg-[#014a7a] text-white text-[14px] font-bold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              ⚡ Quick Calculator
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              title: "Total Quotes Value",
              value: `KSh ${formatCurrency(dashboardData.totalQuotesValue).toLocaleString()}`,
              subtitle: `${dashboardData.allQuotes.length} quotes generated`,
              icon: <DollarSign className="w-4 h-4 text-[#666666]" />,
            },
            {
              title: "Active Projects",
              value: dashboardData.activeProjects.toString(),
              subtitle: `${dashboardData.pendingQuotes} pending approval`,
              icon: <FileText className="w-4 h-4 text-[#666666]" />,
            },
            {
              title: "Completed Projects",
              value: dashboardData.completedProjects.toString(),
              subtitle: "Projects finished",
              icon: <CheckCircle className="w-4 h-4 text-[#666666]" />,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl border border-[#E1EBF2] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-medium text-[#666666]">{stat.title}</h3>
                {stat.icon}
              </div>
              <p className="text-[20px] lg:text-[24px] font-bold text-[#333333]">{stat.value}</p>
              <p className="text-[13px] text-[#888888] mt-1">{stat.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className={`grid w-full mb-8 ${
            profile.tier === "Free" ? "grid-cols-1" : 
            profile.tier === "Professional" ? "grid-cols-3" : "grid-cols-2"
          }`}>
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#015B97] data-[state=active]:text-white text-[#333333] py-2.5 text-[15px] font-medium rounded-lg"
            >
              <BarChart className="w-4 h-4 mr-2" /> Overview
            </TabsTrigger>
            {profile.tier === "Professional" && (
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-[#015B97] data-[state=active]:text-white text-[#333333] py-2.5 text-[15px] font-medium rounded-lg"
              >
                <TrendingUp className="w-4 h-4 mr-2" /> Reports
              </TabsTrigger>
            )}
            {profile.tier !== "Free" && (
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-[#015B97] data-[state=active]:text-white text-[#333333] py-2.5 text-[15px] font-medium rounded-lg"
              >
                <CalendarIcon className="w-4 h-4 mr-2" /> Calendar
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Quotes */}
              <div className="lg:col-span-2">
                <Card className="border border-[#E1EBF2] shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="pb-4 border-b border-[#E1EBF2]">
                    <CardTitle className="text-[18px] font-bold text-[#333333] flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Recent Quotes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    {dashboardData.recentQuotes.length > 0 ? (
                      <div className="space-y-4">
                        {dashboardData.recentQuotes.map((quote) => (
                          <div
                            key={quote.id}
                            className="flex items-center justify-between p-4 border border-[#E1EBF2] rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <div className="flex-1">
                              <h3 className="font-bold text-[15px] text-[#333333]">{quote.title}</h3>
                              <p className="text-[13px] text-[#666666] mt-1">
                                {quote.client_name} • {quote.location}
                              </p>
                              <p className="text-[14px] font-bold text-[#333333] mt-1">
                                KSh {formatCurrency(quote.total_amount).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {profile.tier !== "Free" && (
                                <span className={getStatusColor(quote.status)}>
                                  {quote.status.replace("_", " ").charAt(0).toUpperCase() +
                                    quote.status.replace("_", " ").slice(1)}
                                </span>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#E1EBF2] text-[#015B97] hover:bg-[#015B97] hover:text-white text-[13px] font-medium"
                                onClick={() => navigate("/quotes/all")}
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <FileText className="w-10 h-10 text-[#888888] mx-auto mb-3" />
                        <h3 className="font-bold text-[16px] text-[#333333] mb-1">No quotes yet</h3>
                        <p className="text-[14px] text-[#666666]">Create your first quote to get started!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Upcoming Events */}
                {profile.tier !== "Free" && (
                  <Card className="border border-[#E1EBF2] shadow-sm rounded-xl">
                    <CardHeader className="pb-4 border-b border-[#E1EBF2]">
                      <CardTitle className="text-[18px] font-bold text-[#333333] flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Upcoming Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                      {dashboardData.upcomingEvents.length > 0 ? (
                        <div className="space-y-3">
                          {dashboardData.upcomingEvents.map((event) => (
                            <div key={event.id} className="pb-3 border-b border-[#E1EBF2] last:border-0 last:pb-0">
                              <div className="font-bold text-[14px] text-[#333333]">{event.title}</div>
                              <div className="text-[13px] text-[#666666]">
                                {format(new Date(event.event_date), "MMM d, yyyy")}
                                {event.event_time && ` at ${event.event_time}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[14px] text-[#666666]">No upcoming events</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card className="border border-[#E1EBF2] shadow-sm rounded-xl">
                  <CardHeader className="pb-4 border-b border-[#E1EBF2]">
                    <CardTitle className="text-[18px] font-bold text-[#333333] flex items-center gap-2">
                      <Zap className="w-5 h-5" /> Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-3">
                    <button
                      onClick={() => navigate("/quotes/new")}
                      className="w-full flex items-center justify-between p-4 rounded-lg border border-[#E1EBF2] hover:border-[#015B97] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#f0f7fa]">
                          <FileText className="w-4 h-4 text-[#015B97]" />
                        </div>
                        <span className="font-bold text-[15px] text-[#333333]">New Quote</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#888888]" />
                    </button>
                    <button
                      onClick={() => setShowCalculator(true)}
                      className="w-full flex items-center justify-between p-4 rounded-lg border border-[#E1EBF2] hover:border-[#015B97] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#f0f7fa]">
                          <DollarSign className="w-4 h-4 text-[#015B97]" />
                        </div>
                        <span className="font-bold text-[15px] text-[#333333]">Cost Calculator</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#888888]" />
                    </button>
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
  );
};

export default Dashboard;