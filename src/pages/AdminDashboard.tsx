import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialPricesDialog, RegionalPricingDialog, EquipmentTypesDialog } from '@/components/AdminConfigDialogs';
import QuotesTab from '../components/QuotesTab';
import TiersTab from '../components/TiersTab';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, DollarSign, Activity, TrendingUp, UserX, UserCheck, Crown, Ban, Shield, Search, MoreHorizontal, Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalQuotes: 0,
    activeProjects: 0,
    subscriptionRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
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
      const [usersRes, quotesRes, tiersRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('tiers').select('name, price')
      ]);

      const usersData = usersRes.data || [];
      const quotesData = quotesRes.data || [];
      const tiersData = tiersRes.data || [];

      const tierPrices = tiersData.reduce((acc, tier) => {
        acc[tier.name] = tier.price;
        return acc;
      }, {} as Record<string, number>);

      const totalUsers = usersData.length;
      const activeQuotes = quotesData.filter(q => q.status !== 'draft');
      const totalRevenue = activeQuotes.reduce((sum, quote) => sum + quote.total_amount, 0);
      const totalQuotes = quotesData.length;
      const activeProjects = quotesData.filter(q => ['started', 'in_progress'].includes(q.status)).length;

      const subscriptionRevenue = usersData.reduce((sum, user) => {
        const tier = user.tier || 'Free';
        return sum + (tierPrices[tier] || 0);
      }, 0);

      setUsers(usersData);
      setQuotes(quotesData);
      setStats({ totalUsers, totalRevenue, totalQuotes, activeProjects, subscriptionRevenue });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserTier = async (userId: string, newTier: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tier: newTier })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier: newTier } : u));
      triggerRefresh();
      toast({ title: 'Success', description: 'User tier updated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user tier', variant: 'destructive' });
    }
  };

  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isAdmin })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !isAdmin } : u));
      triggerRefresh();
      toast({
        title: 'Success',
        description: `User ${!isAdmin ? 'promoted to' : 'removed from'} admin`
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update admin status', variant: 'destructive' });
    }
  };

  const filteredUsers = users.filter(user =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedTier === 'all' || user.tier.toLowerCase() === selectedTier)
  );


  // Chart data
  const monthlyData = quotes.reduce((acc, quote) => {
    const month = new Date(quote.created_at).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(item => item.name === month);
    if (existing) {
      existing.quotes += 1;
      if (quote.status !== 'draft') {
        existing.revenue += quote.total_amount;
      }
    } else {
      acc.push({
        name: month,
        quotes: 1,
        revenue: quote.status !== 'draft' ? quote.total_amount : 0
      });
    }
    return acc;
  }, [] as any[]).slice(-6);

  const tierData = users.reduce((acc, user) => {
    const existing = acc.find(item => item.name === user.tier);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: user.tier, value: 1 });
    }
    return acc;
  }, [] as any[]);
  
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return value.toString();
  };

   const getTierBadge = (tier: string) => {
      switch (tier) {
        case 'Free':
          return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">Free</Badge>;
        case 'Basic':
          return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200"><Crown className="w-3 h-3 mr-1" />Basic</Badge>;
        case 'Intermediate':
          return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200"><Crown className="w-3 h-3 mr-1" />Intermediate</Badge>;
        case 'Professional':
          return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200"><Shield className="w-3 h-3 mr-1" />Professional</Badge>;
        default:
          return <Badge>{tier}</Badge>;
      }
    };
  
  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage users, monitor system performance, and control platform settings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered contractors</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Project Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {formatCurrency((stats.totalRevenue))}</div>
              <p className="text-xs text-muted-foreground">From active projects</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KSh {(formatCurrency((stats.subscriptionRevenue)))}</div>
              <p className="text-xs text-muted-foreground">Monthly subscriptions</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuotes}</div>
              <p className="text-xs text-muted-foreground">Generated quotes</p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
            <TabsTrigger value="quotes">Quotes</TabsTrigger>
            <TabsTrigger value="tiers">Tiers</TabsTrigger>
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
                  <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{user.name}</h3>
                              {user.is_admin && (
                                <Badge variant="destructive">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <Badge variant='secondary' className=' bg-transparent text-inherit border-transparent hover:bg-transparent hover:text-inherit hover:border-transparent focus:bg-transparent focus:text-inherit focus:border-transparent active:bg-transparent active:text-inherit active:border-transparent'>
                                {getTierBadge(user.tier)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {user.quotes_used} quotes • {user.total_projects} projects
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Select 
                            value={user.tier} 
                            onValueChange={(value) => updateUserTier(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Free">Free</SelectItem>
                              <SelectItem value="Basic">Basic</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Professional">Professional</SelectItem>
                            </SelectContent>
                          </Select>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => toggleAdminStatus(user.id, user.is_admin)}
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
                              <DropdownMenuItem className="text-red-600">
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                    <h3 className="text-lg font-medium mb-4">Platform Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Material Base Prices</h4>
                        <p className="text-sm text-muted-foreground mb-3">Manage base material prices for all contractors</p>
                        <MaterialPricesDialog />
                      </Card>
                      
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Regional Pricing</h4>
                        <p className="text-sm text-muted-foreground mb-3">Manage regional price multipliers</p>
                        <RegionalPricingDialog />
                      </Card>
                      
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Equipment Types</h4>
                        <p className="text-sm text-muted-foreground mb-3">Manage available equipment types</p>
                        <EquipmentTypesDialog/>
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
            <TiersTab refreshKey={refreshKey}/>
          </TabsContent>


          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle>User Tier Distribution</CardTitle>
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
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;

