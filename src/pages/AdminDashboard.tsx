import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  MaterialPricesDialog,
  RegionalPricingDialog,
  EquipmentTypesDialog,
} from "@/components/AdminConfigDialogs";
import QuotesTab from "../components/QuotesTab";
import TiersTab from "../components/TiersTab";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  UserX,
  UserCheck,
  Crown,
  Ban,
  Shield,
  Search,
  MoreHorizontal,
  Settings,
  Star,
  ThumbsUp,
  Shell,
  Coins,
  BarChart3,
  Target,
  Zap,
  FileText,
  Calendar,
  Building,
  CheckCircle,
  LayoutDashboard,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// RISA Color Palette (Matching index.tsx)
const RISA_BLUE = "#015B97";
const RISA_LIGHT_BLUE = "#3288e6";
const RISA_WHITE = "#ffffff";
const RISA_DARK_TEXT = "#2D3748";
const RISA_LIGHT_GRAY = "#F5F7FA";
const RISA_MEDIUM_GRAY = "#E2E8F0";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  tier: string;
  quotes_used: number;
  total_projects: number;
  total_revenue: number;
  created_at: string;
  is_admin: boolean;
}

interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  totalQuotes: number;
  activeProjects: number;
  subscriptionRevenue: number;
}

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalQuotes: 0,
    activeProjects: 0,
    subscriptionRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  useEffect(() => {
    if (profile?.is_admin) {
      fetchDashboardData();
    }
  }, [profile, location.key]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, quotesRes, tiersRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("quotes")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("tiers").select("name, price"),
      ]);

      const usersData = usersRes.data || [];
      const quotesData = quotesRes.data || [];
      const tiersData = tiersRes.data || [];

      const tierPrices = tiersData.reduce((acc, tier) => {
        acc[tier.name] = tier.price;
        return acc;
      }, {} as Record<string, number>);

      const totalUsers = usersData.length;
      const activeQuotes = quotesData.filter((q) => q.status !== "draft");
      const totalRevenue = activeQuotes.reduce(
        (sum, quote) => sum + (quote.profit_amount || 0),
        0
      );
      const totalQuotes = quotesData.length;
      const activeProjects = quotesData.filter((q) =>
        ["started", "in_progress"].includes(q.status)
      ).length;

      const subscriptionRevenue = usersData.reduce((sum, user) => {
        const tier = user.tier || "Free";
        return sum + (tierPrices[tier] || 0);
      }, 0);

      setUsers(usersData);
      setQuotes(quotesData);
      setStats({
        totalUsers,
        totalRevenue,
        totalQuotes,
        activeProjects,
        subscriptionRevenue,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // 🔥 Real-time subscriptions for profiles, quotes, and tiers
    const profilesChannel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          console.log("Realtime profiles update:", payload);
          fetchDashboardData();
        }
      )
      .subscribe();

    const quotesChannel = supabase
      .channel("quotes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quotes" },
        (payload) => {
          console.log("Realtime quotes update:", payload);
          fetchDashboardData();
        }
      )
      .subscribe();

    const tiersChannel = supabase
      .channel("tiers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tiers" },
        (payload) => {
          console.log("Realtime tiers update:", payload);
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(quotesChannel);
      supabase.removeChannel(tiersChannel);
    };
  }, []);

  const updateUserTier = async (userId: string, newTier: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ tier: newTier })
        .eq("id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, tier: newTier } : u))
      );
      triggerRefresh();
      window.location.reload();
      toast({
        title: "Success",
        description: "User tier updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user tier",
        variant: "destructive",
      });
    }
  };

  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !isAdmin })
        .eq("id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_admin: !isAdmin } : u))
      );
      triggerRefresh();
      window.location.reload();
      toast({
        title: "Success",
        description: `User ${!isAdmin ? "promoted to" : "removed from"} admin`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update admin status",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedTier === "all" || user.tier.toLowerCase() === selectedTier)
  );

  // Chart data
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyData = months.map((month) => ({
    name: month,
    quotes: 0,
    revenue: 0,
  }));

  // Step 2: Fill in actual data
  quotes.forEach((quote) => {
    const monthIndex = new Date(quote.created_at).getMonth();
    monthlyData[monthIndex].quotes += 1;

    if (quote.status !== "draft") {
      monthlyData[monthIndex].revenue += quote.profit_amount;
    }
  });

  const tierData = users.reduce((acc, user) => {
    const existing = acc.find((item) => item.name === user.tier);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: user.tier, value: 1 });
    }
    return acc;
  }, [] as any[]);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return value.toString();
  };

  if (!user) {
    navigate("/auth");
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "Free":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">
            <Shell className="w-3 h-3 mr-1" />
            Free
          </Badge>
        );
      case "Intermediate":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
            <Crown className="w-3 h-3 mr-1" />
            Intermediate
          </Badge>
        );
      case "Professional":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300">
            <Shield className="w-3 h-3 mr-1" />
            Professional
          </Badge>
        );
      default:
        return <Badge>{tier}</Badge>;
    }
  };

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Card className="p-8 text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: RISA_BLUE }}>
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You don't have permission to access the admin dashboard.
            </p>
          </motion.div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: RISA_BLUE }}></div>
          <p className="text-gray-600 dark:text-gray-300" style={{ color: RISA_BLUE }}>Loading admin dashboard...</p>
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
          <Badge className="mb-3 text-xs bg-blue-600 text-white dark:bg-blue-700">
            <Crown className="w-3 h-3 mr-1" /> Admin Dashboard
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2" style={{ color: RISA_BLUE }}>
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
            Manage users, monitor system performance, and control platform settings
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
        >
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <h3 className="text-2xl font-bold mt-2" style={{ color: RISA_BLUE }}>
                    {stats.totalUsers}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Registered contractors
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <Users className="h-6 w-6" style={{ color: RISA_BLUE }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Project Revenue</p>
                  <h3 className="text-2xl font-bold mt-2" style={{ color: RISA_LIGHT_BLUE }}>
                    KSh {formatCurrency(stats.totalRevenue)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    From active projects
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20">
                  <Coins className="h-6 w-6" style={{ color: RISA_LIGHT_BLUE }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscription Revenue</p>
                  <h3 className="text-2xl font-bold mt-2" style={{ color: RISA_BLUE }}>
                    KSh {formatCurrency(stats.subscriptionRevenue)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Monthly subscriptions
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/20">
                  <DollarSign className="h-6 w-6" style={{ color: RISA_BLUE }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quotes</p>
                  <h3 className="text-2xl font-bold mt-2" style={{ color: RISA_LIGHT_BLUE }}>
                    {stats.totalQuotes}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Generated quotes
                  </p>
                </div>
                <div className="p-3 rounded-full bg-amber-50 dark:bg-amber-900/20">
                  <Activity className="h-6 w-6" style={{ color: RISA_LIGHT_BLUE }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Projects</p>
                  <h3 className="text-2xl font-bold mt-2" style={{ color: RISA_BLUE }}>
                    {stats.activeProjects}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    In progress
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
                  <TrendingUp className="h-6 w-6" style={{ color: RISA_BLUE }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <TabsTrigger 
              value="users"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 rounded-lg transition-all"
              style={{ 
                color: RISA_DARK_TEXT,
                backgroundColor: "transparent"
              }}
            >
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="system"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 rounded-lg transition-all"
              style={{ 
                color: RISA_DARK_TEXT,
                backgroundColor: "transparent"
              }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger 
              value="quotes"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 rounded-lg transition-all"
              style={{ 
                color: RISA_DARK_TEXT,
                backgroundColor: "transparent"
              }}
            >
              <FileText className="w-4 h-4" />
              Quotes
            </TabsTrigger>
            <TabsTrigger 
              value="tiers"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 rounded-lg transition-all"
              style={{ 
                color: RISA_DARK_TEXT,
                backgroundColor: "transparent"
              }}
            >
              <Crown className="w-4 h-4" />
              Tiers
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400 rounded-lg transition-all"
              style={{ 
                color: RISA_DARK_TEXT,
                backgroundColor: "transparent"
              }}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="users" className="space-y-6">
              {/* Search and Filter */}
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Users className="w-5 h-5" style={{ color: RISA_BLUE }} />
                    User Management
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Manage user accounts, tiers, and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <Select value={selectedTier} onValueChange={setSelectedTier}>
                      <SelectTrigger className="w-full sm:w-48 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Filter by tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Users Grid */}
                  <div className="space-y-4">
                    {filteredUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className={`p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg relative ${
                          user.id === profile.id ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
                        }`}>
                          {user.id === profile.id && (
                            <Badge className="absolute -top-2 left-4 bg-blue-600 text-white dark:bg-blue-500 rounded-full px-3 py-1 text-xs">
                              Current User
                            </Badge>
                          )}

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* User Info Section */}
                            <div className="flex items-start md:items-center space-x-4 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5" style={{ color: RISA_BLUE }} />
                              </div>

                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                    {user.name}
                                  </h3>
                                  {user.is_admin && (
                                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">
                                      <Crown className="w-3 h-3 mr-1" />
                                      Admin
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                  {user.email}
                                </p>

                                <div className="flex flex-wrap items-center gap-2">
                                  {getTierBadge(user.tier)}
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.quotes_used} quotes • {user.total_projects} projects
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions Section */}
                            <div className="flex items-center gap-3">
                              <Select
                                value={user.tier}
                                onValueChange={(value) => updateUserTier(user.id, value)}
                              >
                                <SelectTrigger className="w-32 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Free">Free</SelectItem>
                                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                                  <SelectItem value="Professional">Professional</SelectItem>
                                </SelectContent>
                              </Select>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-9 w-9 p-0 border-gray-300 dark:border-gray-600"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </motion.div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                  <DropdownMenuItem
                                    onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                                    className="text-sm"
                                  >
                                    {user.is_admin ? (
                                      <>
                                        <UserX className="w-4 h-4 mr-2" />
                                        Remove Admin
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Make Admin
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Settings className="w-5 h-5" style={{ color: RISA_BLUE }} />
                    System Settings
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Configure platform-wide settings and pricing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Platform Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
                          <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Material Base Prices</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Manage base material prices for all contractors
                          </p>
                          <MaterialPricesDialog />
                        </Card>

                        <Card className="p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
                          <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Regional Pricing</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Manage regional price multipliers
                          </p>
                          <RegionalPricingDialog />
                        </Card>

                        <Card className="p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl">
                          <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Equipment Types</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Manage available equipment types
                          </p>
                          <EquipmentTypesDialog />
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quotes" className="space-y-6">
              <QuotesTab refreshKey={refreshKey} />
            </TabsContent>

            <TabsContent value="tiers" className="space-y-6">
              <TiersTab refreshKey={refreshKey} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {quotes.length > 0 && (
                  <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <TrendingUp className="w-5 h-5" style={{ color: RISA_BLUE }} />
                        Monthly Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={monthlyData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="name" stroke="#64748B" />
                          <YAxis
                            tickFormatter={(value) => formatCurrency(value)}
                            stroke="#64748B"
                          />
                          <Tooltip
                            labelClassName="text-gray-900"
                            formatter={(value: number) => [`KSh ${formatCurrency(Number(value))}`, "Revenue"]}
                            contentStyle={{ 
                              backgroundColor: RISA_WHITE,
                              borderColor: RISA_BLUE,
                              borderRadius: '8px'
                            }}
                          />
                          <Bar
                            dataKey="revenue"
                            fill={RISA_BLUE}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 rounded-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Users className="w-5 h-5" style={{ color: RISA_BLUE }} />
                      User Tier Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={tierData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {tierData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={[RISA_BLUE, RISA_LIGHT_BLUE, "#10b981", "#f59e0b"][index % 4]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
