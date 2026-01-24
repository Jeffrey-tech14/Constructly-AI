// © 2025 Jeff. All rights reserved.
// Unauthorized copying, distribution, or modification of this file is strictly prohibited.

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  Bitcoin,
  BitcoinIcon,
  Coins,
  Loader2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  is_admin: boolean;
  avatar_url: string;
  quotes_used?: number;
  total_projects?: number;
}

interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  totalQuotes: number;
  activeProjects: number;
  paidQuotesRevenue: number;
  totalPaidQuotes: number;
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
    paidQuotesRevenue: 0,
    totalPaidQuotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  useEffect(() => {
    if (profile?.is_admin) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, quotesRes, paymentsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("quotes")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("quote_payments")
          .select("*")
          .eq("payment_status", "completed"),
      ]);

      const usersData = usersRes.data || [];
      const quotesData = quotesRes.data || [];
      const paymentsData = paymentsRes.data || [];

      // Calculate per-user quote and project stats
      const usersWithStats = usersData.map((user) => {
        const userQuotes = quotesData.filter((q) => q.user_id === user.id);
        const userProjects = userQuotes.filter((q) =>
          ["started", "in_progress"].includes(q.status),
        );

        return {
          ...user,
          quotes_used: userQuotes.length,
          total_projects: userProjects.length,
        };
      });

      const totalUsers = usersWithStats.length;
      const activeQuotes = quotesData.filter((q) => q.status !== "draft");
      const totalRevenue = activeQuotes.reduce(
        (sum, quote) => sum + (quote.profit_amount || 0),
        0,
      );
      const totalQuotes = quotesData.length;
      const activeProjects = quotesData.filter((q) =>
        ["started", "in_progress"].includes(q.status),
      ).length;

      // Paid quotes revenue: 1000 KSH per paid quote
      const totalPaidQuotes = paymentsData.length;
      const paidQuotesRevenue = totalPaidQuotes * 1000;

      setUsers(usersWithStats);
      setQuotes(quotesData);
      setStats({
        totalUsers,
        totalRevenue,
        totalQuotes,
        activeProjects,
        paidQuotesRevenue,
        totalPaidQuotes,
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

    // 🔥 Real-time subscriptions for profiles, quotes, and payments
    const profilesChannel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          fetchDashboardData();
        },
      )
      .subscribe();

    const quotesChannel = supabase
      .channel("quotes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quotes" },
        (payload) => {
          fetchDashboardData();
        },
      )
      .subscribe();

    const paymentsChannel = supabase
      .channel("payments-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quote_payments" },
        (payload) => {
          fetchDashboardData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(quotesChannel);
      supabase.removeChannel(paymentsChannel);
    };
  }, []);

  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !isAdmin })
        .eq("id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_admin: !isAdmin } : u)),
      );
      triggerRefresh();
      fetchDashboardData();
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
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
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

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="sm:text-2xl text-lg font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-muted-foreground">
            You don't have permission to access the admin dashboard.
          </p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin rounded-full h-8 w-8"></Loader2>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <div className="flex items-center sm:text-2xl text-xl font-bold bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent">
            <Crown className="sm:w-7 sm:h-7 mr-2 text-primary dark:text-white" />
            Admin Dashboard
          </div>
          <p className="text-sm sm:text-lg bg-gradient-to-r from-primary via-indigo-600 to-indigo-900 dark:from-white dark:via-blue-400 dark:to-purple-400  text-transparent bg-clip-text mt-2">
            Manage users, monitor system performance, and control platform
            settings
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl text-lg font-bold">
                {stats.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered contractors
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Project Revenue
              </CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl text-lg font-bold">
                KSh {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                From active projects
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Paid Quotes Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl text-lg font-bold">
                KSh {formatCurrency(stats.paidQuotesRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPaidQuotes} completed payments
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Quotes
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl text-lg font-bold">
                {stats.totalQuotes}
              </div>
              <p className="text-xs text-muted-foreground">Generated quotes</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="sm:text-2xl text-lg font-bold">
                {stats.activeProjects}
              </div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">Settings</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Search and Filter */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Users Table */}
                <div className="space-y-3 md:space-y-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredUsers.map((user) => (
                    <Card
                      key={user.id}
                      className={`p-3 md:p-4 bg-gradient-card relative ${
                        user.id === profile.id
                          ? "ring-2 ring-primary dark:ring-white"
                          : ""
                      }`}
                    >
                      <div>
                        {user.id === profile.id && (
                          <Badge className="absolute -top-2 md:-top-3 transform translate-x-2 bg-primary text-white dark:bg-white dark:text-primary rounded-full px-3 md:px-4 py-0.5 md:py-1 text-xs md:text-sm">
                            Me
                          </Badge>
                        )}

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          {/* User Info Section */}
                          <div className="flex items-start md:items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                            {/* <div className="sm:w-8 sm:h-8 md:w-10 md:h-10 h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-white/10 bg-primary/10">
                              <Users className="w-4 h-4 md:w-5 md:h-5 text-primary dark:text-white" />
                            </div> */}

                            <Avatar className="sm:w-8 sm:h-8 md:w-10 md:h-10 h-9 w-9  items-center">
                              <AvatarImage
                                src={user?.avatar_url || undefined}
                              />
                              <AvatarFallback className="text-2xl">
                                <Users className="w-4 h-4 md:w-5 md:h-5 text-primary dark:text-white"></Users>
                              </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-medium text-sm md:text-base truncate">
                                  {user.name}
                                </h3>
                                {user.is_admin && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs md:text-sm"
                                  >
                                    <Crown className="w-3 h-3 mr-1" />
                                    Admin
                                  </Badge>
                                )}
                              </div>

                              <p className="text-xs md:text-sm text-muted-foreground truncate">
                                {user.email}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                                <span className="text-xs text-muted-foreground">
                                  {user.quotes_used} quotes •{" "}
                                  {user.total_projects} projects
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions Section */}
                          <div className="flex items-center justify-start ml-5 md:justify-normal space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 md:h-9 md:w-auto md:px-2"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="text-xs md:text-sm"
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    toggleAdminStatus(user.id, user.is_admin)
                                  }
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
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Platform Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">
                          Material Base Prices
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Manage base material prices for all contractors
                        </p>
                        <MaterialPricesDialog />
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Regional Pricing</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Manage regional price multipliers
                        </p>
                        <RegionalPricingDialog />
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Equipment Types</h4>
                        <p className="text-sm text-muted-foreground mb-3">
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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {quotes.length > 0 && (
                <Card className="gradient-card">
                  <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                          labelClassName="text-black rounded-lg"
                          formatter={(value: number) => formatCurrency(value)}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#22c55e"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
