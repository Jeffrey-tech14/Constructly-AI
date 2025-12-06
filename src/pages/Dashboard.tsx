// src/pages/Dashboard.tsx

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
  Clock,
  CheckCircle,
  LayoutDashboard,
  Zap,
  ChevronRight,
  Loader2,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuotes } from "@/hooks/useQuotes";
import { useClientReviews } from "@/hooks/useClientReviews";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import Calculator from "@/components/Calculator";
import Reports from "@/components/Reports";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Calendar from "@/components/Calendar";

// 🔵 RISA Design Tokens
const RISA_BLUE = "#015B97";
const RISA_BG = "#F0F7FA";
const RISA_TEXT_MAIN = "#333333";
const RISA_TEXT_MUTED = "#666666";
const RISA_BORDER = "#E1EBF2";

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const { quotes, loading: quotesLoading } = useQuotes();
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
    // Sleeker badges matching the JTech aesthetic
    const base = "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[3px]";
    switch (status) {
      case "draft": return `${base} bg-gray-100 text-gray-600 border border-gray-200`;
      case "planning": return `${base} bg-purple-50 text-purple-700 border border-purple-100`;
      case "started": return `${base} bg-blue-50 text-blue-700 border border-blue-100`;
      case "in_progress": return `${base} bg-amber-50 text-amber-700 border border-amber-100`;
      case "completed": return `${base} bg-emerald-50 text-emerald-700 border border-emerald-100`;
      case "on_hold": return `${base} bg-red-50 text-red-700 border border-red-100`;
      default: return `${base} bg-gray-50 text-gray-600`;
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
    <div className="min-h-screen bg-[#F0F7FA] font-sans text-[#333]">
      <div className="max-w-[1240px] mx-auto px-6 py-12">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-[#015B97] text-[10px] font-extrabold uppercase tracking-[1.2px] px-2 py-1 rounded">
                   Dashboard
                </span>
              </div>
              <h1 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight">
                Welcome back, {profile?.name}
              </h1>
              <p className="text-[15px] text-[#666] mt-1 max-w-xl">
                Track your projects, manage quotes, and schedule events from your command center.
              </p>
            </div>
            
            <Button
              onClick={() => setShowCalculator(true)}
              className="bg-[#015B97] hover:bg-[#004a80] text-white text-[12px] font-extrabold uppercase tracking-[1.2px] px-6 py-5 rounded-[3px] shadow-lg shadow-blue-900/10 transition-all hover:translate-y-[-1px]"
            >
              <Zap className="w-4 h-4 mr-2" /> Quick Estimate
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid - Aligned with JTech Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Total Quote Value",
              value: `KSh ${formatCurrency(dashboardData.totalQuotesValue).toLocaleString()}`,
              subtitle: "Across all active bids",
              icon: <DollarSign className="w-5 h-5 text-white" />,
              bg: "bg-[#015B97]", // Brand Blue
              border: "border-[#015B97]"
            },
            {
              title: "Active Projects",
              value: dashboardData.activeProjects.toString(),
              subtitle: `${dashboardData.pendingQuotes} pending approval`,
              icon: <Briefcase className="w-5 h-5 text-white" />,
              bg: "bg-[#0d9488]", // Teal (Construction Manager color)
              border: "border-[#0d9488]"
            },
            {
              title: "Completed Jobs",
              value: dashboardData.completedProjects.toString(),
              subtitle: "Successfully delivered",
              icon: <CheckCircle className="w-5 h-5 text-white" />,
              bg: "bg-[#7e22ce]", // Purple (QS color)
              border: "border-[#7e22ce]"
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[4px] border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-[4px] shadow-md ${stat.bg}`}>
                        {stat.icon}
                    </div>
                </div>
                <div>
                    <h3 className="text-[12px] font-bold text-[#888] uppercase tracking-[1px] mb-1">{stat.title}</h3>
                    <p className="text-[28px] font-bold text-[#1a1a1a] mb-1">{stat.value}</p>
                    <p className="text-[13px] text-[#666]">{stat.subtitle}</p>
                </div>
                {/* Decorative border bottom */}
                <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-transparent p-0 border-b border-[#E1EBF2] rounded-none mb-8 h-auto space-x-6">
            {[
                { id: "overview", label: "Overview", icon: BarChart },
                ...(profile.tier === "Professional" ? [{ id: "reports", label: "Reports", icon: TrendingUp }] : []),
                ...(profile.tier !== "Free" ? [{ id: "calendar", label: "Calendar", icon: CalendarIcon }] : [])
            ].map((tab) => (
                <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="rounded-none border-b-2 border-transparent px-2 py-3 text-[14px] font-bold text-[#666] data-[state=active]:border-[#015B97] data-[state=active]:text-[#015B97] data-[state=active]:bg-transparent hover:text-[#015B97] transition-colors"
                >
                    <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Recent Quotes Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-[20px] font-bold text-[#1a1a1a]">Recent Activity</h2>
                    <Button variant="ghost" onClick={() => navigate("/quotes/all")} className="text-[#015B97] text-xs font-bold uppercase tracking-wider hover:bg-blue-50">
                        View All
                    </Button>
                </div>
                
                <Card className="border border-gray-200 shadow-sm rounded-[4px] overflow-hidden bg-white">
                  <CardContent className="p-0">
                    {dashboardData.recentQuotes.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {dashboardData.recentQuotes.map((quote) => (
                          <div
                            key={quote.id}
                            className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors group cursor-pointer"
                            onClick={() => navigate(`/quotes/${quote.id}`)} // Assuming detail view
                          >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-[#015B97] group-hover:bg-[#015B97] group-hover:text-white transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[15px] text-[#333] group-hover:text-[#015B97] transition-colors">{quote.title}</h3>
                                    <p className="text-[13px] text-[#666]">
                                        {quote.client_name} • <span className="text-gray-400">{format(new Date(quote.updated_at), "MMM d")}</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <span className="hidden md:block text-[14px] font-bold text-[#333]">
                                    KSh {formatCurrency(quote.total_amount).toLocaleString()}
                                </span>
                                {profile.tier !== "Free" && (
                                    <span className={getStatusColor(quote.status)}>
                                    {quote.status.replace("_", " ")}
                                    </span>
                                )}
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#015B97]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="font-bold text-[16px] text-[#333] mb-1">No quotes yet</h3>
                        <p className="text-[14px] text-[#666] mb-4">Start your first estimate today.</p>
                        <Button onClick={() => navigate("/quotes/new")} variant="outline" className="border-[#015B97] text-[#015B97] hover:bg-[#015B97] hover:text-white">
                            Create Quote
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-8">
                
                {/* Quick Actions */}
                <div className="bg-[#001226] text-white p-6 rounded-[4px] shadow-lg">
                    <h3 className="text-[18px] font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" /> Quick Actions
                    </h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate("/quotes/new")}
                            className="w-full flex items-center justify-between p-3 rounded bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
                        >
                            <span className="text-[14px] font-medium">New Quote</span>
                            <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </button>
                        <button
                            onClick={() => setShowCalculator(true)}
                            className="w-full flex items-center justify-between p-3 rounded bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
                        >
                            <span className="text-[14px] font-medium">Material Calculator</span>
                            <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </button>
                    </div>
                </div>

                {/* Upcoming Events */}
                {profile.tier !== "Free" && (
                  <div>
                    <h3 className="text-[14px] font-bold uppercase tracking-wider text-[#666] mb-4">Upcoming Schedule</h3>
                    <Card className="border border-gray-200 shadow-sm rounded-[4px]">
                      <CardContent className="p-0">
                        {dashboardData.upcomingEvents.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {dashboardData.upcomingEvents.map((event) => (
                              <div key={event.id} className="p-4 flex gap-3 hover:bg-gray-50 transition-colors">
                                <div className="flex-shrink-0 w-12 text-center bg-blue-50 rounded p-1">
                                    <div className="text-[10px] font-bold text-[#015B97] uppercase">
                                        {format(new Date(event.event_date), "MMM")}
                                    </div>
                                    <div className="text-[16px] font-bold text-[#333]">
                                        {format(new Date(event.event_date), "d")}
                                    </div>
                                </div>
                                <div>
                                  <div className="font-bold text-[14px] text-[#333]">{event.title}</div>
                                  <div className="text-[12px] text-[#666] flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {event.event_time ? event.event_time : "All Day"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center text-[#666] text-sm">
                            No upcoming events scheduled.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {profile.tier !== "Free" && (
            <TabsContent value="reports" className="animate-in fade-in zoom-in-95 duration-300">
              <Reports />
            </TabsContent>
          )}
          {profile.tier !== "Free" && (
            <TabsContent value="calendar" className="animate-in fade-in zoom-in-95 duration-300">
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