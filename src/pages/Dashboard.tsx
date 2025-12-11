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
  Cpu,
  Activity,
  Layers,
  Archive,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Calculator from "@/components/Calculator";
import Reports from "@/components/Reports";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "@/components/Calendar";

// --- THEME CONSTANTS ---
const THEME = {
  NAVY_BG: "#000B29",
  HERO_BTN_GREEN: "#86bc25", // Action Green
  HERO_ACCENT_BLUE: "#00356B", // Deep Blue
  TEXT_LIGHT: "#F0F0F0",
  BORDER_COLOR: "rgba(255,255,255,0.15)",
  FONT_FAMILY: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

// --- GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    .font-engineering { font-family: ${THEME.FONT_FAMILY}; }
    .data-card { 
        background: rgba(255,255,255,0.03); 
        border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(5px);
    }
    .data-card:hover {
        border-color: rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.05);
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
      draft: "bg-slate-700 text-slate-300 border-slate-600",
      planning: "bg-purple-900/40 text-purple-300 border-purple-700",
      started: "bg-blue-900/40 text-blue-300 border-blue-700",
      in_progress: "bg-amber-900/40 text-amber-300 border-amber-700",
      completed: "bg-green-900/40 text-green-300 border-green-700",
      on_hold: "bg-red-900/40 text-red-300 border-red-700",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-slate-700 text-slate-300 border-slate-600"
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
      <div className="min-h-screen flex items-center justify-center bg-[#000B29]">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-[#86bc25]" />
      </div>
    );
  }

  // Now safe to use profile — it's guaranteed non-null
  if (localDashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000B29]">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-[#86bc25]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-engineering text-slate-300 relative" style={{ backgroundColor: THEME.NAVY_BG }}>
      <GlobalStyles />
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Header Area */}
        <div className="mb-8 animate-fade-in">
          <div className="sm:flex flex-1 justify-between items-end border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-[#86bc25]/10 rounded-sm border border-[#86bc25]/20">
                    <LayoutDashboard className="w-5 h-5 text-[#86bc25]" />
                 </div>
                 <h1 className="text-2xl font-light text-white uppercase tracking-tight">
                    Welcome back, <span className="font-bold">{profile.name}</span>
                 </h1>
              </div>
              <p className="text-sm text-slate-400 font-mono flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 SYSTEM STATUS: ONLINE
              </p>
            </div>
            
            <Button
              onClick={() => setShowCalculator(true)}
              className="mt-4 sm:mt-0 bg-[#86bc25] hover:bg-[#75a620] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-sm shadow-lg hover:shadow-[#86bc25]/20 border border-[#86bc25] transition-all"
            >
              <Zap className="w-4 h-4 mr-2" />
              Launch Calculator
            </Button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8`}>
          <Card className="data-card rounded-sm shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-white/5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total Estimation Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-[#86bc25]" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-mono font-bold text-white mb-1">
                KSh {formatCurrency(dashboardData.totalQuotesValue)}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                {dashboardData.allQuotes.length} Total Projects Generated
              </p>
            </CardContent>
          </Card>

          <Card className="data-card rounded-sm shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-white/5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Active Projects
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-mono font-bold text-white mb-1">
                {dashboardData.activeProjects}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                {dashboardData.pendingQuotes} Pending Approval
              </p>
            </CardContent>
          </Card>

          <Card className="data-card rounded-sm shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-white/5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Completed
              </CardTitle>
              <Archive className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-mono font-bold text-white mb-1">
                {dashboardData.completedProjects}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Projects Archived</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="animate-fade-in"
        >
          <TabsList
            className={`grid w-full rounded-sm bg-[#000B29] border border-white/10 p-1 mb-6 ${
              profile.tier === "Professional"
                ? "grid-cols-3"
                : profile.tier === "Free"
                ? "grid-cols-1"
                : "grid-cols-2"
            }`}
          >
            <TabsTrigger 
                value="overview" 
                className="rounded-sm text-xs font-bold uppercase tracking-wider data-[state=active]:bg-[#86bc25] data-[state=active]:text-white"
            >
              <BarChart className="w-3 h-3 mr-2" />
              Overview
            </TabsTrigger>
            {profile.tier === "Professional" && (
              <TabsTrigger 
                value="reports" 
                className="rounded-sm text-xs font-bold uppercase tracking-wider data-[state=active]:bg-[#86bc25] data-[state=active]:text-white"
              >
                <TrendingUp className="w-3 h-3 mr-2" />
                Reports
              </TabsTrigger>
            )}
            {profile.tier !== "Free" && (
              <TabsTrigger 
                value="calendar" 
                className="rounded-sm text-xs font-bold uppercase tracking-wider data-[state=active]:bg-[#86bc25] data-[state=active]:text-white"
              >
                <CalendarIcon className="w-3 h-3 mr-2" />
                Calendar
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Quotes Panel */}
              <Card className="lg:col-span-2 bg-[#000B29] border border-white/10 rounded-sm">
                <CardHeader className="border-b border-white/10 pb-4">
                  <CardTitle className="flex items-center text-sm font-bold uppercase tracking-widest text-white">
                    <FileText className="w-4 h-4 mr-2 text-[#86bc25]" />
                    Recent Quotes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {dashboardData.recentQuotes.length > 0 ? (
                      dashboardData.recentQuotes.map((quote) => (
                        <div
                          key={quote.id}
                          className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-sm hover:border-white/20 transition-all group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-white text-sm">{quote.title}</h3>
                              <span className="text-[10px] text-slate-500 font-mono px-1.5 py-0.5 border border-white/10 rounded-sm">
                                ID: {quote.id.slice(0,4)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mb-1">
                              {quote.client_name} • {quote.location}
                            </p>
                            <p className="text-sm font-bold text-[#86bc25]">
                              KSh {formatCurrency(quote.total_amount)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {profile.tier !== "Free" && (
                              <Badge className={`rounded-sm text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(quote.status)}`}>
                                {quote.status.replace("_", " ")}
                              </Badge>
                            )}
                            <Button
                              className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-[#000B29] h-8 w-8 p-0 rounded-sm"
                              onClick={() => navigate("/quotes/all")}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 border border-dashed border-white/10 rounded-sm">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="font-bold text-white text-sm mb-1">No Data Available</h3>
                        <p className="text-xs text-slate-500">Initialize a new quote to populate this feed.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar: Events & Actions */}
              <div className="space-y-6">
                
                {profile.tier !== "Free" && (
                  <Card className="bg-[#000B29] border border-white/10 rounded-sm">
                    <CardHeader className="border-b border-white/10 pb-4">
                      <CardTitle className="flex items-center text-sm font-bold uppercase tracking-widest text-white">
                        <Clock className="w-4 h-4 mr-2 text-blue-400" />
                        Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {dashboardData.upcomingEvents.length > 0 ? (
                        <div className="space-y-2">
                          {dashboardData.upcomingEvents.map((event) => (
                            <div
                              key={event.id}
                              className="p-3 bg-white/5 border-l-2 border-blue-500 rounded-r-sm"
                            >
                              <div className="font-bold text-xs text-white mb-1">
                                {event.title}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {format(new Date(event.event_date), "MMM d, yyyy")}
                                {event.event_time && ` @ ${event.event_time}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 text-center py-4">No scheduled events found.</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions Panel */}
                <Card className="bg-[#000B29] border border-white/10 rounded-sm">
                  <CardHeader className="border-b border-white/10 pb-4">
                    <CardTitle className="flex items-center text-sm font-bold uppercase tracking-widest text-white">
                      <Cpu className="w-4 h-4 mr-2 text-purple-400" />
                      Operations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/quotes/new")}
                      className="w-full text-left p-3 rounded-sm border border-white/10 hover:border-[#86bc25] hover:bg-[#86bc25]/10 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-sm bg-white/10 group-hover:bg-[#86bc25] group-hover:text-white transition-colors">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-300 group-hover:text-white">
                          Create New Quote
                        </span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-[#86bc25]" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCalculator(true)}
                      className="w-full text-left p-3 rounded-sm border border-white/10 hover:border-[#86bc25] hover:bg-[#86bc25]/10 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-sm bg-white/10 group-hover:bg-[#86bc25] group-hover:text-white transition-colors">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-300 group-hover:text-white">
                          Quick Cost Calc
                        </span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-[#86bc25]" />
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
  );
};

export default Dashboard;