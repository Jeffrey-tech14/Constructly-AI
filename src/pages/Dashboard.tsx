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

// --- THEME CONSTANTS (Aligned with your system) ---
const THEME = {
  NAVY: "#002d5c",
  ACCENT: "#5BB539",
  TEXT_MAIN: "#1a1a1a",
  TEXT_LIGHT: "#f0f0f0",
  BG_DARK: "#000B29",
  BG_LIGHT: "#ffffff",
  BORDER: "#d1d5db",
  CARD_BG_LIGHT: "#ffffff",
  CARD_BG_DARK: "rgba(255, 255, 255, 0.03)",
};

// --- GLOBAL STYLES (Use Outfit + engineering clarity) ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; letter-spacing: -0.01em; }
    .dashboard-card-light {
      background: ${THEME.CARD_BG_LIGHT};
      border: 1px solid ${THEME.BORDER};
      box-shadow: 0 2px 4px rgba(0,0,0,0.03);
    }
    .dashboard-card-dark {
      background: ${THEME.CARD_BG_DARK};
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(6px);
    }
    .dashboard-card-dark:hover {
      border-color: rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.05);
    }
    .tab-trigger-active {
      background: ${THEME.ACCENT} !important;
      color: white !important;
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

  // Early return if no user — prevent execution
  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  if (!profile || localDashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000B29]">
        <Loader2 className="animate-spin rounded-full h-8 w-8 text-[#5BB539]" />
      </div>
    );
  }

  // Determine card style based on light/dark preference (you can later tie to system)
  const isDark = true; // For now, assume dark — adjust if you add theme toggle
  const cardClass = isDark ? "dashboard-card-dark" : "dashboard-card-light";
  const textColor = isDark ? "text-slate-300" : "text-slate-700";
  const headerTextColor = isDark ? "text-white" : "text-[#002d5c]";
  const subTextColor = isDark ? "text-slate-400" : "text-slate-500";
  const bgClass = isDark ? "bg-[#000B29]" : "bg-white";

  return (
    <div className={`min-h-screen font-technical ${textColor} relative`} style={{ backgroundColor: isDark ? THEME.BG_DARK : THEME.BG_LIGHT }}>
      <GlobalStyles />
      
      {/* Subtle Background Grid (Dark Mode Only) */}
      {isDark && (
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
               backgroundSize: '30px 30px'
             }}>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-6 py-8 relative z-10">
        
        {/* Header Area */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200/20 pb-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2.5 bg-[#5BB539]/10 rounded-md border border-[#5BB539]/20">
                  <LayoutDashboard className="w-5 h-5 text-[#5BB539]" />
                </div>
                <h1 className="text-2xl font-light tracking-tight">
                  Welcome back, <span className="font-bold text-[#002d5c] dark:text-white">{profile.name}</span>
                </h1>
              </div>
              <p className={`text-sm font-mono flex items-center gap-2 ${subTextColor}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                SYSTEM STATUS: ONLINE
              </p>
            </div>
            
            <Button
              onClick={() => setShowCalculator(true)}
              className="mt-4 sm:mt-0 bg-[#5BB539] hover:bg-[#4a9a2f] text-white text-[11px] font-black uppercase tracking-[1.5px] px-6 py-3 rounded-sm shadow-md hover:shadow-lg border border-[#5BB539] transition-all"
            >
              <Zap className="w-4 h-4 mr-2" />
              Launch Calculator
            </Button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className={`${cardClass} rounded-md shadow-none`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-200/10">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Total Estimation Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-[#5BB539]" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-mono font-bold text-[#002d5c] dark:text-white mb-1">
                KSh {formatCurrency(dashboardData.totalQuotesValue)}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                {dashboardData.allQuotes.length} Total Projects
              </p>
            </CardContent>
          </Card>

          <Card className={`${cardClass} rounded-md shadow-none`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-200/10">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Active Projects
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-mono font-bold text-[#002d5c] dark:text-white mb-1">
                {dashboardData.activeProjects}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                {dashboardData.pendingQuotes} Pending
              </p>
            </CardContent>
          </Card>

          <Card className={`${cardClass} rounded-md shadow-none`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-slate-200/10">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Completed
              </CardTitle>
              <Archive className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-mono font-bold text-[#002d5c] dark:text-white mb-1">
                {dashboardData.completedProjects}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Projects Archived</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className={`grid w-full rounded-md ${bgClass} border border-slate-200/20 p-1 mb-8 ${
              profile.tier === "Professional"
                ? "grid-cols-3"
                : profile.tier === "Free"
                ? "grid-cols-1"
                : "grid-cols-2"
            }`}
          >
            <TabsTrigger 
              value="overview" 
              className="rounded-sm text-[11px] font-black uppercase tracking-wide data-[state=active]:tab-trigger-active"
            >
              <BarChart className="w-3 h-3 mr-2" />
              Overview
            </TabsTrigger>
            {profile.tier === "Professional" && (
              <TabsTrigger 
                value="reports" 
                className="rounded-sm text-[11px] font-black uppercase tracking-wide data-[state=active]:tab-trigger-active"
              >
                <TrendingUp className="w-3 h-3 mr-2" />
                Reports
              </TabsTrigger>
            )}
            {profile.tier !== "Free" && (
              <TabsTrigger 
                value="calendar" 
                className="rounded-sm text-[11px] font-black uppercase tracking-wide data-[state=active]:tab-trigger-active"
              >
                <CalendarIcon className="w-3 h-3 mr-2" />
                Calendar
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Quotes Panel */}
              <Card className={`${cardClass} lg:col-span-2 rounded-md`}>
                <CardHeader className="border-b border-slate-200/10 pb-4">
                  <CardTitle className="flex items-center text-[13px] font-bold uppercase tracking-wide text-[#002d5c] dark:text-white">
                    <FileText className="w-4 h-4 mr-2 text-[#5BB539]" />
                    Recent Quotes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-4">
                    {dashboardData.recentQuotes.length > 0 ? (
                      dashboardData.recentQuotes.map((quote) => (
                        <div
                          key={quote.id}
                          className={`flex items-center justify-between p-4 rounded-md border ${isDark ? 'border-white/10 bg-white/5 hover:border-white/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'} transition-all group`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h3 className="font-bold text-[#002d5c] dark:text-white text-[14px]">{quote.title}</h3>
                              <span className="text-[9px] font-mono text-slate-500 px-1.5 py-0.5 border rounded-sm border-slate-300/20 dark:border-slate-600">
                                ID: {quote.id.slice(0,4)}
                              </span>
                            </div>
                            <p className="text-[12px] text-slate-500 font-mono mb-1.5">
                              {quote.client_name} • {quote.location}
                            </p>
                            <p className="text-[14px] font-bold text-[#5BB539]">
                              KSh {formatCurrency(quote.total_amount)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {profile.tier !== "Free" && (
                              <Badge className={`rounded-sm text-[9px] font-black uppercase tracking-wide border ${getStatusColor(quote.status)}`}>
                                {quote.status.replace("_", " ")}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-sm hover:bg-[#5BB539]/10 text-slate-500 hover:text-[#5BB539]"
                              onClick={() => navigate("/quotes/all")}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={`text-center py-10 rounded-md border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                        <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <h3 className="font-bold text-[#002d5c] dark:text-white text-[14px] mb-1">No Data Available</h3>
                        <p className="text-[12px] text-slate-500">Initialize a new quote to populate this feed.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar: Events & Actions */}
              <div className="space-y-6">
                
                {profile.tier !== "Free" && (
                  <Card className={`${cardClass} rounded-md`}>
                    <CardHeader className="border-b border-slate-200/10 pb-4">
                      <CardTitle className="flex items-center text-[13px] font-bold uppercase tracking-wide text-[#002d5c] dark:text-white">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {dashboardData.upcomingEvents.length > 0 ? (
                        <div className="space-y-3">
                          {dashboardData.upcomingEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`p-3 rounded-r-md ${isDark ? 'bg-white/5 border-l-2 border-blue-500' : 'bg-blue-50 border-l-2 border-blue-500'}`}
                            >
                              <div className="font-bold text-[12px] text-[#002d5c] dark:text-white mb-1">
                                {event.title}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {format(new Date(event.event_date), "MMM d, yyyy")}
                                {event.event_time && ` @ ${event.event_time}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[12px] text-slate-500 text-center py-4">No scheduled events found.</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions Panel */}
                <Card className={`${cardClass} rounded-md`}>
                  <CardHeader className="border-b border-slate-200/10 pb-4">
                    <CardTitle className="flex items-center text-[13px] font-bold uppercase tracking-wide text-[#002d5c] dark:text-white">
                      <Cpu className="w-4 h-4 mr-2 text-purple-500" />
                      Operations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/quotes/new")}
                      className={`w-full text-left p-3 rounded-md flex items-center justify-between group ${isDark ? 'border border-white/10 hover:border-[#5BB539] hover:bg-[#5BB539]/10' : 'border border-slate-200 hover:border-[#5BB539] hover:bg-[#5BB539]/10'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-sm ${isDark ? 'bg-white/10 group-hover:bg-[#5BB539] group-hover:text-white' : 'bg-slate-100 group-hover:bg-[#5BB539] group-hover:text-white'} transition-colors`}>
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className={`font-black text-[11px] uppercase tracking-wide ${isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-white'}`}>
                          Create New Quote
                        </span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-[#5BB539]" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCalculator(true)}
                      className={`w-full text-left p-3 rounded-md flex items-center justify-between group ${isDark ? 'border border-white/10 hover:border-[#5BB539] hover:bg-[#5BB539]/10' : 'border border-slate-200 hover:border-[#5BB539] hover:bg-[#5BB539]/10'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-sm ${isDark ? 'bg-white/10 group-hover:bg-[#5BB539] group-hover:text-white' : 'bg-slate-100 group-hover:bg-[#5BB539] group-hover:text-white'} transition-colors`}>
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <span className={`font-black text-[11px] uppercase tracking-wide ${isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-white'}`}>
                          Quick Cost Calc
                        </span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-[#5BB539]" />
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