<<<<<<< HEAD
// src/pages/Dashboard.tsx

=======
>>>>>>> origin/main
// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
<<<<<<< HEAD
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
=======
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
>>>>>>> origin/main
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  FileText,
  Eye,
  BarChart,
<<<<<<< HEAD
  Calendar as CalendarIcon,
  TrendingUp,
  Clock,
  CheckCircle,
=======
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
>>>>>>> origin/main
  LayoutDashboard,
  Zap,
  ChevronRight,
  Loader2,
<<<<<<< HEAD
  Briefcase
=======
>>>>>>> origin/main
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuotes } from "@/hooks/useQuotes";
import { useClientReviews } from "@/hooks/useClientReviews";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import Calculator from "@/components/Calculator";
import Reports from "@/components/Reports";
<<<<<<< HEAD
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
=======
import CalendarComponent from "@/components/Calendar";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "@/components/Calendar";

// RISA Color Palette (Matching index.tsx)
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748";
const RISA_LIGHT_GRAY = "#F5F7FA";
const RISA_MEDIUM_GRAY = "#E2E8F0";
>>>>>>> origin/main

const Dashboard = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const { quotes, loading: quotesLoading } = useQuotes();
<<<<<<< HEAD
=======
  const { reviews, averageRating, totalReviews } = useClientReviews();
>>>>>>> origin/main
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
<<<<<<< HEAD

  useEffect(() => {
    const fetchAndSet = async () => {
      await fetchDashboardData();
      if (!hasLoadedOnce.current) {
=======
  useEffect(() => {
    const fetchAndSet = async () => {
      if (!hasLoadedOnce.current) {
        quotesLoading == true;
      }
      await fetchDashboardData();
      if (!hasLoadedOnce.current) {
        quotesLoading == false;
>>>>>>> origin/main
        hasLoadedOnce.current = true;
      }
    };
    fetchAndSet();
  }, [user, location.key]);
<<<<<<< HEAD

=======
>>>>>>> origin/main
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return value.toString();
  };
<<<<<<< HEAD

=======
>>>>>>> origin/main
  const fetchDashboardData = async () => {
    try {
      const { data: quotes, error: quotesError } = await supabase
        .from("quotes")
        .select("*")
        .eq("user_id", profile.id);
      if (quotesError) throw quotesError;
<<<<<<< HEAD

=======
>>>>>>> origin/main
      const { data: events, error: eventsError } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", profile.id);
      if (eventsError) throw eventsError;
<<<<<<< HEAD

=======
>>>>>>> origin/main
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
<<<<<<< HEAD

=======
>>>>>>> origin/main
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
<<<<<<< HEAD

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
=======
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
    navigate("/auth");
  }
  if (quotesLoading) {
    return (
      <div className="min-h-screen grid flex grid-rows-2 items-center justify-center">
        <Loader2 className="animate-spin rounded-full h-8 w-8"></Loader2>
      </div>
    );
  }
  return (
    <div className="min-h-screen inset-0 scrollbar-hide">
      <div className="max-w-7xl scrollbar-hide mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4 animate-fade-in">
          <div className="sm:flex flex-1 justify-between items-center">
            <div>
              <div className="sm:text-2xl items-center text-xl flex font-bold bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
                <LayoutDashboard className="sm:w-7 sm:h-7 mr-2 text-primary dark:text-white" />
                Welcome back, {profile?.name}!
              </div>
              <p className="text-sm sm:text-lg bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-400 dark:to-purple-400  text-transparent bg-clip-text mt-2">
                Here's what's happening with your construction business today.
              </p>
            </div>
            <Button
              onClick={() => setShowCalculator(true)}
              className="text-sm px-5 py-4 rounded-xl sm:mt-0 mt-4 shadow-lg bg-primary animate-bounce-gentle hover:shadow-2xl transition-transform duration-300 text-white"
            >
              ⚡Quick Calculator
            </Button>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 ${
            profile.tier === "Free" ? "lg-grid-cols-3" : "lg:grid-cols-3"
          } gap-6`}
        >
          <Card className=" card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Quotes Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl text-lg font-bold">
                KSh{" "}
                {formatCurrency(
                  dashboardData.totalQuotesValue
                ).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.allQuotes.length} quotes generated
              </p>
            </CardContent>
          </Card>

          <Card className=" card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl text-lg font-bold">
                {dashboardData.activeProjects}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.pendingQuotes} pending approval
              </p>
            </CardContent>
          </Card>

          <Card className=" card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completed Projects
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl text-lg font-bold">
                {dashboardData.completedProjects}
              </div>
              <p className="text-xs text-muted-foreground">Projects finished</p>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="animate-fade-in mt-5"
        >
          <TabsList
            className={`grid w-full ${
              profile.tier === "Professional" ? "grid-cols-3" : "grid-cols-2"
            } ${profile.tier === "Free" ? "grid-cols-1" : "grid-cols-3"} mb-6`}
          >
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            {profile.tier === "Professional" && (
              <TabsTrigger value="reports" className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
            )}
            {profile.tier !== "Free" && (
              <TabsTrigger value="calendar" className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className=" lg:col-span-2">
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
                        <div
                          key={quote.id}
                          className="flex items-center justify-between p-4 glass border border-gray-300 dark:border-gray-600/40 rounded-lg hover:shadow-lg transition-shadow"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{quote.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {quote.client_name} • {quote.location}
                            </p>
                            <p className="text-sm font-medium mt-1">
                              KSh{" "}
                              {formatCurrency(
                                quote.total_amount
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex">
                            {profile.tier !== "Free" && (
                              <Badge className={getStatusColor(quote.status)}>
                                {quote.status.charAt(0).toUpperCase() +
                                  quote.status.slice(1).replace("_", " ")}
                              </Badge>
                            )}
                            <Button
                              className="ml-3 bg-primary hover:bg-primary/90 hover:text-white text-white hover:dark:bg-primary/60 dark:bg-primary/20"
                              onClick={() => navigate("/quotes/all")}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium text-lg mb-2">
                          No quotes yet
                        </h3>
                        <p className="text-muted-foreground">
                          Create your first quote to get started!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div>
                {profile.tier !== "Free" && (
                  <div className="space-y-6 mb-5">
                    <Card className="">
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
                              <div
                                key={event.id}
                                className="p-3 border-t dark:border-white/20 rounded"
                              >
                                <div className="font-medium text-sm">
                                  {event.title}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(event.event_date),
                                    "MMM d, yyyy"
                                  )}
                                  {event.event_time &&
                                    ` at ${event.event_time}`}
>>>>>>> origin/main
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
<<<<<<< HEAD
                          <div className="p-6 text-center text-[#666] text-sm">
                            No upcoming events scheduled.
                          </div>
=======
                          <p className="text-sm text-muted-foreground">
                            No upcoming events
                          </p>
>>>>>>> origin/main
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
<<<<<<< HEAD
=======
                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                      <Zap className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/quotes/new")}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 bg-white dark:bg-gray-700/30 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          New Quote
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCalculator(true)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 bg-white dark:bg-gray-700/30 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          Cost Calculator
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </motion.button>
                  </CardContent>
                </Card>
>>>>>>> origin/main
              </div>
            </div>
          </TabsContent>

          {profile.tier !== "Free" && (
<<<<<<< HEAD
            <TabsContent value="reports" className="animate-in fade-in zoom-in-95 duration-300">
=======
            <TabsContent value="reports">
>>>>>>> origin/main
              <Reports />
            </TabsContent>
          )}
          {profile.tier !== "Free" && (
<<<<<<< HEAD
            <TabsContent value="calendar" className="animate-in fade-in zoom-in-95 duration-300">
=======
            <TabsContent value="calendar">
>>>>>>> origin/main
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

<<<<<<< HEAD
export default Dashboard;
=======
export default Dashboard;
>>>>>>> origin/main
