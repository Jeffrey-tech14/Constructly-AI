import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, TrendingUp, DollarSign, FileText, CheckCircle, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useQuotes } from '@/hooks/useQuotes';
import { useClientReviews } from '@/hooks/useClientReviews';
import { useAuth } from '@/contexts/AuthContext'; // 👈 Import useAuth to get current user

const Reports = () => {
  const { user } = useAuth(); // 👈 Get the current logged-in user
  const { quotes, fetchQuotes, loading: quotesLoading } = useQuotes();
  const { reviews, averageRating, loading: reviewsLoading } = useClientReviews();
  const [refreshing, setRefreshing] = useState(false);

  // 📝 Filter quotes for current user only
  const userQuotes = useMemo(() => {
    if (!user) return []; // If user not loaded yet
    return quotes.filter((quote) => quote.user_id === user.id);
  }, [quotes, user]);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return value.toString();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchQuotes()]);
    setRefreshing(false);
  };

  const monthlyData = useMemo(() => {
    const monthlyStats: { [key: string]: { quotes: number; revenue: number } } = {};
    userQuotes.forEach((quote) => {
      const date = new Date(quote.created_at);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { quotes: 0, revenue: 0 };
      monthlyStats[monthKey].quotes += 1;
      if (quote.status !== 'draft') monthlyStats[monthKey].revenue += quote.total_amount;
    });
    return Object.entries(monthlyStats)
      .map(([name, stats]) => ({ name, quotes: stats.quotes, revenue: stats.revenue }))
      .slice(-6);
  }, [userQuotes]);

  const statusData = useMemo(() => {
    const statusCounts = userQuotes.reduce((acc, quote) => {
      acc[quote.status] = (acc[quote.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const colors = {
      planning: '#10b981',
      completed: '#059669',
      in_progress: '#3b82f6',
      started: '#6366f1',
      pending: '#f59e0b',
      draft: '#6b7280'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
      value: count,
      color: colors[status as keyof typeof colors] || '#6b7280'
    }));
  }, [userQuotes]);

  const activeProjects = userQuotes.filter((q) => ['started', 'in_progress'].includes(q.status));
  const completedProjects = userQuotes.filter((q) => q.status === 'completed');
  const totalRevenue = userQuotes
    .filter((q) => q.status !== 'draft')
    .reduce((sum, q) => sum + q.total_amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 🌟 Top Bar with Refresh Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports Dashboard</h1>
        <Button
          className="text-white"
          onClick={handleRefresh}
          disabled={refreshing || quotesLoading || reviewsLoading}
        >
          {refreshing || quotesLoading || reviewsLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" /> Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2 text-white" /> Refresh
            </>
          )}
        </Button>
      </div>

      {/* 📊 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="gradient-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{userQuotes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{activeProjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  KSh {(formatCurrency(totalRevenue)).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedProjects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card card-hover">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 📊 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`KSh ${formatCurrency(Number(value)).toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        {monthlyData.length > 0 && (
          <Card className="gradient-card lg:col-span-2">
            <CardHeader>
              <CardTitle>Quote Generation Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="quotes" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;
